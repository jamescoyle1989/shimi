import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import TimeSig from '../src/TimeSig';
import Metronome from '../src/Metronome';


@suite class MetronomeTests {
    @test 'atBarBeat returns correct values'() {
        const m = new Metronome(120);
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
        const m = new Metronome(120);
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
        const m = new Metronome(60);
        expect(m.barBeat).to.equal(0);
        expect(m.totalBeat).to.equal(0);
        expect(m.barQuarterNote).to.equal(0);
        expect(m.totalQuarterNote).to.equal(0);
        m.update(1000);
        expect(m.barBeat).to.equal(1);
        expect(m.totalBeat).to.equal(1);
        expect(m.barQuarterNote).to.equal(1);
        expect(m.totalQuarterNote).to.equal(1);
    }

    @test 'update increases bar number'() {
        const m = new Metronome(120);
        expect(m.bar).to.equal(1);
        m.update(500);
        expect(m.bar).to.equal(1);
        m['_barQuarterNote'].oldValue = 3.9;
        m['_barQuarterNote'].value = 3.9;
        expect(m.bar).to.equal(1);
        m.update(500);
        expect(m.bar).to.equal(2);
    }

    @test 'update changes time sig at start of new bar'() {
        const oldTimeSig = new TimeSig([1,1,1,1], 4);
        const newTimeSig = new TimeSig([1,1,1], 4);
        const m = new Metronome(120, oldTimeSig);
        m.timeSig = newTimeSig;
        expect(m.timeSig).to.equal(oldTimeSig);
        m.update(500);
        expect(m.timeSig).to.equal(oldTimeSig);
        m['_barQuarterNote'].oldValue = 3.9;
        m['_barQuarterNote'].value = 3.9;
        expect(m.timeSig).to.equal(oldTimeSig);
        m.update(500);
        expect(m.timeSig).to.equal(newTimeSig);
    }

    @test 'update doesnt do anything if metronome not enabled'() {
        const m = new Metronome(120);
        m.enabled = false;
        m.update(500);
        expect(m.barBeat).to.equal(0);
        expect(m.totalBeat).to.equal(0);
        expect(m.barQuarterNote).to.equal(0);
        expect(m.totalQuarterNote).to.equal(0);
    }

    @test 'update applies swing'() {
        const m = new Metronome(60, TimeSig.commonTime(0.5));
        m.update(750);
        expect(m.barQuarterNote).to.be.closeTo(0.75, 0.001);
        expect(m.barBeat).to.be.closeTo(0.5, 0.001);
        expect(m.totalQuarterNote).to.be.closeTo(0.75, 0.001);
        expect(m.totalBeat).to.be.closeTo(0.5, 0.001);
    }

    @test 'update doesnt apply swing if in final beat of irregular bar'() {
        const m = new Metronome(60, new TimeSig([1,1,1,0.9], 4, 0.5));
        m.update(3000);
        expect(m.barQuarterNote).to.equal(3);
        expect(m.barBeat).to.equal(3);
        expect(m.totalQuarterNote).to.equal(3);
        expect(m.totalBeat).to.equal(3);
        m.update(750);
        expect(m.barQuarterNote).to.be.closeTo(3.75, 0.001);
        expect(m.barBeat).to.be.closeTo(3.75, 0.001);
        expect(m.totalQuarterNote).to.be.closeTo(3.75, 0.001);
        expect(m.totalBeat).to.be.closeTo(3.75, 0.001);
    }

    @test 'constructor throws error if no tempo provided'() {
        expect(() => { const m = new Metronome(undefined); }).to.throw();
        expect(() => { const m = new Metronome(null); }).to.throw();
        expect(() => { const m = new Metronome(0); }).to.throw();
    }

    @test 'constructor throws error if negative tempo provided'() {
        expect(() => { const m = new Metronome(-1); }).to.throw();
    }

    @test 'zero or negative tempoMultiplier throws error'() {
        const m = new Metronome(60, TimeSig.commonTime());
        expect(() => m.tempoMultiplier = 0).to.throw();
        expect(() => m.tempoMultiplier = -1).to.throw();
    }

    @test 'tempoMultiplier changes speed of metronome updates'() {
        const m = new Metronome(60, TimeSig.commonTime());
        m.tempoMultiplier = 2;
        m.update(1000);
        expect(m.barQuarterNote).to.equal(2);
        expect(m.barBeat).to.equal(2);
        expect(m.totalQuarterNote).to.equal(2);
        expect(m.totalBeat).to.equal(2);
    }

    @test 'setSongPosition updates metronome values'() {
        const m = new Metronome(120, TimeSig.commonTime(0.5));
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
        const m = new Metronome(120);
        let positionChangedCount = 0;
        m.positionChanged.add(() => positionChangedCount++);
        m.setSongPosition(10);
        expect(positionChangedCount).to.equal(1);
    }

    @test 'First update triggers started event'() {
        const m = new Metronome(120);
        let startedMessagesCount = 0;
        m.started.add(() => startedMessagesCount++);
        m.update(10);
        expect(startedMessagesCount).to.equal(1);
    }

    @test 'Setting enabled = false triggers stopped event'() {
        const m = new Metronome(120);
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
        const m = new Metronome(120);
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
}