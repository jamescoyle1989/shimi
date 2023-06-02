import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import DummyPort from './DummyPort';
import Metronome from '../src/Metronome';
import MidiOut from '../src/MidiOut';
import Arpeggiator from '../src/Arpeggiator';
import { Arpeggio, ArpeggioNote } from '../src/Arpeggio';
import { Chord, Tween } from '../src';


@suite class ArpeggiatorTests {
    @test 'Update doesnt do anything if running is false'() {
        //Setup
        const metronome = new Metronome(120);
        const midiOut = new MidiOut(new DummyPort());
        const arpeggiator = new Arpeggiator(new Arpeggio(4), metronome, midiOut);

        //Update metronome so it has some difference between old and new beat values
        metronome.update(10);

        arpeggiator.running = false;
        arpeggiator.update(10);
        expect(arpeggiator.beat).to.equal(0);
    }

    @test 'Update doesnt do anything if metronome isnt set'() {
        //Setup
        const metronome = new Metronome(120);
        const midiOut = new MidiOut(new DummyPort());
        const arpeggiator = new Arpeggiator(new Arpeggio(4), null, midiOut);

        //Update metronome so it has some difference between old and new beat values
        metronome.update(10);

        arpeggiator.update(10);
        expect(arpeggiator.beat).to.equal(0);
    }

    @test 'Update doesnt do anything if arpeggio isnt set'() {
        //Setup
        const metronome = new Metronome(120);
        const midiOut = new MidiOut(new DummyPort());
        const arpeggiator = new Arpeggiator(null, metronome, midiOut);

        //Update metronome so it has some difference between old and new beat values
        metronome.update(10);

        arpeggiator.update(10);
        expect(arpeggiator.beat).to.equal(0);
    }

    @test 'Update doesnt do anything if midiOut isnt set'() {
        //Setup
        const metronome = new Metronome(120);
        const arpeggiator = new Arpeggiator(new Arpeggio(4), metronome, null);

        //Update metronome so it has some difference between old and new beat values
        metronome.update(10);

        arpeggiator.update(10);
        expect(arpeggiator.beat).to.equal(0);
    }

    @test 'Update creates new notes on the passed in MidiOut'() {
        const arpeggio = new Arpeggio(4);
        arpeggio.notes.push(new ArpeggioNote(0, 1, c => c.getPitch(0), 80));
        const metronome = new Metronome(120);
        const midiOut = new MidiOut(new DummyPort());
        const arpeggiator = new Arpeggiator(arpeggio, metronome, midiOut);
        arpeggiator.chord = new Chord().addPitches([36, 40, 43]);

        //Update metronome so it has some difference between old and new beat values
        metronome.update(10);

        arpeggiator.update(10);
        expect(midiOut.notes.length).to.equal(1);
        expect(midiOut.notes[0].on).to.be.true;
        expect(midiOut.notes[0].pitch).to.equal(36);
    }

    @test 'Update modifies the velocity of existing notes with tweens on them'() {
        const arpeggio = new Arpeggio(4);
        arpeggio.notes.push(new ArpeggioNote(0, 1, c => c.getPitch(0), Tween.linear(0, 80)));
        const metronome = new Metronome(60);
        const midiOut = new MidiOut(new DummyPort());
        const arpeggiator = new Arpeggiator(arpeggio, metronome, midiOut);
        arpeggiator.chord = new Chord().addPitches([36, 40, 43]);

        metronome.update(250);
        arpeggiator.update(250);
        expect(midiOut.notes.length).to.equal(1);
        expect(midiOut.notes[0].velocity).to.equal(20);

        metronome.update(250);
        arpeggiator.update(250);
        expect(midiOut.notes[0].velocity).to.equal(40);

        metronome.update(250);
        arpeggiator.update(250);
        expect(midiOut.notes[0].velocity).to.equal(60);
    }

    @test 'Update creates new notes with tweened velocity at correct starting value'() {
        const arpeggio = new Arpeggio(4);
        arpeggio.notes.push(new ArpeggioNote(0, 1, c => c.getPitch(0), Tween.linear(0, 80)));
        const metronome = new Metronome(60);
        const midiOut = new MidiOut(new DummyPort());
        const arpeggiator = new Arpeggiator(arpeggio, metronome, midiOut);
        arpeggiator.chord = new Chord().addPitches([36, 40, 43]);

        metronome.update(500);
        arpeggiator.update(500);
        expect(midiOut.notes.length).to.equal(1);
        expect(midiOut.notes[0].velocity).to.equal(40);
    }

    @test 'Update stops notes which should be ended'() {
        const arpeggio = new Arpeggio(4);
        arpeggio.notes.push(new ArpeggioNote(0, 1, c => c.getPitch(0), 80));
        const metronome = new Metronome(120);
        const midiOut = new MidiOut(new DummyPort());
        const arpeggiator = new Arpeggiator(arpeggio, metronome, midiOut);
        arpeggiator.chord = new Chord().addPitches([36, 40, 43]);

        metronome.update(10);
        arpeggiator.update(10);
        expect(midiOut.notes.length).to.equal(1);
        expect(midiOut.notes[0].on).to.be.true;

        metronome.update(500);
        arpeggiator.update(500);
        expect(midiOut.notes[0].on).to.be.false;
    }

    @test 'noteModifier gets called for each new note thats created'() {
        const arpeggio = new Arpeggio(4);
        arpeggio.notes.push(new ArpeggioNote(0, 1, c => c.getPitch(0), 80));
        const metronome = new Metronome(120);
        const midiOut = new MidiOut(new DummyPort());
        const arpeggiator = new Arpeggiator(arpeggio, metronome, midiOut);
        arpeggiator.noteModifier = n => n.pitch += 2;
        arpeggiator.chord = new Chord().addPitches([36, 40, 43]);

        metronome.update(10);
        arpeggiator.update(10);
        expect(midiOut.notes.length).to.equal(1);
        expect(midiOut.notes[0].pitch).to.equal(38);
    }

    @test 'withRef sets ref value'() {
        const metronome = new Metronome(120);
        const midiOut = new MidiOut(new DummyPort());
        const arpeggiator = new Arpeggiator(new Arpeggio(4), metronome, midiOut).withRef('Testy test');
        expect(arpeggiator.ref).to.equal('Testy test');
    }

    @test 'finish ends all notes'() {
        const arpeggio = new Arpeggio(4);
        arpeggio.notes.push(new ArpeggioNote(0, 1, c => c.getPitch(0), 80));
        const metronome = new Metronome(120);
        const midiOut = new MidiOut(new DummyPort());
        const arpeggiator = new Arpeggiator(arpeggio, metronome, midiOut);
        arpeggiator.chord = new Chord().addPitches([36, 40, 43]);

        metronome.update(10);
        arpeggiator.update(10);
        expect(midiOut.notes.length).to.equal(1);
        expect(midiOut.notes[0].on).to.be.true;

        arpeggiator.finish();
        expect(arpeggiator.isFinished).to.be.true;
        expect(midiOut.notes[0].on).to.be.false;
    }

    @test 'update method doesnt fail if trying to play note when no chord set'() {
        const arpeggio = new Arpeggio(4);
        arpeggio.notes.push(new ArpeggioNote(0, 1, c => c.getPitch(0), 80));
        const metronome = new Metronome(120);
        const midiOut = new MidiOut(new DummyPort());
        const arpeggiator = new Arpeggiator(arpeggio, metronome, midiOut);
        arpeggiator.chord = null;

        metronome.update(10);
        arpeggiator.update(10);
    }

    @test 'finished event gets fired'() {
        //Setup
        const metronome = new Metronome(120);
        const midiOut = new MidiOut(new DummyPort());
        const arpeggiator = new Arpeggiator(new Arpeggio(4), metronome, midiOut);
        let testVar = 0;
        arpeggiator.finished.add(() => testVar = 3);

        arpeggiator.finish();
        expect(testVar).to.equal(3);
    }

    @test 'changing chord stops all currently playing notes'() {
        const arpeggio = new Arpeggio(4);
        arpeggio.notes.push(new ArpeggioNote(0, 1, c => c.getPitch(0), 80));
        const metronome = new Metronome(120);
        const midiOut = new MidiOut(new DummyPort());
        const arpeggiator = new Arpeggiator(arpeggio, metronome, midiOut);
        arpeggiator.chord = new Chord().addPitches([36, 40, 43]);

        metronome.update(10);
        arpeggiator.update(10);
        expect(midiOut.notes.length).to.equal(1);
        expect(midiOut.notes[0].on).to.be.true;

        arpeggiator.chord = new Chord().addPitches([38, 42, 45]);
        expect(midiOut.notes[0].on).to.be.false;
    }
}