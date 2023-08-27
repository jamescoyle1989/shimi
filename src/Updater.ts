import { IClockChild } from "./Clock";


export default class Updater {
    
    /** Returns the name of this type. This can be used rather than instanceof which is sometimes unreliable. */
    get typeName(): string { return 'shimi.Updater'; }

    /** List of child objects that get updated on each cycle. */
    get children(): Array<IClockChild> { return this._children;}
    private _children: Array<IClockChild> = [];

    get lastUpdateTime() { return this._lastUpdateTime; }
    private _lastUpdateTime: number = new Date().getTime();

    /** Add new children to receive updates. Returns a reference to itself to allow chaining. */
    add(...children: IClockChild[]): Updater {
        for (const child of children)
            this._children.push(child);
        return this;
    }

    /**
     * Calls the finish() method of all children which meet the passed in filter criteria.
     * @param filter Accepts a function which takes in an IClockChild, and returns a boolean, signifying whether the passed in IClockChild should be stopped.
     */
    stop(filter?: (child: IClockChild) => boolean): void {
        for (const c of this._children) {
            if (!filter || filter(c))
                c.finish();
        }
    }

    /** Updates all active children, as well removing any that have been stopped. */
    update() {
        const newTime = new Date().getTime();
        const deltaMs = newTime - this._lastUpdateTime;
        this._lastUpdateTime = newTime;

        let childrenToRemove = false;
        for (const child of this._children) {
            if (child.isFinished)
                childrenToRemove = true;
            else
                child.update(deltaMs);
        }
        if (childrenToRemove)
            this._children = this._children.filter(x => !x.isFinished);
    }
}