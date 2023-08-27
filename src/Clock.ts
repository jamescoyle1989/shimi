'use strict';

import ShimiEvent, { ShimiEventData } from './ShimiEvent';


/**
 * The Clock class is the basis on which many other classes throughout the shimi library rely upon to receive frequent and regular updates. 
 * 
 * The clock contains a list of references to objects that implement IClockChild. Each time the clock receives an update, it forwards the message to all of its children.
 * 
 * @category Timing
 */
export default class Clock {
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.Clock'; }

    /** 
     * How many milliseconds from one tick to the next.
     * 
     * Please note that the clock will not necessarily update exactly as often as defined here, but it should be pretty close.
     */
    get msPerTick(): number { return this._msPerTick; }
    private _msPerTick: number;

    /** List of objects that get updated by the clock each update cycle. */
    get children(): Array<IClockChild> { return this._children;}
    private _children: Array<IClockChild> = [];

    private _lastUpdateTime: number;

    private _timer: NodeJS.Timer;

    /** Returns whether the clock is already running. */
    get running(): boolean { return !!this._timer; }

    /**
     * @param msPerTick How many milliseconds from one tick to the next.
     * 
     * Please note that the clock will not necessarily update exactly as often as defined here, but it should be pretty close.
     * 
     * The default value is 5.
     */
    constructor(msPerTick: number = 5) {
        this._msPerTick = msPerTick;
    }

    /** 
     * Starts the clock running regular updates. Returns false if the clock was already running, otherwise returns true.
     */
    start(): boolean {
        if (this.running)
            return false;
        this._timer = setInterval(() => this.updateChildren(), this.msPerTick);
        this._lastUpdateTime = new Date().getTime();
        return true;
    }

    /** Stops the clock from running regular updates. Returns false if the clock was already stopped, otherwise returns true. */
    stop(): boolean {
        if (!this.running)
            return false;
        clearTimeout(this._timer);
        this._timer = null;
        this._lastUpdateTime = null;
        return true;
    }

    /** Add a new object to receive clock updates. Returns the object that was added. */
    addChild(child: IClockChild): IClockChild {
        this._children.push(child);
        return child;
    }

    /**
     * Calls the finish() method of all children which meet the passed in filter criteria.
     * @param filter Accepts a function which takes in an IClockChild, and returns a boolean, signifying whether the passed in IClockChild should be stopped.
     */
    stopChildren(filter: (child: IClockChild) => boolean): void {
        for (const c of this._children) {
            if (filter(c))
                c.finish();
        }
    }

    /**
     * Updates all active children which belong to the clock, as well removing any that have been stopped.
     * 
     * You shouldn't really need to call this, once you call start(), this will begin getting called regularly anyway.
     */
    updateChildren() {
        const newTime = new Date().getTime();
        const deltaMs = newTime - this._lastUpdateTime;
        this._lastUpdateTime = newTime;

        for (const child of this._children) {
            if (!child.isFinished)
                child.update(deltaMs);
        }
        this._children = this._children.filter(c => !c.isFinished);
    }
}


/**
 * The ClockChildFinishedEventData class extends ShimiEventData. It contains a reference to the source IClockChild that finished.
 * 
 * @category Timing
 */
export class ClockChildFinishedEventData extends ShimiEventData<IClockChild> {
    constructor(source: IClockChild) {
        super(source);
    }
}


/**
 * The ClockChildFinishedEvent class extends ShimiEvent, providing an object which can be subscribed to.
 * 
 * When the event is fired, it calls all subscribed event handlers, passing in a ClockChildFinishedEventData object containing information about the IClockChild object that triggered the event.
 * 
 * @category Timing
 */
export class ClockChildFinishedEvent extends ShimiEvent<ClockChildFinishedEventData, IClockChild> {
}


/**
 * The IClockChild defines an interface which every class that must be able to be added to the Clock should implement.
 * 
 * @category Timing
 */
export interface IClockChild {
    /**
     * Many shimi classes support using string references so that they're easier to retrieve at a later point in time.
     * 
     * An example of where this can be useful for clock children is when you want to stop some processes:
     * ```
     *  ...
     *  const clip = new shimi.Clip(1);
     *  clip.notes.push(new shimi.ClipNote(0, 1, shimi.pitch('C4'), 80));
     *  
     *  //Whenever the spacebar is pressed, add a new clip player to start playing the clip indefinitely
     *  keyboard.space.pressed.add(() => {
     *      const clipPlayer = new shimi.ClipPlayer(clip, metronome, midiOut);
     *      clipPlayer.ref = 'spacebar clips';
     *      clock.addChild(clipPlayer);
     *  });
     *  //Whenever the backspace button is pressed, stop all players which were started by the spacebar
     *  keyboard.backspace.pressed.add(() => {
     *      clock.stopChildren(x => x.ref == 'spacebar clips');
     *  });
     * ```
     */
    get ref(): string;

    /**
     * When this property is true, on the next update cycle, the clock will automatically remove the object from its list of children.
     */
    get isFinished(): boolean;

    /** This event is fired when the clock child finishes running */
    get finished(): ClockChildFinishedEvent;



    /**
     * The update method gets called by Clock each cycle to allow the implementing object to update itself, there should be no reason for consumers of the library to call this.
     * 
     * @param deltaMs How many milliseconds have passed since the last update cycle.
     */
    update(deltaMs: number): void;

    /**
     * This method should contain any logic that needs to be performed to wrap up the running of the object, and also ensure that the finished property returns true.
     * 
     * In implementations which naturally only last a finite amount of time, calling finish from the update method will ensure that the object is automatically dropped by the clock when no longer needed.
     */
    finish(): void;

    /**
     * The withRef method should be implemented so that the ref of an object can be defined through a chained method. For example:
     * 
     * ```
     * clock.addChild(Cue.afterMs(100, () => console.log('HELLO!')).withRef('cueHello'));
     * ```
     * 
     * @param ref The ref that should be assigned to the IClockChild.
     */
    withRef(ref: string): IClockChild;
}