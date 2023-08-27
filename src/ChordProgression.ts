'use strict';

import Chord from './Chord';
import Range from './Range';
import { safeMod } from './utils';


/**
 * ChordProgressionChord represents a chord to be played within a progression, specifying the start and end time of the chord.
 * 
 * @category Chords & Scales
 */
export class ChordProgressionChord extends Range {
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.ChordProgressionChord'; }

    /** The chord to be played at a specific point in the progression. */
    get chord(): Chord { return this._chord; }
    set chord(value: Chord) { this._chord = value; }
    private _chord: Chord;

    constructor(start: number, duration: number, chord: Chord) {
        super(start, duration);
        this._chord = chord;
    }
}


/**
 * The ChordProgression class reppresents a sequence of chords that play one after another.
 * 
 * @category Chords & Scales
 */
export default class ChordProgression extends Range {
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.ChordProgression'; }

    /**
     * The collection of chords that the progression contains.
     */
    chords: ChordProgressionChord[] = [];
    
    constructor(duration: number) {
        super(0, duration);
    }

    /**
     * Add a new chord to the progression. If the new chord overlaps or entirely contains existing chords within the progression, then those chords will be shrunk down, or fully removed to make room for the new chord.
     * @param start The start beat of the chord within the context of the progression
     * @param duration The beat duration of the chord
     * @param chord The chord itself that is to be added
     * @returns Returns the ChordProgression instance, to allow for chained operations
     */
    addChord(start: number, duration: number, chord: Chord): ChordProgression {
        const newChord = new ChordProgressionChord(start, duration, chord);
        let removeChords = false;
        for (const oldChord of this.chords) {
            if (oldChord.start >= newChord.start && oldChord.end <= newChord.end) {
                oldChord.duration = 0;
                removeChords = true;
            }
            else if (oldChord.end > newChord.start && oldChord.end < newChord.end)
                oldChord.end = newChord.start;
            else if (oldChord.start < newChord.end && oldChord.start > newChord.start) {
                const oldEnd = oldChord.end;
                oldChord.start = newChord.end;
                oldChord.end = oldEnd;
            }
        }
        if (removeChords)
            this.removeChords(x => x.duration == 0);
        this.chords.push(newChord);
        return this;
    }

    /**
     * Removes all chords from the progression that match the passed in criteria
     * @param condition The rule for which chords to remove
     */
    removeChords(condition: (cpc: ChordProgressionChord) => boolean) {
        this.chords = this.chords.filter(x => !condition(x));
    }

    /**
     * Returns a collection of all the chords that overlap with the passed in range.
     * 
     * If rangeEnd < rangeStart, then it returns all chords which end after rangeStart, or begin before rangeEnd.
     * @param rangeStart 
     * @param rangeEnd 
     * @returns 
     */
    getChordsInRange(rangeStart: number, rangeEnd: number): Array<ChordProgressionChord> {
        const output = [];
        for (const chord of this.chords) {
            if (rangeStart <= rangeEnd) {
                const maxStart = Math.max(rangeStart, chord.start);
                const minEnd = Math.min(rangeEnd, chord.end);
                if (maxStart < minEnd)
                    output.push(chord);
            }
            else {
                if (chord.start < rangeEnd || chord.end > rangeStart)
                    output.push(chord);
            }
        }
        return output;
    }

    /**
     * Returns the chord that occurs at the given point in time within the chord progression.
     * @param beat The beat of the chord, relative to the start of the chord progression.
     * @returns 
     */
    getChordAt(beat: number): ChordProgressionChord {
        beat = safeMod(beat, this.duration);
        return this.chords.find(x => x.start <= beat && x.end > beat);
    }
}