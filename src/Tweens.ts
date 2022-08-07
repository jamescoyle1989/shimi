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
 * StepsTween defines a step-wise movement between 2 values.
 * 
 * @category Tweens
 */
export class StepsTween extends LinearTween {
    /**
     * How many step movements to take in getting to the destination value.
     */
    get steps(): number { return this._steps; }
    set steps(value: number) { this._steps = value; }
    private _steps: number;

    /**
     * @param from The value to start the tween from.
     * @param to The value to end the tween at.
     * @param steps How many step movements to take in getting to the destination value.
     */
    constructor(from: number, to: number, steps: number) {
        super(from, to);
        this.steps = steps;
    }

    /**
     * Represents the equation of how the tween value changes over time. Think of a cartesian graph, where the x-axis is time as a percent, and the y-axis is how far in its journey as a percent from `from` to `to` the tween is.
     * @param percent Expects a value ranging from 0 to 1
     * @returns Should return a value ranging from 0 to 1
     */
    tweenEquation(percent: number): number {
        //Make sure percent never actually quite reaches 1, otherwise it tries to go to the next step above the target
        percent = Math.min(percent, 0.999);
        
        return Math.floor(percent * (this.steps + 1)) / this.steps;
    }
}


/**
 * QuadraticInOutTween defines an eased movement between 2 values.
 * 
 * @category Tweens
 */
export class QuadraticInOutTween extends LinearTween {
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
        if (percent < 0.5)
            return 2 * percent * percent;
        else {
            const inversePercent = (1 - percent);
            return 1 - (2 * inversePercent * inversePercent);
        }
    }
}


/**
 * QuadraticInTween defines an eased movement between 2 values.
 * 
 * @category Tweens
 */
export class QuadraticInTween extends LinearTween {
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
        return percent * percent;
    }
}


/**
 * QuadraticOutTween defines an eased movement between 2 values.
 * 
 * @category Tweens
 */
export class QuadraticOutTween extends LinearTween {
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
        const inversePercent = 1 - percent;
        return 1 - (inversePercent * inversePercent);
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

    /**
     * Creates a new instance of StepsTween.
     * @param from The value to start the tween from.
     * @param to The value to end the tween at.
     * @returns 
     */
    static steps(from: number, to: number, steps: number): StepsTween {
        return new StepsTween(from, to, steps);
    }

    /**
     * Creates a new instance of QuadraticInOutTween.
     * @param from The value to start the tween from.
     * @param to The value to end the tween at.
     * @returns 
     */
    static quadraticInOut(from: number, to: number): QuadraticInOutTween {
        return new QuadraticInOutTween(from, to);
    }

    /**
     * Creates a new instance of QuadraticInTween.
     * @param from The value to start the tween from.
     * @param to The value to end the tween at.
     * @returns 
     */
    static quadraticIn(from: number, to: number): QuadraticInTween {
        return new QuadraticInTween(from, to);
    }

    /**
     * Creates a new instance of QuadraticOutTween.
     * @param from The value to start the tween from.
     * @param to The value to end the tween at.
     * @returns 
     */
    static quadraticOut(from: number, to: number): QuadraticOutTween {
        return new QuadraticOutTween(from, to);
    }
}