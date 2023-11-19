import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import '../src/Extensions';


@suite class NumberExtensionTests {
    @test 'near extension returns correct result'() {
        expect((48).near(62)).to.equal(60);
    }

    @test 'When ambiguous, near returns the value closest to the current pitch value'() {
        expect((48).near(66)).to.equal(60);
        expect((48).near(30)).to.equal(36);
    }

    @test 'near can take string representation of pitch'() {
        expect((2).near('C2')).to.equal(38);
    }


    @test 'octave extension returns correct result'() {
        expect((10).octave).to.equal(-1);
        expect((17).octave).to.equal(0);
        expect((24).octave).to.equal(1);
        expect((37).octave).to.equal(2);
    }


    @test 'toOctave extension returns pitch class but in new octave'() {
        expect((0).toOctave(1)).to.equal(24);
        expect((15).toOctave(-1)).to.equal(3);
        expect((26).toOctave(2)).to.equal(38);
    }
}