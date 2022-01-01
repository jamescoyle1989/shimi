'use strict';

import { safeMod, sortComparison } from './utils';
import Scale from './Scale';
import { distinct, mode } from './IterationUtils';


export class ChordLookupData {
    //The name to use when refering to the shape rather than a note-specific instance of the chord
    shapeName: string = '';
    //The name of the chord in expression form, where {r} is a placeholder for root and {b} for bass
    name: string = '';
    //The name of the chord in expression form when inversed, where {r} is a placeholder for root and {b} for bass
    inverseName: string = '';
    //A 12-bit binary number, representing which pitch classes are present in the chord. For example, 100010010000 = C major
    pitchMap: number = 0;
    //The higher the preference, the more likely this chord is to be chosen over other equally well fitting chords
    preference: number = 0;
    //The intervals that make up the chord
    intervals: number[] = [];
    //The chord root
    root: number = 0;

    constructor(shapeName: string, intervals: number[], name: string, inverseName: string, preference: number, root: number) {
        this.shapeName = shapeName;
        this.name = name;
        this.inverseName = inverseName;
        let pitchMap = 0;
        for (let interval of intervals)
            pitchMap += Math.pow(2, (root + interval) % 12);
        this.pitchMap = pitchMap;
        this.preference = preference;
        this.intervals = intervals;
        this.root = root;
    }
}


export class ChordLookupResult {
    //The name to use when refering to the shape rather than a note-specific instance of the chord
    shapeName: string = '';
    //The name of the chord in expression form, where {r} is a placeholder for root and {b} for bass
    name: string = '';
    //The chord root
    root: number = 0;
    //The chord bass
    bass: number = 0;
    //The pitches in the selected chord
    pitches: number[] = [];
    //Which of the pitches in the chord were missing from the lookup request
    pitchesAdded: number[] = [];
    //Which of the pitches in the lookup request were removed from the suggested chord
    pitchesRemoved: number[] = [];
}


export default class ChordSuggester {
    lookupData: ChordLookupData[] = [];

    private _addChordLookup(shapeName: string, intervals: number[], name: string, inverseName: string, preference: number): void {
        for (let i = 0; i < 12; i++)
            this.lookupData.push(new ChordLookupData(shapeName, intervals, name, inverseName, preference, i));
    }

    constructor() {
        this._addChordLookup('M', [0, 4, 7], '{r}', '{r}/{b}', 10);
        this._addChordLookup('m', [0, 3, 7], '{r}m', '{r}m/{b}', 9);
        this._addChordLookup('M7', [0, 4, 7, 11], '{r}M7', '{r}M7/{b}', 8);
        this._addChordLookup('7', [0, 4, 7, 10], '{r}7', '{r}7/{b}', 8);
        this._addChordLookup('m7', [0, 3, 7, 10], '{r}m7', '{r}m7/{b}', 8);
        this._addChordLookup('dim', [0, 3, 6], '{r}dim', '{r}dim/{b}', 7);
        this._addChordLookup('aug', [0, 4, 8], '{r}aug', '{r}aug/{b}', 7);
        this._addChordLookup('5', [0, 7], '{r}5', '{r}5', 6);
        this._addChordLookup('sus2', [0, 2, 7], '{r}sus2', '{r}sus2/{b}', 6);
        this._addChordLookup('sus4', [0, 5, 7], '{r}sus4', '{r}sus4/{b}', 6);
        this._addChordLookup('dim7', [0, 3, 6, 9], '{r}dim7', '{r}dim7/{b}', 5);
        this._addChordLookup('m7b5', [0, 3, 6, 10], '{r}m7b5', '{r}m7b5/{b}', 5);
        this._addChordLookup('M9', [0, 4, 7, 11, 14], '{r}M9', '{r}M9/{b}', 4);
        this._addChordLookup('9', [0, 4, 7, 10, 14], '{r}9', '{r}9/{b}', 4);
        this._addChordLookup('m9', [0, 3, 7, 10, 14], '{r}m9', '{r}m9/{b}', 4);
        this._addChordLookup('add9', [0, 4, 7, 14], '{r}add9', '{r}add9/{b}', 4);
        this._addChordLookup('madd9', [0, 3, 7, 14], '{r}madd9', '{r}madd9/{b}', 4);
        this._addChordLookup('M11', [0, 4, 7, 11, 14, 17], '{r}M11', '{r}M11/{b}', 3);
        this._addChordLookup('11', [0, 4, 7, 10, 14, 17], '{r}11', '{r}11/{b}', 3);
        this._addChordLookup('m11', [0, 3, 7, 10, 14, 17], '{r}m11', '{r}m11/{b}', 3);
        this._addChordLookup('add11', [0, 4, 7, 17], '{r}add11', '{r}add11/{b}', 3);
        this._addChordLookup('madd11', [0, 3, 7, 17], '{r}madd11', '{r}madd11/{b}', 3);
        this._addChordLookup('mM7', [0, 3, 7, 11], '{r}mM7', '{r}mM7/{b}', 2);
        this._addChordLookup('7#5', [0, 4, 8, 10], '{r}7#5', '{r}7#5/{b}', 2);
        this._addChordLookup('7#9', [0, 4, 7, 10, 15], '{r}7#9', '{r}7#9/{b}', 2);
    }

    /**
     * Gets passed in a bunch of pitches, and tries to find the best suggestion it can of what chord it is
     * @param pitches The currently known chord pitches
     * @param root Optional, the currently known chord root
     * @param shapeFilter Optional, the names of the chord shapes that it's allowed to return
     * @param scale Optional, the scale which any notes that need to be added for its suggestion must belong to
     * @returns 
     */
    lookupChord(pitches: number[], root: number = null, shapeFilter: string[] = null, scale: Scale = null): ChordLookupResult {
        if (pitches.length == 0)
            return null;
        if (root != null && pitches.find(x => x == root) == undefined)
            throw new Error('The root is not contained in the passed in pitches');
        if (pitches.length == 1 && root == null)
            root = pitches[0];

        const chords = this._getAllPotentialChords(pitches, root, shapeFilter, scale);

        const pitchMap = this._getPitchMap(pitches);

        let suggestion: {distance: number, chord: ChordLookupData} = null;
        for (const chord of chords) {
            const distance = this._getPitchMapDistance(chord.pitchMap, pitchMap);
            if (suggestion == null || distance < suggestion.distance || (distance == suggestion.distance && chord.preference > suggestion.chord.preference))
                suggestion = {distance: distance, chord: chord};
        }

        if (suggestion == null)
            return null;

        const lookupResult = new ChordLookupResult();
        lookupResult.shapeName = suggestion.chord.shapeName;

        //Build array of objects that matches pitches passed into the request, to which interval they fill in the chord
        const intervalMap: {interval: number, pitch: number}[] = [];
        for (const pitch of pitches) {
            if ((suggestion.chord.pitchMap | Math.pow(2, safeMod(pitch, 12))) == suggestion.chord.pitchMap) {
                lookupResult.pitches.push(pitch);
                for (let interval of suggestion.chord.intervals) {
                    if (safeMod(suggestion.chord.root + interval, 12) == safeMod(pitch, 12)) {
                        intervalMap.push({interval: interval, pitch: pitch});
                        break;
                    }
                }
            }
            else
                lookupResult.pitchesRemoved.push(pitch);
        }

        //Find any notes which appear on the chord, but weren't passed in, find the best pitch for them and mark them as added
        for (const interval of suggestion.chord.intervals) {
            if (!lookupResult.pitches.find(x => safeMod(x, 12) == safeMod(suggestion.chord.root + interval, 12))) {
                //Take vote on best pitch to add for interval
                const votes: number[] = [];
                for (const im of intervalMap) {
                    const intervalDiff = interval - im.interval;
                    votes.push(im.pitch + intervalDiff);
                }
                const pitch = mode(votes, x => x);
                lookupResult.pitches.push(pitch);
                lookupResult.pitchesAdded.push(pitch);
            }
        }

        lookupResult.pitches.sort((a, b) => sortComparison(a, b, x => x));
        lookupResult.bass = lookupResult.pitches[0];
        lookupResult.root = lookupResult.pitches.find(x => safeMod(x, 12) == safeMod(suggestion.chord.root, 12));
        lookupResult.name = (lookupResult.bass == lookupResult.root) ? suggestion.chord.name : suggestion.chord.inverseName;
        return lookupResult;
    }

    //Used by the lookupChord method, just focused on fetching a list of POSSIBLE matches based on initial filtering
    private _getAllPotentialChords(pitches: number[], root: number = null, shapeFilter: string[] = null, scale: Scale = null): ChordLookupData[] {
        const pitchMap = this._getPitchMap(pitches);
        let chords = this.lookupData;

        if (root != null) {
            root = safeMod(root, 12);
            chords = chords.filter(x => x.root == root);
        }

        if (shapeFilter != null)
            chords = chords.filter(x => shapeFilter.find(y => y == x.shapeName));

        if (scale != null) {
            chords = chords.filter(x => {
                //Keep chords only if the pitches they'd need to add to the input pitches are contained within the passed in scale
                //Don't worry about whether the pitches passed in are in the scale or not
                const scalePitchMap = this._getPitchMap(scale.pitches);
                const chordPitchesNotInInput = (x.pitchMap | pitchMap) - pitchMap;
                const chordPitchesAlsoNotInScale = (chordPitchesNotInInput | scalePitchMap) - scalePitchMap;
                return chordPitchesAlsoNotInScale == 0;
            });
        }

        return chords;
    }

    //Returns a 12-bit number to represent which pitch classes are present in the passed in array of pitches
    //2^0 = pitches contains C, 2^1 = pitches contains C#, 2^2 = pitches contains D, etc.
    private _getPitchMap(pitches: number[]): number {
        const distinctPitches = distinct(pitches.map(x => safeMod(x, 12)));
        let output = 0;
        for (let pitch of distinctPitches)
            output += Math.pow(2, pitch);
        return output;
    }

    //Takes in 2 pitch maps (see method above), and returns a number from 0 to 12 of how many pitch classes are in one map, but not the other
    private _getPitchMapDistance(pitchMap1: number, pitchMap2: number): number {
        //https://stackoverflow.com/questions/677204/counting-the-number-of-flags-set-on-an-enumeration
        let nonOverlap = pitchMap1 ^ pitchMap2;
        let count = 0;
        while(nonOverlap != 0) {
            nonOverlap = nonOverlap & (nonOverlap - 1);
            count++;
        }
        return count;
    }
}