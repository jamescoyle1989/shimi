'use strict';

import { IMetronome } from './Metronome';
import { IClockChild } from './Clock';


/**
 * @category Timing
 */
class CueBase implements IClockChild {
    /** Provides a way of identifying cues so they can be easily retrieved later. */
    get ref(): string { return this._ref; }
    set ref(value: string) { this._ref = value; }
    private _ref: string;

    /** Signifies whether the Cue has stopped. */
    get finished(): boolean { return this._finished; }
    private _finished: boolean = false;

    /** The action to perform once the cue has finished waiting. */
    get action(): () => void { return this._action; }
    private _action: () => void;

    /**
     * @param action The action to perform once the cue has finished waiting.
     */
    constructor(action: () => void) {
        this._action = action;
    }

    /**
     * This method is intended to be called by a clock to provide regular updates. It should not be called by consumers of the library.
     * @param deltaMs How many millseconds have passed since the last update cycle.
     */
    update(deltaMs: number): void {
    }

    /** Calling this tells the Cue to stop whatever it's doing and that it will no longer be used. */
    finish(): void {
        this._finished = true;
    }
}


/**
 * The MsCue defines some action which should be performed after x number of milliseconds have passed.
 * 
 * @category Timing
 */
export class MsCue extends CueBase {
    /** The number of milliseconds to wait before performing some action. */
    get msCount(): number { return this._msCount; }
    private _msCount: number;

    private _countPassed: number = 0;
    
    /**
     * @param msCount The number of milliseconds to wait before performing some action.
     * @param action The action to perform once the cue has finished waiting.
     */
    constructor(msCount: number, action: () => void) {
        super(action);
        this._msCount = msCount;
    }

    /**
     * This method is intended to be called by a clock to provide regular updates. It should not be called by consumers of the library.
     * @param deltaMs How many millseconds have passed since the last update cycle.
     */
    update(deltaMs: number): void {
        this._countPassed += deltaMs;
        if (this._countPassed >= this.msCount) {
            this.action();
            this.finish();
        }
    }
}


/**
 * The ConditionalCue defines some action which should be performed once some condition has been met.
 * 
 * @category Timing
 */
export class ConditionalCue extends CueBase {
    /** The condition which must be satisfied before performing some action. */
    get condition(): () => boolean { return this._condition; }
    private _condition: () => boolean;
    
    /**
     * @param condition The condition which must be satisfied before performing some action.
     * @param action The action to perform once the cue has finished waiting.
     */
    constructor(condition: () => boolean, action: () => void) {
        super(action);
        this._condition = condition;
    }
    
    /**
     * This method is intended to be called by a clock to provide regular updates. It should not be called by consumers of the library.
     * @param deltaMs How many millseconds have passed since the last update cycle.
     */
    update(deltaMs: number): void {
        if (this.condition()) {
            this.action();
            this.finish();
        }
    }
}


/**
 * The BeatCue defines some action which should be performed after x number of beats has passed.
 * 
 * @category Timing
 */
export class BeatCue extends CueBase {
    /** The metronome to use for counting beats. */
    get metronome(): IMetronome { return this._metronome; }
    private _metronome: IMetronome;

    /** The number of beats to wait before performing some action. */
    get beatCount(): number { return this._beatCount; }
    private _beatCount: number;

    private _beatsPassed: number = 0;
    
    /**
     * @param metronome The metronome to use for counting beats.
     * @param beatCount The number of beats to wait before performing some action.
     * @param action The action to perform once the cue has finished waiting.
     */
    constructor(metronome: IMetronome, beatCount: number, action: () => void) {
        super(action);
        this._metronome = metronome;
        this._beatCount = beatCount;
    }
    
    /**
     * This method is intended to be called by a clock to provide regular updates. It should not be called by consumers of the library.
     * @param deltaMs How many millseconds have passed since the last update cycle.
     */
    update(deltaMs: number): void {
        this._beatsPassed += this.metronome.totalBeatTracker.value - this.metronome.totalBeatTracker.oldValue;
        if (this._beatsPassed >= this.beatCount) {
            this.action();
            this.finish();
        }
    }
}


/**
 * The Cue class contains static methods for slightly more nice and intuitive creation of cues.
 * 
 * @category Timing
 */
export default class Cue {
    /**
     * Creates a new instance of ConditionalCue.
     * @param condition The condition which must be satisfied before performing some action.
     * @param action The action to perform once the cue has finished waiting.
     * @returns 
     */
    static when(condition: () => boolean, action: () => void): ConditionalCue {
        return new ConditionalCue(condition, action);
    }

    /**
     * Creates a new instance of MsCue.
     * @param msCount The number of milliseconds to wait before performing some action.
     * @param action The action to perform once the cue has finished waiting.
     * @returns 
     */
    static afterMs(msCount: number, action: () => void): MsCue {
        return new MsCue(msCount, action);
    }

    /**
     * Creates a new instance of BeatCue.
     * @param metronome The metronome to use for counting beats.
     * @param beatCount The number of beats to wait before performing some action.
     * @param action The action to perform once the cue has finished waiting.
     * @returns 
     */
    static afterBeats(metronome: IMetronome, beatCount: number, action: () => void): BeatCue {
        return new BeatCue(metronome, beatCount, action);
    }
}