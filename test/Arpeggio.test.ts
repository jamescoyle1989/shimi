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

    @test 'createNote returns null if pitch is null'() {
        const arpNote = new ArpeggioNote(0, 1, c => null, 80);
        const chord = new Chord().addPitches([4, 8, 11]);
        expect(arpNote.createNote(chord, 1)).to.be.null;
    }

    @test 'createNote returns null if pitch is less than 0'() {
        const arpNote = new ArpeggioNote(0, 1, c => -1, 80);
        const chord = new Chord().addPitches([4, 8, 11]);
        expect(arpNote.createNote(chord, 1)).to.be.null;
    }

    @test 'createNote returns null if pitch is more than 127'() {
        const arpNote = new ArpeggioNote(0, 1, c => 128, 80);
        const chord = new Chord().addPitches([4, 8, 11]);
        expect(arpNote.createNote(chord, 1)).to.be.null;
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

    @test 'addNote can add new note'() {
        const arp = new Arpeggio(4);
        arp.addNote(0, 1, c => c.getPitch(0), 80);
        expect(arp.notes.length).to.equal(1);
        expect(arp.notes[0].start).to.equal(0);
        expect(arp.notes[0].duration).to.equal(1);
    }

    @test 'addNote returns reference to parent arpeggio object'() {
        const arp = new Arpeggio(4)
            .addNote(0, 1, c => c.getPitch(0), 80);
        expect(arp.notes.length).to.equal(1);
    }

    @test 'addNote can take array of note starts'() {
        const arp = new Arpeggio(4)
            .addNote([0,1,2,3], 1, c => c.getPitch(0), 80);
        expect(arp.notes.length).to.equal(4);
    }
}