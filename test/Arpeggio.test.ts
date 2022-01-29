import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import { Arpeggio, ArpeggioNote } from '../src/Arpeggio';
import Chord from '../src/Chord';


@suite class ArpeggioTests {
    @test 'createNote returns null if no chord passed in'() {
        const arpNote = new ArpeggioNote(0, 1, c => c.getPitch(0), 80);
        expect(arpNote.createNote(null, 0)).to.be.null;
        expect(arpNote.createNote(undefined, 0)).to.be.null;
    }

    @test 'createNote returns new note object'() {
        const chord = new Chord().addPitches([4, 8, 11]);
        const arpNote = new ArpeggioNote(0, 1, c => c.getPitch(1), 81, 3);
        const note = arpNote.createNote(chord, 1);
        expect(note.pitch).to.equal(8);
        expect(note.velocity).to.equal(81);
        expect(note.channel).to.equal(3);
    }

    @test 'getNotesStartingInRange handles wrapping around start/end'() {
        const arp = new Arpeggio(4);
        arp.notes.push(
            new ArpeggioNote(0, 1, c => c.getPitch(0), 80),
            new ArpeggioNote(1, 1, c => c.getPitch(1), 81),
            new ArpeggioNote(2, 1, c => c.getPitch(2), 82),
            new ArpeggioNote(3, 1, c => c.getPitch(1), 83)
        );
        const startingNotes = arp.getNotesStartingInRange(3.9, 0.1);

        expect(startingNotes.length).to.equal(1);
        expect(startingNotes[0].velocity).to.equal(80);
    }

    @test 'getNotesEndingInRange handles wrapping around start/end'() {
        const arp = new Arpeggio(4);
        arp.notes.push(
            new ArpeggioNote(0, 1, c => c.getPitch(0), 80),
            new ArpeggioNote(1, 1, c => c.getPitch(1), 81),
            new ArpeggioNote(2, 1, c => c.getPitch(2), 82),
            new ArpeggioNote(3, 1, c => c.getPitch(1), 83)
        );
        const endingNotes = arp.getNotesEndingInRange(3.9, 0.1);
        expect(endingNotes.length).to.equal(1);
        expect(endingNotes[0].velocity).to.equal(83);
    }
}