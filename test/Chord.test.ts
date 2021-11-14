import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import Chord from '../src/Chord';
import { FitDirection } from '../src/IPitchContainer';


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
        const chord = new Chord().addPitches([12, 16, 19]);
        expect(chord.fitPitch(14, {preferredDirection: FitDirection.down})).to.equal(12);
    }

    @test 'fitPitch can prefer moving upwards'() {
        const chord = new Chord().addPitches([12, 16, 19]);
        expect(chord.fitPitch(14, {preferredDirection: FitDirection.up})).to.equal(16);
    }

    @test 'fitPitch can prefer moving to root'() {
        const chord = new Chord().addPitches([12, 16, 19]);
        expect(chord.fitPitch(14, {preferRoot: true})).to.equal(12);
    }

    @test 'fitPitch will return input pitch rounded if nothing within maxMovement range'() {
        const chord = new Chord().addPitches([12, 16, 19]);
        expect(chord.fitPitch(17.5, {maxMovement: 1})).to.equal(18);
    }
}