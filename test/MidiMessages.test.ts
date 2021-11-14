import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import { PitchBendMessage } from '../src/MidiMessages';


@suite class MidiMessageTests {
    @test 'PitchBendMessage.calculatePercent returns correct values'() {
        expect(PitchBendMessage.calculatePercent(0x00, 0x40)).to.equal(0);
        expect(PitchBendMessage.calculatePercent(0x00, 0x00)).to.equal(-1);
        expect(PitchBendMessage.calculatePercent(0x7F, 0x7F)).to.equal(1);
    }
}