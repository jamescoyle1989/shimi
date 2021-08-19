'use strict';

import ButtonInput from './ButtonInput';
import { IClockChild } from './Clock';
import { IEventSubscriber } from './EventSubscriber';


export default class Keyboard implements IClockChild {
    get buttons(): ButtonInput[] { return this._buttons; }
    private _buttons: ButtonInput[] = [];


    get Q(): ButtonInput { return this._Q; }
    private _Q: ButtonInput = new ButtonInput();

    get W(): ButtonInput { return this._W; }
    private _W: ButtonInput = new ButtonInput();

    get E(): ButtonInput { return this._E; }
    private _E: ButtonInput = new ButtonInput();

    get R(): ButtonInput { return this._R; }
    private _R: ButtonInput = new ButtonInput();

    get T(): ButtonInput { return this._T; }
    private _T: ButtonInput = new ButtonInput();

    get Y(): ButtonInput { return this._Y; }
    private _Y: ButtonInput = new ButtonInput();

    get U(): ButtonInput { return this._U; }
    private _U: ButtonInput = new ButtonInput();

    get I(): ButtonInput { return this._I; }
    private _I: ButtonInput = new ButtonInput();

    get O(): ButtonInput { return this._O; }
    private _O: ButtonInput = new ButtonInput();

    get P(): ButtonInput { return this._P; }
    private _P: ButtonInput = new ButtonInput();
    

    get A(): ButtonInput { return this._A; }
    private _A: ButtonInput = new ButtonInput();

    get S(): ButtonInput { return this._S; }
    private _S: ButtonInput = new ButtonInput();

    get D(): ButtonInput { return this._D; }
    private _D: ButtonInput = new ButtonInput();

    get F(): ButtonInput { return this._F; }
    private _F: ButtonInput = new ButtonInput();

    get G(): ButtonInput { return this._G; }
    private _G: ButtonInput = new ButtonInput();

    get H(): ButtonInput { return this._H; }
    private _H: ButtonInput = new ButtonInput();

    get J(): ButtonInput { return this._J; }
    private _J: ButtonInput = new ButtonInput();

    get K(): ButtonInput { return this._K; }
    private _K: ButtonInput = new ButtonInput();

    get L(): ButtonInput { return this._L; }
    private _L: ButtonInput = new ButtonInput();
    

    get Z(): ButtonInput { return this._Z; }
    private _Z: ButtonInput = new ButtonInput();

    get X(): ButtonInput { return this._X; }
    private _X: ButtonInput = new ButtonInput();

    get C(): ButtonInput { return this._C; }
    private _C: ButtonInput = new ButtonInput();

    get V(): ButtonInput { return this._V; }
    private _V: ButtonInput = new ButtonInput();

    get B(): ButtonInput { return this._B; }
    private _B: ButtonInput = new ButtonInput();

    get N(): ButtonInput { return this._N; }
    private _N: ButtonInput = new ButtonInput();

    get M(): ButtonInput { return this._M; }
    private _M: ButtonInput = new ButtonInput();


    get up(): ButtonInput { return this._up; }
    private _up: ButtonInput = new ButtonInput();

    get left(): ButtonInput { return this._left; }
    private _left: ButtonInput = new ButtonInput();

    get down(): ButtonInput { return this._down; }
    private _down: ButtonInput = new ButtonInput();

    get right(): ButtonInput { return this._right; }
    private _right: ButtonInput = new ButtonInput();


    get numlock(): ButtonInput { return this._numlock; }
    private _numlock: ButtonInput = new ButtonInput();

    get numpadDivide(): ButtonInput { return this._numpadDivide; }
    private _numpadDivide: ButtonInput = new ButtonInput();

    get numpadMultiply(): ButtonInput { return this._numpadMultiply; }
    private _numpadMultiply: ButtonInput = new ButtonInput();

    get numpadSubtract(): ButtonInput { return this._numpadSubtract; }
    private _numpadSubtract: ButtonInput = new ButtonInput();

    get numpad7(): ButtonInput { return this._numpad7; }
    private _numpad7: ButtonInput = new ButtonInput();

    get numpad8(): ButtonInput { return this._numpad8; }
    private _numpad8: ButtonInput = new ButtonInput();

    get numpad9(): ButtonInput { return this._numpad9; }
    private _numpad9: ButtonInput = new ButtonInput();

    get numpadAdd(): ButtonInput { return this._numpadAdd; }
    private _numpadAdd: ButtonInput = new ButtonInput();

    get numpad4(): ButtonInput { return this._numpad4; }
    private _numpad4: ButtonInput = new ButtonInput();

    get numpad5(): ButtonInput { return this._numpad5; }
    private _numpad5: ButtonInput = new ButtonInput();

    get numpad6(): ButtonInput { return this._numpad6; }
    private _numpad6: ButtonInput = new ButtonInput();

    get numpad1(): ButtonInput { return this._numpad1; }
    private _numpad1: ButtonInput = new ButtonInput();

    get numpad2(): ButtonInput { return this._numpad2; }
    private _numpad2: ButtonInput = new ButtonInput();

    get numpad3(): ButtonInput { return this._numpad3; }
    private _numpad3: ButtonInput = new ButtonInput();

    get numpadEnter(): ButtonInput { return this._numpadEnter; }
    private _numpadEnter: ButtonInput = new ButtonInput();

    get numpad0(): ButtonInput { return this._numpad0; }
    private _numpad0: ButtonInput = new ButtonInput();

    get numpadDecimal(): ButtonInput { return this._numpadDecimal; }
    private _numpadDecimal: ButtonInput = new ButtonInput();


    private _eventSubscriber: IEventSubscriber;

    constructor(eventSubscriber: IEventSubscriber) {
        this._eventSubscriber = eventSubscriber;
        this.buttons.push(this.Q, this.W, this.E, this.R, this.T, this.Y, this.U, this.I, this.O, this.P);
        this.buttons.push(this.A, this.S, this.D, this.F, this.G, this.H, this.J, this.K, this.L);
        this.buttons.push(this.Z, this.X, this.C, this.V, this.B, this.N, this.M);
        this.buttons.push(this.up, this.left, this.down, this.right);
        this.buttons.push(
            this.numlock, this.numpadDivide, this.numpadMultiply, this.numpadSubtract,
            this.numpad7, this.numpad8, this.numpad9, this.numpadAdd,
            this.numpad4, this.numpad5, this.numpad6,
            this.numpad1, this.numpad2, this.numpad3, this.numpadEnter,
            this.numpad0, this.numpadDecimal
        );
    }

    private _activated: boolean = false;

    /** Start listening to keyboard events */
    activate(): boolean {
        if (this._activated)
            return false;
        this._eventSubscriber.subscribe('keydown', this._onKeyDown);
        this._eventSubscriber.subscribe('keyup', this._onKeyUp);
        this._activated = true;
        return true;
    }

    /** Stop listening to keyboard events */
    deactivate(): boolean {
        if (!this._activated)
            return false;
        this._eventSubscriber.unsubscribe('keydown', this._onKeyDown);
        this._eventSubscriber.unsubscribe('keyup', this._onKeyUp);
        this._activated = false;
        return true;
    }

    private _onKeyDown(event: KeyboardEvent) {
        const button = this._getButtonByEventCode(event.code);
        if (button) {
            button.stateTracker.value = true;
            button.update(0);
        }
    }

    private _onKeyUp(event: KeyboardEvent) {
        const button = this._getButtonByEventCode(event.code);
        if (button) {
            button.stateTracker.value = false;
            button.update(0);
        }
    }

    private _getButtonByEventCode(eventCode: string): ButtonInput {
        switch (eventCode) {
            case 'KeyQ': return this.Q;
            case 'KeyW': return this.W;
            case 'KeyE': return this.E;
            case 'KeyR': return this.R;
            case 'KeyT': return this.T;
            case 'KeyY': return this.Y;
            case 'KeyU': return this.U;
            case 'KeyI': return this.I;
            case 'KeyO': return this.O;
            case 'KeyP': return this.P;
            
            case 'KeyA': return this.A;
            case 'KeyS': return this.S;
            case 'KeyD': return this.D;
            case 'KeyF': return this.F;
            case 'KeyG': return this.G;
            case 'KeyH': return this.H;
            case 'KeyJ': return this.J;
            case 'KeyK': return this.K;
            case 'KeyL': return this.L;
            
            case 'KeyZ': return this.Z;
            case 'KeyX': return this.X;
            case 'KeyC': return this.C;
            case 'KeyV': return this.V;
            case 'KeyB': return this.B;
            case 'KeyN': return this.N;
            case 'KeyM': return this.M;

            case 'ArrowUp': return this.up;
            case 'ArrowLeft': return this.left;
            case 'ArrowDown': return this.down;
            case 'ArrowRight': return this.right;

            case 'NumLock': return this.numlock;
            case 'NumpadDivide': return this.numpadDivide;
            case 'NumpadMultiply': return this.numpadMultiply;
            case 'NumpadSubtract': return this.numpadSubtract;
            case 'Numpad7': return this.numpad7;
            case 'Numpad8': return this.numpad8;
            case 'Numpad9': return this.numpad9;
            case 'NumpadAdd': return this.numpadAdd;
            case 'Numpad4': return this.numpad4;
            case 'Numpad5': return this.numpad5;
            case 'Numpad6': return this.numpad6;
            case 'Numpad1': return this.numpad1;
            case 'Numpad2': return this.numpad2;
            case 'Numpad3': return this.numpad3;
            case 'NumpadEnter': return this.numpadEnter;
            case 'Numpad0': return this.numpad0;
            case 'NumpadDecimal': return this.numpadDecimal;
        }
        return null;
    }

    /** IClockChild implementation */
    update(deltaMs: number): void {
        for (const button of this.buttons)
            button.update(deltaMs);
    }
}