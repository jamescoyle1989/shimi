'use strict';

import { IClockChild } from './Clock';
import Note from './Note';
import { IMidiMessage, NoteOffMessage, NoteOnMessage, NotePressureMessage } from './MidiMessages';

export default class MidiOut implements IMidiOut, IClockChild {
    /** The MIDI port which data gets sent to, see MidiAccess class */
    port: any;
    
    /** List of notes being managed by the output */
    get notes(): Array<Note> { return this._notes; }
    private _notes: Array<Note> = [];

    /** Provides a way of identifying MidiOut so it can be retrieved later */
    get ref(): string { return this._ref; }
    /** Provides a way of identifying MidiOut so it can be retrieved later */
    set ref(value: string) { this._ref = value; }
    private _ref: string;

    get finished(): boolean { return this._finished; }
    private _finished: boolean = false;

    suppressPortValidationErrors: boolean = false;

    constructor(port: any) {
        this.port = port;
    }

    finish(): void {
        this._finished = true;
        this.stopNotes(n => true);
    }

    addNote(note: Note): Note {
        this._notes.push(note);
        if (note.on) {
            this.sendMessage(new NoteOnMessage(note.pitch, note.velocity, note.channel));
            note.onTracker.accept();
        }
        return note;
    }

    stopNotes(filter: (note: Note) => boolean): void {
        for (const n of this._notes) {
            if (filter(n))
                n.stop();
        }
    }

    /** Sends data from the passed in MIDI message to the connected MIDI port */
    sendMessage(message: IMidiMessage): boolean {
        if (!this.validatePort())
            return false;
        this.validatePort();
        this.port.send(message.toArray());
        return true;
    }

    /**
     * Sends a custom MIDI message to the connected MIDI port
     * @param data An array of the data to be sent
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


export interface IMidiOut {
    get notes(): Array<Note>;

    addNote(note: Note): Note;

    stopNotes(filter: (note: Note) => boolean): void;

    sendMessage(message: IMidiMessage): void;

    sendRawData(data: number[]): void;
}