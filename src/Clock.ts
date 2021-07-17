'use strict';

export default class Clock {
    /** How many milliseconds from one tick to the next */
    get msPerTick(): number { return this._msPerTick; }
    private _msPerTick: number;

    /** list of processes that get updated by the clock */
    get children(): Array<IClockChild> { return this._children;}
    private _children: Array<IClockChild> = [];

    private _lastUpdateTime: number;

    private _timer: NodeJS.Timer;

    /** Returns whether the clock is already running */
    get running(): boolean { return !!this._timer; }

    constructor(msPerTick: number = 5) {
        this._msPerTick = msPerTick;
    }

    /** Returns false if the clock was already running */
    start(): boolean {
        if (this.running)
            return false;
        this._timer = setInterval(() => this.updateChildren(), this.msPerTick);
        this._lastUpdateTime = new Date().getTime();
        return true;
    }

    /** Returns false if the clock was already stopped */
    stop(): boolean {
        if (!this.running)
            return false;
        clearTimeout(this._timer);
        this._timer = null;
        this._lastUpdateTime = null;
        return true;
    }

    updateChildren() {
        const newTime = new Date().getTime();
        const deltaMs = newTime - this._lastUpdateTime;
        this._lastUpdateTime = newTime;

        for (const child of this._children)
            child.update(deltaMs);
    }
}


export interface IClockChild {
    update(deltaMs: number): void;
}