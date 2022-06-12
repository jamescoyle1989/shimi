'use strict';

import { Arpeggio, ArpeggioNote } from './Arpeggio';
import Chord from './Chord';
import { IClockChild } from './Clock';
import { Note } from './index';
import { IMetronome } from './Metronome';
import { IMidiOut } from './MidiOut';
import PropertyTracker from './PropertyTracker';


/**
 * @category Chords & Scales
 */
export default class Arpeggiator implements IClockChild {
    /** Which arpeggio to play */
    get arpeggio(): Arpeggio { return this._arpeggio; }
    /** Which arpeggio to play */
    set arpeggio(value: Arpeggio) { this._arpeggio = value; }
    private _arpeggio: Arpeggio;

    /** Which chord to play */
    get chord(): Chord { return this._chord; }
    /** Which chord to play */
    set chord(value: Chord) { this._chord = value; }
    private _chord: Chord;

    /** Which channel to play the arpeggio on */
    get channel(): number { return this._channel; }
    /** Which channel to play the arpeggio on */
    set channel(value: number) { this._channel = value; }
    private _channel: number = 0;

    /** Provides a way of identifying players so they can be retrieved later */
    get ref(): string { return this._ref; }
    /** Provides a way of identifying players so they can be retrieved later */
    set ref(value: string) { this._ref = value; }
    private _ref: string;

    /** The metronome which the player uses for tracking passed beats */
    get metronome(): IMetronome { return this._metronome; }
    /** The metronome which the player uses for tracking passed beats */
    set metronome(value: IMetronome) { this._metronome = value; }
    private _metronome: IMetronome;

    /** The MidiOut which data from the arpeggio gets played on */
    get midiOut(): IMidiOut { return this._midiOut; }
    /** The MidiOut which data from the arpeggio gets played on */
    set midiOut(value: IMidiOut) { this._midiOut = value; }
    private _midiOut: IMidiOut;

    /** How many beats in the arpeggio to play for every beat that passes in actual time */
    get speed(): number { return this._speed; }
    /** How many beats in the arpeggio to play for every beat that passes in actual time */
    set speed(value: number) { this._speed = value; }
    private _speed: number = 1;

    /** Which beat of the arpeggio playback is at */
    get beat(): number { return this._beatTracker.value; }
    /** Which beat of the arpeggio playback is at */
    set beat(value: number) { this._beatTracker.value = value; }
    get beatTracker(): PropertyTracker<number> { return this._beatTracker; }
    private _beatTracker: PropertyTracker<number> = new PropertyTracker(0);

    /** If not running, then the player won't do anything with each update cycle */
    get running(): boolean { return this._running; }
    /** If not running, then the player won't do anything with each update cycle */
    set running(value: boolean) { this._running = value; }
    private _running: boolean = true;

    /** Allows attaching custom logic to modify each note produced by the arpeggiator */
    get noteModifier(): ((note: Note) => void) { return this._noteModifier; }
    /** Allows attaching custom logic to modify each note produced by the arpeggiator */
    set noteModifier(value: ((note: Note) => void)) { this._noteModifier = value; }
    private _noteModifier: (note: Note) => void;

    get finished(): boolean { return this._finished; }
    private _finished: boolean = false;

    private _notes: Note[] = [];

    constructor(arpeggio: Arpeggio, metronome: IMetronome, midiOut: IMidiOut) {
        this.arpeggio = arpeggio;
        this.metronome = metronome;
        this.midiOut = midiOut;
    }

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

        //Loop through each existing note that the arpeggiator has started
        //Stop notes that need to end
        for (const note of this._notes) {
            const arpNote: ArpeggioNote = note['arpNote'];
            if (!arpNote.contains(newArpeggioBeat))
                note.stop();
        }
        this._notes = this._notes.filter(n => n.on);

        //Loop through each clip note in the current range and add a new note for each one
        //Store the clipNote that each note came from, so we can track down notes when it's time to stop them
        for (const arpNote of this.arpeggio.getNotesStartingInRange(oldArpeggioBeat, newArpeggioBeat)) {
            const note = arpNote.createNote(this.chord, this.channel);
            note['arpNote'] = arpNote;
            if (this.noteModifier)
                this.noteModifier(note);
            this._notes.push(note);
            this.midiOut.addNote(note);
        }
    }

    finish(): void {
        this._finished = true;
        this._endAllNotes();
    }

    private _endAllNotes(): void {
        for (const note of this._notes)
            note.stop();
        this._notes = [];
    }
}