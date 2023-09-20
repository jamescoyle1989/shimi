import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import ClockUpdateSource from '../src/ClockUpdateSource';


@suite class ClockUpdateSourceTests {
    @test 'useWebWorker defaults to true'() {
        const model = new ClockUpdateSource(() => {});
        expect(model.useWebWorker).to.be.true;
    }

    @test 'Constructor takes passed in update interval'() {
        const model = new ClockUpdateSource(() => {}, 7);
        expect(model.msPerTick).to.equal(7);
    }

    @test 'msPerTick defaults to 5 if not set in constructor'() {
        const model = new ClockUpdateSource(() => {});
        expect(model.msPerTick).to.equal(5);
    }

    @test 'Constructor throws error if callback not set'() {
        expect(() => new ClockUpdateSource(null)).to.throw();
    }

    @test 'Constructor saves passed in callback'() {
        const callback = () => {};
        const model = new ClockUpdateSource(callback);
        expect(model.callback).to.equal(callback);
    }

    @test 'running defaults to false'() {
        const model = new ClockUpdateSource(() => {});
        expect(model.running).to.be.false;
    }

    @test 'start sets running to true'() {
        const model = new ClockUpdateSource(() => {});
        model.start();
        expect(model.running).to.be.true;
        model.stop();
    }

    @test 'start returns false if already running'() {
        const model = new ClockUpdateSource(() => {});
        expect(model.start()).to.be.true;
        expect(model.start()).to.be.false;
        model.stop();
    }

    @test 'stop sets running to false'() {
        const model = new ClockUpdateSource(() => {});
        model.start();
        expect(model.running).to.be.true;
        model.stop();
        expect(model.running).to.be.false;
    }

    @test 'stop returns false if already not running'() {
        const model = new ClockUpdateSource(() => {});
        model.start();
        expect(model.stop()).to.be.true;
        expect(model.stop()).to.be.false;
    }
}