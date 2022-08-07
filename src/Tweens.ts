'use strict';


/**
 * ITween defines an interface which forms the basis for an object that supports a gradual transition between 2 values.
 * 
 * @category Tweens
 */
export interface ITween {
    /** The value to start the tween from. */
    get from(): number;

    /** The value to end the tween at. */
    get to(): number;

    /**
     * Accepts a percent value and returns a corresponding value somewhere between the `from` and `to` values.
     * @param percent Expects a value ranging from 0 to 1.
     */
    update(percent: number): number;
}


/**
 * LinearTween defines a constant movement between 2 values.
 * 
 * @category Tweens
 */
export class LinearTween implements ITween {
    /** The value to start the tween from. */
    get from(): number { return this._from; }
    private _from: number;

    /** The value to end the tween at. */
    get to(): number { return this._to; }
    private _to: number;

    /**
     * @param from The value to start the tween from.
     * @param to The value to end the tween at.
     */
    constructor(from: number, to: number) {
        this._from = from;
        this._to = to;
    }

    update(percent: number): number {
        return this.from + (this.tweenEquation(percent) * (this.to - this.from));
    }

    /**
     * Represents the equation of how the tween value changes over time. Think of a cartesian graph, where the x-axis is time as a percent, and the y-axis is how far in its journey as a percent from `from` to `to` the tween is.
     * @param percent Expects a value ranging from 0 to 1
     * @returns Should return a value ranging from 0 to 1
     */
    tweenEquation(percent: number): number {
        return percent;
    }
}


/**
 * SineInOutTween defines an eased movement between 2 values.
 * 
 * @category Tweens
 */
export class SineInOutTween extends LinearTween {
    /**
     * @param from The value to start the tween from.
     * @param to The value to end the tween at.
     */
    constructor(from: number, to: number) {
        super(from, to);
    }

    /**
     * Represents the equation of how the tween value changes over time. Think of a cartesian graph, where the x-axis is time as a percent, and the y-axis is how far in its journey as a percent from `from` to `to` the tween is.
     * @param percent Expects a value ranging from 0 to 1
     * @returns Should return a value ranging from 0 to 1
     */
    tweenEquation(percent: number): number {
        return -(Math.cos(Math.PI * percent) - 1) / 2;
    }
}


/**
 * SineInTween defines an eased movement between 2 values.
 * 
 * @category Tweens
 */
export class SineInTween extends LinearTween {
    /**
     * @param from The value to start the tween from.
     * @param to The value to end the tween at.
     */
    constructor(from: number, to: number) {
        super(from, to);
    }

    /**
     * Represents the equation of how the tween value changes over time. Think of a cartesian graph, where the x-axis is time as a percent, and the y-axis is how far in its journey as a percent from `from` to `to` the tween is.
     * @param percent Expects a value ranging from 0 to 1
     * @returns Should return a value ranging from 0 to 1
     */
    tweenEquation(percent: number): number {
        return 1 - Math.cos((percent * Math.PI) / 2);
    }
}


/**
 * SineOutTween defines an eased movement between 2 values.
 * 
 * @category Tweens
 */
export class SineOutTween extends LinearTween {
    /**
     * @param from The value to start the tween from.
     * @param to The value to end the tween at.
     */
    constructor(from: number, to: number) {
        super(from, to);
    }

    /**
     * Represents the equation of how the tween value changes over time. Think of a cartesian graph, where the x-axis is time as a percent, and the y-axis is how far in its journey as a percent from `from` to `to` the tween is.
     * @param percent Expects a value ranging from 0 to 1
     * @returns Should return a value ranging from 0 to 1
     */
    tweenEquation(percent: number): number {
        return Math.sin((percent * Math.PI) / 2);
    }
}


/**
 * The Tween class contains static methods for slightly more nice and intuitive creation of tweens.
 * 
 * @category Tweens
 */
export default class Tween {
    /**
     * Creates a new instance of LinearTween.
     * @param from The value to start the tween from.
     * @param to The value to end the tween at.
     * @returns 
     */
    static linear(from: number, to: number): LinearTween {
        return new LinearTween(from, to);
    }

    /**
     * Creates a new instance of SineInOutTween.
     * @param from The value to start the tween from.
     * @param to The value to end the tween at.
     * @returns 
     */
    static sineInOut(from: number, to: number): SineInOutTween {
        return new SineInOutTween(from, to);
    }

    /**
     * Creates a new instance of SineInTween.
     * @param from The value to start the tween from.
     * @param to The value to end the tween at.
     * @returns 
     */
    static sineIn(from: number, to: number): SineInTween {
        return new SineInTween(from, to);
    }

    /**
     * Creates a new instance of SineOutTween.
     * @param from The value to start the tween from.
     * @param to The value to end the tween at.
     * @returns 
     */
    static sineOut(from: number, to: number): SineOutTween {
        return new SineOutTween(from, to);
    }
}