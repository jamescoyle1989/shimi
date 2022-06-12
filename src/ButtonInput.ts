'use strict';

import PropertyTracker from './PropertyTracker';
import ShimiEvent, { ShimiEventData } from './ShimiEvent';


/**
 * @category User Inputs
 */
export class ButtonEventData extends ShimiEventData<ButtonInput> {
    constructor(source: ButtonInput) {
        super(source);
    }
}


/**
 * @category User Inputs
 */
export class ButtonEvent extends ShimiEvent<ButtonEventData, ButtonInput> {
}


/**
 * @category User Inputs
 */
export default class ButtonInput {
    /** Tracks changes to the button's state */
    valueTracker: PropertyTracker<number>;
    /** Returns the current value of the button */
    get value(): number { return this.valueTracker.value; }
    /** Returns whether the button is pressed or not */
    get state(): boolean { return this.valueTracker.value != 0; }

    get name(): string { return this._name; }
    private _name: string;

    /** Returns how many consecutive milliseconds the button has been held pressed */
    get activeMs(): number { return this._activeMs; }
    private _activeMs: number = 0;

    /** Contains logic to run when the button is pressed */
    pressed: ButtonEvent = new ButtonEvent();

    /** Contains logic to run when the button is released */
    released: ButtonEvent = new ButtonEvent();

    /** Contains logic to run when the button's value is changed from one on state to another */
    changed: ButtonEvent = new ButtonEvent();

    constructor(name: string) {
        this.valueTracker = new PropertyTracker(0);
        this._name = name;
    }

    /**
     * Automatically called by the system, shouldn't be called by consumers of the library
     * Checks the state of the button and conditionally runs the logic attached to its events
     * @param deltaMs How many milliseconds since the last update cycle
     */
    update(deltaMs: number) {
        if (this.state)
            this._activeMs += deltaMs;
        if (this.valueTracker.isDirty) {
            if (this.state) {
                if (this.valueTracker.oldValue == 0)
                    this.pressed.trigger(new ButtonEventData(this));
                else
                    this.changed.trigger(new ButtonEventData(this));
            }
            else {
                this.released.trigger(new ButtonEventData(this));
                this._activeMs = 0;
            }
        }
        this.valueTracker.accept();
    }
}