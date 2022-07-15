import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import Keyboard from '../src/Keyboard';
import TestEventSubscriber from './TestEventSubscriber';


@suite class KeyboardTests {
    @test 'buttons allows querying the whole keyboard'() {
        const keyboard = new Keyboard(new TestEventSubscriber());
        expect(keyboard.buttons.filter(b => b.isPressed).length).to.equal(0);
        keyboard.q.valueTracker.value = 1;
        expect(keyboard.buttons.filter(b => b.isPressed).length).to.equal(1);
        keyboard.g.valueTracker.value = 1;
        expect(keyboard.buttons.filter(b => b.isPressed).length).to.equal(2);
    }

    @test 'activate starts keyboard listening'() {
        const subscriber = new TestEventSubscriber();
        const keyboard = new Keyboard(subscriber);
        keyboard.activate();
        expect(subscriber.log.length).to.equal(2);
    }

    @test 'activate returns false if already listening'() {
        const subscriber = new TestEventSubscriber();
        const keyboard = new Keyboard(subscriber);
        expect(keyboard.activate()).to.be.true;
        expect(keyboard.activate()).to.be.false;
    }

    @test 'deactivate stops keyboard listening'() {
        const subscriber = new TestEventSubscriber();
        const keyboard = new Keyboard(subscriber);
        keyboard.activate();
        subscriber.log = [];
        keyboard.deactivate();
        expect(subscriber.log.length).to.equal(2);
    }

    @test 'deactivate returns false if not listening'() {
        const subscriber = new TestEventSubscriber();
        const keyboard = new Keyboard(subscriber);
        expect(keyboard.deactivate()).to.be.false;
    }
}