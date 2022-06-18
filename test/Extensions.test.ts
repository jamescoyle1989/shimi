import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import '../src/Extensions';


@suite class NumberExtensionTests {
    @test 'near extension returns correct result'() {
        expect((48).near(62)).to.equal(60);
    }

    @test 'When ambiguous, near returns the value closest to the current pitch value'() {
        expect((48).near(66)).to.equal(60);
        expect((48).near(30)).to.equal(36);
    }
}