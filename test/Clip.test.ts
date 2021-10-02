import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import { Clip, ClipNote } from '../src/Clip';


@suite class ClipTests {
    @test 'getNotesStartingInRange handles wrapping around start/end'() {
        const clip = new Clip(4);
        clip.notes.push(
            new ClipNote(0, 1, 60, 80),
            new ClipNote(1, 1, 61, 80),
            new ClipNote(2, 1, 62, 80),
            new ClipNote(3, 1, 63, 80)
        );
        const startingNotes = clip.getNotesStartingInRange(3.9, 0.1);

        expect(startingNotes.length).to.equal(1);
        expect(startingNotes[0].pitch).to.equal(60);
    }

    @test 'getNotesEndingInRange handles wrapping around start/end'() {
        const clip = new Clip(4);
        clip.notes.push(
            new ClipNote(0, 1, 60, 80),
            new ClipNote(1, 1, 61, 80),
            new ClipNote(2, 1, 62, 80),
            new ClipNote(3, 1, 63, 80)
        );
        const endingNotes = clip.getNotesEndingInRange(3.9, 0.1);
        expect(endingNotes.length).to.equal(1);
        expect(endingNotes[0].pitch).to.equal(63);
    }
}