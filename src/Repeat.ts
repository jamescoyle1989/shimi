'use strict';

import Clock, { ClockChildFinishedEvent, ClockChildFinishedEventData, IClockChild } from './Clock';
import { IMetronome } from './Metronome';


/**
 * @category Timing
 */
class RepeatBase<TArgs> implements IClockChild {
    /** Provides a way of identifying repeats so they can be easily retrieved later. */
    get ref(): string { return this._ref; }
    set ref(value: string) { this._ref = value; }
    private _ref: string;

    /** Signifies whether the Repeat has stopped. */
    get isFinished(): boolean { return this._isFinished; }
    private _isFinished: boolean = false;

    /** This event fires when the Repeat finishes. */
    get finished(): ClockChildFinishedEvent { return this._finished; }
    private _finished: ClockChildFinishedEvent = new ClockChildFinishedEvent();

    /** The action to perform for every update that the repeat is active. */
    get action(): (args: TArgs) => void { return this._action; }
    private _action: (args: TArgs) => void;

    /**
     * @param action The action to perform for every update that the repeat is active.
     */
    constructor(action: (args: TArgs) => void) {
        this._action = action;
        if (!!Clock.default)
            Clock.default.addChild(this);
    }

    /**
     * This method is intended to be called by a clock to provide regular updates. It should be called by consumers of the library.
     * @param deltaMs How many milliseconds have passed since the last update cycle.
     */
    update(deltaMs: number): void {
    }

    /** Calling this tells the Repeat to stop whatever it's doing and that it will no longer be used. */
    finish(): void {
        this._isFinished = true;
        this.finished.trigger(new ClockChildFinishedEventData(this));
    }

    /**
     * Provides a way for setting the ref through a chained function call. For example:
     * 
     * ```
     * clock.addChild(Repeat.forMs(100, console.log('Hello!')).withRef('repeat'));
     * ```
     * 
     * @param ref The ref to set on the object.
     * @returns The calling object.
     */
    withRef(ref: string): IClockChild {
        this._ref = ref;
        return this;
    }
}


/**
 * An instance of RepeatArgs is generated by a Repeat object to be passed into its action callback, providing the callback with information about how long the repeat has been running.
 * 
 * @category Timing
 */
export class RepeatArgs {
    /** How many milliseconds the repeat has been running for. */
    get ms() { return this._ms; }
    private _ms: number;

    /**
     * @param ms How many milliseconds the repeat has been running for.
     */
    constructor(ms: number) {
        this._ms = ms;
    }
}


/**
 * The ConditionalRepeat defines some action which should be performed on every update cycle until some condition has been met.
 * 
 * @category Timing
 */
export class ConditionalRepeat extends RepeatBase<RepeatArgs> {
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.ConditionalRepeat'; }

    /** The condition which must be satisfied for the repeat to automatically finish. */
    get condition(): () => boolean { return this._condition; }
    private _condition: () => boolean;

    private _countPassed: number = 0;

    /**
     * @param condition The condition which must be satisfied for the repeat to automatically finish.
     * @param action The action to perform for every update that the repeat is active.
     */
    constructor(condition: () => boolean, action: (args: RepeatArgs) => void) {
        super(action);
        this._condition = condition;
    }

    /**
     * This method is intended to be called by a clock to provide regular updates. It should be called by consumers of the library.
     * @param deltaMs How many milliseconds have passed since the last update cycle.
     */
    update(deltaMs: number): void {
        this._countPassed += deltaMs;
        if (this.condition())
            this.finish();
        else
            this.action(new RepeatArgs(this._countPassed));
    }
}


/**
 * An instance of FiniteRepeatArgs is generated by a Repeat object with finite running time, to be passed into its action callback. The FiniteRepeatArgs class provides information about how long a repeat has been running, as well as how far through repeat's lifetime we are.
 * 
 * @category Timing
 */
export class FiniteRepeatArgs extends RepeatArgs {
    /** A number ranging from 0 to 1, signifying how far through a repeat's lifetime we are. */
    get percent() { return this._percent; }
    private _percent: number;

    /**
     * @param ms How many milliseconds the repeat has been running for.
     * @param percent A number ranging from 0 to 1, signifying how far through a repeat's lifetime we are.
     */
    constructor(ms: number, percent: number) {
        super(ms);
        this._percent = percent;
    }
}


/**
 * The MsRepeat defines some action which should be performed on every update cycle for some amount of time, measured in milliseconds.
 * 
 * @category Timing
 */
export class MsRepeat extends RepeatBase<FiniteRepeatArgs> {
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.MsRepeat'; }

    /** How many milliseconds the repetition should run for. */
    get msCount(): number { return this._msCount; }
    private _msCount: number;

    private _countPassed: number = 0;

    /**
     * @param msCount How many milliseconds the repetition should run for.
     * @param action The action to perform for every update that the repeat is active.
     */
    constructor(msCount: number, action: (args: FiniteRepeatArgs) => void) {
        super(action);
        this._msCount = msCount;
    }

    /**
     * This method is intended to be called by a clock to provide regular updates. It should be called by consumers of the library.
     * @param deltaMs How many milliseconds have passed since the last update cycle.
     */
    update(deltaMs: number): void {
        this._countPassed += deltaMs;
        if (this._countPassed >= this.msCount)
            this.finish();
        else
            this.action(new FiniteRepeatArgs(this._countPassed, this._countPassed / this.msCount));
    }
}


/**
 * An instance of BeatRepeatArgs is generated by a Repeat object with finite running time, to be passed into its action callback. The BeatRepeatArgs class provides information about how long a repeat has been running, how far through repeat's lifetime we are, and how many beats have passed since the repeat was started.
 * 
 * @category Timing
 */
export class BeatRepeatArgs extends FiniteRepeatArgs {
    /** How many beats have passed since the repeat started. */
    get beat() { return this._beat; }
    private _beat: number;

    /**
     * @param ms How many milliseconds the repeat has been running for.
     * @param beat How many beats have passed since the repeat started.
     * @param percent A number ranging from 0 to 1, signifying how far through a repeat's lifetime we are.
     */
    constructor(ms: number, beat: number, percent: number) {
        super(ms, percent);
        this._beat = beat;
    }
}


/**
 * The MsRepeat defines some action which should be performed on every update cycle for some amount of time, measured in beats.
 * 
 * @category Timing
 */
export class BeatRepeat extends RepeatBase<BeatRepeatArgs> {
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.BeatRepeat'; }

    /** The metronome used to count how many beats have passed. */
    get metronome(): IMetronome { return this._metronome; }
    private _metronome: IMetronome;

    /** How many beats the repetition should run for. */
    get beatCount(): number { return this._beatCount; }
    private _beatCount: number;

    private _beatsPassed: number = 0;

    private _msPassed: number = 0;

    /**
     * @param metronome The metronome used to count how many beats have passed.
     * @param beatCount How many beats the repetition should run for.
     * @param action The action to perform for every update that the repeat is active.
     */
    constructor(metronome: IMetronome, beatCount: number, action: (args: BeatRepeatArgs) => void) {
        super(action);
        this._metronome = metronome;
        this._beatCount = beatCount;
    }

    /**
     * This method is intended to be called by a clock to provide regular updates. It should be called by consumers of the library.
     * @param deltaMs How many milliseconds have passed since the last update cycle.
     */
    update(deltaMs: number): void {
        this._msPassed += deltaMs;
        this._beatsPassed += this.metronome.totalBeatTracker.value - this.metronome.totalBeatTracker.oldValue;
        if (this._beatsPassed >= this.beatCount)
            this.finish();
        else
            this.action(new BeatRepeatArgs(this._msPassed, this._beatsPassed, this._beatsPassed / this.beatCount));
    }
}


/**
 * The Repeat class contains static methods for slightly more nice and intuitive creation of repeats.
 * 
 * @category Timing
 */
export default class Repeat {
    /**
     * Creates a new instance of ConditionalRepeat.
     * @param condition The condition which must be satisfied for the repeat to automatically finish.
     * @param action The action to perform for every update that the repeat is active.
     * @returns 
     */
    static until(condition: () => boolean, action: (args: RepeatArgs) => void): ConditionalRepeat {
        return new ConditionalRepeat(condition, action);
    }

    /**
     * Creates a new instance of MsRepeat.
     * @param msCount How many milliseconds the repetition should run for.
     * @param action The action to perform for every update that the repeat is active.
     * @returns 
     */
    static forMs(msCount: number, action: (args: FiniteRepeatArgs) => void): MsRepeat {
        return new MsRepeat(msCount, action);
    }

    /**
     * Creates a new instance of BeatRepeat.
     * @param metronome The metronome used to count how many beats have passed.
     * @param beatCount How many beats the repetition should run for.
     * @param action The action to perform for every update that the repeat is active.
     * @returns 
     */
    static forBeats(metronome: IMetronome, beatCount: number, action: (args: BeatRepeatArgs) => void): BeatRepeat {
        return new BeatRepeat(metronome, beatCount, action);
    }
}