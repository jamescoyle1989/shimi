import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import PropertyTracker from '../src/PropertyTracker';

@suite class PropertyTrackerTests {
    @test 'undefined if no initial value'() {
        const tracker = new PropertyTracker();
        expect(tracker.value).to.be.undefined;
        expect(tracker.oldValue).to.be.undefined;
    }

    @test 'initial value set'() {
        const tracker = new PropertyTracker(5);
        expect(tracker.value).to.equal(5);
        expect(tracker.oldValue).to.equal(5);
    }

    @test 'isDirty works'() {
        const tracker = new PropertyTracker(10);
        expect(tracker.isDirty).to.be.false;
        tracker.value = 11;
        expect(tracker.isDirty).to.be.true;
    }

    @test 'accept works'() {
        const tracker = new PropertyTracker(9);
        tracker.value = 14;
        tracker.accept();
        expect(tracker.oldValue).to.equal(14);
    }

    @test 'undo works'() {
        const tracker = new PropertyTracker(9);
        tracker.value = 14;
        tracker.undo();
        expect(tracker.value).to.equal(9);
    }
}