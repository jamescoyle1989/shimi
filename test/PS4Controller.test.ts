import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import PS4Controller from '../src/PS4Controller';


@suite class PS4ControllerTests {
    @test 'PS4Controller canMatch matches on both button count and axis count'() {
        const ps4Controller = new PS4Controller();
        const correctButtonCount: any = {
            buttons: [
                {value:0},{value:0},{value:0},{value:0},
                {value:0},{value:0},{value:0},{value:0},
                {value:0},{value:0},{value:0},{value:0},
                {value:0},{value:0},{value:0},{value:0},
                {value:0},{value:0}
            ],
            axes: [0,0,0]
        }
        expect(ps4Controller.canMatch(correctButtonCount)).to.be.false;

        const correctAxisCount: any = {
            buttons: [
                {value:0},{value:0},{value:0},{value:0},
                {value:0},{value:0},{value:0},{value:0},
                {value:0},{value:0},{value:0},{value:0},
                {value:0},{value:0},{value:0},{value:0},
                {value:0}
            ],
            axes: [0,0,0,0]
        };
        expect(ps4Controller.canMatch(correctAxisCount)).to.be.false;

        const correctButtonAndAxisCount: any = {
            buttons: [
                {value:0},{value:0},{value:0},{value:0},
                {value:0},{value:0},{value:0},{value:0},
                {value:0},{value:0},{value:0},{value:0},
                {value:0},{value:0},{value:0},{value:0},
                {value:0},{value:0}
            ],
            axes: [0,0,0,0]
        };
        expect(ps4Controller.canMatch(correctButtonAndAxisCount)).to.be.true;
    }

    @test 'PS4Controller updates L3_magnitude'() {
        const ps4Controller = new PS4Controller();
        ps4Controller.L3_X.valueTracker.value = 0.3;
        ps4Controller.L3_Y.valueTracker.value = 0.4;
        expect(ps4Controller.L3_magnitude.value).to.equal(0);
        ps4Controller.update(1);
        expect(ps4Controller.L3_magnitude.value).to.equal(0.5);
    }

    @test 'PS4Controller L3_magnitude sends out changed event if value changed'() {
        const ps4Controller = new PS4Controller();
        let changeTracker = 0;
        ps4Controller.L3_magnitude.changed.add(() => changeTracker++);
        ps4Controller.L3_X.valueTracker.value = 1;
        ps4Controller.update(1);
        expect(changeTracker).to.equal(1);
    }

    @test 'PS4Controller L3_magnitude tracks how long the magnitude has been non-zero'() {
        const ps4Controller = new PS4Controller();
        ps4Controller.update(10);
        expect(ps4Controller.L3_magnitude.activeMs).to.equal(0);
        ps4Controller.L3_X.valueTracker.value = 1;
        ps4Controller.update(59);
        expect(ps4Controller.L3_magnitude.activeMs).to.equal(59);
    }

    @test 'PS4Controller L3_magnitude is capped at 1'() {
        const ps4Controller = new PS4Controller();
        ps4Controller.L3_X.valueTracker.value = 1;
        ps4Controller.L3_Y.valueTracker.value = 1;
        ps4Controller.update(1);
        expect(ps4Controller.L3_magnitude.value).to.equal(1);
    }

    @test 'PS4Controller updates R3_magnitude'() {
        const ps4Controller = new PS4Controller();
        ps4Controller.R3_X.valueTracker.value = 0.3;
        ps4Controller.R3_Y.valueTracker.value = 0.4;
        expect(ps4Controller.R3_magnitude.value).to.equal(0);
        ps4Controller.update(1);
        expect(ps4Controller.R3_magnitude.value).to.equal(0.5);
    }

    @test 'PS4Controller R3_magnitude sends out changed event if value changed'() {
        const ps4Controller = new PS4Controller();
        let changeTracker = 0;
        ps4Controller.R3_magnitude.changed.add(() => changeTracker++);
        ps4Controller.R3_X.valueTracker.value = 1;
        ps4Controller.update(1);
        expect(changeTracker).to.equal(1);
    }

    @test 'PS4Controller R3_magnitude tracks how long the magnitude has been non-zero'() {
        const ps4Controller = new PS4Controller();
        ps4Controller.update(10);
        expect(ps4Controller.R3_magnitude.activeMs).to.equal(0);
        ps4Controller.R3_X.valueTracker.value = 1;
        ps4Controller.update(59);
        expect(ps4Controller.R3_magnitude.activeMs).to.equal(59);
    }

    @test 'PS4Controller R3_magnitude is capped at 1'() {
        const ps4Controller = new PS4Controller();
        ps4Controller.R3_X.valueTracker.value = 1;
        ps4Controller.R3_Y.valueTracker.value = 1;
        ps4Controller.update(1);
        expect(ps4Controller.R3_magnitude.value).to.equal(1);
    }

    @test 'PS4Controller updates L3_rotation'() {
        const ps4Controller = new PS4Controller();
        ps4Controller.L3_X.valueTracker.value = 1;
        expect(ps4Controller.L3_rotation.value).to.equal(0);
        ps4Controller.update(1);
        expect(ps4Controller.L3_rotation.value).to.equal(90);

        ps4Controller.L3_X.valueTracker.value = -1;
        ps4Controller.L3_Y.valueTracker.value = 1;
        ps4Controller.update(1);
        expect(ps4Controller.L3_rotation.value).to.equal(-135);

        ps4Controller.L3_X.valueTracker.value = 0;
        ps4Controller.L3_Y.valueTracker.value = 1;
        ps4Controller.update(1);
        expect(ps4Controller.L3_rotation.value).to.equal(180);
    }

    @test 'PS4Controller L3_rotation sends out changed event if value changed'() {
        const ps4Controller = new PS4Controller();
        let changeTracker = 0;
        ps4Controller.L3_rotation.changed.add(() => changeTracker++);
        ps4Controller.L3_X.valueTracker.value = 1;
        ps4Controller.update(1);
        expect(changeTracker).to.equal(1);
    }

    @test 'PS4Controller L3_rotation tracks how long the rotation has been non-zero'() {
        const ps4Controller = new PS4Controller();
        ps4Controller.update(10);
        expect(ps4Controller.L3_rotation.activeMs).to.equal(0);
        ps4Controller.L3_X.valueTracker.value = 1;
        ps4Controller.update(59);
        expect(ps4Controller.L3_rotation.activeMs).to.equal(59);
    }

    @test 'PS4Controller L3_rotation is 0 if L3_X and L3_Y are both 0'() {
        const ps4Controller = new PS4Controller();
        ps4Controller.L3_X.valueTracker.value = 0;
        ps4Controller.L3_Y.valueTracker.value = 0;
        ps4Controller.update(1);
        expect(ps4Controller.L3_rotation.value).to.equal(0);
    }

    @test 'PS4Controller updates R3_rotation'() {
        const ps4Controller = new PS4Controller();
        ps4Controller.R3_X.valueTracker.value = 1;
        expect(ps4Controller.R3_rotation.value).to.equal(0);
        ps4Controller.update(1);
        expect(ps4Controller.R3_rotation.value).to.equal(90);

        ps4Controller.R3_X.valueTracker.value = -1;
        ps4Controller.R3_Y.valueTracker.value = 1;
        ps4Controller.update(1);
        expect(ps4Controller.R3_rotation.value).to.equal(-135);

        ps4Controller.R3_X.valueTracker.value = 0;
        ps4Controller.R3_Y.valueTracker.value = 1;
        ps4Controller.update(1);
        expect(ps4Controller.R3_rotation.value).to.equal(180);
    }

    @test 'PS4Controller R3_rotation sends out changed event if value changed'() {
        const ps4Controller = new PS4Controller();
        let changeTracker = 0;
        ps4Controller.R3_rotation.changed.add(() => changeTracker++);
        ps4Controller.R3_X.valueTracker.value = 1;
        ps4Controller.update(1);
        expect(changeTracker).to.equal(1);
    }

    @test 'PS4Controller R3_rotation tracks how long the rotation has been non-zero'() {
        const ps4Controller = new PS4Controller();
        ps4Controller.update(10);
        expect(ps4Controller.R3_rotation.activeMs).to.equal(0);
        ps4Controller.R3_X.valueTracker.value = 1;
        ps4Controller.update(59);
        expect(ps4Controller.R3_rotation.activeMs).to.equal(59);
    }

    @test 'PS4Controller R3_rotation is 0 if R3_X and R3_Y are both 0'() {
        const ps4Controller = new PS4Controller();
        ps4Controller.R3_X.valueTracker.value = 0;
        ps4Controller.R3_Y.valueTracker.value = 0;
        ps4Controller.update(1);
        expect(ps4Controller.R3_rotation.value).to.equal(0);
    }
}