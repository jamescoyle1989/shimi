'use strict';


/** The base event data class in shimi */
export class ShimiEventData<TSource> {
    /** The object that triggered the event */
    source: TSource;

    /** If set to true, the event will stop processing */
    cancel: boolean = false;

    constructor(source: TSource) {
        this.source = source;
    }
}


/** The base event class in shimi */
export default class ShimiEvent<TData extends ShimiEventData<TSource>, TSource> {
    /** A collection of handlers which get called in order when the event is triggered */
    get handlers(): Array<(data: TData) => void> { return this._handlers; }
    private _handlers: Array<(data: TData) => void> = [];

    /** Add a new handler to the event */
    add(handler: (data: TData) => void) {
        if (!handler)
            throw new Error('Invalid handler value');
        this.handlers.push(handler);
    }

    /** Remove the specified handler from the event */
    remove(handler: (data: TData) => void) {
        this._handlers = this._handlers.filter(x => x !== handler);
    }

    /** Runs the collection of handlers */
    trigger(data: TData) {
        for (const handler of this.handlers) {
            if (data?.cancel)
                break;
            handler(data);
        }
    }
}