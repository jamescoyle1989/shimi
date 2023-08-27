'use strict';

import PropertyTracker from './PropertyTracker';
import ShimiEvent, { ShimiEventData } from './ShimiEvent';


/**
 * The SliderEventData class extends ShimiEventData. It contains a reference to the source SliderInput that created the event.
 * 
 * @category User Inputs
 */
export class SliderEventData extends ShimiEventData<SliderInput> {
    constructor(source: SliderInput) {
        super(source);
    }
}


/**
 * The SliderEvent class extends ShimiEvent, providing an object which can be subscribed to.
 * 
 * When the event is fired, it calls all subscribed event handlers, passing in a SliderEventData object containing information about the slider that triggered the event.
 * 
 * @category User Inputs
 */
export class SliderEvent extends ShimiEvent<SliderEventData, SliderInput> {
}


/**
 * The SliderInput class models a slider that can move through a range of numerical values.
 * 
 * @category User Inputs
 */
export default class SliderInput {
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.SliderInput'; }

    /** Tracks changes to the sliders value. */
    valueTracker: PropertyTracker<number>;

    /** Returns the value of the slider. */
    get value(): number { return this.valueTracker.value; }

    /** The name property allows for an easy way to identify a button when it may be one of many sliders available. */
    get name(): string { return this._name; }
    private _name: string;

    /** Returns how many consecutive milliseconds the slider has had a non-zero value. */
    get activeMs(): number { return this._activeMs; }
    private _activeMs: number = 0;

    /** This event is fired every time the slider value changes. */
    changed: SliderEvent = new SliderEvent();

    /**
     * @param name The name property allows for an easy way to identify a button when it may be one of many sliders available.
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
        if (this.value != 0)
            this._activeMs += deltaMs;
        if (this.valueTracker.isDirty)
            this.changed.trigger(new SliderEventData(this));
        if (this.value == 0)
            this._activeMs = 0;
        this.valueTracker.accept();
    }
}