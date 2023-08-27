'use strict';

import { ClockChildFinishedEvent, ClockChildFinishedEventData, IClockChild } from './Clock';
import { IMidiMessage } from './MidiMessages';
import { IMidiOut } from './MidiOut';
import Note from './Note';
import * as messages from './MidiMessages';
import { toHertz } from './utils';


/**
 * Represents a single channel within the WebAudioMidiOut. This allows for creation of simple sine, square, triangle & sawtooth waves.
 * 
 * @category Midi IO
 */
export class WebAudioMidiOutChannel {
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.WebAudioMidiOutChannel'; }

    /** The AudioContext instance which the synth channel is operating within. */
    audioContext: AudioContext;

    /** The GainNode used for setting the loudness of notes. */
    private _gainNode: GainNode;

    /** The numeric value of the amount of gain being applied to each note. */
    get gain(): number { return this._gainNode.gain.value; }
    set gain(value: number) { this._gainNode.gain.value = value; }

    /** The type of waveform being produced, valid values are: 'sine', 'square', 'triangle', or 'sawtooth'. */
    type: any;

    /**
     * @param audioContext The AudioContext instance which the synth channel is operating within.
     * @param type The type of waveform being produced, valid values are: 'sine', 'square', 'triangle', or 'sawtooth'.
     * @param gain The amount of gain to be applied to the waveform. Default value is 0.1.
     */
    constructor(audioContext: AudioContext, type: any, gain: number = 0.1) {
        this.audioContext = audioContext;
        this.type = type;
        this._gainNode = audioContext.createGain();
        this._gainNode.gain.value = gain;
        this._gainNode.connect(this.audioContext.destination);
    }

    /**
     * This method gets called whenever a new note is to be played on the synth channel.
     * 
     * It returns a new OscillatorNode instance.
     * @param note This is the note that is due to begin being played.
     * @param frequency This is the frequency of the note being played.
     */
    createOscillator(frequency: number): OscillatorNode {
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = this.type;
        oscillator.connect(this._gainNode);
        oscillator.frequency.value = frequency;
        oscillator.start();
        return oscillator;
    };
}


/** 
 * The WebAudioMidiOut class is a very simple synthesizer implementation, built on top of the Web Audio API. It is intended to primarily be a quick and dirty way to get some sound out through the web browser. For more advanced sound generation, use either the ToneJSMidiOut for in-browser sounds, or MidiOut for working with external instruments.
 * 
 * The WebAudioMidiOut class implements the IMidiOut interface, so that you can very easily swap out the WebAudioMidiOut for external devices as and when needed.
 * 
 * @category Midi IO
 */
export default class WebAudioMidiOut implements IMidiOut, IClockChild {
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.WebAudioMidiOut'; }

    private _audioContext: AudioContext;
    /** The AudioContext instance which the WebAudioMidiOut is operating within. */
    get audioContext() { return this._audioContext; }
    
    private _channels: Array<WebAudioMidiOutChannel> = [
        null,null,null,null,
        null,null,null,null,
        null,null,null,null,
        null,null,null,null
    ];

    /**
     * @param audioContext The AudioContext instance which the WebAudioMidiOut is operating within.
     * Example: `new shimi.WebAudioMidiOut(new AudioContext());`
     */
    constructor(audioContext: AudioContext) {
        this._audioContext = audioContext;
    }

    /**
     * Define what sound to use for a specific MIDI channel number.
     * @param channelNumber The channel being defined, valid values range from 0 - 15.
     * @param type The type of waveform being produced, valid values are: 'sine', 'square', 'triangle', or 'sawtooth'.
     * @param gain The amount of gain to be applied to the waveform. Default value is 0.1.
     * @returns Returns the WebAudioMidiOut instance, to allow for chaining of operations.
     */
    withChannel(channelNumber: number, type: any, gain: number = 0.1): WebAudioMidiOut {
        this._channels[channelNumber] = new WebAudioMidiOutChannel(this._audioContext, type, gain);
        return this;
    }

    /**
     * Automatically sets up all undefined channels with default sounds.
     * It cycles through defining each channel with sine, square, sawtooth & triangle wave in turn, so that channels, 0, 4, 8 & 12 would be sine, 1, 5, 9 & 13 would be square, etc.
     * 
     * Example usage:
     * const synth = new shimi.WebAudioMidiOut(new AudioContext()).withDefaultChannels();
     * @returns Returns the WebAudioMidiOut instance, to allow for chaining of operations.
     */
    withDefaultChannels(): WebAudioMidiOut {
        const types = ['sine', 'square', 'sawtooth', 'triangle'];
        for (let i = 0; i < 16; i++) {
            if (!this._channels[i])
                this._channels[i] = new WebAudioMidiOutChannel(this.audioContext, types[i % 4]);
        }
        return this;
    }


    //IMidiOut implementation start

    /**
     * The notes collection consists of notes which have been started, but not ended yet.
     * 
     * The WebAudioMidiOut will cycle through this collection on each update, checking to see if it needs to stop the playback of any notes.
     */
    get notes(): Array<Note> { return this._notes; }
    private _notes: Array<Note> = [];

    /**
     * Adds a new note to the WebAudioMidiOut's collection, returning the note that was added.
     * 
     * If `note.on == true`, then the the WebAudioMidiOut immediately starts up new oscillators for it.
     * @param note The note to add to the WebAudioMidiOut.
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
     * Calls the stop() method of all notes which have been added to the WebAudioMidiOut that meet the passed in criteria.
     * @param filter The criteria for determining which notes need to be stopped. If no filter provided, then all notes are stopped.
     */
    stopNotes(filter?: (note: Note) => boolean): void {
        for (const n of this._notes) {
            if (!filter || filter(n)) {
                n['oscillator'].stop();
                delete n['oscillator'];
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
        const messageType = message.typeName;
        if (messageType == 'shimi.NoteOffMessage') {
            const noteOff = message as messages.NoteOffMessage;
            this.stopNotes(n => n.pitch == noteOff.pitch && n.channel == noteOff.channel);
        }

        else if (messageType == 'shimi.NoteOnMessage') {
            const noteOn = message as messages.NoteOnMessage;
            const note = new Note(noteOn.pitch, noteOn.velocity, noteOn.channel);
            this.addNote(note);
        }
    }

    //Used for handling running status messages
    private _previousStatus: number = null;

    /**
     * Receives a byte-array representation of a MIDI message. The method interprets the message into an IMidiMessage object, and calls the `WebAudioMidiOut.sendMessage` method with it.
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

    /** Provides a way of identifying a WebAudioMidiOut so it can be easily retrieved later */
    get ref(): string { return this._ref; }
    set ref(value: string) { this._ref = value; }
    private _ref: string;

    /** Returns true if the WebAudioMidiOut has been instructed to stop everything by the `finish()` method. */
    get isFinished(): boolean { return this._isFinished; }
    private _isFinished: boolean = false;

    /** This event fires when the WebAudioMidiOut finishes. */
    get finished(): ClockChildFinishedEvent { return this._finished; }
    private _finished: ClockChildFinishedEvent = new ClockChildFinishedEvent();

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
                    note['oscillator'].stop();
                    delete note['oscillator'];
                    note.onTracker.accept();
                }
                anyNotesStopped = true;
            }
        }

        if (anyNotesStopped)
            this._notes = this._notes.filter(n => n.on);
    }

    /** Calling this tells the WebAudioMidiOut to stop whatever it's doing and that it will no longer be used. */
    finish(): void {
        this.stopNotes(n => true);
        this._isFinished = true;
        this.finished.trigger(new ClockChildFinishedEventData(this));
    }

    /**
     * Provides a way for setting the ref through a chained function call. For example:
     * 
     * ```
     * clock.addChild(new WebAudioMidiOut(context).withDefaultChannels().withRef('output'));
     * ```
     * 
     * @param ref The ref to set on the object.
     * @returns The calling object.
     */
    withRef(ref: string): IClockChild {
        this._ref = ref;
        return this;
    }

    //IClockChild implementation end

    private _createOscillator(note: Note) {
        const channel = this._channels[note.channel];
        note['oscillator'] = channel.createOscillator(toHertz(note.pitch));
    }
}