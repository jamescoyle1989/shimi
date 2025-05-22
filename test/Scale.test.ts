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

    @test 'constructor can take string value of pitch'() {
        const scale = new Scale(ScaleTemplate.major, 'D');
        expect(scale.root).to.equal(2);
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

    @test 'degreeOf returns degree of pitch in scale'() {
        const scale = ScaleTemplate.major.create(0);
        expect(scale.degreeOf(0)).to.equal(1);
        expect(scale.degreeOf(4)).to.equal(3);
        expect(scale.degreeOf(5)).to.equal(4);
        expect(scale.degreeOf(9)).to.equal(6);
    }

    @test 'degreeOf returns -1 for pitches out of scale'() {
        const scale = ScaleTemplate.major.create(0);
        expect(scale.degreeOf(1)).to.equal(-1);
        expect(scale.degreeOf(6)).to.equal(-1);
        expect(scale.degreeOf(10)).to.equal(-1);
    }

    @test 'PitchName.toString returns correct name'() {
        expect(new PitchName(60, 'C').toString()).to.equal('C');
        expect(new PitchName(61, 'C', 1).toString()).to.equal('C♯');
        expect(new PitchName(61, 'D', -1).toString()).to.equal('D♭');
        expect(new PitchName(60, 'D', -2).toString()).to.equal('D𝄫');
        expect(new PitchName(62, 'C', 2).toString()).to.equal('C𝄪');
    }

    @test 'C major has correct pitch names'() {
        const scale = ScaleTemplate.major.create(0);
        expect(scale.getPitchName(0)).to.equal('C');
        expect(scale.getPitchName(1)).to.equal('D♭');
        expect(scale.getPitchName(2)).to.equal('D');
        expect(scale.getPitchName(3)).to.equal('E♭');
        expect(scale.getPitchName(4)).to.equal('E');
        expect(scale.getPitchName(5)).to.equal('F');
        expect(scale.getPitchName(6)).to.equal('F♯');
        expect(scale.getPitchName(7)).to.equal('G');
        expect(scale.getPitchName(8)).to.equal('A♭');
        expect(scale.getPitchName(9)).to.equal('A');
        expect(scale.getPitchName(10)).to.equal('B♭');
        expect(scale.getPitchName(11)).to.equal('B');
    }

    @test 'C# minor has correct octave when getting pitch names'() {
        const scale = ScaleTemplate.harmonicMinor.create(1);
        expect(scale.getPitchName(24, true)).to.equal('B♯0');
        expect(scale.getPitchName(25, true)).to.equal('C♯1');
        expect(scale.getPitchName(26, true)).to.equal('D♮1');
        expect(scale.getPitchName(27, true)).to.equal('D♯1');
        expect(scale.getPitchName(28, true)).to.equal('E1');
        expect(scale.getPitchName(29, true)).to.equal('F♮1');
        expect(scale.getPitchName(30, true)).to.equal('F♯1');
        expect(scale.getPitchName(31, true)).to.equal('G♮1');
        expect(scale.getPitchName(32, true)).to.equal('G♯1');
        expect(scale.getPitchName(33, true)).to.equal('A1');
        expect(scale.getPitchName(34, true)).to.equal('A♯1');
        expect(scale.getPitchName(35, true)).to.equal('B♮1');
        expect(scale.getPitchName(36, true)).to.equal('B♯1');
    }

    @test 'Gb major has correct pitch names'() {
        const scale = ScaleTemplate.major.create(6);
        expect(scale.getPitchName(0)).to.equal('C♮');
        expect(scale.getPitchName(1)).to.equal('D♭');
        expect(scale.getPitchName(2)).to.equal('D♮');
        expect(scale.getPitchName(3)).to.equal('E♭');
        expect(scale.getPitchName(4)).to.equal('E♮');
        expect(scale.getPitchName(5)).to.equal('F');
        expect(scale.getPitchName(6)).to.equal('G♭');
        expect(scale.getPitchName(7)).to.equal('G♮');
        expect(scale.getPitchName(8)).to.equal('A♭');
        expect(scale.getPitchName(9)).to.equal('A♮');
        expect(scale.getPitchName(10)).to.equal('B♭');
        expect(scale.getPitchName(11)).to.equal('C♭');
    }

    @test 'Db major has correct pitch names'() {
        const scale = ScaleTemplate.major.create(1);
        expect(scale.getPitchName(0)).to.equal('C');
        expect(scale.getPitchName(1)).to.equal('D♭');
        expect(scale.getPitchName(2)).to.equal('D♮');
        expect(scale.getPitchName(3)).to.equal('E♭');
        expect(scale.getPitchName(4)).to.equal('E♮');
        expect(scale.getPitchName(5)).to.equal('F');
        expect(scale.getPitchName(6)).to.equal('G♭');
        expect(scale.getPitchName(7)).to.equal('G♮');
        expect(scale.getPitchName(8)).to.equal('A♭');
        expect(scale.getPitchName(9)).to.equal('A♮');
        expect(scale.getPitchName(10)).to.equal('B♭');
        expect(scale.getPitchName(11)).to.equal('B♮');
    }

    @test 'A harmonic minor has correct pitch names'() {
        const scale = ScaleTemplate.harmonicMinor.create(-3);
        expect(scale.getPitchName(0)).to.equal('C');
        expect(scale.getPitchName(1)).to.equal('C♯');
        expect(scale.getPitchName(2)).to.equal('D');
        expect(scale.getPitchName(3)).to.equal('D♯');
        expect(scale.getPitchName(4)).to.equal('E');
        expect(scale.getPitchName(5)).to.equal('F');
        expect(scale.getPitchName(6)).to.equal('F♯');
        expect(scale.getPitchName(7)).to.equal('G♮');
        expect(scale.getPitchName(8)).to.equal('G♯');
        expect(scale.getPitchName(9)).to.equal('A');
        expect(scale.getPitchName(10)).to.equal('B♭');
        expect(scale.getPitchName(11)).to.equal('B');
    }

    @test 'F# natural minor has correct pitch names'() {
        const scale = ScaleTemplate.naturalMinor.create(6);
        expect(scale.getPitchName(0)).to.equal('C♮');
        expect(scale.getPitchName(1)).to.equal('C♯');
        expect(scale.getPitchName(2)).to.equal('D');
        expect(scale.getPitchName(3)).to.equal('D♯');
        expect(scale.getPitchName(4)).to.equal('E');
        expect(scale.getPitchName(5)).to.equal('E♯');
        expect(scale.getPitchName(6)).to.equal('F♯');
        expect(scale.getPitchName(7)).to.equal('G♮');
        expect(scale.getPitchName(8)).to.equal('G♯');
        expect(scale.getPitchName(9)).to.equal('A');
        expect(scale.getPitchName(10)).to.equal('A♯');
        expect(scale.getPitchName(11)).to.equal('B');
    }

    @test 'G# natural minor has correct pitch names'() {
        const scale = ScaleTemplate.naturalMinor.create(8);
        expect(scale.getPitchName(0)).to.equal('C♮');
        expect(scale.getPitchName(1)).to.equal('C♯');
        expect(scale.getPitchName(2)).to.equal('D♮');
        expect(scale.getPitchName(3)).to.equal('D♯');
        expect(scale.getPitchName(4)).to.equal('E');
        expect(scale.getPitchName(5)).to.equal('F♮');
        expect(scale.getPitchName(6)).to.equal('F♯');
        expect(scale.getPitchName(7)).to.equal('F𝄪');
        expect(scale.getPitchName(8)).to.equal('G♯');
        expect(scale.getPitchName(9)).to.equal('A♮');
        expect(scale.getPitchName(10)).to.equal('A♯');
        expect(scale.getPitchName(11)).to.equal('B');
    }

    @test 'F# harmonic minor has correct pitch names'() {
        const scale = ScaleTemplate.harmonicMinor.create(6);
        expect(scale.getPitchName(0)).to.equal('C♮');
        expect(scale.getPitchName(1)).to.equal('C♯');
        expect(scale.getPitchName(2)).to.equal('D');
        expect(scale.getPitchName(3)).to.equal('D♯');
        expect(scale.getPitchName(4)).to.equal('E♮');
        expect(scale.getPitchName(5)).to.equal('E♯');
        expect(scale.getPitchName(6)).to.equal('F♯');
        expect(scale.getPitchName(7)).to.equal('G♮');
        expect(scale.getPitchName(8)).to.equal('G♯');
        expect(scale.getPitchName(9)).to.equal('A');
        expect(scale.getPitchName(10)).to.equal('A♯');
        expect(scale.getPitchName(11)).to.equal('B');
    }

    @test 'G harmonic minor has correct pitch names'() {
        const scale = ScaleTemplate.harmonicMinor.create(7);
        expect(scale.getPitchName(0)).to.equal('C');
        expect(scale.getPitchName(1)).to.equal('D♭');
        expect(scale.getPitchName(2)).to.equal('D');
        expect(scale.getPitchName(3)).to.equal('E♭');
        expect(scale.getPitchName(4)).to.equal('E♮');
        expect(scale.getPitchName(5)).to.equal('F♮');
        expect(scale.getPitchName(6)).to.equal('F♯');
        expect(scale.getPitchName(7)).to.equal('G');
        expect(scale.getPitchName(8)).to.equal('A♭');
        expect(scale.getPitchName(9)).to.equal('A');
        expect(scale.getPitchName(10)).to.equal('B♭');
        expect(scale.getPitchName(11)).to.equal('B♮');
    }

    @test 'Eb harmonic minor has correct pitch names'() {
        const scale = ScaleTemplate.harmonicMinor.create(3);
        expect(scale.getPitchName(0)).to.equal('C♮');
        expect(scale.getPitchName(1)).to.equal('D♭');
        expect(scale.getPitchName(2)).to.equal('D');
        expect(scale.getPitchName(3)).to.equal('E♭');
        expect(scale.getPitchName(4)).to.equal('E♮');
        expect(scale.getPitchName(5)).to.equal('F');
        expect(scale.getPitchName(6)).to.equal('G♭');
        expect(scale.getPitchName(7)).to.equal('G♮');
        expect(scale.getPitchName(8)).to.equal('A♭');
        expect(scale.getPitchName(9)).to.equal('A♮');
        expect(scale.getPitchName(10)).to.equal('B♭');
        expect(scale.getPitchName(11)).to.equal('C♭');
    }

    @test 'Db major has correct pitch names with octaves'() {
        const scale = ScaleTemplate.major.create(1);
        expect(scale.getPitchName(0, true)).to.equal('C-1');
        expect(scale.getPitchName(1, true)).to.equal('D♭-1');
        expect(scale.getPitchName(14, true)).to.equal('D♮0');
        expect(scale.getPitchName(15, true)).to.equal('E♭0');
        expect(scale.getPitchName(28, true)).to.equal('E♮1');
        expect(scale.getPitchName(29, true)).to.equal('F1');
        expect(scale.getPitchName(42, true)).to.equal('G♭2');
        expect(scale.getPitchName(43, true)).to.equal('G♮2');
        expect(scale.getPitchName(56, true)).to.equal('A♭3');
        expect(scale.getPitchName(57, true)).to.equal('A♮3');
        expect(scale.getPitchName(70, true)).to.equal('B♭4');
        expect(scale.getPitchName(71, true)).to.equal('B♮4');
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

    @test 'getTransposedScale returns new scale with different root'() {
        const scale1 = ScaleTemplate.major.create(0);
        const scale2 = scale1.getTransposedScale(1);
        expect(scale2.root).to.equal(1);
        expect(scale2.template).to.equal(scale1.template);
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
        expect(scale.fitPitch(39, {preferredDirection: 'DOWN'})).to.equal(38);
    }

    @test 'fitPitch can prefer moving upwards'() {
        const scale = ScaleTemplate.major.create(0);
        expect(scale.fitPitch(39, {preferredDirection: 'UP'})).to.equal(40);
    }

    @test 'fitPitch can prefer moving to root'() {
        const scale = ScaleTemplate.major.create(0);
        expect(scale.fitPitch(37, {preferRoot: true})).to.equal(36);
    }

    @test 'fitPitch will return input pitch rounded if nothing within maxMovement range'() {
        const scale = ScaleTemplate.majorPentatonic.create(0);
        expect(scale.fitPitch(41.5, {maxMovement: 1})).to.equal(42);
    }

    @test 'getPitchByDegree allows fetching pitch of scale degree with non-zero indexing'() {
        const scale = ScaleTemplate.major.create(7);
        expect(scale.getPitchByDegree(2)).to.equal(9);
    }

    @test 'getPitchByDegree maps degrees outside of the scale range to within the scale range'() {
        const scale = ScaleTemplate.major.create(0);
        expect(scale.getPitchByDegree(0)).to.equal(-1);
        expect(scale.getPitchByDegree(9)).to.equal(14);
        expect(scale.getPitchByDegree(-2)).to.equal(-5);
        expect(scale.getPitchByDegree(12)).to.equal(19);
    }

    @test 'getPitchByDegree allows 2nd param to specify octave'() {
        const scale = ScaleTemplate.major.create(0);
        expect(scale.getPitchByDegree(2, 1)).to.equal(26);
    }

    @test 'getPitchByDegree 2nd param works with octave shifting from first param'() {
        const scale = ScaleTemplate.major.create(0);
        expect(scale.getPitchByDegree(0, 0)).to.equal(11);
        expect(scale.getPitchByDegree(9, 1)).to.equal(38);
        expect(scale.getPitchByDegree(-2, 2)).to.equal(31);
        expect(scale.getPitchByDegree(12, 3)).to.equal(67);
    }

    @test 'getPitchByDegree doesnt cause pitch jumping when moving up from B to C'() {
        const scale = ScaleTemplate.major.create(7);
        expect(scale.getPitchByDegree(3)).to.equal(11);
        expect(scale.getPitchByDegree(4)).to.equal(12);
    }

    @test 'getPitchByDegree(x).toOctave(y) acts the same as degreeInOctave(x, y) used to'() {
        const scale = ScaleTemplate.major.create(7);
        expect(scale.getPitchByDegree(1).toOctave(0)).to.equal(19);
        expect(scale.getPitchByDegree(2).toOctave(0)).to.equal(21);
        expect(scale.getPitchByDegree(3).toOctave(0)).to.equal(23);
        expect(scale.getPitchByDegree(4).toOctave(0)).to.equal(12);
        expect(scale.getPitchByDegree(5).toOctave(0)).to.equal(14);
        expect(scale.getPitchByDegree(6).toOctave(0)).to.equal(16);
        expect(scale.getPitchByDegree(7).toOctave(0)).to.equal(18);

        expect(scale.getPitchByDegree(0).toOctave(0)).to.equal(18);
        expect(scale.getPitchByDegree(-1).toOctave(0)).to.equal(16);

        expect(scale.getPitchByDegree(8).toOctave(0)).to.equal(19);
        expect(scale.getPitchByDegree(9).toOctave(0)).to.equal(21);
    }

    @test 'getPitchByDegree().near() allows fetching a pitch of the same class near another pitch'() {
        const scale = ScaleTemplate.major.create(0);
        expect(scale.getPitchByDegree(3).near(50)).to.equal(52);
    }

    @test 'pitchesInRange returns all pitches in the scale within the given pitch inclusive range'() {
        const scale = ScaleTemplate.major.create(0);
        const pitches = scale.pitchesInRange(0, 11);
        expect(pitches.length).to.equal(7);
        expect(pitches[0]).to.equal(0);
        expect(pitches[1]).to.equal(2);
        expect(pitches[2]).to.equal(4);
        expect(pitches[3]).to.equal(5);
        expect(pitches[4]).to.equal(7);
        expect(pitches[5]).to.equal(9);
        expect(pitches[6]).to.equal(11);
    }

    @test 'pitchesInRange works the same if parameter order is swapped'() {
        const scale = ScaleTemplate.major.create(0);
        const pitches = scale.pitchesInRange(11, 0);
        expect(pitches.length).to.equal(7);
        expect(pitches[0]).to.equal(0);
        expect(pitches[1]).to.equal(2);
        expect(pitches[2]).to.equal(4);
        expect(pitches[3]).to.equal(5);
        expect(pitches[4]).to.equal(7);
        expect(pitches[5]).to.equal(9);
        expect(pitches[6]).to.equal(11);
    }

    @test 'pitchesInRange returns pitches in ascending order'() {
        const scale = ScaleTemplate.major.create(7);
        const pitches = scale.pitchesInRange(16, 27);
        expect(pitches.length).to.equal(7);
        expect(pitches[0]).to.equal(16);
        expect(pitches[1]).to.equal(18);
        expect(pitches[2]).to.equal(19);
        expect(pitches[3]).to.equal(21);
        expect(pitches[4]).to.equal(23);
        expect(pitches[5]).to.equal(24);
        expect(pitches[6]).to.equal(26);
    }

    @test 'pitchesInRange doesnt mutate pitches array'() {
        const scale1 = ScaleTemplate.major.create(7);
        const scale2 = ScaleTemplate.major.create(7);
        scale1.pitchesInRange(0, 11);
        expect(scale1.pitches[0]).to.equal(scale2.pitches[0]);
        expect(scale1.pitches[1]).to.equal(scale2.pitches[1]);
        expect(scale1.pitches[2]).to.equal(scale2.pitches[2]);
        expect(scale1.pitches[3]).to.equal(scale2.pitches[3]);
        expect(scale1.pitches[4]).to.equal(scale2.pitches[4]);
        expect(scale1.pitches[5]).to.equal(scale2.pitches[5]);
        expect(scale1.pitches[6]).to.equal(scale2.pitches[6]);
    }

    @test 'contains can take pitch string'() {
        const scale = ScaleTemplate.major.create(0);
        expect(scale.contains('G')).to.be.true;
        expect(scale.contains('Ab')).to.be.false;
    }

    @test 'getPitchName can take pitch string'() {
        const scale = ScaleTemplate.major.create(0);
        expect(scale.getPitchName('Fb')).to.equal('E');
    }

    @test 'pitchesInRange can take pitch strings'() {
        const scale = ScaleTemplate.major.create(0);
        const pitches = scale.pitchesInRange('C0', 'G0');
        expect(pitches.length).to.equal(5);
    }

    @test 'fitPitch can take pitch string'() {
        const scale = ScaleTemplate.harmonicMinor.create(0);
        expect(scale.fitPitch('A0')).to.equal(20);
    }
}