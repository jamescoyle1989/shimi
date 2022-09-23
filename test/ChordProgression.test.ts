import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import ChordProgression from '../src/ChordProgression';
import Chord from '../src/Chord';


@suite class ChordProgressionTests {
    @test 'ChordProgression gets created with a duration'() {
        const chordProgression = new ChordProgression(16);
        expect(chordProgression.duration).to.equal(16);
    }

    @test 'addChord adds new chord'() {
        const chordProgression = new ChordProgression(16);
        chordProgression.addChord(0, 4, new Chord().addPitches([0, 4, 7]));
        expect(chordProgression.chords.length).to.equal(1);
        expect(chordProgression.chords[0].start).to.equal(0);
        expect(chordProgression.chords[0].duration).to.equal(4);
    }

    @test 'addChord returns ChordProgression object'() {
        const chordProgression = new ChordProgression(16)
            .addChord(0, 4, new Chord().addPitches([12, 16, 19]))
            .addChord(4, 4, new Chord().addPitches([11, 14, 19]));
        expect(chordProgression.chords.length).to.equal(2);
    }

    @test 'removeChords removes chords'() {
        const chordProgression = new ChordProgression(16)
            .addChord(0, 4, new Chord().addPitches([12, 16, 19]))
            .addChord(4, 4, new Chord().addPitches([12, 17, 21]))
            .addChord(8, 4, new Chord().addPitches([11, 14, 19]))
            .addChord(12, 4, new Chord().addPitches([12, 16, 19]));
        expect(chordProgression.chords.length).to.equal(4);
        chordProgression.removeChords(x => x.end > 14 || x.start < 2);
        expect(chordProgression.chords.length).to.equal(2);
        expect(chordProgression.chords[0].start).to.equal(4);
        expect(chordProgression.chords[1].start).to.equal(8);
    }

    @test 'addChord moves existing chords out the way if there would be an overlap'() {
        const chordProgression = new ChordProgression(16)
            .addChord(0, 4, new Chord().addPitches([12, 16, 19]))
            .addChord(4, 4, new Chord().addPitches([12, 17, 21]))
            .addChord(8, 4, new Chord().addPitches([11, 14, 19]))
            .addChord(12, 4, new Chord().addPitches([12, 16, 19]));
        chordProgression.addChord(3, 4, new Chord().addPitches([11, 14, 17]));
        expect(chordProgression.chords[0].duration).to.equal(3);
        expect(chordProgression.chords[1].start).to.equal(7);
        expect(chordProgression.chords[1].duration).to.equal(1);
    }

    @test 'addChord removes existing chords if new chord entirely contains them'() {
        const chordProgression = new ChordProgression(16)
            .addChord(0, 4, new Chord().addPitches([12, 16, 19]))
            .addChord(4, 4, new Chord().addPitches([12, 17, 21]))
            .addChord(8, 4, new Chord().addPitches([11, 14, 19]))
            .addChord(12, 4, new Chord().addPitches([12, 16, 19]));
        chordProgression.addChord(4, 8, new Chord().addPitches([11, 14, 17]));
        expect(chordProgression.chords.length).to.equal(3);
    }

    @test 'getChordsInRange returns chords in range'() {
        const chordProgression = new ChordProgression(16)
            .addChord(0, 4, new Chord().addPitches([12, 16, 19]))
            .addChord(4, 4, new Chord().addPitches([12, 17, 21]))
            .addChord(8, 4, new Chord().addPitches([11, 14, 19]))
            .addChord(12, 4, new Chord().addPitches([12, 16, 19]));
        const chordsInRange = chordProgression.getChordsInRange(7, 11);
        expect(chordsInRange.length).to.equal(2);
        expect(chordsInRange[0].start).to.equal(4);
        expect(chordsInRange[1].start).to.equal(8);
    }

    @test 'getChordsInRange wraps around if end less than start'() {
        const chordProgression = new ChordProgression(16)
            .addChord(0, 4, new Chord().addPitches([12, 16, 19]))
            .addChord(4, 4, new Chord().addPitches([12, 17, 21]))
            .addChord(8, 4, new Chord().addPitches([11, 14, 19]))
            .addChord(12, 4, new Chord().addPitches([12, 16, 19]));
        const chordsInRange = chordProgression.getChordsInRange(11, 3);
        expect(chordsInRange.length).to.equal(3);
        expect(chordsInRange[0].start).to.equal(0);
        expect(chordsInRange[1].start).to.equal(8);
        expect(chordsInRange[2].start).to.equal(12);
    }

    @test 'getChordAt returns the correct chord at the selected point in time'() {
        const chordProgression = new ChordProgression(16)
            .addChord(0, 4, new Chord().addPitches([12, 16, 19]))
            .addChord(4, 4, new Chord().addPitches([12, 17, 21]))
            .addChord(8, 4, new Chord().addPitches([11, 14, 19]))
            .addChord(12, 4, new Chord().addPitches([12, 16, 19]));
        const chord = chordProgression.getChordAt(9);
        expect(chord.start).to.equal(8);
    }
}