'use strict';

/**
 * The Range class represents a one-dimensional range, going from some start value to some end value.
 * 
 * Within the rest of the shimi architecture, this is most often used as a way to represent some range of time.
 */
export default class Range {
    /** 
     * The value which the range starts at.
     * 
     * Attempts to set this to a value greater than `end` will result in an error being thrown.
     */
    get start(): number { return this._start; }
    set start(value: number) { this._start = value; }
    private _start: number;

    /**
     * The difference between the `start` and `end` values.
     * 
     * Attempts to set this to a negative value will result in an error being thrown.
     */
    get duration(): number { return this._duration; }
    set duration(value: number) {
        if (value < 0)
            throw new Error('Cannot set duration to negative value');
        this._duration = value;
    }
    private _duration: number;

    /**
     * The value which the range ends at.
     * 
     * Attempts to set this to a value less than `start` will result in an error being thrown.
     */
    get end(): number { return this._start + this._duration; }
    set end(value: number) { this.duration = value - this._start; }

    /**
     * @param start The value which the range starts at.
     * @param duration The duration of the range.
     */
    constructor(start: number, duration: number) {
        this.start = start;
        this.duration = duration;
    }

    /**
     * Accepts a value and returns what percentage of the way into the range that the value is.
     * 
     * The returned value can be negative, or greater than 100%, if the passed in value is less than the range start, or greater than the range end.
     * @param value The value to compare against the range.
     * @returns 
     */
    getPercent(value: number): number {
        if (this.duration == 0)
            return 0;
        return (value - this.start) / this.duration;
    }

    /**
     * Returns true if the passed in point is greater than or equal to range start, and less than or equal to range end.
     * @param point The point value to determine whether it's within the range.
     * @returns 
     */
    contains(point: number): boolean {
        return point >= this.start && point <= this.end;
    }
}