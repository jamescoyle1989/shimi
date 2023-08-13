import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import Updater from '../src/Updater';
import { TestClockChild } from './Clock.test';


@suite class UpdaterTests {
    @test 'Can add child'() {
        const updater = new Updater();
        updater.add(new TestClockChild());
        expect(updater.children.length).to.equal(1);
    }

    @test 'Can add multiple children through single add call'() {
        const updater = new Updater();

        updater.add(new TestClockChild(), new TestClockChild());

        expect(updater.children.length).to.equal(2);
    }

    @test 'Can chain add calls together'() {
        const updater = new Updater()
            .add(new TestClockChild())
            .add(new TestClockChild());

        expect(updater.children.length).to.equal(2);
    }

    @test 'Can stop all children at once'() {
        const child1 = new TestClockChild().withRef('1');
        const child2 = new TestClockChild().withRef('2');
        const updater = new Updater()
            .add(child1, child2);
        
        updater.stop();

        expect(child1.isFinished).to.be.true;
        expect(child2.isFinished).to.be.true;
    }

    @test 'Can stop specific children'() {
        const child1 = new TestClockChild().withRef('1');
        const child2 = new TestClockChild().withRef('2');
        const updater = new Updater()
            .add(child1, child2);

        updater.stop(x => x.ref == '1');

        expect(child1.isFinished).to.be.true;
        expect(child2.isFinished).to.be.false;
    }

    @test 'stop doesnt remove children, just finishes them'() {
        const updater = new Updater()
            .add(new TestClockChild(), new TestClockChild());

        updater.stop();

        expect(updater.children.length).to.equal(2);
    }

    @test 'Gets created with update time equal to creation time'() {
        const oldTime = new Date().getTime();
        const updater = new Updater();
        const newTime = new Date().getTime();

        expect(updater.lastUpdateTime).is.greaterThanOrEqual(oldTime);
        expect(updater.lastUpdateTime).is.lessThanOrEqual(newTime);
    }

    @test 'update causes lastUpdateTime to be updated with current time'() {
        const updater = new Updater();

        const oldTime = new Date().getTime();
        updater.update();
        const newTime = new Date().getTime();

        expect(updater.lastUpdateTime).is.greaterThanOrEqual(oldTime);
        expect(updater.lastUpdateTime).is.lessThanOrEqual(newTime);
    }

    @test 'update passes delta between lastUpdateTime and now to child update methods'() {
        const child = new TestClockChild();
        let updateDeltaMs = 0;
        child.callback = (deltaMs) => updateDeltaMs = deltaMs;
        const updater = new Updater().add(child);

        //Very dumb way to force a bit of a wait without having to resort to setTimeout
        for (let i = 0; i < 100000; i++) { }
        updater.update();

        expect(updateDeltaMs).to.be.greaterThan(0);
    }

    @test 'update doesnt update children which have finished'() {
        const child = new TestClockChild();
        let childGotUpdated = false;
        child.callback = (deltaMs) => childGotUpdated = true;
        child.finish();
        const updater = new Updater().add(child);

        updater.update();

        expect(childGotUpdated).to.be.false;
    }

    @test 'update removes finished children'() {
        const child = new TestClockChild();
        child.finish();
        const updater = new Updater().add(child);

        updater.update();

        expect(updater.children).to.be.empty;
    }
}