'use strict';

/**
 * Instances of this class are used in place of regular member variables on other objects as a way to get dirty checking & undo functionality built into them, eg:
 * 
 * ```
 * private _velocityTracker = new PropertyTracker<number>(100);
 * get velocity(): number { return this._velocityTracker.value; }
 * set velocity(value: number) { this._velocityTracker.value = value; }
 * ```
 */
export default class PropertyTracker<T> {
    /** The most up-to-date value */
    value: T;

    /** The last accepted value */
    oldValue: T;

    /**
     * @param initValue The initial accepted value that the tracker gets instanciated with
     */
    constructor(initValue?: T) {
        this.value = initValue;
        this.oldValue = initValue;
    }

    /** Has the property changed since it was last accepted? */
    get isDirty(): boolean {
        return this.value !== this.oldValue;
    }

    /** Accept changes made to the property, no longer hang on to the old property value */
    accept(): void {
        this.oldValue = this.value;
    }

    /** Undo changes made to the property, revert back to the last accepted property value */
    undo(): void {
        this.value = this.oldValue;
    }
}