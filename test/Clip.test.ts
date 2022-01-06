import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import { Clip, ClipCC, ClipBend, ClipNote } from '../src/Clip';


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

    @test 'getControlChangesIntersectingRange returns items ending in range'() {
        const clip = new Clip(8);
        clip.controlChanges.push(
            new ClipCC(1, 1, 10, 10),
            new ClipCC(3, 1, 20, 20)
        );
        const inRange = clip.getControlChangesIntersectingRange(1.5, 2.5);
        expect(inRange.length).to.equal(1);
        expect(inRange[0].controller).to.equal(10);
    }

    @test 'getControlChangesIntersectingRange returns items starting in range'() {
        const clip = new Clip(8);
        clip.controlChanges.push(
            new ClipCC(1, 1, 10, 10),
            new ClipCC(3, 1, 20, 20)
        );
        const inRange = clip.getControlChangesIntersectingRange(0.5, 1.5);
        expect(inRange.length).to.equal(1);
        expect(inRange[0].controller).to.equal(10);
    }

    @test 'getControlChangesIntersectingRange returns items containing range'() {
        const clip = new Clip(8);
        clip.controlChanges.push(
            new ClipCC(1, 1, 10, 10),
            new ClipCC(3, 1, 20, 20)
        );
        const inRange = clip.getControlChangesIntersectingRange(1.4, 1.6);
        expect(inRange.length).to.equal(1);
        expect(inRange[0].controller).to.equal(10);
    }

    @test 'getControlChangesIntersectingRange returns items contained in range'() {
        const clip = new Clip(8);
        clip.controlChanges.push(
            new ClipCC(1, 1, 10, 10),
            new ClipCC(3, 1, 20, 20)
        );
        const inRange = clip.getControlChangesIntersectingRange(0.5, 2.5);
        expect(inRange.length).to.equal(1);
        expect(inRange[0].controller).to.equal(10);
    }

    @test 'getControlChangesIntersectingRange returns items ending in wrapped range'() {
        const clip = new Clip(8);
        clip.controlChanges.push(
            new ClipCC(1, 1, 10, 10),
            new ClipCC(6, 1, 20, 20)
        );
        const inRange = clip.getControlChangesIntersectingRange(5.5, 0.5);
        expect(inRange.length).to.equal(1);
        expect(inRange[0].controller).to.equal(20);
    }

    @test 'getControlChangesIntersectingRange returns items starting in wrapped range'() {
        const clip = new Clip(8);
        clip.controlChanges.push(
            new ClipCC(1, 1, 10, 10),
            new ClipCC(6, 1, 20, 20)
        );
        const inRange = clip.getControlChangesIntersectingRange(7.5, 1.5);
        expect(inRange.length).to.equal(1);
        expect(inRange[0].controller).to.equal(10);
    }



    @test 'getBendsIntersectingRange returns items ending in range'() {
        const clip = new Clip(8);
        clip.bends.push(
            new ClipBend(1, 1, -1),
            new ClipBend(3, 1, 1)
        );
        const inRange = clip.getBendsIntersectingRange(1.5, 2.5);
        expect(inRange.length).to.equal(1);
        expect(inRange[0].percent).to.equal(-1);
    }

    @test 'getBendsIntersectingRange returns items starting in range'() {
        const clip = new Clip(8);
        clip.bends.push(
            new ClipBend(1, 1, -1),
            new ClipBend(3, 1, 1)
        );
        const inRange = clip.getBendsIntersectingRange(0.5, 1.5);
        expect(inRange.length).to.equal(1);
        expect(inRange[0].percent).to.equal(-1);
    }

    @test 'getBendsIntersectingRange returns items containing range'() {
        const clip = new Clip(8);
        clip.bends.push(
            new ClipBend(1, 1, -1),
            new ClipBend(3, 1, 1)
        );
        const inRange = clip.getBendsIntersectingRange(1.4, 1.6);
        expect(inRange.length).to.equal(1);
        expect(inRange[0].percent).to.equal(-1);
    }

    @test 'getBendsIntersectingRange returns items contained in range'() {
        const clip = new Clip(8);
        clip.bends.push(
            new ClipBend(1, 1, -1),
            new ClipBend(3, 1, 1)
        );
        const inRange = clip.getBendsIntersectingRange(0.5, 2.5);
        expect(inRange.length).to.equal(1);
        expect(inRange[0].percent).to.equal(-1);
    }

    @test 'getBendsIntersectingRange returns items ending in wrapped range'() {
        const clip = new Clip(8);
        clip.bends.push(
            new ClipBend(1, 1, -1),
            new ClipBend(6, 1, 1)
        );
        const inRange = clip.getBendsIntersectingRange(5.5, 0.5);
        expect(inRange.length).to.equal(1);
        expect(inRange[0].percent).to.equal(1);
    }

    @test 'getBendsIntersectingRange returns items starting in wrapped range'() {
        const clip = new Clip(8);
        clip.bends.push(
            new ClipBend(1, 1, -1),
            new ClipBend(6, 1, 1)
        );
        const inRange = clip.getBendsIntersectingRange(7.5, 1.5);
        expect(inRange.length).to.equal(1);
        expect(inRange[0].percent).to.equal(-1);
    }

    @test 'duplicate copies clip length'() {
        const clip = new Clip((Math.random() * 7) + 1);
        const clip2 = clip.duplicate();
        expect(clip2.start).to.equal(clip.start);
        expect(clip2.duration).to.equal(clip.duration);
        expect(clip2.end).to.equal(clip.end);
    }

    @test 'duplicate copies clip notes'() {
        const clip = new Clip(8);
        for (let i = 0; i < 5; i++) {
            clip.notes.push(new ClipNote(
                Math.random() * 8,
                Math.random() * 2,
                Math.floor(Math.random() * 127),
                Math.floor(Math.random() * 127)
            ));
        }

        const clip2 = clip.duplicate();
        expect(clip2.notes.length).to.equal(clip.notes.length);
        for (let i = 0; i < clip2.notes.length; i++) {
            const note = clip.notes[i];
            const note2 = clip2.notes[i];
            expect(note2.start).to.equal(note.start);
            expect(note2.duration).to.equal(note.duration);
            expect(note2.pitch).to.equal(note.pitch);
            expect(note2.velocity).to.equal(note.velocity);
            expect(note2.channel).to.equal(note.channel);
        }
    }

    @test 'duplicate copies clip control changes'() {
        const clip = new Clip(8);
        for (let i = 0; i < 5; i++) {
            clip.controlChanges.push(new ClipCC(
                Math.random() * 8,
                Math.random() * 2,
                Math.floor(Math.random() * 127),
                Math.floor(Math.random() * 127)
            ));
        }

        const clip2 = clip.duplicate();
        expect(clip2.controlChanges.length).to.equal(clip.controlChanges.length);
        for (let i = 0; i < clip2.controlChanges.length; i++) {
            const cc = clip.controlChanges[i];
            const cc2 = clip2.controlChanges[i];
            expect(cc2.start).to.equal(cc.start);
            expect(cc2.duration).to.equal(cc.duration);
            expect(cc2.controller).to.equal(cc.controller);
            expect(cc2.value).to.equal(cc.value);
            expect(cc2.channel).to.equal(cc.channel);
        }
    }

    @test 'duplicate copies clip bends'() {
        const clip = new Clip(8);
        for (let i = 0; i < 5; i++) {
            clip.bends.push(new ClipBend(
                Math.random() * 8,
                Math.random() * 2,
                (Math.random() * 2) - 1
            ));
        }

        const clip2 = clip.duplicate();
        expect(clip2.bends.length).to.equal(clip.bends.length);
        for (let i = 0; i < clip2.bends.length; i++) {
            const bend = clip.bends[i];
            const bend2 = clip2.bends[i];
            expect(bend2.start).to.equal(bend.start);
            expect(bend2.duration).to.equal(bend.duration);
            expect(bend2.percent).to.equal(bend.percent);
            expect(bend2.channel).to.equal(bend.channel);
        }
    }

    @test 'quantize validates that rhythm must be provided'() {
        const clip = new Clip(4);
        expect(() => clip.quantize(null)).to.throw();
        expect(() => clip.quantize([])).to.throw();
    }

    @test 'quantize validates that rhythm must contain only positive values'() {
        const clip = new Clip(4);
        expect(() => clip.quantize([-1])).to.throw();
        expect(() => clip.quantize([0])).to.throw();
    }

    @test 'quantize moves notes to nearest quantize target'() {
        const clip = new Clip(4);
        clip.notes.push(new ClipNote(3.3, 0.5, 60, 80));
        clip.quantize([1], 1);
        expect(clip.notes[0].start).to.equal(3);
    }

    @test 'quantize can wrap notes round to the start of the clip'() {
        const clip = new Clip(4);
        clip.notes.push(new ClipNote(3.7, 0.25, 60, 80));
        clip.quantize([1], 1);
        expect(clip.notes[0].start).to.equal(0);
    }

    @test 'quantize works with complex rhythms'() {
        const clip = new Clip(4);
        clip.notes.push(
            new ClipNote(0.1, 0.25, 60, 80),
            new ClipNote(0.4, 0.25, 62, 80),
            new ClipNote(0.7, 0.25, 64, 80)
        );
        clip.quantize([0.5, 0.25, 0.25], 1);
        expect(clip.notes[0].start).to.equal(0);
        expect(clip.notes[1].start).to.equal(0.5);
        expect(clip.notes[2].start).to.equal(0.75);
    }

    @test 'quantize can partially move notes to target'() {
        const clip = new Clip(4);
        clip.notes.push(new ClipNote(1.4, 0.5, 60, 80));
        clip.quantize([1], 0.5);
        expect(clip.notes[0].start).to.equal(1.2);
    }

    @test 'transpose moves pitches up'() {
        const clip = new Clip(4);
        clip.notes.push(
            new ClipNote(0, 1, 60, 80),
            new ClipNote(1, 1, 62, 80)
        );
        clip.transpose(12);
        expect(clip.notes[0].pitch).to.equal(72);
        expect(clip.notes[1].pitch).to.equal(74);
    }

    @test 'invert reflects pitches'() {
        const clip = new Clip(4);
        clip.notes.push(
            new ClipNote(0, 1, 60, 80),
            new ClipNote(1, 1, 62, 80)
        );
        clip.invert(66);
        expect(clip.notes[0].pitch).to.equal(72);
        expect(clip.notes[1].pitch).to.equal(70);
    }

    @test 'reverse swaps note positions'() {
        const clip = new Clip(4);
        clip.notes.push(
            new ClipNote(0, 1, 60, 80),
            new ClipNote(1, 0.5, 62, 80)
        );
        clip.reverse();
        expect(clip.notes[0].start).to.equal(3);
        expect(clip.notes[1].start).to.equal(2.5);
    }

    @test 'reverse swaps bend positions'() {
        const clip = new Clip(4);
        clip.bends.push(
            new ClipBend(0, 1, 0.5),
            new ClipBend(1.5, 0, 0.5)
        );
        clip.reverse();
        expect(clip.bends[0].start).to.equal(3);
        expect(clip.bends[1].start).to.equal(2.5);
    }

    @test 'reverse swaps CC positions'() {
        const clip = new Clip(4);
        clip.controlChanges.push(
            new ClipCC(0, 1, 15, 15),
            new ClipCC(1.5, 0, 15, 15)
        );
        clip.reverse();
        expect(clip.controlChanges[0].start).to.equal(3);
        expect(clip.controlChanges[1].start).to.equal(2.5);
    }
}