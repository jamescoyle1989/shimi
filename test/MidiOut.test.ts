import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import { NoteOffMessage } from '../src/MidiMessages';
import MidiOut from '../src/MidiOut';
import Note from '../src/Note';

export class MockPort {
    data: number[];

    send(data: number[]) {
        this.data = data;
    }
}

@suite class MidiOutTests {
    @test 'stop turns off notes'() {
        const midiOut = new MidiOut(new MockPort());
        const note1 = midiOut.addNote(new Note(60, 80, 1));
        const note2 = midiOut.addNote(new Note(62, 80, 1));
        expect(note1.on).to.be.true;
        expect(note2.on).to.be.true;
        midiOut.stopNotes(n => n.pitch == 60);
        expect(note1.on).to.be.false;
        expect(note2.on).to.be.true;
    }

    @test 'stop doesnt remove notes'() {
        const midiOut = new MidiOut(new MockPort());
        midiOut.addNote(new Note(60, 80, 1));
        midiOut.addNote(new Note(62, 80, 1));
        expect(midiOut.notes.length).to.equal(2);
        midiOut.stopNotes(n => n.pitch == 60);
        expect(midiOut.notes.length).to.equal(2);
    }

    @test 'update removes stopped notes'() {
        const midiOut = new MidiOut(new MockPort());
        const note1 = midiOut.addNote(new Note(60, 80, 1));
        const note2 = midiOut.addNote(new Note(62, 80, 1)).on = false;
        expect(midiOut.notes.length).to.equal(2);
        midiOut.update(10);
        expect(midiOut.notes.length).to.equal(1);
    }

    @test 'update sends stop messages'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port);
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
        const midiOut = new MidiOut(port);
        const note1 = midiOut.addNote(new Note(60, 80, 1));
        const note2 = midiOut.addNote(new Note(60, 80, 1));
        note1.onTracker.accept();
        note1.on = false;
        note2.onTracker.accept();
        midiOut.update(5);
        expect(port.data).to.be.undefined;
    }

    @test 'update sends start messages'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port);
        const note1 = midiOut.addNote(new Note(60, 80, 1));
        midiOut.update(5);
        expect(port.data.length).to.equal(3);
        expect(port.data[0]).to.equal(0x90 + 1);
        expect(port.data[1]).to.equal(60);
        expect(port.data[2]).to.equal(80);
    }

    @test 'update sends pressure change messages'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port);
        const note1 = midiOut.addNote(new Note(60, 80, 1));
        note1.onTracker.accept();
        note1.velocity = 90;
        midiOut.update(5);
        expect(port.data.length).to.equal(3);
        expect(port.data[0]).to.equal(0xA0 + 1);
        expect(port.data[1]).to.equal(60);
        expect(port.data[2]).to.equal(90);
    }

    @test 'sendMessage validates port'() {
        const midiOut = new MidiOut(null);
        expect(() => midiOut.sendMessage(new NoteOffMessage(0,0,0))).to.throw();
    }

    @test 'sendMessage sends data'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port);
        midiOut.sendMessage(new NoteOffMessage(60, 80, 0));
        expect(port.data.length).to.equal(3);
        expect(port.data[0]).to.equal(0x80 + 0);
        expect(port.data[1]).to.equal(60);
        expect(port.data[2]).to.equal(80);
    }

    @test 'sendRawData validates port'() {
        const midiOut = new MidiOut(null);
        expect(() => midiOut.sendRawData([99, 48, 139, 77])).to.throw();
    }

    @test 'sendRawData validates parameters'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port);
        expect(() => midiOut.sendRawData(null)).to.throw('No data specified to send');
        expect(() => midiOut.sendRawData([])).to.throw('No data specified to send');
    }

    @test 'sendRawData sends correct data'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port);
        midiOut.sendRawData([99, 48, 139, 77]);
        expect(port.data.length).to.equal(4);
        expect(port.data[0]).to.equal(99);
        expect(port.data[1]).to.equal(48);
        expect(port.data[2]).to.equal(139);
        expect(port.data[3]).to.equal(77);
    }
}