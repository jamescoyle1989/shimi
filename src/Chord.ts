'use strict';

import { IPitchContainer, FitPitchOptions, FitDirection, FitPrecision } from './IPitchContainer';
import Scale from './Scale';
import { parsePitch, safeMod, sortComparison } from './utils';


/**
 * The Chord class holds a collection of pitches that represent a chord.
 * 
 * Examples:
 * ```
 * const chord = new Chord().setRoot(36).addPitches([40, 43]);
 * chord.contains(40)   //Returns true
 * chord.contains(41)   //Returns false
 * chord.fitPitch(44)   //Returns 43
 * chord.getPitch(1)    //Returns 40
 * ```
 * 
 * @category Chords & Scales
 */
export default class Chord implements IPitchContainer {
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.Chord'; }

    /** 
     * Contains the pitches that make up the chord.
     * 
     * Intended for read use only. To modify the chord, use addPitch, addPitches & removePitches methods.
     * 
     * Pitches should always be held in ascending order.
     */
    get pitches(): number[] { return this._pitches; }
    private _pitches: number[] = [];

    /** 
     * The root note of the chord.
     * 
     * Setting this property is the same as calling the setRoot method.
     */
    get root(): number { return this._root; }
    set root(pitch: number) { this.setRoot(pitch); }
    private _root: number = null;

    /**
     * The bass note of the chord.
     */
    get bass(): number { return Math.min(...this._pitches); }


    /**
     * Holds the name of the chord.
     * 
     * Each time a pitch on the chord gets changed, the name property gets wiped out. So long as the static nameGenerator property has been set, then the next time an attempt is made to get the name, it will be automatically recalculated.
     */
    get name(): string {
        if (this._name == null && Chord.nameGenerator != null)
            this._name = Chord.nameGenerator(this);
        return this._name;
    }
    private _name: string = null;

    /** 
     * Holds a function which will be used for any chord that needs to recalculate what its name is.
     * 
     * Example: 
     * ```
     * const scale = shimi.ScaleTemplate.major.create(shimi.pitch('Eb'));
     * const finder = new shimi.ChordFinder().withDefaultChordLookups();
     * shimi.Chord.nameGenerator = (chord) => {
     *     const result = finder.lookupChord(chord.pitches, chord.root, null, scale);
     *     if (result == null)
     *         return null;
     *     return result.name
     *         .replace('{r}', scale.getPitchName(result.root))
     *         .replace('{r}', scale.getPitchName(result.bass));
     * };
     * ```
     */
    static nameGenerator: (Chord) => string = null;
    
    constructor() {
    }

    /**
     * Adds a new pitch to the chord. This method ensures that pitches are stored in ascending order.
     * 
     * @param pitch The pitch to add to the chord. This is only added if the chord doesn't already contain the pitch. Can also take pitch names, see the [pitch](../functions/pitch.html) method for more information.
     * @returns Returns the chord instance, so that method calls can be chained together.
     */
    addPitch(pitch: number | string): Chord {
        if (typeof(pitch) == 'string')
            pitch = parsePitch(pitch);
        
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

    /**
     * Adds multiple new pitches to the chord. This method ensures that pitches are stored in ascending order.
     * 
     * @param pitches The pitches to add to the chord. Each one will only be added if the chord doesn't already contain the pitch. Can also take pitch names, see the [pitch](../functions/pitch.html) method for more information.
     * @returns Returns the chord instance, so that method calls can be chained together.
     */
    addPitches(pitches: Array<number | string>): Chord {
        for (const p of pitches)
            this.addPitch(p);
        return this;
    }

    /**
     * Removes pitches from the chord that match the passed in condition.
     * 
     * @param condition The condition to determine how to remove pitches, for example: `pitch => pitch % 2 == 0` would remove all even numbered pitches from the chord.
     * @returns Returns the chord instance, so that method calls can be chained together.
     */
    removePitches(condition: (pitch: number) => boolean): Chord {
        const beforeCount = this._pitches.length;
        this._pitches = this._pitches.filter(p => !condition(p));
        if (this._pitches.length < beforeCount)
            this._name = null;
        if (this.root && !this._pitches.find(x => x == this.root))
            this.root = null;
        return this;
    }

    /**
     * Sets the root pitch of the chord, also adds the root pitch to the list of pitches if the chord doesn't already contain it.
     * 
     * @param pitch The pitch to be set as the new chord root. Can also take pitch names, see the [pitch](../functions/pitch.html) method for more information.
     * @returns Returns the chord instance, so that method calls can be chained together.
     */
    setRoot(pitch: number | string): Chord {
        if (typeof(pitch) == 'string')
            pitch = parsePitch(pitch);
        
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

    /**
     * Returns a pitch from the chord based on its index. Allows indices below zero or above pitches.length to fetch pitches from additional registers.
     * 
     * Example:
     * ```
     * new shimi.Chord().addPitches([36, 40, 43]).getPitchByIndex(2) => 43
     * new shimi.Chord().addPitches([36, 40, 43]).getPitchByIndex(3) => 48
     * new shimi.Chord().addPitches([36, 40, 43]).getPitchByIndex(-1) => 31
     * ```
     * 
     * @param index The index of the pitch to fetch within the chord
     * @returns Returns a number representing the pitch at the specified index
     */
    getPitchByIndex(index: number): number {
        index = Math.round(index);
        const octaveShift = Math.floor(index / this.pitches.length);
        index -= octaveShift * this.pitches.length;
        return this.pitches[index] + (octaveShift * 12);
    }

    /**
     * Returns true if the chord contains the passed in pitch. The method doesn't care if the pitches are in different octaves.
     * 
     * @param pitch The pitch to check if contained by the chord. Can also take pitch names, see the [pitch](../functions/pitch.html) method for more information.
     */
    contains(pitch: number | string): boolean {
        if (typeof(pitch) == 'string')
            pitch = parsePitch(pitch);

        pitch = safeMod(pitch, 12);
        return this.pitches.find(p => safeMod(p, 12) == pitch) != undefined;
    }

    /** Creates a copy of the chord. */
    duplicate(): Chord {
        const output = new Chord();
        output._pitches = this.pitches.slice();
        output._root = this.root;
        output._name = this.name;
        return output;
    }

    /**
     * Adds one or more pitches to a chord, based on chord degrees. For example, addDegrees([3,5]) would add a 3rd & 5th to the chord. The degrees added will always default to the major/perfect variety, though if the scale parameter is used, then the minor/diminished/augmented versions can be used if they would be deemed to be a better fit within the scale. If you want to force the use of the minor/diminished version of the degree, then the degree can be provided as a negative, for example: addDegrees([-3,5])
     * @param degrees The degrees of the chord to be added.
     * @param scale Optional, used to allow for better fitting pitch selection.
     * @returns Returns the chord instance, so that method calls can be chained together.
     */
    addDegrees(degrees: Array<number>, scale: Scale = null): Chord {
        if (this.root == null)
            throw new Error('You cannot add degrees to the chord before its root has been set');
        
        for (let degree of degrees) {
            let forceFallback = false;
            if (degree < 0) {
                forceFallback = true;
                degree = Math.abs(degree);
            }

            //Map each degree to one less, this makes them 0-based and far easier to work with
            degree--;

            let pitch = this.root;
            if (degree >= 7)
                pitch += Math.floor(degree / 7) * 12;

            let degreeAddition = { main: 0, fallback: 0 };
            switch (degree % 7) {
                case 1:
                    degreeAddition = { main: 2, fallback: 1 };
                    break;
                case 2:
                    degreeAddition = { main: 4, fallback: 3 };
                    break;
                case 3:
                    degreeAddition = { main: 5, fallback: 6 };
                    break;
                case 4:
                    degreeAddition = { main: 7, fallback: 6 };
                    break;
                case 5:
                    degreeAddition = { main: 9, fallback: 8 };
                    break;
                case 6:
                    degreeAddition = { main: 11, fallback: 10 };
                    break;
            }

            if (forceFallback)
                pitch += degreeAddition.fallback
            else if (
                scale == null ||
                scale.contains(pitch + degreeAddition.main) ||
                !scale.contains(pitch + degreeAddition.fallback)
            )
                pitch += degreeAddition.main;
            else
                pitch += degreeAddition.fallback;

            this.addPitch(pitch);
        }
        return this;
    }

    /** 
     * @deprecated Just use addPitches instead
     * 
     * Adds a 2nd degree to the chord, see addDegrees for more info. 
     * */
    add2nd(scale: Scale = null): Chord {
        return this.addDegrees([2], scale);
    }

    /** 
     * @deprecated Just use addPitches instead
     * 
     * Adds a 3rd degree to the chord, see addDegrees for more info. 
     * */
    add3rd(scale: Scale = null): Chord {
        return this.addDegrees([3], scale);
    }

    /** 
     * @deprecated Just use addPitches instead
     * 
     * Adds a 4th degree to the chord, see addDegrees for more info. 
     * */
    add4th(scale: Scale = null): Chord {
        return this.addDegrees([4], scale);
    }

    /** 
     * @deprecated Just use addPitches instead
     * 
     * Adds a 5th degree to the chord, see addDegrees for more info. 
     * */
    add5th(scale: Scale = null): Chord {
        return this.addDegrees([5], scale);
    }

    /** 
     * @deprecated Just use addPitches instead
     * 
     * Adds a 6th degree to the chord, see addDegrees for more info. 
     * */
    add6th(scale: Scale = null): Chord {
        return this.addDegrees([6], scale);
    }

    /** 
     * @deprecated Just use addPitches instead
     * 
     * Adds a 7th degree to the chord, see addDegrees for more info. 
     * */
    add7th(scale: Scale = null): Chord {
        return this.addDegrees([7], scale);
    }

    /** 
     * @deprecated Just use addPitches instead
     * 
     * Adds a 9th degree to the chord, see addDegrees for more info. 
    */
    add9th(scale: Scale = null): Chord {
        return this.addDegrees([9], scale);
    }

    /** 
     * @deprecated Just use addPitches instead
     * 
     * Adds a 11th degree to the chord, see addDegrees for more info. 
     * */
    add11th(scale: Scale = null): Chord {
        return this.addDegrees([11], scale);
    }

    /**
     * Modifies the pitches within a chord up/down octaves so that they are nearer to the desired pitch
     * @param pitch The pitch which the chord should be moved closer to
     * @param allowInversions Defaults to false, meaning the entire chord must be moved up/down as one. If true, then single pitches within the chord can be moved, allowing for inversions.
     * @returns Returns the chord instance which the method was called on.
     */
    near(pitch: number | string, allowInversions: boolean = false): Chord {
        if (typeof(pitch) == 'string')
            pitch = parsePitch(pitch);

        const avgPitch = this.pitches.reduce((p,c) => p + c, 0) / this.pitches.length;

        //Round to the nearest half-octave, then proceed manually, so that we can prefer rounding mid-points down rather than up.
        let octaveDiff = Math.round((pitch - avgPitch) / 6);
        if (octaveDiff % 2 == 1)
            octaveDiff = (octaveDiff < 0) ? octaveDiff + 1 : octaveDiff - 1;
        octaveDiff /= 2;

        if (octaveDiff != 0) {
            for (let i = 0; i < this.pitches.length; i++)
                this.pitches[i] += octaveDiff * 12;
        }

        if (allowInversions) {
            for (let i = 0; i < this.pitches.length; i++) {
                if (pitch - this.pitches[i] > 6)
                    this.pitches[i] += 12;
                else if (this.pitches[i] - pitch > 6)
                    this.pitches[i] -= 12;
            }
            this._pitches = this.pitches.sort((a, b) => sortComparison(a, b, x => x));
        }
        
        return this;
    }

    /**
     * Returns a pitch near to the passed in pitch, but which should fit better with the notes within the chord.
     * 
     * @param pitch The pitch which we want to fit to the chord. Can also take pitch names, see the [pitch](../functions/pitch.html) method for more information.
     * @param options The options allow us to configure how we want the pitch to be fitted to the chord
     * @returns Returns a new pitch number
     */
    fitPitch(pitch: number | string, options?: Partial<FitPitchOptions>): number {
        if (typeof(pitch) == 'string')
            pitch = parsePitch(pitch);
        
        const fullOptions = new FitPitchOptions(options);

        let fitFunction = p => this._isTightFit(p, fullOptions);
        if (fullOptions.precision == 'MEDIUM') fitFunction = p => this._isMediumFit(p, fullOptions);
        if (fullOptions.precision == 'LOOSE') fitFunction = p => this._isLooseFit(p, fullOptions);

        //Set direction to either 1 or -1, 1 means prefer upward motion, -1 means prefer downward motion
        let direction = 1;
        if (fullOptions.preferredDirection == 'DOWN')
            direction = -1;
        else if (fullOptions.preferredDirection == 'RANDOM')
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
                //If we prefer the root, if either pitch1 or pitch2 are the chord root, then just instantly return that
                if (fullOptions.preferRoot) {
                    if (pitch1Valid && safeMod(pitch1, 12) == safeMod(this.root, 12))
                        return pitch1;
                    if (pitch2Valid && safeMod(pitch2, 12) == safeMod(this.root, 12))
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