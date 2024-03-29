import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import DummyPort from './DummyPort';
import { Clip, ClipBend, ClipCC, ClipNote } from '../src/Clip';
import ClipPlayer from '../src/ClipPlayer';
import Metronome from '../src/Metronome';
import MidiOut from '../src/MidiOut';
import { Clock, Tween } from '../src';


function getBendValFromPercent(percent: number): number[] {
    const bendVal = Math.min(16383, (percent * 8192) + 8192);
    return [
        bendVal % 128,
        Math.floor(bendVal / 128)
    ];
}


@suite class ClipPlayerTests {
    @test 'Update doesnt do anything if running is false'() {
        //Setup
        const metronome = new Metronome(120);
        const midiOut = new MidiOut(new DummyPort());
        const clipPlayer = new ClipPlayer(new Clip(16), metronome, midiOut);

        //Update metronome so it has some difference between old and new beat values
        metronome.update(10);

        clipPlayer.running = false;
        clipPlayer.update(10);
        expect(clipPlayer.beatsPassed).to.equal(0);
    }

    @test 'Update doesnt do anything if metronome isnt set'() {
        //Setup
        const metronome = new Metronome(120);
        const midiOut = new MidiOut(new DummyPort());
        const clipPlayer = new ClipPlayer(new Clip(16), null, midiOut);

        //Update metronome so it has some difference between old and new beat values
        metronome.update(10);

        clipPlayer.update(10);
        expect(clipPlayer.beatsPassed).to.equal(0);
    }

    @test 'Update doesnt do anything if clip isnt set'() {
        //Setup
        const metronome = new Metronome(120);
        const midiOut = new MidiOut(new DummyPort());
        const clipPlayer = new ClipPlayer(null, metronome, midiOut);

        //Update metronome so it has some difference between old and new beat values
        metronome.update(10);

        clipPlayer.update(10);
        expect(clipPlayer.beatsPassed).to.equal(0);
    }

    @test 'Update doesnt do anything if midiOut isnt set'() {
        //Setup
        const metronome = new Metronome(120);
        const clipPlayer = new ClipPlayer(new Clip(16), metronome, null);

        //Update metronome so it has some difference between old and new beat values
        metronome.update(10);

        clipPlayer.update(10);
        expect(clipPlayer.beatsPassed).to.equal(0);
    }

    @test 'Update creates new notes on the passed in MidiOut'() {
        const clip = new Clip(16);
        clip.notes.push(new ClipNote(0, 1, 60, 100));
        const metronome = new Metronome(120);
        const midiOut = new MidiOut(new DummyPort());
        const clipPlayer = new ClipPlayer(clip, metronome, midiOut);

        //Update metronome so it has some difference between old and new beat values
        metronome.update(10);

        clipPlayer.update(10);
        expect(midiOut.notes.length).to.equal(1);
        expect(midiOut.notes[0].on).to.be.true;
    }

    @test 'Update stops notes which should be ended'() {
        const clip = new Clip(16);
        clip.notes.push(new ClipNote(0, 1, 60, 100));
        const metronome = new Metronome(120);
        const midiOut = new MidiOut(new DummyPort());
        const clipPlayer = new ClipPlayer(clip, metronome, midiOut);

        metronome.update(10);
        clipPlayer.update(10);
        expect(midiOut.notes.length).to.equal(1);
        expect(midiOut.notes[0].on).to.be.true;

        metronome.update(500);
        clipPlayer.update(10);
        expect(midiOut.notes[0].on).to.be.false;
    }

    @test 'Update increases beatsPassed property'() {
        //Setup
        const metronome = new Metronome(120);
        const midiOut = new MidiOut(new DummyPort());
        const clipPlayer = new ClipPlayer(new Clip(16), metronome, midiOut);

        //Update metronome so it has some difference between old and new beat values
        metronome.update(10);

        expect(clipPlayer.running).to.be.true;
        expect(clipPlayer.beatsPassed).to.equal(0);
        clipPlayer.update(10);
        expect(clipPlayer.beatsPassed).to.be.greaterThan(0);
    }

    @test 'Update sets isFinished if beatsPassed exceeds beatCount'() {
        //Setup
        const metronome = new Metronome(120);
        const midiOut = new MidiOut(new DummyPort());
        const clipPlayer = new ClipPlayer(new Clip(16), metronome, midiOut);
        clipPlayer.beatCount = 1;

        metronome.update(510);
        expect(clipPlayer.isFinished).to.be.false;
        clipPlayer.update(10);
        expect(clipPlayer.isFinished).to.be.true;
    }

    @test 'noteModifier gets called for each new note thats created'() {
        const clip = new Clip(16);
        clip.notes.push(new ClipNote(0, 1, 60, 100));
        const metronome = new Metronome(120);
        const midiOut = new MidiOut(new DummyPort());
        const clipPlayer = new ClipPlayer(clip, metronome, midiOut);
        clipPlayer.noteModifier = n => n.pitch += 2;

        metronome.update(10);
        clipPlayer.update(10);
        expect(midiOut.notes.length).to.equal(1);
        expect(midiOut.notes[0].pitch).to.equal(62);
    }

    @test 'If ClipNote velocity is a tween it gets called with each update'() {
        const clip = new Clip(16);
        clip.notes.push(new ClipNote(0, 1, 60, Tween.linear(100, 50)));
        const metronome = new Metronome(60);
        const midiOut = new MidiOut(new DummyPort());
        const clipPlayer = new ClipPlayer(clip, metronome, midiOut);

        metronome.update(100);
        clipPlayer.update(100);
        expect(midiOut.notes.length).to.equal(1);
        expect(midiOut.notes[0].on).to.be.true;
        expect(midiOut.notes[0].velocity).to.equal(95);

        metronome.update(500);
        clipPlayer.update(500);
        expect(midiOut.notes[0].velocity).to.equal(70);
    }

    @test 'Player can end notes from old clip if clip gets changed'() {
        const clip1 = new Clip(4);
        clip1.notes.push(new ClipNote(0, 1, 60, 80));
        const clip2 = new Clip(4);
        const metronome = new Metronome(120);
        const midiOut = new MidiOut(new DummyPort());
        const clipPlayer = new ClipPlayer(clip1, metronome, midiOut);

        metronome.update(10);
        clipPlayer.update(10);
        expect(clipPlayer['_notes'].length).to.equal(1);

        clipPlayer.clip = clip2;

        metronome.update(10);
        clipPlayer.update(10);
        expect(clipPlayer['_notes'].length).to.equal(0);
    }

    @test 'Player can end notes if they get removed from the clip'() {
        const clip = new Clip(4);
        clip.notes.push(new ClipNote(0, 1, 60, 80));
        const metronome = new Metronome(120);
        const midiOut = new MidiOut(new DummyPort());
        const clipPlayer = new ClipPlayer(clip, metronome, midiOut);

        metronome.update(10);
        clipPlayer.update(10);
        expect(clipPlayer['_notes'].length).to.equal(1);

        clip.notes = [];

        metronome.update(10);
        clipPlayer.update(10);
        expect(clipPlayer['_notes'].length).to.equal(0);
    }

    @test 'Control Changes with static values get correctly played'() {
        const clip = new Clip(4);
        clip.controlChanges.push(new ClipCC(0, 0, 10, 15));
        const metronome = new Metronome(120);
        const midiPort = new DummyPort();
        const midiOut = new MidiOut(midiPort);
        const clipPlayer = new ClipPlayer(clip, metronome, midiOut);

        metronome.update(10);
        clipPlayer.update(10);
        expect(midiPort.messages.length).to.equal(1);
        expect(midiPort.messages[0][0]).to.equal(0xB0);
        expect(midiPort.messages[0][1]).to.equal(10);
        expect(midiPort.messages[0][2]).to.equal(15);
    }

    @test 'Control Changes with tween values get correctly played'() {
        const clip = new Clip(4);
        clip.controlChanges.push(new ClipCC(0, 1, 10, Tween.linear(0, 126)));
        const metronome = new Metronome(60);
        const midiPort = new DummyPort();
        const midiOut = new MidiOut(midiPort);
        const clipPlayer = new ClipPlayer(clip, metronome, midiOut);

        metronome.update(500);
        clipPlayer.update(500);
        expect(midiPort.messages.length).to.equal(1);
        expect(midiPort.messages[0][0]).to.equal(0xB0);
        expect(midiPort.messages[0][1]).to.equal(10);
        expect(midiPort.messages[0][2]).to.equal(63);
    }

    @test 'Skip playing static value control change if it ends before current play range and was played on last update'() {
        const clip = new Clip(4);
        clip.controlChanges.push(new ClipCC(0, 1, 10, 20));
        const metronome = new Metronome(60);
        const midiPort = new DummyPort();
        const midiOut = new MidiOut(midiPort);
        const clipPlayer = new ClipPlayer(clip, metronome, midiOut);

        metronome.update(500);
        clipPlayer.update(500);
        midiPort.messages = [];
        metronome.update(550);
        clipPlayer.update(550);
        expect(midiPort.messages.length).to.equal(0);
    }

    @test 'Uses Control Change channel if specified'() {
        const clip = new Clip(4);
        clip.controlChanges.push(new ClipCC(0, 1, 10, 20, 7));
        const metronome = new Metronome(120);
        const midiPort = new DummyPort();
        const midiOut = new MidiOut(midiPort);
        const clipPlayer = new ClipPlayer(clip, metronome, midiOut);

        metronome.update(10);
        clipPlayer.update(10);
        expect(midiPort.messages.length).to.equal(1);
        expect(midiPort.messages[0][0]).to.equal(0xB0 + 7);
        expect(midiPort.messages[0][1]).to.equal(10);
        expect(midiPort.messages[0][2]).to.equal(20);
    }

    @test 'Control Change tween percent is capped at 1'() {
        const clip = new Clip(4);
        clip.controlChanges.push(new ClipCC(0, 1, 10, Tween.linear(0, 126)));
        const metronome = new Metronome(120);
        const midiPort = new DummyPort();
        const midiOut = new MidiOut(midiPort);
        const clipPlayer = new ClipPlayer(clip, metronome, midiOut);

        metronome.update(1500);
        clipPlayer.update(1500);
        expect(midiPort.messages.length).to.equal(1);
        expect(midiPort.messages[0][0]).to.equal(0xB0);
        expect(midiPort.messages[0][1]).to.equal(10);
        expect(midiPort.messages[0][2]).to.equal(126);
    }

    @test 'Pitch Bends with static values get correctly played'() {
        const clip = new Clip(4);
        clip.bends.push(new ClipBend(0, 0, 0.5));
        const metronome = new Metronome(120);
        const midiPort = new DummyPort();
        const midiOut = new MidiOut(midiPort);
        const clipPlayer = new ClipPlayer(clip, metronome, midiOut);

        metronome.update(10);
        clipPlayer.update(10);
        expect(midiPort.messages.length).to.equal(1);
        expect(midiPort.messages[0][0]).to.equal(0xE0);
        expect(midiPort.messages[0][1]).to.equal(getBendValFromPercent(0.5)[0]);
        expect(midiPort.messages[0][2]).to.equal(getBendValFromPercent(0.5)[1]);
    }

    @test 'Pitch Bends with tween values get correctly played'() {
        const clip = new Clip(4);
        clip.bends.push(new ClipBend(0, 1, Tween.linear(0, 1)));
        const metronome = new Metronome(60);
        const midiPort = new DummyPort();
        const midiOut = new MidiOut(midiPort);
        const clipPlayer = new ClipPlayer(clip, metronome, midiOut);

        metronome.update(750);
        clipPlayer.update(750);
        expect(midiPort.messages.length).to.equal(1);
        expect(midiPort.messages[0][0]).to.equal(0xE0);
        expect(midiPort.messages[0][1]).to.equal(getBendValFromPercent(0.75)[0]);
        expect(midiPort.messages[0][2]).to.equal(getBendValFromPercent(0.75)[1]);
    }

    @test 'Skip playing static value pitch bend if it ends before current play range and was played on last update'() {
        const clip = new Clip(4);
        clip.bends.push(new ClipBend(0, 1, 0.5));
        const metronome = new Metronome(60);
        const midiPort = new DummyPort();
        const midiOut = new MidiOut(midiPort);
        const clipPlayer = new ClipPlayer(clip, metronome, midiOut);

        metronome.update(500);
        clipPlayer.update(500);
        midiPort.messages = [];
        metronome.update(550);
        clipPlayer.update(550);
        expect(midiPort.messages.length).to.equal(0);
    }

    @test 'Uses Pitch Bend channel if specified'() {
        const clip = new Clip(4);
        clip.bends.push(new ClipBend(0, 1, 0.5, 7));
        const metronome = new Metronome(120);
        const midiPort = new DummyPort();
        const midiOut = new MidiOut(midiPort);
        const clipPlayer = new ClipPlayer(clip, metronome, midiOut);

        metronome.update(10);
        clipPlayer.update(10);
        expect(midiPort.messages.length).to.equal(1);
        expect(midiPort.messages[0][0]).to.equal(0xE0 + 7);
        expect(midiPort.messages[0][1]).to.equal(getBendValFromPercent(0.5)[0]);
        expect(midiPort.messages[0][2]).to.equal(getBendValFromPercent(0.5)[1]);
    }

    @test 'Pitch Bend value tween percent is capped at 1'() {
        const clip = new Clip(4);
        clip.bends.push(new ClipBend(0, 1, Tween.linear(0, 1)));
        const metronome = new Metronome(120);
        const midiPort = new DummyPort();
        const midiOut = new MidiOut(midiPort);
        const clipPlayer = new ClipPlayer(clip, metronome, midiOut);

        metronome.update(1500);
        clipPlayer.update(1500);
        expect(midiPort.messages.length).to.equal(1);
        expect(midiPort.messages[0][0]).to.equal(0xE0);
        expect(midiPort.messages[0][1]).to.equal(getBendValFromPercent(1)[0]);
        expect(midiPort.messages[0][2]).to.equal(getBendValFromPercent(1)[1]);
    }

    @test 'Clip player doesnt start new notes if its about to end'() {
        const clip = new Clip(4);
        clip.notes.push(new ClipNote(3.99, 1, 60, 80));
        const metronome = new Metronome(60);
        const midiPort = new DummyPort();
        const midiOut = new MidiOut(midiPort);
        const clipPlayer = new ClipPlayer(clip, metronome, midiOut);
        clipPlayer.beatCount = 4;

        metronome.update(3950);
        clipPlayer.update(3950);
        expect(midiOut.notes.length).to.equal(0);

        metronome.update(100);
        clipPlayer.update(100);
        expect(midiOut.notes.length).to.equal(0);
        expect(clipPlayer.isFinished).to.be.true;
    }

    @test 'start sets running to true'() {
        const metronome = new Metronome(120);
        const midiOut = new MidiOut(new DummyPort());
        const clipPlayer = new ClipPlayer(new Clip(16), metronome, midiOut);
        clipPlayer.running = false;

        clipPlayer.start();
        expect(clipPlayer.running).to.be.true;
    }

    @test 'pause sets running to false'() {
        const metronome = new Metronome(120);
        const midiOut = new MidiOut(new DummyPort());
        const clipPlayer = new ClipPlayer(new Clip(16), metronome, midiOut);

        expect(clipPlayer.running).to.be.true;
        clipPlayer.pause();
        expect(clipPlayer.running).to.be.false;
    }

    @test 'stop sets running to false'() {
        const metronome = new Metronome(120);
        const midiOut = new MidiOut(new DummyPort());
        const clipPlayer = new ClipPlayer(new Clip(16), metronome, midiOut);

        expect(clipPlayer.running).to.be.true;
        clipPlayer.stop();
        expect(clipPlayer.running).to.be.false;
    }

    @test 'withRef sets ref value'() {
        const metronome = new Metronome(120);
        const midiOut = new MidiOut(new DummyPort());
        const clipPlayer = new ClipPlayer(new Clip(16), metronome, midiOut).withRef('Testy test');
        expect(clipPlayer.ref).to.equal('Testy test');
    }

    @test 'finished event gets fired'() {
        //Setup
        const metronome = new Metronome(120);
        const midiOut = new MidiOut(new DummyPort());
        const clipPlayer = new ClipPlayer(new Clip(16), metronome, midiOut);
        let testVar = 0;
        clipPlayer.finished.add(() => testVar = 3);

        clipPlayer.finish();
        expect(testVar).to.equal(3);
    }

    @test 'No notes get played if muteNotes is true'() {
        const metronome = new Metronome(120);
        const midiOut = new MidiOut(new DummyPort());
        const clip = new Clip(16).addNote(0, 1, 60, 80);
        const clipPlayer = new ClipPlayer(clip, metronome, midiOut);
        clipPlayer.muteNotes = true;

        metronome.update(50);
        clipPlayer.update(50);
        expect(midiOut.notes.length).to.equal(0);
    }

    @test 'All existing notes get stopped when muteNotes is set to true'() {
        const metronome = new Metronome(120);
        const midiOut = new MidiOut(new DummyPort());
        const clip = new Clip(16).addNote(0, 1, 60, 80);
        const clipPlayer = new ClipPlayer(clip, metronome, midiOut);
        metronome.update(50);
        clipPlayer.update(50);
        expect(midiOut.notes[0].on).to.be.true;

        clipPlayer.muteNotes = true;
        expect(midiOut.notes[0].on).to.be.false;
    }

    @test 'No CCs get played when muteCCs is true'() {
        const metronome = new Metronome(120);
        const port = new DummyPort();
        const midiOut = new MidiOut(port);
        const clip = new Clip(16).addCC(0, 1, 10, 123);
        const clipPlayer = new ClipPlayer(clip, metronome, midiOut);
        clipPlayer.muteCCs = true;

        metronome.update(50);
        clipPlayer.update(50);
        expect(port.messages.length).to.equal(0);
    }

    @test 'No bends get played when muteBends is true'() {
        const metronome = new Metronome(120);
        const port = new DummyPort();
        const midiOut = new MidiOut(port);
        const clip = new Clip(16).addBend(0, 1, 0.5);
        const clipPlayer = new ClipPlayer(clip, metronome, midiOut);
        clipPlayer.muteBends = true;

        metronome.update(50);
        clipPlayer.update(50);
        expect(port.messages.length).to.equal(0);
    }

    @test 'Setting muteAll to true turns on all mutes'() {
        const clipPlayer = new ClipPlayer(null, null, null);

        clipPlayer.muteAll = true;

        expect(clipPlayer.muteNotes).to.be.true;
        expect(clipPlayer.muteCCs).to.be.true;
        expect(clipPlayer.muteBends).to.be.true;
    }

    @test 'Setting muteAll to false turns off all mutes'() {
        const clipPlayer = new ClipPlayer(null, null, null);
        clipPlayer.muteNotes = true;
        clipPlayer.muteCCs = true;
        clipPlayer.muteBends = true;

        clipPlayer.muteAll = false;

        expect(clipPlayer.muteNotes).to.be.false;
        expect(clipPlayer.muteCCs).to.be.false;
        expect(clipPlayer.muteBends).to.be.false;
    }

    @test 'Get muteAll returns true if all mutes are on'() {
        const clipPlayer = new ClipPlayer(null, null, null);
        clipPlayer.muteNotes = true;
        clipPlayer.muteCCs = true;
        clipPlayer.muteBends = true;

        expect(clipPlayer.muteAll).to.be.true;
    }

    @test 'Get muteAll returns false if any mute is off'() {
        const clipPlayer = new ClipPlayer(null, null, null);
        clipPlayer.muteNotes = false;
        clipPlayer.muteCCs = true;
        clipPlayer.muteBends = true;

        expect(clipPlayer.muteAll).to.be.false;
    }

    @test 'Automatically adds itself to default clock if set'() {
        Clock.default = new Clock();
        const player = new ClipPlayer(null, null, null);

        expect(Clock.default.children).to.contain(player);

        Clock.default = null;
    }
}