'use strict';

import { IMidiMessage } from './MidiMessages';
import { IMidiOut } from './MidiOut';
import Note from './Note';
import { toHertz } from './utils';
import * as messages from './MidiMessages';
import Clock, { ClockChildFinishedEvent, ClockChildFinishedEventData, IClockChild } from './Clock';



/**
 * The ToneJSMidiOutChannel class represents one particular MIDI channel within the ToneJSMidiOut. It holds a reference to a ToneJS instrument object, and handles the conversion from received MIDI messages into actions to perform on the ToneJS instrument.
 * 
 * @category Midi IO
 */
export class ToneJSMidiOutChannel {
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.ToneJSMidiOutChannel'; }

    /**
     * The ToneJS instrument which will be responsible for playback.
     */
    get target(): any { return this._target; }
    private _target: any;

    /**
     * A collection of current control values. This array is instanciated in the constructor with 128 indices, each one initially set to 0. As control change MIDI messages are received, these values get updated.
     */
    controlValues: Array<number>;

    /**
     * Stores whether the ToneJS instrument being held is polyphonic. This is mainly for internal purposes, to determine how calls are made to the target.
     */
    get isPolyphonic(): boolean { return this._isPolyphonic; }
    private _isPolyphonic: boolean = false;

    private _pitchBendPercent: number = 0;

    /**
     * The ToneJSMidiOut instance which this channel object belongs to.
     */
    get parent(): ToneJSMidiOut { return this._parent; }
    private _parent: ToneJSMidiOut;
    
    /**
     * @param target The ToneJS instrument which will be responsible for playback.
     * @param parent The ToneJSMidiOut instance which this channel object belongs to.
     */
    constructor(target: any, parent: ToneJSMidiOut) {
        this._target = target;
        this._parent = parent;
        this.controlValues = Array(128).fill(0);
        if (target.name == 'Sampler' || target.name == 'PolySynth')
            this._isPolyphonic = true;
    }

    /**
     * This method gets called by ToneJSMidiOut whenever a new note needs to be started.
     * @param note The note object that playback is to be started for.
     */
    onNoteStart(note: Note) {
        if (this.target.name == 'NoiseSynth')
            this.target.triggerAttack(this.parent.toneJS.now(), note.velocity / 127);
        else
            this.target.triggerAttack(toHertz(note.pitch), this.parent.toneJS.now(), note.velocity / 127);
    }

    /**
     * This method gets called by ToneJSMidiOut whenever a note needs to be stopped.
     * @param note The note object that playback is to be stopped for.
     */
    onNoteStop(note: Note) {
        if (this._isPolyphonic)
            this.target.triggerRelease(toHertz(note.pitch), this.parent.toneJS.now());
        else
            this.target.triggerRelease(this.parent.toneJS.now());
    }

    /**
     * This method gets called by ToneJSMidiOut whenever a pitch bend message is received for this channel. Note, this method will only take action if the attached ToneJS instrument is monophonic. Using pitch bends in conjunction with frequency manipulation through ToneJS's set of tools will lead to weird results
     * @param pitchBend The pitch bend message that was received
     * @returns Returns true if any action was taken.
     */
    onPitchBend(pitchBend: messages.PitchBendMessage): boolean {
        if (this._isPolyphonic)
            return false;

        const pitchBendChange = pitchBend.percent - this._pitchBendPercent;
        this._pitchBendPercent = pitchBend.percent;
        
        const oldFreq = this.target.frequency.value;
        const newFreq = oldFreq * Math.pow(2, (pitchBendChange * 2) / 12);
        this.target.frequency.value = newFreq;
        return true;
    }

    /**
     * This property is null by default, but can take a function value which gets called every time the channel receives a new control change message.
     */
    onControlChange: (controlChange: messages.ControlChangeMessage, target: any) => void = null;
}



/**
 * The ToneJSMidiOut implements the IMidiOut, and provides an integration with the ToneJS javascript library. This allows for MIDI data coming from shimi to control sound generation in the browser by ToneJS.
 * 
 * @category Midi IO
 */
export default class ToneJSMidiOut implements IMidiOut, IClockChild {
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.ToneJSMidiOut'; }

    /**
     * The collection of channels that MIDI data can be sent out to. Each channel that's being used should hold a reference to a ToneJS instrument object.
     */
    get channels(): Array<ToneJSMidiOutChannel> { return this._channels; }
    private _channels: Array<ToneJSMidiOutChannel> = [
        null, null, null, null,
        null, null, null, null,
        null, null, null, null,
        null, null, null, null
    ];

    /**
     * A reference to the ToneJS library.
     */
    get toneJS() { return this._toneJS; }
    private _toneJS: any;

    /**
     * Requires that a reference to the toneJS library be passed in as a parameter, for example:
     * 
     * ```
     * import * as Tone from 'tone';
     * new ToneJSMidiOut(Tone);
     * ```
     */
    constructor(toneJS: any) {
        if (!toneJS)
            throw new Error('toneJS reference cannot be falsy');
        this._toneJS = toneJS;
        if (!!Clock.default)
            Clock.default.addChild(this);
    }

    /**
     * Sets up a target destination against a particular channel number, which MIDI messages with the corresponding number will be sent to.
     * 
     * Example:
     * 
     * ```
     * const midiOut = new ToneJSMidiOut(Tone);
     * midiOut.setChannel(0, new Tone.Synth().toDestination());
     * ```
     * 
     * @param channel The channel number to be set up. Valid values range from 0 to 15.
     * @param target The ToneJS instrument object which will MIDI messages will ultimately end up affecting.
     */
    setChannel(channel: number, target: any) {
        if (channel < 0 || channel > 15)
            throw new Error('Channel must be numbered 0 - 15');

        if (target)
            this._channels[channel] = new ToneJSMidiOutChannel(target, this);
        else
            this._channels[channel] = null;
    }


    //IMidiOut implementation start

    /**
     * The notes collection consists of notes which have been started, but not ended yet.
     * 
     * The ToneJSMidiOut will cycle through this collection on each update, checking to see if it needs to stop the playback of any notes.
     */
    get notes(): Array<Note> { return this._notes; }
    private _notes: Array<Note> = [];

    /**
     * Adds a new note to ToneJSMidiOut's collection, returning the note that was added.
     * 
     * Note, if the ToneJSMidiOut has not set anything for the channel which the note is targetting, then no action will be performed.
     * 
     * If `note.on == true`, then the ToneJS Instrument for the corresponding channel is immediately instructed to triggerAttack.
     * @param note The note to add to the ToneJSMidiOut.
     * @returns The note that was added
     */
    addNote(note: Note): Note {
        const channelObj = this._channels[note.channel];
        if (!channelObj)
            return;

        this._notes.push(note);
        if (note.on) {
            channelObj.onNoteStart(note);
            note.onTracker.accept();
        }
        return note;
    }


    /**
     * Calls the stop() method of all notes which have been added to the MidiOut that meet the passed in criteria.
     * @param filter The criteria for determining which notes need to be stopped. If no filter provided, then all notes are stopped.
     */
    stopNotes(filter?: (note: Note) => boolean): void {
        for (const n of this._notes) {
            if (!filter || filter(n))
                n.stop();
        }
    }


    /**
     * This method accepts an IMidiMessage object, which it converts to a MIDI byte array to send to the connected MIDI port.
     * @param message The IMidiMessage object to be converted and sent out.
     * @returns 
     */
    sendMessage(message: IMidiMessage): boolean {
        const messageType = message.typeName;
        if (messageType == 'shimi.NoteOffMessage') {
            const noteOff = message as messages.NoteOffMessage;
            this.stopNotes(n => n.pitch == noteOff.pitch && n.channel == noteOff.channel);
            return true;
        }

        else if (messageType == 'shimi.NoteOnMessage') {
            const noteOn = message as messages.NoteOnMessage;
            return !!this.addNote(new Note(noteOn.pitch, noteOn.velocity, noteOn.channel));
        }

        else if (messageType == 'shimi.ControlChangeMessage') {
            const controlChange = message as messages.ControlChangeMessage;
            const channelObj = this._channels[controlChange.channel];
            if (channelObj) {
                if (controlChange.controller < 0 || controlChange.controller > 127)
                    throw new Error('CC control must be between 0 & 127');
                if (controlChange.value < 0 || controlChange.value > 127)
                    throw new Error('CC value must be between 0 & 127');
                channelObj.controlValues[controlChange.controller] = controlChange.value;
                if (!!channelObj.onControlChange)
                    channelObj.onControlChange(controlChange, channelObj.target);
                return true;
            }
        }

        else if (messageType == 'shimi.PitchBendMessage') {
            const pitchBend = message as messages.PitchBendMessage;
            const channelObj = this._channels[pitchBend.channel];
            if (channelObj)
                return channelObj.onPitchBend(pitchBend);
        }
        
        return false;
    }


    /**
     * Sends a raw byte-array MIDI message
     * @param data An array of the data to be sent.
     */
    sendRawData(data: number[]): boolean {
        if (data.length == 0)
            return;

        const messageId = Math.floor(data[0] / 16) * 16;
        const channel = data[0] - messageId;
        if (messageId == 0x80)
            return this.sendMessage(new messages.NoteOffMessage(data[1], data[2], channel));
        else if (messageId == 0x90)
            return this.sendMessage(new messages.NoteOnMessage(data[1], data[2], channel));
        else if (messageId == 0xB0)
            return this.sendMessage(new messages.ControlChangeMessage(data[1], data[2], channel));

        return false;
    }

    //IMidiOut implementation end


    //IClockChild implementation start

    /**
     * This method is intended to be called by a clock to provide regular updates. It should be called by consumers of the library.
     * @param deltaMs How many milliseconds have passed since the last update cycle.
     * @returns 
     */
    update(deltaMs: number): void {
        let anyNotesStopped = false;

        for (let i = 0; i < this._notes.length; i++) {
            const note = this._notes[i];
            if (!note.on) {
                if (note.onTracker.isDirty) {
                    let sendNoteOff = true;
                    const channelObj = this._channels[note.channel];
                    if (channelObj) {
                        for (let j = i + 1; j < this.notes.length; j++) {
                            const note2 = this.notes[j];
                            if (note.channel == note2.channel && note2.on && !note2.onTracker.isDirty) {
                                if (!channelObj.isPolyphonic || note.pitch == note2.pitch) {
                                    sendNoteOff = false;
                                    break;
                                }
                            }
                        }
                    }
                    if (sendNoteOff)
                        channelObj.onNoteStop(note);
                    note.onTracker.accept();
                }
                anyNotesStopped = true;
            }
        }

        if (anyNotesStopped)
            this._notes = this._notes.filter(n => n.on);
    }

    /** Returns true if the clip player has finished playing its clip. */
    get isFinished(): boolean { return this._isFinished; }
    private _isFinished: boolean = false;

    /** This event fires when the clip player finishes. */
    get finished(): ClockChildFinishedEvent { return this._finished; }
    private _finished: ClockChildFinishedEvent = new ClockChildFinishedEvent();

    /** Calling this tells the clip player to stop whatever it's doing and that it will no longer be used. */
    finish(): void {
        this._isFinished = true;
        this.stopNotes();
        this.finished.trigger(new ClockChildFinishedEventData(this));
    }

    /** Provides a way of identifying a clip player so that it can be easily retrieved later. */
    get ref(): string { return this._ref; }
    set ref(value: string) { this._ref = value; }
    private _ref: string;

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

    //IClockChild implementation end
}