'use strict';

import { sum } from './IterationUtils';


export class TimeSigDivision {
    count: number = 1;

    swing: number = null;

    constructor(count: number, swing: number = null) {
        this.count = count;
        this.swing = swing;
    }
}


export default class TimeSig {
    divisions: TimeSigDivision[] = [];

    denominator: number = 4;

    swing: number = 0;

    constructor(
        divisions: Array<number | {count: number, swing: number}>,
        denominator: number,
        swing: number = 0
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

    get beatsPerBar() { return this.divisions.length; }

    get quarterNotesPerBar() {
        const countSum = sum(this.divisions, x => x.count);
        const multiplier = 4 / this.denominator;
        return countSum * multiplier;
    }

    applySwing(position: number, swing: number = null): number {
        let swingAmount = swing ?? this.swing;
        if (swingAmount == 0)
            return position;
        
        let output = Math.floor(position);
        position = position % 1;

        //Get a swing value that goes from 0.01 to 0.99
        //This corresponds to the percent through the division where the midpoint is
        swingAmount = 0.5 + (Math.max(-0.98, Math.min(0.98, swingAmount)) / 2);
        const swingMid = swingAmount;
        if (position <= swingMid)
            output += (position / swingMid) * 0.5;
        else
            output += 0.5 + (((position - swingMid) / (1 - swingMid)) * 0.5);
        return output;
    }

    /** Takes in a quarter note position within a bar and returns the corresponding bar beat position */
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
                    swingAmount = 0.5 + (Math.max(-0.98, Math.min(0.98, swingAmount)) / 2);
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
                if (swingAmount == 0)
                    quarterNote += beat * division.count;
                else {
                    //Get a swing value that goes from 0.01 to 0.99
                    //This corresponds to the percent through the division where the midpoint is
                    swingAmount = 0.5 + (Math.max(-0.98, Math.min(0.98, swingAmount)) / 2);
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
    

    static commonTime(swing: number = 0) {
        return new TimeSig([1,1,1,1], 4, swing);
    }
}