'use strict';

import { IClockChild } from './Clock';
import { IMetronome } from './Metronome';
import { IMidiOut } from './MidiOut';


/**
 * The TickSender is used for sending MIDI clock messages out, so that other MIDI devices can stay in sync with a shimi metronome.
 */
export default class TickSender implements IClockChild {
    /**
     * The metronome object which the TickSender sends out clock messages for.
     */
    get metronome(): IMetronome { return this._metronome; }
    set metronome(value: IMetronome) {
        this._metronome = value;
    }
    private _metronome: IMetronome;

    /**
     * The midi out object which the TickSender sends clock messages to.
     */
    get midiOut(): IMidiOut { return this._midiOut; }
    set midiOut(value: IMidiOut) {
        this._midiOut = value;
    }
    private _midiOut: IMidiOut;


    /**
     * @param metronome The metronome object which the TickSender sends out clock messages for.
     * @param midiOut The midi out object which the TickSender sends clock messages to.
     */
    constructor(metronome: IMetronome, midiOut: IMidiOut) {
        if (!metronome)
            throw new Error('No metronome passed in');
        if (!midiOut)
            throw new Error('No Midi Output passed in');
        this.metronome = metronome;
        this.midiOut = midiOut;
    }


    ///IClockChild implementation
    
    /** Provides a way of identifying tick senders so they can be easily retrieved later */
    get ref(): string { return this._ref; }
    set ref(value: string) { this._ref = value; }
    private _ref: string;

    /**
     * Provides a way for setting the ref through a chained function call. For example:
     * 
     * ```
     * clock.addChild(new TickSender(metronome, midiOut).withRef('ticksender'));
     * ```
     * 
     * @param ref The ref to set on the object.
     * @returns The calling object.
     */
    withRef(ref: string): IClockChild {
        this._ref = ref;
        return this;
    }

    /** Returns true if the TickSender has been instructed to stop everything by the `finish()` method. */
    get finished(): boolean { return this._finished; }
    private _finished: boolean = false;

    /** Calling this tells the TickSender to stop whatever it's doing and that it will no longer be used. */
    finish(): void {
        this._finished = true;
    }
    
    /**
     * This method is intended to be called by a clock to provide regular updates. It should be called by consumers of the library.
     * @param msDelta How many milliseconds have passed since the last update cycle.
     * @returns 
     */
    update(msDelta: number) {
    }
}