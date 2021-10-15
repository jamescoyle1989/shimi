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
}