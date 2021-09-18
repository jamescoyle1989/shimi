'use strict';

import { IMidiOut, IMidiOutChild } from '../src/MidiOut';


export default class DummyMidiOutChild implements IMidiOutChild {
    get ref(): string { return ''; }

    get finished(): boolean { return this._finished; }
    private _finished: boolean = false;

    public totalDeltaMs: number = 0;

    update(midiOut: IMidiOut, deltaMs: number): void {
        this.totalDeltaMs += deltaMs;
    }

    finish(midiOut: IMidiOut): void {
        this._finished = true;
    }
}