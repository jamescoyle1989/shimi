import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import TickSender from '../src/TickSender';
import Metronome from '../src/Metronome';
import { Clock, MidiBus } from '../src';
import { SongPositionMessage } from '../src/MidiMessages';


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

    @test 'TickSender constructor optionally stores ticksPerQuarterNote'() {
        const metronome = new Metronome(120);
        const midiOut = new MidiBus();
        expect(new TickSender(metronome, midiOut).ticksPerQuarterNote).to.equal(24);
        expect(new TickSender(metronome, midiOut, 48).ticksPerQuarterNote).to.equal(48);
    }

    @test 'Metronome value can be changed'() {
        const metronome1 = new Metronome(120);
        const metronome2 = new Metronome(130);
        const midiOut = new MidiBus();
        const tickSender = new TickSender(metronome1, midiOut);
        tickSender.metronome = metronome2;
        expect(tickSender.metronome).to.equal(metronome2);
    }

    @test 'Metronome cant be set falsy'() {
        const metronome = new Metronome(120);
        const midiOut = new MidiBus();
        const tickSender = new TickSender(metronome, midiOut);
        expect(() => tickSender.metronome = null).to.throw();
    }

    @test 'MidiOut value can be changed'() {
        const metronome = new Metronome(120);
        const midiOut1 = new MidiBus();
        const midiOut2 = new MidiBus();
        const tickSender = new TickSender(metronome, midiOut1);
        tickSender.midiOut = midiOut2;
        expect(tickSender.midiOut).to.equal(midiOut2);
    }

    @test 'MidiOut cant be set falsy'() {
        const metronome = new Metronome(120);
        const midiOut = new MidiBus();
        const tickSender = new TickSender(metronome, midiOut);
        expect(() => tickSender.midiOut = null).to.throw();
    }

    @test 'update sends out tick messages'() {
        const metronome = new Metronome(60);
        const midiOut = new MidiBus();
        let counter = 0;
        midiOut.tick.add(() => counter++);
        const tickSender = new TickSender(metronome, midiOut, 100);
        metronome.update(100);
        tickSender.update(100);
        expect(counter).to.equal(10);
    }

    @test 'TickSender subscribes to metronome positionChanged event'() {
        const metronome = new Metronome(100);
        const midiOut = new MidiBus();
        expect(metronome.positionChanged.handlers.length).to.equal(0);
        const tickSender = new TickSender(metronome, midiOut);
        expect(metronome.positionChanged.handlers.length).to.equal(1);
    }

    @test 'TickSender unsubscribes from metronome positionChanged if metronome changed'() {
        const metronome1 = new Metronome(100);
        const metronome2 = new Metronome(120);
        const midiOut = new MidiBus();
        const tickSender = new TickSender(metronome1, midiOut);
        expect(metronome1.positionChanged.handlers.length).to.equal(1);
        expect(metronome2.positionChanged.handlers.length).to.equal(0);
        tickSender.metronome = metronome2;
        expect(metronome1.positionChanged.handlers.length).to.equal(0);
        expect(metronome2.positionChanged.handlers.length).to.equal(1);
    }

    @test 'TickSender sends out song position message when set'() {
        const ticksPerQuarterNote = 24;
        const newQuarterNotePosition = 10;
        
        const metronome = new Metronome(120);
        const midiOut = new MidiBus();
        new TickSender(metronome, midiOut, ticksPerQuarterNote);
        const messages = [];
        midiOut.songPosition.add((data) => messages.push(data.message));
        metronome.setSongPosition(newQuarterNotePosition);
        expect(messages.length).to.equal(1);
        const songPositionMessage = messages[0] as SongPositionMessage;
        expect(songPositionMessage.value).to.equal(ticksPerQuarterNote * newQuarterNotePosition / 6);
    }

    @test 'TickSender sends start message when metronome first updated'() {
        const metronome = new Metronome(120);
        const midiOut = new MidiBus();
        let startCount = 0;
        midiOut.start.add(() => startCount++);
        new TickSender(metronome, midiOut);
        expect(startCount).to.equal(0);
        metronome.update(10);
        expect(startCount).to.equal(1);
    }

    @test 'TickSender sends stop message when metronome disabled'() {
        const metronome = new Metronome(120);
        const midiOut = new MidiBus();
        let stopCount = 0;
        midiOut.stop.add(() => stopCount++);
        new TickSender(metronome, midiOut);
        expect(stopCount).to.equal(0);
        metronome.enabled = false;
        expect(stopCount).to.equal(1);
        metronome.enabled = false;
        expect(stopCount).to.equal(1);
    }

    @test 'TickSender sends continue message when metronome enabled'() {
        const metronome = new Metronome(120);
        metronome.enabled = false;
        const midiOut = new MidiBus();
        let continueCount = 0;
        midiOut.continue.add(() => continueCount++);
        new TickSender(metronome, midiOut);
        expect(continueCount).to.equal(0);
        metronome.enabled = true;
        expect(continueCount).to.equal(1);
        metronome.enabled = true;
        expect(continueCount).to.equal(1);
    }

    @test 'Multiple cycle update test'() {
        const metronome = new Metronome(60);
        const midiOut = new MidiBus();
        let tickCount = 0;
        midiOut.tick.add(() => tickCount++);
        const tickSender = new TickSender(metronome, midiOut, 24);
        const updateMs = 20;
        const update = () => {
            metronome.update(updateMs);
            tickSender.update(updateMs);
        };
        update();
        expect(tickCount).to.equal(0);  //20
        update();
        expect(tickCount).to.equal(0);  //40
        update();
        expect(tickCount).to.equal(1);  //60
        update();
        expect(tickCount).to.equal(1);  //80
        update();
        expect(tickCount).to.equal(2);  //100
        update();
        expect(tickCount).to.equal(2);  //120
        update();
        expect(tickCount).to.equal(3);  //140
        update();
        expect(tickCount).to.equal(3);  //160
        update();
        expect(tickCount).to.equal(4);  //180
    }

    @test 'finished event gets fired'() {
        //Setup
        const metronome = new Metronome(120);
        const midiOut = new MidiBus();
        const tickSender = new TickSender(metronome, midiOut);
        let testVar = 0;
        tickSender.finished.add(() => testVar = 3);

        tickSender.finish();
        expect(testVar).to.equal(3);
    }

    @test 'Automatically adds itself to default clock if set'() {
        Clock.default = new Clock();
        const metronome = new Metronome(120);
        const midiOut = new MidiBus();
        const tickSender = new TickSender(metronome, midiOut);

        expect(Clock.default.children).to.contain(tickSender);

        Clock.default = null;
    }
}