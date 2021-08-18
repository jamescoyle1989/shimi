import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import ShimiEvent, { ShimiEventData } from '../src/ShimiEvent';

class MockSource {
}

@suite class ShimiEventTests {
    @test 'Can add and remove handlers'() {
        const evt = new ShimiEvent<ShimiEventData<MockSource>, MockSource>();
        expect(evt.handlers.length).to.equal(0);
        const handler = data => {};
        evt.add(handler);
        expect(evt.handlers.length).to.equal(1);
        evt.remove(handler);
        expect(evt.handlers.length).to.equal(0);
    }

    @test 'Add throws error if handler is fals-y'() {
        const evt = new ShimiEvent<ShimiEventData<MockSource>, MockSource>();
        expect(() => evt.add(null)).to.throw();
    }

    @test 'Trigger calls each handler in order'() {
        const evt = new ShimiEvent<ShimiEventData<MockSource>, MockSource>();
        const results: number[] = [];
        evt.add(data => results.push(3));
        evt.add(data => results.push(7));
        evt.add(data => results.push(8));
        evt.trigger(null);
        expect(results.length).to.equal(3);
        expect(results[0]).to.equal(3);
        expect(results[1]).to.equal(7);
        expect(results[2]).to.equal(8);
    }

    @test 'Trigger can be cancelled'() {
        const evt = new ShimiEvent<ShimiEventData<MockSource>, MockSource>();
        const results: number[] = [];
        evt.add(data => results.push(3));
        evt.add(data => results.push(7));
        evt.add(data => data.cancel = true);
        evt.add(data => results.push(8));
        evt.trigger(new ShimiEventData<MockSource>(new MockSource()));
        expect(results.length).to.equal(2);
        expect(results[0]).to.equal(3);
        expect(results[1]).to.equal(7);
    }

    @test 'Trigger passes data into each handler'() {
        const evt = new ShimiEvent<ShimiEventData<MockSource>, MockSource>();
        evt.add(data => data['hello'] = 13);
        evt.add(data => data['hello'] *= 3);
        const data = new ShimiEventData<MockSource>(new MockSource());
        evt.trigger(data);
        expect(data['hello']).to.equal(39);
    }
}