import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import { Note } from '../src';
import WebSynth from '../src/WebSynth';


class DummyAudioContext {
    createGain() {
        return {
            gain: {
                value: 1
            },
            connect: (target: any) => { }
        }
    }

    createOscillator() {
        return {
            type: 'sine',
            connect: (target: any) => { },
            frequency: {
                value: 0
            },
            start() { },
            stop() { }
        }
    }
}


@suite class WebSynthTests {
    @test 'addNote adds to note collection'() {
        const audioContext: any = new DummyAudioContext();
        const synth = new WebSynth(audioContext);
        expect(synth.notes.length).to.equal(0);
        synth.addNote(new Note(50, 89, 3));
        expect(synth.notes.length).to.equal(1);
    }

    @test 'addNote starts a new note sound if the note is on'() {
        const audioContext: any = new DummyAudioContext();
        const synth = new WebSynth(audioContext);
        const note = new Note(70, 38, 2);
        expect(note.on).to.be.true;
        expect(note['oscillator']).to.be.undefined;
        synth.addNote(note);
        expect(note['oscillator']).to.be.not.undefined;
    }

    @test 'oscillator stops on update if note is turned off'() {
        const audioContext: any = new DummyAudioContext();
        const synth = new WebSynth(audioContext);
        const note = new Note(57, 89, 8);
        synth.addNote(note);
        expect(note['oscillator']).to.be.not.undefined;
        note.on = false;
        synth.update(10);
        expect(note['oscillator']).to.be.undefined;
    }
}