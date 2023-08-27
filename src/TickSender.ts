'use strict';

import { ClockChildFinishedEvent, ClockChildFinishedEventData, IClockChild } from './Clock';
import { IMetronome } from './Metronome';
import { ContinueMessage, SongPositionMessage, StartMessage, StopMessage, TickMessage } from './MidiMessages';
import { IMidiOut } from './MidiOut';


/**
 * The TickSender is used for sending MIDI clock messages out, so that other MIDI devices can stay in sync with a shimi metronome.
 */
export default class TickSender implements IClockChild {
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.TickSender'; }

    /**
     * The metronome object which the TickSender sends out clock messages for.
     */
    get metronome(): IMetronome { return this._metronome; }
    set metronome(value: IMetronome) {
        if (!value)
            throw new Error('metronome cannot be set to null');
        if (value === this._metronome)
            return;
        if (!!this._metronome)
            this._unsubscribeFromMetronomeEvents();
        this._metronome = value;
        this._subscribeToMetronomeEvents();
    }
    private _metronome: IMetronome;

    /**
     * The midi out object which the TickSender sends clock messages to.
     */
    get midiOut(): IMidiOut { return this._midiOut; }
    set midiOut(value: IMidiOut) {
        if (!value)
            throw new Error('midiOut cannot be set to null');
        this._midiOut = value;
    }
    private _midiOut: IMidiOut;

    /** How many ticks occur per quarter note. */
    get ticksPerQuarterNote(): number { return this._ticksPerQuarterNote; }
    set ticksPerQuarterNote(value: number) {
        if (value <= 0)
            throw new Error('ticksPerQuarterNote must be greater than 0');
        this._ticksPerQuarterNote = value;
    }
    private _ticksPerQuarterNote: number;


    /**
     * @param metronome The metronome object which the TickSender sends out clock messages for.
     * @param midiOut The midi out object which the TickSender sends clock messages to.
     * @param ticksPerQuarterNote How many ticks occur per quarter note.
     */
    constructor(metronome: IMetronome, midiOut: IMidiOut, ticksPerQuarterNote: number = 24) {
        this.metronome = metronome;
        this.midiOut = midiOut;
        this.ticksPerQuarterNote = ticksPerQuarterNote;
    }

    private _onPositionChanged = () => {
        this.midiOut.sendMessage(new SongPositionMessage(this.ticksPerQuarterNote * this.metronome.totalQuarterNote / 6));
    }

    private _onStarted = () => {
        this.midiOut.sendMessage(new StartMessage());
    }

    private _onContinued = () => {
        this.midiOut.sendMessage(new ContinueMessage());
    }

    private _onStopped = () => {
        this.midiOut.sendMessage(new StopMessage());
    }

    private _unsubscribeFromMetronomeEvents() {
        this._metronome.positionChanged.remove(x => x.logic == this._onPositionChanged);
        this._metronome.started.remove(x => x.logic == this._onStarted);
        this._metronome.continued.remove(x => x.logic == this._onContinued);
        this._metronome.stopped.remove(x => x.logic == this._onStopped);
    }

    private _subscribeToMetronomeEvents() {
        this._metronome.positionChanged.add(this._onPositionChanged);
        this._metronome.started.add(this._onStarted);
        this._metronome.continued.add(this._onContinued);
        this._metronome.stopped.add(this._onStopped);
    }


    ///IClockChild implementation
    
    /** Provides a way of identifying tick senders so they can be easily retrieved later */
    get ref(): string { return this._ref; }
    set ref(value: string) { this._ref = value; }
    private _ref: string;

    /**
     * Provides a way for setting the ref through a chained function call. For example:
     * 
     * ```
     * clock.addChild(new TickSender(metronome, midiOut).withRef('ticksender'));
     * ```
     * 
     * @param ref The ref to set on the object.
     * @returns The calling object.
     */
    withRef(ref: string): IClockChild {
        this._ref = ref;
        return this;
    }

    /** Returns true if the TickSender has been instructed to stop everything by the `finish()` method. */
    get isFinished(): boolean { return this._isFinished; }
    private _isFinished: boolean = false;

    /** This event fires when the TickSender finishes. */
    get finished(): ClockChildFinishedEvent { return this._finished; }
    private _finished: ClockChildFinishedEvent = new ClockChildFinishedEvent();

    /** Calling this tells the TickSender to stop whatever it's doing and that it will no longer be used. */
    finish(): void {
        this._isFinished = true;
        this.finished.trigger(new ClockChildFinishedEventData(this));
    }
    
    /**
     * This method is intended to be called by a clock to provide regular updates. It should be called by consumers of the library.
     * @param msDelta How many milliseconds have passed since the last update cycle.
     * @returns 
     */
    update(msDelta: number) {
        const oldQN = this.metronome.totalQuarterNoteTracker.oldValue;
        const newQN = this.metronome.totalQuarterNoteTracker.value;
        const qnsPerTick = 1 / this.ticksPerQuarterNote;

        //qnsPerTick divides each quarter note into n equal segments
        //This sets us back to the end of the segment which the previous update would have left us off at
        let tracker = Math.floor(oldQN) + (Math.floor((oldQN % 1) / qnsPerTick) * qnsPerTick);
        while (true) {
            tracker += qnsPerTick;
            if (tracker >= newQN)
                break;
            this.midiOut.sendMessage(new TickMessage());
        }
    }
}