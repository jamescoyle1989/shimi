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
        expect(tween.update(0.25)).to.be.approximately(11.46, 0.01);
        expect(tween.update(0.5)).to.equal(15);
        expect(tween.update(0.75)).to.be.approximately(18.54, 0.01);
        expect(tween.update(1)).to.equal(20);
    }

    @test 'sineIn moves as expected'() {
        const tween = Tween.sineIn(10, 20);
        expect(tween.update(0)).to.equal(10);
        expect(tween.update(0.25)).to.be.approximately(10.76, 0.01);
        expect(tween.update(0.5)).to.be.approximately(12.93, 0.01);
        expect(tween.update(0.75)).to.be.approximately(16.17, 0.01);
        expect(tween.update(1)).to.equal(20);
    }

    @test 'sineOut moves as expected'() {
        const tween = Tween.sineOut(10, 20);
        expect(tween.update(0)).to.equal(10);
        expect(tween.update(0.25)).to.be.approximately(13.83, 0.01);
        expect(tween.update(0.5)).to.be.approximately(17.07, 0.01);
        expect(tween.update(0.75)).to.be.approximately(19.24, 0.01);
        expect(tween.update(1)).to.equal(20);
    }

    @test 'steps moves as expected'() {
        const tween = Tween.steps(10, 20, 4);
        expect(tween.update(0)).to.equal(10);
        expect(tween.update(0.19)).to.equal(10);
        expect(tween.update(0.2)).to.equal(12.5);
        expect(tween.update(0.39)).to.equal(12.5);
        expect(tween.update(0.4)).to.equal(15);
        expect(tween.update(0.59)).to.equal(15);
        expect(tween.update(0.6)).to.equal(17.5);
        expect(tween.update(0.79)).to.equal(17.5);
        expect(tween.update(0.8)).to.equal(20);
        expect(tween.update(1)).to.equal(20);
    }

    @test 'quadraticInOut moves as expected'() {
        const tween = Tween.quadraticInOut(10, 20);
        expect(tween.update(0)).to.equal(10);
        expect(tween.update(0.2)).to.be.approximately(10.8, 0.001);
        expect(tween.update(0.25)).to.be.approximately(11.25, 0.001);
        expect(tween.update(0.45)).to.be.approximately(14.05, 0.001);
        expect(tween.update(0.5)).to.be.approximately(15, 0.001);
        expect(tween.update(0.55)).to.be.approximately(15.95, 0.001);
        expect(tween.update(0.75)).to.be.approximately(18.75, 0.001);
        expect(tween.update(0.8)).to.be.approximately(19.2, 0.001);
        expect(tween.update(1)).to.equal(20);
    }

    @test 'quadraticIn moves as expected'() {
        const tween = Tween.quadraticIn(10, 20);
        expect(tween.update(0)).to.equal(10);
        expect(tween.update(0.4)).to.be.approximately(11.6, 0.001);
        expect(tween.update(0.5)).to.be.approximately(12.5, 0.001);
        expect(tween.update(0.9)).to.be.approximately(18.1, 0.001);
        expect(tween.update(1)).to.equal(20);
    }

    @test 'quadraticOut moves as expected'() {
        const tween = Tween.quadraticOut(10, 20);
        expect(tween.update(0)).to.equal(10);
        expect(tween.update(0.1)).to.be.approximately(11.9, 0.001);
        expect(tween.update(0.5)).to.be.approximately(17.5, 0.001);
        expect(tween.update(0.6)).to.be.approximately(18.4, 0.001);
        expect(tween.update(1)).to.equal(20);
    }

    @test 'cubicInOut moves as expected'() {
        const tween = Tween.cubicInOut(10, 20);
        expect(tween.update(0)).to.equal(10);
        expect(tween.update(0.1)).to.be.approximately(10.04, 0.001);
        expect(tween.update(0.2)).to.be.approximately(10.32, 0.001);
        expect(tween.update(0.3)).to.be.approximately(11.08, 0.001);
        expect(tween.update(0.4)).to.be.approximately(12.56, 0.001);
        expect(tween.update(0.5)).to.equal(15);
        expect(tween.update(0.6)).to.be.approximately(17.44, 0.001);
        expect(tween.update(0.7)).to.be.approximately(18.92, 0.001);
        expect(tween.update(0.8)).to.be.approximately(19.68, 0.001);
        expect(tween.update(0.9)).to.be.approximately(19.96, 0.001);
        expect(tween.update(1)).to.equal(20);
    }

    @test 'cubicIn moves as expected'() {
        const tween = Tween.cubicIn(10, 20);
        expect(tween.update(0)).to.equal(10);
        expect(tween.update(0.1)).to.be.approximately(10.01, 0.001);
        expect(tween.update(0.2)).to.be.approximately(10.08, 0.001);
        expect(tween.update(0.3)).to.be.approximately(10.27, 0.001);
        expect(tween.update(0.4)).to.be.approximately(10.64, 0.001);
        expect(tween.update(0.5)).to.be.approximately(11.25, 0.001);
        expect(tween.update(0.6)).to.be.approximately(12.16, 0.001);
        expect(tween.update(0.7)).to.be.approximately(13.43, 0.001);
        expect(tween.update(0.8)).to.be.approximately(15.12, 0.001);
        expect(tween.update(0.9)).to.be.approximately(17.29, 0.001);
        expect(tween.update(1)).to.equal(20);
    }

    @test 'cubicOut moves as expected'() {
        const tween = Tween.cubicOut(10, 20);
        expect(tween.update(0)).to.equal(10);
        expect(tween.update(0.1)).to.be.approximately(12.71, 0.001);
        expect(tween.update(0.2)).to.be.approximately(14.88, 0.001);
        expect(tween.update(0.3)).to.be.approximately(16.57, 0.001);
        expect(tween.update(0.4)).to.be.approximately(17.84, 0.001);
        expect(tween.update(0.5)).to.be.approximately(18.75, 0.001);
        expect(tween.update(0.6)).to.be.approximately(19.36, 0.001);
        expect(tween.update(0.7)).to.be.approximately(19.73, 0.001);
        expect(tween.update(0.8)).to.be.approximately(19.92, 0.001);
        expect(tween.update(0.9)).to.be.approximately(19.99, 0.001);
        expect(tween.update(1)).to.equal(20);
    }

    @test 'quarticInOut moves as expected'() {
        const tween = Tween.quarticInOut(10, 20);
        expect(tween.update(0)).to.equal(10);
        expect(tween.update(0.1)).to.be.approximately(10.008, 0.001);
        expect(tween.update(0.2)).to.be.approximately(10.128, 0.001);
        expect(tween.update(0.3)).to.be.approximately(10.648, 0.001);
        expect(tween.update(0.4)).to.be.approximately(12.048, 0.001);
        expect(tween.update(0.5)).to.equal(15);
        expect(tween.update(0.6)).to.be.approximately(17.952, 0.001);
        expect(tween.update(0.7)).to.be.approximately(19.352, 0.001);
        expect(tween.update(0.8)).to.be.approximately(19.872, 0.001);
        expect(tween.update(0.9)).to.be.approximately(19.992, 0.001);
        expect(tween.update(1)).to.equal(20);
    }

    @test 'quarticIn moves as expected'() {
        const tween = Tween.quarticIn(10, 20);
        expect(tween.update(0)).to.equal(10);
        expect(tween.update(0.1)).to.be.approximately(10.001, 0.0001);
        expect(tween.update(0.2)).to.be.approximately(10.016, 0.0001);
        expect(tween.update(0.3)).to.be.approximately(10.081, 0.0001);
        expect(tween.update(0.4)).to.be.approximately(10.256, 0.0001);
        expect(tween.update(0.5)).to.be.approximately(10.625, 0.0001);
        expect(tween.update(0.6)).to.be.approximately(11.296, 0.0001);
        expect(tween.update(0.7)).to.be.approximately(12.401, 0.0001);
        expect(tween.update(0.8)).to.be.approximately(14.096, 0.0001);
        expect(tween.update(0.9)).to.be.approximately(16.561, 0.0001);
        expect(tween.update(1)).to.equal(20);
    }

    @test 'quarticOut moves as expected'() {
        const tween = Tween.quarticOut(10, 20);
        expect(tween.update(0)).to.equal(10);
        expect(tween.update(0.1)).to.be.approximately(13.439, 0.0001);
        expect(tween.update(0.2)).to.be.approximately(15.904, 0.0001);
        expect(tween.update(0.3)).to.be.approximately(17.599, 0.0001);
        expect(tween.update(0.4)).to.be.approximately(18.704, 0.0001);
        expect(tween.update(0.5)).to.be.approximately(19.375, 0.0001);
        expect(tween.update(0.6)).to.be.approximately(19.744, 0.0001);
        expect(tween.update(0.7)).to.be.approximately(19.919, 0.0001);
        expect(tween.update(0.8)).to.be.approximately(19.984, 0.0001);
        expect(tween.update(0.9)).to.be.approximately(19.999, 0.0001);
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