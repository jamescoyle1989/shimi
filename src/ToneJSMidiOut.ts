'use strict';

import { IMidiMessage } from './MidiMessages';
import { IMidiOut } from './MidiOut';
import Note from './Note';
import { toHertz } from './utils';
import * as messages from './MidiMessages';



export class ToneJSMidiOutChannel {
    get target(): any { return this._target; }
    private _target: any;

    controlValues: Array<number>;

    get isPolyphonic(): boolean { return this._isPolyphonic; }
    private _isPolyphonic: boolean = false;
    
    constructor(target: any) {
        this._target = target;
        this.controlValues = Array(128).fill(0);
        if (target.name == 'Sampler' || target.name == 'PolySynth')
            this._isPolyphonic = true;
    }

    onNoteStart(note: Note) {
        if (this.target.name == 'NoiseSynth')
            this.target.triggerAttack(null, note.velocity / 127);
        else
            this.target.triggerAttack(toHertz(note.pitch), null, note.velocity / 127);
    }

    onNoteStop(note: Note) {
        if (this._isPolyphonic)
            this.target.triggerRelease(toHertz(note.pitch), null);
        else
            this.target.triggerRelease(null);
    }

    onControlChange: (controlChange: messages.ControlChangeMessage, target: any) => void = null;
}



export default class ToneJSMidiOut implements IMidiOut {
    get channels(): Array<ToneJSMidiOutChannel> { return this._channels; }
    private _channels: Array<ToneJSMidiOutChannel> = [
        null, null, null, null,
        null, null, null, null,
        null, null, null, null,
        null, null, null, null
    ];

    setChannel(channel: number, target: any) {
        if (channel < 0 || channel > 15)
            throw new Error('Channel must be numbered 0 - 15');

        if (target)
            this._channels[channel] = new ToneJSMidiOutChannel(target);
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