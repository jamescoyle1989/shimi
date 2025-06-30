import { safeMod, parsePitch } from './utils';



declare global {
    interface Number {
        near(target: number | string): number;

        get octave(): number;

        toOctave(targetOctave: number): number;
    }
}



/**
 * This function is provided as an extension of the number prototype, so that once you've got a pitch, you can easily find another pitch of the same pitch class, but within a different octave.
 * 
 * For example: `shimi.pitch('C4').near(shimi.pitch('B5'))` will return the same value as if you'd just used `shimi.pitch('C6')`.
 * 
 * In the case where the target pitch is exactly halfway between 2 possible pitches, this function will return the one that is closest to the current pitch value. For example: `shimi.pitch('C2').near(shimi.pitch('F#5'))` returns the pitch value for C5 rather than C6.
 * 
 * @param target The target pitch which the returned value should be near to
 * @returns 
 */
export function near(target: number | string): number {
    if (typeof(target) === 'string')
        target = parsePitch(target);
        
    let pitchDiff = target - this;
    if (safeMod(pitchDiff, 12) == 6) {
        if (pitchDiff > 0)
            pitchDiff--;
        else
            pitchDiff++;
    }
    const octaveDiff = Math.round(pitchDiff / 12);
    return this + (octaveDiff * 12);
}
Number.prototype.near = near;


/**
 * This getter is provided as an extension of the number prototype, so that once you've got a pitch, you can easily identify which octave it's within.
 * @returns 
 */
export function octave(): number {
    return Math.floor(this / 12) - 1;
};
const num = 0;
if (num.octave == undefined)
    Object.defineProperty(Number.prototype, "octave", { get: octave });


/**
 * This function is provided as an extension of the number prototype, so that once you've got a pitch, you can easily translate it over to a particular octave.
 * @param targetOctave The target octave which the new pitch should be within.
 * @returns 
 */
export function toOctave(targetOctave: number): number {
    return ((targetOctave + 1) * 12) + safeMod(this, 12);
}
Number.prototype.toOctave = toOctave;