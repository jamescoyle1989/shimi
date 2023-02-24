'use strict';

import { sum } from './IterationUtils';


/**
 * The TimeSigDivision class represents the definition of one beat within a TimeSig.
 * 
 * @category Timing
 */
export class TimeSigDivision {
    /** The count is how many of note length (as defined by the TimeSig denominator) that this specific beat contains. */
    count: number = 1;

    /** By default this value is null. If set, then this beat has its own specific swing value. */
    swing: number = null;

    /**
     * @param count The count is how many of note length (as defined by the TimeSig denominator) that this specific beat contains.
     * @param swing By default this value is null. If set, then this beat has its own specific swing value.
     */
    constructor(count: number, swing: number = null) {
        this.count = count;
        this.swing = swing;
    }
}


/**
 * The TimeSig class defines how beats are counted together into bars of music. The TimeSig also defines how much swing should be applied when counting beats.
 * 
 * @category Timing
 */
export default class TimeSig {
    /**
     * The divisions property contains an array of TimeSigDivision objects that define how to group note lengths (as defined by the denominator) together into beats. The sum of division counts equals the value of the top number in the time signature.
     * 
     * The easiest way to explain is with a few examples:
     * 
     * The standard definition of the 4/4 time signature is `denominator = 4`, and `divisions = [1, 1, 1, 1]`. Denominator = 4 means that we're counting in quarter notes, and the array of 4 1's means that we count that we have 4 beats per bar, one per quarter note.
     * 
     * We could also define 4/4 as `denominator = 4`, and `divisions = [1.5, 1.5, 1]`. This means that there's 3 beats per bar, but the first 2 are equal to a dotted quarter note in length, while the last is a quarter note.
     * 
     * If working in 7/8, then `denominator = 8`, and we might have `divisions = [2, 2, 3]`. The 8 for denominator means we're counting in eighth notes. The divisions array means that we have 3 beats per bar, the first 2 are each 2 eighth notes long, and the 3rd is 3 eighth notes long.
     */
    divisions: TimeSigDivision[] = [];

    /**
     * The denominator represents the bottom number in a time signature. 
     * 
     * As far as I can tell, 'denominator' isn't the proper name for this, but there also doesn't seem to be a well agreed upon actual proper name for it, so denominator is what we're going with.
     */
    denominator: number = 4;

    /**
     * The swing property defines how long the first half of each beat lasts compared to the second half. The default value for this is 0.5, meaning that there's no swing, and both halfs of the beat are evenly divided. The valid values for this range from 0 to 1, where 1 means that the first half of the beat takes up the entire beat length, and 0 means that the second half of the beat takes up the entire beat length.
     * 
     * A swing value of 2/3 would give you your classic jazz swing, where the first half of the beat lasts twice as long as the second half. A 0.75 value would be a far stronger swing, with the first half of each beat lasting 3 times as long as the second half.
     * 
     * A swing value < 0.5 is far more rare, but works along the same principle as positive values, just in the other direction
     */
    swing: number = 0;

    /**
     * 
     * @param divisions The divisions parameter accepts an array of numbers that define how to group note lengths (as defined by the denominator) together into beats. The sum of divisions equals the value of the top number in the time signature. See the divisions property for more information.
     * 
     * Individual items within the divisions array can also be swapped out for `{count: number, swing: number}` objects in order to define swing values for specific beats within a bar. Not all metronomes support this behaviour though.
     * @param denominator The denominator represents the bottom number in a time signature.
     * @param swing The swing parameter defines how long the first half of each beat lasts compared to the second half. The default value for this is 0.5, meaning that there's no swing, and both halfs of the beat are evenly divided. The valid values for this range from 0 to 1, where 1 means that the first half of the beat takes up the entire beat length, and 0 means that the second half of the beat takes up the entire beat length. See the swing property for more information.
     */
    constructor(
        divisions: Array<number | {count: number, swing: number}>,
        denominator: number,
        swing: number = 0.5
    ) {
        if (denominator <= 0 || (Math.log2(denominator) % 1) != 0)
            throw new Error('Invalid denominator');
        this.denominator = denominator;

        if (divisions.length == 0)
            throw new Error('Expected at least one division');
        for (const division of divisions) {
            let newDivision: TimeSigDivision;
            if (typeof(division) === 'number')
                newDivision = new TimeSigDivision(division);
            else
                newDivision = new TimeSigDivision(division.count, division.swing);
            if (newDivision.count <= 0)
                throw new Error('Invalid division count');
            this.divisions.push(newDivision);
        }

        this.swing = swing;
    }

    /** Returns the value of `divisions.length` */
    get beatsPerBar() { return this.divisions.length; }

    /** Returns the number of quarter notes that one bar would contain under this time signature. */
    get quarterNotesPerBar() {
        const countSum = sum(this.divisions, x => x.count);
        const multiplier = 4 / this.denominator;
        return countSum * multiplier;
    }

    /**
     * The applySwing method accepts a number representing a position within a bar, and returns the swung value of it. For example, if `swing = 0.75`, then `applySwing(3.5) = 3.75`
     * @param position The position to apply swing to.
     * @param swing Optional parameter, if not provided, then the TimeSig's swing value will be used.
     * @returns 
     */
    applySwing(position: number, swing: number = null): number {
        let swingAmount = swing ?? this.swing;
        if (swingAmount == 0)
            return position;
        
        let output = Math.floor(position);
        position = position % 1;

        //Get a swing value that goes from 0.01 to 0.99
        //This corresponds to the percent through the division where the midpoint is
        swingAmount = Math.max(-0.99, Math.min(0.99, swingAmount));
        const swingMid = swingAmount;
        if (position <= swingMid)
            output += (position / swingMid) * 0.5;
        else
            output += 0.5 + (((position - swingMid) / (1 - swingMid)) * 0.5);
        return output;
    }

    /** Takes in a quarter note position within a bar and returns the corresponding bar beat position. */
    quarterNoteToBeat(quarterNote: number): number {
        const bpb = this.beatsPerBar;
        const qnpb = this.quarterNotesPerBar;
        //If the quarter note is more than a full bar's worth of quarter notes, this will account for that
        const beatsFromFullBars = Math.floor(quarterNote / qnpb) * bpb;
        quarterNote = quarterNote % qnpb;
        let beat = 0;
        for (const division of this.divisions) {
            if (quarterNote >= division.count) {
                quarterNote -= division.count;
                beat++;
            }
            else {
                let swingAmount = division.swing ?? this.swing;
                if (swingAmount == 0)
                    beat += quarterNote / division.count;
                else {
                    //Get a swing value that goes from 0.01 to 0.99
                    //This corresponds to the percent through the division where the midpoint is
                    swingAmount = Math.max(-0.99, Math.min(0.99, swingAmount));
                    const swingMidQN = swingAmount * division.count;
                    if (quarterNote <= swingMidQN)
                        beat += (quarterNote / swingMidQN) * 0.5;
                    else
                        beat += 0.5 + (((quarterNote - swingMidQN) / (division.count - swingMidQN)) * 0.5);
                }
                break;
            }
        }
        return beatsFromFullBars + beat;
    }

    /** Takes in a bar beat position and returns how many quarter notes into the bar that is */
    beatToQuarterNote(beat: number): number {
        const bpb = this.beatsPerBar;
        const qnpb = this.quarterNotesPerBar;
        //If the beat is more than a full bar's worth of beats, this will account for that
        const quarterNotesFromFullBars = Math.floor(beat / bpb) * qnpb;
        beat = beat % bpb;
        let quarterNote = 0;
        for (const division of this.divisions) {
            if (beat >= 1) {
                quarterNote += division.count;
                beat--;
            }
            else {
                let swingAmount = division.swing ?? this.swing;
                if (swingAmount == 0.5)
                    quarterNote += beat * division.count;
                else {
                    //Get a swing value that goes from 0.01 to 0.99
                    //This corresponds to the percent through the division where the midpoint is
                    swingAmount = Math.max(-0.99, Math.min(0.99, swingAmount));
                    const swingMidQN = swingAmount * division.count;
                    if (beat <= 0.5)
                        quarterNote += (beat * 2) * swingMidQN;
                    else
                        quarterNote += swingMidQN + (((beat - 0.5) * 2) * (division.count - swingMidQN));
                }
                break;
            }
        }
        return quarterNotesFromFullBars + quarterNote;
    }
    

    /**
     * A static method to easily define common time.
     * 
     * `TimeSig.commonTime();` is the same as `new TimeSig([1, 1, 1, 1], 4);`
     * @param swing Optional parameter, 0.5 if not used. Defines the swing to be used in the new TimeSig object.
     * @returns 
     */
    static commonTime(swing: number = 0.5) {
        return new TimeSig([1,1,1,1], 4, swing);
    }
}