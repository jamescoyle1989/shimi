'use strict';

import { IClockChild } from './Clock';
import { IMetronome } from './Metronome';


/**
 * @category Timing
 */
class RepeatBase<TArgs> implements IClockChild {
    /** Provides a way of identifying cues so they can be retrieved later */
    get ref(): string { return this._ref; }
    /** Provides a way of identifying cues so they can be retrieved later */
    set ref(value: string) { this._ref = value; }
    private _ref: string;

    get finished(): boolean { return this._finished; }
    private _finished: boolean = false;

    get action(): (args: TArgs) => void { return this._action; }
    private _action: (args: TArgs) => void;

    constructor(action: (args: TArgs) => void) {
        this._action = action;
    }

    update(deltaMs: number): void {
    }

    finish(): void {
        this._finished = true;
    }
}


/**
 * @category Timing
 */
export class RepeatArgs {
    get ms() { return this._ms; }
    private _ms: number;

    constructor(ms: number) {
        this._ms = ms;
    }
}


/**
 * @category Timing
 */
export class ConditionalRepeat extends RepeatBase<RepeatArgs> {
    get condition(): () => boolean { return this._condition; }
    private _condition: () => boolean;

    private _countPassed: number = 0;

    constructor(condition: () => boolean, action: (args: RepeatArgs) => void) {
        super(action);
        this._condition = condition;
    }

    update(deltaMs: number): void {
        this._countPassed += deltaMs;
        if (this.condition())
            this.finish();
        else
            this.action(new RepeatArgs(this._countPassed));
    }
}


/**
 * @category Timing
 */
export class FiniteRepeatArgs extends RepeatArgs {
    get percent() { return this._percent; }
    private _percent: number;

    constructor(ms: number, percent: number) {
        super(ms);
        this._percent = percent;
    }
}


/**
 * @category Timing
 */
export class MsRepeat extends RepeatBase<FiniteRepeatArgs> {
    get msCount(): number { return this._msCount; }
    private _msCount: number;

    private _countPassed: number = 0;

    constructor(msCount: number, action: (args: FiniteRepeatArgs) => void) {
        super(action);
        this._msCount = msCount;
    }

    update(deltaMs: number): void {
        this._countPassed += deltaMs;
        if (this._countPassed >= this.msCount)
            this.finish();
        else
            this.action(new FiniteRepeatArgs(this._countPassed, this._countPassed / this.msCount));
    }
}


/**
 * @category Timing
 */
export class BeatRepeatArgs extends FiniteRepeatArgs {
    get beat() { return this._beat; }
    private _beat: number;

    constructor(ms: number, beat: number, percent: number) {
        super(ms, percent);
        this._beat = beat;
    }
}


/**
 * @category Timing
 */
export class BeatRepeat extends RepeatBase<BeatRepeatArgs> {
    get metronome(): IMetronome { return this._metronome; }
    private _metronome: IMetronome;

    get beatCount(): number { return this._beatCount; }
    private _beatCount: number;

    private _beatsPassed: number = 0;

    private _msPassed: number = 0;

    constructor(metronome: IMetronome, beatCount: number, action: (args: BeatRepeatArgs) => void) {
        super(action);
        this._metronome = metronome;
        this._beatCount = beatCount;
    }

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
 * @category Timing
 */
export default class Repeat {
    static until(condition: () => boolean, action: (args: RepeatArgs) => void): ConditionalRepeat {
        return new ConditionalRepeat(condition, action);
    }

    static forMs(msCount: number, action: (args: FiniteRepeatArgs) => void): MsRepeat {
        return new MsRepeat(msCount, action);
    }

    static forBeats(metronome: IMetronome, beatCount: number, action: (args: BeatRepeatArgs) => void): BeatRepeat {
        return new BeatRepeat(metronome, beatCount, action);
    }
}