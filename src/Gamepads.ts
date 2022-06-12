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
                    if (unmatched.match(newGamepads[i])) {
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


export interface IGamepad {
    /** Used for matching a gamepad to one of the objects retrieved from the update call */
    match(gamepadObject: Gamepad): boolean;

    get buttons(): ButtonInput[];

    get axes(): SliderInput[];

    update(deltaMs: number): void;
}