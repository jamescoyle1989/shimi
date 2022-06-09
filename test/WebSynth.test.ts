import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import { Note } from '../src';
import WebSynth, {WebSynthChannel} from '../src/WebSynth';


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
        const synth = new WebSynth(audioContext).withDefaultChannels();
        expect(synth.notes.length).to.equal(0);
        synth.addNote(new Note(50, 89, 3));
        expect(synth.notes.length).to.equal(1);
    }

    @test 'addNote starts a new note sound if the note is on'() {
        const audioContext: any = new DummyAudioContext();
        const synth = new WebSynth(audioContext).withDefaultChannels();
        const note = new Note(70, 38, 2);
        expect(note.on).to.be.true;
        expect(note['oscillators']).to.be.undefined;
        synth.addNote(note);
        expect(note['oscillators']).to.be.not.undefined;
    }

    @test 'oscillator stops on update if note is turned off'() {
        const audioContext: any = new DummyAudioContext();
        const synth = new WebSynth(audioContext).withDefaultChannels();
        const note = new Note(57, 89, 8);
        synth.addNote(note);
        expect(note['oscillators']).to.be.not.undefined;
        note.on = false;
        synth.update(10);
        expect(note['oscillators']).to.be.undefined;
    }

    @test 'pitchToFrequency returns correct value'() {
        const audioContext: any = new DummyAudioContext();
        const synth = new WebSynth(audioContext).withDefaultChannels();
        expect(synth['_pitchToFrequency'](69)).to.equal(440);
    }

    @test 'stopNotes ends notes'() {
        const audioContext: any = new DummyAudioContext();
        const synth = new WebSynth(audioContext).withDefaultChannels();
        synth.addNote(new Note(47, 28, 9));
        synth.stopNotes(n => true);
        expect(synth.notes.length).to.equal(0);
    }

    @test 'withChannel populates a specific channel'() {
        const audioContext: any = new DummyAudioContext();
        const synth = new WebSynth(audioContext);
        expect(synth['_channels'][2]).to.be.null;
        synth.withChannel(2, new WebSynthChannel(synth.audioContext, 'sawtooth'));
        expect(synth['_channels'][2]).to.be.not.null;
        expect(synth['_channels'][1]).to.be.null;
        expect(synth['_channels'][3]).to.be.null;
    }

    @test 'withDefaultChannels populates all channels'() {
        const audioContext: any = new DummyAudioContext();
        const synth = new WebSynth(audioContext).withDefaultChannels();
        for (let i = 0; i < 16; i++)
            expect(synth['_channels'][i]).to.be.not.null;
    }

    @test 'withDefaultChannels doesnt overwrite already set channels'() {
        const audioContext: any = new DummyAudioContext();
        const synth = new WebSynth(audioContext);
        const channel = new WebSynthChannel(synth.audioContext, 'square');
        synth.withChannel(5, channel).withDefaultChannels();
        expect(synth['_channels'][5]).to.equal(channel);
    }

    @test 'when stopping a note, it doesnt matter if another one already started'() {
        const audioContext: any = new DummyAudioContext();
        const synth = new WebSynth(audioContext).withDefaultChannels();
        const note1 = synth.addNote(new Note(60, 80, 1));
        const note2 = synth.addNote(new Note(60, 80, 1));
        expect(note1['oscillators']).to.be.not.undefined;
        expect(note2['oscillators']).to.be.not.undefined;
        note1.stop();
        synth.update(10);
        expect(note1['oscillators']).to.be.undefined;
    }
}