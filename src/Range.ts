'use strict';

export default class Range {
    get start(): number { return this._start; }
    set start(value: number) { this._start = value; }
    private _start: number;

    get duration(): number { return this._duration; }
    set duration(value: number) {
        if (value < 0)
            throw new Error('Cannot set duration to negative value');
        this._duration = value;
    }
    private _duration: number;

    get end(): number { return this._start + this._duration; }
    set end(value: number) { this.duration = value - this._start; }

    constructor(start: number, duration: number) {
        this.start = start;
        this.duration = duration;
    }

    /** Returns what percentage into the range the given value is */
    getPercent(value: number): number {
        if (this.duration == 0)
            return 0;
        return (value - this.start) / this.duration;
    }
}