'use strict';

import { IClockChild } from './Clock';
import { IMidiMessage } from './MidiMessages';
import { IMidiOut } from './MidiOut';
import Note from './Note';


class WebSynthChannel {
    audioContext: AudioContext;
    gain: GainNode;

    constructor(audioContext: AudioContext) {
        this.audioContext = audioContext;
        this.gain = audioContext.createGain();
        this.gain.gain.value = 0.1;
        this.gain.connect(this.audioContext.destination);
    }

    createOscillator(note, frequency): OscillatorNode {
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sawtooth';
        oscillator.connect(this.gain);
        oscillator.frequency.value = 440;
        oscillator.start();
        return oscillator;
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
                n['oscillator'].stop();
                delete n['oscillator'];
                n.stop();
            }
        }
        this._notes = this._notes.filter(n => n.on);
    }

    sendMessage(message: IMidiMessage): void {

    }

    sendRawData(data: number[]): void {
        
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
                        note['oscillator'].stop();
                        delete note['oscillator'];
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
        note['oscillator'] = channel.createOscillator(note, this._pitchToFrequency(note.pitch));
    }
}