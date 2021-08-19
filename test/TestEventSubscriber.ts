'use strict';

import { IEventSubscriber } from '../src/EventSubscriber';


export default class TestEventSubscriber implements IEventSubscriber {
    log: Array<{name: string, handler: any, subscribed: boolean}> = [];
    
    subscribe(eventName: string, handler: any) {
        this.log.push({name: eventName, handler: handler, subscribed: true});
    }

    unsubscribe(eventName: string, handler: any) {
        this.log.push({name: eventName, handler: handler, subscribed: false});
    }
}