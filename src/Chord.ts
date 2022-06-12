'use strict';

import { IPitchContainer, FitPitchOptions, FitDirection, FitPrecision } from './IPitchContainer';
import { safeMod } from './utils';


/**
 * @category Chords & Scales
 */
export default class Chord implements IPitchContainer {
    /** Intended for read use only. To modify the chord, use addPitch, addPitches & removePitches methods */
    get pitches(): number[] { return this._pitches; }
    private _pitches: number[] = [];

    /** The root note of the chord */
    get root(): number { return this._root; }
    set root(pitch: number) {
        this.setRoot(pitch);
    }
    private _root: number = null;

    get name(): string {
        if (this._name == null && Chord.nameGenerator != null)
            this._name = Chord.nameGenerator(this);
        return this._name;
    }
    private _name: string = null;

    /** Used for automatically generating chord names */
    static nameGenerator: (Chord) => string = null;
    
    constructor() {
    }

    /** Adds a new pitch to the chord, if it's not already contained */
    addPitch(pitch: number): Chord {
        if (!this._pitches.find(x => x == pitch)) {
            this._name = null;
            for (let i = 0; i < this._pitches.length; i++) {
                if (this._pitches[i] > pitch) {
                    this._pitches.splice(i, 0, pitch);
                    return this;
                }
            }
            this._pitches.push(pitch);
        }
        return this;
    }

    /** Adds new pitches to the chord, if they're not already contained */
    addPitches(pitches: number[]): Chord {
        for (const p of pitches)
            this.addPitch(p);
        return this;
    }

    /** Removes pitches from the chord that match the passed in condition */
    removePitches(condition: (pitch: number) => boolean): Chord {
        const beforeCount = this._pitches.length;
        this._pitches = this._pitches.filter(p => !condition(p));
        if (this._pitches.length < beforeCount)
            this._name = null;
        if (this.root && !this._pitches.find(x => x == this.root))
            this.root = null;
        return this;
    }

    /** Sets the root of the chord, also adds to pitches property if not already present */
    setRoot(pitch: number): Chord {
        if (this._root != pitch) {
            if (pitch == undefined || pitch == null)
                this._root = null;
            else {
                this._root = pitch;
                this.addPitch(pitch);
            }
            this._name = null;
        }
        return this;
    }

    /** Returns a pitch from the chord based on its index. Allows indices below zero or above pitches.length to fetch pitches from additional registers */
    getPitch(index: number): number {
        index = Math.round(index);
        const octaveShift = Math.floor(index / this.pitches.length);
        index -= octaveShift * this.pitches.length;
        return this.pitches[index] + (octaveShift * 12);
    }

    /** Returns true if the chord contains the passed in pitch. Doesn't care if pitches are in different octaves */
    contains(pitch: number): boolean {
        pitch = safeMod(pitch, 12);
        return this.pitches.find(p => safeMod(p, 12) == pitch) != undefined;
    }

    /** Returns a pitch number which should fit with the notes of the chord */
    fitPitch(pitch: number, options?: Partial<FitPitchOptions>): number {
        const fullOptions = new FitPitchOptions(options);

        let fitFunction = p => this._isTightFit(p, fullOptions);
        if (fullOptions.precision == FitPrecision.medium) fitFunction = p => this._isMediumFit(p, fullOptions);
        if (fullOptions.precision == FitPrecision.loose) fitFunction = p => this._isLooseFit(p, fullOptions);

        //Set direction to either 1 or -1, 1 means prefer upward motion, -1 means prefer downward motion
        let direction = 1;
        if (fullOptions.preferredDirection == FitDirection.down)
            direction = -1;
        else if (fullOptions.preferredDirection == FitDirection.random)
            direction = (Math.random() >= 0.5) ? 1 : -1;

        //Set starting positions for pitch1 & pitch2, these will move in opposite directions
        //pitch1 will move in the preferred direction
        //If pitch is an integer, they both start at the same position
        //Otherwise they start on the integer positions surrounding pitch
        let pitch1 = pitch;
        let pitch2 = pitch;
        if (pitch % 1 != 0) {
            pitch1 = (direction > 0) ? Math.ceil(pitch) : Math.floor(pitch);
            pitch2 = (direction > 0) ? Math.floor(pitch) : Math.ceil(pitch);
        }

        //Enter the main loop of the function, continue while at least one of pitch1 or pitch2 are within the movement range
        while (true) {
            const pitch1Valid = Math.abs(pitch1 - pitch) <= fullOptions.maxMovement;
            const pitch2Valid = Math.abs(pitch2 - pitch) <= fullOptions.maxMovement;
            if (!pitch1Valid && !pitch2Valid)
                break;
            const fit1 = pitch1Valid ? fitFunction(pitch1) : 0;
            const fit2 = pitch2Valid ? fitFunction(pitch2) : 0;
            if (fit1 + fit2 > 0) {
                if (fit1 > fit2) return pitch1;
                if (fit2 > fit1) return pitch2;
                //If we prefer the root, if either pitch1 or pitch2 are the scale root, then just instantly return that
                if (fullOptions.preferRoot) {
                    if (pitch1Valid && safeMod(pitch1, 12) == this.root)
                        return pitch1;
                    if (pitch2Valid && safeMod(pitch2, 12) == this.root)
                        return pitch2;
                }
                if (Math.abs(pitch1 - pitch) <= Math.abs(pitch2 - pitch))
                    return pitch1;
                return pitch2;
            }
            pitch1 += direction;
            pitch2 -= direction;
        }
        return Math.round(pitch);
    }

    /** The pitch is part of the chord, returns 1 if in chord, 0 if not */
    private _isTightFit(pitch: number, options: FitPitchOptions): number {
        if (this.contains(pitch))
            return 1;
        return 0;
    }

    /**
     * Same as strict, but also allows pitches which belong to the scale
     * if they're at least 2 steps away from all of the chord pitches
     * Returns 1 if in chord, 0.5 if in scale and at least 2 steps from chord, 0 if neither
     */
    private _isMediumFit(pitch: number, options: FitPitchOptions): number {
        if (this.contains(pitch))
            return 1;
        const scale = options.scale;
        if (scale) {
            if (!scale.contains(pitch))
                return 0;
        }
        if (this.contains(pitch + 1) || this.contains(pitch - 1))
            return 0;
        return 0.5;
    }

    /**
     * The pitch belongs to either the chord, or the scale
     * Returns 1 if in chord, 0.5 if in scale, 0 if in neither
     * @param pitch 
     * @param options 
     * @returns 
     */
    private _isLooseFit(pitch: number, options: FitPitchOptions): number {
        if (this.contains(pitch))
            return 1;
        const scale = options.scale;
        if (scale) {
            if (scale.contains(pitch))
                return 0.5;
            else
                return 0;
        }
        return 0.5;
    }
}