import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import Drums from '../src/Drums';


@suite class DrumsTests {
    @test 'Can fetch drum values'() {
        expect(Drums.sideStick).to.equal(37);
    }
}