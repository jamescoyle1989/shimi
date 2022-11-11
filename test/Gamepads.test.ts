import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import Gamepads from '../src/Gamepads';
import PS4Controller from '../src/PS4Controller';


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
}