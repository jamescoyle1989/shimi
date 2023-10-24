'use strict';

import Chord from './Chord';
import ChordProgression, { ChordProgressionChord } from './ChordProgression';
import { IMetronome } from './Metronome';
import ShimiEvent, { ShimiEventData } from './ShimiEvent';
import Clock, { ClockChildFinishedEvent, ClockChildFinishedEventData, IClockChild } from './Clock';


/**
 * The ChordEventData extends ShimiEventData, and contains a chord which some object wants to notify others about.
 * 
 * @category Chords & Scales
 */
export class ChordEventData<TSource> extends ShimiEventData<TSource> {
    get chord(): Chord { return this._chord; }
    private _chord: Chord;

    constructor(source: TSource, chord: Chord) {
        super(source);
        this._chord = chord;
    }
}


/**
 * The ChordEvent class extends ShimiEvent, providing an object which can be subscribed to.
 * 
 * It distributes events which point back to the source object that fired the event, and a ChordEventData object that contains the event information.
 * 
 * @category Chords & Scales
 */
export class ChordEvent<TSource> extends ShimiEvent<ChordEventData<TSource>, TSource> {
}


/**
 * The ChordProgressionPlayer facilitates the playing of a chord. It doesn't actually cause the generation of any note on/note off events. Instead it triggers events whenever the chord changes, allowing other objects to easily play/arpeggiate/do whatever they like over a series of changing chords.
 * 
 * @category Chords & Scales
 */
export default class ChordProgressionPlayer implements IClockChild {
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.ChordProgressionPlayer'; }

    /** The chord progression to play */
    get chordProgression(): ChordProgression { return this._chordProgression; }
    set chordProgression(value: ChordProgression) {
        if (this._chordProgression === value)
            return;
        this._chordProgression = value;
    }
    private _chordProgression: ChordProgression;

    /** The metronome which the player uses for tracking passed beats. */
    get metronome(): IMetronome { return this._metronome; }
    set metronome(value: IMetronome) { this._metronome = value; }
    private _metronome: IMetronome;

    /** How many beats in the chord progression to play for every beat that passes in actual time. For example: 1.5 means the chord progression is played 1.5 times faster than it would normally. */
    get speed(): number { return this._speed; }
    set speed(value: number) { this._speed = value; }
    private _speed: number = 1;

    /** Which beat of the chord progression to start playing from. This allows for a chord progression player to begin playing a chord progression from half-way through for example. */
    get startBeat(): number { return this._startBeat; }
    set startBeat(value: number) { this._startBeat = value; }
    private _startBeat: number = 0;

    /** How many beats should have passed before the chord progression player stops. The default value is null, meaning the chord progression player never stops, and continually loops playback of the chord progression. */
    get beatCount(): number { return this._beatCount; }
    set beatCount(value: number) { this._beatCount = value; }
    private _beatCount: number = null;

    /** How many beats have passed since the chord progression player started. */
    get beatsPassed(): number { return this._beatsPassed; }
    private _beatsPassed: number = 0;

    /** Provides a way of identifying a chord progression player so that it can be easily retrieved later. */
    get ref(): string { return this._ref; }
    set ref(value: string) { this._ref = value; }
    private _ref: string;

    /** Returns true if the chord progression player has finished playing its chord progression. */
    get isFinished(): boolean { return this._isFinished; }
    private _isFinished: boolean = false;

    /** This event fires when the chord progression player finishes. */
    get finished(): ClockChildFinishedEvent { return this._finished; }
    private _finished: ClockChildFinishedEvent = new ClockChildFinishedEvent();

    /** Returns the chord that is currently being played. */
    get currentChord(): ChordProgressionChord { return this._currentChord; }
    private _currentChord: ChordProgressionChord;

    /**
     * The chordChanged event dispatches a new event data object each time the current chord changes.
     */
    get chordChanged(): ChordEvent<ChordProgressionPlayer> { return this._chordChanged; }
    private _chordChanged: ChordEvent<ChordProgressionPlayer> = new ChordEvent<ChordProgressionPlayer>();


    /**
     * @param chordProgression The chord progression to play.
     * @param metronome The metronome which the player uses for tracking passed beats.
     */
    constructor(chordProgression: ChordProgression, metronome: IMetronome) {
        this.chordProgression = chordProgression;
        this.metronome = metronome;
        if (!!Clock.default)
            Clock.default.addChild(this);
    }

    /**
     * This method is intended to be called by a clock to provide regular updates. It should not be called by consumers of the library.
     * @param deltaMs How many milliseconds have passed since the last update cycle.
     * @returns 
     */
    update(deltaMs: number): void {
        const beatDiff = (this.metronome.totalBeat - this.metronome.totalBeatTracker.oldValue) * this.speed;
        if (beatDiff == 0)
            return;

        const newBeatsPassed = this.beatsPassed + beatDiff;
        const newProgBeat = (this.startBeat + newBeatsPassed) % this.chordProgression.duration;
        this._beatsPassed += beatDiff;
        if (typeof(this.beatCount) == 'number' && this.beatsPassed >= this.beatCount) {
            this.finish();
            return;
        }

        const newCPC = this.chordProgression.getChordAt(newProgBeat);
        if (newCPC !== this.currentChord) {
            this._currentChord = newCPC;
            this.chordChanged.trigger(new ChordEventData(this, newCPC?.chord));
        }
    }

    /** Calling this tells the player to stop whatever it's doing and that it will no longer be used. */
    finish(): void {
        this._isFinished = true;
        this.finished.trigger(new ClockChildFinishedEventData(this));
    }

    /**
     * Provides a way for setting the ref through a chained function call. For example:
     * 
     * ```
     * clock.addChild(new ChordProgressionPlayer(chords, metronome).withRef('player'));
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