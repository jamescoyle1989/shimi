import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import ScaleTemplate from '../src/ScaleTemplate';
import Scale, { PitchName } from '../src/Scale';
import { FitDirection } from '../src/IPitchContainer';


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
        expect(scale.name).to.equal('F♯ Phrygian');
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
        expect(new PitchName(61, 'C', 1).toString()).to.equal('C♯');
        expect(new PitchName(61, 'D', -1).toString()).to.equal('D♭');
        expect(new PitchName(60, 'D', -2).toString()).to.equal('D𝄫');
        expect(new PitchName(62, 'C', 2).toString()).to.equal('C𝄪');
    }

    @test 'getPitchNamesForMajorRoot returns correct values for C'() {
        const results = Scale['_getPitchNamesForMajorRoot'](0);
        expect(results.length).to.equal(12);
        expect(results[0].toString()).to.equal('C');
        expect(results[1].toString()).to.equal('C♯');
        expect(results[2].toString()).to.equal('D');
        expect(results[3].toString()).to.equal('E♭');
        expect(results[4].toString()).to.equal('E');
        expect(results[5].toString()).to.equal('F');
        expect(results[6].toString()).to.equal('F♯');
        expect(results[7].toString()).to.equal('G');
        expect(results[8].toString()).to.equal('G♯');
        expect(results[9].toString()).to.equal('A');
        expect(results[10].toString()).to.equal('B♭');
        expect(results[11].toString()).to.equal('B');
    }

    @test 'getPitchNamesForMajorRoot returns correct values for F#'() {
        const results = Scale['_getPitchNamesForMajorRoot'](6);
        expect(results.length).to.equal(12);
        expect(results[0].toString()).to.equal('B♯');
        expect(results[1].toString()).to.equal('C♯');
        expect(results[2].toString()).to.equal('D♮');
        expect(results[3].toString()).to.equal('D♯');
        expect(results[4].toString()).to.equal('E♮');
        expect(results[5].toString()).to.equal('E♯');
        expect(results[6].toString()).to.equal('F♯');
        expect(results[7].toString()).to.equal('G♮');
        expect(results[8].toString()).to.equal('G♯');
        expect(results[9].toString()).to.equal('A♮');
        expect(results[10].toString()).to.equal('A♯');
        expect(results[11].toString()).to.equal('B');
    }

    @test 'getPitchNamesForMajorRoot returns correct values for Db'() {
        const results = Scale['_getPitchNamesForMajorRoot'](1);
        expect(results.length).to.equal(12);
        expect(results[0].toString()).to.equal('C');
        expect(results[1].toString()).to.equal('D♭');
        expect(results[2].toString()).to.equal('D♮');
        expect(results[3].toString()).to.equal('E♭');
        expect(results[4].toString()).to.equal('F♭');
        expect(results[5].toString()).to.equal('F');
        expect(results[6].toString()).to.equal('G♭');
        expect(results[7].toString()).to.equal('G♮');
        expect(results[8].toString()).to.equal('A♭');
        expect(results[9].toString()).to.equal('A♮');
        expect(results[10].toString()).to.equal('B♭');
        expect(results[11].toString()).to.equal('C♭');
    }

    @test 'getPitchName returns correct values for melodic minor'() {
        const scale = ScaleTemplate.harmonicMinor.create(-3);
        expect(scale.getPitchName(0)).to.equal('C');
        expect(scale.getPitchName(1)).to.equal('C♯');
        expect(scale.getPitchName(2)).to.equal('D');
        expect(scale.getPitchName(3)).to.equal('E♭');
        expect(scale.getPitchName(4)).to.equal('E');
        expect(scale.getPitchName(5)).to.equal('F');
        expect(scale.getPitchName(6)).to.equal('F♯');
        expect(scale.getPitchName(7)).to.equal('G');
        expect(scale.getPitchName(8)).to.equal('G♯');
        expect(scale.getPitchName(9)).to.equal('A');
        expect(scale.getPitchName(10)).to.equal('B♭');
        expect(scale.getPitchName(11)).to.equal('B');
    }

    @test 'getPitchName returns correct values for Db with octaves'() {
        const scale = ScaleTemplate.major.create(1);
        expect(scale.getPitchName(0, true)).to.equal('C-1');
        expect(scale.getPitchName(1, true)).to.equal('D♭-1');
        expect(scale.getPitchName(14, true)).to.equal('D♮0');
        expect(scale.getPitchName(15, true)).to.equal('E♭0');
        expect(scale.getPitchName(28, true)).to.equal('F♭1');
        expect(scale.getPitchName(29, true)).to.equal('F1');
        expect(scale.getPitchName(42, true)).to.equal('G♭2');
        expect(scale.getPitchName(43, true)).to.equal('G♮2');
        expect(scale.getPitchName(56, true)).to.equal('A♭3');
        expect(scale.getPitchName(57, true)).to.equal('A♮3');
        expect(scale.getPitchName(70, true)).to.equal('B♭4');
        expect(scale.getPitchName(71, true)).to.equal('C♭4');
    }

    @test 'getDominantScale returns scale perfect 5th above'() {
        const scale1 = ScaleTemplate.major.create(0);
        const scale2 = scale1.getDominantScale();
        expect(scale2.root).to.equal(7);
        expect(scale2.template).to.equal(scale1.template);
    }

    @test 'getSubdominantScale returns scale perfect 4th above'() {
        const scale1 = ScaleTemplate.major.create(0);
        const scale2 = scale1.getSubdominantScale();
        expect(scale2.root).to.equal(5);
        expect(scale2.template).to.equal(scale1.template);
    }

    @test 'getRelativeScale uses relativityToMajor correctly'() {
        const scale1 = ScaleTemplate.lydian.create(5);
        const scale2 = scale1.getRelativeScale(ScaleTemplate.harmonicMinor);
        expect(scale2.root).to.equal(9);
        expect(scale2.template).to.equal(ScaleTemplate.harmonicMinor);
    }

    @test 'getRelativeScale returns this if template matches template of current scale'() {
        const scale1 = ScaleTemplate.mixolydian.create(7);
        const scale2 = scale1.getRelativeScale(ScaleTemplate.mixolydian);
        expect(scale1).to.equal(scale2);
    }

    @test 'getParallelScale returns new scale with same root'() {
        const scale1 = ScaleTemplate.lydian.create(5);
        const scale2 = scale1.getParallelScale(ScaleTemplate.harmonicMinor);
        expect(scale2.root).to.equal(5);
        expect(scale2.template).to.equal(ScaleTemplate.harmonicMinor);
    }

    @test 'getParallelScale returns this if template matches template of current scale'() {
        const scale1 = ScaleTemplate.mixolydian.create(7);
        const scale2 = scale1.getParallelScale(ScaleTemplate.mixolydian);
        expect(scale1).to.equal(scale2);
    }

    @test 'fitPitch retains integers in scale'() {
        const scale = ScaleTemplate.major.create(0);
        expect(scale.fitPitch(40)).to.equal(40);
    }

    @test 'fitPitch corrects integers out of scale'() {
        const scale = ScaleTemplate.major.create(0);
        expect([38, 40]).to.contain(scale.fitPitch(39));
    }

    @test 'fitPitch corrects equidistant decimals'() {
        const scale = ScaleTemplate.major.create(0);
        expect([40, 41]).to.contain(scale.fitPitch(40.5));
    }

    @test 'fitPitch corrects unequidistant decimals'() {
        const scale = ScaleTemplate.major.create(0);
        expect(scale.fitPitch(40.4)).to.equal(40);
    }

    @test 'fitPitch can prefer moving downwards'() {
        const scale = ScaleTemplate.major.create(0);
        expect(scale.fitPitch(39, {preferredDirection: FitDirection.down})).to.equal(38);
    }

    @test 'fitPitch can prefer moving upwards'() {
        const scale = ScaleTemplate.major.create(0);
        expect(scale.fitPitch(39, {preferredDirection: FitDirection.up})).to.equal(40);
    }

    @test 'fitPitch can prefer moving to root'() {
        const scale = ScaleTemplate.major.create(0);
        expect(scale.fitPitch(37, {preferRoot: true})).to.equal(36);
    }

    @test 'fitPitch will return input pitch rounded if nothing within maxMovement range'() {
        const scale = ScaleTemplate.majorPentatonic.create(0);
        expect(scale.fitPitch(41.5, {maxMovement: 1})).to.equal(42);
    }
}