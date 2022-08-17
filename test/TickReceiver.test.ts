import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import Clock from '../src/Clock';
import TickReceiver from '../src/TickReceiver';
import { MockPort } from './MidiOut.test';
import MidiIn, { MidiInEventData } from '../src/MidiIn';
import Metronome from '../src/Metronome';
import { TickMessage } from '../src/MidiMessages';

@suite class TickReceiverTests {
    @test 'TickReceiver can be added to clock'() {
        const clock = new Clock();
        const receiver = new TickReceiver(new MidiIn(new MockPort()), new Metronome(120));
        clock.addChild(receiver);
        expect(clock.children.length).to.equal(1);
    }

    @test 'TickReceiver takes midi-in, metronome & ticks per quarter note as constructor params'() {
        const midiIn = new MidiIn(new MockPort());
        const metronome = new Metronome(120);
        const receiver = new TickReceiver(midiIn, metronome, 960);
        expect(receiver.midiIn).to.equal(midiIn);
        expect(receiver.metronome).to.equal(metronome);
        expect(receiver.ticksPerQuarterNote).to.equal(960);
    }

    @test 'TickReceiver constructor validates midi-in is set'() {
        const metronome = new Metronome(120);
        expect(() => new TickReceiver(null, metronome)).to.throw();
    }

    @test 'TickReceiver constructor validates metronome is set'() {
        const midiIn = new MidiIn(new MockPort());
        expect(() => new TickReceiver(midiIn, null)).to.throw();
    }

    @test 'TickReceiver constructor validates ticksPerQuarterNote is positive value'() {
        const midiIn = new MidiIn(new MockPort());
        const metronome = new Metronome(120);
        expect(() => new TickReceiver(midiIn, metronome, -1)).to.throw();
        expect(() => new TickReceiver(midiIn, metronome, 0)).to.throw();
    }

    @test 'MidiIn.tick gets subscribed to'() {
        const midiIn = new MidiIn(new MockPort());
        const metronome = new Metronome(120);
        expect(midiIn.tick.handlers.length).to.equal(0);
        const receiver = new TickReceiver(midiIn, metronome);
        expect(midiIn.tick.handlers.length).to.equal(1);
    }

    @test 'MidiIn.tick gets unsubscribed from when midiIn changed'() {
        const midiIn1 = new MidiIn(new MockPort());
        const midiIn2 = new MidiIn(new MockPort());
        const metronome = new Metronome(120);
        const receiver = new TickReceiver(midiIn1, metronome);
        expect(midiIn1.tick.handlers.length).to.equal(1);
        receiver.midiIn = midiIn2;
        expect(midiIn1.tick.handlers.length).to.equal(0);
        expect(midiIn2.tick.handlers.length).to.equal(1);
    }

    @test 'MidiIn.tick gets unsubscribed once receiver is finished'() {
        const midiIn = new MidiIn(new MockPort());
        const metronome = new Metronome(120);
        const receiver = new TickReceiver(midiIn, metronome);
        expect(midiIn.tick.handlers.length).to.equal(1);
        receiver.finish();
        expect(midiIn.tick.handlers.length).to.equal(0);
    }

    @test 'MidiIn.tick increments newTicksReceived'() {
        const midiIn = new MidiIn(new MockPort());
        const metronome = new Metronome(120);
        const receiver = new TickReceiver(midiIn, metronome);
        expect(receiver.newTicksReceived).to.equal(0);
        midiIn.tick.trigger(new MidiInEventData(midiIn, new TickMessage()));
        expect(receiver.newTicksReceived).to.equal(1);
    }

    @test 'update resets newTicksReceived to 0'() {
        const midiIn = new MidiIn(new MockPort());
        const metronome = new Metronome(120);
        const receiver = new TickReceiver(midiIn, metronome);
        midiIn.tick.trigger(new MidiInEventData(midiIn, new TickMessage()));
        midiIn.tick.trigger(new MidiInEventData(midiIn, new TickMessage()));
        expect(receiver.newTicksReceived).to.equal(2);
        receiver.update(0);
        expect(receiver.newTicksReceived).to.equal(0);
    }

    @test 'update increments metronome quarter note'() {
        const midiIn = new MidiIn(new MockPort());
        const metronome = new Metronome(120);
        //4 ticks per quarter note, so that 2 ticks updates quarter note to 0.5
        const receiver = new TickReceiver(midiIn, metronome, 4);
        midiIn.tick.trigger(new MidiInEventData(midiIn, new TickMessage()));
        midiIn.tick.trigger(new MidiInEventData(midiIn, new TickMessage()));
        expect(metronome.totalQuarterNote).to.equal(0);
        receiver.update(0);
        expect(metronome.totalQuarterNote).to.equal(0.5);
    }
}