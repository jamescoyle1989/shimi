'use strict';

import * as messages from './MidiMessages';
import ShimiEvent, { ShimiEventData } from './ShimiEvent';


/**
 * The MidiInEventData class extends ShimiEventData. It contains a reference to the source IMidiIn that created the event data, as well as information about a MIDI message that has been received.
 * 
 * @category Midi IO
 */
export class MidiInEventData<TMessage> extends ShimiEventData<IMidiIn> {
    /** The MIDI message that has been received. */
    get message(): TMessage { return this._message; }
    private _message: TMessage;
    
    constructor(source: IMidiIn, message: TMessage) {
        super(source);
        this._message = message;
    }
}


/**
 * The MidiInEvent class extends ShimiEvent, providing an object which can be subscribed to.
 * 
 * It distributes events which point back to the source IMidiIn, along with a MidiInEventData object that contains the event information.
 * 
 * @category Midi IO
 */
export class MidiInEvent<TMessage> extends ShimiEvent<MidiInEventData<TMessage>, IMidiIn> {
}


/**
 * The MidiIn class is an implementation of IMidiIn, which receives MIDI messages from a connected MIDI port and distributes in a more easily consumable format.
 * 
 * @category Midi IO
 */
export default class MidiIn implements IMidiIn {
    /**
     * The MIDI port which data gets received from, see the MidiAccess class.
     * 
     * Setting this property automatically unsubscribes from any previously connected MIDI port, and also automatically subscribes to the newly set MIDI port.
     */
    get port(): any { return this._port; }
    set port(value) {
        if (this._port)
            this._port.onmidimessage = undefined;
        this._port = value;
        if (this._port)
            this._port.onmidimessage = (message) => this._receiveMessage(message);
    }
    private _port: any;

    /** The noteOff property can be subscribed to, to receive all Note Off messages that pass through the MidiIn object. */
    get noteOff(): MidiInEvent<messages.NoteOffMessage> { return this._noteOff; }
    private _noteOff: MidiInEvent<messages.NoteOffMessage> = new MidiInEvent<messages.NoteOffMessage>();

    /** The noteOn property can be subscribed to, to receive all Note On messages that pass through the MidiIn object. */
    get noteOn(): MidiInEvent<messages.NoteOnMessage> { return this._noteOn; }
    private _noteOn: MidiInEvent<messages.NoteOnMessage> = new MidiInEvent<messages.NoteOnMessage>();

    /** The notePressure property can be subscribed to, to receive all Note Pressure messages that pass through the MidiIn object. */
    get notePressure(): MidiInEvent<messages.NotePressureMessage> { return this._notePressure; }
    private _notePressure: MidiInEvent<messages.NotePressureMessage> = new MidiInEvent<messages.NotePressureMessage>();

    /** The controlChange property can be subscribed to, to receive all Control Change messages that pass through the MidiIn object. */
    get controlChange(): MidiInEvent<messages.ControlChangeMessage> { return this._controlChange; }
    private _controlChange: MidiInEvent<messages.ControlChangeMessage> = new MidiInEvent<messages.ControlChangeMessage>();

    /** The programChange property can be subscribed to, to receive all Program Change messages that pass through the MidiIn object. */
    get programChange(): MidiInEvent<messages.ProgramChangeMessage> { return this._programChange; }
    private _programChange: MidiInEvent<messages.ProgramChangeMessage> = new MidiInEvent<messages.ProgramChangeMessage>();

    /** The channelPressure property can be subscribed to, to receive all Channel Pressure messages that pass through the MidiIn object. */
    get channelPressure(): MidiInEvent<messages.ChannelPressureMessage> { return this._channelPressure; }
    private _channelPressure: MidiInEvent<messages.ChannelPressureMessage> = new MidiInEvent<messages.ChannelPressureMessage>();

    /** The pitchBend property can be subscribed to, to receive all Pitch Bend messages that pass through the MidiIn object. */
    get pitchBend(): MidiInEvent<messages.PitchBendMessage> { return this._pitchBend; }
    private _pitchBend: MidiInEvent<messages.PitchBendMessage> = new MidiInEvent<messages.PitchBendMessage>();

    /**
     * @param port The MIDI port which data gets received from, see the MidiAccess class.
     */
    constructor(port?: any) {
        this.port = port;
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


/**
 * IMidiIn defines an interface for any MIDI object which other shimi objects can receive MIDI data from.
 * 
 * @category Midi IO
 */
export interface IMidiIn {
    /**
     * The receiveData method allows for raw MIDI message data to be passed in, which will then be analysed, and trigger an event for whichever MIDI event type it corresponds to.
     * 
     * @param data The data parameter should be a MIDI-compliant byte-array, see here for more information [Summary of MIDI 1.0 Messages](https://www.midi.org/specifications-old/item/table-1-summary-of-midi-message).
     */
    receiveData(data: number[]): void;

    /** The noteOff property can be subscribed to, to receive all Note Off messages that pass through the MidiIn object. */
    get noteOff(): MidiInEvent<messages.NoteOffMessage>;

    /** The noteOn property can be subscribed to, to receive all Note On messages that pass through the MidiIn object. */
    get noteOn(): MidiInEvent<messages.NoteOnMessage>;

    /** The notePressure property can be subscribed to, to receive all Note Pressure messages that pass through the MidiIn object. */
    get notePressure(): MidiInEvent<messages.NotePressureMessage>;

    /** The controlChange property can be subscribed to, to receive all Control Change messages that pass through the MidiIn object. */
    get controlChange(): MidiInEvent<messages.ControlChangeMessage>;

    /** The programChange property can be subscribed to, to receive all Program Change messages that pass through the MidiIn object. */
    get programChange(): MidiInEvent<messages.ProgramChangeMessage>;

    /** The channelPressure property can be subscribed to, to receive all Channel Pressure messages that pass through the MidiIn object. */
    get channelPressure(): MidiInEvent<messages.ChannelPressureMessage>;

    /** The pitchBend property can be subscribed to, to receive all Pitch Bend messages that pass through the MidiIn object. */
    get pitchBend(): MidiInEvent<messages.PitchBendMessage>;
}