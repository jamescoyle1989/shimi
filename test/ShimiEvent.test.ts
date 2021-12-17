import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import ShimiEvent, { ShimiEventData, ShimiHandler } from '../src/ShimiEvent';

class MockSource {
}

@suite class ShimiEventTests {
    @test 'Can add and remove handlers'() {
        const evt = new ShimiEvent<ShimiEventData<MockSource>, MockSource>();
        expect(evt.handlers.length).to.equal(0);
        const handler = data => {};
        evt.add(handler);
        expect(evt.handlers.length).to.equal(1);
        evt.remove(h => h.logic == handler);
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

    @test 'Can add ShimiHandler object as handler'() {
        const evt = new ShimiEvent<ShimiEventData<MockSource>, MockSource>();
        const handler = new ShimiHandler(data => {});
        evt.add(handler);
        expect(evt.handlers.length).to.equal(1);
        evt.remove(h => h === handler);
        expect(evt.handlers.length).to.equal(0);
    }

    @test 'handler function gets turned into a ShimiHandler object'() {
        const evt = new ShimiEvent<ShimiEventData<MockSource>, MockSource>();
        evt.add(data => {});
        const handler = evt.handlers[0];
        expect(handler).to.be.instanceOf(ShimiHandler);
    }

    @test 'Can add ref to handlers'() {
        const evt = new ShimiEvent<ShimiEventData<MockSource>, MockSource>();
        evt.add(new ShimiHandler(data => {}, 'ref1'));
        evt.add(new ShimiHandler(data => {}, 'ref2'));
        expect(evt.handlers.filter(x => x.ref == 'ref1').length).to.equal(1);
        expect(evt.handlers.filter(x => x.ref == 'ref2').length).to.equal(1);
        expect(evt.handlers.filter(x => x.ref == 'ref3').length).to.equal(0);
    }

    @test 'Handler logic doesnt get called if handlers not on'() {
        const evt = new ShimiEvent<ShimiEventData<MockSource>, MockSource>();
        const results: number[] = [];
        evt.add(data => results.push(3));
        evt.add(new ShimiHandler(data => results.push(7), 'ref2'));
        evt.add(data => results.push(8));
        evt.handlers.find(x => x.ref == 'ref2').on = false;
        evt.trigger(null);
        expect(results.length).to.equal(2);
        expect(results[0]).to.equal(3);
        expect(results[1]).to.equal(8);
    }
}