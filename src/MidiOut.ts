'use strict';

import { IClockChild } from './Clock';
import Note from './Note';
import { IMidiMessage, NoteOffMessage, NoteOnMessage, NotePressureMessage } from './MidiMessages';


/**
 * The MidiOut class is an implementation of IMidiOut, which takes MIDI messages and sends them on to a connected MIDI port.
 * 
 * @category Midi IO
 */
export default class MidiOut implements IMidiOut, IClockChild {
    /** The MIDI Out port which data gets sent to, see MidiAccess class. */
    port: any;
    
    /**
     * The notes collection consists of notes which have been started, but not ended yet.
     * 
     * The MidiOut will cycle through this collection on each update, checking to see if it needs to send out Note Off messages for any, or update note pressure.
     */
    get notes(): Array<Note> { return this._notes; }
    private _notes: Array<Note> = [];

    /** Provides a way of identifying MidiOut so it can be easily retrieved later. */
    get ref(): string { return this._ref; }
    set ref(value: string) { this._ref = value; }
    private _ref: string;

    /** Returns true if the MidiOut has been instructed to stop everything by the `finish()` method. */
    get finished(): boolean { return this._finished; }
    private _finished: boolean = false;

    /**
     * Whenever the MidiOut attempts to send MIDI data, it does some validation that there is a MIDI port actually connected. If not then it throws an error.
     * 
     * Setting this property to true means that the MidiOut bypasses throwing that error. This can be useful when the MidiOut may regularly be switching outputs that it sends data to, and that it may be valid for it to not be connected to a port at times.
     */
    suppressPortValidationErrors: boolean = false;

    /**
     * @param port The MIDI Out port which data gets sent to, see MidiAccess class.
     */
    constructor(port: any) {
        this.port = port;
    }

    /** Calling this tells the MidiOut to stop whatever it's doing and that it will no longer be used. */
    finish(): void {
        this._finished = true;
        this.stopNotes(n => true);
    }

    /**
     * Adds a new note to the MidiOut's collection, returning the note that was added.
     * 
     * If `note.on == true`, then the the MidiOut immediately sends a Note On message to the connected port.
     * @param note The note to add to the MidiOut.
     * @returns 
     */
    addNote(note: Note): Note {
        this._notes.push(note);
        if (note.on) {
            this.sendMessage(new NoteOnMessage(note.pitch, note.velocity, note.channel));
            note.onTracker.accept();
        }
        return note;
    }

    /**
     * Calls the stop() method of all notes which have been added to the MidiOut that meet the passed in criteria.
     * @param filter The criteria for determining which notes need to be stopped.
     */
    stopNotes(filter: (note: Note) => boolean): void {
        for (const n of this._notes) {
            if (filter(n))
                n.stop();
        }
    }

    /**
     * This method accepts an IMidiMessage object, which it converts to a MIDI byte array to send to the connected MIDI port.
     * @param message The IMidiMessage object to be converted and sent out.
     * @returns 
     */
    sendMessage(message: IMidiMessage): boolean {
        if (!this.validatePort())
            return false;
        this.port.send(message.toArray());
        return true;
    }

    /**
     * Sends a raw byte-array MIDI message to the connected MIDI port.
     * @param data An array of the data to be sent.
     */
    sendRawData(data: number[]): boolean {
        if (!this.validatePort())
            return false;
        if (!data || data.length === 0)
            throw new Error('No data specified to send');
        this.port.send(data);
        return true;
    }

    private validatePort(): boolean {
        if (!this.port) {
            if (this.suppressPortValidationErrors)
                return false;
            throw new Error('MidiOut has no port connected');
        }
        return true;
    }

    /**
     * This method is intended to be called by a clock to provide regular updates. It should be called by consumers of the library.
     * @param deltaMs How many milliseconds have passed since the last update cycle.
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
                        this.sendMessage(new NoteOffMessage(note.pitch, note.velocity, note.channel));
                    note.onTracker.accept();
                }
                anyNotesStopped = true;
            }
        }

        //Send on/pressure change events for changed notes
        for (const note of this._notes) {
            if (note.on) {
                if (note.onTracker.isDirty) {
                    this.sendMessage(new NoteOnMessage(note.pitch, note.velocity, note.channel));
                    note.onTracker.accept();
                    note.velocityTracker.accept();
                }
                else if (note.velocityTracker.isDirty) {
                    this.sendMessage(new NotePressureMessage(note.pitch, note.velocity, note.channel));
                    note.velocityTracker.accept();
                }
            }
        }

        if (anyNotesStopped)
            this._notes = this._notes.filter(n => n.on);
    }
}


/**
 * IMidiOut defines an interface for any MIDI object which other shimi objects can send data to, for that data to be converted to valid MIDI messages and sent out.
 * 
 * @category Midi IO
 */
export interface IMidiOut {
    /**
     * This defines the collection of note objects which are in the process of being sent by the MIDI out.
     */
    get notes(): Array<Note>;

    /**
     * The addNote method adds a new note to begin being sent by the MIDI out.
     */
    addNote(note: Note): Note;

    /**
     * The stopNotes method allows for stopping any number of notes currently being sent by the MIDI out.
     * @param filter The filter parameter is a function that runs against each note on the MIDI out. Notes for which the function returns true are stopped.
     */
    stopNotes(filter: (note: Note) => boolean): void;

    /**
     * The sendMessage method allows sending individual messages. This is not recommended to be used for note messages, though still supported. Its primary use is for control changes, bend messages, etc.
     */
    sendMessage(message: IMidiMessage): void;

    /**
     * 
     * @param data The data parameter should be a MIDI-compliant byte-array, see here for more information [Summary of MIDI 1.0 Messages](https://www.midi.org/specifications-old/item/table-1-summary-of-midi-message).
     */
    sendRawData(data: number[]): void;
}