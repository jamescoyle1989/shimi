import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import SliderInput, { SliderEvent } from '../src/SliderInput';

@suite class SliderInputTests {
    @test 'Update runs changed event if value changed'() {
        const slider = new SliderInput('a');
        const results: number[] = [];
        slider.changed.add(data => results.push(data.source.value));
        slider.valueTracker.value = 13;
        slider.update(10);
        expect(results.length).to.equal(1);
        expect(results[0]).to.equal(13);
    }

    @test 'Update doesnt run anything if state not changed'() {
        const slider = new SliderInput('a');
        const results: number[] = [];
        slider.changed.add(data => results.push(data.source.value));
        slider.update(10);
        expect(results.length).to.equal(0);
    }

    @test 'Update increases activeMs if not 0'() {
        const slider = new SliderInput('a');
        slider.valueTracker.value = 14;
        expect(slider.activeMs).to.equal(0);
        slider.update(15);
        expect(slider.activeMs).to.equal(15);
    }

    @test 'Update doesnt increase activeMs if 0'() {
        const slider = new SliderInput('a');
        slider.valueTracker.value = 0;
        expect(slider.activeMs).to.equal(0);
        slider.update(15);
        expect(slider.activeMs).to.equal(0);
    }

    @test 'Update resets activeMs if value returned to 0'() {
        const slider = new SliderInput('a');
        slider.valueTracker.value = 16;
        slider.update(10);
        expect(slider.activeMs).to.equal(10);
        slider.valueTracker.value = 0;
        slider.update(10);
        expect(slider.activeMs).to.equal(0);
    }

    @test 'Update cleans state of value tracker'() {
        const slider = new SliderInput('a');
        slider.valueTracker.value = 10;
        expect(slider.valueTracker.isDirty).to.be.true;
        slider.update(10);
        expect(slider.valueTracker.isDirty).to.be.false;
    }
}