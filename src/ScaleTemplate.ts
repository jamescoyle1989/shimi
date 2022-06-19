'use strict';

import Scale from './Scale';


/**
 * The ScaleTemplate class represents a scale in abstract, before it has been associated with any specific root. It instead defines some of the qualities of any scale to be created from it.
 * 
 * The expected usage of this is to use one of the pre-defined scale templates already provided to generate scale objects, for example: `shimi.ScaleTemplate.major.create(shimi.pitch('D'))`
 * 
 * However, you can also use this class to define your own custom scale types, for example: 
 * ```
 * const myScaleType = new shimi.ScaleTemplate('James Minor', [2,3,5,7,8,9], -3);
 * const eJamesMinor = myScaleType.create(shimi.pitch('E'));
 * ```
 * 
 * @category Chords & Scales
 */
export default class ScaleTemplate {
    /** The name of the scale type, e.g. 'Major', 'Harmonic Minor', 'Phrygian', 'My Special Scale', etc. */
    get name(): string { return this._name; }
    set name(value: string) { this._name = value; }
    private _name: string;

    /**
     * The shape property defines which notes make up a scale of this type.
     * 
     * For example, the major scale would have shape [2,4,5,7,9,11], because when you create a major scale, it will have a note 2 semi-tones above the root, a note 4 semi-tones above the root, etc.
     * 
     * 0 is not included in the shape, because it is expected that a scale will contain its own root.
     */
    get shape(): number[] { return this._shape; }
    private _shape: number[] = [];

    /**
     * The relativityToMajor property is used by some of the functions for fetching related scales. For example, the natural minor scale would have relativityToMajor = -3 (or 9), because the root of the natural minor scale is expected to be 3 semi-tones below (or 9 above) the root of its relative major scale. Meanwhile Dorian would have relativityToMajor = 2.
     */
    get relativityToMajor(): number { return this._relativityToMajor; }
    set relativityToMajor(value: number) { this._relativityToMajor = value; }
    private _relativityToMajor: number = 0;

    /**
     * @param name The name of the scale type, e.g. 'Major', 'Harmonic Minor', 'Phrygian', 'My Special Scale', etc.
     * @param shape The shape property defines which notes make up a scale of this type.
     * 
     * For example, the major scale would have shape [2,4,5,7,9,11], because when you create a major scale, it will have a note 2 semi-tones above the root, a note 4 semi-tones above the root, etc.
     * 
     * 0 is not included in the shape, because it is expected that a scale will contain its own root.
     * @param relativityToMajor The relativityToMajor property is used by some of the functions for fetching related scales. For example, the natural minor scale would have relativityToMajor = -3 (or 9), because the root of the natural minor scale is expected to be 3 semi-tones below (or 9 above) the root of its relative major scale. Meanwhile Dorian would have relativityToMajor = 2.
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

    /**
     * Returns a new Scale object for a specific root, with properties inherited from the Template that created it.
     * @param root The root of the new Scale object.
     * @returns 
     */
    create(root: number): Scale {
        return new Scale(this, root);
    }

    /** The pre-defined major scale template. */
    static get major(): ScaleTemplate { return ScaleTemplate._major; }
    /** Same as ScaleTemplate.major, but more old school. */
    static get ionian(): ScaleTemplate { return ScaleTemplate._major; }
    private static _major: ScaleTemplate = new ScaleTemplate('Major', [2, 4, 5, 7, 9, 11], 0);

    /** The pre-defined dorian scale template. */
    static get dorian(): ScaleTemplate { return ScaleTemplate._dorian; }
    private static _dorian: ScaleTemplate = new ScaleTemplate('Dorian', [2, 3, 5, 7, 9, 10], 2);

    /** The pre-defined phrygian scale template. */
    static get phrygian(): ScaleTemplate { return ScaleTemplate._phrygian; }
    private static _phrygian: ScaleTemplate = new ScaleTemplate('Phrygian', [1, 3, 5, 7, 8, 10], 4);

    /** The pre-defined lydian scale template. */
    static get lydian(): ScaleTemplate { return ScaleTemplate._lydian; }
    private static _lydian: ScaleTemplate = new ScaleTemplate('Lydian', [2, 4, 6, 7, 9, 11], 5);

    /** The pre-defined mixolydian scale template. */
    static get mixolydian(): ScaleTemplate { return ScaleTemplate._mixolydian; }
    private static _mixolydian: ScaleTemplate = new ScaleTemplate('Mixolydian', [2, 4, 5, 7, 9, 10], -5);

    /** The pre-defined natural minor scale template. */
    static get naturalMinor(): ScaleTemplate { return ScaleTemplate._naturalMinor; }
    /** Same as ScaleTemplate.naturalMinor, but more old school. */
    static get aeolian(): ScaleTemplate { return ScaleTemplate._naturalMinor; }
    private static _naturalMinor: ScaleTemplate = new ScaleTemplate('Natural Minor', [2, 3, 5, 7, 8, 10], -3);

    /** The pre-defined harmonic minor scale template. */
    static get harmonicMinor(): ScaleTemplate { return ScaleTemplate._harmonicMinor; }
    private static _harmonicMinor: ScaleTemplate = new ScaleTemplate('Harmonic Minor', [2, 3, 5, 7, 8, 11], -3);

    /** The pre-defined melodic minor scale template. Note, this is the jazz version of the scale, since shimi has no concept of scales being different when ascending vs descending. */
    static get melodicMinor(): ScaleTemplate { return ScaleTemplate._melodicMinor; }
    private static _melodicMinor: ScaleTemplate = new ScaleTemplate('Melodic Minor', [2, 3, 5, 7, 9, 11], -3);

    /** The pre-defined locrian scale template. */
    static get locrian(): ScaleTemplate { return ScaleTemplate._locrian; }
    private static _locrian: ScaleTemplate = new ScaleTemplate('Locrian', [1, 3, 5, 6, 8, 10], -1);

    /** The pre-defined major pentatonic scale template. */
    static get majorPentatonic(): ScaleTemplate { return ScaleTemplate._majorPentatonic; }
    private static _majorPentatonic: ScaleTemplate = new ScaleTemplate('Major Pentatonic', [2, 4, 7, 9], 0);

    /** The pre-defined minor pentatonic scale template. */
    static get minorPentatonic(): ScaleTemplate { return ScaleTemplate._minorPentatonic; }
    private static _minorPentatonic: ScaleTemplate = new ScaleTemplate('Minor Pentatonic', [3, 5, 8, 10], -3);

    /** The pre-defined whole tone scale template. */
    static get wholeTone(): ScaleTemplate { return ScaleTemplate._wholeTone; }
    private static _wholeTone: ScaleTemplate = new ScaleTemplate('Whole Tone', [2, 4, 6, 8, 10], 0);

    /** The pre-defined diminished scale template. */
    static get diminished(): ScaleTemplate { return ScaleTemplate._diminished; }
    private static _diminished: ScaleTemplate = new ScaleTemplate('Diminished', [2, 3, 5, 6, 8, 9, 11], -3);
}