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
    get handlers(): Array<ShimiHandler<TData, TSource>> { return this._handlers; }
    private _handlers: Array<ShimiHandler<TData, TSource>> = [];

    /** Add a new handler to the event */
    add(handler: ShimiHandler<TData, TSource> | ((data: TData) => void)) {
        if (!handler)
            throw new Error('Invalid handler value');
        if (typeof(handler) === 'function')
            this.handlers.push(new ShimiHandler<TData, TSource>(handler));
        else
            this.handlers.push(handler);
    }

    /** Remove the specified handler from the event */
    remove(where: (handler: ShimiHandler<TData, TSource>) => boolean) {
        this._handlers = this._handlers.filter(x => !where(x));
    }

    /** Runs the collection of handlers */
    trigger(data: TData) {
        for (const handler of this.handlers) {
            if (data?.cancel)
                break;
            if (handler.on)
                handler.logic(data);
        }
    }
}



export class ShimiHandler<TData extends ShimiEventData<TSource>, TSource> {
    /** The logic to be executed by the handler */
    get logic(): (data: TData) => void { return this._logic; }
    private _logic: (data: TData) => void;

    /** Ref to allow the handler to be easily refered back to */
    get ref(): string { return this._ref; }
    set ref(value: string) { this._ref = value; }
    private _ref: string;

    /** If false, then the handler should be skipped */
    get on(): boolean { return this._on; }
    set on(value: boolean) { this._on = value; }
    private _on: boolean = true;
    
    constructor(logic: (data: TData) => void, ref?: string) {
        this._logic = logic;
        this.ref = ref;
    }
}