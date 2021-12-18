'use strict';

import { IClockChild } from './Clock';
import { IMidiIn, MidiInEventData } from './MidiIn';
import { IMetronome } from './Metronome';
import { Clip, ClipBend, ClipCC, ClipNote } from './Clip';
import * as messages from './MidiMessages';
import ShimiEvent, { ShimiEventData } from './ShimiEvent';


export class ClipRecorderEventData extends ShimiEventData<ClipRecorder> {
    get clip(): Clip { return this._clip; }
    private _clip: Clip;
    
    constructor(source: ClipRecorder, clip: Clip) {
        super(source);
        this._clip = clip;
    }
}


export class ClipRecorderEvent extends ShimiEvent<ClipRecorderEventData, ClipRecorder> {
}


export default class ClipRecorder implements IClockChild {
    /** The metronome which the recorder uses for tracking passed beats */
    get metronome(): IMetronome { return this._metronome; }
    /** The metronome which the recorder uses for tracking passed beats */
    set metronome(value: IMetronome) { this._metronome = value; }
    private _metronome: IMetronome;

    /** The MidiOut which data from the clip gets played on */
    get midiIn(): IMidiIn { return this._midiIn; }
    /** The MidiOut which data from the clip gets played on */
    set midiIn(value: IMidiIn) { 
        if (this._midiIn == value)
            return;
        if (this._midiIn) {
            this._midiIn.noteOn.remove(x => x.logic == this._onNoteOn);
            this._midiIn.noteOff.remove(x => x.logic == this._onNoteOff);
            this._midiIn.controlChange.remove(x => x.logic == this._onControlChange);
            this._midiIn.pitchBend.remove(x => x.logic == this._onPitchBend);
        }
        this._midiIn = value;
        if (this._midiIn) {
            this._midiIn.noteOn.add(this._onNoteOn);
            this._midiIn.noteOff.add(this._onNoteOff);
            this._midiIn.controlChange.add(this._onControlChange);
            this._midiIn.pitchBend.add(this._onPitchBend);
        }
    }
    private _midiIn: IMidiIn;

    /** How many beats to stop the clip recording after */
    get beatCount(): number { return this._beatCount; }
    /** How many beats to stop the clip recording after */
    set beatCount(value: number) { 
        this._beatCount = value;
        this._clip.duration = value;
    }
    private _beatCount: number = 4;

    get beatsPassed(): number { return this._beatsPassed; }
    private _beatsPassed: number = 0;

    /** The clip which gets built up */
    private _clip: Clip = new Clip(4);

    get newClip(): ClipRecorderEvent { return this._newClip; }
    private _newClip: ClipRecorderEvent = new ClipRecorderEvent();

    constructor(metronome: IMetronome, midiIn: IMidiIn) {
        this.metronome = metronome;
        this.midiIn = midiIn;
    }

    private _getClipPosition(position: number): number {
        return position % this._clip.duration;
    }


    private _inProgressNotes: ClipNote[] = [];

    private _onNoteOn = (data: MidiInEventData<messages.NoteOnMessage>) => {
        const message = data.message;
        this._inProgressNotes.push(new ClipNote(
            this._getClipPosition(this.beatsPassed), 
            0, 
            message.pitch, 
            message.velocity, 
            message.channel
        ));
    }

    private _onNoteOff = (data: MidiInEventData<messages.NoteOffMessage>) => {
        const message = data.message;
        const inProgressNote = this._inProgressNotes
            .find(x => x.pitch == message.pitch && x.channel == message.channel);
        if (inProgressNote) {
            inProgressNote.end = this._getClipPosition(this.beatsPassed);
            this._clip.notes.push(inProgressNote);
            this._inProgressNotes = this._inProgressNotes
                .filter(x => x.pitch != message.pitch || x.channel != message.channel);
        }
    }

    private _onControlChange = (data: MidiInEventData<messages.ControlChangeMessage>) => {
        const message = data.message;
        this._clip.controlChanges.push(new ClipCC(
            this._getClipPosition(this.beatsPassed), 
            0, 
            message.controller, 
            message.value, 
            message.channel
        ));
    }

    private _onPitchBend = (data: MidiInEventData<messages.PitchBendMessage>) => {
        const message = data.message;
        this._clip.bends.push(new ClipBend(
            this._getClipPosition(this.beatsPassed),
            0,
            message.percent,
            message.channel
        ));
    }


    // --------------------------
    // IClockChild implementation
    // --------------------------

    /** Provides a way of identifying recorders so they can be retrieved later */
    get ref(): string { return this._ref; }
    /** Provides a way of identifying recorders so they can be retrieved later */
    set ref(value: string) { this._ref = value; }
    private _ref: string;

    update(deltaMs: number): void {
        if (this.finished || !this.midiIn || !this.metronome)
            return;
        
        const beatDiff = this.metronome.totalBeat - this.metronome.totalBeatTracker.oldValue;
        if (beatDiff == 0)
            return;

        const oldBeatsPassed = this.beatsPassed;
        const newBeatsPassed = this.beatsPassed + beatDiff;

        const oldClipBeat = this._getClipPosition(oldBeatsPassed);
        const newClipBeat = this._getClipPosition(newBeatsPassed);

        //Update beatsPassed, if it's greater or equal to beatCount, then the recording is finished
        this._beatsPassed += beatDiff;
        if (this.beatsPassed >= this.beatCount) {
            this.finish();
            return;
        }
    }

    get finished(): boolean { return this._finished; }
    private _finished: boolean = false;

    finish(): void {
        this._finished = true;
        for (const inProgressNote of this._inProgressNotes) {
            inProgressNote.end = this._clip.duration;
            this._clip.notes.push(inProgressNote);
        }
        this._inProgressNotes = [];
        this.newClip.trigger(new ClipRecorderEventData(this, this._clip));
    }
}