import { IClockChild } from './Clock';
import { IMetronome } from './Metronome';
import { IMidiIn, MidiInEventData } from './MidiIn';
import { SongPositionMessage } from './MidiMessages';

/**
 * The TickReceiver class allows a shimi IMetronome instance to be updated by ticks coming from a MIDI input, rather than it updating itself.
 * 
 * @category Timing
 */
export default class TickReceiver implements IClockChild {
    /** The MIDI In object which tick events are received from. */
    get midiIn(): IMidiIn { return this._midiIn; }
    set midiIn(value: IMidiIn) {
        if (!value)
            throw new Error('midiIn cannot be set to null');
        if (value === this._midiIn)
            return;
        if (!!this._midiIn) {
            this._midiIn.tick.remove(x => x.logic == this._onMidiTick);
            this._midiIn.songPosition.remove(x => x.logic == this._onSongPosition);
        }
        this._midiIn = value;
        this._midiIn.tick.add(this._onMidiTick);
        this._midiIn.songPosition.add(this._onSongPosition);
    }
    private _midiIn: IMidiIn;

    /** The metronome which gets updated each cycle. */
    get metronome(): IMetronome { return this._metronome; }
    set metronome(value: IMetronome) {
        if (!value)
            throw new Error('metronome cannot be set to null');
        this._metronome = value;
    }
    private _metronome: IMetronome;

    /** How many ticks occur per quarter note. */
    get ticksPerQuarterNote(): number { return this._ticksPerQuarterNote; }
    set ticksPerQuarterNote(value: number) {
        if (value <= 0)
            throw new Error('ticksPerQuarterNote must be greater than 0');
        this._ticksPerQuarterNote = value;
    }
    private _ticksPerQuarterNote: number;

    
    constructor(midiIn: IMidiIn, metronome: IMetronome, ticksPerQuarterNote: number = 24) {
        this.midiIn = midiIn;
        this.metronome = metronome;
        this.ticksPerQuarterNote = ticksPerQuarterNote;
    }


    /** Returns the number of ticks that have been received since the last update cycle. */
    get newTicksReceived() { return this._newTicksReceived; }
    private _newTicksReceived: number = 0;

    //Function defined this way so that it can still access this properly while being called from event handler
    private _onMidiTick = () => {
        this._newTicksReceived++;
    }

    private _onSongPosition = (eventData: MidiInEventData<SongPositionMessage>) => {
        const ticks = eventData.message.value * 6;
        const quarterNotes = ticks / this.ticksPerQuarterNote;
        this.metronome.setSongPosition(quarterNotes);
    };



    /** Provides a way of identifying TickReceivers so they can be easily retrieved later */
    get ref(): string { return this._ref; }
    set ref(value: string) { this._ref = value; }
    private _ref: string;

    /**
     * Provides a way for setting the ref through a chained function call. For example:
     * 
     * ```
     * clock.addChild(new TickReceiver(midiInput, metronome, 24).withRef('tickReceiver'));
     * ```
     * 
     * @param ref The ref to set on the object.
     * @returns The calling object.
     */
    withRef(ref: string): IClockChild {
        this._ref = ref;
        return this;
    }

    /** Returns true if the Metronome has been instructed to stop everything by the `finish()` method. */
    get finished(): boolean { return this._finished; }
    private _finished: boolean = false;

    /** Calling this tells the TickReceiver to stop whatever it's doing and that it will no longer be used. */
    finish(): void {
        this._finished = true;
        this.midiIn.tick.remove(x => x.logic == this._onMidiTick);
        this.midiIn.songPosition.remove(x => x.logic == this._onSongPosition);
    }
    
    /**
     * This method is intended to be called by a clock to provide regular updates. It should be called by consumers of the library.
     * @param msDelta How many milliseconds have passed since the last update cycle.
     * @returns 
     */
    update(msDelta: number) {
        //Store the current value of newTicksReceived, in case new events are received asynchronously
        const newTicksReceived = this.newTicksReceived;
        
        const qnDelta = newTicksReceived / this.ticksPerQuarterNote;
        this.metronome.updateFromQuarterNoteDelta(qnDelta);
        
        this._newTicksReceived -= newTicksReceived;
    }
}