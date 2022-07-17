'use strict';

import { IClockChild } from './Clock';
import { IMidiMessage } from './MidiMessages';
import { IMidiOut } from './MidiOut';
import Note from './Note';
import * as messages from './MidiMessages';


/** 
 * IWebSynthChannel defines an interface for how to play notes on a specific channel of the WebSynth.
 * 
 * @category Midi IO
 */
export interface IWebSynthChannel {
    /**
     * This method gets called whenever a new note is to be played on one of the WebSynth's channels.
     * 
     * It is expected to return an array of one or more osciallators for each note to be played on the channel.
     * @param note This is the note that is due to begin being played.
     * @param frequency This is the frequency of the note being played.
     */
    createOscillators(note: Note, frequency: number): Array<OscillatorNode>;
}

/**
 * The default implementation of IWebSynthChannel. This allows for creation of simple sine, square, triangle & sawtooth waves.
 * 
 * @category Midi IO
 */
export class WebSynthChannel {
    /** The AudioContext instance which the synth channel is operating within. */
    audioContext: AudioContext;

    /** The GainNode used for setting the loudness of notes. */
    gain: GainNode;

    /** The type of waveform being produced, valid values are: 'sine', 'square', 'triangle', or 'sawtooth'. */
    type: any;

    /**
     * @param audioContext The AudioContext instance which the synth channel is operating within.
     * @param type The type of waveform being produced, valid values are: 'sine', 'square', 'triangle', or 'sawtooth'.
     */
    constructor(audioContext: AudioContext, type: any) {
        this.audioContext = audioContext;
        this.type = type;
        this.gain = audioContext.createGain();
        this.gain.gain.value = 0.1;
        this.gain.connect(this.audioContext.destination);
    }

    /**
     * This method gets called whenever a new note is to be played on the synth channel.
     * 
     * It returns an array containing a single OscillatorNode instance.
     * @param note This is the note that is due to begin being played.
     * @param frequency This is the frequency of the note being played.
     */
    createOscillators(note: Note, frequency: number): Array<OscillatorNode> {
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = this.type;
        oscillator.connect(this.gain);
        oscillator.frequency.value = frequency;
        oscillator.start();
        return [oscillator];
    };
}


/** 
 * The WebSynth class is a very simple synthesizer implementation, built on top of the Web Audio API. In its current form, it is not intended to be used for producing particularly rich, musical sounds, but instead just as a way to be able to easily get some sound out from shimi without having to rely on an external device or piece of software for playback.
 * 
 * The WebSynth class implements the IMidiOut interface, so that you can very easily swap out the WebSynth for external devices as and when needed.
 * 
 * @category Midi IO
 */
export default class WebSynth implements IMidiOut, IClockChild {
    private _audioContext: AudioContext;
    /** The AudioContext instance which the WebSynth is operating within. */
    get audioContext() { return this._audioContext; }
    
    private _channels: Array<IWebSynthChannel> = [
        null,null,null,null,
        null,null,null,null,
        null,null,null,null,
        null,null,null,null
    ];

    /**
     * @param audioContext The AudioContext instance which the WebSynth is operating within.
     * Example: `new shimi.WebSynth(new AudioContext());`
     */
    constructor(audioContext: AudioContext) {
        this._audioContext = audioContext;
    }

    /**
     * Define an IWebSynthChannel object to use for a specific MIDI channel number.
     * @param channelNumber The channel being defined, valid values range from 0 - 15.
     * @param channelImplementation The implementation of IWebSynthChannel to apply to the specified channel number.
     * @returns Returns the WebSynth instance, to allow for chaining of operations.
     */
    withChannel(channelNumber: number, channelImplementation: IWebSynthChannel): WebSynth {
        this._channels[channelNumber] = channelImplementation;
        return this;
    }

    /**
     * Defines all undefined channels with instances of WebSynthChannel.
     * It cycles through defining each channel with sine, square, sawtooth & triangle wave in turn, so that channels, 0, 4, 8 & 12 would be sine, 1, 5, 9 & 13 would be square, etc.
     * 
     * Example usage:
     * const synth = new shimi.WebSynth(new AudioContext()).withDefaultChannels();
     * @returns Returns the WebSynth instance, to allow for chaining of operations.
     */
    withDefaultChannels(): WebSynth {
        const types = ['sine', 'square', 'sawtooth', 'triangle'];
        for (let i = 0; i < 16; i++) {
            if (!this._channels[i])
                this._channels[i] = new WebSynthChannel(this.audioContext, types[i % 4]);
        }
        return this;
    }


    //IMidiOut implementation start

    /**
     * The notes collection consists of notes which have been started, but not ended yet.
     * 
     * The WebSynth will cycle through this collection on each update, checking to see if it needs to stop the playback of any notes.
     */
    get notes(): Array<Note> { return this._notes; }
    private _notes: Array<Note> = [];

    /**
     * Adds a new note to the WebSynth's collection, returning the note that was added.
     * 
     * If `note.on == true`, then the the WebSynth immediately starts up new oscillators for it.
     * @param note The note to add to the WebSynth.
     * @returns 
     */
    addNote(note: Note): Note {
        this._notes.push(note);
        if (note.on) {
            this._createOscillator(note);
            note.onTracker.accept();
        }
        return note;
    }

    /**
     * Calls the stop() method of all notes which have been added to the WebSynth that meet the passed in criteria.
     * @param filter The criteria for determining which notes need to be stopped.
     */
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

    /**
     * This method accepts an IMidiMessage object, which it interprets and performs the appropriate action. Currently this only supports Note On & Note Off messages.
     * @param message The IMidiMessage object to be acted upon.
     * @returns 
     */
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

    /**
     * Receives a byte-array representation of a MIDI message. The method interprets the message into an IMidiMessage object, and calls the `WebSynth.sendMessage` method with it.
     * @param data An array of the data to be sent to the synth.
     */
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

    /** Provides a way of identifying WebSynth so it can be easily retrieved later */
    get ref(): string { return this._ref; }
    set ref(value: string) { this._ref = value; }
    private _ref: string;

    /** Returns true if the WebSynth has been instructed to stop everything by the `finish()` method. */
    get finished(): boolean { return this._finished; }
    private _finished: boolean = false;

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
                    for (const osc of note['oscillators'])
                        osc.stop();
                    delete note['oscillators'];
                    note.onTracker.accept();
                }
                anyNotesStopped = true;
            }
        }

        if (anyNotesStopped)
            this._notes = this._notes.filter(n => n.on);
    }

    /** Calling this tells the WebSynth to stop whatever it's doing and that it will no longer be used. */
    finish(): void {
        this.stopNotes(n => true);
        this._finished = true;
    }

    //IClockChild implementation end


    private _pitchToFrequency(pitch: number) {
        return Math.pow(2, ((pitch - 69) / 12)) * 440;
    }

    private _createOscillator(note: Note) {
        const channel = this._channels[note.channel];
        note['oscillators'] = channel.createOscillators(note, this._pitchToFrequency(note.pitch));
    }
}