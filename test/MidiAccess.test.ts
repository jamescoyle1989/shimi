import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import { MidiAccess } from '../src';


function newBaseAccess() {
    return {
        inputs: [
            { name: 'ABC' },
            { name: 'DEF' },
            { name: 'GHI' }
        ],
        outputs: [
            { name: 'JKL' },
            { name: 'MNO' },
            { name: 'PQR' }
        ],
        onstatechange: undefined,
        callStateChange: function(name) {
            if (this.onstatechange != undefined)
                this.onstatechange({port:{name:name}});
        }
    }
};


@suite class MidiAccessTests {
    @test 'getOutPort returns correct output from base access'() {
        const baseAccess = newBaseAccess();
        const midiAccess = new MidiAccess(baseAccess);
        const outPort = midiAccess.getOutPort('MNO');
        expect(outPort).to.equal(baseAccess.outputs[1]);
    }

    @test 'getOutPort returns null if port name not found'() {
        const baseAccess = newBaseAccess();
        const midiAccess = new MidiAccess(baseAccess);
        expect(midiAccess.getOutPort('Tomato')).to.be.null;
    }

    @test 'getInPort returns correct input from base access'() {
        const baseAccess = newBaseAccess();
        const midiAccess = new MidiAccess(baseAccess);
        const inPort = midiAccess.getInPort('GHI');
        expect(inPort).to.equal(baseAccess.inputs[2]);
    }

    @test 'getInPort returns null if port name not found'() {
        const baseAccess = newBaseAccess();
        const midiAccess = new MidiAccess(baseAccess);
        expect(midiAccess.getInPort('Cherry')).to.be.null;
    }

    @test 'getOutPortNames returns array of all names'() {
        const baseAccess = newBaseAccess();
        const midiAccess = new MidiAccess(baseAccess);
        const portNames = midiAccess.getOutPortNames();
        expect(portNames[0]).to.equal('JKL');
        expect(portNames[1]).to.equal('MNO');
        expect(portNames[2]).to.equal('PQR');
    }

    @test 'getInPortNames returns array of all names'() {
        const baseAccess = newBaseAccess();
        const midiAccess = new MidiAccess(baseAccess);
        const portNames = midiAccess.getInPortNames();
        expect(portNames[0]).to.equal('ABC');
        expect(portNames[1]).to.equal('DEF');
        expect(portNames[2]).to.equal('GHI');
    }

    @test 'portChanged triggers in response to baseAccess.onstatechange'() {
        const baseAccess = newBaseAccess();
        const midiAccess = new MidiAccess(baseAccess);
        let portChangeCount = 0;
        midiAccess.portChanged.add(() => portChangeCount++);
        expect(portChangeCount).to.equal(0);
        baseAccess.callStateChange('hello');
        expect(portChangeCount).to.equal(1);
    }

    @test 'detach disconnects from base access'() {
        const baseAccess = newBaseAccess();
        const midiAccess = new MidiAccess(baseAccess);
        let portChangeCount = 0;
        midiAccess.portChanged.add(() => portChangeCount++);
        baseAccess.callStateChange('hello');
        expect(portChangeCount).to.equal(1);
        midiAccess.detach();
        baseAccess.callStateChange('hello');
        expect(portChangeCount).to.equal(1);
    }
}