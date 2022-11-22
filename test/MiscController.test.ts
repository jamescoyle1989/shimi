import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import MiscController from '../src/MiscController';


@suite class MiscControllerTests {
    @test 'MiscController constructor takes 2 arrays with the names of buttons and axes'() {
        const controller = new MiscController(
            ['x', 'square', 'circle', 'triangle'],
            ['L3_X', 'L3_Y']
        );
        expect(controller.buttons.length).to.equal(4);
        expect(controller.axes.length).to.equal(2);
    }

    @test 'MiscController constructor prevents 2 buttons having the same name'() {
        expect(() => new MiscController(
            ['x', 'square', 'x', 'circle'],
            []
        )).to.throw();
    }

    @test 'MiscController constructor prevents 2 axes having the same name'() {
        expect(() => new MiscController(
            [],
            ['L3_X', 'L3_Y', 'L3_X']
        )).to.throw();
    }

    @test 'MiscController constructor prevents axes and buttons having the same name'() {
        expect(() => new MiscController(
            ['x', 'y', 'z'],
            ['v', 'w', 'x']
        )).to.throw();
    }

    @test 'MiscController constructor adds member variables for the added buttons and axes'() {
        const controller = new MiscController(
            ['x', 'y', 'z'],
            ['a', 'b', 'c']
        );
        expect(controller['x']).to.not.be.undefined;
        expect(controller['x'].value).to.equal(0);
        expect(controller['a']).to.not.be.undefined;
        expect(controller['a'].value).to.equal(0);
    }

    @test 'MiscController throws an error if button or axis name is not undefined at instanciation'() {
        expect(() => new MiscController(
            ['update'],
            []
        )).to.throw();
        expect(() => new MiscController(
            [],
            ['canMatch']
        )).to.throw();
    }
}