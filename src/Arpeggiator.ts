'use strict';

import { Arpeggio, ArpeggioNote } from './Arpeggio';
import Chord from './Chord';
import Clock, { ClockChildFinishedEvent, ClockChildFinishedEventData, IClockChild } from './Clock';
import { Note } from './index';
import { IMetronome } from './Metronome';
import { IMidiOut } from './MidiOut';
import PropertyTracker from './PropertyTracker';


/**
 * The Arpeggiator is much like to Arpeggios, what the ClipPlayer is to Clips.
 * 
 * The Arpeggiator should be added to a clock to receive regular updates. It should hold a reference to a metronome for beat timings. It should hold a reference to a MIDI out for it to send notes to. It should hold a reference to an arpeggio, which defines the shape that it will play. And it should hold a reference which defines what chord it should play the arpeggio shape around.
 * 
 * @category Chords & Scales
 */
export default class Arpeggiator implements IClockChild {

    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.Arpeggiator'; }

    /** Which arpeggio to play */
    get arpeggio(): Arpeggio { return this._arpeggio; }
    set arpeggio(value: Arpeggio) { this._arpeggio = value; }
    private _arpeggio: Arpeggio;

    /** Which chord to play. Setting this will cause all currently playing notes to stop. */
    get chord(): Chord { return this._chord; }
    set chord(value: Chord) {
        this._chord = value;
        this._endAllNotes();
    }
    private _chord: Chord;

    /** The default channel for arpeggiated notes to be played on. */
    get channel(): number { return this._channel; }
    set channel(value: number) { this._channel = value; }
    private _channel: number = 0;

    /** Provides a way of identifying arpeggiators so they can easily be retrieved later */
    get ref(): string { return this._ref; }
    set ref(value: string) { this._ref = value; }
    private _ref: string;

    /** The metronome which the player uses for tracking beat timings */
    get metronome(): IMetronome { return this._metronome; }
    set metronome(value: IMetronome) { this._metronome = value; }
    private _metronome: IMetronome;

    /** The MidiOut which data from the arpeggio gets played on */
    get midiOut(): IMidiOut { return this._midiOut; }
    set midiOut(value: IMidiOut) { this._midiOut = value; }
    private _midiOut: IMidiOut;

    /** How many beats in the arpeggio to play for every beat that passes in actual time. For example: 1.5 means the arpeggio is played 1.5 times faster than it would normally. */
    get speed(): number { return this._speed; }
    set speed(value: number) { this._speed = value; }
    private _speed: number = 1;

    /** Which beat of the arpeggio playback is at */
    get beat(): number { return this._beatTracker.value; }
    set beat(value: number) { this._beatTracker.value = value; }
    get beatTracker(): PropertyTracker<number> { return this._beatTracker; }
    private _beatTracker: PropertyTracker<number> = new PropertyTracker(0);

    /** If not running, then the arpeggiator won't do anything with each update cycle */
    get running(): boolean { return this._running; }
    set running(value: boolean) { this._running = value; }
    private _running: boolean = true;

    /**
     * Allows attaching custom logic to modify each note produced by the arpeggiator.
     * 
     * For example:
     * ```
     * const arp = new Arpeggiator(arpeggio, metronome, midiOut);
     * arp.noteModifier = note => note.velocity = Math.floor(Math.random() * 128);  //Give each arpeggiated note a random velocity
     * ```
     */
    get noteModifier(): ((note: Note) => void) { return this._noteModifier; }
    set noteModifier(value: ((note: Note) => void)) { this._noteModifier = value; }
    private _noteModifier: (note: Note) => void;

    /** Signifies whether the arpeggiator has stopped. */
    get isFinished(): boolean { return this._isFinished; }
    private _isFinished: boolean = false;

    /** This event fires when the arpeggiator finishes. */
    get finished(): ClockChildFinishedEvent { return this._finished; }
    private _finished: ClockChildFinishedEvent = new ClockChildFinishedEvent();

    private _notes: Note[] = [];

    constructor(arpeggio: Arpeggio, metronome: IMetronome, midiOut: IMidiOut) {
        this.arpeggio = arpeggio;
        this.metronome = metronome;
        this.midiOut = midiOut;
        if (!!Clock.default)
            Clock.default.addChild(this);
    }

    /**
     * This method is intended to be called by a clock to provide regular updates. It should not be called by consumers of the library.
     * @param deltaMs How many milliseconds have passed since the last update cycle.
     * @returns 
     */
    update(deltaMs: number): void {
        if (!this.running || !this.arpeggio || !this.metronome || !this.midiOut)
            return;

        const beatDiff = (this.metronome.totalBeat - this.metronome.totalBeatTracker.oldValue) * this.speed;
        if (beatDiff == 0)
            return;

        this.beatTracker.accept();
        this.beatTracker.value = (this.beatTracker.value + beatDiff) % this.arpeggio.duration;
        const oldArpeggioBeat = this.beatTracker.oldValue;
        const newArpeggioBeat = this.beatTracker.value;

        //If we've looped back round to the start of the arpeggio, end all notes which the player had started
        if (oldArpeggioBeat > newArpeggioBeat)
            this._endAllNotes();

        //Loop through each existing note that the arpeggiator has started
        //Stop notes that need to end
        for (const note of this._notes) {
            const arpNote: ArpeggioNote = note['arpNote'];
            if (!arpNote.contains(newArpeggioBeat) || newArpeggioBeat < oldArpeggioBeat)
                note.stop();
            else if (typeof(arpNote.velocity) != 'number')
                note.velocity = arpNote.velocity.update((newArpeggioBeat - arpNote.start) / arpNote.duration);
        }
        this._notes = this._notes.filter(n => n.on);

        //Loop through each clip note in the current range and add a new note for each one
        //Store the clipNote that each note came from, so we can track down notes when it's time to stop them
        if (this.chord) {
            for (const arpNote of this.arpeggio.getNotesStartingInRange(oldArpeggioBeat, newArpeggioBeat)) {
                const note = arpNote.createNote(this.chord, this.channel, (newArpeggioBeat - arpNote.start) / arpNote.duration);
                if (!note)
                    continue;
                note['arpNote'] = arpNote;
                if (this.noteModifier)
                    this.noteModifier(note);
                this._notes.push(note);
                this.midiOut.addNote(note);
            }
        }
    }

    /** Calling this tells the arpeggiator to stop whatever it's doing and that it will no longer be used. */
    finish(): void {
        this._isFinished = true;
        this._endAllNotes();
        this.finished.trigger(new ClockChildFinishedEventData(this));
    }

    /**
     * Provides a way for setting the ref through a chained function call. For example:
     * 
     * ```
     * clock.addChild(new Arpeggiator(arpeggio, metronome, midiOut).withRef('arpeggiator'));
     * ```
     * 
     * @param ref The ref to set on the object.
     * @returns The calling object.
     */
    withRef(ref: string): IClockChild {
        this._ref = ref;
        return this;
    }

    private _endAllNotes(): void {
        for (const note of this._notes)
            note.stop();
        this._notes = [];
    }
}