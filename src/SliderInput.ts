'use strict';

import PropertyTracker from './PropertyTracker';
import ShimiEvent, { ShimiEventData } from './ShimiEvent';


export class SliderEventData extends ShimiEventData<SliderInput> {
    constructor(source: SliderInput) {
        super(source);
    }
}


export class SliderEvent extends ShimiEvent<SliderEventData, SliderInput> {
}


export default class SliderInput {
    /** Tracks changes to the sliders value */
    valueTracker: PropertyTracker<number>;
    /** Returns the value of the slider */
    get value(): number { return this.valueTracker.value; }

    get name(): string { return this._name; }
    private _name: string;

    /** Returns how many consecutive milliseconds the slider has had a non-zero value */
    get activeMs(): number { return this._activeMs; }
    private _activeMs: number = 0;

    /** Contains logic to run when the value is changed */
    changed: SliderEvent = new SliderEvent();

    constructor(name: string) {
        this.valueTracker = new PropertyTracker(0);
        this._name = name;
    }

    /**
     * Automatically called by the system, shouldn't be called by consumers of the library
     * Checks the state of teh button and conditionally runs the logic attached to its events
     * @param deltaMs How many millseconds since the last update cycle
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