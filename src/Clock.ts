'use strict';

/**
 * @category Timing
 */
export default class Clock {
    /** How many milliseconds from one tick to the next */
    get msPerTick(): number { return this._msPerTick; }
    private _msPerTick: number;

    /** list of processes that get updated by the clock */
    get children(): Array<IClockChild> { return this._children;}
    private _children: Array<IClockChild> = [];

    private _lastUpdateTime: number;

    private _timer: NodeJS.Timer;

    /** Returns whether the clock is already running */
    get running(): boolean { return !!this._timer; }

    constructor(msPerTick: number = 5) {
        this._msPerTick = msPerTick;
    }

    /** Returns false if the clock was already running */
    start(): boolean {
        if (this.running)
            return false;
        this._timer = setInterval(() => this.updateChildren(), this.msPerTick);
        this._lastUpdateTime = new Date().getTime();
        return true;
    }

    /** Returns false if the clock was already stopped */
    stop(): boolean {
        if (!this.running)
            return false;
        clearTimeout(this._timer);
        this._timer = null;
        this._lastUpdateTime = null;
        return true;
    }

    addChild(child: IClockChild): IClockChild {
        this._children.push(child);
        return child;
    }

    stopChildren(filter: (child: IClockChild) => boolean): void {
        for (const c of this._children) {
            if (filter(c))
                c.finish();
        }
    }

    updateChildren() {
        const newTime = new Date().getTime();
        const deltaMs = newTime - this._lastUpdateTime;
        this._lastUpdateTime = newTime;

        for (const child of this._children) {
            if (!child.finished)
                child.update(deltaMs);
        }
        this._children = this._children.filter(c => !c.finished);
    }
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
    get finished(): boolean;

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
}