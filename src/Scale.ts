'use strict';

import { IPitchContainer, FitPitchOptions, FitDirection } from './IPitchContainer';
import ScaleTemplate from './ScaleTemplate';
import { safeMod, sortComparison } from './utils';


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


export class PitchBuilder {
    pitch: number;

    constructor(pitch: number) {
        this.pitch = pitch;
    }

    near(pitch: number): PitchBuilder {
        const octaveDiff = Math.round((pitch - this.pitch) / 12);
        this.pitch = this.pitch + (octaveDiff * 12);
        return this;
    }
}


export default class Scale implements IPitchContainer {
    /** The name of the scale */
    get name(): string { return this._name; }
    /** The name of the scale */
    set name(value: string) { this._name = value; }
    private _name: string;

    /** The notes which make up the scale, ordered ascending from the scale's root */
    get pitches(): number[] { return this._pitches; }
    private _pitches: number[];

    /** The template which the scale is built from */
    get template(): ScaleTemplate { return this._template; }
    private _template: ScaleTemplate;

    /** How many notes are in the scale */
    get length(): number { return this.pitches.length; }

    get root(): number { return this.pitches[0]; }

    private _pitchNames: PitchName[];

    constructor(template: ScaleTemplate, root: number) {
        const pitches = [((root % 12) + 12) % 12];
        for (const degree of template.shape)
            pitches.push((pitches[0] + degree) % 12);
        this._pitches = pitches;

        this._template = template;

        this._generatePitchNames();

        this.name = this.getPitchName(this.root) + ' ' + template.name;
    }

    /** Returns true if the passed in note belongs to the scale */
    contains(pitch: number): boolean {
        pitch = safeMod(pitch, 12);
        return this.pitches.find(p => p == pitch) != undefined;
    }

    /** Returns the index of the passed in note, or -1 if it's not contained */
    indexOf(pitch: number): number {
        pitch = safeMod(pitch, 12);
        for (let i = 0; i < this.pitches.length; i++) {
            if (this.pitches[i] == pitch)
                return i;
        }
        return -1;
    }

    getPitchName(pitch: number, showOctave: boolean = false): string {
        let output = this._pitchNames[safeMod(pitch, 12)].toString();
        if (showOctave)
            output += Math.floor(pitch / 12) - 1;
        return output;
    }

    degree(degree: number, octave: number = -1): PitchBuilder {
        return new PitchBuilder(
            this.pitches[safeMod(degree - 1, this.pitches.length)] +
            ((octave + 1) * 12)
        );
    }

    pitchesInRange(lowPitch: number, highPitch: number): Array<number> {
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

    /** Returns a pitch number which is guaranteed to fit with the notes of the scale */
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

    /**
     * Generates an array which specifies how each note (both in & out of the scale should be named
     */
    private _generatePitchNames(): void {
        const relativeMajorRoot = safeMod(this.root - this.template.relativityToMajor, 12);

        //1 = prefer sharps, -1 = prefer flats
        const scalePreference = ([0, 7, 2, 9, 4, 11, 6].find(x => x == relativeMajorRoot) != undefined) ? 1 : -1;

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
        let scalePitches = [0];
        scalePitches.push(...this.template.shape);
        scalePitches = scalePitches.map(x => safeMod(x + this.root, 12));

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

    getDominantScale(): Scale {
        return new Scale(this.template, this.root + 7);
    }

    getSubdominantScale(): Scale {
        return new Scale(this.template, this.root + 5);
    }

    getRelativeScale(template: ScaleTemplate): Scale {
        if (template == this.template)
            return this;
        return new Scale(template, this.root - this.template.relativityToMajor + template.relativityToMajor);
    }

    getParallelScale(template: ScaleTemplate): Scale {
        if (template == this.template)
            return this;
        return new Scale(template, this.root);
    }
}