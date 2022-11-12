import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import TimeSig from '../src/TimeSig';
import Flexinome from '../src/Flexinome';


@suite class FlexinomeTests {
    @test 'atBarBeat returns correct values'() {
        const m = new Flexinome(120, new TimeSig([1.5,1.5,1,1], 4));
        expect(m.atBarBeat(0)).to.be.true;
        expect(m.atBarBeat(3.9)).to.be.false;
        expect(m.atBarBeat(0.01)).to.be.false;
        m['_barBeat'].oldValue = 2.7;
        m['_barBeat'].value = 2.8;
        expect(m.atBarBeat(2.7)).to.be.false;
        expect(m.atBarBeat(2.75)).to.be.true;
        expect(m.atBarBeat(2.8)).to.be.true;
    }

    @test 'atBarQuarterNote returns correct values'() {
        const m = new Flexinome(120, new TimeSig([1.5,1.5,1,1], 4));
        expect(m.atBarQuarterNote(0)).to.be.true;
        expect(m.atBarQuarterNote(3.9)).to.be.false;
        expect(m.atBarQuarterNote(0.01)).to.be.false;
        m['_barQuarterNote'].oldValue = 2.7;
        m['_barQuarterNote'].value = 2.8;
        expect(m.atBarQuarterNote(2.7)).to.be.false;
        expect(m.atBarQuarterNote(2.75)).to.be.true;
        expect(m.atBarQuarterNote(2.8)).to.be.true;
    }

    @test 'update increases beat and quarter note values'() {
        const m = new Flexinome(60, new TimeSig([1.5,1.5,1,1], 4));
        expect(m.barBeat).to.equal(0);
        expect(m.totalBeat).to.equal(0);
        expect(m.barQuarterNote).to.equal(0);
        expect(m.totalQuarterNote).to.equal(0);
        m.update(1000);
        expect(m.barBeat).to.be.closeTo(0.66666, 0.001);
        expect(m.totalBeat).to.be.closeTo(0.66666, 0.001);
        expect(m.barQuarterNote).to.equal(1);
        expect(m.totalQuarterNote).to.equal(1);
    }

    @test 'update increases bar number'() {
        const m = new Flexinome(120, new TimeSig([1.5,1.5,1,1], 4));
        expect(m.bar).to.equal(1);
        m.update(500);
        expect(m.bar).to.equal(1);
        m['_barQuarterNote'].oldValue = 4.9;
        m['_barQuarterNote'].value = 4.9;
        expect(m.bar).to.equal(1);
        m.update(500);
        expect(m.bar).to.equal(2);
    }

    @test 'update changes time sig at start of new bar'() {
        const oldTimeSig = new TimeSig([1.5,1.5,1,1], 4);
        const newTimeSig = new TimeSig([1.5,1.5,1], 4);
        const m = new Flexinome(120, oldTimeSig);
        m.timeSig = newTimeSig;
        expect(m.timeSig).to.equal(oldTimeSig);
        m.update(500);
        expect(m.timeSig).to.equal(oldTimeSig);
        m['_barQuarterNote'].oldValue = 4.9;
        m['_barQuarterNote'].value = 4.9;
        expect(m.timeSig).to.equal(oldTimeSig);
        m.update(500);
        expect(m.timeSig).to.equal(newTimeSig);
    }

    @test 'update doesnt do anything if metronome not enabled'() {
        const m = new Flexinome(120, new TimeSig([1.5,1.5,1,1], 4));
        m.enabled = false;
        m.update(500);
        expect(m.barBeat).to.equal(0);
        expect(m.totalBeat).to.equal(0);
        expect(m.barQuarterNote).to.equal(0);
        expect(m.totalQuarterNote).to.equal(0);
    }

    @test 'update applies swing'() {
        const m = new Flexinome(60, new TimeSig([1.5,1.5,1,1], 4, 0.33333));
        m.update(500);
        expect(m.barQuarterNote).to.be.closeTo(0.5, 0.001);
        expect(m.barBeat).to.be.closeTo(0.25, 0.001);
        expect(m.totalQuarterNote).to.be.closeTo(0.5, 0.001);
        expect(m.totalBeat).to.be.closeTo(0.25, 0.001);
    }

    @test 'update applies swing from individual divisions'() {
        const m = new Flexinome(60, new TimeSig([{count:1.5, swing:0.33333},1.5,1,1], 4));
        m.update(500);
        expect(m.barQuarterNote).to.be.closeTo(0.5, 0.001);
        expect(m.barBeat).to.be.closeTo(0.25, 0.001);
        expect(m.totalQuarterNote).to.be.closeTo(0.5, 0.001);
        expect(m.totalBeat).to.be.closeTo(0.25, 0.001);
    }

    @test 'zero or negative tempoMultiplier throws error'() {
        const m = new Flexinome(60, TimeSig.commonTime());
        expect(() => m.tempoMultiplier = 0).to.throw();
        expect(() => m.tempoMultiplier = -1).to.throw();
    }

    @test 'tempoMultiplier changes speed of metronome updates'() {
        const m = new Flexinome(60, TimeSig.commonTime());
        m.tempoMultiplier = 2;
        m.update(1000);
        expect(m.barQuarterNote).to.equal(2);
        expect(m.barBeat).to.equal(2);
        expect(m.totalQuarterNote).to.equal(2);
        expect(m.totalBeat).to.equal(2);
    }

    @test 'setSongPosition updates metronome values'() {
        const m = new Flexinome(120, TimeSig.commonTime(0.5));
        m.setSongPosition(9.75);
        expect(m.totalQuarterNote).to.equal(9.75);
        expect(m.totalQuarterNoteTracker.isDirty).to.be.false;
        expect(m.bar).to.equal(2);
        expect(m.barTracker.isDirty).to.be.false;
        expect(m.barQuarterNote).to.equal(1.75);
        expect(m.barQuarterNoteTracker.isDirty).to.be.false;
        expect(m.totalBeat).to.equal(9.5);
        expect(m.totalBeatTracker.isDirty).to.be.false;
        expect(m.barBeat).to.equal(1.5);
        expect(m.barBeatTracker.isDirty).to.be.false;
    }

    @test 'setSongPosition triggers positionChanged event'() {
        const m = new Flexinome(120);
        let positionChangedCount = 0;
        m.positionChanged.add(() => positionChangedCount++);
        m.setSongPosition(10);
        expect(positionChangedCount).to.equal(1);
    }

    @test 'First update triggers started event'() {
        const m = new Flexinome(120);
        let startedMessagesCount = 0;
        m.started.add(() => startedMessagesCount++);
        m.update(10);
        expect(startedMessagesCount).to.equal(1);
    }

    @test 'Setting enabled = false triggers stopped event'() {
        const m = new Flexinome(120);
        let stopMessageCount = 0;
        m.stopped.add(() => stopMessageCount++);
        m.update(500);
        expect(stopMessageCount).to.equal(0);
        m.enabled = false;
        expect(stopMessageCount).to.equal(1);
        m.enabled = false;
        expect(stopMessageCount).to.equal(1);
    }

    @test 'Setting enabled = true triggers continued event'() {
        const m = new Flexinome(120);
        let continueMessageCount = 0;
        m.continued.add(() => continueMessageCount++);
        m.update(500);
        m.enabled = false;
        expect(continueMessageCount).to.equal(0);
        m.enabled = true;
        expect(continueMessageCount).to.equal(1);
        m.enabled = true;
        expect(continueMessageCount).to.equal(1);
    }

    @test 'atBarBeatMultiple returns 0 if at bar start'() {
        const m = new Flexinome(120);
        expect(m.atBarBeatMultiple(0.5)).to.equal(0);
    }

    @test 'atBarBeatMultiple returns -1 if not on division'() {
        const m = new Flexinome(60);
        m.update(250);
        expect(m.atBarBeatMultiple(0.5)).to.equal(-1);
    }

    @test 'atBarBeatMultiple returns multiple recently behind current beat'() {
        const m = new Flexinome(60);
        m.update(1950);
        m.update(100);
        expect(m.atBarBeatMultiple(1)).to.equal(2);
    }

    @test 'atBarBeatMultiple returns most recent multiple if many fall within update window'() {
        const m = new Flexinome(60);
        m.update(1400);
        m.update(700);
        expect(m.atBarBeatMultiple(0.5)).to.equal(4);
    }

    @test 'atBarBeatMultiple handles wrapping around bar lines'() {
        const m = new Flexinome(60);
        m.update(3700);
        m.update(400);
        expect(m.atBarBeatMultiple(1)).to.equal(0);
    }

    @test 'atBarQuarterNoteMultiple returns 0 if at bar start'() {
        const m = new Flexinome(120);
        expect(m.atBarQuarterNoteMultiple(0.5)).to.equal(0);
    }

    @test 'atBarQuarterNoteMultiple returns -1 if not on division'() {
        const m = new Flexinome(60);
        m.update(250);
        expect(m.atBarQuarterNoteMultiple(0.5)).to.equal(-1);
    }

    @test 'atBarQuarterNoteMultiple returns multiple recently behind current beat'() {
        const m = new Flexinome(60);
        m.update(1950);
        m.update(100);
        expect(m.atBarQuarterNoteMultiple(1)).to.equal(2);
    }

    @test 'atBarQuarterNoteMultiple returns most recent multiple if many fall within update window'() {
        const m = new Flexinome(60);
        m.update(1400);
        m.update(700);
        expect(m.atBarQuarterNoteMultiple(0.5)).to.equal(4);
    }

    @test 'atBarQuarterNoteMultiple handles wrapping around bar lines'() {
        const m = new Flexinome(60);
        m.update(3700);
        m.update(400);
        expect(m.atBarQuarterNoteMultiple(1)).to.equal(0);
    }
}