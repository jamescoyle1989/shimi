'use strict';

import { IClockChild } from './Clock';
import ButtonInput from './ButtonInput';
import SliderInput from './SliderInput';


/**
 * @category User Inputs
 */
export default class Gamepads implements IClockChild {
    // The gamepads which have been added but not matched to an input yet
    private _unmatched: IGamepad[] = [];

    // The gamepads which have been matched to an input
    private _matched: IGamepad[] = [ null, null, null, null ];

    get activeGamepads(): IGamepad[] { return this._matched.filter(x => x !== null); }

    private _updateProvider: () => Gamepad[];

    constructor(updateProvider: () => Gamepad[]) {
        this._updateProvider = updateProvider;
    }

    add(gamepad: IGamepad) {
        this._unmatched.push(gamepad);
    }
    
    /** IClockChild implementation */
    update(deltaMs: number): void {
        const newGamepads = this._updateProvider();

        //Try to match unmatched gamepads
        for (let i = 0; i < newGamepads.length && i < 4; i++) {
            if (this._matched[i] == null) {
                for (let j = 0; j < this._unmatched.length; j++) {
                    const unmatched = this._unmatched[j];
                    if (unmatched.canMatch(newGamepads[i])) {
                        this._matched[i] = unmatched;
                        this._unmatched = this._unmatched.filter(x => x !== unmatched);
                        break;
                    }
                }
            }
        }

        //Loop through each mapped gamepad and update
        for (let i = 0; i < 4; i++) {
            const matched = this._matched[i];
            if (!matched)
                continue;

            const newValues = newGamepads[i];
            if (!newValues) {
                this._matched[i] = null;
                this._unmatched.push(matched);
                continue;
            }

            for (let j = 0; j < matched.buttons.length && j < newValues.buttons.length; j++) {
                const matchedButton = matched.buttons[j];
                const newButtonValue = newValues.buttons[j];
                matchedButton.valueTracker.value = newButtonValue.value;
            }

            for (let j = 0; j < matched.axes.length && j < newValues.axes.length; j++) {
                const matchedAxis = matched.axes[j];
                const newAxisValue = newValues.axes[j];
                matchedAxis.valueTracker.value = newAxisValue;
            }

            matched.update(deltaMs);
        }
    }
    
    /** Provides a way of identifying keyboards so they can be retrieved later */
    get ref(): string { return this._ref; }
    /** Provides a way of identifying keyboards so they can be retrieved later */
    set ref(value: string) { this._ref = value; }
    private _ref: string;

    get finished(): boolean { return this._finished; }
    private _finished: boolean = false;

    finish(): void {
        this._finished = true;
    }
}


/**
 * IGamepad provides an interface which any shimi gamepad class should implement in order to be easily managed by the [Gamepads](https://jamescoyle1989.github.io/shimi/classes/Gamepads.html) class.
 * 
 * @category User Inputs
 */
export interface IGamepad {
    /**
     * Allows each implementation of IGamepad to define which Gamepad API objects it is able to be matched with. 
     * 
     * As an example, the PS4Controller implementation returns true only if the passed in gamepad has 16 buttons and 4 axes.
     * 
     * This method shouldn't need to be called by consumers of the library. It is expected that only the Gamepads class will make calls to this when trying to automatically pair shimi gamepad objects to Gamepad API objects.
     * 
     * @param gamepadObject The Gamepad API object to test whether it would be a good match
     */
    canMatch(gamepadObject: Gamepad): boolean;

    /**
     * The collection of all buttons on the gamepad.
     * 
     * These are expected to be defined in the same order that they're contained on the linked Gamepad API object.
     * 
     * Unlike the Gamepad API objects, the collection of buttons here each track their state and provide events for subscribing to.
     */
    get buttons(): ButtonInput[];

    /**
     * The collection of all axes on the gamepad. An example of an axis would be the Y-direction on an analog stick.
     * 
     * These are expected to be defined in the same order that they're contained on the linked Gamepad API object.
     * 
     * Unlike the Gamepad API objects, the collection of axes here each track their state and provide events for subscribing to.
     */
    get axes(): SliderInput[];

    /**
     * This method should only be called by the Gamepads class. There should be no reason for consumers of the library to call it.
     * 
     * If designing your own IGamepad implementation, unless you have very good reason to do otherwise, implement this method as:
     * ```
     *  update(deltaMs: number): void {
     *      for (const button of this.buttons)
     *          button.update(deltaMs);
     *      for (const axis of this.axes)
     *          axis.update(deltaMs);
     *  }
     * ```
     * 
     * @param deltaMs How many milliseconds have passed since the last update
     */
    update(deltaMs: number): void;
}