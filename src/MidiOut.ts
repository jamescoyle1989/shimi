'use strict';

import { IClockChild } from './Clock';
import Note from './Note';

export default class MidiOut implements IMidiOut, IClockChild {
    /** The MIDI port which data gets sent to, see MidiAccess class */
    port: any;
    
    /** List of notes being managed by the output */
    get notes(): Array<Note> { return this._notes; }
    private _notes: Array<Note> = [];

    constructor(port: any) {
        this.port = port;
    }

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

    sendNoteOff(pitch: number, velocity: number, channel: number): void {
        pitch = Math.round(pitch);
        velocity = this.intInRange(velocity, 0, 127);
        channel = Math.round(channel);
        if(!this.port || pitch < 0 || pitch > 127 || channel < 0 || channel > 15)
            return;
        this.port.send([0x80 + channel, pitch, velocity]);
    }

    sendNoteOn(pitch: number, velocity: number, channel: number): void {
        pitch = Math.round(pitch);
        velocity = this.intInRange(velocity, 0, 127);
        channel = Math.round(channel);
        if(!this.port || pitch < 0 || pitch > 127 || channel < 0 || channel > 15)
            return;
        this.port.send([0x90 + channel, pitch, velocity]);
    }

    sendNotePressure(pitch: number, velocity: number, channel: number): void {
        pitch = Math.round(pitch);
        velocity = this.intInRange(velocity, 0, 127);
        channel = Math.round(channel);
        if(!this.port || pitch < 0 || pitch > 127 || channel < 0 || channel > 15)
            return;
        this.port.send([0xA0 + channel, pitch, velocity]);
    }

    update(deltaMs: number): void {
        let anyNotesStopped = false;

        //Send off events for any stopped notes
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
                        this.sendNoteOff(note.pitch, note.velocity, note.channel);
                    note.onTracker.accept();
                }
                anyNotesStopped = true;
            }
        }

        //Send on/pressure change events for changed notes
        for (const note of this._notes) {
            if (note.on) {
                if (note.onTracker.isDirty) {
                    this.sendNoteOn(note.pitch, note.velocity, note.channel);
                    note.onTracker.accept();
                    note.velocityTracker.accept();
                }
                else if (note.velocityTracker.isDirty) {
                    this.sendNotePressure(note.pitch, note.velocity, note.channel);
                    note.velocityTracker.accept();
                }
            }
        }

        if (anyNotesStopped)
            this._notes = this._notes.filter(n => n.on);
    }

    private intInRange(value, min, max) {
        return Math.max(min, Math.min(max, Math.round(value)));
    }
}


export interface IMidiOut {
    get notes(): Array<Note>;

    addNote(note: Note): Note;

    stopNotes(filter: (note: Note) => boolean): void;

    sendNoteOff(pitch: number, velocity: number, channel: number): void;

    sendNoteOn(pitch: number, velocity: number, channel: number): void;

    sendNotePressure(pitch: number, velocity: number, channel: number): void;
}