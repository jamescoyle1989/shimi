import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import DummyMidiOutChild from './DummyMidiOutChild';
import MidiOut from '../src/MidiOut';
import Note from '../src/Note';

class MockPort {
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

    @test 'update runs child processes'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port);
        const process = new DummyMidiOutChild();
        midiOut.addProcess(process);
        expect(process.totalDeltaMs).to.equal(0);
        midiOut.update(5);
        expect(process.totalDeltaMs).to.equal(5);
    }

    @test 'update removes finished child processes'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port);
        const process = new DummyMidiOutChild();
        midiOut.addProcess(process);
        midiOut.stopProcesses(p => true);
        expect(midiOut.processes.length).to.equal(1);
        midiOut.update(5);
        expect(midiOut.processes.length).to.equal(0);
    }

    @test 'stopProcesses finishes targetted processes, doesnt remove them'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port);
        const process = new DummyMidiOutChild();
        midiOut.addProcess(process);
        expect(process.finished).to.be.false;
        midiOut.stopProcesses(p => true);
        expect(process.finished).to.be.true;
    }

    @test 'sendNoteOff validates port'() {
        const midiOut = new MidiOut(null);
        expect(() => midiOut.sendNoteOff(0,0,0)).to.throw();
    }

    @test 'sendNoteOff validates parameters'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port);
        expect(() => midiOut.sendNoteOff(-1,0,0)).to.throw('pitch cannot be less than 0');
        expect(() => midiOut.sendNoteOff(128,0,0)).to.throw('pitch cannot be greater than 127');
        expect(() => midiOut.sendNoteOff(0,-1,0)).to.throw('velocity cannot be less than 0');
        expect(() => midiOut.sendNoteOff(0,128,0)).to.throw('velocity cannot be greater than 127');
        expect(() => midiOut.sendNoteOff(0,0,-1)).to.throw('channel cannot be less than 0');
        expect(() => midiOut.sendNoteOff(0,0,16)).to.throw('channel cannot be greater than 15');
    }

    @test 'sendNoteOff sends correct data'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port);
        midiOut.sendNoteOff(15, 73, 4);
        expect(port.data.length).to.equal(3);
        expect(port.data[0]).to.equal(0x80 + 4);
        expect(port.data[1]).to.equal(15);
        expect(port.data[2]).to.equal(73);
    }

    @test 'sendNoteOn validates port'() {
        const midiOut = new MidiOut(null);
        expect(() => midiOut.sendNoteOn(0,0,0)).to.throw();
    }

    @test 'sendNoteOn validates parameters'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port);
        expect(() => midiOut.sendNoteOn(-1,0,0)).to.throw('pitch cannot be less than 0');
        expect(() => midiOut.sendNoteOn(128,0,0)).to.throw('pitch cannot be greater than 127');
        expect(() => midiOut.sendNoteOn(0,-1,0)).to.throw('velocity cannot be less than 0');
        expect(() => midiOut.sendNoteOn(0,128,0)).to.throw('velocity cannot be greater than 127');
        expect(() => midiOut.sendNoteOn(0,0,-1)).to.throw('channel cannot be less than 0');
        expect(() => midiOut.sendNoteOn(0,0,16)).to.throw('channel cannot be greater than 15');
    }

    @test 'sendNoteOn sends correct data'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port);
        midiOut.sendNoteOn(15, 73, 4);
        expect(port.data.length).to.equal(3);
        expect(port.data[0]).to.equal(0x90 + 4);
        expect(port.data[1]).to.equal(15);
        expect(port.data[2]).to.equal(73);
    }

    @test 'sendNotePressure validates port'() {
        const midiOut = new MidiOut(null);
        expect(() => midiOut.sendNotePressure(0,0,0)).to.throw();
    }

    @test 'sendNotePressure validates parameters'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port);
        expect(() => midiOut.sendNotePressure(-1,0,0)).to.throw('pitch cannot be less than 0');
        expect(() => midiOut.sendNotePressure(128,0,0)).to.throw('pitch cannot be greater than 127');
        expect(() => midiOut.sendNotePressure(0,-1,0)).to.throw('velocity cannot be less than 0');
        expect(() => midiOut.sendNotePressure(0,128,0)).to.throw('velocity cannot be greater than 127');
        expect(() => midiOut.sendNotePressure(0,0,-1)).to.throw('channel cannot be less than 0');
        expect(() => midiOut.sendNotePressure(0,0,16)).to.throw('channel cannot be greater than 15');
    }

    @test 'sendNotePressure sends correct data'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port);
        midiOut.sendNotePressure(15, 73, 4);
        expect(port.data.length).to.equal(3);
        expect(port.data[0]).to.equal(0xA0 + 4);
        expect(port.data[1]).to.equal(15);
        expect(port.data[2]).to.equal(73);
    }

    @test 'sendControlChange validates port'() {
        const midiOut = new MidiOut(null);
        expect(() => midiOut.sendControlChange(0,0,0)).to.throw();
    }

    @test 'sendControlChange validates parameters'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port);
        expect(() => midiOut.sendControlChange(-1,0,0)).to.throw('controller cannot be less than 0');
        expect(() => midiOut.sendControlChange(128,0,0)).to.throw('controller cannot be greater than 127');
        expect(() => midiOut.sendControlChange(0,-1,0)).to.throw('value cannot be less than 0');
        expect(() => midiOut.sendControlChange(0,128,0)).to.throw('value cannot be greater than 127');
        expect(() => midiOut.sendControlChange(0,0,-1)).to.throw('channel cannot be less than 0');
        expect(() => midiOut.sendControlChange(0,0,16)).to.throw('channel cannot be greater than 15');
    }

    @test 'sendControlChange sends correct data'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port);
        midiOut.sendControlChange(15, 73, 4);
        expect(port.data.length).to.equal(3);
        expect(port.data[0]).to.equal(0xB0 + 4);
        expect(port.data[1]).to.equal(15);
        expect(port.data[2]).to.equal(73);
    }

    @test 'sendProgramChange validates port'() {
        const midiOut = new MidiOut(null);
        expect(() => midiOut.sendProgramChange(0,0)).to.throw();
    }

    @test 'sendProgramChange validates parameters'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port);
        expect(() => midiOut.sendProgramChange(-1,0)).to.throw('program cannot be less than 0');
        expect(() => midiOut.sendProgramChange(128,0)).to.throw('program cannot be greater than 127');
        expect(() => midiOut.sendProgramChange(0,-1)).to.throw('channel cannot be less than 0');
        expect(() => midiOut.sendProgramChange(0,16)).to.throw('channel cannot be greater than 15');
    }

    @test 'sendProgramChange sends correct data'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port);
        midiOut.sendProgramChange(15, 4);
        expect(port.data.length).to.equal(2);
        expect(port.data[0]).to.equal(0xC0 + 4);
        expect(port.data[1]).to.equal(15);
    }

    @test 'sendChannelPressure validates port'() {
        const midiOut = new MidiOut(null);
        expect(() => midiOut.sendChannelPressure(0,0)).to.throw();
    }

    @test 'sendChannelPressure validates parameters'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port);
        expect(() => midiOut.sendChannelPressure(-1,0)).to.throw('value cannot be less than 0');
        expect(() => midiOut.sendChannelPressure(128,0)).to.throw('value cannot be greater than 127');
        expect(() => midiOut.sendChannelPressure(0,-1)).to.throw('channel cannot be less than 0');
        expect(() => midiOut.sendChannelPressure(0,16)).to.throw('channel cannot be greater than 15');
    }

    @test 'sendChannelPressure sends correct data'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port);
        midiOut.sendChannelPressure(15, 4);
        expect(port.data.length).to.equal(2);
        expect(port.data[0]).to.equal(0xD0 + 4);
        expect(port.data[1]).to.equal(15);
    }

    @test 'sendPitchBend validates port'() {
        const midiOut = new MidiOut(null);
        expect(() => midiOut.sendPitchBend(0,0)).to.throw();
    }

    @test 'sendPitchBend validates parameters'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port);
        expect(() => midiOut.sendPitchBend(-1.1,0)).to.throw('percent cannot be less than -1');
        expect(() => midiOut.sendPitchBend(1.1,0)).to.throw('percent cannot be greater than 1');
        expect(() => midiOut.sendPitchBend(0,-1)).to.throw('channel cannot be less than 0');
        expect(() => midiOut.sendPitchBend(0,16)).to.throw('channel cannot be greater than 15');
    }

    @test 'sendPitchBend sends correct data'() {
        const port = new MockPort();
        const midiOut = new MidiOut(port);
        const percent = (Math.random() * 2) - 1;
        midiOut.sendPitchBend(percent, 4);
        expect(port.data.length).to.equal(3);
        expect(port.data[0]).to.equal(0xE0 + 4);
        const bendVal = Math.round((percent * 8192) + 8192);
        expect(port.data[1]).to.equal(bendVal % 128);
        expect(port.data[2]).to.equal(Math.floor(bendVal / 128));
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