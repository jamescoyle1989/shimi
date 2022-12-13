'use strict';

import Range from './Range';
import Note from './Note';
import { ITween } from './Tweens';
import { sum } from './IterationUtils';
import { parsePitch } from './utils';


/**
 * ClipNote represents a note to be played within a clip, specifying the start and end time of the note within the clip, as well as all the information like pitch, velocity, channel, etc. needed to play the note.
 * 
 * @category Clips
 */
export class ClipNote extends Range {
    /** The MIDI pitch of the note, valid values range from 0 - 127. */
    get pitch(): number { return this._pitch; }
    set pitch(value: number) { this._pitch = value; }
    private _pitch: number;

    /**
     * The note's velocity, valid values range from 0 - 127, or an ITween object to allow for values that change over time.
     * 
     * An example of using a tween for velocity to make a note swell in volume as it's played:
     * `clipNote.velocity = Tween.linear(1, 127)`
     */
    get velocity(): number | ITween { return this._velocity; }
    set velocity(value: number | ITween) { this._velocity = value; }
    private _velocity: number | ITween;

    /** Which channel to play the note on, valid values range from 0 - 15, or null to allow whatever is playing the clip to decide. */
    get channel(): number { return this._channel; }
    set channel(value: number) { this._channel = value; }
    private _channel: number = null;

    /** Provides way of identifying notes so they can be easily retrieved later. */
    ref: string;

    /**
     * @param start What beat within the clip that the note starts on.
     * @param duration How many beats the note lasts.
     * @param pitch The MIDI pitch of the note, valid values range from 0 - 127. Can also take pitch names, see the [pitch](../functions/pitch.html) method for more information.
     * @param velocity The note's velocity, valid values range from 0 - 127, or a function that maps beats to values.
     * @param channel Which channel to play the note on, valid values range from 0 - 15, or null to allow whatever is playing the clip to decide.
     * @param ref Provides way of identifying notes so they can be easily retrieved later.
     */
    constructor(
        start: number, 
        duration: number, 
        pitch: number | string, 
        velocity: number | ITween, 
        channel: number = null,
        ref: string = null
    ) {
        super(start, duration);
        if (typeof(pitch) == 'string')
            this.pitch = parsePitch(pitch);
        else
            this.pitch = pitch;
        this.velocity = velocity;
        this.channel = channel;
        this.ref = ref;
    }

    /**
     * The createNote method is primarily intended for use by the ClipPlayer to generate a new Note object from the ClipNote.
     * @param channel This is the preferred channel to use if the ClipNote doesn't specify one.
     * @param percent How far into the note we should start from
     * @returns 
     */
    createNote(channel: number, percent: number): Note {
        return new Note(
            this.pitch, 
            (typeof(this.velocity) == 'number') ? 
                this.velocity : 
                this.velocity.update(percent), 
            this.channel ?? channel,
            this.ref
        );
    }
}


/**
 * ClipCC represents a control change to be played within a clip, specifying the start and end of the control change within the clip, as well as the information to be sent by the control change.
 * 
 * @category Clips
 */
export class ClipCC extends Range {
    /** The MIDI controller to modify, valid values range from 0 - 127. */
    get controller(): number { return this._controller; }
    set controller(value: number) { this._controller = value; }
    private _controller: number;

    /**
     * The value to set, valid values range from 0 - 127, or an ITween object to allow for values that change over time.
     * 
     * An example of using a tween to sweep the CC value from 0 to 127 over the course of 1 beat:
     * `new ClipCC(0, 1, 25, Tween.linear(0, 127));`
     */
    get value(): number | ITween { return this._value; }
    set value(value: number | ITween) { this._value = value; }
    private _value: number | ITween;

    /** Which channel to send the control change to, valid values range from 0 - 15, or null to allow whatever is playing the clip to decide. */
    get channel(): number { return this._channel; }
    set channel(value: number) { this._channel = value; }
    private _channel: number = null;

    /**
     * @param start What beat within the clip that the control change starts.
     * @param duration How many beats the control change lasts.
     * @param controller The MIDI controller to modify, valid values range from 0 - 127.
     * @param value The value to set, valid values range from 0 - 127, or a Tween object which defines a strategy for how to change over the course of the control change's lifetime.
     * @param channel Which channel to play the control change on, valid values range from 0 - 15, or null to allow whatever is playing the clip to decide.
     */
    constructor(
        start: number, 
        duration: number, 
        controller: number, 
        value: number | ITween, 
        channel: number = null
    ) {
        super(start, duration);
        this.controller = controller;
        this.value = value;
        this.channel = channel;
    }
}


/**
 * ClipBend represents a bend to be played within a clip, specifying the start and end of the bend, as well as the bend amount and optionally shape.
 * 
 * @category Clips
 */
export class ClipBend extends Range {
    /**
     * How much bend to apply, valid values range from -1 to +1, or an ITween object to allow for values that change over time.
     * 
     * In the MIDI standard, bends are defined by 2 7-bit numbers put together, this makes sense within the specification, but is not particularly friendly to work with. Shimi prefers to work with percentages for ease of use.
     * 
     * An example of using a tween to make a bend that smoothly eases up:
     * `clipBend.percent = Tween.sineInOut(0, 1);`
     */
    get percent(): number | ITween { return this._percent; }
    set percent(value: number | ITween) { this._percent = value; }
    private _percent: number | ITween;

    /** Which channel to send the bend to, valid values range from 0 - 15, or null to allow whatever is playing the clip to decide */
    get channel(): number { return this._channel; }
    set channel(value: number) { this._channel = value; }
    private _channel: number = null;

    /**
     * @param start What beat within the clip that the bend starts
     * @param duration How many beats the bend lasts
     * @param percent How much bend to apply, valid values range from 0 - 127, or a Tween object which defines a strategy for how to change over the course of the bend's lifetime.
     * @param channel Which channel to play the bend on, valid values range from 0 - 15, or null to allow whatever is playing the clip to decide
     */
    constructor(
        start: number, 
        duration: number, 
        percent: number | ITween, 
        channel: number = null
    ) {
        super(start, duration);
        this.percent = percent;
        this.channel = channel;
    }
}


/**
 * The Clip class represents a collection of notes, control changes, and bends, arranged over a certain number of beats, to allow them to be played in a musical expression.
 * 
 * An example of using a clip to contain the first 2 bars of the melody Twinkle Twinkle Little Star:
 * ```
 *  const clip = new shimi.Clip(8)
 *      .addNote([0,1], 1, 'C4', 80)
 *      .addNote([2,3], 1, 'G4', 80)
 *      .addNote([4,5], 1, 'A4', 80)
 *      .addNote(6, 2, 'G4', 80);
 * ```
 * 
 * @category Clips
 */
export class Clip extends Range {
    /**
     * The collection of notes that the clip contains.
     */
    notes: ClipNote[] = [];

    /**
     * The collection of control changes that the clip contains.
     */
    controlChanges: ClipCC[] = [];

    /**
     * The collection of pitch bends that the clip contains.
     */
    bends: ClipBend[] = [];

    /**
     * @param duration How many beats the clip lasts for.
     */
    constructor(duration: number) {
        super(0, duration);
    }

    /**
     * Adds a note to the clip. The start & pitch parameters can each take arrays of values, allowing for multiple notes to be added at once for the same pitches and start beats.
     * @param start What beat within the clip that the note starts on. Can take array of multiple note starts
     * @param duration How many beats the note lasts.
     * @param pitch The MIDI pitch of the note, valid values range from 0 - 127. Can also take pitch names, see the [pitch](../functions/pitch.html) method for more information. Can take array of multiple pitch values
     * @param velocity The note's velocity, valid values range from 0 - 127, or a function that maps beats to values.
     * @param channel Which channel to play the note on, valid values range from 0 - 15, or null to allow whatever is playing the clip to decide.
     * @param ref Provides way of identifying notes so they can be easily retrieved later.
     * @returns Returns the Clip object which the note(s) is being added to.
     */
    addNote(
        start: number | Array<number>, 
        duration: number, 
        pitch: number | string | Array<number | string>, 
        velocity: number | ITween, 
        channel: number = null,
        ref: string = null
    ): Clip {
        if (typeof(start) === 'number')
            start = [start];
        if (typeof(pitch) === 'number' || typeof(pitch) === 'string')
            pitch = [pitch];
        for (const s of start) {
            for (const p of pitch)
                this.notes.push(new ClipNote(s, duration, p, velocity, channel, ref));
        }
        return this;
    }

    /**
     * Adds a control change to the clip. The start parameter can take an array of values, allowing for multiple similar control changes to be added at once.
     * @param start What beat within the clip that the control change starts. Can take array of multiple start values.
     * @param duration How many beats the control change lasts.
     * @param controller The MIDI controller to modify, valid values range from 0 - 127.
     * @param value The value to set, valid values range from 0 - 127, or a Tween object which defines a strategy for how to change over the course of the control change's lifetime.
     * @param channel Which channel to play the control change on, valid values range from 0 - 15, or null to allow whatever is playing the clip to decide.
     * @returns Returns the Clip object which the control change(s) is being added to.
     */
    addCC(
        start: number | Array<number>, 
        duration: number, 
        controller: number, 
        value: number | ITween, 
        channel: number = null
    ): Clip {
        if (typeof(start) === 'number')
            start = [start];
        for (const s of start)
            this.controlChanges.push(new ClipCC(s, duration, controller, value, channel));
        return this;
    }

    /**
     * Adds a bend to the clip. The start parameter can take an array of values, allowing for multiple similar bends to be added at once.
     * @param start What beat within the clip that the bend starts
     * @param duration How many beats the bend lasts
     * @param percent How much bend to apply, valid values range from 0 - 127, or a Tween object which defines a strategy for how to change over the course of the bend's lifetime.
     * @param channel Which channel to play the bend on, valid values range from 0 - 15, or null to allow whatever is playing the clip to decide
     * @returns Returns the Clip object which the bend(s) is being added to.
     */
    addBend(
        start: number | Array<number>, 
        duration: number, 
        percent: number | ITween, 
        channel: number = null
    ): Clip {
        if (typeof(start) === 'number')
            start = [start];
        for (const s of start)
            this.bends.push(new ClipBend(s, duration, percent, channel));
        return this;
    }

    /**
     * Creates and returns a new deep-copy of the clip.
     * @returns 
     */
    duplicate(): Clip {
        const newClip = new Clip(this.duration);
        newClip.notes.push(...this.notes.map(
            x => new ClipNote(x.start, x.duration, x.pitch, x.velocity, x.channel)
        ));
        newClip.controlChanges.push(...this.controlChanges.map(
            x => new ClipCC(x.start, x.duration, x.controller, x.value, x.channel)
        ));
        newClip.bends.push(...this.bends.map(
            x => new ClipBend(x.start, x.duration, x.percent, x.channel)
        ));
        return newClip;
    }

    /**
     * Modify the start times of notes in the clip to be closer to some desired rhythmic pattern.
     * @param rhythm An array of numbers that specify a rhythm to quantize to.
     * For example [0.5] means that the clip should be quantized to eighth notes.
     * Alternatively, [0.5, 0.25, 0.25] means that the clip should be quantized to a heavy metal style gallop rhythm.
     * @param strength A number from 0 to 1, 1 means full quantization to the target rhythm
     * 0.5 will move notes half way towards the target rhythm, while 0 will do nothing
     */
    quantize(rhythm: number[], strength: number = 1): void {
        if (!rhythm || rhythm.length == 0)
            throw new Error('You must provide a rhythm to quantize notes to');
        if (rhythm.find(x => x <= 0) != undefined)
            throw new Error('Quantize rhythm must contain only positive non-zero values');
        
        strength = Math.min(1, Math.max(0, strength));
        const rhythmLength = sum(rhythm, x => x);

        for (const note of this.notes) {
            let currentBeat = Math.floor(note.start / rhythmLength) * rhythmLength;
            let nearestBeat = currentBeat;
            for (const r of rhythm) {
                currentBeat += r;
                if (Math.abs(currentBeat - note.start) < Math.abs(nearestBeat - note.start))
                    nearestBeat = currentBeat;
            }
            nearestBeat %= this.duration;
            //Move note start closer to nearestBeat
            note.start += strength * (nearestBeat - note.start);
        }
    }

    /**
     * Transposes the notes in the clip up/down
     * @param semitones How many semitones to transpose each note in the clip up by.
     */
    transpose(semitones: number): void {
        for (const note of this.notes)
            note.pitch += semitones;
    }

    /**
     * Reflects the clip vertically around a center pitch.
     * @param reflectionPitch The pitch which notes in the clip are reflected around.
     */
    invert(reflectionPitch: number): void {
        for (const note of this.notes)
            note.pitch = (reflectionPitch * 2) - note.pitch;
    }

    /**
     * Reflects the clip horizontally, with events from the start reflected to the end
     */
    reverse(): void {
        for (const note of this.notes)
            note.start = this.end - note.end;
        for (const cc of this.controlChanges)
            cc.start = this.end - cc.end;
        for (const bend of this.bends)
            bend.start = this.end - bend.end;
    }

    /**
     * Intended primarily for use by the ClipPlayer to fetch all notes who's start times are between the provided start & end parameters.
     * @param start The beat at which to start searching for note beginnings.
     * @param end The beat at which to end searching for note beginnings.
     * @returns 
     */
    getNotesStartingInRange(start: number, end: number): ClipNote[] {
        return this._getChildrenStartingInRange<ClipNote>(this.notes, start, end);
    }

    /**
     * Intended primarily for use by the ClipPlayer to fetch all notes who's end times are between the provided start & end parameters.
     * @param start The beat at which to start searching for note endings.
     * @param end The beat at which to end searching for note endings.
     * @returns 
     */
    getNotesEndingInRange(start: number, end: number): ClipNote[] {
        return this._getChildrenEndingInRange<ClipNote>(this.notes, start, end);
    }

    /**
     * Intended primarily for use by the ClipPlayer to fetch all control changes who's durations overlap with the provided start & end parameters.
     * @param start The beat at which to start searching for overlapping control changes.
     * @param end The beat at which to end searching for overlapping control changes.
     * @returns 
     */
    getControlChangesIntersectingRange(start: number, end: number): ClipCC[] {
        return this._getChildrenIntersectingRange<ClipCC>(this.controlChanges, start, end);
    }

    /**
     * Intended primarily for use by the ClipPlayer to fetch all pitch bends who's durations overlap with the provided start & end parameters.
     * @param start The beat at which to start searching for overlapping pitch bends.
     * @param end The beat at which to end searching for overlapping pitch bends.
     * @returns 
     */
    getBendsIntersectingRange(start: number, end: number): ClipBend[] {
        return this._getChildrenIntersectingRange<ClipBend>(this.bends, start, end);
    }

    /**
     * Get items from the passed in array whos start is within the start & end points
     * Note: If end arg is less than start arg then it assumes that the range to be searched is wrapping around
     * So in this case, it will actually search for anything whos end is greater than the start arg, OR less than the end arg
     */
    private _getChildrenStartingInRange<T extends Range>(array: T[], start: number, end: number): T[] {
        //It's better to compare >= to start & < to end
        //otherwise anything set to trigger on 0 would always be skipped
        if (start <= end)
            return array.filter(x => x.start >= start && x.start < end);
        else
            return array.filter(x => x.start >= start || x.start < end);
    }

    /**
     * Get items from the passed in array whos end is within the start & end points
     * Note: If end arg is less than start arg then it assumes that the range to be searched is wrapping around
     * So in this case, it will actually search for anything whos start is greater than the start arg, OR less than the end arg
     */
    private _getChildrenEndingInRange<T extends Range>(array: T[], start: number, end: number): T[] {
        //It's better to compare >= to start & < to end
        //otherwise anything set to trigger on 0 would always be skipped
        if (start <= end)
            return array.filter(x => x.end >= start && x.end < end);
        else
            return array.filter(x => x.end >= start || x.end < end);
    }

    /**
     * Get items from the passed in array which in any way intersect with the start & end points
     */
    private _getChildrenIntersectingRange<T extends Range>(array: T[], start: number, end: number): T[] {
        if (start <= end)
            return array.filter(x => Math.min(end, x.end) >= Math.max(start, x.start));
        else
            return array.filter(x => x.end >= start || x.start <= end);
    }
}