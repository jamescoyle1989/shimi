'use strict';

import { IMidiMessage } from './MidiMessages';
import { IMidiOut } from './MidiOut';
import Note from './Note';
import { toHertz } from './utils';
import * as messages from './MidiMessages';



/**
 * The ToneJSMidiOutChannel class represents one particular MIDI channel within the ToneJSMidiOut. It holds a reference to a ToneJS instrument object, and handles the conversion from received MIDI messages into actions to perform on the ToneJS instrument.
 * 
 * @category Midi IO
 */
export class ToneJSMidiOutChannel {
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
     * This property is null by default, but can take a function value which gets called every time the channel receives a new control change message.
     */
    onControlChange: (controlChange: messages.ControlChangeMessage, target: any) => void = null;
}



/**
 * The ToneJSMidiOut implements the IMidiOut, and provides an integration with the ToneJS javascript library. This allows for MIDI data coming from shimi to control sound generation in the browser by ToneJS.
 * 
 * @category Midi IO
 */
export default class ToneJSMidiOut implements IMidiOut {
    
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
                    const channelObj = this._channels[note.channel];
                    if (channelObj)
                        channelObj.onNoteStop(note);
                    note.onTracker.accept();
                }
                anyNotesStopped = true;
            }
        }

        if (anyNotesStopped)
            this._notes = this._notes.filter(n => n.on);
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
        if (message instanceof messages.NoteOffMessage) {
            this.stopNotes(n => n.pitch == message.pitch && n.channel == message.channel);
            return true;
        }
        else if (message instanceof messages.NoteOnMessage)
            return !!this.addNote(new Note(message.pitch, message.velocity, message.channel));

        else if (message instanceof messages.ControlChangeMessage) {
            const channelObj = this._channels[message.channel];
            if (channelObj) {
                if (message.controller < 0 || message.controller > 127)
                    throw new Error('CC control must be between 0 & 127');
                if (message.value < 0 || message.value > 127)
                    throw new Error('CC value must be between 0 & 127');
                channelObj.controlValues[message.controller] = message.value;
                if (!!channelObj.onControlChange)
                    channelObj.onControlChange(message, channelObj.target);
                return true;
            }
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
}