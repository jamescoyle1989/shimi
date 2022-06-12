'use strict';

import ButtonInput from './ButtonInput';
import { IClockChild } from './Clock';
import { IEventSubscriber } from './EventSubscriber';


/**
 * @category User Inputs
 */
export default class Keyboard implements IClockChild {
    get buttons(): ButtonInput[] { return this._buttons; }
    private _buttons: ButtonInput[] = [];

    /** Provides a way of identifying keyboards so they can be retrieved later */
    get ref(): string { return this._ref; }
    /** Provides a way of identifying keyboards so they can be retrieved later */
    set ref(value: string) { this._ref = value; }
    private _ref: string;

    get finished(): boolean { return this._finished; }
    private _finished: boolean = false;


    get escape(): ButtonInput { return this._escape; }
    private _escape: ButtonInput = new ButtonInput('escape');

    get f1(): ButtonInput { return this._f1; }
    private _f1: ButtonInput = new ButtonInput('f1');

    get f2(): ButtonInput { return this._f2; }
    private _f2: ButtonInput = new ButtonInput('f2');

    get f3(): ButtonInput { return this._f3; }
    private _f3: ButtonInput = new ButtonInput('f3');

    get f4(): ButtonInput { return this._f4; }
    private _f4: ButtonInput = new ButtonInput('f4');

    get f5(): ButtonInput { return this._f5; }
    private _f5: ButtonInput = new ButtonInput('f5');

    get f6(): ButtonInput { return this._f6; }
    private _f6: ButtonInput = new ButtonInput('f6');

    get f7(): ButtonInput { return this._f7; }
    private _f7: ButtonInput = new ButtonInput('f7');

    get f8(): ButtonInput { return this._f8; }
    private _f8: ButtonInput = new ButtonInput('f8');

    get f9(): ButtonInput { return this._f9; }
    private _f9: ButtonInput = new ButtonInput('f9');

    get f10(): ButtonInput { return this._f10; }
    private _f10: ButtonInput = new ButtonInput('f10');

    get f11(): ButtonInput { return this._f11; }
    private _f11: ButtonInput = new ButtonInput('f11');

    get f12(): ButtonInput { return this._f12; }
    private _f12: ButtonInput = new ButtonInput('f12');


    get backquote(): ButtonInput { return this._backquote; }
    private _backquote: ButtonInput = new ButtonInput('backquote');

    get numrow1(): ButtonInput { return this._numrow1; }
    private _numrow1: ButtonInput = new ButtonInput('numrow1');

    get numrow2(): ButtonInput { return this._numrow2; }
    private _numrow2: ButtonInput = new ButtonInput('numrow2');

    get numrow3(): ButtonInput { return this._numrow3; }
    private _numrow3: ButtonInput = new ButtonInput('numrow3');

    get numrow4(): ButtonInput { return this._numrow4; }
    private _numrow4: ButtonInput = new ButtonInput('numrow4');

    get numrow5(): ButtonInput { return this._numrow5; }
    private _numrow5: ButtonInput = new ButtonInput('numrow5');

    get numrow6(): ButtonInput { return this._numrow6; }
    private _numrow6: ButtonInput = new ButtonInput('numrow6');

    get numrow7(): ButtonInput { return this._numrow7; }
    private _numrow7: ButtonInput = new ButtonInput('numrow7');

    get numrow8(): ButtonInput { return this._numrow8; }
    private _numrow8: ButtonInput = new ButtonInput('numrow8');

    get numrow9(): ButtonInput { return this._numrow9; }
    private _numrow9: ButtonInput = new ButtonInput('numrow9');

    get numrow0(): ButtonInput { return this._numrow0; }
    private _numrow0: ButtonInput = new ButtonInput('numrow0');

    get minus(): ButtonInput { return this._minus; }
    private _minus: ButtonInput = new ButtonInput('minus');

    get equal(): ButtonInput { return this._equal; }
    private _equal: ButtonInput = new ButtonInput('equal');

    get backspace(): ButtonInput { return this._backspace; }
    private _backspace: ButtonInput = new ButtonInput('backspace');

    get tab(): ButtonInput { return this._tab; }
    private _tab: ButtonInput = new ButtonInput('tab');

    get q(): ButtonInput { return this._q; }
    private _q: ButtonInput = new ButtonInput('q');

    get w(): ButtonInput { return this._w; }
    private _w: ButtonInput = new ButtonInput('w');

    get e(): ButtonInput { return this._e; }
    private _e: ButtonInput = new ButtonInput('e');

    get r(): ButtonInput { return this._r; }
    private _r: ButtonInput = new ButtonInput('r');

    get t(): ButtonInput { return this._t; }
    private _t: ButtonInput = new ButtonInput('t');

    get y(): ButtonInput { return this._y; }
    private _y: ButtonInput = new ButtonInput('y');

    get u(): ButtonInput { return this._u; }
    private _u: ButtonInput = new ButtonInput('u');

    get i(): ButtonInput { return this._i; }
    private _i: ButtonInput = new ButtonInput('i');

    get o(): ButtonInput { return this._o; }
    private _o: ButtonInput = new ButtonInput('o');

    get p(): ButtonInput { return this._p; }
    private _p: ButtonInput = new ButtonInput('p');

    get leftBracket(): ButtonInput { return this._leftBracket; }
    private _leftBracket: ButtonInput = new ButtonInput('leftBracket');

    get rightBracket(): ButtonInput { return this._rightBracket; }
    private _rightBracket: ButtonInput = new ButtonInput('rightBracket');

    get enter(): ButtonInput { return this._enter; }
    private _enter: ButtonInput = new ButtonInput('enter');
    

    get capslock(): ButtonInput { return this._capslock; }
    private _capslock: ButtonInput = new ButtonInput('capslock');

    get a(): ButtonInput { return this._a; }
    private _a: ButtonInput = new ButtonInput('a');

    get s(): ButtonInput { return this._s; }
    private _s: ButtonInput = new ButtonInput('s');

    get d(): ButtonInput { return this._d; }
    private _d: ButtonInput = new ButtonInput('d');

    get f(): ButtonInput { return this._f; }
    private _f: ButtonInput = new ButtonInput('f');

    get g(): ButtonInput { return this._g; }
    private _g: ButtonInput = new ButtonInput('g');

    get h(): ButtonInput { return this._h; }
    private _h: ButtonInput = new ButtonInput('h');

    get j(): ButtonInput { return this._j; }
    private _j: ButtonInput = new ButtonInput('j');

    get k(): ButtonInput { return this._k; }
    private _k: ButtonInput = new ButtonInput('k');

    get l(): ButtonInput { return this._l; }
    private _l: ButtonInput = new ButtonInput('l');

    get semicolon(): ButtonInput { return this._semicolon; }
    private _semicolon: ButtonInput = new ButtonInput('semicolon');

    get quote(): ButtonInput { return this._quote; }
    private _quote: ButtonInput = new ButtonInput('quote');

    get backslash(): ButtonInput { return this._backslash; }
    private _backslash: ButtonInput = new ButtonInput('backslash');
    

    get leftShift(): ButtonInput { return this._leftShift; }
    private _leftShift: ButtonInput = new ButtonInput('leftShift');

    get intlBackslash(): ButtonInput { return this._intlBackslash; }
    private _intlBackslash: ButtonInput = new ButtonInput('intlBackslash');

    get z(): ButtonInput { return this._z; }
    private _z: ButtonInput = new ButtonInput('z');

    get x(): ButtonInput { return this._x; }
    private _x: ButtonInput = new ButtonInput('x');

    get c(): ButtonInput { return this._c; }
    private _c: ButtonInput = new ButtonInput('c');

    get v(): ButtonInput { return this._v; }
    private _v: ButtonInput = new ButtonInput('v');

    get b(): ButtonInput { return this._b; }
    private _b: ButtonInput = new ButtonInput('b');

    get n(): ButtonInput { return this._n; }
    private _n: ButtonInput = new ButtonInput('n');

    get m(): ButtonInput { return this._m; }
    private _m: ButtonInput = new ButtonInput('m');

    get comma(): ButtonInput { return this._comma; }
    private _comma: ButtonInput = new ButtonInput('comma');

    get period(): ButtonInput { return this._period; }
    private _period: ButtonInput = new ButtonInput('period');

    get slash(): ButtonInput { return this._slash; }
    private _slash: ButtonInput = new ButtonInput('slash');

    get rightShift(): ButtonInput { return this._rightShift; }
    private _rightShift: ButtonInput = new ButtonInput('rightShift');


    get leftCtrl(): ButtonInput { return this._leftCtrl; }
    private _leftCtrl: ButtonInput = new ButtonInput('leftCtrl');

    get leftAlt(): ButtonInput { return this._leftAlt; }
    private _leftAlt: ButtonInput = new ButtonInput('leftAlt');

    get space(): ButtonInput { return this._space; }
    private _space: ButtonInput = new ButtonInput('space');

    get rightAlt(): ButtonInput { return this._rightAlt; }
    private _rightAlt: ButtonInput = new ButtonInput('rightAlt');

    get rightCtrl(): ButtonInput { return this._rightCtrl; }
    private _rightCtrl: ButtonInput = new ButtonInput('rightCtrl');


    get insert(): ButtonInput { return this._insert; }
    private _insert: ButtonInput = new ButtonInput('insert');

    get home(): ButtonInput { return this._home; }
    private _home: ButtonInput = new ButtonInput('home');

    get pageUp(): ButtonInput { return this._pageUp; }
    private _pageUp: ButtonInput = new ButtonInput('pageUp');

    get delete(): ButtonInput { return this._delete; }
    private _delete: ButtonInput = new ButtonInput('delete');

    get end(): ButtonInput { return this._end; }
    private _end: ButtonInput = new ButtonInput('end');

    get pageDown(): ButtonInput { return this._pageDown; }
    private _pageDown: ButtonInput = new ButtonInput('pageDown');


    get up(): ButtonInput { return this._up; }
    private _up: ButtonInput = new ButtonInput('up');

    get left(): ButtonInput { return this._left; }
    private _left: ButtonInput = new ButtonInput('left');

    get down(): ButtonInput { return this._down; }
    private _down: ButtonInput = new ButtonInput('down');

    get right(): ButtonInput { return this._right; }
    private _right: ButtonInput = new ButtonInput('right');


    get numlock(): ButtonInput { return this._numlock; }
    private _numlock: ButtonInput = new ButtonInput('numlock');

    get numpadDivide(): ButtonInput { return this._numpadDivide; }
    private _numpadDivide: ButtonInput = new ButtonInput('numpadDivide');

    get numpadMultiply(): ButtonInput { return this._numpadMultiply; }
    private _numpadMultiply: ButtonInput = new ButtonInput('numpadMultiply');

    get numpadSubtract(): ButtonInput { return this._numpadSubtract; }
    private _numpadSubtract: ButtonInput = new ButtonInput('numpadSubtract');

    get numpad7(): ButtonInput { return this._numpad7; }
    private _numpad7: ButtonInput = new ButtonInput('numpad7');

    get numpad8(): ButtonInput { return this._numpad8; }
    private _numpad8: ButtonInput = new ButtonInput('numpad8');

    get numpad9(): ButtonInput { return this._numpad9; }
    private _numpad9: ButtonInput = new ButtonInput('numpad9');

    get numpadAdd(): ButtonInput { return this._numpadAdd; }
    private _numpadAdd: ButtonInput = new ButtonInput('numpadAdd');

    get numpad4(): ButtonInput { return this._numpad4; }
    private _numpad4: ButtonInput = new ButtonInput('numpad4');

    get numpad5(): ButtonInput { return this._numpad5; }
    private _numpad5: ButtonInput = new ButtonInput('numpad5');

    get numpad6(): ButtonInput { return this._numpad6; }
    private _numpad6: ButtonInput = new ButtonInput('numpad6');

    get numpad1(): ButtonInput { return this._numpad1; }
    private _numpad1: ButtonInput = new ButtonInput('numpad1');

    get numpad2(): ButtonInput { return this._numpad2; }
    private _numpad2: ButtonInput = new ButtonInput('numpad2');

    get numpad3(): ButtonInput { return this._numpad3; }
    private _numpad3: ButtonInput = new ButtonInput('numpad3');

    get numpadEnter(): ButtonInput { return this._numpadEnter; }
    private _numpadEnter: ButtonInput = new ButtonInput('numpadEnter');

    get numpad0(): ButtonInput { return this._numpad0; }
    private _numpad0: ButtonInput = new ButtonInput('numpad0');

    get numpadDecimal(): ButtonInput { return this._numpadDecimal; }
    private _numpadDecimal: ButtonInput = new ButtonInput('numpadDecimal');


    private _eventSubscriber: IEventSubscriber;

    constructor(eventSubscriber: IEventSubscriber) {
        this._eventSubscriber = eventSubscriber;
        this.buttons.push(
            this.f1, this.f2, this.f3, this.f4, this.f5, this.f6,
            this.f7, this.f8, this.f9, this.f10, this.f11, this.f12
        );
        this.buttons.push(
            this.backquote, this.numrow1, this.numrow2, this.numrow3, this.numrow4, this.numrow5, this.numrow6, 
            this.numrow7, this.numrow8, this.numrow9, this.numrow0, this.minus, this.equal, this.backspace
        );
        this.buttons.push(
            this.tab, this.q, this.w, this.e, this.r, this.t, this.y, this.u, this.i, 
            this.o, this.p, this.leftBracket, this.rightBracket, this.enter
        );
        this.buttons.push(
            this.capslock, this.a, this.s, this.d, this.f, this.g, this.h, this.j, 
            this.k, this.l, this.semicolon, this.quote, this.backslash
        );
        this.buttons.push(
            this.leftShift, this.intlBackslash, this.z, this.x, this.c, this.v, this.b, 
            this.n, this.m, this.comma, this.period, this.slash, this.rightShift
        );
        this.buttons.push(this.leftCtrl, this.leftAlt, this.space, this.rightAlt, this.rightCtrl);
        this.buttons.push(this.insert, this.home, this.pageUp, this.delete, this.end, this.pageDown);
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

    finish(): void {
        this._finished = true;
        this.deactivate();
    }

    private _onKeyDown = (event: KeyboardEvent) => {
        const button = this._getButtonByEventCode(event.code);
        if (button) {
            button.valueTracker.value = 1;
            button.update(0);
        }
    }

    private _onKeyUp = (event: KeyboardEvent) => {
        const button = this._getButtonByEventCode(event.code);
        if (button) {
            button.valueTracker.value = 0;
            button.update(0);
        }
    }

    private _getButtonByEventCode(eventCode: string): ButtonInput {
        switch (eventCode) {
            case 'F1': return this.f1;
            case 'F2': return this.f2;
            case 'F3': return this.f3;
            case 'F4': return this.f4;
            case 'F5': return this.f5;
            case 'F6': return this.f6;
            case 'F7': return this.f7;
            case 'F8': return this.f8;
            case 'F9': return this.f9;
            case 'F10': return this.f10;
            case 'F11': return this.f11;
            case 'F12': return this.f12;

            case 'Backquote': return this.backquote;
            case 'Digit1': return this.numrow1;
            case 'Digit2': return this.numrow2;
            case 'Digit3': return this.numrow3;
            case 'Digit4': return this.numrow4;
            case 'Digit5': return this.numrow5;
            case 'Digit6': return this.numrow6;
            case 'Digit7': return this.numrow7;
            case 'Digit8': return this.numrow8;
            case 'Digit9': return this.numrow9;
            case 'Digit0': return this.numrow0;
            case 'Minus': return this.minus;
            case 'Equal': return this.equal;
            case 'Backspace': return this.backspace;

            case 'Tab': return this.tab;
            case 'KeyQ': return this.q;
            case 'KeyW': return this.w;
            case 'KeyE': return this.e;
            case 'KeyR': return this.r;
            case 'KeyT': return this.t;
            case 'KeyY': return this.y;
            case 'KeyU': return this.u;
            case 'KeyI': return this.i;
            case 'KeyO': return this.o;
            case 'KeyP': return this.p;
            case 'BracketLeft': return this.leftBracket;
            case 'BracketRight': return this.rightBracket;
            case 'Enter': return this.enter;
            
            case 'CapsLock': return this.capslock;
            case 'KeyA': return this.a;
            case 'KeyS': return this.s;
            case 'KeyD': return this.d;
            case 'KeyF': return this.f;
            case 'KeyG': return this.g;
            case 'KeyH': return this.h;
            case 'KeyJ': return this.j;
            case 'KeyK': return this.k;
            case 'KeyL': return this.l;
            case 'Semicolon': return this.semicolon;
            case 'Quote': return this.quote;
            case 'Backslash': return this.backslash;
            
            case 'ShiftLeft': return this.leftShift;
            case 'IntlBackslash': return this.intlBackslash;
            case 'KeyZ': return this.z;
            case 'KeyX': return this.x;
            case 'KeyC': return this.c;
            case 'KeyV': return this.v;
            case 'KeyB': return this.b;
            case 'KeyN': return this.n;
            case 'KeyM': return this.m;
            case 'Comma': return this.comma;
            case 'Period': return this.period;
            case 'Slash': return this.slash;
            case 'ShiftRight': return this.rightShift;

            case 'ControlLeft': return this.leftCtrl;
            case 'AltLeft': return this.leftAlt;
            case 'Space': return this.space;
            case 'AltRight': return this.rightAlt;
            case 'ControlRight': return this.rightCtrl;

            case 'Insert': return this.insert;
            case 'Home': return this.home;
            case 'PageUp': return this.pageUp;
            case 'Delete': return this.delete;
            case 'End': return this.end;
            case 'PageDown': return this.pageDown;

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