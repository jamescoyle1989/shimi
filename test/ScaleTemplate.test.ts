import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import ScaleTemplate from '../src/ScaleTemplate';


@suite class ScaleTemplateTests {
    @test 'Throws error if shape has numbers out of bounds'() {
        expect(() => new ScaleTemplate('Test', [-1, 2, 4, 5], 0)).to.throw();
    }

    @test 'Throws error if shape has duplicates'() {
        expect(() => new ScaleTemplate('Test', [2, 4, 5, 5, 9], 0)).to.throw();
    }

    @test 'Throws error if shape is empty'() {
        expect(() => new ScaleTemplate('Test', [], 0)).to.throw();
    }

    @test '0 is automatically added if not provided in constructor'() {
        const template = new ScaleTemplate('Test', [2, 4, 5, 7, 9, 11], 0);
        expect(template.shape.length).to.equal(7);
        expect(template.shape[0]).to.equal(0);
        expect(template.shape[1]).to.equal(2);
    }
}