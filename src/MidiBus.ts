'use strict';

import { IMidiIn, MidiInEvent, MidiInEventData } from './MidiIn';
import { IMidiOut } from './MidiOut';
import * as messages from './MidiMessages';
import Note from './Note';
import { IClockChild } from './Clock';


/**
 * The MidiBus is a combination of both MidiIn & MidiOut. It gets data passed to it through the methods & properties that it implements from the IMidiOut interface, and in turn, distributes that data through the events that it implements from the IMidiIn interface.
 * 
 * The typical use cases of this are when you want some common actions to be applied to MIDI data being generated from a number of different places within your shimi application. For example, you might have a number of different processes generating a number of different instrument parts, and want to make sure that simple pitch correction is applied to all parts. 
 * 
 * Rather than modify the logic of each separate process, you could instead have each process connect to a common MidiBus, then connect that MidiBus up to a MidiOut, and just insert pitch correction logic in that connection from MidiBus to MidiOut.
 * 
 * @category Midi IO
 */
export default class MidiBus implements IMidiIn, IMidiOut, IClockChild {
    /*  
        ----------------------
        IMidiIn implementation
        ----------------------
    */

    /** The noteOff property can be subscribed to, to receive all Note Off messages that pass through the MidiBus object. */
    get noteOff(): MidiInEvent<messages.NoteOffMessage> { return this._noteOff; }
    private _noteOff: MidiInEvent<messages.NoteOffMessage> = new MidiInEvent<messages.NoteOffMessage>();

    /** The noteOn property can be subscribed to, to receive all Note On messages that pass through the MidiBus object. */
    get noteOn(): MidiInEvent<messages.NoteOnMessage> { return this._noteOn; }
    private _noteOn: MidiInEvent<messages.NoteOnMessage> = new MidiInEvent<messages.NoteOnMessage>();

    /** The notePressure property can be subscribed to, to receive all Note Pressure messages that pass through the MidiBus object. */
    get notePressure(): MidiInEvent<messages.NotePressureMessage> { return this._notePressure; }
    private _notePressure: MidiInEvent<messages.NotePressureMessage> = new MidiInEvent<messages.NotePressureMessage>();

    /** The controlChange property can be subscribed to, to receive all Control Change messages that pass through the MidiBus object. */
    get controlChange(): MidiInEvent<messages.ControlChangeMessage> { return this._controlChange; }
    private _controlChange: MidiInEvent<messages.ControlChangeMessage> = new MidiInEvent<messages.ControlChangeMessage>();

    /** The programChange property can be subscribed to, to receive all Program Change messages that pass through the MidiBus object. */
    get programChange(): MidiInEvent<messages.ProgramChangeMessage> { return this._programChange; }
    private _programChange: MidiInEvent<messages.ProgramChangeMessage> = new MidiInEvent<messages.ProgramChangeMessage>();

    /** The channelPressure property can be subscribed to, to receive all Channel Pressure messages that pass through the MidiBus object. */
    get channelPressure(): MidiInEvent<messages.ChannelPressureMessage> { return this._channelPressure; }
    private _channelPressure: MidiInEvent<messages.ChannelPressureMessage> = new MidiInEvent<messages.ChannelPressureMessage>();

    /** The pitchBend property can be subscribed to, to receive all Pitch Bend messages that pass through the MidiBus object. */
    get pitchBend(): MidiInEvent<messages.PitchBendMessage> { return this._pitchBend; }
    private _pitchBend: MidiInEvent<messages.PitchBendMessage> = new MidiInEvent<messages.PitchBendMessage>();

    /** The tick property can be subscribed to, to receive all timing clock messages that pass through the MidiBus object. */
    get tick(): MidiInEvent<messages.TickMessage> { return this._tick; }
    private _tick: MidiInEvent<messages.TickMessage> = new MidiInEvent<messages.TickMessage>();

    /** The songPosition property can be subscribed to, to receive all Song Position messages that pass through the MidiBus object. */
    get songPosition(): MidiInEvent<messages.SongPositionMessage> { return this._songPosition; }
    private _songPosition: MidiInEvent<messages.SongPositionMessage> = new MidiInEvent<messages.SongPositionMessage>();

    private _previousStatus: number = null;

    receiveData(data: number[]): void {
        if (data.length == 0)
            return;

        if (data.length == 1 && data[0] == 0xF8) {
            this.tick.trigger(new MidiInEventData(this, new messages.TickMessage()));
            return;
        }
        
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
        else if (messageId == 0xF0) {
            if (channel == 2)
                this.songPosition.trigger(new MidiInEventData(this, new messages.SongPositionMessage((128 * data[2]) + data[1])));
        }
    }


    /*  
        -----------------------
        IMidiOut implementation
        -----------------------
    */
    
    /**
     * The notes collection consists of notes which have been started, but not ended yet.
     * 
     * The MidiBus will cycle through this collection on each update, checking to see if it needs to send out Note Offmessages for any, or update note pressure.
     */
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
        else if (message instanceof messages.TickMessage) this.tick.trigger(new MidiInEventData(this, message));
        else if (message instanceof messages.SongPositionMessage) this.songPosition.trigger(new MidiInEventData(this, message));
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
    /** Provides a way of identifying MidiBus so it can be easily retrieved later. */
    get ref(): string { return this._ref; }
    set ref(value: string) { this._ref = value; }
    private _ref: string;

    /** Returns true if the MidiBus has been instructed to stop everything by the `finish()` method. */
    get finished(): boolean { return this._finished; }
    private _finished: boolean = false;

    /** Calling this tells the MidiBus to stop whatever it's doing and that it will no longer be used. */
    finish(): void {
        this._finished = true;
        this.stopNotes(n => true);
    }

    /**
     * Provides a way for setting the ref through a chained function call. For example:
     * 
     * ```
     * clock.addChild(new MidiBus().withRef('bus'));
     * ```
     * 
     * @param ref The ref to set on the object.
     * @returns The calling object.
     */
    withRef(ref: string): IClockChild {
        this._ref = ref;
        return this;
    }

    /**
     * This method is intended to be called by a clock to provide regular updates. It should be called by consumers of the library.
     * @param msDelta How many milliseconds have passed since the last update cycle.
     * @returns 
     */
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