import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import { MockPort } from './MidiOut.test';
import MidiIn from '../src/MidiIn';
import { ChannelPressureMessage, ControlChangeMessage, NoteOffMessage, NoteOnMessage, NotePressureMessage, PitchBendMessage, ProgramChangeMessage } from '../src/MidiMessages';


@suite class MidiInTests {
    @test 'receiveData for note off message triggers noteOff event'() {
        const midiIn = new MidiIn(new MockPort());
        const midiMessages: any[] = [];
        midiIn.noteOff.add(data => midiMessages.push(data.message));
        midiIn.receiveData([0x90 + 2, 65, 45]);
        midiIn.receiveData([0x80 + 3, 67, 91]);
        expect(midiMessages.length).to.equal(1);
        expect(midiMessages[0]).to.be.instanceOf(NoteOffMessage);
        const message: NoteOffMessage = midiMessages[0];
        expect(message.channel).to.equal(3);
        expect(message.pitch).to.equal(67);
        expect(message.velocity).to.equal(91);
    }

    @test 'receiveData for note on message triggers noteOn event'() {
        const midiIn = new MidiIn(new MockPort());
        const midiMessages: any[] = [];
        midiIn.noteOn.add(data => midiMessages.push(data.message));
        midiIn.receiveData([0x90 + 2, 65, 45]);
        midiIn.receiveData([0x80 + 3, 67, 91]);
        expect(midiMessages.length).to.equal(1);
        expect(midiMessages[0]).to.be.instanceOf(NoteOnMessage);
        const message: NoteOnMessage = midiMessages[0];
        expect(message.channel).to.equal(2);
        expect(message.pitch).to.equal(65);
        expect(message.velocity).to.equal(45);
    }

    @test 'receiveData for note pressure message triggers notePressure event'() {
        const midiIn = new MidiIn(new MockPort());
        const midiMessages: any[] = [];
        midiIn.notePressure.add(data => midiMessages.push(data.message));
        midiIn.receiveData([0xA0 + 5, 87, 15]);
        expect(midiMessages.length).to.equal(1);
        expect(midiMessages[0]).to.be.instanceOf(NotePressureMessage);
        const message: NotePressureMessage = midiMessages[0];
        expect(message.channel).to.equal(5);
        expect(message.pitch).to.equal(87);
        expect(message.velocity).to.equal(15);
    }

    @test 'receiveData for control change message triggers controlChange event'() {
        const midiIn = new MidiIn(new MockPort());
        const midiMessages: any[] = [];
        midiIn.controlChange.add(data => midiMessages.push(data.message));
        midiIn.receiveData([0xB0 + 5, 44, 78]);
        expect(midiMessages.length).to.equal(1);
        expect(midiMessages[0]).to.be.instanceOf(ControlChangeMessage);
        const message: ControlChangeMessage = midiMessages[0];
        expect(message.channel).to.equal(5);
        expect(message.controller).to.equal(44);
        expect(message.value).to.equal(78);
    }

    @test 'receiveData for program change message triggers programChange event'() {
        const midiIn = new MidiIn(new MockPort());
        const midiMessages: any[] = [];
        midiIn.programChange.add(data => midiMessages.push(data.message));
        midiIn.receiveData([0xC0 + 7, 78]);
        expect(midiMessages.length).to.equal(1);
        expect(midiMessages[0]).to.be.instanceOf(ProgramChangeMessage);
        const message: ProgramChangeMessage = midiMessages[0];
        expect(message.channel).to.equal(7);
        expect(message.program).to.equal(78);
    }

    @test 'receiveData for channel pressure message triggers channelPressure event'() {
        const midiIn = new MidiIn(new MockPort());
        const midiMessages: any[] = [];
        midiIn.channelPressure.add(data => midiMessages.push(data.message));
        midiIn.receiveData([0xD0 + 8, 99]);
        expect(midiMessages.length).to.equal(1);
        expect(midiMessages[0]).to.be.instanceOf(ChannelPressureMessage);
        const message: ChannelPressureMessage = midiMessages[0];
        expect(message.channel).to.equal(8);
        expect(message.value).to.equal(99);
    }

    @test 'receiveData for pitch bend message triggers pitchBend event'() {
        const midiIn = new MidiIn(new MockPort());
        const midiMessages: any[] = [];
        midiIn.pitchBend.add(data => midiMessages.push(data.message));
        midiIn.receiveData([0xE0 + 2, 0x00, 0x60]);
        expect(midiMessages.length).to.equal(1);
        expect(midiMessages[0]).to.be.instanceOf(PitchBendMessage);
        const message: PitchBendMessage = midiMessages[0];
        expect(message.channel).to.equal(2);
        expect(message.percent).to.equal(0.5);
    }

    @test 'port.onmidimessage results in receiveData being called'() {
        const port = new MockPort();
        const midiIn = new MidiIn(port);
        const midiMessages: any[] = [];
        midiIn.noteOn.add(data => midiMessages.push(data.message));
        port['onmidimessage']({data:[0x90 + 2, 65, 45]});
        expect(midiMessages.length).to.equal(1);
        expect(midiMessages[0]).to.be.instanceOf(NoteOnMessage);
        const message: NoteOnMessage = midiMessages[0];
        expect(message.pitch).to.equal(65);
        expect(message.velocity).to.equal(45);
        expect(message.channel).to.equal(2);
    }

    @test 'constructor can handle no port being passed in'() {
        const midiIn = new MidiIn();
    }

    @test 'port can be changed and onmidimessage still works'() {
        const port = new MockPort();
        const midiIn = new MidiIn();
        midiIn.port = port;
        const midiMessages: any[] = [];
        midiIn.noteOn.add(data => midiMessages.push(data.message));
        port['onmidimessage']({data:[0x90 + 2, 65, 45]});
        expect(midiMessages.length).to.equal(1);
        expect(midiMessages[0]).to.be.instanceOf(NoteOnMessage);
        const message: NoteOnMessage = midiMessages[0];
        expect(message.pitch).to.equal(65);
        expect(message.velocity).to.equal(45);
        expect(message.channel).to.equal(2);
    }

    @test 'Updating port removes onmidimessage from old port'() {
        const port = new MockPort();
        const midiIn = new MidiIn(port);
        midiIn.port = null;
        expect(port['onmidimessage']).to.be.undefined;
    }

    @test 'receiveData can send out tick events'() {
        const midiIn = new MidiIn(new MockPort());
        let tickCount = 0;
        midiIn.tick.add(data => tickCount++);
        expect(tickCount).to.equal(0);
        midiIn.receiveData([0xF8]);
        midiIn.receiveData([0xF8]);
        expect(tickCount).to.equal(2);
    }
}