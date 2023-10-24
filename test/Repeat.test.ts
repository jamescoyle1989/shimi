import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import Metronome from '../src/Metronome';
import Repeat from '../src/Repeat';
import { Clock } from '../src';


@suite class RepeatTests {
    @test 'MsRepeat executes action multiple times'() {
        let updateValue: number = 0;
        const repeat = Repeat.forMs(100, () => updateValue++);
        repeat.update(10);
        expect(updateValue).to.equal(1);
        repeat.update(10);
        expect(updateValue).to.equal(2);
    }

    @test 'MsRepeat finishes after msCount has passed'() {
        let updateValue: number = 0;
        const repeat = Repeat.forMs(99, () => updateValue++);
        repeat.update(50);
        expect(updateValue).to.equal(1);
        expect(repeat.isFinished).to.be.false;
        repeat.update(50);
        expect(updateValue).to.equal(1);
        expect(repeat.isFinished).to.be.true;
    }

    @test 'ConditionalRepeat executes action until condition is met'() {
        let trigger: boolean = false;
        let updateValue: number = 0;
        const repeat = Repeat.until(() => trigger, () => updateValue++);
        repeat.update(100);
        expect(updateValue).to.equal(1);
        repeat.update(100);
        expect(updateValue).to.equal(2);
        expect(repeat.isFinished).to.be.false;
        trigger = true;
        repeat.update(100);
        expect(repeat.isFinished).to.be.true;
    }

    @test 'BeatRepeat executes action until beatCount has passed'() {
        const metronome = new Metronome(60);
        let updateValue: number = 0;
        const repeat = Repeat.forBeats(metronome, 1, () => updateValue++);

        metronome.update(900);
        repeat.update(900);
        expect(updateValue).to.equal(1);
        expect(repeat.isFinished).to.be.false;
        metronome.update(101);
        repeat.update(101);
        expect(updateValue).to.equal(1);
        expect(repeat.isFinished).to.be.true;
    }

    @test 'ConditionalRepeat includes ms action arg'() {
        let trigger: boolean = false;
        let updateValue: number = 0;
        const repeat = Repeat.until(() => trigger, args => updateValue = args.ms);

        repeat.update(95);
        expect(updateValue).to.equal(95);
        repeat.update(107);
        expect(updateValue).to.equal(202);
    }

    @test 'MsRepeat includes ms action arg'() {
        let updateValue: number = 0;
        const repeat = Repeat.forMs(500, args => updateValue = args.ms);

        repeat.update(95);
        expect(updateValue).to.equal(95);
        repeat.update(107);
        expect(updateValue).to.equal(202);
    }

    @test 'MsRepeat includes percent action arg'() {
        let updateValue: number = 0;
        const repeat = Repeat.forMs(400, args => updateValue = args.percent);

        repeat.update(100);
        expect(updateValue).to.equal(0.25);
        repeat.update(150);
        expect(updateValue).to.equal(0.625);
    }

    @test 'BeatRepeat includes ms action arg'() {
        const metronome = new Metronome(60);
        let updateValue: number = 0;
        const repeat = Repeat.forBeats(metronome, 4, args => updateValue = args.ms);

        repeat.update(95);
        expect(updateValue).to.equal(95);
        repeat.update(107);
        expect(updateValue).to.equal(202);
    }

    @test 'BeatRepeat includes percent action arg'() {
        const metronome = new Metronome(60);
        let updateValue: number = 0;
        const repeat = Repeat.forBeats(metronome, 4, args => updateValue = args.percent);

        metronome.update(1000);
        repeat.update(1000);
        expect(updateValue).to.equal(0.25);
        metronome.update(1500);
        repeat.update(1500);
        expect(updateValue).to.equal(0.625);
    }

    @test 'BeatRepeat includes beat action arg'() {
        const metronome = new Metronome(60);
        let updateValue: number = 0;
        const repeat = Repeat.forBeats(metronome, 4, args => updateValue = args.beat);

        metronome.update(1000);
        repeat.update(1000);
        expect(updateValue).to.equal(1);
        metronome.update(1500);
        repeat.update(1500);
        expect(updateValue).to.equal(2.5);
    }

    @test 'finished event gets fired'() {
        //Setup
        const metronome = new Metronome(60);
        const repeat = Repeat.forBeats(metronome, 4, args => {});
        let testVar = 0;
        repeat.finished.add(() => testVar = 3);

        repeat.finish();
        expect(testVar).to.equal(3);
    }

    @test 'Automatically adds itself to default clock if set'() {
        Clock.default = new Clock();
        const repeat = Repeat.forMs(100, () => {});

        expect(Clock.default.children).to.contain(repeat);

        Clock.default = null;
    }
}