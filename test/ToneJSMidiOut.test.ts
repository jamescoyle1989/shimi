import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai'
import { ControlChangeMessage, Note, NoteOffMessage, NoteOnMessage, PitchBendMessage } from '../src';
import ToneJSMidiOut from '../src/ToneJSMidiOut';
import { parsePitch } from '../src/utils';


class ToneTest {
    now(): string {
        return 'now';
    }
}


class TestBaseSynth {
    name: string;
    
    messages: Array<string> = [];

    constructor(name?: string) {
        this.name = name;
    }
}

class TestSignal {
    constructor(value: any) {
        this.value = value;
    }

    value: any;
}

class TestMonoSynth extends TestBaseSynth {
    constructor(name?: string) {
        super(name);
    }

    frequency: TestSignal = new TestSignal(440);

    triggerAttack(frequency: number, time: any, velocity: number = 1) {
        this.messages.push(`triggerAttack(${frequency.toFixed(0)}, ${time}, ${velocity.toFixed(2)})`);
    }

    triggerRelease(time: any) {
        this.messages.push(`triggerRelease(${time})`);
    }
}

class TestNoiseSynth extends TestBaseSynth {
    constructor() {
        super('NoiseSynth');
    }

    triggerAttack(time: any, velocity: number = 1) {
        this.messages.push(`triggerAttack(${time}, ${velocity.toFixed(2)})`);
    }

    triggerRelease(time: any) {
        this.messages.push(`triggerRelease(${time})`);
    }
}

class TestPolySynth extends TestBaseSynth {
    constructor(name: string) {
        super(name);
    }

    triggerAttack(notes: number, time: any, velocity: number = 1) {
        this.messages.push(`triggerAttack(${notes.toFixed(0)}, ${time}, ${velocity.toFixed(2)})`);
    }

    triggerRelease(notes: number, time: any) {
        this.messages.push(`triggerRelease(${notes.toFixed(0)}, ${time})`);
    }
}




@suite class ToneJSMidiOutTests {
    @test 'setChannel populates default values'() {
        const midiOut = new ToneJSMidiOut(new ToneTest());
        const target = new TestMonoSynth();
        midiOut.setChannel(0, target);
        expect(midiOut.channels[0].target).to.equal(target);
        expect(midiOut.channels[0].controlValues.length).to.equal(128);
    }

    @test 'setChannel errors if channel not in range 0 to 15'() {
        const midiOut = new ToneJSMidiOut(new ToneTest());
        expect(() => midiOut.setChannel(-1, new TestMonoSynth())).to.throw();
        expect(() => midiOut.setChannel(16, new TestMonoSynth())).to.throw();
    }

    @test 'If setChannel target is null, then entire channel object is nulled out'() {
        const midiOut = new ToneJSMidiOut(new ToneTest());
        midiOut.setChannel(0, new TestMonoSynth());
        expect(midiOut.channels[0]).to.not.be.null;
        midiOut.setChannel(0, null);
        expect(midiOut.channels[0]).to.be.null;
    }

    @test 'addNote causes triggerAttack to be called on corresponding channel'() {
        const midiOut = new ToneJSMidiOut(new ToneTest());
        const target0 = new TestMonoSynth();
        const target1 = new TestMonoSynth();
        midiOut.setChannel(0, target0);
        midiOut.setChannel(1, target1);
        midiOut.addNote(new Note(60, 80, 1));
        expect(target0.messages.length).to.equal(0);
        expect(target1.messages.length).to.equal(1);
        expect(target1.messages[0]).to.equal('triggerAttack(262, now, 0.63)');
    }

    @test 'addNote does nothing if nothing set for note channel'() {
        const midiOut = new ToneJSMidiOut(new ToneTest());
        const target = new TestMonoSynth();
        midiOut.setChannel(0, target);
        midiOut.addNote(new Note(40, 80, 2));
        expect(midiOut.notes.length).to.equal(0);
        expect(target.messages.length).to.equal(0);
    }

    @test 'New channel automatically gets configured to be polyphonic based on target name'() {
        const midiOut = new ToneJSMidiOut(new ToneTest());
        midiOut.setChannel(0, new TestMonoSynth('Synth'));
        expect(midiOut.channels[0].isPolyphonic).to.be.false;
        
        midiOut.setChannel(1, new TestMonoSynth('NoiseSynth'));
        expect(midiOut.channels[1].isPolyphonic).to.be.false;
        
        midiOut.setChannel(2, new TestMonoSynth('Sampler'));
        expect(midiOut.channels[2].isPolyphonic).to.be.true;
        
        midiOut.setChannel(3, new TestMonoSynth('PolySynth'));
        expect(midiOut.channels[3].isPolyphonic).to.be.true;
    }

    @test 'update method finding off note will cause triggerRelease on the corresponding channel'() {
        const midiOut = new ToneJSMidiOut(new ToneTest());
        const target = new TestMonoSynth('Synth');
        midiOut.setChannel(0, target);
        midiOut.addNote(new Note('A4', 127, 0)).on = false;
        midiOut.update(1);
        expect(target.messages.length).to.equal(2);
        expect(target.messages[0]).to.equal('triggerAttack(440, now, 1.00)');
        expect(target.messages[1]).to.equal('triggerRelease(now)');
    }

    @test 'triggerAttack gets called slightly differently for NoiseSynth'() {
        const midiOut = new ToneJSMidiOut(new ToneTest());
        const target = new TestNoiseSynth();
        midiOut.setChannel(0, target);
        midiOut.addNote(new Note('A4', 127, 0));
        expect(target.messages.length).to.equal(1);
        expect(target.messages[0]).to.equal('triggerAttack(now, 1.00)');
    }

    @test 'triggerRelease gets called differently for polyphonic synths'() {
        const midiOut = new ToneJSMidiOut(new ToneTest());
        const target = new TestPolySynth('PolySynth');
        midiOut.setChannel(0, target);
        const note = midiOut.addNote(new Note('A4', 127, 0));
        note.on = false;
        midiOut.update(1);
        expect(target.messages.length).to.equal(2);
        expect(target.messages[1]).to.equal('triggerRelease(440, now)');
    }

    @test 'stopNotes causes all notes to be stopped on next update'() {
        const midiOut = new ToneJSMidiOut(new ToneTest());
        const target = new TestPolySynth('PolySynth');
        midiOut.setChannel(0, target);
        midiOut.addNote(new Note('A4', 127, 0));
        midiOut.addNote(new Note('B4', 127, 0));
        midiOut.stopNotes();
        expect(target.messages.length).to.equal(2);
        midiOut.update(1);
        expect(target.messages.length).to.equal(4);
        expect(target.messages[2]).to.equal('triggerRelease(440, now)');
        expect(target.messages[3]).to.equal('triggerRelease(494, now)');
    }

    @test 'sendMessage for NoteOnMessage creates new note if for valid channel'() {
        const midiOut = new ToneJSMidiOut(new ToneTest());
        const target = new TestPolySynth('PolySynth');
        midiOut.setChannel(0, target);
        midiOut.sendMessage(new NoteOnMessage('A4', 127, 0));
        midiOut.sendMessage(new NoteOnMessage('B4', 127, 1));
        expect(midiOut.notes.length).to.equal(1);
        expect(midiOut.notes[0].pitch).to.equal(parsePitch('A4'));
        expect(target.messages.length).to.equal(1);
        expect(target.messages[0]).to.equal('triggerAttack(440, now, 1.00)');
    }

    @test 'sendMessage for NoteOffMessage stops note if for valid channel'() {
        const midiOut = new ToneJSMidiOut(new ToneTest());
        const target = new TestPolySynth('Sampler');
        midiOut.setChannel(0, target);
        midiOut.addNote(new Note('A4', 127, 0));
        midiOut.sendMessage(new NoteOffMessage('A4', 127, 0));
        midiOut.update(1);
        expect(midiOut.notes.length).to.equal(0);
        expect(target.messages.length).to.equal(2);
        expect(target.messages[1]).to.equal('triggerRelease(440, now)');
    }

    @test 'sendMessage for ControlChangeMessage triggers channel onControlChange'() {
        const midiOut = new ToneJSMidiOut(new ToneTest());
        const target = new TestNoiseSynth();
        midiOut.setChannel(0, target);
        let ccMessage = null;
        midiOut.channels[0].onControlChange = (cc, target) => {
            ccMessage = cc;
        };
        expect(ccMessage).to.be.null;
        midiOut.sendMessage(new ControlChangeMessage(15, 125, 0));
        expect(ccMessage.controller).to.equal(15);
        expect(ccMessage.value).to.equal(125);
    }

    @test 'sendMessage for ControlChangeMessage updates controlValues array'() {
        const midiOut = new ToneJSMidiOut(new ToneTest());
        const target = new TestNoiseSynth();
        midiOut.setChannel(0, target);
        midiOut.sendMessage(new ControlChangeMessage(16, 90, 0));
        expect(midiOut.channels[0].controlValues[16]).to.equal(90);
    }

    @test 'sendMessage for ControlChangeMessage validates parameter values'() {
        const midiOut = new ToneJSMidiOut(new ToneTest());
        const target = new TestNoiseSynth();
        midiOut.setChannel(0, target);
        expect(() => midiOut.sendMessage(new ControlChangeMessage(-1, 0, 0))).to.throw();
        expect(() => midiOut.sendMessage(new ControlChangeMessage(128, 0, 0))).to.throw();
        expect(() => midiOut.sendMessage(new ControlChangeMessage(0, -1, 0))).to.throw();
        expect(() => midiOut.sendMessage(new ControlChangeMessage(0, 128, 0))).to.throw();
    }

    @test 'sendRawData can process note-on messages'() {
        const midiOut = new ToneJSMidiOut(new ToneTest());
        const target = new TestPolySynth('Sampler');
        midiOut.setChannel(0, target);
        midiOut.sendRawData([0x90 + 0, parsePitch('A4'), 127]);
        expect(midiOut.notes.length).to.equal(1);
        expect(midiOut.notes[0].pitch).to.equal(parsePitch('A4'));
        expect(midiOut.notes[0].velocity).to.equal(127);
        expect(target.messages.length).to.equal(1);
        expect(target.messages[0]).to.equal('triggerAttack(440, now, 1.00)');
    }

    @test 'sendRawData can process note-off messages'() {
        const midiOut = new ToneJSMidiOut(new ToneTest());
        const target = new TestPolySynth('Sampler');
        midiOut.setChannel(0, target);
        midiOut.addNote(new Note('A4', 127, 0));
        midiOut.sendRawData([0x80 + 0, parsePitch('A4'), 127]);
        midiOut.update(1);
        expect(midiOut.notes.length).to.equal(0);
        expect(target.messages.length).to.equal(2);
        expect(target.messages[1]).to.equal('triggerRelease(440, now)');
    }

    @test 'sendRawData can process control change messages'() {
        const midiOut = new ToneJSMidiOut(new ToneTest());
        const target = new TestNoiseSynth();
        midiOut.setChannel(0, target);
        midiOut.sendRawData([0xB0 + 0, 60, 70]);
        expect(midiOut.channels[0].controlValues[60]).to.equal(70);
    }

    @test 'constructor takes tonejs reference'() {
        const tonejs = new ToneTest();
        const midiOut = new ToneJSMidiOut(tonejs);
        expect(midiOut.toneJS).to.equal(tonejs);
    }

    @test 'constructor throws error if toneJS parameter is falsy'() {
        expect(() => new ToneJSMidiOut(null)).to.throw();
    }

    @test 'ToneJSMidiOutChannels store reference to their parent'() {
        const midiOut = new ToneJSMidiOut(new ToneTest());
        midiOut.setChannel(0, new TestNoiseSynth());
        expect(midiOut.channels[0].parent).to.equal(midiOut);
    }

    @test 'Stopped notes on monophonic synth have no effect if another note started more recently'() {
        const midiOut = new ToneJSMidiOut(new ToneTest());
        const synth = new TestMonoSynth();
        midiOut.setChannel(0, synth);
        const note1 = midiOut.addNote(new Note('C4', 127, 0));
        midiOut.update(10);
        const note2 = midiOut.addNote(new Note('G4', 127, 0));
        midiOut.update(10);
        note1.stop();
        midiOut.update(10);
        note2.stop();
        midiOut.update(10);
        expect(synth.messages.length).to.equal(3);
        expect(synth.messages[0]).to.equal('triggerAttack(262, now, 1.00)');
        expect(synth.messages[1]).to.equal('triggerAttack(392, now, 1.00)');
        expect(synth.messages[2]).to.equal('triggerRelease(now)');
    }

    @test 'Stopped notes on polyphonic synth have no effect if another note of same pitch started more recently'() {
        const midiOut = new ToneJSMidiOut(new ToneTest());
        const synth = new TestPolySynth('Sampler');
        midiOut.setChannel(0, synth);
        const note1 = midiOut.addNote(new Note('A4', 127, 0));
        midiOut.update(10);
        const note2 = midiOut.addNote(new Note('A4', 127, 0));
        midiOut.update(10);
        note1.stop();
        midiOut.update(10);
        note2.stop();
        midiOut.update(10);
        expect(synth.messages.length).to.equal(3);
        expect(synth.messages[0]).to.equal('triggerAttack(440, now, 1.00)');
        expect(synth.messages[1]).to.equal('triggerAttack(440, now, 1.00)');
        expect(synth.messages[2]).to.equal('triggerRelease(440, now)');
    }

    @test 'Overlapping stopped notes work normally on poly synth when pitches are different'() {
        const midiOut = new ToneJSMidiOut(new ToneTest());
        const synth = new TestPolySynth('Sampler');
        midiOut.setChannel(0, synth);
        const note1 = midiOut.addNote(new Note('C4', 127, 0));
        midiOut.update(10);
        const note2 = midiOut.addNote(new Note('G4', 127, 0));
        midiOut.update(10);
        note1.stop();
        midiOut.update(10);
        note2.stop();
        midiOut.update(10);
        expect(synth.messages.length).to.equal(4);
        expect(synth.messages[0]).to.equal('triggerAttack(262, now, 1.00)');
        expect(synth.messages[1]).to.equal('triggerAttack(392, now, 1.00)');
        expect(synth.messages[2]).to.equal('triggerRelease(262, now)');
        expect(synth.messages[3]).to.equal('triggerRelease(392, now)');
    }

    @test 'Channel onPitchBend method updates frequency on target'() {
        const midiOut = new ToneJSMidiOut(new ToneTest());
        const synth = new TestMonoSynth('AMSynth');
        midiOut.setChannel(0, synth);
        midiOut.channels[0].onPitchBend(new PitchBendMessage(0.5, 0));
        expect(midiOut.channels[0].target.frequency.value).to.be.approximately(466.16, 0.01);
    }

    @test 'Channel onPitchBend method doesnt do anything if polyphonic'() {
        const midiOut = new ToneJSMidiOut(new ToneTest());
        const synth = new TestPolySynth('Sampler');
        midiOut.setChannel(0, synth);
        midiOut.channels[0].onPitchBend(new PitchBendMessage(1, 0));
        //If polyphonic channel attempted to do anything, an error would occur here
    }

    @test 'Channel onPitchBend method can handle sequential pitch bends'() {
        const midiOut = new ToneJSMidiOut(new ToneTest());
        const synth = new TestMonoSynth('AMSynth');
        midiOut.setChannel(0, synth);
        midiOut.channels[0].onPitchBend(new PitchBendMessage(1, 0));
        expect(midiOut.channels[0].target.frequency.value).to.be.approximately(493.88, 0.01);
        midiOut.channels[0].onPitchBend(new PitchBendMessage(0.5, 0));
        expect(midiOut.channels[0].target.frequency.value).to.be.approximately(466.16, 0.01);
    }

    @test 'Channel onPitchBend method can handle sequential pitch bends with note changes'() {
        const midiOut = new ToneJSMidiOut(new ToneTest());
        const synth = new TestMonoSynth('AMSynth');
        midiOut.setChannel(0, synth);
        midiOut.channels[0].onPitchBend(new PitchBendMessage(1, 0));
        expect(midiOut.channels[0].target.frequency.value).to.be.approximately(493.88, 0.01);
        midiOut.channels[0].target.frequency.value = 987.77
        midiOut.channels[0].onPitchBend(new PitchBendMessage(0, 0));
        expect(midiOut.channels[0].target.frequency.value).to.be.approximately(880, 0.01);
    }

    @test 'MidiOut properly passes pitch bend messages to channel'() {
        const midiOut = new ToneJSMidiOut(new ToneTest());
        const synth = new TestMonoSynth('AMSynth');
        midiOut.setChannel(2, synth);
        midiOut.sendMessage(new PitchBendMessage(1, 2));
        expect(midiOut.channels[2].target.frequency.value).to.be.approximately(493.88, 0.01);
    }
}