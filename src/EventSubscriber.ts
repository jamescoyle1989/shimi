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


/**
 * The EventSubscriber holds a reference to a target object, for which it manages the event subscriptions by calling the addEventListener & removeEventListener methods.
 */
export default class EventSubscriber implements IEventSubscriber {
    /** The target object, whose event subscriptions are being managed. */
    target: any;
    
    /**
     * @param target The target object, whose event subscriptions are being managed.
     */
    constructor(target: any) {
        this.target = target;
    }

    /**
     * Add a subscription to some event by name.
     * @param eventName The event to subscribe to.
     * @param handler The function to be called when the event is fired. The expected function definition will depend upon which event is being subscribed to.
     */
    subscribe(eventName: string, handler: any) {
        this.target.addEventListener(eventName, handler);
    }

    /**
     * Remove a subscription to some event by name.
     * @param eventName The event to unsubscribe from.
     * @param handler The function to be called when the event is fired. The expected function definition will depend upon which event is being subscribed to.
     */
    unsubscribe(eventName: string, handler: any) {
        this.target.removeEventListener(eventName, handler);
    }
}