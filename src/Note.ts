'use strict';

import PropertyTracker from './PropertyTracker';

/**
 * The Note class models a single musical note which can be started and stopped, to be played at a specific pitch & velocity, on a specific channel.
 * 
 * @category Midi IO
 */
export default class Note {
    /**
     * The MIDI pitch of the note, valid values range from 0 - 127.
     * 
     * WARNING! Even though the pitch value can be set at any time, you should avoid setting it once the note has already started being played.
     */
    get pitch(): number { return this._pitch; }
    set pitch(value: number) { this._pitch = value; }
    private _pitch: number;

    /** Tracks changes to the note velocity. */
    velocityTracker: PropertyTracker<number>;
    /** The note's velocity (loudness), valid values range from 0 - 127. */
    get velocity(): number { return this.velocityTracker.value; }
    set velocity(value: number) { this.velocityTracker.value = value; }

    /** 
     * Tracks changes to whether the note is playing.
     * 
     * By default the state is on and dirty.
     */
    onTracker: PropertyTracker<boolean>;
    /** Is the note playing. */
    get on(): boolean { return this.onTracker.value; }
    set on(value: boolean) { this.onTracker.value = value; }

    /**
     * Which channel should the note play on, valid values range from 0 - 15.
     * 
     * WARNING! Even though the channel value can be set at any time, you should avoid setting it once the note has already started being played.
     */
    get channel(): number { return this._channel; }
    set channel(value: number) { this._channel = value; }
    private _channel: number;

    /** Provides way of identifying notes so they can be easily retrieved later. */
    ref: string;

    /**
     * @param pitch The MIDI pitch of the note, valid values range from 0 - 127.
     * @param velocity The note's velocity (loudness), valid values range from 0 - 127.
     * @param channel Which channel should the note play on, valid values range from 0 - 15.
     * @param ref Provides way of identifying notes so they can be easily retrieved later.
     */
    constructor(pitch: number, velocity: number, channel: number, ref?: string) {
        this._pitch = pitch;
        this.velocityTracker = new PropertyTracker(velocity);
        this.onTracker = new PropertyTracker(false);
        this.on = true;
        this._channel = channel;
        this.ref = ref;
    }

    /** Sets on = true, returns whether this changed the note's state. */
    start(): boolean {
        if (this.on)
            return false;
        this.on = true;
        return true;
    }

    /** Sets on = false, returns whether this changed the note's state. */
    stop(): boolean {
        if (!this.on)
            return false;
        this.on = false;
        return true;
    }
}