'use strict';

import { IPitchContainer, FitPitchOptions, FitDirection } from './IPitchContainer';
import { safeMod } from './utils';


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
    
    constructor() {
    }

    /** Adds a new pitch to the chord, if it's not already contained */
    addPitch(pitch: number): Chord {
        if (!this._pitches.find(x => x == pitch))
            this._pitches.push(pitch);
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
        this._pitches = this._pitches.filter(p => !condition(p));
        if (this.root && !this._pitches.find(x => x == this.root))
            this.root = null;
        return this;
    }

    /** Sets the root of the chord, also adds to pitches property if not already present */
    setRoot(pitch: number): Chord {
        if (pitch == undefined || pitch == null)
            this._root = null;
        else {
            this._root = pitch;
            this.addPitch(pitch);
        }
        return this;
    }

    /** Returns true if the chord contains the passed in pitch. Doesn't care if pitches are in different octaves */
    contains(pitch: number): boolean {
        pitch = safeMod(pitch, 12);
        return this.pitches.find(p => safeMod(p, 12) == pitch) != undefined;
    }

    /** Returns a pitch number which should fit with the notes of the chord */
    fitPitch(pitch: number, options?: Partial<FitPitchOptions>): number {
        options = new FitPitchOptions(options);

        //Set direction to either 1 or -1, 1 means prefer upward motion, -1 means prefer downward motion
        let direction = 1;
        if (options.preferredDirection == FitDirection.down)
            direction = -1;
        else if (options.preferredDirection == FitDirection.random)
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
            const pitch1Valid = Math.abs(pitch1 - pitch) <= options.maxMovement;
            const pitch2Valid = Math.abs(pitch2 - pitch) <= options.maxMovement;
            if (!pitch1Valid && !pitch2Valid)
                break;
            //If we prefer the root, if either pitch1 or pitch2 are the scale root, then just instantly return that
            if (options.preferRoot) {
                if (pitch1Valid && safeMod(pitch1, 12) == this.root)
                    return pitch1;
                if (pitch2Valid && safeMod(pitch2, 12) == this.root)
                    return pitch2;
            }
            //Otherwise, check if either pitch1 or pitch2 are contained in the scale
            const pitch1Fits = pitch1Valid && this.contains(pitch1);
            const pitch2Fits = pitch2Valid && this.contains(pitch2);
            if (pitch1Fits || pitch2Fits) {
                //If both fit, return whichever is closest, favouring pitch1 if equal distance
                if (pitch1Fits && pitch2Fits) {
                    if (Math.abs(pitch1 - pitch ) <= Math.abs(pitch2 - pitch))
                        return pitch1;
                    return pitch2;
                }
                if (pitch1Fits)
                    return pitch1;
                return pitch2;
            }
            pitch1 += direction;
            pitch2 -= direction;
        }
        return Math.round(pitch);
    }
}