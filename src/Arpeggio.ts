'use strict';

import Range from './Range';
import Chord from './Chord';
import Note from './Note';


/**
 * Each ArpeggioNote object contains a definition for a single note to be played as part of a repeating arpeggio pattern.
 * 
 * @category Chords & Scales
 */
export class ArpeggioNote extends Range {
    /**
     * Stores a function that takes a chord as a parameter, and returns a pitch value
     * The recommended way to use this is with the [Chord.getPitch](https://jamescoyle1989.github.io/shimi/classes/Chord.html#getPitch) method, for example: `pitch = c => c.getPitch(0)`.
     * The pitch function is evaluated whenever the ArpeggioNote is deemed ready to play by a running Arpeggiator.
     */
    get pitch(): (c: Chord) => number { return this._pitch; }
    set pitch(value: (c: Chord) => number) { this._pitch = value; }
    private _pitch: (c: Chord) => number;

    /** The note's velocity, valid values range from 0 - 127 */
    get velocity(): number { return this._velocity; }
    set velocity(value: number) { this._velocity = value; }
    private _velocity: number;

    /** Which channel to play the note on, valid values range from 0 - 15, or null to default to signal that the Arpeggiator's chosen channel should be used. */
    get channel(): number { return this._channel; }
    set channel(value: number) { this._channel = value; }
    private _channel: number = null;

    /**
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

    /**
     * Intended for use by the Arpeggiator. This method generates a new Note object based on the passed in chord.
     * @param chord The chord which is being arpeggiated.
     * @param channel The default channel to use if the ArpeggioNote doesn't define one.
     * @returns 
     */
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
 * The Shimi Arpeggio object can contain a collection of ArpeggioNote objects.
 * 
 * Once an Arpeggio has been defined, it can be passed into an Arpeggiator object to be played.
 * 
 * Example arpeggio definition:
 * ```
 *  const arp = new shimi.Arpeggio(4);   //The arpeggio is defined for 4 beats, after that it will repeat
 *  arp.notes.push(
 *      new shimi.ArpeggioNote(0, 1, c => c.getPitch(0), 80),
 *      new shimi.ArpeggioNote(1, 1, c => c.getPitch(2), 80),
 *      new shimi.ArpeggioNote(2, 1, c => c.getPitch(1), 80),
 *      new shimi.ArpeggioNote(3, 1, c => c.getPitch(2), 80)
 *  );
 * ```
 * 
 * @category Chords & Scales
 */
export class Arpeggio extends Range {
    /** The collection of notes that make up the arpeggio shape. */
    notes: ArpeggioNote[] = [];

    /**
     * @param duration How many beats the arpeggio pattern will span before repeating.
     */
    constructor(duration: number) {
        super(0, duration);
    }

    /**
     * Adds a note to the arpeggio. The start parameter can take an array of values, allowing for multiple notes to be added at once for the same pitch.
     * @param start What beat within the arpeggio that the note starts on. Can take an array of multiple note starts
     * @param duration How many beats the note lasts
     * @param pitch A function which takes in a chord object as a parameter, and should return a MIDI pitch value (valid values range from 0 - 127). The most common way to use this is something like `c => c.getPitch(0)`
     * @param velocity The note's velocity, valid values range from 0 - 127
     * @param channel Which channel to play the note on, valid values range from 0 - 15, or null to allow whatever is playing the arpeggio to decide.
     * @returns Returns the Arpeggio object which the note(s) is being added to.
     */
    addNote(
        start: number | Array<number>,
        duration: number,
        pitch: (c: Chord) => number, 
        velocity: number,
        channel: number = null
    ): Arpeggio {
        if (typeof(start) === 'number')
            start = [start];
        for (const s of start)
            this.notes.push(new ArpeggioNote(s, duration, pitch, velocity, channel));

        return this;
    }

    /**
     * Mainly intended for use by the Arpeggiator. Returns the collection of ArpeggioNote objects which start within the given beat range.
     * @param start The beat to start searching from.
     * @param end The beat to end the search at.
     * @returns 
     */
    getNotesStartingInRange(start: number, end: number): ArpeggioNote[] {
        //It's better to compare >= to start & < to end
        //otherwise anything set to trigger on 0 would always be skipped
        if (start <= end)
            return this.notes.filter(x => x.start >= start && x.start < end);
        else
            return this.notes.filter(x => x.start >= start || x.start < end);
    }

    /**
     * Mainly intended for use by the Arpeggiator. Returns the collection of ArpeggioNote objects which end within the given beat range.
     * @param start The beat to start searching from.
     * @param end The beat to end the search at.
     * @returns 
     */
    getNotesEndingInRange(start: number, end: number): ArpeggioNote[] {
        //It's better to compare >= to start & < to end
        //otherwise anything set to trigger on 0 would always be skipped
        if (start <= end)
            return this.notes.filter(x => x.end >= start && x.end < end);
        else
            return this.notes.filter(x => x.end >= start || x.end < end);
    }
}