import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import ScaleTemplate from '../src/ScaleTemplate';


@suite class ScaleTests {
    @test 'constructor correctly builds pitches'() {
        const scale = ScaleTemplate.major.create(2);
        expect(scale.length).to.equal(7);
        expect(scale.pitches[0]).to.equal(2);
        expect(scale.pitches[1]).to.equal(4);
        expect(scale.pitches[2]).to.equal(6);
        expect(scale.pitches[3]).to.equal(7);
        expect(scale.pitches[4]).to.equal(9);
        expect(scale.pitches[5]).to.equal(11);
        expect(scale.pitches[6]).to.equal(1);
    }

    @test 'constructor correctly builds scale name'() {
        const scale = ScaleTemplate.phrygian.create(6);
        expect(scale.name).to.equal('F# Phrygian');
    }

    @test 'contains correctly identifies if pitch is in scale'() {
        const scale = ScaleTemplate.major.create(0);
        expect(scale.contains(0)).to.be.true;
        expect(scale.contains(1)).to.be.false;
        expect(scale.contains(2)).to.be.true;
        expect(scale.contains(3)).to.be.false;
    }

    @test 'indexOf returns 0-based position of pitch in scale'() {
        const scale = ScaleTemplate.major.create(0);
        expect(scale.indexOf(0)).to.equal(0);
        expect(scale.indexOf(4)).to.equal(2);
        expect(scale.indexOf(5)).to.equal(3);
        expect(scale.indexOf(9)).to.equal(5);
    }

    @test 'indexOf returns -1 for pitches out of scale'() {
        const scale = ScaleTemplate.major.create(0);
        expect(scale.indexOf(1)).to.equal(-1);
        expect(scale.indexOf(6)).to.equal(-1);
        expect(scale.indexOf(10)).to.equal(-1);
    }
}