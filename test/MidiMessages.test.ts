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

    @test 'NoteOff.duplicate creates exact copy'() {
        const message = new messages.NoteOffMessage(100, 90, 5);
        const duplicate = message.duplicate();
        expect(duplicate).to.not.equal(message);
        expect(duplicate.pitch).to.equal(message.pitch);
        expect(duplicate.velocity).to.equal(message.velocity);
        expect(duplicate.channel).to.equal(message.channel);
    }

    @test 'NoteOn.duplicate creates exact copy'() {
        const message = new messages.NoteOnMessage(100, 90, 5);
        const duplicate = message.duplicate();
        expect(duplicate).to.not.equal(message);
        expect(duplicate.pitch).to.equal(message.pitch);
        expect(duplicate.velocity).to.equal(message.velocity);
        expect(duplicate.channel).to.equal(message.channel);
    }

    @test 'NotePressure.duplicate creates exact copy'() {
        const message = new messages.NotePressureMessage(100, 90, 5);
        const duplicate = message.duplicate();
        expect(duplicate).to.not.equal(message);
        expect(duplicate.pitch).to.equal(message.pitch);
        expect(duplicate.velocity).to.equal(message.velocity);
        expect(duplicate.channel).to.equal(message.channel);
    }

    @test 'ControlChange.duplicate creates exact copy'() {
        const message = new messages.ControlChangeMessage(100, 90, 5);
        const duplicate = message.duplicate();
        expect(duplicate).to.not.equal(message);
        expect(duplicate.controller).to.equal(message.controller);
        expect(duplicate.value).to.equal(message.value);
        expect(duplicate.channel).to.equal(message.channel);
    }

    @test 'ProgramChange.duplicate creates exact copy'() {
        const message = new messages.ProgramChangeMessage(100, 5);
        const duplicate = message.duplicate();
        expect(duplicate).to.not.equal(message);
        expect(duplicate.program).to.equal(message.program);
        expect(duplicate.channel).to.equal(message.channel);
    }

    @test 'ChannelPressure.duplicate creates exact copy'() {
        const message = new messages.ChannelPressureMessage(100, 5);
        const duplicate = message.duplicate();
        expect(duplicate).to.not.equal(message);
        expect(duplicate.value).to.equal(message.value);
        expect(duplicate.channel).to.equal(message.channel);
    }

    @test 'PitchBend.duplicate creates exact copy'() {
        const message = new messages.PitchBendMessage(100, 5);
        const duplicate = message.duplicate();
        expect(duplicate).to.not.equal(message);
        expect(duplicate.percent).to.equal(message.percent);
        expect(duplicate.channel).to.equal(message.channel);
    }

    @test 'TickMessage.duplicate creates exact copy'() {
        const message = new messages.TickMessage();
        const duplicate = message.duplicate();
        expect(duplicate).to.not.equal(message);
    }

    @test 'TickMessage.toArray gives correct output'() {
        const message = new messages.TickMessage();
        const array = message.toArray();
        expect(array.length).to.equal(1);
        expect(array[0]).to.equal(0xF8);
    }

    @test 'SongPosition.duplicate creates exact copy'() {
        const message = new messages.SongPositionMessage(100);
        const duplicate = message.duplicate();
        expect(duplicate).to.not.equal(message);
        expect(duplicate.value).to.equal(message.value);
    }

    @test 'StartMessage.duplicate creates exact copy'() {
        const message = new messages.StartMessage();
        const duplicate = message.duplicate();
        expect(duplicate).to.not.equal(message);
    }

    @test 'StartMessage.toArray gives correct output'() {
        const message = new messages.StartMessage();
        const array = message.toArray();
        expect(array.length).to.equal(1);
        expect(array[0]).to.equal(0xFA);
    }

    @test 'ContinueMessage.duplicate creates exact copy'() {
        const message = new messages.ContinueMessage();
        const duplicate = message.duplicate();
        expect(duplicate).to.not.equal(message);
    }

    @test 'ContinueMessage.toArray gives correct output'() {
        const message = new messages.ContinueMessage();
        const array = message.toArray();
        expect(array.length).to.equal(1);
        expect(array[0]).to.equal(0xFB);
    }

    @test 'StopMessage.duplicate creates exact copy'() {
        const message = new messages.StopMessage();
        const duplicate = message.duplicate();
        expect(duplicate).to.not.equal(message);
    }

    @test 'StopMessage.toArray gives correct output'() {
        const message = new messages.StopMessage();
        const array = message.toArray();
        expect(array.length).to.equal(1);
        expect(array[0]).to.equal(0xFC);
    }
}