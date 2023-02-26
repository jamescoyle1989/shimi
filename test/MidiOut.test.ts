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
        port.data = undefined;
        midiOut.update(5);
        expect(port.data).to.be.undefined;
    }

    @test 'addNote sends start message if note is on'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port);
        const note1 = midiOut.addNote(new Note(60, 80, 1));
        expect(port.data.length).to.equal(3);
        expect(port.data[0]).to.equal(0x90 + 1);
        expect(port.data[1]).to.equal(60);
        expect(port.data[2]).to.equal(80);
    }

    @test 'update sends start messages only if not sent when note added'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port);
        const note1 = new Note(60, 80, 1);
        note1.on = false;
        midiOut.addNote(note1);
        expect(port.data).to.be.undefined;
        note1.on = true;
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

    @test 'suppressPortValidationErrors prevents validation error from being thrown on sendMessage'() {
        const midiOut = new MidiOut(null);
        midiOut.suppressPortValidationErrors = true;
        expect(midiOut.sendMessage(new NoteOffMessage(0,0,0))).to.be.false;
    }

    @test 'suppressPortValidationErrors prevents validation error from being thrown on sendRawData'() {
        const midiOut = new MidiOut(null);
        midiOut.suppressPortValidationErrors = true;
        expect(midiOut.sendRawData([99, 48, 139, 77])).to.be.false;
    }

    @test 'stopNotes ends all notes if no filter provided'() {
        const midiOut = new MidiOut(new MockPort());
        midiOut.addNote(new Note(20, 20, 0));
        midiOut.addNote(new Note(30, 30, 1));
        midiOut.addNote(new Note(40, 40, 2));
        expect(midiOut.notes.filter(x => x.on).length).to.equal(3);
        midiOut.stopNotes();
        expect(midiOut.notes.filter(x => x.on).length).to.equal(0);
    }

    @test 'finished event gets fired'() {
        //Setup
        const midiOut = new MidiOut(new MockPort());
        let testVar = 0;
        midiOut.finished.add(() => testVar = 3);

        midiOut.finish();
        expect(testVar).to.equal(3);
    }
}