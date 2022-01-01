import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import { sum, distinct, mode } from '../src/IterationUtils';


@suite class IterationUtilsTests {
    @test 'sum returns correct result'() {
        const items = [
            {count: 10},
            {count: 5}
        ];
        expect(sum(items, x => x.count)).to.equal(15);
    }

    @test 'sum returns 0 for empty array'() {
        expect(sum([], x => x)).to.equal(0);
    }

    @test 'sum uses default accessor if not provided'() {
        expect(sum([1,2,3,4])).to.equal(10);
    }

    @test 'distinct returns correct results'() {
        const distinctResults = distinct([1,1,2,3,1,3]);
        expect(distinctResults.length).to.equal(3);
        expect(distinctResults[0]).to.equal(1);
        expect(distinctResults[1]).to.equal(2);
        expect(distinctResults[2]).to.equal(3);
    }

    @test 'mode returns correct result'() {
        const items = [
            {name:'James', age:32},
            {name:'Bob', age:50},
            {name:'Rachel', age:32},
            {name:'Michael', age:44}
        ];
        expect(mode(items, x => x.age)).to.equal(32);
    }

    @test 'mode returns null if empty array'() {
        expect(mode([], x => x)).to.be.null;
    }
}