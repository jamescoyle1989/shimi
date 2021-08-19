'use strict';


export interface IEventSubscriber {
    subscribe(eventName: string, handler: any);
    unsubscribe(eventName: string, handler: any);
}


/** Used for subscribing to events on the document, window etc. Allows for easier testing */
export default class EventSubscriber implements IEventSubscriber {
    target: any;
    
    constructor(target: any) {
        this.target = target;
    }

    subscribe(eventName: string, handler: any) {
        this.target.addEventListener(eventName, handler);
    }

    unsubscribe(eventName: string, handler: any) {
        this.target.removeEventListener(eventName, handler);
    }
}