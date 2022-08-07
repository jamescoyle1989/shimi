import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import { Tween } from '../src';


@suite class TweenTests {
    @test 'linear moves as expected'() {
        const tween = Tween.linear(10, 20);
        expect(tween.update(0)).to.equal(10);
        expect(tween.update(0.25)).to.equal(12.5);
        expect(tween.update(0.5)).to.equal(15);
        expect(tween.update(0.75)).to.equal(17.5);
        expect(tween.update(1)).to.equal(20);
    }

    @test 'sineInOut moves as expected'() {
        const tween = Tween.sineInOut(10, 20);
        expect(tween.update(0)).to.equal(10);
        expect(tween.update(0.25)).to.approximately(11.46, 0.01);
        expect(tween.update(0.5)).to.equal(15);
        expect(tween.update(0.75)).to.approximately(18.54, 0.01);
        expect(tween.update(1)).to.equal(20);
    }

    @test 'sineIn moves as expected'() {
        const tween = Tween.sineIn(10, 20);
        expect(tween.update(0)).to.equal(10);
        expect(tween.update(0.25)).to.approximately(10.76, 0.01);
        expect(tween.update(0.5)).to.approximately(12.93, 0.01);
        expect(tween.update(0.75)).to.approximately(16.17, 0.01);
        expect(tween.update(1)).to.equal(20);
    }

    @test 'sineOut moves as expected'() {
        const tween = Tween.sineOut(10, 20);
        expect(tween.update(0)).to.equal(10);
        expect(tween.update(0.25)).to.approximately(13.83, 0.01);
        expect(tween.update(0.5)).to.approximately(17.07, 0.01);
        expect(tween.update(0.75)).to.approximately(19.24, 0.01);
        expect(tween.update(1)).to.equal(20);
    }



    @test 'then allows for tweens to be chained together'() {
        const tween = Tween.linear(10, 20).then(Tween.linear(20, 0));
        expect(tween.update(0)).to.equal(10);
        expect(tween.update(0.25)).to.equal(15);
        expect(tween.update(0.5)).to.equal(20);
        expect(tween.update(0.75)).to.equal(10);
        expect(tween.update(1)).to.equal(0);
    }

    @test 'then allows for tweens with different weightings'() {
        const tween = Tween.linear(10, 20).then(Tween.linear(20, 2), 3);
        expect(tween.update(0)).to.equal(10);
        expect(tween.update(0.25)).to.equal(20);
        expect(tween.update(0.5)).to.equal(14);
        expect(tween.update(0.75)).to.equal(8);
        expect(tween.update(1)).to.equal(2);
    }

    @test 'then allows for more than 2 tweens to be chained'() {
        const tween = Tween.linear(10, 20)
                .then(Tween.linear(20, 0), 2)
                .then(Tween.linear(0, 10));
        expect(tween.update(0)).to.equal(10);
        expect(tween.update(0.25)).to.equal(20);
        expect(tween.update(0.5)).to.equal(10);
        expect(tween.update(0.75)).to.equal(0);
        expect(tween.update(1)).to.equal(10);
    }
}