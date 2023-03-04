import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import { Note, NoteOffMessage, NoteOnMessage } from '../src';
import WebAudioMidiOut, {WebAudioMidiOutChannel} from '../src/WebAudioMidiOut';


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


@suite class WebAudioMidiOutTests {
    @test 'addNote adds to note collection'() {
        const audioContext: any = new DummyAudioContext();
        const synth = new WebAudioMidiOut(audioContext).withDefaultChannels();
        expect(synth.notes.length).to.equal(0);
        synth.addNote(new Note(50, 89, 3));
        expect(synth.notes.length).to.equal(1);
    }

    @test 'addNote starts a new note sound if the note is on'() {
        const audioContext: any = new DummyAudioContext();
        const synth = new WebAudioMidiOut(audioContext).withDefaultChannels();
        const note = new Note(70, 38, 2);
        expect(note.on).to.be.true;
        expect(note['oscillator']).to.be.undefined;
        synth.addNote(note);
        expect(note['oscillator']).to.be.not.undefined;
    }

    @test 'oscillator stops on update if note is turned off'() {
        const audioContext: any = new DummyAudioContext();
        const synth = new WebAudioMidiOut(audioContext).withDefaultChannels();
        const note = new Note(57, 89, 8);
        synth.addNote(note);
        expect(note['oscillator']).to.be.not.undefined;
        note.on = false;
        synth.update(10);
        expect(note['oscillator']).to.be.undefined;
    }

    @test 'stopNotes ends notes'() {
        const audioContext: any = new DummyAudioContext();
        const synth = new WebAudioMidiOut(audioContext).withDefaultChannels();
        synth.addNote(new Note(47, 28, 9));
        synth.stopNotes(n => true);
        expect(synth.notes.length).to.equal(0);
    }

    @test 'withChannel populates a specific channel'() {
        const audioContext: any = new DummyAudioContext();
        const synth = new WebAudioMidiOut(audioContext);
        expect(synth['_channels'][2]).to.be.null;
        synth.withChannel(2, new WebAudioMidiOutChannel(synth.audioContext, 'sawtooth'));
        expect(synth['_channels'][2]).to.be.not.null;
        expect(synth['_channels'][1]).to.be.null;
        expect(synth['_channels'][3]).to.be.null;
    }

    @test 'withDefaultChannels populates all channels'() {
        const audioContext: any = new DummyAudioContext();
        const synth = new WebAudioMidiOut(audioContext).withDefaultChannels();
        for (let i = 0; i < 16; i++)
            expect(synth['_channels'][i]).to.be.not.null;
    }

    @test 'withDefaultChannels doesnt overwrite already set channels'() {
        const audioContext: any = new DummyAudioContext();
        const synth = new WebAudioMidiOut(audioContext);
        synth.withChannel(5, 'square', 1).withDefaultChannels();
        expect(synth['_channels'][5].gain).to.equal(1);
    }

    @test 'when stopping a note, it doesnt matter if another one already started'() {
        const audioContext: any = new DummyAudioContext();
        const synth = new WebAudioMidiOut(audioContext).withDefaultChannels();
        const note1 = synth.addNote(new Note(60, 80, 1));
        const note2 = synth.addNote(new Note(60, 80, 1));
        expect(note1['oscillator']).to.be.not.undefined;
        expect(note2['oscillator']).to.be.not.undefined;
        note1.stop();
        synth.update(10);
        expect(note1['oscillator']).to.be.undefined;
    }

    @test 'finish stops all active notes'() {
        const audioContext: any = new DummyAudioContext();
        const synth = new WebAudioMidiOut(audioContext).withDefaultChannels();
        const note = synth.addNote(new Note(60, 80, 1));
        expect(note['oscillator']).to.be.not.undefined;
        synth.finish();
        expect(note['oscillator']).to.be.undefined;
    }

    @test 'finish sets isFinished to true'() {
        const audioContext: any = new DummyAudioContext();
        const synth = new WebAudioMidiOut(audioContext).withDefaultChannels();
        expect(synth.isFinished).to.be.false;
        synth.finish();
        expect(synth.isFinished).to.be.true;
    }

    @test 'NoteOnMessage creates new note'() {
        const audioContext: any = new DummyAudioContext();
        const synth = new WebAudioMidiOut(audioContext).withDefaultChannels();
        expect(synth.notes.length).to.equal(0);
        synth.sendMessage(new NoteOnMessage(100, 93, 5));
        expect(synth.notes.length).to.equal(1);
        expect(synth.notes[0].pitch).to.equal(100);
    }

    @test 'NoteOffMessage stops existing notes'() {
        const audioContext: any = new DummyAudioContext();
        const synth = new WebAudioMidiOut(audioContext).withDefaultChannels();
        synth.sendMessage(new NoteOnMessage(100, 93, 5));
        expect(synth.notes.length).to.equal(1);
        synth.sendMessage(new NoteOffMessage(100, 0, 5));
        expect(synth.notes.length).to.equal(0);
    }

    @test 'sendRawData can create new note'() {
        const audioContext: any = new DummyAudioContext();
        const synth = new WebAudioMidiOut(audioContext).withDefaultChannels();
        synth.sendRawData([0x91, 5, 6]);
        expect(synth.notes.length).to.equal(1);
        expect(synth.notes[0].channel).to.equal(1);
        expect(synth.notes[0].pitch).to.equal(5);
        expect(synth.notes[0].velocity).to.equal(6);
    }

    @test 'sendRawData keeps track of running state'() {
        const audioContext: any = new DummyAudioContext();
        const synth = new WebAudioMidiOut(audioContext).withDefaultChannels();
        synth.sendRawData([0x91, 5, 6]);
        synth.sendRawData([7, 8]);
        expect(synth.notes.length).to.equal(2);
        expect(synth.notes[0].channel).to.equal(1);
        expect(synth.notes[0].pitch).to.equal(5);
        expect(synth.notes[0].velocity).to.equal(6);
        expect(synth.notes[1].channel).to.equal(1);
        expect(synth.notes[1].pitch).to.equal(7);
        expect(synth.notes[1].velocity).to.equal(8);
    }

    @test 'withRef sets ref value'() {
        const audioContext: any = new DummyAudioContext();
        const synth = new WebAudioMidiOut(audioContext).withDefaultChannels().withRef('Testy test');
        expect(synth.ref).to.equal('Testy test');
    }

    @test 'stopNotes ends all notes if no filter provided'() {
        const audioContext: any = new DummyAudioContext();
        const synth = new WebAudioMidiOut(audioContext).withDefaultChannels();
        synth.addNote(new Note(20, 20, 0));
        synth.addNote(new Note(30, 30, 1));
        synth.addNote(new Note(40, 40, 2));
        expect(synth.notes.filter(x => x.on).length).to.equal(3);
        synth.stopNotes();
        expect(synth.notes.filter(x => x.on).length).to.equal(0);
    }

    @test 'finished event gets fired'() {
        //Setup
        const audioContext: any = new DummyAudioContext();
        const synth = new WebAudioMidiOut(audioContext).withDefaultChannels();
        let testVar = 0;
        synth.finished.add(() => testVar = 3);

        synth.finish();
        expect(testVar).to.equal(3);
    }
}