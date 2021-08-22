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
}