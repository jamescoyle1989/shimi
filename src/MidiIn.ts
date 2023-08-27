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
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.MidiIn'; }

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

    /** The tick property can be subscribed to, to receive all timing clock messages that pass through the MidiIn object. */
    get tick(): MidiInEvent<messages.TickMessage> { return this._tick; }
    private _tick: MidiInEvent<messages.TickMessage> = new MidiInEvent<messages.TickMessage>();

    /** The songPosition property can be subscribed to, to receive all Song Position messages that pass through the MidiIn object. */
    get songPosition(): MidiInEvent<messages.SongPositionMessage> { return this._songPosition; }
    private _songPosition: MidiInEvent<messages.SongPositionMessage> = new MidiInEvent<messages.SongPositionMessage>();

    /** The start property can be subscribed to, to receive all Start messages that pass through the MidiIn object. */
    get start(): MidiInEvent<messages.StartMessage> { return this._start; }
    private _start: MidiInEvent<messages.StartMessage> = new MidiInEvent<messages.StartMessage>();

    /** The continue property can be subscribed to, to receive all Continue messages that pass through the MidiIn object. */
    get continue(): MidiInEvent<messages.ContinueMessage> { return this._continue; }
    private _continue: MidiInEvent<messages.ContinueMessage> = new MidiInEvent<messages.ContinueMessage>();

    /** The stop property can be subscribed to, to receive all Stop messages that pass through the MidiIn object. */
    get stop(): MidiInEvent<messages.StopMessage> { return this._stop; }
    private _stop: MidiInEvent<messages.StopMessage> = new MidiInEvent<messages.StopMessage>();

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
        if (data.length == 0)
            return;

        if (data.length == 1 && data[0] == 0xF8) {
            this.tick.trigger(new MidiInEventData(this, new messages.TickMessage()));
            return;
        }
        
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
        else if (messageId == 0xF0) {
            if (channel == 2 && data.length == 1)
                this.start.trigger(new MidiInEventData(this, new messages.StartMessage()));
            else if (channel == 2 && data.length == 3)
                this.songPosition.trigger(new MidiInEventData(this, new messages.SongPositionMessage((128 * data[2]) + data[1])));
            else if (channel == 3 && data.length == 1)
                this.continue.trigger(new MidiInEventData(this, new messages.ContinueMessage()));
            else if (channel == 4 && data.length == 1)
                this.stop.trigger(new MidiInEventData(this, new messages.StopMessage()));
        }
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

    /** The tick property can be subscribed to, to receive all Timing Clock messages that pass through the MidiIn object. */
    get tick(): MidiInEvent<messages.TickMessage>;

    /** The songPosition property can be subscribed to, to receive all Song Position messages that pass through the MidiIn object. */
    get songPosition(): MidiInEvent<messages.SongPositionMessage>;

    /** The start property can be subscribed to, to receive all Start messages that pass through the MidiIn object. */
    get start(): MidiInEvent<messages.StartMessage>;

    /** The continue property can be subscribed to, to receive all Continue messages that pass through the MidiIn object. */
    get continue(): MidiInEvent<messages.ContinueMessage>;

    /** The stop property can be subscribed to, to receive all Stop messages that pass through the MidiIn object. */
    get stop(): MidiInEvent<messages.StopMessage>;
}