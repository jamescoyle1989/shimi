'use strict';

import PropertyTracker from './PropertyTracker';
import ShimiEvent, { ShimiEventData } from './ShimiEvent';


/**
 * The ButtonEventData class extends ShimiEventData. It contains a reference to the source ButtonInput that created the event.
 * 
 * @category User Inputs
 */
export class ButtonEventData extends ShimiEventData<ButtonInput> {
    constructor(source: ButtonInput) {
        super(source);
    }
}


/**
 * The ButtonEvent class extends ShimiEvent, providing an object which can be subscribed to.
 * 
 * When the event is fired, it calls all subscribed event handlers, passing in a ButtonEventData object containing information about the button that triggered the event.
 * 
 * @category User Inputs
 */
export class ButtonEvent extends ShimiEvent<ButtonEventData, ButtonInput> {
}


/**
 * The ButtonInput class models a button which can be pressed or released. Pressure-sensitive buttons are also supported, with changes in pressure announced through the `changed` ButtonEvent.
 * 
 * @category User Inputs
 */
export default class ButtonInput {
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.ButtonInput'; }

    /** Tracks changes to the button's state. */
    valueTracker: PropertyTracker<number>;

    /** Returns the current value of the button. */
    get value(): number { return this.valueTracker.value; }

    /** Returns whether the button is currently pressed. */
    get isPressed(): boolean { return this.valueTracker.value != 0; }

    /** The name property allows for an easy way to identify a button when it may be one of many buttons available.
     */
    get name(): string { return this._name; }
    private _name: string;

    /** Returns how many consecutive milliseconds the button has been held pressed for. If the button is not currently pressed, this will return 0. */
    get activeMs(): number { return this._activeMs; }
    private _activeMs: number = 0;

    /** This event is fired every time the button switches state from not being pressed, to being pressed. */
    pressed: ButtonEvent = new ButtonEvent();

    /** This event is fired every time the button switches state from being pressed, to not being pressed. */
    released: ButtonEvent = new ButtonEvent();

    /** This event is fired every time the button remains being pressed, but changes how hard it's being pressed. */
    changed: ButtonEvent = new ButtonEvent();

    /**
     * @param name The name property allows for an easy way to identify a button when it may be one of many buttons available.
     */
    constructor(name: string) {
        this.valueTracker = new PropertyTracker(0);
        this._name = name;
    }

    /**
     * This method is intended to be called by a clock to provide regular updates. It should not be called by consumers of the library.
     * @param deltaMs How many milliseconds have passed since the last update cycle.
     * @returns 
     */
    update(deltaMs: number) {
        if (this.isPressed)
            this._activeMs += deltaMs;
        if (this.valueTracker.isDirty) {
            if (this.isPressed) {
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