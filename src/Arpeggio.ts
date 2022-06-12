'use strict';

import Range from './Range';
import Chord from './Chord';
import Note from './Note';


/**
 * @category Chords & Scales
 */
export class ArpeggioNote extends Range {
    /** Stores a function that takes chord as a parameter and returns a pitch value */
    get pitch(): (c: Chord) => number { return this._pitch; }
    /** Stores a function that takes chord as a parameter and returns a pitch value */
    set pitch(value: (c: Chord) => number) { this._pitch = value; }
    private _pitch: (c: Chord) => number;

    /** The note's velocity, valid values range from 0 - 127 */
    get velocity(): number { return this._velocity; }
    /** The note's velocity, valid values range from 0 - 127 */
    set velocity(value: number) { this._velocity = value; }
    private _velocity: number;

    /** Which channel to play the note on, valid values range from 0 - 15, or null to allow whatever is playing the clip to decide */
    get channel(): number { return this._channel; }
    /** Which channel to play the note on, valid values range from 0 - 15, or null to allow whatever is playing the clip to decide */
    set channel(value: number) { this._channel = value; }
    private _channel: number = null;

    /**
     * Represents a note being played within a clip
     * @param start What beat within the clip that the note starts on
     * @param duration How many beats the note lasts
     * @param pitch The method that converts a chord object into a MIDI pitch value from 0 - 127
     * @param velocity The note's velocity, valid values range from 0 - 127
     * @param channel Which channel to play the note on, valid values range from 0 - 15, or null to allow whatever is playing the clip to decide
     */
     constructor(
        start: number, 
        duration: number, 
        pitch: (c: Chord) => number, 
        velocity: number, 
        channel: number = null
    ) {
        super(start, duration);
        this.pitch = pitch;
        this.velocity = velocity;
        this.channel = channel;
    }

    createNote(chord: Chord, channel: number): Note {
        if (!chord)
            return null;
        return new Note(
            this.pitch(chord),
            this.velocity,
            this.channel ?? channel
        );
    }
}


/**
 * @category Chords & Scales
 */
export class Arpeggio extends Range {
    notes: ArpeggioNote[] = [];

    constructor(duration: number) {
        super(0, duration);
    }

    getNotesStartingInRange(start: number, end: number): ArpeggioNote[] {
        //It's better to compare >= to start & < to end
        //otherwise anything set to trigger on 0 would always be skipped
        if (start <= end)
            return this.notes.filter(x => x.start >= start && x.start < end);
        else
            return this.notes.filter(x => x.start >= start || x.start < end);
    }

    getNotesEndingInRange(start: number, end: number): ArpeggioNote[] {
        //It's better to compare >= to start & < to end
        //otherwise anything set to trigger on 0 would always be skipped
        if (start <= end)
            return this.notes.filter(x => x.end >= start && x.end < end);
        else
            return this.notes.filter(x => x.end >= start || x.end < end);
    }
}