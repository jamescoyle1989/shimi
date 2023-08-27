'use strict';

import { Clip, ClipNote } from './Clip';
import { IMetronome } from './Metronome';
import Note from './Note';
import { ClockChildFinishedEvent, ClockChildFinishedEventData, IClockChild } from './Clock';
import { IMidiOut } from './MidiOut';
import { ControlChangeMessage, PitchBendMessage } from './MidiMessages';


/**
 * The ClipPlayer facilitates the playing of a clip.
 * 
 * The ClipPlayer should be added to a clock to receive regular updates. It should hold a reference to a metronome for beat timings. It should hold a reference to a MIDI Out for it to send MIDI data to. And it should hold a reference to a clip, which it will play.
 * 
 * @category Clips
 */
export default class ClipPlayer implements IClockChild {
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.ClipPlayer'; }

    /** The clip to play. */
    get clip(): Clip { return this._clip; }
    set clip(value: Clip) {
        if (this._clip === value)
            return;
        this._endAllNotes();
        this._clip = value;
    }
    private _clip: Clip;

    /** 
     * Which channel to play the clip on. Valid values range from 0 - 15.
     * 
     * The default value is 0.
     */
    get channel(): number { return this._channel; }
    set channel(value: number) { this._channel = value; }
    private _channel: number = 0;

    /** Provides a way of identifying a clip player so that it can be easily retrieved later. */
    get ref(): string { return this._ref; }
    set ref(value: string) { this._ref = value; }
    private _ref: string;

    /** The metronome which the player uses for tracking passed beats. */
    get metronome(): IMetronome { return this._metronome; }
    set metronome(value: IMetronome) { this._metronome = value; }
    private _metronome: IMetronome;

    /** The IMidiOut which MIDI data generated from the clip gets sent to. */
    get midiOut(): IMidiOut { return this._midiOut; }
    set midiOut(value: IMidiOut) { this._midiOut = value; }
    private _midiOut: IMidiOut;

    /** How many beats in the clip to play for every beat that passes in actual time. For example: 1.5 means the clip is played 1.5 times faster than it would normally. */
    get speed(): number { return this._speed; }
    set speed(value: number) { this._speed = value; }
    private _speed: number = 1;

    /** Which beat of the clip to start playing from. This allows for a clip player to begin playing a clip from half-way through for example. */
    get startBeat(): number { return this._startBeat; }
    set startBeat(value: number) { this._startBeat = value; }
    private _startBeat: number = 0;

    /** How many beats should have passed before the clip player stops. The default value is null, meaning the ClipPlayer never stops, and continually loops playback of the clip. */
    get beatCount(): number { return this._beatCount; }
    set beatCount(value: number) { this._beatCount = value; }
    private _beatCount: number = null;

    /**
     * If not running, then the player won't do anything with each update cycle. This allows a way to temporarily pause playback of the clip, without having to remove it from the clock.
     * 
     * By default this is set to true.
     */
    get running(): boolean { return this._running; }
    set running(value: boolean) { this._running = value; }
    private _running: boolean = true;

    /** Allows attaching custom logic to modify each note produced by the clip player. The provided function should accept a note as its only parameter. For example:
     * ```
     *  clipPlayer.noteModifier = (note) => {
     *      note.pitch += 12;
     *      note.velocity = 40 + Math.floor(Math.random() * 40);
     *  };
     * ```
     */
    get noteModifier(): ((note: Note) => void) { return this._noteModifier; }
    set noteModifier(value: ((note: Note) => void)) { this._noteModifier = value; }
    private _noteModifier: (note: Note) => void;

    /** How many beats have passed since the clip player started. */
    get beatsPassed(): number { return this._beatsPassed; }
    private _beatsPassed: number = 0;

    /** Returns true if the clip player has finished playing its clip. */
    get isFinished(): boolean { return this._isFinished; }
    private _isFinished: boolean = false;

    /** This event fires when the clip player finishes. */
    get finished(): ClockChildFinishedEvent { return this._finished; }
    private _finished: ClockChildFinishedEvent = new ClockChildFinishedEvent();

    private _notes: Note[] = [];

    /**
     * @param clip The clip to play.
     * @param metronome The metronome which the player uses for tracking passed beats.
     * @param midiOut The IMidiOut which MIDI data generated from the clip gets sent to.
     */
    constructor(clip: Clip, metronome: IMetronome, midiOut: IMidiOut) {
        this.clip = clip;
        this.metronome = metronome;
        this.midiOut = midiOut;
    }

    /** Start the running of the clip player. This is not needed unless you've previously explicitly paused or stopped it. */
    start() {
        this.running = true;
    }

    /** Halt playback of the clip, with the playback position retained to allow for it to be resumed later. */
    pause() {
        this.running = false;
    }

    /** Halt playback of the clip, discarding all information about how much of the clip has already been played. */
    stop() {
        this.running = false;
        this._beatsPassed = 0;
    }

    /**
     * This method is intended to be called by a clock to provide regular updates. It should not be called by consumers of the library.
     * @param deltaMs How many milliseconds have passed since the last update cycle.
     * @returns 
     */
    update(deltaMs: number): void {
        if (!this.running || !this.clip || !this.metronome || !this.midiOut)
            return;

        const beatDiff = (this.metronome.totalBeat - this.metronome.totalBeatTracker.oldValue) * this.speed;
        if (beatDiff == 0)
            return;

        const oldBeatsPassed = this.beatsPassed;
        const newBeatsPassed = this.beatsPassed + beatDiff;

        const oldClipBeat = (this.startBeat + oldBeatsPassed) % this.clip.duration;
        const newClipBeat = (this.startBeat + newBeatsPassed) % this.clip.duration;

        //If we've looped back round to the start of the clip, end all notes which the player had started
        if (oldClipBeat > newClipBeat)
            this._endAllNotes();

        //Update beatsPassed, if it's greater or equal to beatCount, then the player is finished
        this._beatsPassed += beatDiff;
        if (typeof(this.beatCount) == 'number' && this.beatsPassed >= this.beatCount) {
            this.finish();
            return;
        }

        //Loop through each existing note that the player has started
        //Stop notes that need to end, and update velocity of any others need it
        for (const note of this._notes) {
            const clipNote: ClipNote = note['clipNote'];
            if (!clipNote.contains(newClipBeat) || !this.clip.notes.find(x => x === clipNote))
                note.stop();
            else if (typeof(clipNote.velocity) != 'number')
                note.velocity = clipNote.velocity.update((newClipBeat - clipNote.start) / clipNote.duration);
        }
        this._notes = this._notes.filter(n => n.on);

        //Loop through each clip note in the current range and add a new note for each one
        //Store the clipNote that each note came from, so we can track down notes when it's time to stop them
        for (const clipNote of this.clip.getNotesStartingInRange(oldClipBeat, newClipBeat)) {
            const note = clipNote.createNote(this.channel, (newClipBeat - clipNote.start) / clipNote.duration);
            note['clipNote'] = clipNote;
            if (this.noteModifier)
                this.noteModifier(note);
            this._notes.push(note);
            this.midiOut.addNote(note);
        }

        //Trigger any control change messages that need to be sent
        for (const clipCC of this.clip.getControlChangesIntersectingRange(oldClipBeat, newClipBeat)) {
            const clipValueIsFunction = typeof(clipCC.value) == 'function';
            if (newClipBeat > clipCC.end && clipCC.start < oldClipBeat && !clipValueIsFunction)
                continue;
            this.midiOut.sendMessage(new ControlChangeMessage(
                clipCC.controller, 
                (typeof(clipCC.value) == 'number') ? 
                    clipCC.value :    
                    clipCC.value.update(Math.min(1, (newClipBeat - clipCC.start) / clipCC.duration)), 
                clipCC.channel ?? this.channel
            ));
        }

        //Trigger any bend messages that need to be sent
        for (const clipBend of this.clip.getBendsIntersectingRange(oldClipBeat, newClipBeat)) {
            const percentIsFunction = typeof(clipBend.percent) == 'function';
            if (newClipBeat > clipBend.end && clipBend.start < oldClipBeat && !percentIsFunction)
                continue;
            this.midiOut.sendMessage(new PitchBendMessage(
                (typeof(clipBend.percent) == 'number') ?
                    clipBend.percent :
                    clipBend.percent.update(Math.min(1, (newClipBeat - clipBend.start) / clipBend.duration)),
                clipBend.channel ?? this.channel
            ));
        }
    }

    /** Calling this tells the clip player to stop whatever it's doing and that it will no longer be used. */
    finish(): void {
        this._isFinished = true;
        this._endAllNotes();
        this.finished.trigger(new ClockChildFinishedEventData(this));
    }

    /**
     * Provides a way for setting the ref through a chained function call. For example:
     * 
     * ```
     * clock.addChild(new ClipPlayer(clip, metronome, midiOut).withRef('player'));
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