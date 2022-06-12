'use strict';


/**
 * @category Midi IO
 */
export interface IMidiMessage {
    /** Returns an array of numbers that can be sent to the MIDI port */
    toArray(): number[];

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
 * @category Midi IO
 */
export class NoteOffMessage extends MidiMessageBase implements IMidiMessage {
    pitch: number = 0;
    velocity: number = 0;
    channel: number = 0;

    /**
     * @param pitch Acceptable values range from 0 to 127
     * @param velocity Acceptable values range from 0 to 127
     * @param channel Acceptable values range from 0 to 15
     */
    constructor(pitch: number, velocity: number, channel: number) {
        super();
        this.pitch = pitch;
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
 * @category Midi IO
 */
export class NoteOnMessage extends MidiMessageBase implements IMidiMessage {
    pitch: number = 0;
    velocity: number = 0;
    channel: number = 0;

    /**
     * @param pitch Acceptable values range from 0 to 127
     * @param velocity Acceptable values range from 0 to 127
     * @param channel Acceptable values range from 0 to 15
     */
    constructor(pitch: number, velocity: number, channel: number) {
        super();
        this.pitch = pitch;
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
 * @category Midi IO
 */
export class NotePressureMessage extends MidiMessageBase implements IMidiMessage {
    pitch: number = 0;
    velocity: number = 0;
    channel: number = 0;

    /**
     * @param pitch Acceptable values range from 0 to 127
     * @param velocity Acceptable values range from 0 to 127
     * @param channel Acceptable values range from 0 to 15
     */
    constructor(pitch: number, velocity: number, channel: number) {
        super();
        this.pitch = pitch;
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
 * @category Midi IO
 */
export class ControlChangeMessage extends MidiMessageBase implements IMidiMessage {
    controller: number = 0;
    value: number = 0;
    channel: number = 0;

    /**
     * @param controller Acceptable values range from 0 to 127
     * @param value Acceptable values range from 0 to 127
     * @param channel Acceptable values range from 0 to 15
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

    duplicate(): NotePressureMessage {
        return new NotePressureMessage(this.controller, this.value, this.channel);
    }
}

/**
 * @category Midi IO
 */
export class ProgramChangeMessage extends MidiMessageBase implements IMidiMessage {
    program: number = 0;
    channel: number = 0;

    /**
     * @param program Acceptable values range from 0 to 127
     * @param channel Acceptable values range from 0 to 15
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
 * @category Midi IO
 */
export class ChannelPressureMessage extends MidiMessageBase implements IMidiMessage {
    value: number;
    channel: number;

    /**
     * @param value Acceptable values range from 0 to 127
     * @param channel Acceptable values range from 0 to 15
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
 * @category Midi IO
 */
export class PitchBendMessage extends MidiMessageBase implements IMidiMessage {
    percent: number;
    channel: number;

    /**
     * @param percent Acceptable values range from -1 to +1, with 0 being no bend
     * @param channel Acceptable values range from 0 to 15
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