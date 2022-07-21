import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import Clock, { IClockChild } from '../src/Clock';

class TestClockChild implements IClockChild {
    get ref(): string { return this._ref; }
    set ref(value: string) { this._ref = value; }
    private _ref: string;

    withRef(ref: string): IClockChild {
        this.ref = ref;
        return this;
    }

    get finished(): boolean { return this._finished; }
    private _finished: boolean = false;

    totalDeltaMs: number = 0;

    finish() {
        this._finished = true;
    }
    
    callback: (deltaMs: number) => void;
    
    update(deltaMs: number) {
        this.totalDeltaMs += deltaMs;
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

    @test 'update removes finished children'() {
        let updateCount = 0;
        
        const clock = new Clock();
        const clockChild = new TestClockChild();
        clockChild.callback = deltaMs => updateCount++;
        clockChild.finish();
        clock.children.push(clockChild);

        clock.start();
        expect(updateCount).to.equal(0);
        clock.updateChildren();
        expect(updateCount).to.equal(0);
        expect(clock.children.length).to.equal(0);
        clock.stop();
    }

    @test 'stopChildren finishes targetted children, doesnt remove them'() {
        const clock = new Clock();

        const clockChild1 = new TestClockChild();
        clockChild1.callback = deltaMs => {};
        clockChild1.ref = 'abc';
        clock.addChild(clockChild1);

        const clockChild2 = new TestClockChild();
        clockChild2.callback = deltaMs => {};
        clockChild2.ref = 'def';
        clock.addChild(clockChild2);

        clock.stopChildren(c => c.ref == 'abc');
        expect(clock.children.length).to.equal(2);
        expect(clockChild1.finished).to.be.true;
        expect(clockChild2.finished).to.be.false;
    }
}