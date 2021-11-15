'use strict';

import { IMidiIn, MidiInEvent, MidiInEventData } from './MidiIn';
import { IMidiOut } from './MidiOut';
import * as messages from './MidiMessages';
import Note from './Note';
import { IClockChild } from './Clock';


export default class MidiBus implements IMidiIn, IMidiOut, IClockChild {
    /*  
        ----------------------
        IMidiIn implementation
        ----------------------
    */
    get noteOff(): MidiInEvent<messages.NoteOffMessage> { return this._noteOff; }
    private _noteOff: MidiInEvent<messages.NoteOffMessage> = new MidiInEvent<messages.NoteOffMessage>();

    get noteOn(): MidiInEvent<messages.NoteOnMessage> { return this._noteOn; }
    private _noteOn: MidiInEvent<messages.NoteOnMessage> = new MidiInEvent<messages.NoteOnMessage>();

    get notePressure(): MidiInEvent<messages.NotePressureMessage> { return this._notePressure; }
    private _notePressure: MidiInEvent<messages.NotePressureMessage> = new MidiInEvent<messages.NotePressureMessage>();

    get controlChange(): MidiInEvent<messages.ControlChangeMessage> { return this._controlChange; }
    private _controlChange: MidiInEvent<messages.ControlChangeMessage> = new MidiInEvent<messages.ControlChangeMessage>();

    get programChange(): MidiInEvent<messages.ProgramChangeMessage> { return this._programChange; }
    private _programChange: MidiInEvent<messages.ProgramChangeMessage> = new MidiInEvent<messages.ProgramChangeMessage>();

    get channelPressure(): MidiInEvent<messages.ChannelPressureMessage> { return this._channelPressure; }
    private _channelPressure: MidiInEvent<messages.ChannelPressureMessage> = new MidiInEvent<messages.ChannelPressureMessage>();

    get pitchBend(): MidiInEvent<messages.PitchBendMessage> { return this._pitchBend; }
    private _pitchBend: MidiInEvent<messages.PitchBendMessage> = new MidiInEvent<messages.PitchBendMessage>();

    private _previousStatus: number = null;

    receiveData(data: number[]): void {
        //0xF8 = Timing clock message, in interests of speed am explicitly ignoring this message for now
        if (data.length == 0 || data[0] == 0xF8)
            return;
        
        if (data[0] >= 128)
            this._previousStatus = data[0];
        else {
            if (this._previousStatus)
                data.unshift(this._previousStatus);
            else
                return;
        }

        const messageId = Math.floor(data[0] / 16) * 16;
        const channel = data[0] - messageId;
        if (messageId == 0x80)
            this.noteOff.trigger(new MidiInEventData(this, new messages.NoteOffMessage(data[1], data[2], channel)));
        else if (messageId == 0x90)
            this.noteOn.trigger(new MidiInEventData(this, new messages.NoteOnMessage(data[1], data[2], channel)));
        else if (messageId == 0xA0)
            this.notePressure.trigger(new MidiInEventData(this, new messages.NotePressureMessage(data[1], data[2], channel)));
        else if (messageId == 0xB0)
            this.controlChange.trigger(new MidiInEventData(this, new messages.ControlChangeMessage(data[1], data[2], channel)));
        else if (messageId == 0xC0)
            this.programChange.trigger(new MidiInEventData(this, new messages.ProgramChangeMessage(data[1], channel)));
        else if (messageId == 0xD0)
            this.channelPressure.trigger(new MidiInEventData(this, new messages.ChannelPressureMessage(data[1], channel)));
        else if (messageId == 0xE0)
            this.pitchBend.trigger(new MidiInEventData(this, new messages.PitchBendMessage(messages.PitchBendMessage.calculatePercent(data[1], data[2]), channel)));
    }


    /*  
        -----------------------
        IMidiOut implementation
        -----------------------
    */
    /** List of notes being managed by the output */
    get notes(): Array<Note> { return this._notes; }
    private _notes: Array<Note> = [];

    addNote(note: Note): Note {
        this._notes.push(note);
        return note;
    }

    stopNotes(filter: (note: Note) => boolean): void {
        for (const n of this._notes) {
            if (filter(n))
                n.stop();
        }
    }

    /** Sends data from the passed in MIDI message to the connected MIDI port */
    sendMessage(message: messages.IMidiMessage): void {
        if (message instanceof messages.NoteOffMessage) this.noteOff.trigger(new MidiInEventData(this, message));
        else if (message instanceof messages.NoteOnMessage) this.noteOn.trigger(new MidiInEventData(this, message));
        else if (message instanceof messages.NotePressureMessage) this.notePressure.trigger(new MidiInEventData(this, message));
        else if (message instanceof messages.ControlChangeMessage) this.controlChange.trigger(new MidiInEventData(this, message));
        else if (message instanceof messages.ProgramChangeMessage) this.programChange.trigger(new MidiInEventData(this, message));
        else if (message instanceof messages.ChannelPressureMessage) this.channelPressure.trigger(new MidiInEventData(this, message));
        else if (message instanceof messages.PitchBendMessage) this.pitchBend.trigger(new MidiInEventData(this, message));
    }

    /**
     * Sends a custom MIDI message to the connected MIDI port
     * @param data An array of the data to be sent
     */
    sendRawData(data: number[]): void {
        if (!data || data.length === 0)
            throw new Error('No data specified to send');
        this.receiveData(data);
    }


    /*  
        -----------------------
        IClockChild implementation
        -----------------------
    */
    /** Provides a way of identifying MidiBus so it can be retrieved later */
    get ref(): string { return this._ref; }
    /** Provides a way of identifying MidiBus so it can be retrieved later */
    set ref(value: string) { this._ref = value; }
    private _ref: string;

    get finished(): boolean { return this._finished; }
    private _finished: boolean = false;

    finish(): void {
        this._finished = true;
        this.stopNotes(n => true);
    }

    update(deltaMs: number): void {
        let anyNotesStopped = false;

        //Send Note Off events for any stopped notes
        //Don't actually send the note off message if there is a more recent note that is still on
        for (let i = 0; i < this._notes.length; i++) {
            const note = this._notes[i];
            if (!note.on) {
                if (note.onTracker.isDirty) {
                    let sendNoteOff = true;
                    for (let j = i + 1; j < this.notes.length; j++) {
                        const note2 = this.notes[j];
                        if (note.pitch === note2.pitch && note.channel === note2.channel && note2.on && !note2.onTracker.isDirty) {
                            sendNoteOff = false;
                            break;
                        }
                    }
                    if (sendNoteOff)
                        this.sendMessage(new messages.NoteOffMessage(note.pitch, note.velocity, note.channel));
                    note.onTracker.accept();
                }
                anyNotesStopped = true;
            }
        }

        //Send on/pressure change events for changed notes
        for (const note of this._notes) {
            if (note.on) {
                if (note.onTracker.isDirty) {
                    this.sendMessage(new messages.NoteOnMessage(note.pitch, note.velocity, note.channel));
                    note.onTracker.accept();
                    note.velocityTracker.accept();
                }
                else if (note.velocityTracker.isDirty) {
                    this.sendMessage(new messages.NotePressureMessage(note.pitch, note.velocity, note.channel));
                    note.velocityTracker.accept();
                }
            }
        }

        if (anyNotesStopped)
            this._notes = this._notes.filter(n => n.on);
    }
}