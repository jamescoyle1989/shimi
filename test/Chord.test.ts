import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import Chord from '../src/Chord';
import ChordFinder from '../src/ChordFinder';
import { FitPitchOptions } from '../src/IPitchContainer';
import ScaleTemplate from '../src/ScaleTemplate';


//Setup
const scale = ScaleTemplate.major.create(0);
const suggester = new ChordFinder().withDefaultChordLookups();
Chord.nameGenerator = (chord: Chord) => {
    const result = suggester.findChord(chord.pitches, chord.root, null, scale);
    if (result == null)
        return null;
    return result.name
        .replace('{r}', scale.getPitchName(result.root))
        .replace('{b}', scale.getPitchName(result.bass));
};


@suite class ChordTests {
    @test 'addPitch adds new pitch'() {
        const chord = new Chord().addPitch(19);
        expect(chord.pitches.length).to.equal(1);
        expect(chord.pitches[0]).to.equal(19);
    }

    @test 'addPitch doesnt add duplicates'() {
        const chord = new Chord().addPitch(20).addPitch(20);
        expect(chord.pitches.length).to.equal(1);
        expect(chord.pitches[0]).to.equal(20);
    }

    @test 'addPitches adds new pitches'() {
        const chord = new Chord().addPitches([0, 4, 7]);
        expect(chord.pitches.length).to.equal(3);
        expect(chord.pitches[0]).to.equal(0);
        expect(chord.pitches[1]).to.equal(4);
        expect(chord.pitches[2]).to.equal(7);
    }

    @test 'addPitches doesnt add duplicates'() {
        const chord = new Chord().addPitches([12, 19, 19]);
        expect(chord.pitches.length).to.equal(2);
        expect(chord.pitches[0]).to.equal(12);
        expect(chord.pitches[1]).to.equal(19);
    }

    @test 'removePitches removes pitches matching condition'() {
        const chord = new Chord().addPitches([12, 16, 19]).removePitches(p => p < 17);
        expect(chord.pitches.length).to.equal(1);
        expect(chord.pitches[0]).to.equal(19);
    }

    @test 'removePitches can unset root'() {
        const chord = new Chord().addPitches([12, 16, 19]).setRoot(12);
        expect(chord.pitches.length).to.equal(3);
        expect(chord.root).to.equal(12);
        chord.removePitches(x => x == 12);
        expect(chord.pitches.length).to.equal(2);
        expect(chord.root).to.equal(null);
    }

    @test 'setRoot adds pitch if chord doesnt contain root'() {
        const chord = new Chord().setRoot(12);
        expect(chord.root).to.equal(12);
        expect(chord.pitches.length).to.equal(1);
        expect(chord.pitches[0]).to.equal(12);
    }

    @test 'contains returns true if pitch matches but in different octave'() {
        const chord = new Chord().addPitches([24, 28, 31]);
        expect(chord.contains(24)).to.be.true;
        expect(chord.contains(36)).to.be.true;
        expect(chord.contains(25)).to.be.false;
        expect(chord.contains(31)).to.be.true;
    }

    @test 'fitPitch retains integers in chord'() {
        const chord = new Chord().addPitches([12, 16, 19]);
        expect(chord.fitPitch(28)).to.equal(28);
    }

    @test 'fitPitch corrects integers out of chord'() {
        const chord = new Chord().addPitches([12, 16, 19]);
        expect(chord.fitPitch(29)).to.equal(28);
    }

    @test 'fitPitch corrects equidistant decimals'() {
        const chord = new Chord().addPitches([12, 16, 19]);
        expect([16, 19]).to.contain(chord.fitPitch(17.5));
    }

    @test 'fitPitch corrects unequidistant decimals'() {
        const chord = new Chord().addPitches([12, 16, 19]);
        expect(chord.fitPitch(17.3)).to.equal(16);
    }

    @test 'fitPitch can prefer moving downwards'() {
        const chord = new Chord().addPitches([12, 15, 19]);
        expect(chord.fitPitch(17, {preferredDirection: 'DOWN'})).to.equal(15);
    }

    @test 'fitPitch can prefer moving upwards'() {
        const chord = new Chord().addPitches([12, 15, 19]);
        expect(chord.fitPitch(17, {preferredDirection: 'UP'})).to.equal(19);
    }

    @test 'fitPitch can prefer moving to root'() {
        const chord = new Chord().addPitches([12, 16, 19]);
        expect(chord.fitPitch(14, {preferRoot: true})).to.equal(12);
    }

    @test 'fitPitch will return input pitch rounded if nothing within maxMovement range'() {
        const chord = new Chord().addPitches([12, 16, 19]);
        expect(chord.fitPitch(17.5, {maxMovement: 1})).to.equal(18);
    }

    @test 'fitPitch can do medium fit with scale'() {
        const chord = new Chord().addPitches([12, 16, 19]);
        const scale = ScaleTemplate.major.create(0);
        expect(chord.fitPitch(12.5, {precision: 'MEDIUM', scale: scale})).to.equal(12);
        expect(chord.fitPitch(13, {precision: 'MEDIUM', scale: scale})).to.equal(12);
        expect(chord.fitPitch(13.5, {precision: 'MEDIUM', scale: scale})).to.equal(14);
    }

    @test '_isTightFit returns expected results'() {
        const chord = new Chord().addPitches([12, 16, 19]);
        expect(chord['_isTightFit'](24, new FitPitchOptions({}))).to.equal(1);
        expect(chord['_isTightFit'](25, new FitPitchOptions({}))).to.equal(0);
        expect(chord['_isTightFit'](26, new FitPitchOptions({}))).to.equal(0);
        expect(chord['_isTightFit'](27, new FitPitchOptions({}))).to.equal(0);
        expect(chord['_isTightFit'](28, new FitPitchOptions({}))).to.equal(1);
        expect(chord['_isTightFit'](29, new FitPitchOptions({}))).to.equal(0);
        expect(chord['_isTightFit'](30, new FitPitchOptions({}))).to.equal(0);
        expect(chord['_isTightFit'](31, new FitPitchOptions({}))).to.equal(1);
        expect(chord['_isTightFit'](32, new FitPitchOptions({}))).to.equal(0);
        expect(chord['_isTightFit'](33, new FitPitchOptions({}))).to.equal(0);
        expect(chord['_isTightFit'](34, new FitPitchOptions({}))).to.equal(0);
        expect(chord['_isTightFit'](35, new FitPitchOptions({}))).to.equal(0);
    }

    @test '_isMediumFit returns expected results without scale'() {
        const chord = new Chord().addPitches([12, 16, 19]);
        expect(chord['_isMediumFit'](24, new FitPitchOptions({}))).to.equal(1);
        expect(chord['_isMediumFit'](25, new FitPitchOptions({}))).to.equal(0);
        expect(chord['_isMediumFit'](26, new FitPitchOptions({}))).to.equal(0.5);
        expect(chord['_isMediumFit'](27, new FitPitchOptions({}))).to.equal(0);
        expect(chord['_isMediumFit'](28, new FitPitchOptions({}))).to.equal(1);
        expect(chord['_isMediumFit'](29, new FitPitchOptions({}))).to.equal(0);
        expect(chord['_isMediumFit'](30, new FitPitchOptions({}))).to.equal(0);
        expect(chord['_isMediumFit'](31, new FitPitchOptions({}))).to.equal(1);
        expect(chord['_isMediumFit'](32, new FitPitchOptions({}))).to.equal(0);
        expect(chord['_isMediumFit'](33, new FitPitchOptions({}))).to.equal(0.5);
        expect(chord['_isMediumFit'](34, new FitPitchOptions({}))).to.equal(0.5);
        expect(chord['_isMediumFit'](35, new FitPitchOptions({}))).to.equal(0);
    }

    @test '_isMediumFit returns expected results with scale'() {
        const chord = new Chord().addPitches([12, 16, 19]);
        const scale = ScaleTemplate.major.create(2);
        const fitPitchOptions = new FitPitchOptions({scale: scale});
        expect(chord['_isMediumFit'](24, fitPitchOptions)).to.equal(1);
        expect(chord['_isMediumFit'](25, fitPitchOptions)).to.equal(0);
        expect(chord['_isMediumFit'](26, fitPitchOptions)).to.equal(0.5);
        expect(chord['_isMediumFit'](27, fitPitchOptions)).to.equal(0);
        expect(chord['_isMediumFit'](28, fitPitchOptions)).to.equal(1);
        expect(chord['_isMediumFit'](29, fitPitchOptions)).to.equal(0);
        expect(chord['_isMediumFit'](30, fitPitchOptions)).to.equal(0);
        expect(chord['_isMediumFit'](31, fitPitchOptions)).to.equal(1);
        expect(chord['_isMediumFit'](32, fitPitchOptions)).to.equal(0);
        expect(chord['_isMediumFit'](33, fitPitchOptions)).to.equal(0.5);
        expect(chord['_isMediumFit'](34, fitPitchOptions)).to.equal(0);
        expect(chord['_isMediumFit'](35, fitPitchOptions)).to.equal(0);
    }

    @test '_isLooseFit returns expected results without scale'() {
        const chord = new Chord().addPitches([12, 16, 19]);
        expect(chord['_isLooseFit'](24, new FitPitchOptions({}))).to.equal(1);
        expect(chord['_isLooseFit'](25, new FitPitchOptions({}))).to.equal(0.5);
        expect(chord['_isLooseFit'](26, new FitPitchOptions({}))).to.equal(0.5);
        expect(chord['_isLooseFit'](27, new FitPitchOptions({}))).to.equal(0.5);
        expect(chord['_isLooseFit'](28, new FitPitchOptions({}))).to.equal(1);
        expect(chord['_isLooseFit'](29, new FitPitchOptions({}))).to.equal(0.5);
        expect(chord['_isLooseFit'](30, new FitPitchOptions({}))).to.equal(0.5);
        expect(chord['_isLooseFit'](31, new FitPitchOptions({}))).to.equal(1);
        expect(chord['_isLooseFit'](32, new FitPitchOptions({}))).to.equal(0.5);
        expect(chord['_isLooseFit'](33, new FitPitchOptions({}))).to.equal(0.5);
        expect(chord['_isLooseFit'](34, new FitPitchOptions({}))).to.equal(0.5);
        expect(chord['_isLooseFit'](35, new FitPitchOptions({}))).to.equal(0.5);
    }

    @test '_isLooseFit returns expected results with scale'() {
        const chord = new Chord().addPitches([12, 16, 19]);
        const scale = ScaleTemplate.major.create(2);
        const fitPitchOptions = new FitPitchOptions({scale: scale});
        expect(chord['_isLooseFit'](24, fitPitchOptions)).to.equal(1);
        expect(chord['_isLooseFit'](25, fitPitchOptions)).to.equal(0.5);
        expect(chord['_isLooseFit'](26, fitPitchOptions)).to.equal(0.5);
        expect(chord['_isLooseFit'](27, fitPitchOptions)).to.equal(0);
        expect(chord['_isLooseFit'](28, fitPitchOptions)).to.equal(1);
        expect(chord['_isLooseFit'](29, fitPitchOptions)).to.equal(0);
        expect(chord['_isLooseFit'](30, fitPitchOptions)).to.equal(0.5);
        expect(chord['_isLooseFit'](31, fitPitchOptions)).to.equal(1);
        expect(chord['_isLooseFit'](32, fitPitchOptions)).to.equal(0);
        expect(chord['_isLooseFit'](33, fitPitchOptions)).to.equal(0.5);
        expect(chord['_isLooseFit'](34, fitPitchOptions)).to.equal(0);
        expect(chord['_isLooseFit'](35, fitPitchOptions)).to.equal(0.5);
    }

    @test 'name gets set only when calling getter'() {
        const chord = new Chord().addPitches([15, 18, 22]);
        expect(chord['_name']).to.be.null;
        expect(chord.name).to.equal('E♭m');
        expect(chord['_name']).to.equal('E♭m');
    }

    @test 'name gets cleared when new pitches added'() {
        const chord = new Chord().addPitches([13, 17, 20]);
        expect(chord.name).to.equal('D♭');
        chord.addPitch(23);
        expect(chord['_name']).to.be.null;
    }

    @test 'name gets cleared when pitches removed'() {
        const chord = new Chord().addPitches([17, 21, 24]);
        expect(chord.name).to.equal('F');
        chord.removePitches(p => p == 21);
        expect(chord['_name']).to.be.null;
    }

    @test 'name gets cleared when setting root'() {
        const chord = new Chord().addPitches([19, 23, 26]);
        expect(chord.name).to.equal('G');
        chord.root = 19;
        expect(chord['_name']).to.be.null;
    }

    @test 'getPitchByIndex returns same as index for 0 - length-1'() {
        const chord = new Chord().addPitches([5, 9, 12, 15]);
        for (let i = 0; i < chord.pitches.length; i++)
            expect(chord.pitches[i]).to.equal(chord.getPitchByIndex(i));
    }

    @test 'getPitchByIndex returns stuff up octaves if index above length-1'() {
        const chord = new Chord().addPitches([5, 9, 12, 15]);
        for (let i = 0; i < chord.pitches.length; i++) {
            expect(chord.getPitchByIndex(i + 4)).to.equal(chord.pitches[i] + 12);
            expect(chord.getPitchByIndex(i + 8)).to.equal(chord.pitches[i] + 24);
        }
    }

    @test 'getPitchByIndex returns stuff down octaves if index less than 0'() {
        const chord = new Chord().addPitches([5, 9, 12, 15]);
        for (let i = 0; i < chord.pitches.length; i++) {
            expect(chord.getPitchByIndex(i - 4)).to.equal(chord.pitches[i] - 12);
            expect(chord.getPitchByIndex(i - 8)).to.equal(chord.pitches[i] - 24);
        }
    }


    @test 'getPitchByDegree(1) returns root'() {
        const chord = new Chord().setRoot(12).addPitches([16, 19]);
        expect(chord.getPitchByDegree(1)).to.equal(12);
    }

    @test 'getPitchByDegree throws error if root not set'() {
        const chord = new Chord().addPitches([12, 16, 19]);
        expect(() => chord.getPitchByDegree(1)).to.throw();
    }

    @test 'getPitchByDegree(3) returns major or minor 3rd'() {
        const chord1 = new Chord().setRoot(12).addPitches([16, 19]);
        const chord2 = new Chord().setRoot(12).addPitches([15, 19]);
        expect(chord1.getPitchByDegree(3)).to.equal(16);
        expect(chord2.getPitchByDegree(3)).to.equal(15);
    }

    @test 'getPitchByDegree(3) will attempt to use 10th, 17th, etc'() {
        const chord = new Chord().setRoot(12).addPitches([19, 27]);
        expect(chord.getPitchByDegree(3)).to.equal(15);
    }

    @test 'getPitchByDegree(3) falls back to using scale if chord doesnt contain 3rd'() {
        const scale = ScaleTemplate.naturalMinor.create(0);
        const chord = new Chord().setRoot(12).addPitch(19);
        expect(chord.getPitchByDegree(3, scale)).to.equal(15);
    }

    @test 'getPitchByDegree(3) falls back to major if no 3rd and scale not provided'() {
        const chord = new Chord().setRoot(12).addPitch(19);
        expect(chord.getPitchByDegree(3)).to.equal(16);
    }

    @test 'getPitchByDegree(5) returns perfect or diminished 5th'() {
        const chord1 = new Chord().setRoot(12).addPitches([15, 19]);
        const chord2 = new Chord().setRoot(12).addPitches([15, 18]);
        expect(chord1.getPitchByDegree(5)).to.equal(19);
        expect(chord2.getPitchByDegree(5)).to.equal(18);
    }

    @test 'getPitchByDegree(5) will attempt to use 12th, 19th, etc.'() {
        const chord = new Chord().setRoot(12).addPitches([15, 30]);
        expect(chord.getPitchByDegree(5)).to.equal(18);
    }

    @test 'getPitchByDegree(5) falls back to using scale if chord doesnt contain 5th'() {
        const scale = ScaleTemplate.locrian.create(0);
        const chord = new Chord().setRoot(12).addPitch(15);
        expect(chord.getPitchByDegree(5, scale)).to.equal(18);
    }

    @test 'getPitchByDegree(5) falls back to perfect 5th if no 5th and scale not provided'() {
        const chord = new Chord().setRoot(12).addPitch(15);
        expect(chord.getPitchByDegree(5)).to.equal(19);
    }

    @test 'getPitchByDegree(4) always returns perfect 4th if getPitchByDegree(5) returns tritone'() {
        const chord = new Chord().setRoot(12).addPitches([15, 18]);
        expect(chord.getPitchByDegree(4)).to.equal(17);
    }

    @test 'getPitchByDegree(4) returns perfect or augmented 4th'() {
        const chord1 = new Chord().setRoot(12).addPitches([15, 17, 19]);
        const chord2 = new Chord().setRoot(12).addPitches([15, 18, 19]);
        expect(chord1.getPitchByDegree(4)).to.equal(17);
        expect(chord2.getPitchByDegree(4)).to.equal(18);
    }

    @test 'getPitchByDegree(4) will attempt to use 11th, 18th, etc.'() {
        const chord = new Chord().setRoot(12).addPitches([19, 30]);
        expect(chord.getPitchByDegree(4)).to.equal(18);
    }

    @test 'getPitchByDegree(4) falls back to using scale if chord doesnt contain 4th'() {
        const scale = ScaleTemplate.major.create(2);
        const chord = new Chord().setRoot(12).addPitch(19);
        expect(chord.getPitchByDegree(4, scale)).to.equal(18);
    }

    @test 'getPitchByDegree(4) falls back to using perfect 4th if no 4th and scale not provided'() {
        const chord = new Chord().setRoot(12);
        expect(chord.getPitchByDegree(4)).to.equal(17);
    }

    @test 'getPitchByDegree(2) returns major or minor 2nd'() {
        const chord1 = new Chord().setRoot(12).addPitches([14, 19]);
        const chord2 = new Chord().setRoot(12).addPitches([13, 19]);
        expect(chord1.getPitchByDegree(2)).to.equal(14);
        expect(chord2.getPitchByDegree(2)).to.equal(13);
    }

    @test 'getPitchByDegree(2) will attempt to use 9th, 16th, etc.'() {
        const chord = new Chord().setRoot(12).addPitches([19, 25]);
        expect(chord.getPitchByDegree(2)).to.equal(13);
    }

    @test 'getPitchByDegree(2) will always return major 2nd if no 2nd found and getPitchByDegree(3) is major 3rd'() {
        const chord = new Chord().setRoot(12).addPitches([16, 19]);
        expect(chord.getPitchByDegree(2)).to.equal(14);
    }

    @test 'getPitchByDegree(2) falls back to using scale if chord doesnt contain 2nd'() {
        const scale = ScaleTemplate.phrygian.create(0);
        const chord = new Chord().setRoot(12).addPitch(15);
        expect(chord.getPitchByDegree(2, scale)).to.equal(13);
    }

    @test 'getPitchByDegree(2) falls back to using major 2nd if no 2nd and scale not provided'() {
        const chord = new Chord().setRoot(12).addPitch(15);
        expect(chord.getPitchByDegree(2)).to.equal(14);
    }

    @test 'getPitchByDegree(7) returns major or minor 7th'() {
        const chord1 = new Chord().setRoot(12).addPitches([14, 19, 23]);
        const chord2 = new Chord().setRoot(12).addPitches([13, 19, 22]);
        expect(chord1.getPitchByDegree(7)).to.equal(23);
        expect(chord2.getPitchByDegree(7)).to.equal(22);
    }

    @test 'getPitchByDegree(7) will attempt to use 16th, 23th, etc.'() {
        const chord = new Chord().setRoot(12).addPitches([19, 35]);
        expect(chord.getPitchByDegree(7)).to.equal(23);
    }

    @test 'getPitchByDegree(7) falls back to using scale if chord doesnt contain 7th'() {
        const scale = ScaleTemplate.major.create(0);
        const chord = new Chord().setRoot(12).addPitch(19);
        expect(chord.getPitchByDegree(7, scale)).to.equal(23);
    }

    @test 'getPitchByDegree(7) falls back to minor 7th if no 7th and scale not provided'() {
        const chord = new Chord().setRoot(12).addPitch(19);
        expect(chord.getPitchByDegree(7)).to.equal(22);
    }

    @test 'getPitchByDegree(6) returns major or minor 6th'() {
        const chord1 = new Chord().setRoot(12).addPitches([14, 19, 21]);
        const chord2 = new Chord().setRoot(12).addPitches([13, 19, 20]);
        expect(chord1.getPitchByDegree(6)).to.equal(21);
        expect(chord2.getPitchByDegree(6)).to.equal(20);
    }

    @test 'getPitchByDegree(6) will attempt to use 13th, 20th, etc.'() {
        const chord = new Chord().setRoot(12).addPitches([19, 32]);
        expect(chord.getPitchByDegree(6)).to.equal(20);
    }

    @test 'getPitchByDegree(6) will return 5th + 2 if no 6th found and 4 semitones between 5th & 7th'() {
        const chord = new Chord().setRoot(12).addPitches([15, 18, 22]);
        expect(chord.getPitchByDegree(6)).to.equal(20);
    }

    @test 'getPitchByDegree(6) falls back to using scale if chord doesnt contain 6th'() {
        const scale = ScaleTemplate.naturalMinor.create(0);
        const chord = new Chord().setRoot(12).addPitch(19);
        expect(chord.getPitchByDegree(6, scale)).to.equal(20);
    }

    @test 'getPitchByDegree(6) falls back to using major 6th if no 6th and scale not provided'() {
        const chord = new Chord().setRoot(12).addPitch(19);
        expect(chord.getPitchByDegree(6)).to.equal(21);
    }

    @test 'getPitchByDegree(10) correctly handles differences between major 3rd and minor 10th'() {
        const chord = new Chord().setRoot(12).addPitches([16, 27]);
        expect(chord.getPitchByDegree(10)).to.equal(27);
    }


    @test 'addPitch places new pitches in ascending order'() {
        const chord = new Chord().addPitches([10, 12]);
        chord.addPitch(11);
        expect(chord.pitches[0]).to.equal(10);
        expect(chord.pitches[1]).to.equal(11);
        expect(chord.pitches[2]).to.equal(12);
    }

    @test 'addPitches places new pitches in ascending order'() {
        const chord = new Chord().addPitches([12, 10]);
        expect(chord.pitches[0]).to.equal(10);
        expect(chord.pitches[1]).to.equal(12);
        chord.addPitches([13, 11]);
        expect(chord.pitches[0]).to.equal(10);
        expect(chord.pitches[1]).to.equal(11);
        expect(chord.pitches[2]).to.equal(12);
        expect(chord.pitches[3]).to.equal(13);
    }

    @test 'addPitch can take a pitch name'() {
        const chord = new Chord().addPitch('C4');
        expect(chord.pitches[0]).to.equal(60);
    }

    @test 'addPitches can take a pitch names'() {
        const chord = new Chord().addPitches(['C4', 'E4']);
        expect(chord.pitches[0]).to.equal(60);
        expect(chord.pitches[1]).to.equal(64);
    }

    @test 'setRoot can take a pitch name'() {
        const chord = new Chord().setRoot('A#3');
        expect(chord.root).to.equal(58);
    }

    @test 'contains can take a pitch name'() {
        const chord = new Chord().addPitches(['C4', 'E4', 'G4']);
        expect(chord.contains('G')).to.be.true;
    }

    @test 'fitPitch can take a pitch name'() {
        const chord = new Chord().addPitches(['C4', 'E4', 'G4']);
        expect(chord.fitPitch('Ab2')).to.equal(43);
    }

    @test 'near moves chord near to target note'() {
        const chord = new Chord().addPitches([0,4,7]).near(26);
        expect(chord.pitches.length).to.equal(3);
        expect(chord.pitches[0]).to.equal(24);
        expect(chord.pitches[1]).to.equal(28);
        expect(chord.pitches[2]).to.equal(31);
    }

    @test 'near can take pitch name as parameter'() {
        const chord = new Chord().addPitches([0,4,7]).near('E1');
        expect(chord.pitches.length).to.equal(3);
        expect(chord.pitches[0]).to.equal(24);
        expect(chord.pitches[1]).to.equal(28);
        expect(chord.pitches[2]).to.equal(31);
    }

    @test 'If there are 2 equally close options for near to select, it will choose the one closest to the chords current position'() {
        const chord = new Chord().addPitches([0,3,6]).near(21);
        expect(chord.pitches.length).to.equal(3);
        expect(chord.pitches[0]).to.equal(12);
        expect(chord.pitches[1]).to.equal(15);
        expect(chord.pitches[2]).to.equal(18);
    }

    @test 'If allowInversions is true, then near will optimise for maximum closeness to the target'() {
        const chord = new Chord().addPitches([0,4,7]).near(12, true);
        expect(chord.pitches.length).to.equal(3);
        expect(chord.pitches[0]).to.equal(7);
        expect(chord.pitches[1]).to.equal(12);
        expect(chord.pitches[2]).to.equal(16);
    }

    @test 'duplicate creates a copy of the chord'() {
        const chord1 = new Chord().setRoot(36).addPitches([40, 43]);
        const chord2 = chord1.duplicate();
        expect(chord2.root).to.equal(chord1.root);
        expect(chord2.pitches.length).to.equal(chord1.pitches.length);
        for (let i = 0; i < chord2.pitches.length; i++)
            expect(chord2.pitches[i]).to.equal(chord1.pitches[i]);
        expect(chord2.name).to.equal(chord1.name);
    }

    @test 'addDegrees throws error if root not set'() {
        const chord = new Chord();
        expect(() => chord.addDegrees([3])).to.throw();
    }

    @test 'addDegrees defaults to adding major or perfect versions of degrees'() {
        const chord = new Chord().setRoot(36)
            .addDegrees([2,3,4,5,6,7]);
        expect(chord.pitches.length).to.equal(7);
        expect(chord.contains(38)).to.be.true;
        expect(chord.contains(40)).to.be.true;
        expect(chord.contains(41)).to.be.true;
        expect(chord.contains(43)).to.be.true;
        expect(chord.contains(45)).to.be.true;
        expect(chord.contains(47)).to.be.true;
    }

    @test 'addDegrees uses scale to get a better fit of notes to a scale'() {
        const scale = ScaleTemplate.naturalMinor.create(0);
        const chord = new Chord().setRoot(36)
            .addDegrees([3,5], scale);
        expect(chord.contains(39)).to.be.true;
        expect(chord.contains(43)).to.be.true;
    }

    @test 'addDegrees can add degrees over an octave'() {
        const chord = new Chord().setRoot(36)
            .addDegrees([9,11]);
        expect(chord.contains(50)).to.be.true;
        expect(chord.contains(53)).to.be.true;
    }

    @test 'addDegrees can take negative values to use diminished versions of degrees'() {
        const chord = new Chord().setRoot(36)
            .addDegrees([-3,5]);
        expect(chord.contains(39)).to.be.true;
        expect(chord.contains(43)).to.be.true;
    }

    @test 'addDegrees can handle higher number negative values'() {
        const chord = new Chord().setRoot(36)
            .addDegrees([3,5,-7,-9]);
        expect(chord.contains(46)).to.be.true;
        expect(chord.contains(49)).to.be.true;
    }

    @test 'addDegrees still uses diminished version even when scale provided prefers non-diminished'() {
        const scale = ScaleTemplate.major.create(0);
        const chord = new Chord().setRoot(43)
            .addDegrees([-3,7], scale);
        expect(chord.contains(46)).to.be.true;
        expect(chord.contains(53)).to.be.true;
    }


    @test 'bass property returns the lowest pitch'() {
        const chord = new Chord().setRoot(36).addPitches([31, 40]);
        expect(chord.bass).to.equal(31);
    }


    @test 'transpose correctly alters chord root & pitches'() {
        const chord = new Chord().setRoot(36).addPitches([40, 43]);
        chord.transpose(5);
        expect(chord.root).to.equal(41);
        expect(chord.pitches).to.contain(45);
        expect(chord.pitches).to.contain(48);
    }

    @test 'transpose ignores root if it hasnt been set'() {
        const chord = new Chord().addPitches([36, 40, 43]);
        chord.transpose(-3);
        expect(chord.root).to.be.null;
    }

    @test 'transpose forces name to be recalculated'() {
        const chord = new Chord().addPitches([36, 39, 43]);
        expect(chord.name).to.equal('Cm');
        chord.transpose(7);
        expect(chord.name).to.equal('Gm');
    }
}