import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import PitchFitter from '../src/PitchFitter';
import { Chord, ScaleTemplate } from '../src';


@suite class PitchFitterTests {
    @test 'constructor populates map'() {
        const scale = ScaleTemplate.major.create('C');
        const pitchFitter = new PitchFitter([1,3], scale, {});

        expect(pitchFitter['_map'].size).to.equal(12);
    }


    @test 'fitPitch returns the value that a pitch has been mapped to'() {
        const scale = ScaleTemplate.major.create('C');
        const pitchFitter = new PitchFitter([1, 3], scale, {});

        expect(pitchFitter.fitPitch(12)).to.equal(12);
        expect(pitchFitter.fitPitch(13)).to.equal(12);
        expect(pitchFitter.fitPitch(14)).to.equal(14);
        expect(pitchFitter.fitPitch(15)).to.equal(14);
        expect(pitchFitter.fitPitch(16)).to.equal(16);
        expect(pitchFitter.fitPitch(17)).to.equal(17);
        expect(pitchFitter.fitPitch(18)).to.equal(17);
        expect(pitchFitter.fitPitch(19)).to.equal(19);
        expect(pitchFitter.fitPitch(20)).to.equal(19);
        expect(pitchFitter.fitPitch(21)).to.equal(21);
        expect(pitchFitter.fitPitch(22)).to.equal(21);
        expect(pitchFitter.fitPitch(23)).to.equal(23);
    }

    @test 'Maps large clustered notes without much duplication'() {
        const scale = ScaleTemplate.major.create('C');
        const pitchFitter = new PitchFitter([1,2,4,5,6,7,9,10], scale, {});

        expect(pitchFitter.fitPitch(12)).to.equal(12);
        expect(pitchFitter.fitPitch(13)).to.equal(12);
        expect(pitchFitter.fitPitch(14)).to.equal(14);
        expect(pitchFitter.fitPitch(15)).to.equal(14);
        expect(pitchFitter.fitPitch(16)).to.equal(16);
        expect(pitchFitter.fitPitch(17)).to.equal(17);
        expect(pitchFitter.fitPitch(18)).to.equal(17);
        expect(pitchFitter.fitPitch(19)).to.equal(19);
        expect(pitchFitter.fitPitch(20)).to.equal(19);
        expect(pitchFitter.fitPitch(21)).to.equal(21);
        expect(pitchFitter.fitPitch(22)).to.equal(23);
        expect(pitchFitter.fitPitch(23)).to.equal(23);
    }

    @test 'fitPitch returns fitted pitch in same octave as input value'() {
        const scale = ScaleTemplate.major.create('C');
        const pitchFitter = new PitchFitter([1,2,4,5,6,7,9,10], scale, {});

        expect(pitchFitter.fitPitch(1)).to.equal(0);
        expect(pitchFitter.fitPitch(13)).to.equal(12);
        expect(pitchFitter.fitPitch(25)).to.equal(24);
        expect(pitchFitter.fitPitch(37)).to.equal(36);
        expect(pitchFitter.fitPitch(49)).to.equal(48);
    }

    @test 'fitPitch handles string inputs'() {
        const scale = ScaleTemplate.major.create('C');
        const pitchFitter = new PitchFitter([1,2,4,5,6,7,9,10], scale, {});

        expect(pitchFitter.fitPitch('C1')).to.equal(24);
    }


    @test 'mapping ignores pitch duplications'() {
        const scale = ScaleTemplate.major.create('C');
        const pitchFitter = new PitchFitter([1, 3, 13, 15], scale, {});

        expect(pitchFitter.fitPitch(12)).to.equal(12);
        expect(pitchFitter.fitPitch(13)).to.equal(12);
        expect(pitchFitter.fitPitch(14)).to.equal(14);
        expect(pitchFitter.fitPitch(15)).to.equal(14);
        expect(pitchFitter.fitPitch(16)).to.equal(16);
        expect(pitchFitter.fitPitch(17)).to.equal(17);
        expect(pitchFitter.fitPitch(18)).to.equal(17);
        expect(pitchFitter.fitPitch(19)).to.equal(19);
        expect(pitchFitter.fitPitch(20)).to.equal(19);
        expect(pitchFitter.fitPitch(21)).to.equal(21);
        expect(pitchFitter.fitPitch(22)).to.equal(21);
        expect(pitchFitter.fitPitch(23)).to.equal(23);
    }

    @test 'mapping ignores container duplications'() {
        const chord = new Chord()
            .setRoot(0)
            .addPitches([2, 4, 5, 7, 9, 11, 12, 14]);
        const pitchFitter = new PitchFitter([1, 3, 13, 15], chord, {});

        expect(pitchFitter.fitPitch(12)).to.equal(12);
        expect(pitchFitter.fitPitch(13)).to.equal(12);
        expect(pitchFitter.fitPitch(14)).to.equal(14);
        expect(pitchFitter.fitPitch(15)).to.equal(14);
        expect(pitchFitter.fitPitch(16)).to.equal(16);
        expect(pitchFitter.fitPitch(17)).to.equal(17);
        expect(pitchFitter.fitPitch(18)).to.equal(17);
        expect(pitchFitter.fitPitch(19)).to.equal(19);
        expect(pitchFitter.fitPitch(20)).to.equal(19);
        expect(pitchFitter.fitPitch(21)).to.equal(21);
        expect(pitchFitter.fitPitch(22)).to.equal(21);
        expect(pitchFitter.fitPitch(23)).to.equal(23);
    }
}