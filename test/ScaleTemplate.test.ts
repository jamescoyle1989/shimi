import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import ScaleTemplate from '../src/ScaleTemplate';


@suite class ScaleTemplateTests {
    @test 'Throws error if shape has numbers out of bounds'() {
        expect(() => new ScaleTemplate('Test', [0, 2, 4, 5], 0)).to.throw();
    }

    @test 'Throws error if shape has duplicates'() {
        expect(() => new ScaleTemplate('Test', [2, 4, 5, 5, 9], 0)).to.throw();
    }

    @test 'Throws error if shape is empty'() {
        expect(() => new ScaleTemplate('Test', [], 0)).to.throw();
    }
}