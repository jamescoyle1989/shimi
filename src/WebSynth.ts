'use strict';

import { IClockChild } from './Clock';
import { IMidiMessage } from './MidiMessages';
import { IMidiOut } from './MidiOut';
import Note from './Note';
import * as messages from './MidiMessages';


class WebSynthChannel {
    audioContext: AudioContext;
    gain: GainNode;

    constructor(audioContext: AudioContext) {
        this.audioContext = audioContext;
        this.gain = audioContext.createGain();
        this.gain.gain.value = 0.1;
        this.gain.connect(this.audioContext.destination);
    }

    createOscillators(note, frequency): Array<OscillatorNode> {
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sawtooth';
        oscillator.connect(this.gain);
        oscillator.frequency.value = 440;
        oscillator.start();
        return [oscillator];
    };
}


export default class WebSynth implements IMidiOut, IClockChild {
    channels: Array<WebSynthChannel> = [];

    constructor(audioContext: AudioContext) {
        for (let i = 0; i < 16; i++) {
            this.channels.push(new WebSynthChannel(audioContext));
        }
    }


    //IMidiOut implementation start

    get notes(): Array<Note> { return this._notes; }
    private _notes: Array<Note> = [];

    addNote(note: Note): Note {
        this._notes.push(note);
        if (note.on) {
            this._createOscillator(note);
            note.onTracker.accept();
        }
        return note;
    }

    stopNotes(filter: (note: Note) => boolean): void {
        for (const n of this._notes) {
            if (filter(n)) {
                for (const osc of n['oscillators'])
                    osc.stop();
                delete n['oscillators'];
                n.stop();
            }
        }
        this._notes = this._notes.filter(n => n.on);
    }

    sendMessage(message: IMidiMessage): void {
        if (message instanceof messages.NoteOffMessage) {
            this.stopNotes(n => n.pitch == message.pitch && n.channel == message.channel);
        }
        else if (message instanceof messages.NoteOnMessage) {
            const note = new Note(message.pitch, message.velocity, message.channel);
            this.addNote(note);
        }
    }

    //Used for handling running status messages
    private _previousStatus: number = null;

    sendRawData(data: number[]): void {
        if (data.length == 0 || data[0] == 0xF8)
            return;

        if (data[0] >= 128)
            this._previousStatus = data[0];
        else {
            if (this._previousStatus)
                data.unshift(this._previousStatus)
            else
                return;
        }

        const messageId = Math.floor(data[0] / 16) * 16;
        const channel = data[0] - messageId;
        if (messageId == 0x80)
            this.sendMessage(new messages.NoteOffMessage(data[1], data[2], channel));
        else if (messageId == 0x90)
            this.sendMessage(new messages.NoteOnMessage(data[1], data[2], channel));
        else if (messageId == 0xA0)
            this.sendMessage(new messages.NotePressureMessage(data[1], data[2], channel));
        else if (messageId == 0xB0)
            this.sendMessage(new messages.ControlChangeMessage(data[1], data[2], channel));
        else if (messageId == 0xC0)
            this.sendMessage(new messages.ProgramChangeMessage(data[1], channel));
        else if (messageId == 0xD0)
            this.sendMessage(new messages.ChannelPressureMessage(data[1], channel));
        else if (messageId == 0xE0)
            this.sendMessage(new messages.PitchBendMessage(messages.PitchBendMessage.calculatePercent(data[1], data[2]), channel));
    }

    //IMidiOut implementation end


    //IClockChild implementation start

    /** Provides a way of identifying WebSynth so it can be retrieved later */
    get ref(): string { return this._ref; }
    /** Provides a way of identifying WebSynth so it can be retrieved later */
    set ref(value: string) { this._ref = value; }
    private _ref: string;

    get finished(): boolean { return this._finished; }
    private _finished: boolean = false;

    update(deltaMs: number): void {
        let anyNotesStopped = false;

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
                    if (sendNoteOff) {
                        for (const osc of note['oscillators'])
                            osc.stop();
                        delete note['oscillators'];
                    }
                    note.onTracker.accept();
                }
                anyNotesStopped = true;
            }
        }

        if (anyNotesStopped)
            this._notes = this._notes.filter(n => n.on);
    }

    finish(): void {
    }

    //IClockChild implementation end


    private _pitchToFrequency(pitch: number) {
        return Math.pow(2, ((pitch - 69) / 12)) * 440;
    }

    private _createOscillator(note: Note) {
        const channel = this.channels[note.channel];
        note['oscillators'] = channel.createOscillators(note, this._pitchToFrequency(note.pitch));
    }
}