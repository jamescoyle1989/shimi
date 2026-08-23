import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import MidiAccess from '../src/MidiAccess';


function newBaseAccess(): MIDIAccess {
    const output = {
        inputs: new Map<string, MIDIInput>(),
        outputs: new Map<string, MIDIOutput>(),
        onstatechange: undefined,
        callStateChange: function(name) {
            if (this.onstatechange != undefined)
                this.onstatechange({port:{name:name}});
        }
    } as any;
    output.inputs.set('ABC', newMIDIInput('ABC'));
    output.inputs.set('DEF', newMIDIInput('DEF'));
    output.inputs.set('GHI', newMIDIInput('GHI'));

    output.outputs.set('JKL', newMIDIOutput('JKL'));
    output.outputs.set('MNO', newMIDIOutput('MNO'));
    output.outputs.set('PQR', newMIDIOutput('PQR'));

    return output;
};

function newMIDIInput(name: string): MIDIInput {
    return {
        name: name
    } as any;
}

function newMIDIOutput(name: string): MIDIOutput {
    return {
        name: name
    } as any;
}

function callStateChange(access: MIDIAccess, name: string): void {
    if (access.onstatechange != undefined) {
        access.onstatechange({
            port:{
                name:name
            } as any
        } as any);
    }
}



@suite class MidiAccessTests {
    @test 'getOutPort returns correct output from base access'() {
        const baseAccess = newBaseAccess();
        const midiAccess = new MidiAccess(baseAccess);
        const outPort = midiAccess.getOutPort('MNO');
        expect(outPort).to.equal(baseAccess.outputs.get('MNO'));
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
        expect(inPort).to.equal(baseAccess.inputs.get('GHI'));
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
        callStateChange(baseAccess, 'hello');
        expect(portChangeCount).to.equal(1);
    }
}