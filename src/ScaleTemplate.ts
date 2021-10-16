'use strict';

import Scale from './Scale';


export default class ScaleTemplate {
    /** The name of the scale type, e.g. 'Major', 'Harmonic Minor', 'Phrygian', etc. */
    get name(): string { return this._name; }
    /** The name of the scale type, e.g. 'Major', 'Harmonic Minor', 'Phrygian', etc. */
    set name(value: string) { this._name = value; }
    private _name: string;

    /** The shape of the scale, for major this would be [2, 4, 5, 7, 9, 11] */
    get shape(): number[] { return this._shape; }
    private _shape: number[] = [];

    /** As an example, the natural minor scale would have this set to -3, because in any natural minor scale, its root is 3 semi-tones below the root of its relative major */
    get relativityToMajor(): number { return this._relativityToMajor; }
    /** As an example, the natural minor scale would have this set to -3, because in any natural minor scale, its root is 3 semi-tones below the root of its relative major */
    set relativityToMajor(value: number) { this._relativityToMajor = value; }
    private _relativityToMajor: number = 0;

    /**
     * Represents a scale in abstract, before it has been associated with any specific root
     * @param name The name of the scale type, e.g. 'Major', 'Harmonic Minor', 'Phrygian', etc.
     * @param shape The shape of the scale, for major this would be [2, 4, 5, 7, 9, 11]
     * @param relativityToMajor As an example, the natural minor scale would have this set to -3, because in any natural minor scale, its root is 3 semi-tones below the root of its relative major
     */
    constructor(name: string, shape: number[], relativityToMajor: number) {
        if (shape.length == 0)
            throw new Error('Invalid scale template, shape cannot be empty');
        if (shape.find(x => x <= 0 || x >= 12) != undefined)
            throw new Error('Invalid scale template shape, must contain unique numbers only between 1 - 11');
        shape = shape.sort((a, b) => a - b);
        for (let i = 0; i + 1 < shape.length; i++) {
            if (shape[i] == shape[i + 1])
                throw new Error('Invalid scale template, no duplicate numbers allowed in the shape');
        }

        this.name = name;
        this._shape = shape;
        this.relativityToMajor = relativityToMajor;
    }

    create(root: number): Scale {
        return new Scale(this, root);
    }

    static get major(): ScaleTemplate { return ScaleTemplate._major; }
    static get ionian(): ScaleTemplate { return ScaleTemplate._major; }
    private static _major: ScaleTemplate = new ScaleTemplate('Major', [2, 4, 5, 7, 9, 11], 0);

    static get dorian(): ScaleTemplate { return ScaleTemplate._dorian; }
    private static _dorian: ScaleTemplate = new ScaleTemplate('Dorian', [2, 3, 5, 7, 9, 10], 2);

    static get phrygian(): ScaleTemplate { return ScaleTemplate._phrygian; }
    private static _phrygian: ScaleTemplate = new ScaleTemplate('Phrygian', [1, 3, 5, 7, 8, 10], 4);

    static get lydian(): ScaleTemplate { return ScaleTemplate._lydian; }
    private static _lydian: ScaleTemplate = new ScaleTemplate('Lydian', [2, 4, 6, 7, 9, 11], 5);

    static get mixolydian(): ScaleTemplate { return ScaleTemplate._mixolydian; }
    private static _mixolydian: ScaleTemplate = new ScaleTemplate('Mixolydian', [2, 4, 5, 7, 9, 10], -5);

    static get naturalMinor(): ScaleTemplate { return ScaleTemplate._naturalMinor; }
    static get aeolian(): ScaleTemplate { return ScaleTemplate._naturalMinor; }
    private static _naturalMinor: ScaleTemplate = new ScaleTemplate('Natural Minor', [2, 3, 5, 7, 8, 10], -3);

    static get harmonicMinor(): ScaleTemplate { return ScaleTemplate._harmonicMinor; }
    private static _harmonicMinor: ScaleTemplate = new ScaleTemplate('Harmonic Minor', [2, 3, 5, 7, 8, 11], -3);

    static get melodicMinor(): ScaleTemplate { return ScaleTemplate._melodicMinor; }
    private static _melodicMinor: ScaleTemplate = new ScaleTemplate('Melodic Minor', [2, 3, 5, 7, 9, 11], -3);

    static get locrian(): ScaleTemplate { return ScaleTemplate._locrian; }
    private static _locrian: ScaleTemplate = new ScaleTemplate('Locrian', [1, 3, 5, 6, 8, 10], -1);

    static get majorPentatonic(): ScaleTemplate { return ScaleTemplate._majorPentatonic; }
    private static _majorPentatonic: ScaleTemplate = new ScaleTemplate('Major Pentatonic', [2, 5, 7, 9], 0);

    static get minorPentatonic(): ScaleTemplate { return ScaleTemplate._minorPentatonic; }
    private static _minorPentatonic: ScaleTemplate = new ScaleTemplate('Minor Pentatonic', [3, 5, 8, 10], -3);

    static get wholeTone(): ScaleTemplate { return ScaleTemplate._wholeTone; }
    private static _wholeTone: ScaleTemplate = new ScaleTemplate('Whole Tone', [2, 4, 6, 8, 10], 0);

    static get diminished(): ScaleTemplate { return ScaleTemplate._diminished; }
    private static _diminished: ScaleTemplate = new ScaleTemplate('Diminished', [2, 3, 5, 6, 8, 9, 11], -3);
}