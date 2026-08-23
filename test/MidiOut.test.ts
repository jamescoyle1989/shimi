import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import { NoteOffMessage } from '../src/MidiMessages';
import MidiOut from '../src/MidiOut';
import Note from '../src/Note';
import Clock from '../src/Clock';

export class MockPort {
    data: number[];
    history: Array<number[]> = [];

    send(data: number[]) {
        this.data = data;
        this.history.push(data);
    }
}

@suite class MidiOutTests {
    @test 'stopNotes sends messages, turns off and removes notes'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port as any);
        const note1 = midiOut.addNote(new Note(60, 80, 1));
        const note2 = midiOut.addNote(new Note(62, 80, 1));
        expect(midiOut.notes.length).to.equal(2);

        midiOut.stopNotes(n => n.pitch == 60);

        expect(port.data.length).to.equal(3);
        expect(port.data[0]).to.equal(0x80 + 1);
        expect(port.data[1]).to.equal(60);
        expect(port.data[2]).to.equal(80);
        expect(note1.on).to.be.false;
        expect(midiOut.notes.length).to.equal(1);
    }

    @test 'update removes stopped notes'() {
        const midiOut = new MidiOut(new MockPort() as any);
        const note1 = midiOut.addNote(new Note(60, 80, 1));
        const note2 = midiOut.addNote(new Note(62, 80, 1)).on = false;
        expect(midiOut.notes.length).to.equal(2);
        midiOut.update(10);
        expect(midiOut.notes.length).to.equal(1);
    }

    @test 'update sends stop messages'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port as any);
        const note1 = midiOut.addNote(new Note(60, 80, 1));
        note1.onTracker.accept();
        note1.on = false;
        midiOut.update(5);
        expect(port.data.length).to.equal(3);
        expect(port.data[0]).to.equal(0x80 + 1);
        expect(port.data[1]).to.equal(60);
        expect(port.data[2]).to.equal(80);
    }

    @test 'update doesnt send stop message if it would end a running note'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port as any);
        const note1 = midiOut.addNote(new Note(60, 80, 1));
        const note2 = midiOut.addNote(new Note(60, 80, 1));
        note1.onTracker.accept();
        note1.on = false;
        note2.onTracker.accept();
        port.data = undefined;
        midiOut.update(5);
        expect(port.data).to.be.undefined;
    }

    @test 'addNote sends start message'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port as any);
        const note1 = midiOut.addNote(new Note(60, 80, 1));
        expect(port.data.length).to.equal(3);
        expect(port.data[0]).to.equal(0x90 + 1);
        expect(port.data[1]).to.equal(60);
        expect(port.data[2]).to.equal(80);
    }

    @test 'addNote stops existing notes before sending out note on'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port as any);
        const note1 = midiOut.addNote(new Note(60, 80, 1));
        const note2 = midiOut.addNote(new Note(60, 90, 1));
        expect(port.history.length).to.equal(3);
        expect(port.history[0][0]).to.equal(0x90 + 1);
        expect(port.history[0][2]).to.equal(note1.velocity);
        expect(port.history[1][0]).to.equal(0x80 + 1);
        expect(port.history[2][0]).to.equal(0x90 + 1);
        expect(port.history[2][2]).to.equal(note2.velocity);
    }

    @test 'addNote throws error if note not on'() {
        const midiOut = new MidiOut(new MockPort() as any);
        const note1 = new Note(60, 80, 1);
        note1.on = false;
        expect(() => midiOut.addNote(note1)).to.throw();
    }

    @test 'update sends pressure change messages'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port as any);
        const note1 = midiOut.addNote(new Note(60, 80, 1));
        note1.onTracker.accept();
        note1.velocity = 90;
        midiOut.update(5);
        expect(port.data.length).to.equal(3);
        expect(port.data[0]).to.equal(0xA0 + 1);
        expect(port.data[1]).to.equal(60);
        expect(port.data[2]).to.equal(90);
    }

    @test 'sendMessage sends data'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port as any);
        midiOut.sendMessage(new NoteOffMessage(60, 80, 0));
        expect(port.data.length).to.equal(3);
        expect(port.data[0]).to.equal(0x80 + 0);
        expect(port.data[1]).to.equal(60);
        expect(port.data[2]).to.equal(80);
    }

    @test 'sendRawData validates parameters'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port as any);
        expect(() => midiOut.sendRawData(null)).to.throw('No data specified to send');
        expect(() => midiOut.sendRawData([])).to.throw('No data specified to send');
    }

    @test 'sendRawData sends correct data'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port as any);
        midiOut.sendRawData([99, 48, 139, 77]);
        expect(port.data.length).to.equal(4);
        expect(port.data[0]).to.equal(99);
        expect(port.data[1]).to.equal(48);
        expect(port.data[2]).to.equal(139);
        expect(port.data[3]).to.equal(77);
    }

    @test 'stopNotes ends all notes if no filter provided'() {
        const midiOut = new MidiOut(new MockPort() as any);
        midiOut.addNote(new Note(20, 20, 0));
        midiOut.addNote(new Note(30, 30, 1));
        midiOut.addNote(new Note(40, 40, 2));
        expect(midiOut.notes.filter(x => x.on).length).to.equal(3);
        midiOut.stopNotes();
        expect(midiOut.notes.filter(x => x.on).length).to.equal(0);
    }

    @test 'finished event gets fired'() {
        //Setup
        const midiOut = new MidiOut(new MockPort() as any);
        let testVar = 0;
        midiOut.finished.add(() => testVar = 3);

        midiOut.finish();
        expect(testVar).to.equal(3);
    }

    @test 'Automatically adds itself to default clock if set'() {
        Clock.default = new Clock();
        const midiOut = new MidiOut(new MockPort() as any);

        expect(Clock.default.children).to.contain(midiOut);

        Clock.default = null;
    }

    @test 'Correctly handles new note replacing old one and sending messages in correct order'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port as any);
        const note1 = midiOut.addNote(new Note(60, 80, 1));
        expect(note1.on).to.be.true;
        const note2 = midiOut.addNote(new Note(60, 80, 1));
        expect(note1.on).to.be.false;
        note2.stop();
        midiOut.update(100);
        expect(port.history.length).to.equal(4);
        expect(port.history[0][0]).to.equal(0x90 + 1);
        expect(port.history[1][0]).to.equal(0x80 + 1);
        expect(port.history[2][0]).to.equal(0x90 + 1);
        expect(port.history[3][0]).to.equal(0x80 + 1);
    }
}