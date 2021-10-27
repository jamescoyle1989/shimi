'use strict';

import { IMetronome } from './Metronome';
import { IClockChild } from './Clock';


class CueBase implements IClockChild {
    /** Provides a way of identifying cues so they can be retrieved later */
    get ref(): string { return this._ref; }
    /** Provides a way of identifying cues so they can be retrieved later */
    set ref(value: string) { this._ref = value; }
    private _ref: string;

    get finished(): boolean { return this._finished; }
    private _finished: boolean = false;

    get action(): () => void { return this._action; }
    private _action: () => void;

    constructor(action: () => void) {
        this._action = action;
    }

    update(deltaMs: number): void {
    }

    finish(): void {
        this._finished = true;
    }
}


export class MsCue extends CueBase {
    get msCount(): number { return this._msCount; }
    private _msCount: number;

    private _countPassed: number = 0;
    
    constructor(msCount: number, action: () => void) {
        super(action);
        this._msCount = msCount;
    }

    update(deltaMs: number): void {
        this._countPassed += deltaMs;
        if (this._countPassed >= this.msCount) {
            this.action();
            this.finish();
        }
    }
}


export class ConditionalCue extends CueBase {
    get condition(): () => boolean { return this._condition; }
    private _condition: () => boolean;
    
    constructor(condition: () => boolean, action: () => void) {
        super(action);
        this._condition = condition;
    }
    
    update(deltaMs: number): void {
        if (this.condition()) {
            this.action();
            this.finish();
        }
    }
}


export class BeatCue extends CueBase {
    get metronome(): IMetronome { return this._metronome; }
    private _metronome: IMetronome;

    get beatCount(): number { return this._beatCount; }
    private _beatCount: number;

    private _beatsPassed: number = 0;
    
    constructor(metronome: IMetronome, beatCount: number, action: () => void) {
        super(action);
        this._metronome = metronome;
        this._beatCount = beatCount;
    }
    
    update(deltaMs: number): void {
        this._beatsPassed += this.metronome.totalBeatTracker.value - this.metronome.totalBeatTracker.oldValue;
        if (this._beatsPassed >= this.beatCount) {
            this.action();
            this.finish();
        }
    }
}


export default class Cue {
    static when(condition: () => boolean, action: () => void): ConditionalCue {
        return new ConditionalCue(condition, action);
    }

    static afterMs(msCount: number, action: () => void): MsCue {
        return new MsCue(msCount, action);
    }

    static afterBeats(metronome: IMetronome, beatCount: number, action: () => void): BeatCue {
        return new BeatCue(metronome, beatCount, action);
    }
}