import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import { PitchBendMessage } from '../src/MidiMessages';
import * as messages from '../src/MidiMessages';


@suite class MidiMessageTests {
    @test 'NoteOff.toArray validates parameters'() {
        expect(() => new messages.NoteOffMessage(-1,0,0).toArray()).to.throw('pitch cannot be less than 0');
        expect(() => new messages.NoteOffMessage(128,0,0).toArray()).to.throw('pitch cannot be greater than 127');
        expect(() => new messages.NoteOffMessage(0,-1,0).toArray()).to.throw('velocity cannot be less than 0');
        expect(() => new messages.NoteOffMessage(0,128,0).toArray()).to.throw('velocity cannot be greater than 127');
        expect(() => new messages.NoteOffMessage(0,0,-1).toArray()).to.throw('channel cannot be less than 0');
        expect(() => new messages.NoteOffMessage(0,0,16).toArray()).to.throw('channel cannot be greater than 15');
    }

    @test 'NoteOff.toArray sends correct data'() {
        const array = new messages.NoteOffMessage(15, 73, 4).toArray();
        expect(array.length).to.equal(3);
        expect(array[0]).to.equal(0x80 + 4);
        expect(array[1]).to.equal(15);
        expect(array[2]).to.equal(73);
    }

    @test 'NoteOn.toArray validates parameters'() {
        expect(() => new messages.NoteOnMessage(-1,0,0).toArray()).to.throw('pitch cannot be less than 0');
        expect(() => new messages.NoteOnMessage(128,0,0).toArray()).to.throw('pitch cannot be greater than 127');
        expect(() => new messages.NoteOnMessage(0,-1,0).toArray()).to.throw('velocity cannot be less than 0');
        expect(() => new messages.NoteOnMessage(0,128,0).toArray()).to.throw('velocity cannot be greater than 127');
        expect(() => new messages.NoteOnMessage(0,0,-1).toArray()).to.throw('channel cannot be less than 0');
        expect(() => new messages.NoteOnMessage(0,0,16).toArray()).to.throw('channel cannot be greater than 15');
    }

    @test 'NoteOn.toArray sends correct data'() {
        const array = new messages.NoteOnMessage(15, 73, 4).toArray();
        expect(array.length).to.equal(3);
        expect(array[0]).to.equal(0x90 + 4);
        expect(array[1]).to.equal(15);
        expect(array[2]).to.equal(73);
    }

    @test 'NotePressure.toArray validates parameters'() {
        expect(() => new messages.NotePressureMessage(-1,0,0).toArray()).to.throw('pitch cannot be less than 0');
        expect(() => new messages.NotePressureMessage(128,0,0).toArray()).to.throw('pitch cannot be greater than 127');
        expect(() => new messages.NotePressureMessage(0,-1,0).toArray()).to.throw('velocity cannot be less than 0');
        expect(() => new messages.NotePressureMessage(0,128,0).toArray()).to.throw('velocity cannot be greater than 127');
        expect(() => new messages.NotePressureMessage(0,0,-1).toArray()).to.throw('channel cannot be less than 0');
        expect(() => new messages.NotePressureMessage(0,0,16).toArray()).to.throw('channel cannot be greater than 15');
    }

    @test 'NotePressure.toArray sends correct data'() {
        const array = new messages.NotePressureMessage(15, 73, 4).toArray();
        expect(array.length).to.equal(3);
        expect(array[0]).to.equal(0xA0 + 4);
        expect(array[1]).to.equal(15);
        expect(array[2]).to.equal(73);
    }

    @test 'ControlChange.toArray validates parameters'() {
        expect(() => new messages.ControlChangeMessage(-1,0,0).toArray()).to.throw('controller cannot be less than 0');
        expect(() => new messages.ControlChangeMessage(128,0,0).toArray()).to.throw('controller cannot be greater than 127');
        expect(() => new messages.ControlChangeMessage(0,-1,0).toArray()).to.throw('value cannot be less than 0');
        expect(() => new messages.ControlChangeMessage(0,128,0).toArray()).to.throw('value cannot be greater than 127');
        expect(() => new messages.ControlChangeMessage(0,0,-1).toArray()).to.throw('channel cannot be less than 0');
        expect(() => new messages.ControlChangeMessage(0,0,16).toArray()).to.throw('channel cannot be greater than 15');
    }

    @test 'ControlChange.toArray sends correct data'() {
        const array = new messages.ControlChangeMessage(15, 73, 4).toArray();
        expect(array.length).to.equal(3);
        expect(array[0]).to.equal(0xB0 + 4);
        expect(array[1]).to.equal(15);
        expect(array[2]).to.equal(73);
    }

    @test 'ProgramChange.toArray validates parameters'() {
        expect(() => new messages.ProgramChangeMessage(-1,0).toArray()).to.throw('program cannot be less than 0');
        expect(() => new messages.ProgramChangeMessage(128,0).toArray()).to.throw('program cannot be greater than 127');
        expect(() => new messages.ProgramChangeMessage(0,-1).toArray()).to.throw('channel cannot be less than 0');
        expect(() => new messages.ProgramChangeMessage(0,16).toArray()).to.throw('channel cannot be greater than 15');
    }

    @test 'ProgramChange.toArray sends correct data'() {
        const array = new messages.ProgramChangeMessage(15, 4).toArray();
        expect(array.length).to.equal(2);
        expect(array[0]).to.equal(0xC0 + 4);
        expect(array[1]).to.equal(15);
    }

    @test 'ChannelPressure.toArray validates parameters'() {
        expect(() => new messages.ChannelPressureMessage(-1,0).toArray()).to.throw('value cannot be less than 0');
        expect(() => new messages.ChannelPressureMessage(128,0).toArray()).to.throw('value cannot be greater than 127');
        expect(() => new messages.ChannelPressureMessage(0,-1).toArray()).to.throw('channel cannot be less than 0');
        expect(() => new messages.ChannelPressureMessage(0,16).toArray()).to.throw('channel cannot be greater than 15');
    }

    @test 'ChannelPressure.toArray sends correct data'() {
        const array = new messages.ChannelPressureMessage(15, 4).toArray();
        expect(array.length).to.equal(2);
        expect(array[0]).to.equal(0xD0 + 4);
        expect(array[1]).to.equal(15);
    }

    @test 'PitchBend.toArray validates parameters'() {
        expect(() => new messages.PitchBendMessage(-1.1,0).toArray()).to.throw('percent cannot be less than -1');
        expect(() => new messages.PitchBendMessage(1.1,0).toArray()).to.throw('percent cannot be greater than 1');
        expect(() => new messages.PitchBendMessage(0,-1).toArray()).to.throw('channel cannot be less than 0');
        expect(() => new messages.PitchBendMessage(0,16).toArray()).to.throw('channel cannot be greater than 15');
    }

    @test 'PitchBend.toArray sends correct data'() {
        const percent = (Math.random() * 2) - 1;
        const array = new messages.PitchBendMessage(percent, 4).toArray();
        expect(array.length).to.equal(3);
        expect(array[0]).to.equal(0xE0 + 4);
        const bendVal = Math.round((percent * 8192) + 8192);
        expect(array[1]).to.equal(bendVal % 128);
        expect(array[2]).to.equal(Math.floor(bendVal / 128));
    }

    @test 'PitchBendMessage.calculatePercent returns correct values'() {
        expect(PitchBendMessage.calculatePercent(0x00, 0x40)).to.equal(0);
        expect(PitchBendMessage.calculatePercent(0x00, 0x00)).to.equal(-1);
        expect(PitchBendMessage.calculatePercent(0x7F, 0x7F)).to.equal(1);
    }

    @test 'SongPositionMessage.toArray returns correct values'() {
        const message = new messages.SongPositionMessage(12345);
        const array = message.toArray();
        expect(array[0]).to.equal(0xF2);
        expect(array[1]).to.equal(57);
        expect(array[2]).to.equal(96);
    }

    @test 'SongPositionMessage.toArray throws error if value less than 0'() {
        const message = new messages.SongPositionMessage(-1);
        expect(() => message.toArray()).to.throw();
    }

    @test 'SongPositionMessage.toArray throws error if value greater than 16383'() {
        const message = new messages.SongPositionMessage(16384);
        expect(() => message.toArray()).to.throw();
    }
}