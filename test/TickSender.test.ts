import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import TickSender from '../src/TickSender';
import Metronome from '../src/Metronome';
import { Clock, MidiBus } from '../src';


@suite class TickSenderTests {
    @test 'TickSender requires metronome and midi output be passed in to constructor'() {
        const metronome = new Metronome(120);
        const midiOut = new MidiBus();
        expect(() => new TickSender(null, null)).to.throw();
        expect(() => new TickSender(metronome, null)).to.throw();
        expect(() => new TickSender(null, midiOut)).to.throw();
        new TickSender(metronome, midiOut);
    }

    @test 'TickSender stores metronome and midi output'() {
        const metronome = new Metronome(120);
        const midiOut = new MidiBus();
        const tickSender = new TickSender(metronome, midiOut);
        expect(tickSender.metronome).to.equal(metronome);
        expect(tickSender.midiOut).to.equal(midiOut);
    }

    @test 'TickSender can be added to clock'() {
        const clock = new Clock();
        const metronome = new Metronome(120);
        const midiOut = new MidiBus();
        const tickSender = new TickSender(metronome, midiOut);
        clock.addChild(tickSender);
    }
}