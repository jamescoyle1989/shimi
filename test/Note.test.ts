import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import Note from '../src/Note';

@suite class NoteTests {
    @test 'initialised correctly'() {
        const note = new Note(60, 120, 4, 'hello');
        expect(note.pitch).to.equal(60);
        expect(note.velocity).to.equal(120);
        expect(note.velocityTracker.isDirty).to.be.false;
        expect(note.on).to.be.true;
        expect(note.onTracker.isDirty).to.be.true;
        expect(note.channel).to.equal(4);
        expect(note.ref).to.equal('hello');
    }

    @test 'start when note is off'() {
        const note = new Note(60, 120, 1);
        note.on = false;
        expect(note.start()).to.be.true;
        expect(note.on).to.be.true;
    }

    @test 'start when note is on'() {
        const note = new Note(60, 120, 1);
        expect(note.start()).to.be.false;
        expect(note.on).to.be.true;
    }

    @test 'stop when note is on'() {
        const note = new Note(60, 120, 1);
        expect(note.stop()).to.be.true;
        expect(note.on).to.be.false;
    }

    @test 'stop when note is off'() {
        const note = new Note(60, 120, 1);
        note.on = false;
        expect(note.stop()).to.be.false;
        expect(note.on).to.be.false;
    }

    @test 'constructor can take pitch string'() {
        const note = new Note('C2', 80, 0);
        expect(note.pitch).to.equal(36);
    }
}