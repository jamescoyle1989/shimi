'use strict';

import TimeSig from './TimeSig';
import PropertyTracker from './PropertyTracker';
import { IClockChild } from './Clock';
import { IMetronome, MetronomeBase } from './Metronome';


export default class Flexinome extends MetronomeBase implements IMetronome, IClockChild {
    private _tempo: number = 120;
    get tempo(): number { return this._tempo; }
    set tempo(value: number) { this._tempo = value; }

    /** Provides a way of identifying metronomes so they can be retrieved later */
    get ref(): string { return this._ref; }
    /** Provides a way of identifying metronomes so they can be retrieved later */
    set ref(value: string) { this._ref = value; }
    private _ref: string;

    private _timeSig: PropertyTracker<TimeSig> = new PropertyTracker();
    //Return the old value, so that if the user changes the time sig
    //we can prevent from applying it until the start of the next bar
    get timeSig(): TimeSig { return this._timeSig.oldValue; }
    set timeSig(value: TimeSig) { this._timeSig.value = value; }

    private _totalQuarterNote: PropertyTracker<number> = new PropertyTracker(0);
    get totalQuarterNote(): number { return this._totalQuarterNote.value; }
    get totalQuarterNoteTracker(): PropertyTracker<number> { return this._totalQuarterNote; }

    private _totalBeat: PropertyTracker<number> = new PropertyTracker(0);
    get totalBeat(): number { return this._totalBeat.value; }
    get totalBeatTracker(): PropertyTracker<number> { return this._totalBeat; }

    private _bar: PropertyTracker<number> = new PropertyTracker(1);
    get bar(): number { return this._bar.value; }
    get barTracker(): PropertyTracker<number> { return this._bar; }

    private _barQuarterNote: PropertyTracker<number> = new PropertyTracker(0);
    get barQuarterNote(): number { return this._barQuarterNote.value; }
    get barQuarterNoteTracker(): PropertyTracker<number> { return this._barQuarterNote; }

    private _barBeat: PropertyTracker<number> = new PropertyTracker(0);
    get barBeat(): number { return this._barBeat.value; }
    get barBeatTracker(): PropertyTracker<number> { return this._barBeat; }

    private _enabled: PropertyTracker<boolean> = new PropertyTracker(true);
    get enabled(): boolean { return this._enabled.value; }
    set enabled(value: boolean) { this._enabled.value = value; }

    get finished(): boolean { return this._finished; }
    private _finished: boolean = false;

    constructor(tempo: number, timeSig: TimeSig = null) {
        super();
        if (timeSig)
            this.timeSig = timeSig;
        else
            this.timeSig = TimeSig.commonTime();
        this._timeSig.accept();
        this.tempo = tempo;
    }

    atBarBeat(beat: number): boolean {
        return super._atBarPosition(beat, this._barBeat);
    }

    atBarQuarterNote(quarterNote: number): boolean {
        return super._atBarPosition(quarterNote, this._barQuarterNote);
    }

    update(msDelta: number) {
        this._enabled.accept();
        if (!this.enabled)
            return false;

        const qnDelta = msDelta * (this.tempo / 60000) * (4 / this.timeSig.denominator);
        this._totalQuarterNote.accept();
        this._totalQuarterNote.value += qnDelta;
        this._barQuarterNote.accept();
        this._barQuarterNote.value += qnDelta;
        this._bar.accept();
        let qnpb = 0;
        while (true) {
            qnpb = this.timeSig.quarterNotesPerBar;
            if (this.barQuarterNote < qnpb)
                break;
            this._barQuarterNote.value -= qnpb;
            this._bar.value++;
            this._timeSig.accept();
        }
        this._barBeat.accept();
        this._totalBeat.accept();
        this._barBeat.value = this.timeSig.quarterNoteToBeat(this.barQuarterNote);
        this._totalBeat.value = this.totalBeat - this._barBeat.oldValue + this.barBeat;
    }

    finish(): void {
        this._finished = true;
        this._enabled.value = false;
    }
}