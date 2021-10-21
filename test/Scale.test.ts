import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import ScaleTemplate from '../src/ScaleTemplate';
import Scale, { PitchName } from '../src/Scale';


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

    @test 'PitchName.toString returns correct name'() {
        expect(new PitchName(60, 'C').toString()).to.equal('C');
        expect(new PitchName(61, 'C', 1).toString()).to.equal('C#');
        expect(new PitchName(61, 'D', -1).toString()).to.equal('Db');
        expect(new PitchName(60, 'D', -2).toString()).to.equal('Dbb');
        expect(new PitchName(62, 'C', 2).toString()).to.equal('C##');
    }

    @test 'getPitchNamesForMajorRoot returns correct values for C'() {
        const results = Scale['_getPitchNamesForMajorRoot'](0);
        expect(results.length).to.equal(12);
        expect(results[0].toString()).to.equal('C');
        expect(results[1].toString()).to.equal('C#');
        expect(results[2].toString()).to.equal('D');
        expect(results[3].toString()).to.equal('Eb');
        expect(results[4].toString()).to.equal('E');
        expect(results[5].toString()).to.equal('F');
        expect(results[6].toString()).to.equal('F#');
        expect(results[7].toString()).to.equal('G');
        expect(results[8].toString()).to.equal('G#');
        expect(results[9].toString()).to.equal('A');
        expect(results[10].toString()).to.equal('Bb');
        expect(results[11].toString()).to.equal('B');
    }

    @test 'getPitchNamesForMajorRoot returns correct values for F#'() {
        const results = Scale['_getPitchNamesForMajorRoot'](6);
        expect(results.length).to.equal(12);
        expect(results[0].toString()).to.equal('B#');
        expect(results[1].toString()).to.equal('C#');
        expect(results[2].toString()).to.equal('D♮');
        expect(results[3].toString()).to.equal('D#');
        expect(results[4].toString()).to.equal('E♮');
        expect(results[5].toString()).to.equal('E#');
        expect(results[6].toString()).to.equal('F#');
        expect(results[7].toString()).to.equal('G♮');
        expect(results[8].toString()).to.equal('G#');
        expect(results[9].toString()).to.equal('A♮');
        expect(results[10].toString()).to.equal('A#');
        expect(results[11].toString()).to.equal('B');
    }

    @test 'getPitchNamesForMajorRoot returns correct values for Db'() {
        const results = Scale['_getPitchNamesForMajorRoot'](1);
        expect(results.length).to.equal(12);
        expect(results[0].toString()).to.equal('C');
        expect(results[1].toString()).to.equal('Db');
        expect(results[2].toString()).to.equal('D♮');
        expect(results[3].toString()).to.equal('Eb');
        expect(results[4].toString()).to.equal('Fb');
        expect(results[5].toString()).to.equal('F');
        expect(results[6].toString()).to.equal('Gb');
        expect(results[7].toString()).to.equal('G♮');
        expect(results[8].toString()).to.equal('Ab');
        expect(results[9].toString()).to.equal('A♮');
        expect(results[10].toString()).to.equal('Bb');
        expect(results[11].toString()).to.equal('Cb');
    }

    @test 'getPitchName returns correct values for melodic minor'() {
        const scale = ScaleTemplate.harmonicMinor.create(-3);
        expect(scale.getPitchName(0)).to.equal('C');
        expect(scale.getPitchName(1)).to.equal('C#');
        expect(scale.getPitchName(2)).to.equal('D');
        expect(scale.getPitchName(3)).to.equal('Eb');
        expect(scale.getPitchName(4)).to.equal('E');
        expect(scale.getPitchName(5)).to.equal('F');
        expect(scale.getPitchName(6)).to.equal('F#');
        expect(scale.getPitchName(7)).to.equal('G');
        expect(scale.getPitchName(8)).to.equal('G#');
        expect(scale.getPitchName(9)).to.equal('A');
        expect(scale.getPitchName(10)).to.equal('Bb');
        expect(scale.getPitchName(11)).to.equal('B');
    }
}