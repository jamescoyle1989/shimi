import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import DummyPort from './DummyPort';
import Cue from '../src/Cue';
import Metronome from '../src/Metronome';
import MidiOut from '../src/MidiOut';
import { Clock } from '../src';


@suite class CueTests {
    @test 'MsCue executes action after msCount has passed'() {
        const midiOut = new MidiOut(new DummyPort());
        let updateValue: number = 0;
        const cue = Cue.afterMs(100, () => updateValue = 59);
        cue.update(80);
        expect(updateValue).to.equal(0);
        cue.update(19);
        expect(updateValue).to.equal(0);
        cue.update(1);
        expect(updateValue).to.equal(59);
    }

    @test 'MsCue finishes after msCount has passed'() {
        const midiOut = new MidiOut(new DummyPort());
        let updateValue: number = 0;
        const cue = Cue.afterMs(100, () => updateValue = 59);
        cue.update(80);
        expect(cue.isFinished).to.be.false;
        cue.update(20);
        expect(cue.isFinished).to.be.true;
    }

    @test 'ConditionCue executes action once condition is met'() {
        const midiOut = new MidiOut(new DummyPort());
        let trigger: boolean = false;
        let updateValue: number = 0;
        const cue = Cue.when(() => trigger, () => updateValue = 59);
        cue.update(100000);
        expect(updateValue).to.equal(0);
        trigger = true;
        cue.update(10);
        expect(updateValue).to.equal(59);
    }

    @test 'ConditionCue finishes once condition is met'() {
        const midiOut = new MidiOut(new DummyPort());
        let trigger: boolean = false;
        let updateValue: number = 0;
        const cue = Cue.when(() => trigger, () => updateValue = 59);
        cue.update(100000);
        expect(cue.isFinished).to.be.false;
        trigger = true;
        cue.update(10);
        expect(cue.isFinished).to.be.true;
    }

    @test 'BeatCue executes action after beatCount has passed'() {
        const metronome = new Metronome(60);
        const midiOut = new MidiOut(new DummyPort());
        let updateValue: number = 0;
        const cue = Cue.afterBeats(metronome, 1, () => updateValue = 59);

        metronome.update(900);
        cue.update(900);
        expect(updateValue).to.equal(0);
        metronome.update(101);
        cue.update(101);
        expect(updateValue).to.equal(59);
    }

    @test 'BeatCue finishes after beatCount has passed'() {
        const metronome = new Metronome(60);
        const midiOut = new MidiOut(new DummyPort());
        let updateValue: number = 0;
        const cue = Cue.afterBeats(metronome, 1, () => updateValue = 59);

        metronome.update(900);
        cue.update(900);
        expect(cue.isFinished).to.be.false;
        metronome.update(101);
        cue.update(101);
        expect(cue.isFinished).to.be.true;
    }

    @test 'finished event gets fired'() {
        //Setup
        const metronome = new Metronome(60);
        const midiOut = new MidiOut(new DummyPort());
        let updateValue: number = 0;
        const cue = Cue.afterBeats(metronome, 1, () => updateValue = 59);
        let testVar = 0;
        cue.finished.add(() => testVar = 3);

        cue.finish();
        expect(testVar).to.equal(3);
    }

    @test 'Automatically adds itself to default clock if set'() {
        Clock.default = new Clock();
        const cue = Cue.afterMs(1000, () => {});

        expect(Clock.default.children).to.contain(cue);

        Clock.default = null;
    }
}