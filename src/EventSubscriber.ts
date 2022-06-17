'use strict';


/**
 * IEventSubscriber provides a minimal interface for subscribing to, and unsubscribing from events.
 * 
 * This interface as added mainly as a way of abstracting subscriptions to HTML events, to make the system more easily testable.
 */
export interface IEventSubscriber {
    /**
     * Add a subscription to some event by name.
     * @param eventName The event to subscribe to.
     * @param handler The function to be called when the event is fired. The expected function definition will depend upon which event is being subscribed to.
     */
    subscribe(eventName: string, handler: any);

    /**
     * Remove a subscription to some event by name.
     * @param eventName The event to unsubscribe from.
     * @param handler The function to be called when the event is fired. The expected function definition will depend upon which event is being subscribed to.
     */
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