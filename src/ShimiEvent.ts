'use strict';


/** The base event data class in shimi. */
export class ShimiEventData<TSource> {
    /** The object that triggered the event. */
    source: TSource;

    /** If set to true, the event will stop processing. */
    cancel: boolean = false;

    constructor(source: TSource) {
        this.source = source;
    }
}


/** The base event class in shimi. */
export default class ShimiEvent<TData extends ShimiEventData<TSource>, TSource> {
    /** A collection of handlers which get called in order when the event is triggered. */
    get handlers(): Array<ShimiHandler<TData, TSource>> { return this._handlers; }
    private _handlers: Array<ShimiHandler<TData, TSource>> = [];

    /**
     * Add a new handler to the event. 
     * @param handler The new handler, either as a function, or a ShimiHandler object.
     * @returns Returns the added ShimiHandler object.
     */
    add(handler: ShimiHandler<TData, TSource> | ((data: TData) => void)): ShimiHandler<TData, TSource> {
        if (!handler)
            throw new Error('Invalid handler value');
        if (typeof(handler) === 'function') {
            const handlerObj = new ShimiHandler<TData, TSource>(handler);
            this.handlers.push(handlerObj);
            return handlerObj;
        }
        else {
            this.handlers.push(handler);
            return handler;
        }
    }

    /** Remove the specified handlers from the event. */
    remove(where: (handler: ShimiHandler<TData, TSource>) => boolean) {
        this._handlers = this._handlers.filter(x => !where(x));
    }

    /** Runs the collection of handlers that have been added to the event. */
    trigger(data: TData) {
        for (const handler of this.handlers) {
            if (data?.cancel)
                break;
            if (handler.on)
                handler.logic(data);
        }
    }
}



/**
 * The ShimiHandler is designed to be added to ShimiEvents, containing some action to be called whenever the event is triggered.
 */
export class ShimiHandler<TData extends ShimiEventData<TSource>, TSource> {
    /** The logic to be executed whenever the event that the handler is attached to gets triggered. */
    get logic(): (data: TData) => void { return this._logic; }
    private _logic: (data: TData) => void;

    /** Provides a way of identifying handlers so they can be easily retrieved later. */
    get ref(): string { return this._ref; }
    set ref(value: string) { this._ref = value; }
    private _ref: string;

    /** If false, then the handler should be skipped. */
    get on(): boolean { return this._on; }
    set on(value: boolean) { this._on = value; }
    private _on: boolean = true;
    
    /**
     * @param logic The logic to be executed whenever the event that the handler is attached to gets triggered.
     * @param ref Provides a way of identifying handlers so they can be easily retrieved later.
     */
    constructor(logic: (data: TData) => void, ref?: string) {
        this._logic = logic;
        this.ref = ref;
    }

    /**
     * Provides a way for setting the ref through a chained function call. For example:
     * 
     * ```
     * keyboard.a.pressed.add(data => console.log(data)).withRef('key log');
     * ```
     * 
     * @param ref The ref to set on the object.
     * @returns The calling object.
     */
    withRef(ref: string): ShimiHandler<TData, TSource> {
        this.ref = ref;
        return this;
    }
}