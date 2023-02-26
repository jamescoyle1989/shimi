import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import ChordProgression from '../src/ChordProgression';
import Chord from '../src/Chord';
import ChordProgressionPlayer from '../src/ChordProgressionPlayer';
import { Metronome } from '../src';


const chordProgression1 = new ChordProgression(16)
    .addChord(0, 4, new Chord().addPitches([12, 16, 19]))
    .addChord(4, 4, new Chord().addPitches([12, 17, 21]))
    .addChord(8, 4, new Chord().addPitches([11, 14, 19]))
    .addChord(12, 4, new Chord().addPitches([12, 16, 19]));

const chordProgression2 = new ChordProgression(16)
    .addChord(4, 4, new Chord().addPitches([12, 17, 21]))
    .addChord(8, 4, new Chord().addPitches([11, 14, 19]))
    .addChord(12, 4, new Chord().addPitches([12, 16, 19]));


@suite class ChordProgressionPlayerTests {
    @test 'Update triggers chordChanged event when starting if chord at beginning'() {
        const metronome = new Metronome(120);
        const player = new ChordProgressionPlayer(chordProgression1, metronome);
        let chordChangeData = [];
        player.chordChanged.add(data => chordChangeData.push(data));
        metronome.update(10);
        player.update(10);
        expect(chordChangeData.length).to.equal(1);
        expect(chordChangeData[0].chord).to.equal(chordProgression1.chords[0].chord);
    }

    @test 'Update doesnt trigger chordChanged event when starting if no chord at start'() {
        const metronome = new Metronome(120);
        const player = new ChordProgressionPlayer(chordProgression2, metronome);
        let chordChangeData = [];
        player.chordChanged.add(data => chordChangeData.push(data));
        metronome.update(10);
        player.update(10);
        expect(chordChangeData.length).to.equal(0);
    }

    @test 'Update takes into account startBeat'() {
        const metronome = new Metronome(120);
        const player = new ChordProgressionPlayer(chordProgression1, metronome);
        player.startBeat = 4;
        let chordChangeData = [];
        player.chordChanged.add(data => chordChangeData.push(data));
        metronome.update(10);
        player.update(10);
        expect(chordChangeData.length).to.equal(1);
        expect(chordChangeData[0].chord).to.equal(chordProgression1.chords[1].chord);
    }

    @test 'Update makes player quit once beat count reached'() {
        const metronome = new Metronome(60);
        const player = new ChordProgressionPlayer(chordProgression1, metronome);
        player.beatCount = 1;
        metronome.update(500);
        player.update(500);
        expect(player.isFinished).to.be.false;
        metronome.update(501);
        player.update(501);
        expect(player.isFinished).to.be.true;
    }

    @test 'Update takes into account speed'() {
        const metronome = new Metronome(60);
        const player = new ChordProgressionPlayer(chordProgression1, metronome);
        player.speed = 4;
        metronome.update(1000);
        player.update(1000);
        expect(player.currentChord.start).to.equal(4);
    }

    @test 'withRef sets ref value'() {
        const metronome = new Metronome(120);
        const player = new ChordProgressionPlayer(chordProgression1, metronome).withRef('Testy test');
        expect(player.ref).to.equal('Testy test');
    }

    @test 'finished event gets fired'() {
        //Setup
        const metronome = new Metronome(120);
        const player = new ChordProgressionPlayer(chordProgression2, metronome);
        let testVar = 0;
        player.finished.add(() => testVar = 3);

        player.finish();
        expect(testVar).to.equal(3);
    }
}