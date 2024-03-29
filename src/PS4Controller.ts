'use strict';

import ButtonInput from './ButtonInput';
import SliderInput from './SliderInput';
import { IGamepad } from './Gamepads';


/**
 * The PS4Controller class models a single PS4 controller connected to the computer, providing ButtonInput & SliderInput properties for the various inputs on the controller.
 * 
 * @category User Inputs
 */
export default class PS4Controller implements IGamepad {
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.PS4Controller'; }

    /** The collection of all buttons on the gamepad. */
    get buttons(): ButtonInput[] { return this._buttons; }
    private _buttons: ButtonInput[];

    /** The collection of all axes on the gamepad. */
    get axes(): SliderInput[] { return this._axes; }
    private _axes: SliderInput[];


    /** ButtonInput for L1. */
    get L1(): ButtonInput { return this._l1; }
    private _l1: ButtonInput = new ButtonInput('L1');

    /** ButtonInput for L2. Supports pressure sensitivity. */
    get L2(): ButtonInput { return this._l2; }
    private _l2: ButtonInput = new ButtonInput('L2');

    /** ButtonInput for R1. */
    get R1(): ButtonInput { return this._r1; }
    private _r1: ButtonInput = new ButtonInput('R1');

    /** ButtonInput for R2. Supports pressure sensitivity. */
    get R2(): ButtonInput { return this._r2; }
    private _r2: ButtonInput = new ButtonInput('R2');

    /** ButtonInput for X. */
    get x(): ButtonInput { return this._x; }
    private _x: ButtonInput = new ButtonInput('x');

    /** ButtonInput for Square. */
    get square(): ButtonInput { return this._square; }
    private _square: ButtonInput = new ButtonInput('square');

    /** ButtonInput for Circle. */
    get circle(): ButtonInput { return this._circle; }
    private _circle: ButtonInput = new ButtonInput('circle');

    /** ButtonInput for Triangle. */
    get triangle(): ButtonInput { return this._triangle; }
    private _triangle: ButtonInput = new ButtonInput('triangle');

    /** ButtonInput for Up on the D-Pad. */
    get up(): ButtonInput { return this._up; }
    private _up: ButtonInput = new ButtonInput('up');

    /** ButtonInput for Left on the D-Pad. */
    get left(): ButtonInput { return this._left; }
    private _left: ButtonInput = new ButtonInput('left');

    /** ButtonInput for Right on the D-Pad. */
    get right(): ButtonInput { return this._right; }
    private _right: ButtonInput = new ButtonInput('right');

    /** ButtonInput for Down on the D-Pad. */
    get down(): ButtonInput { return this._down; }
    private _down: ButtonInput = new ButtonInput('down');

    /** ButtonInput for Share. */
    get share(): ButtonInput { return this._share; }
    private _share: ButtonInput = new ButtonInput('share');

    /** ButtonInput for Options. */
    get options(): ButtonInput { return this._options; }
    private _options: ButtonInput = new ButtonInput('options');

    /** ButtonInput for L3 (when you push in the left analog stick). */
    get L3(): ButtonInput { return this._l3; }
    private _l3: ButtonInput = new ButtonInput('L3');

    /** SliderInput for the X-axis of the left analog stick. -1 = fully left, +1 = fully right */
    get L3_X(): SliderInput { return this._l3_x; }
    private _l3_x: SliderInput = new SliderInput('L3_X');

    /** SliderInput for the Y-axis of the left analog stick. -1 = fully up, +1 = fully down */
    get L3_Y(): SliderInput { return this._l3_y; }
    private _l3_y: SliderInput = new SliderInput('L3_Y');

    /** How far away from center the L3 analog stick is. Value ranges from 0 to 1. */
    get L3_magnitude(): SliderInput { return this._l3_magnitude; }
    private _l3_magnitude: SliderInput = new SliderInput('L3_magnitude');

    /** The angle of the L3 analog stick, measured clockwise in degrees from the stick pointing directly upwards. Values fall in the range (-180, 180] */
    get L3_rotation(): SliderInput { return this._l3_rotation; }
    private _l3_rotation: SliderInput = new SliderInput('L3_rotation');

    /** ButtonInput for R3 (when you push in the right analog stick). */
    get R3(): ButtonInput { return this._r3; }
    private _r3: ButtonInput = new ButtonInput('R3');

    /** SliderInput for the X-axis of the right analog stick. -1 = fully left, +1 = fully right */
    get R3_X(): SliderInput { return this._r3_x; }
    private _r3_x: SliderInput = new SliderInput('R3_X');

    /** SliderInput for the Y-axis of the right analog stick. -1 = fully up, +1 = fully down */
    get R3_Y(): SliderInput { return this._r3_y; }
    private _r3_y: SliderInput = new SliderInput('R3_Y');

    /** How far away from center the R3 analog stick is. Value ranges from 0 to 1. */
    get R3_magnitude(): SliderInput { return this._r3_magnitude; }
    private _r3_magnitude: SliderInput = new SliderInput('R3_magnitude');

    /** The angle of the R3 analog stick, measured clockwise in degrees from the stick pointing directly upwards. Values fall in the range (-180, 180] */
    get R3_rotation(): SliderInput { return this._r3_rotation; }
    private _r3_rotation: SliderInput = new SliderInput('R3_rotation');

    /** ButtonInput for PS button. */
    get PS(): ButtonInput { return this._ps; }
    private _ps: ButtonInput = new ButtonInput('PS');

    /** ButtonInput for touchpad. */
    get touchpad(): ButtonInput { return this._touchpad; }
    private _touchpad: ButtonInput = new ButtonInput('touchpad');


    constructor() {
        this._buttons = [
            this.x,
            this.circle,
            this.square,
            this.triangle,
            this.L1,
            this.R1,
            this.L2,
            this.R2,
            this.share,
            this.options,
            this.L3,
            this.R3,
            this.up,
            this.down,
            this.left,
            this.right,
            this.PS,
            this.touchpad
        ];

        this._axes = [
            this.L3_X,
            this.L3_Y,
            this.R3_X,
            this.R3_Y
        ];
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
        
        this.L3_magnitude.valueTracker.value = Math.min(1, Math.sqrt(Math.pow(this.L3_X.value, 2) + Math.pow(this.L3_Y.value, 2)));
        this.L3_magnitude.update(deltaMs);
        
        this.R3_magnitude.valueTracker.value = Math.min(1, Math.sqrt(Math.pow(this.R3_X.value, 2) + Math.pow(this.R3_Y.value, 2)));
        this.R3_magnitude.update(deltaMs);

        if (this.L3_X.value == 0 && this.L3_Y.value == 0)
            this.L3_rotation.valueTracker.value = 0;
        else
            this.L3_rotation.valueTracker.value = Math.atan2(this.L3_X.value, -this.L3_Y.value) * 180 / Math.PI;
        this.L3_rotation.update(deltaMs);

        if (this.R3_X.value == 0 && this.R3_Y.value == 0)
            this.R3_rotation.valueTracker.value = 0;
        else
            this.R3_rotation.valueTracker.value = Math.atan2(this.R3_X.value, -this.R3_Y.value) * 180 / Math.PI;
        this.R3_rotation.update(deltaMs);
    }

    /**
     * Checks if the passed in Gamepad API object can be matched to this PS4 controller, requiring that it have 16 buttons & 4 axes.
     * @param gamepadObject The Gamepad API object to potentially be matched to.
     * @returns 
     */
    canMatch(gamepadObject: Gamepad): boolean {
        return gamepadObject.buttons.length == this.buttons.length && gamepadObject.axes.length == this.axes.length;
    }
}