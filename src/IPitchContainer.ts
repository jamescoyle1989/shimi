import Scale from "./Scale";


/**
 * FitDirection is referenced by the [FitPitchOptions](../classes/FitPitchOptions.html) class to define the preferred direction for pitches to be moved to fit some chord or scale.
 * 
 * @category Chords & Scales
 */
export enum FitDirection {
    /** We prefer moving up to the next fitting pitch. */
    'up' = 1,
    /** We prefer moving down to the next fitting pitch. */
    'down' = -1,
    /** We have no preference which direction we move to the next fitting pitch. */
    'random' = 0
}


/**
 * Fit Precision is referenced by the [FitPitchOptions](../classes/FitPitchOptions.html) class to define how closely we must fit a pitch to the scale or chord it's being fitted to.
 * 
 * Note, if fitting to just a scale without chord, then it doesn't matter which option you choose, since it will just fit to the closest pitch which the scale contains
 * 
 * @category Chords & Scales
 */
export enum FitPrecision {
    /**
     * When fitting to just a chord, then any pitch is potentially considered a fit, though pitches that the chord contains are given higher preference.
     * 
     * When fitting to both scale and chord, the pitch must be contained within either the chord or the scale. Again, preference is given to those in the chord.
     */
    'loose' = 1,
    /** 
     * When fitting to just a chord, the pitch (or an octave relative) must not be a semi-tone away from any of the chord's pitches.
     * 
     * When fitting to both scale and chord, the pitch must be contained within the chord or the scale, and if not in the chord, then not be a semi-tone away from any of the chord's pitches.
     * 
     * Preference will always be given to pitches that are in the chord.
     */
    'medium' = 2,
    /** This is the strictest option. When fitting to a chord, it's only considered a tight fit if the pitch (or an octave relative) is contained within the chord. */
    'tight' = 3
}


/**
 * FitPitchOptions is referenced by the [IPitchContainer.fitPitch](../interfaces/IPitchContainer.html#fitPitch) method to provide extra information about how a pitch should be fitted to some chord or scale.
 * 
 * @category Chords & Scales
 */
export class FitPitchOptions {
    /**
     * The maximum amount that the pitch being fitted can be moved to better fit.
     * 
     * For example, if maxMovement = 2, and the pitch being fitted is G5, then the fitted pitch can't be less that F5, or more than A5.
     * 
     * The default value of maxMovement is 2.
     */
    maxMovement: number = 2;

    /**
     * If true, then pitch fitting will always prefer setting the pitch to match the root of whatever we're fitting it to.
     * 
     * For example, if fitting D5 to a C major chord, with preferRoot set to true, fitPitch will prefer C5 over E5 regardless of the value of preferredDirection, because the root of the chord is C.
     * 
     * The default value of preferRoot is true.
     */
    preferRoot: boolean = true;

    /**
     * The preferredDirection defines that if 2 equally good matches are found, which direction the pitch fitting logic will choose. See the FitDirection enum for further information about the FitDirection options.
     * 
     * The default value of preferredDirection is FitDirection.down.
     */
    preferredDirection: FitDirection = FitDirection.down;

    /**
     * The precision property defines how close of a fit to the target that a pitch must be before it's considered a valid fit. See the FitPrecision enum for detailed information about the criteria of each of the FitPrecision options.
     * 
     * The default value of precision is FitPrecision.tight.
     */
    precision: FitPrecision = FitPrecision.tight;

    /**
     * The scale property is only relevant when fitting a pitch to a chord.
     * 
     * Without this property set, the pitch will only be fitted to the chord. With it, the pitch will be fitted to the chord AND scale. See the FitPrecision document for more information on how this can affect the fit calculations.
     * 
     * By default, scale is left null.
     */
    scale: Scale = null;

    /**
     * For normal usage, library users shouldn't need to call the FitPitchOptions constructor. The IPitchContainer.fitPitch method accepts a partial FitPitchOptions declaration. Enabling library users to simply call something like: eMinorChord.fitPitch(66, { scale: cMajor, maxMovement: 1 })
     * 
     * @param init The init parameter is a partial definition of a FitPitchOptions object.
     */
    constructor(init: Partial<FitPitchOptions>) {
        if (init)
            Object.assign(this, init);
    }
}


/**
 * IPitchContainer provides a simple interface for objects which are defined by a collection of pitches, i.e. Chords and Scales.
 * 
 * @category Chords & Scales
 */
export interface IPitchContainer {
    /**
     * The contains method should return true only if the passed in pitch is contained within the implementing object. It is up to whoever's doing the implementation to determine whether pitches 1 or more octaves apart from a pitch within the container should be considered contained.
     * 
     * For example: `dMajorScale.contains(shimi.pitch('F6'))` returns false.
     * 
     * @param pitch The MIDI numerical representation of the pitch we want to check if contained.
     */
    contains(pitch: number): boolean;

    /**
     * The fitPitch method should take in a pitch, and return a new (or possibly the same pitch) that better fits the pitches within the container that the method was called on.
     * 
     * For example: `CmajorChord.fitPitch(39, { maxMovement: 1, preferredDirection: shimi.FitDirection.random})` returns 40 (E).
     * 
     * @param pitch The MIDI numerical representation of the pitch to be fitted to the pitches within the container.
     * @param options The options that determine how the pitch is fitted.
     */
    fitPitch(pitch: number, options?: Partial<FitPitchOptions>): number
}