import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import TimeSig from '../src/TimeSig';


@suite class TimeSigTests {
    @test 'constructor properly sets up divisions'() {
        const timeSig = new TimeSig(
            [{count:1.5, swing:0.333}, {count:1.5, swing:0.333}, 1, 1],
            4
        );
        expect(timeSig.divisions.length).to.equal(4);
        expect(timeSig.divisions[0].count).to.equal(1.5);
        expect(timeSig.divisions[0].swing).to.equal(0.333);
        expect(timeSig.divisions[1].count).to.equal(1.5);
        expect(timeSig.divisions[1].swing).to.equal(0.333);
        expect(timeSig.divisions[2].count).to.equal(1);
        expect(timeSig.divisions[2].swing).to.equal(null);
        expect(timeSig.divisions[3].count).to.equal(1);
        expect(timeSig.divisions[3].swing).to.equal(null);
    }

    @test 'constructor validates denominator'() {
        expect(() => new TimeSig([1,1,1], 3)).to.throw();
        expect(() => new TimeSig([1,1,1], -4)).to.throw();
        expect(() => new TimeSig([1,1,1], 0)).to.throw();
    }

    @test 'constructor validates divisions'() {
        expect(() => new TimeSig([], 4)).to.throw();
        expect(() => new TimeSig([1,0,1], 4)).to.throw();
        expect(() => new TimeSig([1,-1], 4)).to.throw();
    }

    @test 'applySwing returns correct values'() {
        const timeSig = TimeSig.commonTime(0.33333);
        expect(timeSig.applySwing(0)).to.equal(0);
        expect(timeSig.applySwing(0.5)).to.be.closeTo(0.375, 0.001)
        expect(timeSig.applySwing(1)).to.equal(1);
        expect(timeSig.applySwing(1.5)).to.be.closeTo(1.375, 0.001);
        expect(timeSig.applySwing(2)).to.equal(2);
        expect(timeSig.applySwing(2.5)).to.be.closeTo(2.375, 0.001);
        expect(timeSig.applySwing(3)).to.equal(3);
        expect(timeSig.applySwing(3.5)).to.be.closeTo(3.375, 0.001);
        expect(timeSig.applySwing(4)).to.equal(4);
        expect(timeSig.applySwing(4.5)).to.be.closeTo(4.375, 0.001);

        expect(timeSig.applySwing(12)).to.equal(12);
    }

    @test 'quarterNoteToBeat returns correct values'() {
        const timeSig = new TimeSig(
            [{count:1.5, swing:0.33333}, {count:1.5, swing:0.33333}, 1, 1],
            4
        );
        expect(timeSig.quarterNoteToBeat(0)).to.equal(0);
        expect(timeSig.quarterNoteToBeat(0.5)).to.be.closeTo(0.25, 0.001)
        expect(timeSig.quarterNoteToBeat(1)).to.be.closeTo(0.5, 0.001);
        expect(timeSig.quarterNoteToBeat(1.5)).to.equal(1);
        expect(timeSig.quarterNoteToBeat(2)).to.be.closeTo(1.25, 0.001);
        expect(timeSig.quarterNoteToBeat(2.5)).to.be.closeTo(1.5, 0.001);
        expect(timeSig.quarterNoteToBeat(3)).to.equal(2);
        expect(timeSig.quarterNoteToBeat(3.5)).to.equal(2.5);
        expect(timeSig.quarterNoteToBeat(4)).to.equal(3);
        expect(timeSig.quarterNoteToBeat(4.5)).to.equal(3.5);

        expect(timeSig.quarterNoteToBeat(12)).to.be.closeTo(9.25, 0.001);
    }

    @test 'beatToQuarterNote returns correct values'() {
        const timeSig = new TimeSig(
            [{count:1.5, swing:0.33333}, {count:1.5, swing:0.33333}, 1, 1],
            4
        );
        expect(timeSig.beatToQuarterNote(0)).to.equal(0);
        expect(timeSig.beatToQuarterNote(0.5)).to.be.closeTo(1, 0.001);
        expect(timeSig.beatToQuarterNote(1)).to.equal(1.5);
        expect(timeSig.beatToQuarterNote(1.5)).to.be.closeTo(2.5, 0.001);
        expect(timeSig.beatToQuarterNote(2)).to.equal(3);
        expect(timeSig.beatToQuarterNote(2.5)).to.equal(3.5);
        expect(timeSig.beatToQuarterNote(3)).to.equal(4);
        expect(timeSig.beatToQuarterNote(3.5)).to.equal(4.5);

        expect(timeSig.beatToQuarterNote(9.5)).to.be.closeTo(12.5, 0.001);
    }
}