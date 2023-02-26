import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import MidiBus from '../src/MidiBus';
import { ChannelPressureMessage, ControlChangeMessage, NoteOffMessage, NoteOnMessage, NotePressureMessage, PitchBendMessage, ProgramChangeMessage } from '../src/MidiMessages';
import Note from '../src/Note';


@suite class MidiBusTests {
    @test 'receiveData for note off message triggers noteOff event'() {
        const midiBus = new MidiBus();
        const midiMessages: any[] = [];
        midiBus.noteOff.add(data => midiMessages.push(data.message));
        midiBus.receiveData([0x90 + 2, 65, 45]);
        midiBus.receiveData([0x80 + 3, 67, 91]);
        expect(midiMessages.length).to.equal(1);
        expect(midiMessages[0]).to.be.instanceOf(NoteOffMessage);
        const message: NoteOffMessage = midiMessages[0];
        expect(message.channel).to.equal(3);
        expect(message.pitch).to.equal(67);
        expect(message.velocity).to.equal(91);
    }

    @test 'receiveData for note on message triggers noteOn event'() {
        const midiBus = new MidiBus();
        const midiMessages: any[] = [];
        midiBus.noteOn.add(data => midiMessages.push(data.message));
        midiBus.receiveData([0x90 + 2, 65, 45]);
        midiBus.receiveData([0x80 + 3, 67, 91]);
        expect(midiMessages.length).to.equal(1);
        expect(midiMessages[0]).to.be.instanceOf(NoteOnMessage);
        const message: NoteOnMessage = midiMessages[0];
        expect(message.channel).to.equal(2);
        expect(message.pitch).to.equal(65);
        expect(message.velocity).to.equal(45);
    }

    @test 'receiveData for note pressure message triggers notePressure event'() {
        const midiBus = new MidiBus();
        const midiMessages: any[] = [];
        midiBus.notePressure.add(data => midiMessages.push(data.message));
        midiBus.receiveData([0xA0 + 5, 87, 15]);
        expect(midiMessages.length).to.equal(1);
        expect(midiMessages[0]).to.be.instanceOf(NotePressureMessage);
        const message: NotePressureMessage = midiMessages[0];
        expect(message.channel).to.equal(5);
        expect(message.pitch).to.equal(87);
        expect(message.velocity).to.equal(15);
    }

    @test 'receiveData for control change message triggers controlChange event'() {
        const midiBus = new MidiBus();
        const midiMessages: any[] = [];
        midiBus.controlChange.add(data => midiMessages.push(data.message));
        midiBus.receiveData([0xB0 + 5, 44, 78]);
        expect(midiMessages.length).to.equal(1);
        expect(midiMessages[0]).to.be.instanceOf(ControlChangeMessage);
        const message: ControlChangeMessage = midiMessages[0];
        expect(message.channel).to.equal(5);
        expect(message.controller).to.equal(44);
        expect(message.value).to.equal(78);
    }

    @test 'receiveData for program change message triggers programChange event'() {
        const midiBus = new MidiBus();
        const midiMessages: any[] = [];
        midiBus.programChange.add(data => midiMessages.push(data.message));
        midiBus.receiveData([0xC0 + 7, 78]);
        expect(midiMessages.length).to.equal(1);
        expect(midiMessages[0]).to.be.instanceOf(ProgramChangeMessage);
        const message: ProgramChangeMessage = midiMessages[0];
        expect(message.channel).to.equal(7);
        expect(message.program).to.equal(78);
    }

    @test 'receiveData for channel pressure message triggers channelPressure event'() {
        const midiBus = new MidiBus();
        const midiMessages: any[] = [];
        midiBus.channelPressure.add(data => midiMessages.push(data.message));
        midiBus.receiveData([0xD0 + 8, 99]);
        expect(midiMessages.length).to.equal(1);
        expect(midiMessages[0]).to.be.instanceOf(ChannelPressureMessage);
        const message: ChannelPressureMessage = midiMessages[0];
        expect(message.channel).to.equal(8);
        expect(message.value).to.equal(99);
    }

    @test 'receiveData for pitch bend message triggers pitchBend event'() {
        const midiBus = new MidiBus();
        const midiMessages: any[] = [];
        midiBus.pitchBend.add(data => midiMessages.push(data.message));
        midiBus.receiveData([0xE0 + 2, 0x00, 0x60]);
        expect(midiMessages.length).to.equal(1);
        expect(midiMessages[0]).to.be.instanceOf(PitchBendMessage);
        const message: PitchBendMessage = midiMessages[0];
        expect(message.channel).to.equal(2);
        expect(message.percent).to.equal(0.5);
    }

    @test 'stop turns off notes'() {
        const midiBus = new MidiBus();
        const note1 = midiBus.addNote(new Note(60, 80, 1));
        const note2 = midiBus.addNote(new Note(62, 80, 1));
        expect(note1.on).to.be.true;
        expect(note2.on).to.be.true;
        midiBus.stopNotes(n => n.pitch == 60);
        expect(note1.on).to.be.false;
        expect(note2.on).to.be.true;
    }

    @test 'stop doesnt remove notes'() {
        const midiBus = new MidiBus();
        midiBus.addNote(new Note(60, 80, 1));
        midiBus.addNote(new Note(62, 80, 1));
        expect(midiBus.notes.length).to.equal(2);
        midiBus.stopNotes(n => n.pitch == 60);
        expect(midiBus.notes.length).to.equal(2);
    }

    @test 'update removes stopped notes'() {
        const midiBus = new MidiBus();
        const note1 = midiBus.addNote(new Note(60, 80, 1));
        const note2 = midiBus.addNote(new Note(62, 80, 1)).on = false;
        expect(midiBus.notes.length).to.equal(2);
        midiBus.update(10);
        expect(midiBus.notes.length).to.equal(1);
    }

    @test 'update sends stop messages'() {
        const midiBus = new MidiBus();
        const midiMessages: any[] = [];
        midiBus.noteOff.add(data => midiMessages.push(data.message));
        const note1 = midiBus.addNote(new Note(60, 80, 1));
        note1.onTracker.accept();
        note1.on = false;
        midiBus.update(5);
        expect(midiMessages.length).to.equal(1);
        const message: NoteOffMessage = midiMessages[0];
        expect(message.channel).to.equal(1);
        expect(message.pitch).to.equal(60);
        expect(message.velocity).to.equal(80);
    }

    @test 'update doesnt send stop message if it would end a running note'() {
        const midiBus = new MidiBus();
        const midiMessages: any[] = [];
        midiBus.noteOff.add(data => midiMessages.push(data.message));
        const note1 = midiBus.addNote(new Note(60, 80, 1));
        const note2 = midiBus.addNote(new Note(60, 80, 1));
        note1.onTracker.accept();
        note1.on = false;
        note2.onTracker.accept();
        midiBus.update(5);
        expect(midiMessages.length).to.equal(0);
    }

    @test 'update sends start messages'() {
        const midiBus = new MidiBus();
        const midiMessages: any[] = [];
        midiBus.noteOn.add(data => midiMessages.push(data.message));
        midiBus.addNote(new Note(60, 80, 1));
        midiBus.update(5);
        expect(midiMessages.length).to.equal(1);
        const message: NoteOnMessage = midiMessages[0];
        expect(message.channel).to.equal(1);
        expect(message.pitch).to.equal(60);
        expect(message.velocity).to.equal(80);
    }

    @test 'update sends pressure change messages'() {
        const midiBus = new MidiBus();
        const midiMessages: any[] = [];
        midiBus.notePressure.add(data => midiMessages.push(data.message));
        const note1 = midiBus.addNote(new Note(60, 80, 1));
        note1.onTracker.accept();
        note1.velocity = 90;
        midiBus.update(5);
        expect(midiMessages.length).to.equal(1);
        const message: NotePressureMessage = midiMessages[0];
        expect(message.channel).to.equal(1);
        expect(message.pitch).to.equal(60);
        expect(message.velocity).to.equal(90);
    }

    @test 'sendMessage sends data'() {
        const midiBus = new MidiBus();
        const midiMessages: any[] = [];
        midiBus.noteOff.add(data => midiMessages.push(data.message));
        midiBus.sendMessage(new NoteOffMessage(60, 80, 0));
        expect(midiMessages.length).to.equal(1);
        const message: NoteOffMessage = midiMessages[0];
        expect(message.channel).to.equal(0);
        expect(message.pitch).to.equal(60);
        expect(message.velocity).to.equal(80);
    }

    @test 'sendRawData validates parameters'() {
        const midiBus = new MidiBus();
        expect(() => midiBus.sendRawData(null)).to.throw('No data specified to send');
        expect(() => midiBus.sendRawData([])).to.throw('No data specified to send');
    }

    @test 'sendRawData sends correct message'() {
        const midiBus = new MidiBus();
        const midiMessages: any[] = [];
        midiBus.noteOff.add(data => midiMessages.push(data.message));
        midiBus.sendRawData([0x80 + 2, 60, 80]);
        expect(midiMessages.length).to.equal(1);
        const message: NoteOffMessage = midiMessages[0];
        expect(message.channel).to.equal(2);
        expect(message.pitch).to.equal(60);
        expect(message.velocity).to.equal(80);
    }

    @test 'receiveData can send out tick events'() {
        const midiBus = new MidiBus();
        let tickCount = 0;
        midiBus.tick.add(data => tickCount++);
        expect(tickCount).to.equal(0);
        midiBus.receiveData([0xF8]);
        midiBus.receiveData([0xF8]);
        expect(tickCount).to.equal(2);
    }

    @test 'stopNotes ends all notes if no filter provided'() {
        const midiBus = new MidiBus();
        midiBus.addNote(new Note(20, 20, 0));
        midiBus.addNote(new Note(30, 30, 1));
        midiBus.addNote(new Note(40, 40, 2));
        expect(midiBus.notes.filter(x => x.on).length).to.equal(3);
        midiBus.stopNotes();
        expect(midiBus.notes.filter(x => x.on).length).to.equal(0);
    }

    @test 'finished event gets fired'() {
        //Setup
        const midiBus = new MidiBus();
        let testVar = 0;
        midiBus.finished.add(() => testVar = 3);

        midiBus.finish();
        expect(testVar).to.equal(3);
    }
}