import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import DummyPort from './DummyPort';
import { Clip, ClipNote } from '../src/Clip';
import ClipPlayer from '../src/ClipPlayer';
import Metronome from '../src/Metronome';
import MidiOut from '../src/MidiOut';


@suite class ClipPlayerTests {
    @test 'Update doesnt do anything if running is false'() {
        //Setup
        const metronome = new Metronome(120);
        const clipPlayer = new ClipPlayer(new Clip(16), metronome);
        const midiOut = new MidiOut(new DummyPort());

        //Update metronome so it has some difference between old and new beat values
        metronome.update(10);

        clipPlayer.running = false;
        clipPlayer.update(midiOut, 10);
        expect(clipPlayer.beatsPassed).to.equal(0);
    }

    @test 'Update doesnt do anything if metronome isnt set'() {
        //Setup
        const metronome = new Metronome(120);
        const clipPlayer = new ClipPlayer(new Clip(16), null);
        const midiOut = new MidiOut(new DummyPort());

        //Update metronome so it has some difference between old and new beat values
        metronome.update(10);

        clipPlayer.running = false;
        clipPlayer.update(midiOut, 10);
        expect(clipPlayer.beatsPassed).to.equal(0);
    }

    @test 'Update doesnt do anything if clip isnt set'() {
        //Setup
        const metronome = new Metronome(120);
        const clipPlayer = new ClipPlayer(null, metronome);
        const midiOut = new MidiOut(new DummyPort());

        //Update metronome so it has some difference between old and new beat values
        metronome.update(10);

        clipPlayer.running = false;
        clipPlayer.update(midiOut, 10);
        expect(clipPlayer.beatsPassed).to.equal(0);
    }

    @test 'Update creates new notes on the passed in MidiOut'() {
        const clip = new Clip(16);
        clip.notes.push(new ClipNote(0, 1, 60, 100));
        const metronome = new Metronome(120);
        const clipPlayer = new ClipPlayer(clip, metronome);
        const midiOut = new MidiOut(new DummyPort());

        //Update metronome so it has some difference between old and new beat values
        metronome.update(10);

        clipPlayer.update(midiOut, 10);
        expect(midiOut.notes.length).to.equal(1);
        expect(midiOut.notes[0].on).to.be.true;
    }

    @test 'Update stops notes which should be ended'() {
        const clip = new Clip(16);
        clip.notes.push(new ClipNote(0, 1, 60, 100));
        const metronome = new Metronome(120);
        const clipPlayer = new ClipPlayer(clip, metronome);
        const midiOut = new MidiOut(new DummyPort());

        metronome.update(10);
        clipPlayer.update(midiOut, 10);
        expect(midiOut.notes.length).to.equal(1);
        expect(midiOut.notes[0].on).to.be.true;

        metronome.update(500);
        clipPlayer.update(midiOut, 10);
        expect(midiOut.notes[0].on).to.be.false;
    }

    @test 'Update increases beatsPassed property'() {
        //Setup
        const metronome = new Metronome(120);
        const clipPlayer = new ClipPlayer(new Clip(16), metronome);
        const midiOut = new MidiOut(new DummyPort());

        //Update metronome so it has some difference between old and new beat values
        metronome.update(10);

        expect(clipPlayer.running).to.be.true;
        expect(clipPlayer.beatsPassed).to.equal(0);
        clipPlayer.update(midiOut, 10);
        expect(clipPlayer.beatsPassed).to.be.greaterThan(0);
    }

    @test 'Update sets finished if beatsPassed exceeds beatCount'() {
        //Setup
        const metronome = new Metronome(120);
        const clipPlayer = new ClipPlayer(new Clip(16), metronome);
        clipPlayer.beatCount = 1;
        const midiOut = new MidiOut(new DummyPort());

        metronome.update(510);
        expect(clipPlayer.finished).to.be.false;
        clipPlayer.update(midiOut, 10);
        expect(clipPlayer.finished).to.be.true;
    }

    @test 'noteModifier gets called for each new note thats created'() {
        const clip = new Clip(16);
        clip.notes.push(new ClipNote(0, 1, 60, 100));
        const metronome = new Metronome(120);
        const clipPlayer = new ClipPlayer(clip, metronome);
        clipPlayer.noteModifier = n => n.pitch += 2;
        const midiOut = new MidiOut(new DummyPort());

        metronome.update(10);
        clipPlayer.update(midiOut, 10);
        expect(midiOut.notes.length).to.equal(1);
        expect(midiOut.notes[0].pitch).to.equal(62);
    }

    @test 'If ClipNote velocity is a function it gets called with each update'() {
        const clip = new Clip(16);
        clip.notes.push(new ClipNote(0, 1, 60, b => b < 0.5 ? 100 : 50));
        const metronome = new Metronome(120);
        const clipPlayer = new ClipPlayer(clip, metronome);
        const midiOut = new MidiOut(new DummyPort());

        metronome.update(10);
        clipPlayer.update(midiOut, 10);
        expect(midiOut.notes.length).to.equal(1);
        expect(midiOut.notes[0].on).to.be.true;
        expect(midiOut.notes[0].velocity).to.equal(100);

        metronome.update(250);
        clipPlayer.update(midiOut, 10);
        expect(midiOut.notes[0].velocity).to.equal(50);
    }

    @test 'Player can end notes from old clip if clip gets changed'() {
        const clip1 = new Clip(4);
        clip1.notes.push(new ClipNote(0, 1, 60, 80));
        const clip2 = new Clip(4);
        const metronome = new Metronome(120);
        const clipPlayer = new ClipPlayer(clip1, metronome);
        const midiOut = new MidiOut(new DummyPort());

        metronome.update(10);
        clipPlayer.update(midiOut, 10);
        expect(clipPlayer['_notes'].length).to.equal(1);

        clipPlayer.clip = clip2;

        metronome.update(1000);
        clipPlayer.update(midiOut, 1000);
        expect(clipPlayer['_notes'].length).to.equal(0);
    }
}