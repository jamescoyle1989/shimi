'use strict';

import { IPitchContainer, FitPitchOptions } from './IPitchContainer';
import ScaleTemplate from './ScaleTemplate';
import { parsePitch, safeMod, sortComparison } from './utils';


/** This class is used by the Scale class to hold information about the proper naming of pitches, relative to some specific scale */
export class PitchName {
    pitch: number;
    letter: string;
    accidental: number;

    constructor(pitch: number, letter: string, accidental?: number) {
        this.pitch = pitch;
        this.letter = letter;
        this.accidental = accidental;
    }

    toString(): string {
        if (this.accidental == null)
            return this.letter;
        if (this.accidental == 0)
            return this.letter + '♮';
        let output = this.letter;
        if (Math.abs(this.accidental) >= 2)
            output += ((this.accidental > 0) ? '𝄪' : '𝄫').repeat(Math.abs(this.accidental / 2));
        if (Math.abs(this.accidental) % 2 == 1)
            output += (this.accidental > 0) ? '♯' : '♭';
        return output;
    }
}


/**
 * The Scale class defines the collection of pitches that make up a specific scale.
 * 
 * @category Chords & Scales
 */
export default class Scale implements IPitchContainer {
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.Scale'; }

    /** The name of the scale */
    get name(): string { return this._name; }
    set name(value: string) { this._name = value; }
    private _name: string;

    /**
     * The pitches which make up the scale, ordered ascending by scale degree from the scale's root, with each pitch within the range 0 - 11.
     * 
     * For example, the pitches collection for F major would be: `[5, 7, 9, 10, 0, 2, 4]`
     */
    get pitches(): number[] { return this._pitches; }
    private _pitches: number[];

    /** The template which the scale is built from. */
    get template(): ScaleTemplate { return this._template; }
    private _template: ScaleTemplate;

    /** How many pitches are in the scale. */
    get length(): number { return this.pitches.length; }

    /** The root pitch of the scale. */
    get root(): number { return this.pitches[0]; }

    private _pitchNames: PitchName[];

    /**
     * @param template The ScaleTemplate object which defines the scale type that this scale uses.
     * @param root The root of the scale. Can also take pitch names, see the [pitch](../functions/pitch.html) method for more information.
     */
    constructor(template: ScaleTemplate, root: number | string) {
        let rootNum = (typeof(root) == 'string') ? parsePitch(root) : root;
        
        rootNum = safeMod(rootNum, 12);
        this._pitches = template.shape.map(x => (rootNum + x) % 12);

        this._template = template;

        this._generatePitchNames();

        this.name = this.getPitchName(this.root) + ' ' + template.name;
    }

    /** 
     * Returns true if the passed in pitch belongs to the scale. Can also take pitch names, see the [pitch](../functions/pitch.html) method for more information.
     * 
     * For example: 
     * ```
     * cMajor.contains(7) //returns true
     * cMajor.contains('Db7') //returns false
     * cMajor.contains('A8') //returns true
     * ```
     */
    contains(pitch: number | string): boolean {
        if (typeof(pitch) == 'string')
            pitch = parsePitch(pitch);
        
        pitch = safeMod(pitch, 12);
        return this.pitches.find(p => p == pitch) != undefined;
    }

    /** Returns the scale degree of the passed in pitch, or -1 if it's not contained. Can also take pitch names, see the [pitch](../functions/pitch.html) function for more information. */
    degreeOf(pitch: number | string): number {
        if (typeof(pitch) == 'string')
            pitch = parsePitch(pitch);

        pitch = safeMod(pitch, 12);
        for (let i = 0; i < this.pitches.length; i++) {
            if (this.pitches[i] == pitch)
                return i + 1;
        }
        
        return -1;
    }

    /**
     * Takes a numerical pitch value and returns a string representation of that pitch, that makes sense relative to the scale.
     * 
     * For example:
     * ```
     * cMajor.getPitchName(7)      //returns 'G'
     * cMajor.getPitchName('E')    //returns 'E'
     * cMinor.getPitchName('E')    //returns 'E♮'
     * ```
     * @param pitch The pitch to get the string representation of. Can also take pitch names, see the [pitch](../functions/pitch.html) method for more information.
     * @param showOctave Whether to show a number after the name showing which octave we're in.
     * @returns 
     */
    getPitchName(pitch: number | string, showOctave: boolean = false): string {
        if (typeof(pitch) == 'string')
            pitch = parsePitch(pitch);
        
        const pitchName = this._pitchNames[safeMod(pitch, 12)];
        let output = pitchName.toString();
        if (showOctave)
            output += Math.floor((pitch - (pitchName.accidental ?? 0)) / 12) - 1;
        return output;
    }

    /**
     * The degree method accepts a numerical scale degree, and returns the numerical pitch value which it corresponds to.
     * @param degree The degree of the scale to fetch. This starts counting from root = 1.
     * 
     * If degree is greater than scale.length, then how much higher it is will determine how many octaves it shifts up in its search. For example:
     * ```
     * cMajor.degree(3, 2)  //returns 40
     * cMajor.degree(10, 2) //returns 52
     * cMajor.degree(17, 2) //returns 64
     * ```
     * 
     * Similarly, if degree is less than 1, then how much lower it is will determine how many octaves it shifts down in its search.
     * @param rootOctave The octave of the scale root, which the returned pitch is calculated in relation to.
     * @returns 
     */
    getPitchByDegree(degree: number, rootOctave: number = -1): number {
        degree = Math.round(degree - 1);
        let octaveShift = Math.floor(degree / this.length);
        degree -= octaveShift * this.length;
        const pitch = this.pitches[safeMod(degree, this.length)];
        if (pitch < this.root)
            octaveShift++;
        return pitch + (octaveShift * 12) + ((rootOctave + 1) * 12);
    }

    /**
     * The pitchesInRange method takes 2 numerical values, and returns all scale pitches which exist within that range. The search is inclusive of the passed in pitch parameters. Can also take pitch names, see the [pitch](../functions/pitch.html) method for more information.
     * 
     * Note, if lowPitch > highPitch, then rather than throw an error, lowPitch & highPitch are swapped in their roles.
     * @param lowPitch The low pitch to compare against.
     * @param highPitch The high pitch to compare against.
     * @returns 
     */
    pitchesInRange(lowPitch: number | string, highPitch: number | string): Array<number> {
        if (typeof(lowPitch) == 'string')
            lowPitch = parsePitch(lowPitch);
        if (typeof(highPitch) == 'string')
            highPitch = parsePitch(highPitch);
        
        if (lowPitch > highPitch)
            return this.pitchesInRange(highPitch, lowPitch);

        let output = [];
        const scalePitches = this.pitches.slice().sort((a, b) => sortComparison(a, b, x => x));
        for (let octave = Math.floor(lowPitch / 12) * 12; true; octave += 12) {
            for (const p of scalePitches) {
                const pitch = p + octave;
                if (pitch >= lowPitch && pitch <= highPitch)
                    output.push(pitch);
            }
            if (octave > highPitch)
                break;
        }
        return output;
    }

    /**
     * Returns a pitch near to the passed in pitch, but which should fit better with the notes within the scale.
     * @param pitch The pitch which we want to fit to the scale. Can also take pitch names, see the [pitch](../functions/pitch.html) method for more information.
     * @param options The options allow us to configure how we want the pitch to be fitted to the scale.
     * @returns Returns a new pitch number.
     */
    fitPitch(
        pitch: number | string,
        options?: Partial<FitPitchOptions>,
        fallbackOptions?: Partial<FitPitchOptions>
    ): number {
        if (typeof(pitch) == 'string')
            pitch = parsePitch(pitch);
        
        options = new FitPitchOptions(options);

        //Set direction to either 1 or -1, 1 means prefer upward motion, -1 means prefer downward motion
        let direction = 1;
        if (options.preferredDirection == 'DOWN')
            direction = -1;
        else if (options.preferredDirection == 'RANDOM')
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
            const pitch1InRange = Math.abs(pitch1 - pitch) <= options.maxMovement;
            const pitch2InRange = Math.abs(pitch2 - pitch) <= options.maxMovement;
            if (!pitch1InRange && !pitch2InRange)
                break;
            const pitch1Valid = pitch1InRange && !options.avoid.includes(pitch1);
            const pitch2Valid = pitch2InRange && !options.avoid.includes(pitch2);
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

        if (!!fallbackOptions)
            return this.fitPitch(pitch, fallbackOptions);
        return Math.round(pitch);
    }

    /**
     * Generates an array which specifies how each note (both in & out of the scale should be named
     */
    private _generatePitchNames(): void {
        const relativeMajorRoot = safeMod(this.root - this.template.relativityToMajor, 12);

        //1 = prefer sharps, -1 = prefer flats
        const scalePreference = ([0, 7, 2, 9, 4, 11].find(x => x == relativeMajorRoot) != undefined) ? 1 : -1;

        //Build a 2D array of possible names that can be used for each of the 12 pitches
        const n = (pitch: number, letter: string, accidental?: number) => new PitchName(pitch, letter, accidental);
        const pitchNames = [
            [n(0, 'B', 1), n(0, 'C', 0), n(0, 'D', -2)],    //C
            [n(1, 'B', 2), n(1, 'C', 1), n(1, 'D', -1)],
            [n(2, 'C', 2), n(2, 'D', 0), n(2, 'E', -2)],    //D
            [n(3, 'D', 1), n(3, 'E', -1), n(3, 'F', -2)],
            [n(4, 'D', 2), n(4, 'E', 0), n(4, 'F', -2)],    //E
            [n(5, 'E', 1), n(5, 'F', 0), n(5, 'G', -2)],    //F
            [n(6, 'E', 2), n(6, 'F', 1), n(6, 'G', -1)],
            [n(7, 'F', 2), n(7, 'G', 0), n(7, 'A', -2)],    //G
            [n(8, 'G', 1), n(8, 'A', -1)],
            [n(9, 'G', 2), n(9, 'A', 0), n(9, 'B', -2)],    //A
            [n(10, 'A', 1), n(10, 'B', -1), n(10, 'C', -2)],
            [n(11, 'A', 2), n(11, 'B', 0), n(11, 'C', -1)]  //B
        ];

        //Indices 2, 4, 9 & 11 are 1, that means notes which are those amounts above the root prefer to go sharp
        //Indices 1, 3, 8 & 10 are -1, that means notes which are those amounts above the root prefer to go flat
        //Indices 0, 5, 6 & 7 are null, that means notes which are those amounts above the root defer to the scale preference
        const degreePreferences = [null, -1, 1, -1, 1, null, null, null, -1, 1, -1, 1];

        const results: PitchName[] = [];

        //First of all, select names for the notes which are inside the scale
        let scalePitches = this.pitches.slice();
        for (const pitch of scalePitches) {
            let nameOptions = pitchNames[pitch];

            //If there's an option to go natural, always take it if it hasn't already been used
            const naturalName = nameOptions.find(x => x.accidental == 0 && this._notInUsedNames(x, results));
            if (naturalName) {
                results.push(n(pitch, naturalName.letter));
                continue;
            }

            //Go through process of applying different filters until a satisfactory result is found
            const preference = degreePreferences[safeMod(pitch - this.root, 12)] ?? scalePreference;

            let filteredOptions = nameOptions
                .filter(x => this._matchesPreference(x, preference) && this._notInUsedNames(x, results));
            if (filteredOptions.length == 0) {
                filteredOptions = nameOptions.filter(x => this._notInUsedNames(x, results));
                if (filteredOptions.length == 0)
                    filteredOptions = nameOptions.filter(x => this._matchesPreference(x, preference));
            }

            results.push(filteredOptions.sort((a, b) => sortComparison(a, b, x => Math.abs(x.accidental)))[0]);
        }

        const outOfScalePitches = [...Array(12).keys()].filter(x => scalePitches.find(y => x == y) == undefined);
        for (const pitch of outOfScalePitches) {
            let nameOptions = pitchNames[pitch];

            //Special rule for leading tone when root is sharp
            //For example, in F# natural minor, the leading tone should be E#, not F
            if (safeMod(pitch - this.root, 12) == 11 && results[0].accidental == 1) {
                results.push(nameOptions.filter(x => x.accidental > 0)[0]);
                continue;
            }

            //If there's any option to go natural, always take it
            const naturalName = nameOptions.find(x => x.accidental == 0);
            if (naturalName) {
                results.push(naturalName);
                continue;
            }

            const preference = degreePreferences[safeMod(pitch - this.root, 12)] ?? scalePreference;
            results.push(
                nameOptions
                .filter(x => this._matchesPreference(x, preference))
                .sort((a, b) => sortComparison(a, b, x => Math.abs(x.accidental)))
                [0]
            );
        }

        this._pitchNames = results.sort((a, b) => sortComparison(a, b, x => x.pitch))
    }

    private _notInUsedNames(name: PitchName, usedNames: PitchName[]): boolean {
        return !usedNames.find(x => x.letter == name.letter);
    }

    private _matchesPreference(name: PitchName, preference: number): boolean {
        return name.accidental * preference >= 0;
    }

    /** Returns a new Scale object whose root is 7 semi-tones above (or 5 semi-tones below) the root of the current scale. */
    getDominantScale(): Scale {
        return new Scale(this.template, this.root + 7);
    }

    /** Returns a new Scale object whose root is 5 semi-tones above (or 7 semi-tones below) the root of the calling scale. */
    getSubdominantScale(): Scale {
        return new Scale(this.template, this.root + 5);
    }

    /** Returns a new Scale object whose root is x semi-tones above or below the root of the calling scale. */
    getTransposedScale(transposition: number): Scale {
        return new Scale(this.template, this.root + transposition);
    }

    /**
     * Returns a new Scale object that is relative to the current scale, according to how the template.relativityToMajor properties have been set up.
     * 
     * For example, `eMinor.getRelativeScale(shimi.ScaleTemplate.dorian)` would return an A dorian scale.
     * @param template The template which we want the relative scale to be of. If the calling scale already has that template, then the method just returns the calling scale object.
     * @returns 
     */
    getRelativeScale(template: ScaleTemplate): Scale {
        if (template == this.template)
            return this;
        return new Scale(template, this.root - this.template.relativityToMajor + template.relativityToMajor);
    }

    /**
     * Returns a new Scale object that is parallel to the current scale.
     * 
     * For example, `eMinor.getRelativeScale(shimi.ScaleTemplate.dorian)` would return an E dorian scale.
     * @param template The template which we want the parallel scale to be of. If the calling scale already has that template, then the method just returns the calling scale object.
     * @returns 
     */
    getParallelScale(template: ScaleTemplate): Scale {
        if (template == this.template)
            return this;
        return new Scale(template, this.root);
    }
}