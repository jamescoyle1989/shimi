import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import Gamepads from '../src/Gamepads';
import PS4Controller from '../src/PS4Controller';
import { Clock } from '../src';


function getTestInputs(): any[] {
    return [
        {
            buttons: [
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 }
            ],
            axes: [
                (Math.random() * 2) - 1,
                (Math.random() * 2) - 1,
                (Math.random() * 2) - 1,
                (Math.random() * 2) - 1
            ]
        },
        {
            buttons: [
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 }
            ],
            axes: [
                (Math.random() * 2) - 1,
                (Math.random() * 2) - 1
            ]
        },
        {
            buttons: [
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 },
                { value: (Math.random() > 0.5) ? 1 : 0 }
            ],
            axes: [
                (Math.random() * 2) - 1,
                (Math.random() * 2) - 1,
                (Math.random() * 2) - 1
            ]
        }
    ];
}

function getNullTestInputs(): any[] {
    return [null, null, null, null];
}


@suite class GamepadsTests {
    @test 'update can match unmatched gamepads'() {
        const gamepads = new Gamepads(getTestInputs);
        gamepads.add(new PS4Controller());
        expect(gamepads['_matched'][0]).to.be.null;
        expect(gamepads['_unmatched'].length).to.equal(1);
        gamepads.update(10);
        expect(gamepads['_matched'][0]).to.not.be.null;
        expect(gamepads['_unmatched'].length).to.equal(0);
    }

    @test 'update sets gamepad values'() {
        const gamepads = new Gamepads(getTestInputs);
        var ps4Controller = new PS4Controller();
        gamepads.add(ps4Controller);
        expect(ps4Controller.buttons.find(x => x.isPressed)).to.be.undefined;
        expect(ps4Controller.axes.find(x => x.value != 0)).to.be.undefined;
        gamepads.update(10);
        expect(ps4Controller.buttons.find(x => x.isPressed)).to.not.be.undefined;
        expect(ps4Controller.axes.find(x => x.value != 0)).to.not.be.undefined;
    }

    @test 'activeGamepads returns collection of all gamepads which have been matched up'() {
        const gamepads = new Gamepads(getTestInputs);
        gamepads.add(new PS4Controller());
        gamepads.update(10);
        expect(gamepads.activeGamepads.length).to.equal(1);
    }

    @test 'update doesnt throw error when new gamepad data is null'() {
        const gamepads = new Gamepads(getNullTestInputs);
        gamepads.add(new PS4Controller());
        gamepads.update(10);
    }

    @test 'finished event gets fired'() {
        //Setup
        const gamepads = new Gamepads(getNullTestInputs);
        let testVar = 0;
        gamepads.finished.add(() => testVar = 3);

        gamepads.finish();
        expect(testVar).to.equal(3);
    }

    @test 'Automatically adds itself to default clock if set'() {
        Clock.default = new Clock();
        const gamepads = new Gamepads(getNullTestInputs);

        expect(Clock.default.children).to.contain(gamepads);

        Clock.default = null;
    }
}