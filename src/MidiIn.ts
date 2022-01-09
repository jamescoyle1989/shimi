'use strict';

import * as messages from './MidiMessages';
import ShimiEvent, { ShimiEventData } from './ShimiEvent';


export class MidiInEventData<TMessage> extends ShimiEventData<IMidiIn> {
    get message(): TMessage { return this._message; }
    private _message: TMessage;
    
    constructor(source: IMidiIn, message: TMessage) {
        super(source);
        this._message = message;
    }
}


export class MidiInEvent<TMessage> extends ShimiEvent<MidiInEventData<TMessage>, IMidiIn> {
}


export default class MidiIn {
    /** The MIDI port which data gets received from, see MidiAccess class */
    port: any;

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

    constructor(port: any) {
        this.port = port;
        port.onmidimessage = (message) => this._receiveMessage(message);
    }

    //Used for handling running status messages
    private _previousStatus: number = null;

    private _receiveMessage(message: any): void {
        this.receiveData(message.data);
    }

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
}


export interface IMidiIn {
    receiveData(data: number[]): void;

    get noteOff(): MidiInEvent<messages.NoteOffMessage>;
    get noteOn(): MidiInEvent<messages.NoteOnMessage>;
    get notePressure(): MidiInEvent<messages.NotePressureMessage>;
    get controlChange(): MidiInEvent<messages.ControlChangeMessage>;
    get programChange(): MidiInEvent<messages.ProgramChangeMessage>;
    get channelPressure(): MidiInEvent<messages.ChannelPressureMessage>;
    get pitchBend(): MidiInEvent<messages.PitchBendMessage>;
}