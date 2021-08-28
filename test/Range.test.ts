import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import Range from '../src/Range';


@suite class RangeTests {
    @test 'duration throws error if negative'() {
        const range = new Range(1, 5);
        expect(() => range.duration = -1).to.throw();
    }

    @test 'end updates duration'() {
        const range = new Range(1, 5);
        expect(range.end).to.equal(6);
        range.end = 4;
        expect(range.duration).to.equal(3);
    }

    @test 'getPercent returns correct values'() {
        const range = new Range(0, 10);
        expect(range.getPercent(0)).to.equal(0);
        expect(range.getPercent(4)).to.equal(0.4);
        expect(range.getPercent(10)).to.equal(1);
        expect(range.getPercent(14)).to.equal(1.4);
        expect(range.getPercent(-20)).to.equal(-2);
        range.duration = 0;
        for (let i = 0; i < 5; i++)
            expect(range.getPercent(Math.random())).to.equal(0);
    }
}