'use strict';

import { parsePitch } from './utils';


/**
 * IMidiMessage defines an interface which all MIDI message objects should implement in order to be widely useable with the MIDI inputs/outputs that consume them.
 * 
 * @category Midi IO
 */
export interface IMidiMessage {

    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string;

    /**
     * The toArray method converts a MIDI message object into it's byte-array form which can be sent through a MIDI port to a connected piece of MIDI technology.
     */
    toArray(): number[];

    /**
     * The duplicate method returns an exact copy of the MIDI message object on which it was called.
     */
    duplicate(): IMidiMessage;
}


/**
 * @category Midi IO
 */
export abstract class MidiMessageBase {
    protected validateIntInRange(value: number, min: number, max: number, name: string): number {
        value = Math.round(value);
        if (value < min)
            throw new Error(name + ' cannot be less than ' + min);
        if (value > max)
            throw new Error(name + ' cannot be greater than ' + max);
        return value;
    }
}

/**
 * The NoteOffMessage class represents a Note Off MIDI message that can be sent to a MIDI output.
 * 
 * @category Midi IO
 */
export class NoteOffMessage extends MidiMessageBase implements IMidiMessage {
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.NoteOffMessage'; };

    /** Acceptable values range from 0 to 127. */
    pitch: number = 0;

    /** Acceptable values range from 0 to 127. */
    velocity: number = 0;

    /** Acceptable values range from 0 to 15. */
    channel: number = 0;

    /**
     * @param pitch Acceptable values range from 0 to 127. Alternatively the pitch can be supplied by name.
     * @param velocity Acceptable values range from 0 to 127.
     * @param channel Acceptable values range from 0 to 15.
     */
    constructor(pitch: number | string, velocity: number, channel: number) {
        super();
        this.pitch = (typeof(pitch) == 'string') ? parsePitch(pitch) : pitch;
        this.velocity = velocity;
        this.channel = channel;
    }

    toArray(): number[] {
        return [
            0x80 + this.validateIntInRange(this.channel, 0, 15, 'channel'),
            this.validateIntInRange(this.pitch, 0, 127, 'pitch'),
            this.validateIntInRange(this.velocity, 0, 127, 'velocity')
        ];
    }

    duplicate(): NoteOffMessage {
        return new NoteOffMessage(this.pitch, this.velocity, this.channel);
    }
}

/**
 * The NoteOnMessage class represents a Note On MIDI message that can be sent to a MIDI output.
 * 
 * @category Midi IO
 */
export class NoteOnMessage extends MidiMessageBase implements IMidiMessage {
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.NoteOnMessage'; };

    /** Acceptable values range from 0 to 127. */
    pitch: number = 0;

    /** Acceptable values range from 0 to 127. */
    velocity: number = 0;

    /** Acceptable values range from 0 to 15. */
    channel: number = 0;

    /**
     * @param pitch Acceptable values range from 0 to 127. Alternatively the pitch can be supplied by name.
     * @param velocity Acceptable values range from 0 to 127.
     * @param channel Acceptable values range from 0 to 15.
     */
    constructor(pitch: number | string, velocity: number, channel: number) {
        super();
        this.pitch = (typeof(pitch) == 'string') ? parsePitch(pitch) : pitch;
        this.velocity = velocity;
        this.channel = channel;
    }

    toArray(): number[] {
        return [
            0x90 + this.validateIntInRange(this.channel, 0, 15, 'channel'),
            this.validateIntInRange(this.pitch, 0, 127, 'pitch'),
            this.validateIntInRange(this.velocity, 0, 127, 'velocity')
        ];
    }

    duplicate(): NoteOnMessage {
        return new NoteOnMessage(this.pitch, this.velocity, this.channel);
    }
}

/**
 * The NotePressureMessage class represents a Note Pressure MIDI message that can be sent to a MIDI output.
 * 
 * @category Midi IO
 */
export class NotePressureMessage extends MidiMessageBase implements IMidiMessage {
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.NotePressureMessage'; };

    /** Acceptable values range from 0 to 127. */
    pitch: number = 0;

    /** Acceptable values range from 0 to 127. */
    velocity: number = 0;

    /** Acceptable values range from 0 to 15. */
    channel: number = 0;

    /**
     * @param pitch Acceptable values range from 0 to 127. Alternatively the pitch can be supplied by name.
     * @param velocity Acceptable values range from 0 to 127.
     * @param channel Acceptable values range from 0 to 15.
     */
    constructor(pitch: number | string, velocity: number, channel: number) {
        super();
        this.pitch = (typeof(pitch) == 'string') ? parsePitch(pitch) : pitch;
        this.velocity = velocity;
        this.channel = channel;
    }

    toArray(): number[] {
        return [
            0xA0 + this.validateIntInRange(this.channel, 0, 15, 'channel'),
            this.validateIntInRange(this.pitch, 0, 127, 'pitch'),
            this.validateIntInRange(this.velocity, 0, 127, 'velocity')
        ];
    }

    duplicate(): NotePressureMessage {
        return new NotePressureMessage(this.pitch, this.velocity, this.channel);
    }
}

/**
 * The ControlChangeMessage class represents a Control Change MIDI message that can be sent to a MIDI output.
 * 
 * @category Midi IO
 */
export class ControlChangeMessage extends MidiMessageBase implements IMidiMessage {
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.ControlChangeMessage'; };

    /** Acceptable values range from 0 to 127. */
    controller: number = 0;

    /** Acceptable values range from 0 to 127. */
    value: number = 0;

    /** Acceptable values range from 0 to 15. */
    channel: number = 0;

    /**
     * @param controller Acceptable values range from 0 to 127.
     * @param value Acceptable values range from 0 to 127.
     * @param channel Acceptable values range from 0 to 15.
     */
    constructor(controller: number, value: number, channel: number) {
        super();
        this.controller = controller;
        this.value = value;
        this.channel = channel;
    }

    toArray(): number[] {
        return [
            0xB0 + this.validateIntInRange(this.channel, 0, 15, 'channel'),
            this.validateIntInRange(this.controller, 0, 127, 'controller'),
            this.validateIntInRange(this.value, 0, 127, 'value')
        ];
    }

    duplicate(): ControlChangeMessage {
        return new ControlChangeMessage(this.controller, this.value, this.channel);
    }
}

/**
 * The ProgramChangeMessage class represents a Program Change MIDI message that can be sent to a MIDI output.
 * 
 * @category Midi IO
 */
export class ProgramChangeMessage extends MidiMessageBase implements IMidiMessage {
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.ProgramChangeMessage'; };

    /** Acceptable values range from 0 to 127. */
    program: number = 0;

    /** Acceptable values range from 0 to 15. */
    channel: number = 0;

    /**
     * @param program Acceptable values range from 0 to 127.
     * @param channel Acceptable values range from 0 to 15.
     */
    constructor(program: number, channel: number) {
        super();
        this.program = program;
        this.channel = channel;
    }

    toArray(): number[] {
        return [
            0xC0 + this.validateIntInRange(this.channel, 0, 15, 'channel'),
            this.validateIntInRange(this.program, 0, 127, 'program')
        ];
    }

    duplicate(): ProgramChangeMessage {
        return new ProgramChangeMessage(this.program, this.channel);
    }
}

/**
 * The ChannelPressureMessage class represents a Channel Pressure MIDI message that can be sent to a MIDI output.
 * 
 * @category Midi IO
 */
export class ChannelPressureMessage extends MidiMessageBase implements IMidiMessage {
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.ChannelPressureMessage'; };

    /** Acceptable values range from 0 to 127. */
    value: number;

    /** Acceptable values range from 0 to 15. */
    channel: number;

    /**
     * @param value Acceptable values range from 0 to 127.
     * @param channel Acceptable values range from 0 to 15.
     */
    constructor(value: number, channel: number) {
        super();
        this.value = value;
        this.channel = channel;
    }

    toArray(): number[] {
        return [
            0xD0 + this.validateIntInRange(this.channel, 0, 15, 'channel'),
            this.validateIntInRange(this.value, 0, 127, 'value')
        ];
    }

    duplicate(): ChannelPressureMessage {
        return new ChannelPressureMessage(this.value, this.channel);
    }
}

/**
 * The PitchBendMessage class represents a Pitch Bend MIDI message that can be sent to a MIDI output.
 * 
 * @category Midi IO
 */
export class PitchBendMessage extends MidiMessageBase implements IMidiMessage {
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.PitchBendMessage'; };

    /** Acceptable values range from -1 to +1, with 0 being no bend. */
    percent: number;

    /** Acceptable values range from 0 to 15. */
    channel: number;

    /**
     * @param percent Acceptable values range from -1 to +1, with 0 being no bend.
     * @param channel Acceptable values range from 0 to 15.
     */
    constructor(percent: number, channel: number) {
        super();
        this.percent = percent;
        this.channel = channel;
    }

    toArray(): number[] {
        if (this.percent < -1)
            throw new Error('percent cannot be less than -1');
        if (this.percent > 1)
            throw new Error('percent cannot be greater than 1');
        const bendVal = Math.min(16383, this.validateIntInRange((this.percent * 8192) + 8192, 0, 16384, 'bend'));
        return [
            0xE0 + this.validateIntInRange(this.channel, 0, 15, 'channel'),
            bendVal % 128,
            Math.floor(bendVal / 128)
        ];
    }

    duplicate(): PitchBendMessage {
        return new PitchBendMessage(this.percent, this.channel);
    }

    /** Takes in the LSB & MSB values of the pitch bend MIDI message and returns a number in range [-1, +1] */
    static calculatePercent(lsb: number, msb: number): number {
        let fullValue = (msb * 128) + lsb;
        if (fullValue >= 16383 && fullValue < 16384)
            fullValue = 16384;
        return (fullValue - 8192) / 8192;
    }
}

/**
 * The TickMessage class represents a Timing Clock MIDI message that can be sent to a MIDI output.
 * 
 * @category Midi IO
 */
export class TickMessage implements IMidiMessage {
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.TickMessage'; };

    constructor() {
    }

    toArray(): number[] {
        return [0xF8];
    }

    duplicate(): TickMessage {
        return new TickMessage();
    }
}


export class SongPositionMessage implements IMidiMessage {
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.SongPositionMessage'; };

    /** The number of MIDI ticks that have occured since the start of the song, divided by 6. */
    value: number;
    
    /**
     * @param value The number of MIDI ticks that have occured since the start of the song, divided by 6.
     */
     constructor(value: number) {
        this.value = value;
    }

    toArray(): number[] {
        if (this.value < 0)
            throw new Error('value cannot be less than 0');
        if (this.value > 16383)
            throw new Error('value cannot be greater than 16383');
        return [
            0xF2,
            this.value % 128,
            Math.floor(this.value / 128)
        ];
    }

    duplicate(): SongPositionMessage {
        return new SongPositionMessage(this.value);
    }
}


/**
 * The StartMessage instructs a listening MIDI device to start its current sequence playing from the start.
 * 
 * @category Midi IO
 */
 export class StartMessage implements IMidiMessage {
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.StartMessage'; };

    constructor() {
    }

    toArray(): number[] {
        return [0xFA];
    }

    duplicate(): StartMessage {
        return new StartMessage();
    }
}


/**
 * The ContinueMessage instructs a listening MIDI device to continue playing its current sequence.
 * 
 * @category Midi IO
 */
 export class ContinueMessage implements IMidiMessage {
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.ContinueMessage'; };

    constructor() {
    }

    toArray(): number[] {
        return [0xFB];
    }

    duplicate(): ContinueMessage {
        return new ContinueMessage();
    }
}


/**
 * The StopMessage instructs a listeneing MIDI device to stop playing its current sequence.
 * 
 * @category Midi IO
 */
 export class StopMessage implements IMidiMessage {
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.StopMessage'; };

    constructor() {
    }

    toArray(): number[] {
        return [0xFC];
    }

    duplicate(): StopMessage {
        return new StopMessage();
    }
}