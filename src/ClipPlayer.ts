'use strict';

import { Clip, ClipNote } from './Clip';
import IMetronome from './Metronome';
import Note from './Note';
import { IMidiOut } from './MidiOut';


export default class ClipPlayer {
    /** Which clip to play */
    get clip(): Clip { return this._clip; }
    /** Which clip to play */
    set clip(value: Clip) { this._clip = value; }
    private _clip: Clip;

    /** Which channel to play the clip on */
    get channel(): number { return this._channel; }
    /** Which channel to play the clip on */
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

    /** How many beats in the clip to play for every beat that passes in actual time */
    get speed(): number { return this._speed; }
    /** How many beats in the clip to play for every beat that passes in actual time */
    set speed(value: number) { this._speed = value; }
    private _speed: number = 1;

    /** Which beat of the clip to start playing from */
    get startBeat(): number { return this._startBeat; }
    /** Which beat of the clip to start playing from */
    set startBeat(value: number) { this._startBeat = value; }
    private _startBeat: number = 0;

    /** How many beats to stop the clip playing after */
    get beatCount(): number { return this._beatCount; }
    /** How many beats to stop the clip playing after */
    set beatCount(value: number) { this._beatCount = value; }
    private _beatCount: number = null;

    /** If not running, then the player won't do anything with each update cycle */
    get running(): boolean { return this._running; }
    /** If not running, then the player won't do anything with each update cycle */
    set running(value: boolean) { this._running = value; }
    private _running: boolean = true;

    /** Allows attaching custom logic to modify each note produced by the clip player */
    get noteModifier(): ((note: Note) => void) { return this._noteModifier; }
    /** Allows attaching custom logic to modify each note produced by the clip player */
    set noteModifier(value: ((note: Note) => void)) { this._noteModifier = value; }
    private _noteModifier: (note: Note) => void;

    get beatsPassed(): number { return this._beatsPassed; }
    private _beatsPassed: number = 0;

    get finished(): boolean { return this._finished; }
    private _finished: boolean = false;

    private _notes: Note[] = [];

    constructor(clip: Clip, metronome: IMetronome) {
        this.clip = clip;
        this.metronome = metronome;
    }

    start() {
        this.running = true;
    }

    pause() {
        this.running = false;
    }

    stop() {
        this.running = false;
        this._beatsPassed = 0;
    }

    update(midiOut: IMidiOut, deltaMs: number): void {
        if (!this.running || !this.clip || !this.metronome)
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
            this._finished = true;
            this._endAllNotes();
        }

        //Loop through each existing note that the player has started
        //Update velocity of any that need it
        for (const note of this._notes) {
            const clipNote: ClipNote = note['clipNote'];
            if (typeof(clipNote.velocity) == 'function')
                note.velocity = clipNote.velocity(newClipBeat - clipNote.start);
        }

        //Loop through each clip note in the current range and add a new note for each one
        //Store the clipNote that each note came from, so we can track down notes when it's time to stop them
        for (const clipNote of this.clip.getNotesStartingInRange(oldClipBeat, newClipBeat)) {
            const note = clipNote.createNote(this.channel);
            note['clipNote'] = clipNote;
            if (this.noteModifier)
                this.noteModifier(note);
            this._notes.push(note);
            midiOut.addNote(note);
        }

        //Loop through ending each clip note in the current range that needs to be stopped
        for (const clipNote of this.clip.getNotesEndingInRange(oldClipBeat, newClipBeat)) {
            const note = this._notes.find(n => n['clipNote'] === clipNote);
            if (note)
                note.stop();
        }
        this._notes = this._notes.filter(n => n.on);
    }

    private _endAllNotes(): void {
        for (const note of this._notes)
            note.stop();
        this._notes = [];
    }
}