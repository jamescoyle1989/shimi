'use strict';

import { sum } from "./IterationUtils";


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

    /**
     * Allows for tweens to be chained one after another.
     * @param tween The next tween to follow after the current one.
     * @param weight Weighting to determine how much of the tweening time that the new tween gets.
     */
    then(tween: ITween, weight?: number): ITween;
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

    /**
     * Accepts a percent value and returns a corresponding value somewhere between the `from` and `to` values.
     * @param percent Expects a value ranging from 0 to 1.
     */
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

    /**
     * Allows for tweens to be chained one after another.
     * @param tween The next tween to follow after the current one.
     * @param weight Weighting to determine how much of the tweening time that the new tween gets.
     */
     then(tween: ITween, weight: number = 1): ITween {
        return new MultiTween(this).then(tween, weight);
     }
}


/**
 * MultiTween supports multiple tweens being chained one after another.
 * 
 * @category Tweens
 */
export class MultiTween implements ITween {
    private _children: Array<{tween: ITween, weight: number}> = [];

    /**
     * @param firstChild The first tween in the chain.
     */
    constructor(firstChild: ITween) {
        this._children.push({tween: firstChild, weight: 1});
    }

    /** The value to start the tween from. */
    get from(): number { return this._children[0].tween.from; }

    /** The value to end the tween at. */
    get to(): number { return this._children[this._children.length - 1].tween.to; }

    /**
     * Accepts a percent value and returns a corresponding value somewhere between the `from` and `to` values.
     * @param percent Expects a value ranging from 0 to 1.
     */
    update(percent: number): number {
        const totalWeight = sum(this._children, x => x.weight);
        const weightedPercent = totalWeight * percent;
        let cumulativeWeight = 0;
        for (const child of this._children) {
            if (cumulativeWeight <= weightedPercent && cumulativeWeight + child.weight >= weightedPercent) {
                const childPercent = (weightedPercent - cumulativeWeight) / child.weight;
                return child.tween.update(childPercent);
            }
            cumulativeWeight += child.weight;
        }
    }

    /**
     * Allows for tweens to be chained one after another.
     * @param tween The next tween to be added to the chain.
     * @param weight Weighting to determine how much of the tweening time that the new tween gets.
     */
    then(tween: ITween, weight: number = 1): ITween {
        this._children.push({tween, weight});
        return this;
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