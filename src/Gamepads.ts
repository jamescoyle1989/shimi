'use strict';

import Clock, { ClockChildFinishedEvent, ClockChildFinishedEventData, IClockChild } from './Clock';
import ButtonInput from './ButtonInput';
import SliderInput from './SliderInput';


/**
 * The Gamepads class provides an easy way for keeping shimi Gamepad objects synced up to Gamepad objects from the Gamepad Web API.
 * 
 * When a gamepad gets added to a Gamepads instance, it is added as unmatched. With each update cycle, Gamepads will attempt to pair up any unmatched gamepad objects with incoming gamepad data. Once a match is established, the gamepad object will get updated with new gamepad data each cycle, allowing for the state of each button to be easily tracked.
 * 
 * @category User Inputs
 */
export default class Gamepads implements IClockChild {
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.Gamepads'; }

    // The gamepads which have been added but not matched to an input yet
    private _unmatched: IGamepad[] = [];

    // The gamepads which have been matched to an input
    private _matched: IGamepad[] = [ null, null, null, null ];

    /** The collection of shimi gamepads which have been matched up to incoming gamepad data. */
    get activeGamepads(): IGamepad[] { return this._matched.filter(x => x !== null); }

    private _updateProvider: () => Gamepad[];

    /**
     * @param updateProvider This is a function that will be called with each update to get new Gamepad data.
     * 
     * Typically this should be something like: `new Gamepads(() => navigator.getGamepads());`
     */
    constructor(updateProvider: () => Gamepad[]) {
        this._updateProvider = updateProvider;
        if (!!Clock.default)
            Clock.default.addChild(this);
    }

    /**
     * This method adds a new shimi Gamepad object to the collection of unmatched gamepads.
     * @param gamepad The gamepad to be added.
     */
    add(gamepad: IGamepad) {
        this._unmatched.push(gamepad);
    }
    

    /**
     * This method is intended to be called by a clock to provide regular updates. It should not be called by consumers of the library.
     * 
     * The method first of all attempts to match up any unmatched gamepad objects with incoming gamepad data. It then loops through each matched gamepad and updates the object's data with what's coming from the matched up gamepad data.
     * @param deltaMs How many milliseconds have passed since the last update cycle.
     */
    update(deltaMs: number): void {
        const newGamepads = this._updateProvider();

        //Try to match unmatched gamepads
        for (let i = 0; i < newGamepads.length && i < 4; i++) {
            if (this._matched[i] == null && newGamepads[i] != null) {
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
    
    /** Provides a way of identifying keyboards so they can be easily retrieved later */
    get ref(): string { return this._ref; }
    set ref(value: string) { this._ref = value; }
    private _ref: string;

    /** Returns true if the `finish()` method has been called. */
    get isFinished(): boolean { return this._isFinished; }
    private _isFinished: boolean = false;

    /** This event fires when the `finish()` method has been called. */
    get finished(): ClockChildFinishedEvent { return this._finished; }
    private _finished: ClockChildFinishedEvent = new ClockChildFinishedEvent();

    /** Calling this tells the Gamepads object to stop whatever it's doing and that it will no longer be used. */
    finish(): void {
        this._isFinished = true;
        this.finished.trigger(new ClockChildFinishedEventData(this));
    }

    /**
     * Provides a way for setting the ref through a chained function call. For example:
     * 
     * ```
     * clock.addChild(new Gamepads(() => navigator.getGamepads()).withRef('gamepads'));
     * ```
     * 
     * @param ref The ref to set on the object.
     * @returns The calling object.
     */
    withRef(ref: string): IClockChild {
        this._ref = ref;
        return this;
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