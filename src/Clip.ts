'use strict';

import Range from './Range';
import Note from './Note';
import { sum } from './IterationUtils';


export class ClipNote extends Range {
    /** The MIDI pitch of the note, valid values range from 0 - 127 */
    get pitch(): number { return this._pitch; }
    /** The MIDI pitch of the note, valid values range from 0 - 127 */
    set pitch(value: number) { this._pitch = value; }
    private _pitch: number;

    /** The note's velocity, valid values range from 0 - 127, or a function that maps beats to values */
    get velocity(): number | ((beat: number) => number) { return this._velocity; }
    /** The note's velocity, valid values range from 0 - 127, or a function that maps beats to values */
    set velocity(value: number | ((beat: number) => number)) { this._velocity = value; }
    private _velocity: number | ((beat: number) => number);

    /** Which channel to play the note on, valid values range from 0 - 15, or null to allow whatever is playing the clip to decide */
    get channel(): number { return this._channel; }
    /** Which channel to play the note on, valid values range from 0 - 15, or null to allow whatever is playing the clip to decide */
    set channel(value: number) { this._channel = value; }
    private _channel: number = null;

    /**
     * Represents a note being played within a clip
     * @param start What beat within the clip that the note starts on
     * @param duration How many beats the note lasts
     * @param pitch The MIDI pitch of the note, valid values range from 0 - 127
     * @param velocity The note's velocity, valid values range from 0 - 127, or a function that maps beats to values
     * @param channel Which channel to play the note on, valid values range from 0 - 15, or null to allow whatever is playing the clip to decide
     */
    constructor(
        start: number, 
        duration: number, 
        pitch: number, 
        velocity: number | ((beat: number) => number), 
        channel: number = null
    ) {
        super(start, duration);
        this.pitch = pitch;
        this.velocity = velocity;
        this.channel = channel;
    }

    createNote(channel: number): Note {
        return new Note(
            this.pitch, 
            (typeof(this.velocity) == 'number') ? 
                this.velocity : 
                this.velocity(0), 
            this.channel ?? channel
        );
    }
}


export class ClipCC extends Range {
    /** The MIDI controller to modify, valid values range from 0 - 127 */
    get controller(): number { return this._controller; }
    /** The MIDI controller to modify, valid values range from 0 - 127 */
    set controller(value: number) { this._controller = value; }
    private _controller: number;

    /** The value to set, valid values range from 0 - 127, or a function that maps beats to values */
    get value(): number | ((beat: number) => number) { return this._value; }
    /** The value to set, valid values range from 0 - 127, or a function that maps beats to values */
    set value(value: number | ((beat: number) => number)) { this._value = value; }
    private _value: number | ((beat: number) => number);

    /** Which channel to send the control change to, valid values range from 0 - 15, or null to allow whatever is playing the clip to decide */
    get channel(): number { return this._channel; }
    /** Which channel to send the control change to, valid values range from 0 - 15, or null to allow whatever is playing the clip to decide */
    set channel(value: number) { this._channel = value; }
    private _channel: number = null;

    /**
     * Represents a control change that belongs to a recorded MIDI clip
     * @param start What beat within the clip that the control change starts
     * @param duration How many beats the control change lasts
     * @param controller The MIDI controller to modify, valid values range from 0 - 127
     * @param value The value to set, valid values range from 0 - 127, or a function that maps beats to values
     * @param channel Which channel to play the control change on, valid values range from 0 - 15, or null to allow whatever is playing the clip to decide
     */
    constructor(
        start: number, 
        duration: number, 
        controller: number, 
        value: number | ((beat: number) => number), 
        channel: number = null
    ) {
        super(start, duration);
        this.controller = controller;
        this.value = value;
        this.channel = channel;
    }
}


export class ClipBend extends Range {
    /** How much bend to apply, valid values range from -1 to +1, or a function that maps beats to values */
    get percent(): number | ((beat: number) => number) { return this._percent; }
    /** How much bend to apply, valid values range from -1 to +1, or a function that maps beats to values */
    set percent(value: number | ((beat: number) => number)) { this._percent = value; }
    private _percent: number | ((beat: number) => number);

    /** Which channel to send the control change to, valid values range from 0 - 15, or null to allow whatever is playing the clip to decide */
    get channel(): number { return this._channel; }
    /** Which channel to send the control change to, valid values range from 0 - 15, or null to allow whatever is playing the clip to decide */
    set channel(value: number) { this._channel = value; }
    private _channel: number = null;

    /**
     * Represents a control change that belongs to a recorded MIDI clip
     * @param start What beat within the clip that the control change starts
     * @param duration How many beats the control change lasts
     * @param percent How much bend to apply, valid values range from 0 - 127, or a function that maps beats to values
     * @param channel Which channel to play the control change on, valid values range from 0 - 15, or null to allow whatever is playing the clip to decide
     */
    constructor(
        start: number, 
        duration: number, 
        percent: number | ((beat: number) => number), 
        channel: number = null
    ) {
        super(start, duration);
        this.percent = percent;
        this.channel = channel;
    }
}


export class Clip extends Range {
    notes: ClipNote[] = [];

    controlChanges: ClipCC[] = [];

    bends: ClipBend[] = [];

    constructor(duration: number) {
        super(0, duration);
    }

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
     * Modify the start times of notes in the clip to be more in time
     * @param rhythm An array of numbers that specify a rhythm to quantize to
     * For example [0.5, 0.25, 0.25] means that the clip should be quantized to a heavy metal gallop rhythm
     * Eg. one eigth note, followed by 2 sixteenth notes
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
     * @param semitones How many semitones to transpose the clip by
     */
    transpose(semitones: number): void {
        for (const note of this.notes)
            note.pitch += semitones;
    }

    /**
     * Reflects the clip vertically around a center pitch
     * @param reflectionPitch The pitch which notes in the clip are reflected around
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

    getNotesStartingInRange(start: number, end: number): ClipNote[] {
        return this._getChildrenStartingInRange<ClipNote>(this.notes, start, end);
    }

    getNotesEndingInRange(start: number, end: number): ClipNote[] {
        return this._getChildrenEndingInRange<ClipNote>(this.notes, start, end);
    }

    getControlChangesIntersectingRange(start: number, end: number): ClipCC[] {
        return this._getChildrenIntersectingRange<ClipCC>(this.controlChanges, start, end);
    }

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