import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import { Clip, ClipCC, ClipBend, ClipNote } from '../src/Clip';
import Tween, { LinearTween } from '../src/Tweens';


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

    @test 'clipNote.duplicate copies note values'() {
        const clipNote1 = new ClipNote(1, 2, 3, 4, 5, 'test');
        const clipNote2 = clipNote1.duplicate();
        expect(clipNote2.start).to.equal(clipNote1.start);
        expect(clipNote2.duration).to.equal(clipNote1.duration);
        expect(clipNote2.pitch).to.equal(clipNote1.pitch);
        expect(clipNote2.velocity).to.equal(clipNote1.velocity);
        expect(clipNote2.ref).to.equal(clipNote1.ref);
    }

    @test 'duplicate copies clip notes'() {
        const clip = new Clip(8)
            .addNote([0,1,2,3], 1, 60, 80);

        const clip2 = clip.duplicate();
        expect(clip2.notes.length).to.equal(clip.notes.length);
    }

    @test 'clipCC.duplicate copies cc values'() {
        const cc1 = new ClipCC(1, 2, 3, 4, 5);
        const cc2 = cc1.duplicate();
        expect(cc2.start).to.equal(cc1.start);
        expect(cc2.duration).to.equal(cc1.duration);
        expect(cc2.controller).to.equal(cc1.controller);
        expect(cc2.value).to.equal(cc1.value);
        expect(cc2.channel).to.equal(cc1.channel);
    }

    @test 'duplicate copies clip control changes'() {
        const clip = new Clip(8)
            .addCC([0,1,2,3], 1, 2, 3);

        const clip2 = clip.duplicate();
        expect(clip2.controlChanges.length).to.equal(clip.controlChanges.length);
    }

    @test 'clipBend.duplicate copies bend values'() {
        const bend1 = new ClipBend(1, 2, 3, 4);
        const bend2 = bend1.duplicate();
        expect(bend2.start).to.equal(bend1.start);
        expect(bend2.duration).to.equal(bend1.duration);
        expect(bend2.percent).to.equal(bend1.percent);
        expect(bend2.channel).to.equal(bend1.channel);
    }

    @test 'duplicate copies clip bends'() {
        const clip = new Clip(8)
            .addBend([0,1,2,3], 1, 0.5);

        const clip2 = clip.duplicate();
        expect(clip2.bends.length).to.equal(clip.bends.length);
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

    @test 'ClipNote can take pitch as name'() {
        const clipNote = new ClipNote(0, 1, 'Bb5', 80);
        expect(clipNote.pitch).to.equal(82);
    }

    @test 'addNote can add new note'() {
        const clip = new Clip(4);
        clip.addNote(0, 1, 'C4', 80);
        expect(clip.notes.length).to.equal(1);
        expect(clip.notes[0].pitch).to.equal(60);
    }

    @test 'addNote returns reference to parent clip object'() {
        const clip = new Clip(4)
            .addNote(0, 1, 'C4', 80);
        expect(clip.notes.length).to.equal(1);
    }

    @test 'addNote can take array of note starts'() {
        const clip = new Clip(4)
            .addNote([0,1,2,3], 1, 'C4', 80);
        expect(clip.notes.length).to.equal(4);
    }

    @test 'addNote can take array of pitches'() {
        const clip = new Clip(4)
            .addNote([0,2], 1, ['C4','G4'], 80);
        expect(clip.notes.length).to.equal(4);
    }

    @test 'addCC can add new control change'() {
        const clip = new Clip(4);
        clip.addCC(0, 1, 20, Tween.sineIn(0, 100));
        expect(clip.controlChanges.length).to.equal(1);
    }

    @test 'addCC returns reference to parent clip object'() {
        const clip = new Clip(4)
            .addCC(0, 1, 21, Tween.cubicInOut(20, 100));
        expect(clip.controlChanges.length).to.equal(1);
    }

    @test 'addCC can take array of start beats'() {
        const clip = new Clip(4)
            .addCC([0,2], 2, 20, Tween.linear(0, 127));
        expect(clip.controlChanges.length).to.equal(2);
        expect(clip.controlChanges[0].start).to.equal(0);
        expect(clip.controlChanges[1].start).to.equal(2);
    }

    @test 'addBend can add new bend'() {
        const clip = new Clip(4);
        clip.addBend(0, 2, Tween.sineInOut(0, 1).then(Tween.sineInOut(1, 0)));
        expect(clip.bends.length).to.equal(1);
    }

    @test 'addBend returns reference to parent clip object'() {
        const clip = new Clip(4)
            .addBend(0, 1, Tween.sineIn(0, 1));
        expect(clip.bends.length).to.equal(1);
    }

    @test 'addBend can take array of start beats'() {
        const clip = new Clip(4)
            .addBend([0,2], 2, Tween.linear(0, 1).then(Tween.linear(1, 0)));
        expect(clip.bends[0].start).to.equal(0);
        expect(clip.bends[1].start).to.equal(2);
    }

    @test 'addNote supports passing in ref'() {
        const clip = new Clip(4)
            .addNote(1, 1, 'C4', 80, null, 'a reference');
        expect(clip.notes[0].ref).to.equal('a reference');
    }

    @test 'ClipNote passes ref down to note that it creates'() {
        const clipNote = new ClipNote(0, 1, 60, 80, null, 'hello');
        const note = clipNote.createNote(1, 0);
        expect(note.ref).to.equal('hello');
    }

    @test 'Clip serializes properly to json'() {
        const clip = new Clip(4);
        const json = JSON.stringify(clip);
        expect(json).to.equal('{"start":0,"duration":4,"notes":[],"controlChanges":[],"bends":[]}');
    }

    @test 'ClipNote serializes properly to json'() {
        const clipNote = new ClipNote(2, 1, 63, 80, 4, 'Test');
        const json = JSON.stringify(clipNote);
        expect(json).to.equal('{"start":2,"duration":1,"pitch":63,"velocity":80,"channel":4,"ref":"Test"}');
    }

    @test 'ClipNote serialization ignores channel and ref if theyre not set'() {
        const clipNote = new ClipNote(2, 1, 63, 80);
        const json = JSON.stringify(clipNote);
        expect(json).to.equal('{"start":2,"duration":1,"pitch":63,"velocity":80}');
    }

    @test 'ClipCC serializes properly to json'() {
        const clipCC = new ClipCC(2, 1, 30, 60, 5);
        const json = JSON.stringify(clipCC);
        expect(json).to.equal('{"start":2,"duration":1,"controller":30,"value":60,"channel":5}');
    }

    @test 'ClipCC serialization ignores channel if its not set'() {
        const clipCC = new ClipCC(2, 1, 30, 60);
        const json = JSON.stringify(clipCC);
        expect(json).to.equal('{"start":2,"duration":1,"controller":30,"value":60}');
    }

    @test 'ClipBend serializes properly to json'() {
        const clipBend = new ClipBend(2, 1, 0.5, 3);
        const json = JSON.stringify(clipBend);
        expect(json).to.equal('{"start":2,"duration":1,"percent":0.5,"channel":3}');
    }

    @test 'ClipBend serialization ignores channel if its not set'() {
        const clipBend = new ClipBend(2, 1, 0.5);
        const json = JSON.stringify(clipBend);
        expect(json).to.equal('{"start":2,"duration":1,"percent":0.5}');
    }

    @test 'Clip serialization includes clip notes'() {
        const clip = new Clip(4)
            .addNote(2, 1, 63, 80);
        const json = JSON.stringify(clip);
        expect(json).to.equal('{"start":0,"duration":4,"notes":[{"start":2,"duration":1,"pitch":63,"velocity":80}],"controlChanges":[],"bends":[]}');
    }

    @test 'Clip serialization includes control changes'() {
        const clip = new Clip(4)
            .addCC(2, 1, 30, 60);
        const json = JSON.stringify(clip);
        expect(json).to.equal('{"start":0,"duration":4,"notes":[],"controlChanges":[{"start":2,"duration":1,"controller":30,"value":60}],"bends":[]}');
    }

    @test 'Clip serialization includes bends'() {
        const clip = new Clip(4)
            .addBend(2, 1, 0.5);
        const json = JSON.stringify(clip);
        expect(json).to.equal('{"start":0,"duration":4,"notes":[],"controlChanges":[],"bends":[{"start":2,"duration":1,"percent":0.5}]}');
    }

    @test 'ClipBend serializes properly to JSON with tween'() {
        const clipBend = new ClipBend(1, 2, Tween.linear(0, 1));
        const json = JSON.stringify(clipBend);
        expect(json).to.equal('{"start":1,"duration":2,"percent":{"type":"Linear","from":0,"to":1}}');
    }

    @test 'Clip.load loads clip data'() {
        const clip = Clip.load({"start":0,"duration":4,"notes":[{"start":2,"duration":1,"pitch":63,"velocity":80}],"controlChanges":[{"start":2,"duration":1,"controller":30,"value":60}],"bends":[{"start":2,"duration":1,"percent":0.5}]});
        expect(clip.start).to.equal(0);
        expect(clip.duration).to.equal(4);
        expect(clip.notes.length).to.equal(1);
        expect(clip.controlChanges.length).to.equal(1);
        expect(clip.bends.length).to.equal(1);
    }

    @test 'ClipNote.load loads clip note data'() {
        const clipNote = ClipNote.load({"start":2,"duration":1,"pitch":63,"velocity":80});
        expect(clipNote.start).to.equal(2);
        expect(clipNote.duration).to.equal(1);
        expect(clipNote.pitch).to.equal(63);
        expect(clipNote.velocity).to.equal(80);
        expect(clipNote.channel).to.be.null;
        expect(clipNote.ref).to.be.null;
    }

    @test 'ClipCC.load loads clip CC data'() {
        const clipCC = ClipCC.load({"start":2,"duration":1,"controller":30,"value":60});
        expect(clipCC.start).to.equal(2);
        expect(clipCC.duration).to.equal(1);
        expect(clipCC.controller).to.equal(30);
        expect(clipCC.value).to.equal(60);
        expect(clipCC.channel).to.be.null;
    }

    @test 'ClipBend.load loads clip bend data'() {
        const clipBend = ClipBend.load({"start":2,"duration":1,"percent":0.5});
        expect(clipBend.start).to.equal(2);
        expect(clipBend.duration).to.equal(1);
        expect(clipBend.percent).to.equal(0.5);
        expect(clipBend.channel).to.be.null;
    }

    @test 'ClipNote.load can handle velocity tweens'() {
        const clipNote = ClipNote.load({"start":2,"duration":1,"pitch":63,"velocity":{"type":"Linear","from":10,"to":20}});
        expect(clipNote.velocity).to.be.instanceOf(LinearTween);
        const tween = clipNote.velocity as LinearTween;
        expect(tween.from).to.equal(10);
        expect(tween.to).to.equal(20);
    }

    @test 'ClipCC.load can handle value tweens'() {
        const clipCC = ClipCC.load({"start":2,"duration":1,"controller":30,"value":{"type":"Linear","from":10,"to":20}});
        expect(clipCC.value).to.be.instanceOf(LinearTween);
        const tween = clipCC.value as LinearTween;
        expect(tween.from).to.equal(10);
        expect(tween.to).to.equal(20);
    }

    @test 'clipBend.load can handle percent tweens'() {
        const clipBend = ClipBend.load({"start":2,"duration":1,"percent":{"type":"Linear","from":10,"to":20}});
        expect(clipBend.percent).to.be.instanceOf(LinearTween);
        const tween = clipBend.percent as LinearTween;
        expect(tween.from).to.equal(10);
        expect(tween.to).to.equal(20);
    }
}