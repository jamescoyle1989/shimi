'use strict';

import { IClockChild } from './Clock';
import Note from './Note';
import * as messages from './MidiMessages';

export default class MidiOut implements IMidiOut, IClockChild {
    /** The MIDI port which data gets sent to, see MidiAccess class */
    port: any;
    
    /** List of notes being managed by the output */
    get notes(): Array<Note> { return this._notes; }
    private _notes: Array<Note> = [];

    get processes(): Array<IMidiOutChild> { return this._processes; }
    private _processes: Array<IMidiOutChild> = [];

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

    addProcess(process: IMidiOutChild): IMidiOutChild {
        this._processes.push(process);
        return process;
    }

    stopProcesses(filter: (process: IMidiOutChild) => boolean): void {
        for (const p of this._processes) {
            if (filter(p))
                p.finish(this);
        }
    }

    /**
     * Sends a Note Off message to the connected MIDI port
     */
    sendNoteOff(message: messages.NoteOffMessage): void {
        this.validatePort();
        const pitch = this.validateIntInRange(message.pitch, 0, 127, 'pitch');
        const velocity = this.validateIntInRange(message.velocity, 0, 127, 'velocity');
        const channel = this.validateIntInRange(message.channel, 0, 15, 'channel');
        this.port.send([0x80 + channel, pitch, velocity]);
    }

    /**
     * Sends a Note On message to the connected MIDI port
     */
    sendNoteOn(message: messages.NoteOnMessage): void {
        this.validatePort();
        const pitch = this.validateIntInRange(message.pitch, 0, 127, 'pitch');
        const velocity = this.validateIntInRange(message.velocity, 0, 127, 'velocity');
        const channel = this.validateIntInRange(message.channel, 0, 15, 'channel');
        this.port.send([0x90 + channel, pitch, velocity]);
    }

    /**
     * Sends a Polyphonic Key Pressure message to the connected MIDI port
     */
    sendNotePressure(message: messages.NotePressureMessage): void {
        this.validatePort();
        const pitch = this.validateIntInRange(message.pitch, 0, 127, 'pitch');
        const velocity = this.validateIntInRange(message.velocity, 0, 127, 'velocity');
        const channel = this.validateIntInRange(message.channel, 0, 15, 'channel');
        this.port.send([0xA0 + channel, pitch, velocity]);
    }

    /**
     * Sends a Control Change message to the connected MIDI port
     */
    sendControlChange(message: messages.ControlChangeMessage): void {
        this.validatePort();
        const controller = this.validateIntInRange(message.controller, 0, 127, 'controller');
        const value = this.validateIntInRange(message.value, 0, 127, 'value');
        const channel = this.validateIntInRange(message.channel, 0, 15, 'channel');
        this.port.send([0xB0 + channel, controller, value]);
    }

    /**
     * Sends a Program Change message to the connected MIDI port
     */
    sendProgramChange(message: messages.ProgramChangeMessage): void {
        this.validatePort();
        const program = this.validateIntInRange(message.program, 0, 127, 'program');
        const channel = this.validateIntInRange(message.channel, 0, 15, 'channel');
        this.port.send([0xC0 + channel, program]);
    }

    /**
     * Sends a Channel Pressure message to the connected MIDI port
     */
    sendChannelPressure(message: messages.ChannelPressureMessage): void {
        this.validatePort();
        const value = this.validateIntInRange(message.value, 0, 127, 'value');
        const channel = this.validateIntInRange(message.channel, 0, 15, 'channel');
        this.port.send([0xD0 + channel, value]);
    }

    /**
     * Sends a Pitch Bend Change message to the connected MIDI port
     */
    sendPitchBend(message: messages.PitchBendMessage): void {
        this.validatePort();
        const channel = this.validateIntInRange(message.channel, 0, 15, 'channel');
        const percent = message.percent;
        if (percent < -1)
            throw new Error('percent cannot be less than -1');
        if (percent > 1)
            throw new Error('percent cannot be greater than 1');
        const bendVal = Math.min(16383, this.validateIntInRange((message.percent * 8192) + 8192, 0, 16384, 'bend'));
        this.port.send([0xE0 + channel, bendVal % 128, Math.floor(bendVal / 128)]);
    }

    /**
     * Sends a custom MIDI message to the connected MIDI port
     * @param data An array of the data to be sent
     */
    sendRawData(data: number[]): void {
        this.validatePort();
        if (!data || data.length === 0)
            throw new Error('No data specified to send');
        this.port.send(data);
    }

    private validatePort(): void {
        if (!this.port)
            throw new Error('MidiOut has no port connected');
    }

    private validateIntInRange(value: number, min: number, max: number, name: string): number {
        value = Math.round(value);
        if (value < min)
            throw new Error(name + ' cannot be less than ' + min);
        if (value > max)
            throw new Error(name + ' cannot be greater than ' + max);
        return value;
    }

    update(deltaMs: number): void {
        let anyNotesStopped = false;

        for (const process of this.processes) {
            if (!process.finished)
                process.update(this, deltaMs);
        }
        this._processes = this._processes.filter(p => !p.finished);

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
                        this.sendNoteOff(new messages.NoteOffMessage(note.pitch, note.velocity, note.channel));
                    note.onTracker.accept();
                }
                anyNotesStopped = true;
            }
        }

        //Send on/pressure change events for changed notes
        for (const note of this._notes) {
            if (note.on) {
                if (note.onTracker.isDirty) {
                    this.sendNoteOn(new messages.NoteOnMessage(note.pitch, note.velocity, note.channel));
                    note.onTracker.accept();
                    note.velocityTracker.accept();
                }
                else if (note.velocityTracker.isDirty) {
                    this.sendNotePressure(new messages.NotePressureMessage(note.pitch, note.velocity, note.channel));
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

    addProcess(process: IMidiOutChild): IMidiOutChild;

    stopProcesses(filter: (process: IMidiOutChild) => boolean): void;

    sendNoteOff(message: messages.NoteOffMessage): void;

    sendNoteOn(message: messages.NoteOnMessage): void;

    sendNotePressure(message: messages.NotePressureMessage): void;

    sendControlChange(message: messages.ControlChangeMessage): void;

    sendProgramChange(message: messages.ProgramChangeMessage): void;

    sendChannelPressure(message: messages.ChannelPressureMessage): void;

    sendPitchBend(message: messages.PitchBendMessage): void;

    sendRawData(data: number[]): void;
}


export interface IMidiOutChild {
    get ref(): string;

    get finished(): boolean;

    update(midiOut: IMidiOut, deltaMs: number): void;

    finish(midiOut: IMidiOut): void;
}