import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import ButtonInput from '../src/ButtonInput';

@suite class ButtonInputTests {
    @test 'Update runs pressed event if state changed to true'() {
        const btn = new ButtonInput('a');
        const results: number[] = [];
        btn.pressed.add(data => results.push(13));
        btn.released.add(data => results.push(17));
        btn.valueTracker.value = 1;
        btn.update(15);
        expect(results.length).to.equal(1);
        expect(results[0]).to.equal(13);
    }

    @test 'Update runs released event if state changed to false'() {
        const btn = new ButtonInput('a');
        const results: number[] = [];
        btn.pressed.add(data => results.push(13));
        btn.released.add(data => results.push(17));
        btn.valueTracker.oldValue = 1;
        btn.valueTracker.value = 0;
        btn.update(15);
        expect(results.length).to.equal(1);
        expect(results[0]).to.equal(17);
    }

    @test 'Update doesnt run anything if state not changed'() {
        const btn = new ButtonInput('a');
        const results: number[] = [];
        btn.pressed.add(data => results.push(13));
        btn.released.add(data => results.push(17));
        btn.update(15);
        expect(results.length).to.equal(0);
    }

    @test 'Update increases activeMs if pressed'() {
        const btn = new ButtonInput('a');
        btn.valueTracker.value = 1;
        expect(btn.activeMs).to.equal(0);
        btn.update(15);
        expect(btn.activeMs).to.equal(15);
    }

    @test 'Update doesnt increase activeMs if not pressed'() {
        const btn = new ButtonInput('a');
        expect(btn.activeMs).to.equal(0);
        expect(btn.state).to.be.false;
        btn.update(15);
        expect(btn.activeMs).to.equal(0);
    }

    @test 'Update resets activeMs if released'() {
        const btn = new ButtonInput('a');
        btn.valueTracker.oldValue = 1;
        btn.valueTracker.value = 0;
        btn['_activeMs'] = 100;
        expect(btn.activeMs).to.equal(100);
        btn.update(15);
        expect(btn.activeMs).to.equal(0);
    }

    @test 'State is cleaned after update'() {
        const btn = new ButtonInput('a');
        btn.valueTracker.oldValue = 0;
        btn.valueTracker.value = 1;
        btn.update(15);
        expect(btn.valueTracker.oldValue).to.equal(1);
        expect(btn.valueTracker.value).to.equal(1);
    }

    @test 'Update runs changed event if value changed between non zero values'() {
        const btn = new ButtonInput('a');
        const results: number[] = [];
        btn.changed.add(data => results.push(data.source.value));
        btn.valueTracker.value = 1;
        btn.valueTracker.accept();
        btn.valueTracker.value = 0.5;
        btn.update(15);
        expect(results.length).to.equal(1);
        expect(results[0]).to.equal(0.5);
    }
}