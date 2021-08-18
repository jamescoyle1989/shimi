import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import ButtonInput from '../src/ButtonInput';

@suite class ButtonInputTests {
    @test 'Update runs pressed event if state changed to true'() {
        const btn = new ButtonInput();
        const results: number[] = [];
        btn.pressed.add(data => results.push(13));
        btn.released.add(data => results.push(17));
        btn.stateTracker.value = true;
        btn.update(15);
        expect(results.length).to.equal(1);
        expect(results[0]).to.equal(13);
    }

    @test 'Update runs released event if state changed to false'() {
        const btn = new ButtonInput();
        const results: number[] = [];
        btn.pressed.add(data => results.push(13));
        btn.released.add(data => results.push(17));
        btn.stateTracker.oldValue = true;
        btn.stateTracker.value = false;
        btn.update(15);
        expect(results.length).to.equal(1);
        expect(results[0]).to.equal(17);
    }

    @test 'Update doesnt run anything if state not changed'() {
        const btn = new ButtonInput();
        const results: number[] = [];
        btn.pressed.add(data => results.push(13));
        btn.released.add(data => results.push(17));
        btn.update(15);
        expect(results.length).to.equal(0);
    }

    @test 'Update increases activeMs if pressed'() {
        const btn = new ButtonInput();
        btn.stateTracker.value = true;
        expect(btn.activeMs).to.equal(0);
        btn.update(15);
        expect(btn.activeMs).to.equal(15);
    }

    @test 'Update doesnt increase activeMs if not pressed'() {
        const btn = new ButtonInput();
        expect(btn.activeMs).to.equal(0);
        expect(btn.state).to.be.false;
        btn.update(15);
        expect(btn.activeMs).to.equal(0);
    }

    @test 'Update resets activeMs if released'() {
        const btn = new ButtonInput();
        btn.stateTracker.oldValue = true;
        btn.stateTracker.value = false;
        btn['_activeMs'] = 100;
        expect(btn.activeMs).to.equal(100);
        btn.update(15);
        expect(btn.activeMs).to.equal(0);
    }

    @test 'State is cleaned after update'() {
        const btn = new ButtonInput();
        btn.stateTracker.oldValue = false;
        btn.stateTracker.value = true;
        btn.update(15);
        expect(btn.stateTracker.oldValue).to.be.true;
        expect(btn.stateTracker.value).to.be.true;
    }
}