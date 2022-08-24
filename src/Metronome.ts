'use strict';

import TimeSig from './TimeSig';
import PropertyTracker from './PropertyTracker';
import { IClockChild } from './Clock';
import ShimiEvent, { ShimiEventData } from './ShimiEvent';


/**
 * As you might expect, IMetronome defines an interface for metronomes, though the interface may have many more properties than you'd initially expect to be required for a simple metronome.
 * 
 * In much music, especially that written in 4/4 or 3/4, the concepts of quarter note and beat can often be treated as pretty much synonymous to each other. However, these are in fact quite different. A quarter note is exactly one quarter of a whole note, yet beats are far more free-flowing. For example, the Mission Impossible intro is at this point an over-used example of a piece of music written in 5/4, yet if you tap along, you'll almost certainly find yourself tapping 4 uneven beats per bar.
 * 
 * For this reason, shimi expects that most musical objects which use the metronome will use its beat properties, though quarter notes can still also be incredibly useful, so are provided as well.
 * 
 * To better understand how shimi supports irregular beat patterns, take a look at the [TimeSig](https://jamescoyle1989.github.io/shimi/classes/TimeSig.html) class.
 * 
 * **Note:** Shimi's counts of beats and quarter notes are both zero-based, whereas musicians typically count from one. This break from convention has been done because it makes many things significantly simpler from a programming perspective. For example, if we have 4 beats per bar, then the beat value will range from 0 to 3.99999...., then back to 0 at the start of the next bar. If the traditional method of counting was adopted, then the beat would range from 1 to 4.99999...., then back to 1 at the start of the next bar.
 * 
 * @category Timing
 */
export interface IMetronome {
    /**
     * Get the current metronome tempo.
     */
    get tempo(): number;
    /**
     * Set the current metronome tempo.
     */
    set tempo(value: number);

    /**
     * Get the tempo multiplier. This allows defining the tempo in terms of other duration values than just quarter notes. For example, if `tempo == 120`:
     * 
     * `tempoMultiplier == 1` means ♩ = 120
     * 
     * `tempoMultiplier == 0.5` means ♪ = 120
     * 
     * `tempoMultiplier == 1.5` means ♩. = 120
     */
    get tempoMultiplier(): number;
    /**
     * Set the tempo multiplier. This allows defining the tempo in terms of other duration values than just quarter notes. For example, if `tempo == 120`:
     * 
     * `tempoMultiplier == 1` means ♩ = 120
     * 
     * `tempoMultiplier == 0.5` means ♪ = 120
     * 
     * `tempoMultiplier == 1.5` means ♩. = 120
     */
    set tempoMultiplier(value: number);

    /**
     * Get the current metronome time signature.
     */
    get timeSig(): TimeSig;

    /**
     * Set the metronome time signature.
     * 
     * **Note:** It's expected that implementations of this shouldn't actually change the time signature straight away, but instead store it so that the time signature changes on the start of the next bar.
     */
    set timeSig(value: TimeSig);

    /**
     * How many beats have passed in total since the metronome started.
     * 
     * This should just return `totalBeatTracker.value`.
     */
    get totalBeat(): number;

    /**
     * Records the difference in total beats passed, enabling inspection of the total beat change from one update cycle to the next.
     */
    get totalBeatTracker(): PropertyTracker<number>;

    /**
     * How many quarter notes have passed in total since the metronome started.
     * 
     * This should just return `totalQuarterNoteTracker.value`.
     */
    get totalQuarterNote(): number;

    /**
     * Records the difference in total quarter notes passed, enabling inspection of the total quarter note change from one update cycle to the next.
     */
    get totalQuarterNoteTracker(): PropertyTracker<number>;

    /**
     * Records what bar the metronome is currently on.
     * 
     * This should just return `barTracker.value`.
     */
    get bar(): number;

    /**
     * Records the bar number in the previous update vs the current one.
     */
    get barTracker(): PropertyTracker<number>;

    /**
     * Records how many beats have passed within the current bar.
     * 
     * This should just return `barBeatTracker.value`.
     */
    get barBeat(): number;

    /**
     * Records the difference in bar beat values, enabling inspection of the beat within the current bar from one update cycle to the next.
     */
    get barBeatTracker(): PropertyTracker<number>;

    /**
     * Records how many quarter notes have passed within the current bar
     * 
     * This should just return `barQuarterNoteTracker.value`.
     */
    get barQuarterNote(): number;

    /**
     * Records the difference in bar quarter note values, enabling inspection of the quarter note within the current bar from one update cycle to the next.
     */
    get barQuarterNoteTracker(): PropertyTracker<number>;

    /** Gets whether the metronome is currently enabled to run. */
    get enabled(): boolean;

    /** Sets whether the metronome is currently enabled to run. */
    set enabled(value: boolean);

    /**
     * This takes in a beat and returns true if the metronome is currently at it, or has only just passed it in the bar within the last update cycle.
     * @param beat The beat to test if we've recently passed.
     * @returns 
     */
    atBarBeat(beat: number): boolean;

    /**
     * This takes a quarter note and returns true if the metronome is currently at it, or has only just passed it in the bar within the last update cycle.
     */
    atBarQuarterNote(quarterNote: number): boolean;

    /**
     * This method is exposed primarily for the TickReceiver, so it can get a metronome to update, using its own calculation of how many quarter notes to update by.
     * 
     * This method should not be called by consumers of the library.
     * @param qnDelta The number of quarter notes to update the metronome by.
     */
    updateFromQuarterNoteDelta(qnDelta: number): void;

    /**
     * This method allows for setting the metronome to a specific position.
     * 
     * Note though, that the bar-related values are calculated under the assumption that the metronome's current time signature is the one that it always has.
     * @param totalQuarterNote The new position, as measured in quarter notes.
     */
    setSongPosition(totalQuarterNote: number): void;

    /**
     * Event that fires whenever the metronome is directed to move to a new position.
     */
    get positionChanged(): ShimiEvent<ShimiEventData<IMetronome>, IMetronome>;

    /**
     * Event that fires when the metronome is first started
     */
    get started(): ShimiEvent<ShimiEventData<IMetronome>, IMetronome>;

    /**
     * Event that fires when the metronome is allowed to resume running (enabled = true)
     */
    get continued(): ShimiEvent<ShimiEventData<IMetronome>, IMetronome>;

    /**
     * Event that fires when the metronome is instructed to stop running (enabled = false)
     */
    get stopped(): ShimiEvent<ShimiEventData<IMetronome>, IMetronome>;
}


/**
 * @category Timing
 */
export class MetronomeBase {
    protected _atBarPosition(target: number, tracker: PropertyTracker<number>): boolean {
        if (tracker.oldValue === tracker.value) {
            if (tracker.value === target)
                return true;
            return false;
        }
        if (tracker.oldValue < tracker.value) {
            if (target > tracker.oldValue && target <= tracker.value)
                return true;
            return false;
        }
        else {
            if (target <= tracker.value || target > tracker.oldValue)
                return true;
        }
        return false;
    }
}


/**
 * The Metronome class provides a fairly simple (and possibly naive) implementation of the IMetronome interface, where beats and quarter notes are treated as the same thing.
 * 
 * This results in the metronome being very steady and predictable in how it provides beat information for other linked objects to work with it. It won't change much about its output (other than its concept of where it is within the bar) to fit with changing time signatures.
 * 
 * For an alternative implementation of IMetronome, see [Flexinome](https://jamescoyle1989.github.io/shimi/classes/Flexinome.html).
 * 
 * @category Timing
 */
export default class Metronome extends MetronomeBase implements IMetronome, IClockChild {
    private _tempo: number = 120;
    /** Get the current metronome tempo. */
    get tempo(): number { return this._tempo; }
    /** Set the current metronome tempo. */
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
     * The default value is 1
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

    /** Provides a way of identifying metronomes so they can be easily retrieved later */
    get ref(): string { return this._ref; }
    set ref(value: string) { this._ref = value; }
    private _ref: string;

    private _timeSig: PropertyTracker<TimeSig> = new PropertyTracker();
    /** Get the current metronome time signature. */
    get timeSig(): TimeSig { return this._timeSig.oldValue; }
    /**
     * Set the metronome time signature.
     * 
     * **Note:** This doesn't actually change the time signature straight away, but instead stores it so that the time signature changes on the start of the next bar.
     */
    set timeSig(value: TimeSig) { this._timeSig.value = value; }

    private _totalQuarterNote: PropertyTracker<number> = new PropertyTracker(0);
    /**
     * How many quarter notes have passed in total since the metronome started.
     * 
     * This just returns `totalQuarterNoteTracker.value`.
     */
    get totalQuarterNote(): number { return this._totalQuarterNote.value; }
    /** Records the difference in total quarter notes passed, enabling inspection of the total quarter note change from one update cycle to the next. */
    get totalQuarterNoteTracker(): PropertyTracker<number> { return this._totalQuarterNote; }

    private _totalBeat: PropertyTracker<number> = new PropertyTracker(0);
    /**
     * How many beats have passed in total since the metronome started.
     * 
     * This just returns `totalBeatTracker.value`.
     */
    get totalBeat(): number { return this._totalBeat.value; }
    /** Records the difference in total beats passed, enabling inspection of the total beat change from one update cycle to the next. */
    get totalBeatTracker(): PropertyTracker<number> { return this._totalBeat; }

    private _bar: PropertyTracker<number> = new PropertyTracker(1);
    /**
     * Records what bar the metronome is currently on.
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
    /** Gets whether the metronome is currently enabled to run. */
    get enabled(): boolean { return this._enabled.value; }
    /** Sets whether the metronome is currently enabled to run. */
    set enabled(value: boolean) {
        if (this._enabled.value == value)
            return;
        this._enabled.value = value;
        if (value)
            this.continued.trigger(new ShimiEventData(this));
        else
            this.stopped.trigger(new ShimiEventData(this));
    }

    /** Returns true if the Metronome has been instructed to stop everything by the `finish()` method. */
    get finished(): boolean { return this._finished; }
    private _finished: boolean = false;

    /**
     * @param tempo The tempo to run the metronome at.
     * @param timeSig The time signature for the metronome to use. If not provided then the metronome defaults to common time (4/4).
     */
    constructor(tempo: number, timeSig: TimeSig = null) {
        super();
        if (!tempo || tempo < 0)
            throw new Error('Invalid tempo provided');
        if (timeSig)
            this.timeSig = timeSig;
        else
            this.timeSig = TimeSig.commonTime();
        this._timeSig.accept();
        this.tempo = tempo;
    }

    /**
     * This takes in a beat and returns true if the metronome is currently at it, or has only just passed it in the bar within the last update cycle.
     * @param beat The beat to test if we've recently passed.
     * @returns 
     */
    atBarBeat(beat: number): boolean {
        return super._atBarPosition(beat, this._barBeat);
    }

    /**
     * This takes a quarter note and returns true if the metronome is currently at it, or has only just passed it in the bar within the last update cycle.
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
        this._updateBeatValuesFromQuarterNoteValues();
    }

    private _updateBeatValuesFromQuarterNoteValues(): void {
        //If the bar isn't cleanly divided into quarter notes, and we're in the final part of the bar, don't apply swing
        if (this.timeSig.quarterNotesPerBar % 1 != 0 && Math.floor(this.barQuarterNote) + 1 > this.timeSig.quarterNotesPerBar) {
            this._barBeat.value = this.barQuarterNote;
            this._totalBeat.value = this.totalQuarterNote;
        }
        else {
            this._barBeat.value = this.timeSig.applySwing(this.barQuarterNote);
            this._totalBeat.value = (this.totalQuarterNote - this.barQuarterNote) + this.barBeat;
        }
    }

    /** Calling this tells the metronome to stop whatever it's doing and that it will no longer be used. */
    finish(): void {
        this._finished = true;
        this._enabled.value = false;
    }

    /**
     * Provides a way for setting the ref through a chained function call. For example:
     * 
     * ```
     * clock.addChild(new Metronome(120, TimeSig.commonTime).withRef('metronome'));
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
        this._updateBeatValuesFromQuarterNoteValues();
        this._barBeat.accept();
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