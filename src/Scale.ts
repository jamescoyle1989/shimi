'use strict';

import ScaleTemplate from './ScaleTemplate';


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
        const accSymbol = (this.accidental > 0) ? '#' : 'b';
        return this.letter + accSymbol.repeat(Math.abs(this.accidental));
    }
}


export default class Scale {
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

        this._pitchNames = Scale._getPitchNamesForMajorRoot(this.root - template.relativityToMajor);

        this.name = this.getPitchName(this.root) + ' ' + template.name;
    }

    /** Returns true if the passed in note belongs to the scale */
    contains(pitch: number): boolean {
        pitch = ((pitch % 12) + 12) % 12;
        return this.pitches.find(p => p == pitch) != undefined;
    }

    /** Returns the index of the passed in note, or -1 if it's not contained */
    indexOf(pitch: number): number {
        pitch = ((pitch % 12) + 12) % 12;
        for (let i = 0; i < this.pitches.length; i++) {
            if (this.pitches[i] == pitch)
                return i;
        }
        return -1;
    }

    getPitchName(pitch: number): string {
        return this._pitchNames[((pitch % 12) + 12) % 12].toString();
    }

    /**
     * Returns an array which specifies how each note (both in & out of the specified
     * major key) should be named
     */
    private static _getPitchNamesForMajorRoot(root: number): PitchName[] {
        const n = (pitch: number, letter: string, accidental?: number) => new PitchName(pitch, letter, accidental);
        root = ((root % 12) + 12) % 12;
        switch (root) {
            case 0: return [n(0,'C'), n(1,'C',1), n(2,'D'), n(3,'E',-1), n(4,'E'), n(5,'F'), n(6,'F',1), n(7,'G'), n(8,'G',1), n(9,'A'), n(10,'B',-1), n(11,'B')];
            case 1: return [n(0,'C'), n(1,'D',-1), n(2,'D',0), n(3,'E',-1), n(4,'F',-1), n(5,'F'), n(6,'G',-1), n(7,'G',0), n(8,'A',-1), n(9,'A',0), n(10,'B',-1), n(11,'C',-1)];
            case 2: return [n(0,'C',0), n(1,'C',1), n(2,'D'), n(3,'D',1), n(4,'E'), n(5,'F',0), n(6,'F',1), n(7,'G'), n(8,'G',1), n(9,'A'), n(10,'A',1), n(11,'B')];
            case 3: return [n(0,'C'), n(1,'D',-1), n(2,'D'), n(3,'E',-1), n(4,'E',0), n(5,'F'), n(6,'G',-1), n(7,'G'), n(8,'A',-1), n(9,'A',0), n(10,'B',-1), n(11,'B',0)];
            case 4: return [n(0,'C',0), n(1,'C',1), n(2,'D',0), n(3,'D',1), n(4,'E'), n(5,'E',1), n(6,'F',1), n(7,'G',0), n(8,'G',1), n(9,'A'), n(10,'A',1), n(11,'B')];
            case 5: return [n(0,'C'), n(1,'D',-1), n(2,'D'), n(3,'E',-1), n(4,'E'), n(5,'F'), n(6,'F',1), n(7,'G'), n(8,'A',-1), n(9,'A'), n(10,'B',-1), n(11,'B',0)];
            case 6: return [n(0,'B',1), n(1,'C',1), n(2,'D',0), n(3,'D',1), n(4,'E',0), n(5,'E',1), n(6,'F',1), n(7,'G',0), n(8,'G',1), n(9,'A',0), n(10,'A',1), n(11,'B')];
            case 7: return [n(0,'C'), n(1,'C',1), n(2,'D'), n(3,'D',1), n(4,'E'), n(5,'F',0), n(6,'F',1), n(7,'G'), n(8,'G',1), n(9,'A'), n(10,'B',-1), n(11,'B')];
            case 8: return [n(0,'C'), n(1,'D',-1), n(2,'D',0), n(3,'E',-1), n(4,'E',0), n(5,'F'), n(6,'G',-1), n(7,'G'), n(8,'A',-1), n(9,'A',0), n(10,'B',-1), n(11,'C',-1)];
            case 9: return [n(0,'C',0), n(1,'C',1), n(2,'D'), n(3,'D',1), n(4,'E'), n(5,'F',0), n(6,'F',1), n(7,'G',0), n(8,'G',1), n(9,'A'), n(10,'A',1), n(11,'B')];
            case 10: return [n(0,'C'), n(1,'D',-1), n(2,'D'), n(3,'E',-1), n(4,'E',0), n(5,'F'), n(6,'G',-1), n(7,'G'), n(8,'A',-1), n(9,'A'), n(10,'B',-1), n(11,'B',0)];
            case 11: return [n(0,'B',1), n(1,'C',1), n(2,'D',0), n(3,'D',1), n(4,'E'), n(5,'E',1), n(6,'F',1), n(7,'G',0), n(8,'G',1), n(9,'A',0), n(10,'A',1), n(11,'B')];
        }
    }
}