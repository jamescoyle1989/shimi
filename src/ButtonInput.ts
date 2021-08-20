'use strict';

import PropertyTracker from './PropertyTracker';
import ShimiEvent, { ShimiEventData } from './ShimiEvent';


export class ButtonEventData extends ShimiEventData<ButtonInput> {
    constructor(source: ButtonInput) {
        super(source);
    }
}


export class ButtonEvent extends ShimiEvent<ButtonEventData, ButtonInput> {
}


export default class ButtonInput {
    /** Tracks changes to the button's state */
    stateTracker: PropertyTracker<boolean>;
    /** Returns whether the button is pressed or not */
    get state(): boolean { return this.stateTracker.value; }

    get name(): string { return this._name; }
    private _name: string;

    /** Returns how many consecutive milliseconds the button has been held pressed */
    get activeMs(): number { return this._activeMs; }
    private _activeMs: number = 0;

    /** Contains logic to run when the button is pressed */
    pressed: ButtonEvent = new ButtonEvent();

    /** Contains logic to run when the button is released */
    released: ButtonEvent = new ButtonEvent();

    constructor(name: string) {
        this.stateTracker = new PropertyTracker(false);
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
        if (this.stateTracker.isDirty) {
            if (this.state)
                this.pressed.trigger(new ButtonEventData(this));
            else {
                this.released.trigger(new ButtonEventData(this));
                this._activeMs = 0;
            }
        }
        this.stateTracker.accept();
    }
}