'use strict';

export class NoteOffMessage {
    pitch: number = 0;
    velocity: number = 0;
    channel: number = 0;

    /**
     * @param pitch Acceptable values range from 0 to 127
     * @param velocity Acceptable values range from 0 to 127
     * @param channel Acceptable values range from 0 to 15
     */
    constructor(pitch: number, velocity: number, channel: number) {
        this.pitch = pitch;
        this.velocity = velocity;
        this.channel = channel;
    }
}

export class NoteOnMessage {
    pitch: number = 0;
    velocity: number = 0;
    channel: number = 0;

    /**
     * @param pitch Acceptable values range from 0 to 127
     * @param velocity Acceptable values range from 0 to 127
     * @param channel Acceptable values range from 0 to 15
     */
    constructor(pitch: number, velocity: number, channel: number) {
        this.pitch = pitch;
        this.velocity = velocity;
        this.channel = channel;
    }
}

export class NotePressureMessage {
    pitch: number = 0;
    velocity: number = 0;
    channel: number = 0;

    /**
     * @param pitch Acceptable values range from 0 to 127
     * @param velocity Acceptable values range from 0 to 127
     * @param channel Acceptable values range from 0 to 15
     */
    constructor(pitch: number, velocity: number, channel: number) {
        this.pitch = pitch;
        this.velocity = velocity;
        this.channel = channel;
    }
}

export class ControlChangeMessage {
    controller: number = 0;
    value: number = 0;
    channel: number = 0;

    /**
     * @param controller Acceptable values range from 0 to 127
     * @param value Acceptable values range from 0 to 127
     * @param channel Acceptable values range from 0 to 15
     */
    constructor(controller: number, value: number, channel: number) {
        this.controller = controller;
        this.value = value;
        this.channel = channel;
    }
}

export class ProgramChangeMessage {
    program: number = 0;
    channel: number = 0;

    /**
     * @param program Acceptable values range from 0 to 127
     * @param channel Acceptable values range from 0 to 15
     */
    constructor(program: number, channel: number) {
        this.program = program;
        this.channel = channel;
    }
}

export class ChannelPressureMessage {
    value: number;
    channel: number;

    /**
     * @param value Acceptable values range from 0 to 127
     * @param channel Acceptable values range from 0 to 15
     */
    constructor(value: number, channel: number) {
        this.value = value;
        this.channel = channel;
    }
}

export class PitchBendMessage {
    percent: number;
    channel: number;

    /**
     * @param percent Acceptable values range from -1 to +1, with 0 being no bend
     * @param channel Acceptable values range from 0 to 15
     */
    constructor(percent: number, channel: number) {
        this.percent = percent;
        this.channel = channel;
    }

    /** Takes in the LSB & MSB values of the pitch bend MIDI message and returns a number in range [-1, +1] */
    static calculatePercent(lsb: number, msb: number): number {
        let fullValue = (msb * 128) + lsb;
        if (fullValue >= 16383 && fullValue < 16384)
            fullValue = 16384;
        return (fullValue - 8192) / 8192;
    }
}