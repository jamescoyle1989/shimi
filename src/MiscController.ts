'use strict';

import ButtonInput from './ButtonInput';
import SliderInput from './SliderInput';
import { IGamepad } from './Gamepads';


/**
 * The MiscController class allows for modelling a controller of unknown type which shimi doesn't yet have built-in support for.
 * 
 * @category User Inputs
 */
export default class MiscController implements IGamepad {
    /** The collection of all buttons on the gamepad. */
    get buttons(): ButtonInput[] { return this._buttons; }
    private _buttons: ButtonInput[];

    /** The collection of all axes on the gamepad. */
    get axes(): SliderInput[] { return this._axes; }
    private _axes: SliderInput[];

    /**
     * @param buttonNames The collection of button names which will be used for representing the incoming button data. The button names should be unique, and listed in the order which they will match to button indices. The number of button names defines the number of button states that the MiscController expects to receive with each update.
     * @param axisNames The collection of axis names which will be used for representing the incoming axis data. The axis names should be unique, and listed in the order which they will match to axis indices. The number of axis names defines the number of axis states that the MiscController expects to receive with each update.
     */
    constructor(buttonNames: Array<string>, axisNames: Array<string>) {
        for (let i = 0; i < buttonNames.length; i++) {
            for (let j = i + 1; j < buttonNames.length; j++) {
                if (buttonNames[i] == buttonNames[j])
                    throw new Error(`The button name '${buttonNames[i]}' is repeated.`);
            }

            for (let j = 0; j < axisNames.length; j++) {
                if (buttonNames[i] == axisNames[j])
                    throw new Error(`The button name '${buttonNames[i]}' cannot also be used for an axis.`);
            }
        }

        for (let i = 0; i < axisNames.length; i++) {
            for (let j = i + 1; j < axisNames.length; j++) {
                if (axisNames[i] == axisNames[j])
                    throw new Error(`The axis name '${axisNames[i]}' is repeated.`);
            }
        }
        
        this._buttons = buttonNames.map(x => new ButtonInput(x));
        this._axes = axisNames.map(x => new SliderInput(x));

        for (const button of this.buttons) {
            if (this[button.name] != undefined)
                throw new Error(`Cannot use'${button.name}' as a button name.`);
            this[button.name] = button;
        }
        for (const axis of this.axes) {
            if (this[axis.name] != undefined)
                throw new Error(`Cannot use'${axis.name}' as an axis name.`);
            this[axis.name] = axis;
        }
    }

    /**
     * Automatically called by the system, shouldn't be called by consumers of the library. Updates each button and slider on the controller.
     * @param deltaMs How many milliseconds since the last update cycle
     */
    update(deltaMs: number): void {
        for (const button of this.buttons)
            button.update(deltaMs);
        for (const axis of this.axes)
            axis.update(deltaMs);
    }

    /**
     * Checks if the passed in Gamepad API object can be matched to this controller, requiring that it have the same number of buttons & axes as were used when the controller was set up.
     * @param gamepadObject The Gamepad API object to potentially be matched to.
     * @returns 
     */
    canMatch(gamepadObject: Gamepad): boolean {
        return gamepadObject.buttons.length == this.buttons.length && gamepadObject.axes.length == this.axes.length;
    }
}