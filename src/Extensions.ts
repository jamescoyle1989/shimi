import { safeMod, parsePitch } from './utils';



declare global {
    interface Number {
        near(target: number | string): number;
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