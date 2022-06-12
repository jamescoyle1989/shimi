import Scale from "./Scale";


/**
 * @category Chords & Scales
 */
export enum FitDirection {
    'up' = 1,
    'down' = -1,
    'random' = 0
}


/**
 * @category Chords & Scales
 */
export enum FitPrecision {
    'loose' = 1,
    'medium' = 2,
    'tight' = 3
}


/**
 * @category Chords & Scales
 */
export class FitPitchOptions {
    maxMovement: number = 2;

    preferRoot: boolean = true;

    preferredDirection: FitDirection = FitDirection.down;

    precision: FitPrecision = FitPrecision.tight;

    scale: Scale = null;

    constructor(init: Partial<FitPitchOptions>) {
        if (init)
            Object.assign(this, init);
    }
}


/**
 * @category Chords & Scales
 */
export interface IPitchContainer {
    /** Returns true if the passed in note belongs to the scale */
    contains(pitch: number): boolean;

    /** Returns a pitch number which is guaranteed to fit with the notes of the container */
    fitPitch(pitch: number, options?: Partial<FitPitchOptions>): number
}