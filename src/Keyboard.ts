'use strict';

import ButtonInput from './ButtonInput';
import { IClockChild } from './Clock';
import { IEventSubscriber } from './EventSubscriber';


/**
 * The Keyboard class models a computer keyboard, providing ButtonInput properties for all of the keys found on most standard English computer keyboards (coverage of other language keyboards is currently unconfirmed).
 * 
 * @category User Inputs
 */
export default class Keyboard implements IClockChild {
    /** The collection of all ButtonInputs that the Keyboard holds. */
    get buttons(): ButtonInput[] { return this._buttons; }
    private _buttons: ButtonInput[] = [];

    /** Provides a way of identifying keyboards so they can be easily retrieved later. */
    get ref(): string { return this._ref; }
    set ref(value: string) { this._ref = value; }
    private _ref: string;

    /** If true, then the keyboard has been deactivated and marked for disposal. */
    get finished(): boolean { return this._finished; }
    private _finished: boolean = false;


    /** ButtonInput for the Escape key. */
    get escape(): ButtonInput { return this._escape; }
    private _escape: ButtonInput = new ButtonInput('escape');

    /** ButtonInput for the F1 key. */
    get f1(): ButtonInput { return this._f1; }
    private _f1: ButtonInput = new ButtonInput('f1');

    /** ButtonInput for the F2 key. */
    get f2(): ButtonInput { return this._f2; }
    private _f2: ButtonInput = new ButtonInput('f2');

    /** ButtonInput for the F3 key. */
    get f3(): ButtonInput { return this._f3; }
    private _f3: ButtonInput = new ButtonInput('f3');

    /** ButtonInput for the F4 key. */
    get f4(): ButtonInput { return this._f4; }
    private _f4: ButtonInput = new ButtonInput('f4');

    /** ButtonInput for the F5 key. */
    get f5(): ButtonInput { return this._f5; }
    private _f5: ButtonInput = new ButtonInput('f5');

    /** ButtonInput for the F6 key. */
    get f6(): ButtonInput { return this._f6; }
    private _f6: ButtonInput = new ButtonInput('f6');

    /** ButtonInput for the F7 key. */
    get f7(): ButtonInput { return this._f7; }
    private _f7: ButtonInput = new ButtonInput('f7');

    /** ButtonInput for the F8 key. */
    get f8(): ButtonInput { return this._f8; }
    private _f8: ButtonInput = new ButtonInput('f8');

    /** ButtonInput for the F9 key. */
    get f9(): ButtonInput { return this._f9; }
    private _f9: ButtonInput = new ButtonInput('f9');

    /** ButtonInput for the F10 key. */
    get f10(): ButtonInput { return this._f10; }
    private _f10: ButtonInput = new ButtonInput('f10');

    /** ButtonInput for the F11 key. */
    get f11(): ButtonInput { return this._f11; }
    private _f11: ButtonInput = new ButtonInput('f11');

    /** ButtonInput for the F12 key. */
    get f12(): ButtonInput { return this._f12; }
    private _f12: ButtonInput = new ButtonInput('f12');


    /** ButtonInput for the Backquote `` ` `` key. */
    get backquote(): ButtonInput { return this._backquote; }
    private _backquote: ButtonInput = new ButtonInput('backquote');

    /** ButtonInput for the 1 key in the numbers row. */
    get numrow1(): ButtonInput { return this._numrow1; }
    private _numrow1: ButtonInput = new ButtonInput('numrow1');

    /** ButtonInput for the 2 key in the numbers row. */
    get numrow2(): ButtonInput { return this._numrow2; }
    private _numrow2: ButtonInput = new ButtonInput('numrow2');

    /** ButtonInput for the 3 key in the numbers row. */
    get numrow3(): ButtonInput { return this._numrow3; }
    private _numrow3: ButtonInput = new ButtonInput('numrow3');

    /** ButtonInput for the 4 key in the numbers row. */
    get numrow4(): ButtonInput { return this._numrow4; }
    private _numrow4: ButtonInput = new ButtonInput('numrow4');

    /** ButtonInput for the 5 key in the numbers row. */
    get numrow5(): ButtonInput { return this._numrow5; }
    private _numrow5: ButtonInput = new ButtonInput('numrow5');

    /** ButtonInput for the 6 key in the numbers row. */
    get numrow6(): ButtonInput { return this._numrow6; }
    private _numrow6: ButtonInput = new ButtonInput('numrow6');

    /** ButtonInput for the 7 key in the numbers row. */
    get numrow7(): ButtonInput { return this._numrow7; }
    private _numrow7: ButtonInput = new ButtonInput('numrow7');

    /** ButtonInput for the 8 key in the numbers row. */
    get numrow8(): ButtonInput { return this._numrow8; }
    private _numrow8: ButtonInput = new ButtonInput('numrow8');

    /** ButtonInput for the 9 key in the numbers row. */
    get numrow9(): ButtonInput { return this._numrow9; }
    private _numrow9: ButtonInput = new ButtonInput('numrow9');

    /** ButtonInput for the 0 key in the numbers row. */
    get numrow0(): ButtonInput { return this._numrow0; }
    private _numrow0: ButtonInput = new ButtonInput('numrow0');

    /** ButtonInput for the Minus key in the numbers row. */
    get minus(): ButtonInput { return this._minus; }
    private _minus: ButtonInput = new ButtonInput('minus');

    /** ButtonInput for the Equal key in the numbers row. */
    get equal(): ButtonInput { return this._equal; }
    private _equal: ButtonInput = new ButtonInput('equal');

    /** ButtonInput for the Backspace key in the numbers row. */
    get backspace(): ButtonInput { return this._backspace; }
    private _backspace: ButtonInput = new ButtonInput('backspace');

    /** ButtonInput for the Tab key. */
    get tab(): ButtonInput { return this._tab; }
    private _tab: ButtonInput = new ButtonInput('tab');

    /** ButtonInput for the Q key. */
    get q(): ButtonInput { return this._q; }
    private _q: ButtonInput = new ButtonInput('q');

    /** ButtonInput for the W key. */
    get w(): ButtonInput { return this._w; }
    private _w: ButtonInput = new ButtonInput('w');

    /** ButtonInput for the E key. */
    get e(): ButtonInput { return this._e; }
    private _e: ButtonInput = new ButtonInput('e');

    /** ButtonInput for the R key. */
    get r(): ButtonInput { return this._r; }
    private _r: ButtonInput = new ButtonInput('r');

    /** ButtonInput for the T key. */
    get t(): ButtonInput { return this._t; }
    private _t: ButtonInput = new ButtonInput('t');

    /** ButtonInput for the Y key. */
    get y(): ButtonInput { return this._y; }
    private _y: ButtonInput = new ButtonInput('y');

    /** ButtonInput for the U key. */
    get u(): ButtonInput { return this._u; }
    private _u: ButtonInput = new ButtonInput('u');

    /** ButtonInput for the I key. */
    get i(): ButtonInput { return this._i; }
    private _i: ButtonInput = new ButtonInput('i');

    /** ButtonInput for the O key. */
    get o(): ButtonInput { return this._o; }
    private _o: ButtonInput = new ButtonInput('o');

    /** ButtonInput for the P key. */
    get p(): ButtonInput { return this._p; }
    private _p: ButtonInput = new ButtonInput('p');

    /** ButtonInput for the Left Bracket `[` key. */
    get leftBracket(): ButtonInput { return this._leftBracket; }
    private _leftBracket: ButtonInput = new ButtonInput('leftBracket');

    /** ButtonInput for the Right Bracket `]` key. */
    get rightBracket(): ButtonInput { return this._rightBracket; }
    private _rightBracket: ButtonInput = new ButtonInput('rightBracket');

    /** ButtonInput for the Enter key. */
    get enter(): ButtonInput { return this._enter; }
    private _enter: ButtonInput = new ButtonInput('enter');
    

    /** ButtonInput for the Caps Lock key. */
    get capslock(): ButtonInput { return this._capslock; }
    private _capslock: ButtonInput = new ButtonInput('capslock');

    /** ButtonInput for the A key. */
    get a(): ButtonInput { return this._a; }
    private _a: ButtonInput = new ButtonInput('a');

    /** ButtonInput for the S key. */
    get s(): ButtonInput { return this._s; }
    private _s: ButtonInput = new ButtonInput('s');

    /** ButtonInput for the D key. */
    get d(): ButtonInput { return this._d; }
    private _d: ButtonInput = new ButtonInput('d');

    /** ButtonInput for the F key. */
    get f(): ButtonInput { return this._f; }
    private _f: ButtonInput = new ButtonInput('f');

    /** ButtonInput for the G key. */
    get g(): ButtonInput { return this._g; }
    private _g: ButtonInput = new ButtonInput('g');

    /** ButtonInput for the H key. */
    get h(): ButtonInput { return this._h; }
    private _h: ButtonInput = new ButtonInput('h');

    /** ButtonInput for the J key. */
    get j(): ButtonInput { return this._j; }
    private _j: ButtonInput = new ButtonInput('j');

    /** ButtonInput for the K key. */
    get k(): ButtonInput { return this._k; }
    private _k: ButtonInput = new ButtonInput('k');

    /** ButtonInput for the L key. */
    get l(): ButtonInput { return this._l; }
    private _l: ButtonInput = new ButtonInput('l');

    /** ButtonInput for the Semicolon `;` key. */
    get semicolon(): ButtonInput { return this._semicolon; }
    private _semicolon: ButtonInput = new ButtonInput('semicolon');

    /** ButtonInput for the Quote `'` key. */
    get quote(): ButtonInput { return this._quote; }
    private _quote: ButtonInput = new ButtonInput('quote');

    /** ButtonInput for the Backslash `\` key. */
    get backslash(): ButtonInput { return this._backslash; }
    private _backslash: ButtonInput = new ButtonInput('backslash');
    

    /** ButtonInput for the Left Shift key. */
    get leftShift(): ButtonInput { return this._leftShift; }
    private _leftShift: ButtonInput = new ButtonInput('leftShift');

    /** ButtonInput for the Backslash `\` key on non-American keyboards (typically located next to the left shift key). */
    get intlBackslash(): ButtonInput { return this._intlBackslash; }
    private _intlBackslash: ButtonInput = new ButtonInput('intlBackslash');

    /** ButtonInput for the Z key. */
    get z(): ButtonInput { return this._z; }
    private _z: ButtonInput = new ButtonInput('z');

    /** ButtonInput for the X key. */
    get x(): ButtonInput { return this._x; }
    private _x: ButtonInput = new ButtonInput('x');

    /** ButtonInput for the C key. */
    get c(): ButtonInput { return this._c; }
    private _c: ButtonInput = new ButtonInput('c');

    /** ButtonInput for the V key. */
    get v(): ButtonInput { return this._v; }
    private _v: ButtonInput = new ButtonInput('v');

    /** ButtonInput for the B key. */
    get b(): ButtonInput { return this._b; }
    private _b: ButtonInput = new ButtonInput('b');

    /** ButtonInput for the N key. */
    get n(): ButtonInput { return this._n; }
    private _n: ButtonInput = new ButtonInput('n');

    /** ButtonInput for the M key. */
    get m(): ButtonInput { return this._m; }
    private _m: ButtonInput = new ButtonInput('m');

    /** ButtonInput for the Comma `,` key. */
    get comma(): ButtonInput { return this._comma; }
    private _comma: ButtonInput = new ButtonInput('comma');

    /** ButtonInput for the Period `.` key. */
    get period(): ButtonInput { return this._period; }
    private _period: ButtonInput = new ButtonInput('period');

    /** ButtonInput for the Slash `/` key. */
    get slash(): ButtonInput { return this._slash; }
    private _slash: ButtonInput = new ButtonInput('slash');

    /** ButtonInput for the Right Shift key. */
    get rightShift(): ButtonInput { return this._rightShift; }
    private _rightShift: ButtonInput = new ButtonInput('rightShift');


    /** ButtonInput for the Left Control key. */
    get leftCtrl(): ButtonInput { return this._leftCtrl; }
    private _leftCtrl: ButtonInput = new ButtonInput('leftCtrl');

    /** ButtonInput for the Left Alt key. */
    get leftAlt(): ButtonInput { return this._leftAlt; }
    private _leftAlt: ButtonInput = new ButtonInput('leftAlt');

    /** ButtonInput for the Spacebar. */
    get space(): ButtonInput { return this._space; }
    private _space: ButtonInput = new ButtonInput('space');

    /** ButtonInput for the Right Alt key. */
    get rightAlt(): ButtonInput { return this._rightAlt; }
    private _rightAlt: ButtonInput = new ButtonInput('rightAlt');

    /** ButtonInput for the Right Control key. */
    get rightCtrl(): ButtonInput { return this._rightCtrl; }
    private _rightCtrl: ButtonInput = new ButtonInput('rightCtrl');


    /** ButtonInput for the Insert key. */
    get insert(): ButtonInput { return this._insert; }
    private _insert: ButtonInput = new ButtonInput('insert');

    /** ButtonInput for the Home key. */
    get home(): ButtonInput { return this._home; }
    private _home: ButtonInput = new ButtonInput('home');

    /** ButtonInput for the Page Up key. */
    get pageUp(): ButtonInput { return this._pageUp; }
    private _pageUp: ButtonInput = new ButtonInput('pageUp');

    /** ButtonInput for the Delete key. */
    get delete(): ButtonInput { return this._delete; }
    private _delete: ButtonInput = new ButtonInput('delete');

    /** ButtonInput for the End key. */
    get end(): ButtonInput { return this._end; }
    private _end: ButtonInput = new ButtonInput('end');

    /** ButtonInput for the Page Down key. */
    get pageDown(): ButtonInput { return this._pageDown; }
    private _pageDown: ButtonInput = new ButtonInput('pageDown');


    /** ButtonInput for the Up arrow key. */
    get up(): ButtonInput { return this._up; }
    private _up: ButtonInput = new ButtonInput('up');

    /** ButtonInput for the Left arrow key. */
    get left(): ButtonInput { return this._left; }
    private _left: ButtonInput = new ButtonInput('left');

    /** ButtonInput for the Down arrow key. */
    get down(): ButtonInput { return this._down; }
    private _down: ButtonInput = new ButtonInput('down');

    /** ButtonInput for the Right arrow key. */
    get right(): ButtonInput { return this._right; }
    private _right: ButtonInput = new ButtonInput('right');


    /** ButtonInput for the Num Lock key. */
    get numlock(): ButtonInput { return this._numlock; }
    private _numlock: ButtonInput = new ButtonInput('numlock');

    /** ButtonInput for the Divide `/` key in the numpad. */
    get numpadDivide(): ButtonInput { return this._numpadDivide; }
    private _numpadDivide: ButtonInput = new ButtonInput('numpadDivide');

    /** ButtonInput for the Multiply `*` key in the numpad. */
    get numpadMultiply(): ButtonInput { return this._numpadMultiply; }
    private _numpadMultiply: ButtonInput = new ButtonInput('numpadMultiply');

    /** ButtonInput for the Subtract `-` key in the numpad. */
    get numpadSubtract(): ButtonInput { return this._numpadSubtract; }
    private _numpadSubtract: ButtonInput = new ButtonInput('numpadSubtract');

    /** ButtonInput for the 7 key in the numpad. */
    get numpad7(): ButtonInput { return this._numpad7; }
    private _numpad7: ButtonInput = new ButtonInput('numpad7');

    /** ButtonInput for the 8 key in the numpad. */
    get numpad8(): ButtonInput { return this._numpad8; }
    private _numpad8: ButtonInput = new ButtonInput('numpad8');

    /** ButtonInput for the 9 key in the numpad. */
    get numpad9(): ButtonInput { return this._numpad9; }
    private _numpad9: ButtonInput = new ButtonInput('numpad9');

    /** ButtonInput for the Add `+` key in the numpad. */
    get numpadAdd(): ButtonInput { return this._numpadAdd; }
    private _numpadAdd: ButtonInput = new ButtonInput('numpadAdd');

    /** ButtonInput for the 4 key in the numpad. */
    get numpad4(): ButtonInput { return this._numpad4; }
    private _numpad4: ButtonInput = new ButtonInput('numpad4');

    /** ButtonInput for the 5 key in the numpad. */
    get numpad5(): ButtonInput { return this._numpad5; }
    private _numpad5: ButtonInput = new ButtonInput('numpad5');

    /** ButtonInput for the 6 key in the numpad. */
    get numpad6(): ButtonInput { return this._numpad6; }
    private _numpad6: ButtonInput = new ButtonInput('numpad6');

    /** ButtonInput for the 1 key in the numpad. */
    get numpad1(): ButtonInput { return this._numpad1; }
    private _numpad1: ButtonInput = new ButtonInput('numpad1');

    /** ButtonInput for the 2 key in the numpad. */
    get numpad2(): ButtonInput { return this._numpad2; }
    private _numpad2: ButtonInput = new ButtonInput('numpad2');

    /** ButtonInput for the 3 key in the numpad. */
    get numpad3(): ButtonInput { return this._numpad3; }
    private _numpad3: ButtonInput = new ButtonInput('numpad3');

    /** ButtonInput for the Enter key in the numpad. */
    get numpadEnter(): ButtonInput { return this._numpadEnter; }
    private _numpadEnter: ButtonInput = new ButtonInput('numpadEnter');

    /** ButtonInput for the 0 key in the numpad. */
    get numpad0(): ButtonInput { return this._numpad0; }
    private _numpad0: ButtonInput = new ButtonInput('numpad0');

    /** ButtonInput for the Decimal `.` key in the numpad. */
    get numpadDecimal(): ButtonInput { return this._numpadDecimal; }
    private _numpadDecimal: ButtonInput = new ButtonInput('numpadDecimal');


    private _eventSubscriber: IEventSubscriber;

    /**
     * @param eventSubscriber The passed in event subscriber should wrap around the document object, allowing the keyboard to subscribe to keyup & keydown events when the `activate()` method is called.
     */
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

    /**
     * Start listening to keyboard events.
     * @returns Returns false if the keyboard was already activated and nothing needed to be done. Otherwise returns true.
     */
    activate(): boolean {
        if (this._activated)
            return false;
        this._eventSubscriber.subscribe('keydown', this._onKeyDown);
        this._eventSubscriber.subscribe('keyup', this._onKeyUp);
        this._activated = true;
        return true;
    }

    /**
     * Stop listening to keyboard events.
     * @returns Returns false if the keyboard wasn't already activated and nothing needed to be done. Otherwise returns true.
     */
    deactivate(): boolean {
        if (!this._activated)
            return false;
        this._eventSubscriber.unsubscribe('keydown', this._onKeyDown);
        this._eventSubscriber.unsubscribe('keyup', this._onKeyUp);
        this._activated = false;
        return true;
    }

    /** Calling this tells the Keyboard to deactivate itself and that it will no longer be used. */
    finish(): void {
        this._finished = true;
        this.deactivate();
    }

    /**
     * Provides a way for setting the ref through a chained function call. For example:
     * 
     * ```
     * clock.addChild(new Keyboard(new EventSubscriber(document)).withRef('keyboard'));
     * ```
     * 
     * @param ref The ref to set on the object.
     * @returns The calling object.
     */
    withRef(ref: string): IClockChild {
        this._ref = ref;
        return this;
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

    /**
     * This method is intended to be called by a clock to provide regular updates. It should not be called by consumers of the library.
     * @param deltaMs How many milliseconds have passed since the last update cycle.
     */
    update(deltaMs: number): void {
        for (const button of this.buttons)
            button.update(deltaMs);
    }
}