import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import Clock, { IClockChild } from '../src/Clock';

class TestClockChild implements IClockChild {
    callback: (deltaMs: number) => void;
    
    update(deltaMs: number) {
        this.callback(deltaMs);
    }
}

@suite class ClockTests {
    @test 'start begins updates'() {
        const clock = new Clock();
        clock.start();
        expect(clock.running).to.be.true;
        clock.stop();
    }

    @test 'start returns false if already running'() {
        const clock = new Clock();
        expect(clock.start()).to.be.true;
        expect(clock.start()).to.be.false;
        clock.stop();
    }

    @test 'stop ends updates'() {
        const clock = new Clock();
        clock.start();
        expect(clock.running).to.be.true;
        clock.stop();
        expect(clock.running).to.be.false;
    }

    @test 'stop returns false if already running'() {
        const clock = new Clock();
        expect(clock.stop()).to.be.false;
    }

    @test 'children get updated'() {
        let updateCount = 0;
        
        const clock = new Clock();
        const clockChild = new TestClockChild();
        clockChild.callback = deltaMs => updateCount++;
        clock.children.push(clockChild);

        clock.start();
        expect(updateCount).to.equal(0);
        clock.updateChildren();
        expect(updateCount).to.equal(1);
        clock.stop();
    }
}