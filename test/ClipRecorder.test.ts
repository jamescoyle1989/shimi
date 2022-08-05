import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import DummyPort from './DummyPort';
import ClipRecorder from '../src/ClipRecorder';
import Metronome from '../src/Metronome';
import MidiIn from '../src/MidiIn';
import MidiBus from '../src/MidiBus';
import * as messages from '../src/MidiMessages';
import { Clip } from '../src/Clip';


@suite class ClipRecorderTests {
    @test 'Changing beatCount changes the clip duration'() {
        const clipRecorder = new ClipRecorder(
            new Metronome(120), 
            new MidiIn(new DummyPort())
        );
        expect(clipRecorder.beatCount).to.equal(4);
        expect(clipRecorder['_clip'].duration).to.equal(4);
        clipRecorder.beatCount = 100;
        expect(clipRecorder.beatCount).to.equal(100);
        expect(clipRecorder['_clip'].duration).to.equal(100);
    }

    @test 'Changing beatCount to null changes the clip duration to 0'() {
        const clipRecorder = new ClipRecorder(
            new Metronome(120), 
            new MidiIn(new DummyPort())
        );
        expect(clipRecorder.beatCount).to.equal(4);
        expect(clipRecorder['_clip'].duration).to.equal(4);
        clipRecorder.beatCount = null;
        expect(clipRecorder.beatCount).to.equal(null);
        expect(clipRecorder['_clip'].duration).to.equal(0);
    }

    @test 'Update doesnt do anything if finished is true'() {
        const metronome = new Metronome(120);
        const clipRecorder = new ClipRecorder(
            metronome, 
            new MidiIn(new DummyPort())
        );
        expect(clipRecorder.finished).to.be.false;
        //Update metronome so it has some difference between old and new beat values
        metronome.update(10);

        clipRecorder.finish();
        clipRecorder.update(10);
        expect(clipRecorder.beatsPassed).to.equal(0);
    }

    @test 'Update doesnt do anything if metronome isnt set'() {
        const clipRecorder = new ClipRecorder(
            null,
            new MidiIn(new DummyPort())
        );
        clipRecorder.update(10);
        expect(clipRecorder.beatsPassed).to.equal(0);
    }

    @test 'Update doesnt do anything if midiIn isnt set'() {
        const metronome = new Metronome(120);
        const clipRecorder = new ClipRecorder(
            metronome,
            null
        );
        metronome.update(10);
        clipRecorder.update(10);
        expect(clipRecorder.beatsPassed).to.equal(0);
    }

    @test 'Update increases beatsPassed property'() {
        const metronome = new Metronome(120);
        const clipRecorder = new ClipRecorder(
            metronome, 
            new MidiIn(new DummyPort())
        );
        metronome.update(10);
        expect(clipRecorder.beatsPassed).to.equal(0);
        clipRecorder.update(10);
        expect(clipRecorder.beatsPassed).to.be.greaterThan(0);
    }

    @test 'Update sets finished if beatsPassed exceeds beatCount'() {
        const metronome = new Metronome(120);
        const clipRecorder = new ClipRecorder(
            metronome, 
            new MidiIn(new DummyPort())
        );
        metronome.update(2010);
        expect(clipRecorder.finished).to.be.false;
        clipRecorder.update(2010);
        expect(clipRecorder.finished).to.be.true;
    }

    @test 'New notes get recorded'() {
        const metronome = new Metronome(120);
        const midiBus = new MidiBus();
        const clipRecorder = new ClipRecorder(metronome, midiBus);
        metronome.update(500);
        clipRecorder.update(500);
        midiBus.sendMessage(new messages.NoteOnMessage(60, 80, 2));
        metronome.update(500);
        clipRecorder.update(500);
        midiBus.sendMessage(new messages.NoteOffMessage(60, 80, 2));
        expect(clipRecorder['_clip'].notes.length).to.equal(1);
        expect(clipRecorder['_clip'].notes[0].pitch).to.equal(60);
        expect(clipRecorder['_clip'].notes[0].velocity).to.equal(80);
        expect(clipRecorder['_clip'].notes[0].channel).to.equal(2);
        expect(clipRecorder['_clip'].notes[0].start).to.equal(1);
        expect(clipRecorder['_clip'].notes[0].duration).to.equal(1);
    }

    @test 'When the recording ends, all outstanding notes get added'() {
        const metronome = new Metronome(120);
        const midiBus = new MidiBus();
        const clipRecorder = new ClipRecorder(metronome, midiBus);
        metronome.update(1500);
        clipRecorder.update(1500);
        midiBus.sendMessage(new messages.NoteOnMessage(60, 80, 2));
        metronome.update(750);
        clipRecorder.update(750);
        expect(clipRecorder.finished).to.be.true;
        expect(clipRecorder['_clip'].notes.length).to.equal(1);
        expect(clipRecorder['_clip'].notes[0].pitch).to.equal(60);
        expect(clipRecorder['_clip'].notes[0].velocity).to.equal(80);
        expect(clipRecorder['_clip'].notes[0].channel).to.equal(2);
        expect(clipRecorder['_clip'].notes[0].start).to.equal(3);
        expect(clipRecorder['_clip'].notes[0].duration).to.equal(1);
    }

    @test 'Control changes get recorded'() {
        const metronome = new Metronome(120);
        const midiBus = new MidiBus();
        const clipRecorder = new ClipRecorder(metronome, midiBus);
        metronome.update(500);
        clipRecorder.update(500);
        midiBus.sendMessage(new messages.ControlChangeMessage(50, 70, 3));
        expect(clipRecorder['_clip'].controlChanges.length).to.equal(1);
        expect(clipRecorder['_clip'].controlChanges[0].controller).to.equal(50);
        expect(clipRecorder['_clip'].controlChanges[0].value).to.equal(70);
        expect(clipRecorder['_clip'].controlChanges[0].channel).to.equal(3);
        expect(clipRecorder['_clip'].controlChanges[0].start).to.equal(1);
        expect(clipRecorder['_clip'].controlChanges[0].duration).to.equal(0);
    }

    @test 'Pitch bends get recorded'() {
        const metronome = new Metronome(120);
        const midiBus = new MidiBus();
        const clipRecorder = new ClipRecorder(metronome, midiBus);
        metronome.update(500);
        clipRecorder.update(500);
        midiBus.sendMessage(new messages.PitchBendMessage(0.75, 3));
        expect(clipRecorder['_clip'].bends.length).to.equal(1);
        expect(clipRecorder['_clip'].bends[0].percent).to.equal(0.75);
        expect(clipRecorder['_clip'].bends[0].channel).to.equal(3);
        expect(clipRecorder['_clip'].bends[0].start).to.equal(1);
        expect(clipRecorder['_clip'].bends[0].duration).to.equal(0);
    }

    @test 'newClip event gets dispatched once recording is finished'() {
        const metronome = new Metronome(120);
        const midiBus = new MidiBus();
        const clipRecorder = new ClipRecorder(metronome, midiBus);
        const recordedClips: Clip[] = [];
        clipRecorder.newClip.add(evt => recordedClips.push(evt.clip));
        metronome.update(2001);
        expect(recordedClips.length).to.equal(0);
        clipRecorder.update(2001);
        expect(recordedClips.length).to.equal(1);
    }

    @test 'midiIn event subscriptions get set'() {
        const midiBus = new MidiBus();
        const clipRecorder = new ClipRecorder(null, midiBus);
        expect(midiBus.noteOn.handlers.length).to.equal(1);
        expect(midiBus.noteOff.handlers.length).to.equal(1);
        expect(midiBus.controlChange.handlers.length).to.equal(1);
        expect(midiBus.pitchBend.handlers.length).to.equal(1);
        
        clipRecorder.midiIn = null;
        expect(midiBus.noteOn.handlers.length).to.equal(0);
        expect(midiBus.noteOff.handlers.length).to.equal(0);
        expect(midiBus.controlChange.handlers.length).to.equal(0);
        expect(midiBus.pitchBend.handlers.length).to.equal(0);
    }

    @test 'New notes get recorded properly when beatCount is null'() {
        const metronome = new Metronome(120);
        const midiBus = new MidiBus();
        const clipRecorder = new ClipRecorder(metronome, midiBus);
        clipRecorder.beatCount = null;
        metronome.update(500);
        clipRecorder.update(500);
        midiBus.sendMessage(new messages.NoteOnMessage(60, 80, 2));
        metronome.update(500);
        clipRecorder.update(500);
        midiBus.sendMessage(new messages.NoteOffMessage(60, 80, 2));
        expect(clipRecorder['_clip'].notes.length).to.equal(1);
        expect(clipRecorder['_clip'].notes[0].pitch).to.equal(60);
        expect(clipRecorder['_clip'].notes[0].velocity).to.equal(80);
        expect(clipRecorder['_clip'].notes[0].channel).to.equal(2);
        expect(clipRecorder['_clip'].notes[0].start).to.equal(1);
        expect(clipRecorder['_clip'].notes[0].duration).to.equal(1);
    }

    @test 'Clip duration gets set to beatsPassed property if beatCount is null'() {
        const metronome = new Metronome(120);
        const midiBus = new MidiBus();
        const clipRecorder = new ClipRecorder(metronome, midiBus);
        clipRecorder.beatCount = null;
        const recordedClips: Clip[] = [];
        clipRecorder.newClip.add(evt => recordedClips.push(evt.clip));
        metronome.update(5000);
        clipRecorder.update(5000);
        clipRecorder.finish();
        expect(recordedClips.length).to.equal(1);
        expect(recordedClips[0].duration).to.equal(10);
    }
}