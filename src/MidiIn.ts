'use strict';

import { IEventSubscriber } from './EventSubscriber';
import { ChannelPressureMessage, ControlChangeMessage, NoteOffMessage, NoteOnMessage, NotePressureMessage, PitchBendMessage, ProgramChangeMessage } from './MidiMessages';
import ShimiEvent, { ShimiEventData } from './ShimiEvent';


export class MidiInEventData<TMessage> extends ShimiEventData<MidiIn> {
    get message(): TMessage { return this._message; }
    private _message: TMessage;
    
    constructor(source: MidiIn, message: TMessage) {
        super(source);
        this._message = message;
    }
}


export class MidiInEvent<TMessage> extends ShimiEvent<MidiInEventData<TMessage>, MidiIn> {
}


export default class MidiIn {
    /** The MIDI port which data gets received from, see MidiAccess class */
    port: any;

    get noteOff(): MidiInEvent<NoteOffMessage> { return this._noteOff; }
    private _noteOff: MidiInEvent<NoteOffMessage> = new MidiInEvent<NoteOffMessage>();

    get noteOn(): MidiInEvent<NoteOnMessage> { return this._noteOn; }
    private _noteOn: MidiInEvent<NoteOnMessage> = new MidiInEvent<NoteOnMessage>();

    get notePressure(): MidiInEvent<NotePressureMessage> { return this._notePressure; }
    private _notePressure: MidiInEvent<NotePressureMessage> = new MidiInEvent<NotePressureMessage>();

    get controlChange(): MidiInEvent<ControlChangeMessage> { return this._controlChange; }
    private _controlChange: MidiInEvent<ControlChangeMessage> = new MidiInEvent<ControlChangeMessage>();

    get programChange(): MidiInEvent<ProgramChangeMessage> { return this._programChange; }
    private _programChange: MidiInEvent<ProgramChangeMessage> = new MidiInEvent<ProgramChangeMessage>();

    get channelPressure(): MidiInEvent<ChannelPressureMessage> { return this._channelPressure; }
    private _channelPressure: MidiInEvent<ChannelPressureMessage> = new MidiInEvent<ChannelPressureMessage>();

    get pitchBend(): MidiInEvent<PitchBendMessage> { return this._pitchBend; }
    private _pitchBend: MidiInEvent<PitchBendMessage> = new MidiInEvent<PitchBendMessage>();

    constructor(port: any) {
        this.port = port;
        port.onmidimessage = this._receiveMessage;
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
            this.noteOff.trigger(new MidiInEventData(this, new NoteOffMessage(data[1], data[2], channel)));
        else if (messageId == 0x90)
            this.noteOn.trigger(new MidiInEventData(this, new NoteOnMessage(data[1], data[2], channel)));
        else if (messageId == 0xA0)
            this.notePressure.trigger(new MidiInEventData(this, new NotePressureMessage(data[1], data[2], channel)));
        else if (messageId == 0xB0)
            this.controlChange.trigger(new MidiInEventData(this, new ControlChangeMessage(data[1], data[2], channel)));
        else if (messageId == 0xC0)
            this.programChange.trigger(new MidiInEventData(this, new ProgramChangeMessage(data[1], channel)));
        else if (messageId == 0xD0)
            this.channelPressure.trigger(new MidiInEventData(this, new ChannelPressureMessage(data[1], channel)));
        else if (messageId == 0xE0)
            this.pitchBend.trigger(new MidiInEventData(this, new PitchBendMessage(PitchBendMessage.calculatePercent(data[1], data[2]), channel)));
    }
}