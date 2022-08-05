'use strict';

import { IClockChild } from './Clock';
import { IMidiIn, MidiInEventData } from './MidiIn';
import { IMetronome } from './Metronome';
import { Clip, ClipBend, ClipCC, ClipNote } from './Clip';
import * as messages from './MidiMessages';
import ShimiEvent, { ShimiEventData } from './ShimiEvent';


/**
 * The ClipRecorderEventData class extends ShimiEventData. It contains a reference to the source ClipRecorder that created the event data, as well as information about the clip which the recorder has been constructing.
 * 
 * @category Clips
 */
export class ClipRecorderEventData extends ShimiEventData<ClipRecorder> {
    /** The Clip object which has been under construction by the ClipRecorder. */
    get clip(): Clip { return this._clip; }
    private _clip: Clip;
    
    constructor(source: ClipRecorder, clip: Clip) {
        super(source);
        this._clip = clip;
    }
}


/**
 * The ClipRecorderEvent class extends ShimiEvent, providing an object which can be subscribed to.
 * 
 * It distributes events which point back to the source ClipRecorder, and a ClipRecorderEventData object that contains the event information.
 * 
 * @category Clips
 */
export class ClipRecorderEvent extends ShimiEvent<ClipRecorderEventData, ClipRecorder> {
}


/**
 * The ClipRecorder class subscribes to an IMidiIn and records incoming MIDI data into a clip.
 * 
 * Once the ClipRecorder has finished, a new clip is dispatched from the newClip event.
 * 
 * @category Clips
 */
export default class ClipRecorder implements IClockChild {
    /** The metronome which the recorder uses for tracking passed beats. */
    get metronome(): IMetronome { return this._metronome; }
    set metronome(value: IMetronome) { this._metronome = value; }
    private _metronome: IMetronome;

    /** The MIDI input which data gets recorded from. */
    get midiIn(): IMidiIn { return this._midiIn; }
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

    /** 
     * How many beats to stop the clip recording after.
     * 
     * This also sets the duration of the clip that will be returned at the end of the recording.
     * 
     * The default value is 4. If this is set to null, then the recorder will only stop when explicitly told, and the returned clip's length will be however long the recorder ended up running for.
     */
    get beatCount(): number { return this._beatCount; }
    set beatCount(value: number) { 
        this._beatCount = value;
        if (value == null)
            this._clip.duration = 0;
        else
            this._clip.duration = value;
    }
    private _beatCount: number = 4;

    /** How many beats have passed since recording started. */
    get beatsPassed(): number { return this._beatsPassed; }
    private _beatsPassed: number = 0;

    /** The clip which gets built up and returned. */
    private _clip: Clip = new Clip(4);

    /** 
     * The newClip event dispatches a new clip object once recording has completed.
     * 
     * This example will create a ClipRecorder that records a 16 beat phrase. Once done, the phrase is automatically played back on loop:
     * ```
     *  const clipRecorder = new ClipRecorder(metronome, midiIn);
     *  clipRecorer.beatCount = 16;
     *  clipRecorder.newClip.add(evt => {
     *      const clipPlayer = new ClipPlayer(evt.clip, metronome, midiOut);
     *      clock.addChild(clipPlayer);
     *  });
     *  clock.addChild(clipRecorder);
     * ```
     */
    get newClip(): ClipRecorderEvent { return this._newClip; }
    private _newClip: ClipRecorderEvent = new ClipRecorderEvent();

    /**
     * @param metronome The metronome which the recorder uses for tracking passed beats.
     * @param midiIn The MIDI input which data gets recorded from.
     */
    constructor(metronome: IMetronome, midiIn: IMidiIn) {
        this.metronome = metronome;
        this.midiIn = midiIn;
    }

    private _getClipPosition(position: number): number {
        if (this.beatCount == null)
            return position;
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

    /** Provides a way of identifying recorders so they can be easily retrieved later. */
    get ref(): string { return this._ref; }
    set ref(value: string) { this._ref = value; }
    private _ref: string;

    /**
     * This method is intended to be called by a clock to provide regular updates. It should not be called by consumers of the library.
     * @param deltaMs How many milliseconds have passed since the last update cycle.
     * @returns 
     */
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
        if (this.beatCount != null && this.beatsPassed >= this.beatCount) {
            this.finish();
            return;
        }
    }

    /** Returns true if the clip recorder has finished recording. */
    get finished(): boolean { return this._finished; }
    private _finished: boolean = false;

    /** Calling this tells the clip recorder to stop whatever it's doing and that it will no longer be used. */
    finish(): void {
        this._finished = true;

        if (this.beatCount == null)
            this._clip.duration = this.beatsPassed;

        for (const inProgressNote of this._inProgressNotes) {
            inProgressNote.end = this._clip.duration;
            this._clip.notes.push(inProgressNote);
        }
        this._inProgressNotes = [];
        this.newClip.trigger(new ClipRecorderEventData(this, this._clip));
    }

    /**
     * Provides a way for setting the ref through a chained function call. For example:
     * 
     * ```
     * clock.addChild(new ClipRecorder(metronome, midiIn).withRef('recorder'));
     * ```
     * 
     * @param ref The ref to set on the object.
     * @returns The calling object.
     */
    withRef(ref: string): IClockChild {
        this._ref = ref;
        return this;
    }
}