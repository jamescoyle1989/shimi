import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import Keyboard from '../src/Keyboard';
import TestEventSubscriber from './TestEventSubscriber';
import { Clock } from '../src';


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

    @test 'onKeyDown sets correct button state to 1'() {
        const subscriber = new TestEventSubscriber();
        const keyboard = new Keyboard(subscriber);
        expect(keyboard.left.value).to.equal(0);
        const event: any = { code: 'ArrowLeft' };
        keyboard['_onKeyDown'](event);
        expect(keyboard.left.value).to.equal(1);
    }

    @test 'onKeyUp sets correct button state to 0'() {
        const subscriber = new TestEventSubscriber();
        const keyboard = new Keyboard(subscriber);
        keyboard.right.valueTracker.value = 1;
        keyboard.right.valueTracker.accept();
        const event: any = { code: 'ArrowRight' };
        keyboard['_onKeyUp'](event);
        expect(keyboard.right.value).to.equal(0);
    }

    @test 'withRef sets ref value'() {
        const subscriber = new TestEventSubscriber();
        const keyboard = new Keyboard(subscriber).withRef('Testy test');
        expect(keyboard.ref).to.equal('Testy test');
    }

    @test 'finished event gets fired'() {
        //Setup
        const subscriber = new TestEventSubscriber();
        const keyboard = new Keyboard(subscriber);
        let testVar = 0;
        keyboard.finished.add(() => testVar = 3);

        keyboard.finish();
        expect(testVar).to.equal(3);
    }

    @test 'Automatically adds itself to default clock if set'() {
        Clock.default = new Clock();
        const subscriber = new TestEventSubscriber();
        const keyboard = new Keyboard(subscriber);

        expect(Clock.default.children).to.contain(keyboard);

        Clock.default = null;
    }
}