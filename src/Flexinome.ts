'use strict';

import TimeSig from './TimeSig';
import PropertyTracker from './PropertyTracker';
import { IClockChild } from './Clock';
import { IMetronome, MetronomeBase } from './Metronome';
import ShimiEvent, { ShimiEventData } from './ShimiEvent';


/**
 * The Flexinome, much like the Metronome, is an implementation of the IMetronome interface, and is used for converting millisecond updates in time, into beat updates in time.
 * 
 * The Flexinome differs from the Metronome though, in that it fully embraces the IMetronome's concept of separating quarter notes from beats, allowing a lot of flexibility in how bars can be divided up, with some beats stretching out to last longer than others.
 * 
 * This means that if you had a 4 beat clip, it could be played infinitely many ways, just by passing it into a ClipPlayer that's linked to a Flexinome, and altering the time signature that it's using.
 * 
 * To better understand how this works, please take a look at the [IMetronome](https://jamescoyle1989.github.io/shimi/interfaces/IMetronome.html) and [TimeSig](https://jamescoyle1989.github.io/shimi/classes/TimeSig.html) documentation.
 * 
 * @category Timing
 */
export default class Flexinome extends MetronomeBase implements IMetronome, IClockChild {
    private _tempo: number = 120;
    /** Get the current flexinome tempo. */
    get tempo(): number { return this._tempo; }
    /** Set the current flexinome tempo. */
    set tempo(value: number) { this._tempo = value; }

    private _tempoMultiplier: number = 1;
    /**
     * Get the tempo multiplier. This allows defining the tempo in terms of other duration values than just quarter notes. For example, if `tempo == 120`:
     * 
     * `tempoMultiplier == 1` means ♩ = 120
     * 
     * `tempoMultiplier == 0.5` means ♪ = 120
     * 
     * `tempoMultiplier == 1.5` means ♩. = 120
     * 
     * The default value is 1.
     */
    get tempoMultiplier(): number { return this._tempoMultiplier; }
    /**
     * Set the tempo multiplier. This allows defining the tempo in terms of other duration values than just quarter notes. For example, if `tempo == 120`:
     * 
     * `tempoMultiplier == 1` means ♩ = 120
     * 
     * `tempoMultiplier == 0.5` means ♪ = 120
     * 
     * `tempoMultiplier == 1.5` means ♩. = 120
     * 
     * Valid values are technically all positive numbers, though in reality only numbers that correspond to common musical note durations make sense.
     */
    set tempoMultiplier(value: number) {
        if (value <= 0)
            throw new Error('Invalid tempoMultiplier.');
        this._tempoMultiplier = value;
    }

    /** Provides a way of identifying flexinomes so they can be easily retrieved later */
    get ref(): string { return this._ref; }
    set ref(value: string) { this._ref = value; }
    private _ref: string;

    private _timeSig: PropertyTracker<TimeSig> = new PropertyTracker();
    /** Get the current flexinome time signature. */
    get timeSig(): TimeSig { return this._timeSig.oldValue; }
    /**
     * Set the flexinome time signature.
     * 
     * **Note:** This doesn't actually change the time signature straight away, but instead stores it so that the time signature changes on the start of the next bar.
     */
    set timeSig(value: TimeSig) { this._timeSig.value = value; }

    private _totalQuarterNote: PropertyTracker<number> = new PropertyTracker(0);
    /**
     * How many quarter notes have passed in total since the flexinome started.
     * 
     * This just returns `totalQuarterNoteTracker.value`.
     */
    get totalQuarterNote(): number { return this._totalQuarterNote.value; }
    /** Records the difference in total quarter notes passed, enabling inspection of the total quarter note change from one update cycle to the next. */
    get totalQuarterNoteTracker(): PropertyTracker<number> { return this._totalQuarterNote; }

    private _totalBeat: PropertyTracker<number> = new PropertyTracker(0);
    /**
     * How many beats have passed in total since the flexinome started.
     * 
     * This just returns `totalBeatTracker.value`.
     */
    get totalBeat(): number { return this._totalBeat.value; }
    /** Records the difference in total beats passed, enabling inspection of the total beat change from one update cycle to the next. */
    get totalBeatTracker(): PropertyTracker<number> { return this._totalBeat; }

    private _bar: PropertyTracker<number> = new PropertyTracker(1);
    /**
     * Records what bar the flexinome is currently on.
     * 
     * This just returns `barTracker.value`.
     */
    get bar(): number { return this._bar.value; }
    /** Records the bar number in the previous update vs the current one. */
    get barTracker(): PropertyTracker<number> { return this._bar; }

    private _barQuarterNote: PropertyTracker<number> = new PropertyTracker(0);
    /**
     * Records how many quarter notes have passed within the current bar
     * 
     * This just returns `barQuarterNoteTracker.value`.
     */
    get barQuarterNote(): number { return this._barQuarterNote.value; }
    /** Records the difference in bar quarter note values, enabling inspection of the quarter note within the current bar from one update cycle to the next. */
    get barQuarterNoteTracker(): PropertyTracker<number> { return this._barQuarterNote; }

    private _barBeat: PropertyTracker<number> = new PropertyTracker(0);
    /**
     * Records how many beats have passed within the current bar.
     * 
     * This just returns `barBeatTracker.value`.
     */
    get barBeat(): number { return this._barBeat.value; }
    /** Records the difference in bar beat values, enabling inspection of the beat within the current bar from one update cycle to the next. */
    get barBeatTracker(): PropertyTracker<number> { return this._barBeat; }

    private _enabled: PropertyTracker<boolean> = new PropertyTracker(true);
    /** Gets whether the flexinome is currently enabled to run. */
    get enabled(): boolean { return this._enabled.value; }
    /** Sets whether the flexinome is currently enabled to run. */
    set enabled(value: boolean) {
        if (this._enabled.value == value)
            return;
        this._enabled.value = value;
        if (value)
            this.continued.trigger(new ShimiEventData(this));
        else
            this.stopped.trigger(new ShimiEventData(this));
    }

    /** Returns true if the Flexinome has been instructed to stop everything by the `finish()` method. */
    get finished(): boolean { return this._finished; }
    private _finished: boolean = false;

    /**
     * @param tempo The tempo to run the flexinome at.
     * @param timeSig The time signature for the flexinome to use. If not provided then the flexinome defaults to common time (4/4).
     */
    constructor(tempo: number, timeSig: TimeSig = null) {
        super();
        if (timeSig)
            this.timeSig = timeSig;
        else
            this.timeSig = TimeSig.commonTime();
        this._timeSig.accept();
        this.tempo = tempo;
    }

    /**
     * This takes in a beat and returns true if the flexinome is currently at it, or has only just passed it in the bar within the last update cycle.
     * @param beat The beat to test if we've recently passed.
     * @returns 
     */
    atBarBeat(beat: number): boolean {
        return super._atBarPosition(beat, this._barBeat);
    }

    /**
     * This takes a quarter note and returns true if the flexinome is currently at it, or has only just passed it in the bar within the last update cycle.
     * @param quarterNote The quarter note to test if we've recently passed.
     * @returns 
     */
    atBarQuarterNote(quarterNote: number): boolean {
        return super._atBarPosition(quarterNote, this._barQuarterNote);
    }

    /**
     * This method is intended to be called by a clock to provide regular updates. It should be called by consumers of the library.
     * @param msDelta How many milliseconds have passed since the last update cycle.
     * @returns 
     */
    update(msDelta: number) {
        const qnDelta = msDelta * (this.tempo / 60000) * this.tempoMultiplier;
        return this.updateFromQuarterNoteDelta(qnDelta);
    }

    /**
     * This method is exposed primarily for the TickReceiver, so it can get a metronome to update, using its own calculation of how many quarter notes to update by.
     * 
     * This method should not be called by consumers of the library.
     * @param qnDelta The number of quarter notes to update the metronome by.
     * @returns
     */
     updateFromQuarterNoteDelta(qnDelta: number) {
        this._enabled.accept();
        if (!this.enabled)
            return false;

        if (this._totalQuarterNote.oldValue == 0)
            this.started.trigger(new ShimiEventData(this));

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

    /** Calling this tells the flexinome to stop whatever it's doing and that it will no longer be used. */
    finish(): void {
        this._finished = true;
        this._enabled.value = false;
    }

    /**
     * Provides a way for setting the ref through a chained function call. For example:
     * 
     * ```
     * clock.addChild(new Flexinome(120, TimeSig.commonTime).withRef('metronome'));
     * ```
     * 
     * @param ref The ref to set on the object.
     * @returns The calling object.
     */
    withRef(ref: string): IClockChild {
        this._ref = ref;
        return this;
    }

    /**
     * This method allows for setting the metronome to a specific position.
     * 
     * Note though, that the bar-related values are calculated under the assumption that the metronome's current time signature is the one that it always has.
     * @param totalQuarterNote The new position, as measured in quarter notes.
     */
    setSongPosition(totalQuarterNote: number): void {
        this._timeSig.accept();
        this._totalQuarterNote.value = totalQuarterNote;
        this._totalQuarterNote.accept();
        this._bar.value = Math.floor(totalQuarterNote / this.timeSig.quarterNotesPerBar);
        this._bar.accept();
        this._barQuarterNote.value = totalQuarterNote - (this.bar * this.timeSig.quarterNotesPerBar);
        this._barQuarterNote.accept();
        this._barBeat.value = this.timeSig.quarterNoteToBeat(this.barQuarterNote);
        this._barBeat.accept();
        this._totalBeat.value = this.barBeat + (this.bar * this.timeSig.beatsPerBar);
        this._totalBeat.accept();
        this.positionChanged.trigger(new ShimiEventData(this));
    }

    /**
     * Event that fires whenever the metronome is directed to move to a new position.
     */
    get positionChanged(): ShimiEvent<ShimiEventData<IMetronome>, IMetronome> { return this._positionChanged; }
    private _positionChanged: ShimiEvent<ShimiEventData<IMetronome>, IMetronome> = new ShimiEvent<ShimiEventData<IMetronome>, IMetronome>();
    
    /**
     * Event that fires when the metronome is first started
     */
     get started(): ShimiEvent<ShimiEventData<IMetronome>, IMetronome> { return this._started; }
     private _started: ShimiEvent<ShimiEventData<IMetronome>, IMetronome> = new ShimiEvent<ShimiEventData<IMetronome>, IMetronome>();
 
      /**
       * Event that fires when the metronome is allowed to resume running (enabled = true)
       */
     get continued(): ShimiEvent<ShimiEventData<IMetronome>, IMetronome> { return this._continued; }
     private _continued: ShimiEvent<ShimiEventData<IMetronome>, IMetronome> = new ShimiEvent<ShimiEventData<IMetronome>, IMetronome>();
  
      /**
       * Event that fires when the metronome is instructed to stop running (enabled = false)
       */
     get stopped(): ShimiEvent<ShimiEventData<IMetronome>, IMetronome> { return this._stopped; }
     private _stopped: ShimiEvent<ShimiEventData<IMetronome>, IMetronome> = new ShimiEvent<ShimiEventData<IMetronome>, IMetronome>();
}