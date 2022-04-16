import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import { parsePitch } from '../src/utils';


@suite class UtilsTests {
    @test 'parsePitch reads valid note name without sharps or flats'() {
        expect(parsePitch('C')).to.equal(0);
        expect(parsePitch('D')).to.equal(2);
        expect(parsePitch('F')).to.equal(5);
        expect(parsePitch('A')).to.equal(9);
    }

    @test 'parsePitch throws error if an invalid note name is passed in'() {
        expect(() => parsePitch('H')).to.throw();
        expect(() => parsePitch('c')).to.throw();
    }

    @test 'parsePitch handles sharp and flat symbols'() {
        expect(parsePitch('D#')).to.equal(3);
        expect(parsePitch('D♯')).to.equal(3);
        expect(parsePitch('Gb')).to.equal(6);
        expect(parsePitch('G♭')).to.equal(6);
    }

    @test 'parsePitch handles double sharp and flat symbols'() {
        expect(parsePitch('Dx')).to.equal(4);
        expect(parsePitch('D𝄪')).to.equal(4);
        expect(parsePitch('G𝄫')).to.equal(5);
    }

    @test 'parsePitch handles multiple sharp and flat symbols'() {
        expect(parsePitch('D##')).to.equal(4);
        expect(parsePitch('D𝄪𝄪')).to.equal(6);
        expect(parsePitch('D𝄪♯')).to.equal(5);
        expect(parsePitch('D♯𝄪')).to.equal(5);
        expect(parsePitch('D♯♭')).to.equal(2);
    }

    @test 'parsePitch doesnt make Cb negative'() {
        expect(parsePitch('Cb')).to.equal(11);
    }

    @test 'parsePitch handles octave marker'() {
        expect(parsePitch('C0')).to.equal(12);
        expect(parsePitch('D1')).to.equal(26);
        expect(parsePitch('E2')).to.equal(40);
    }

    @test 'parsePitch throws error if octave marker is not number'() {
        expect(() => parsePitch('C0a')).to.throw('C0a is not a valid pitch name');
    }

    @test 'parsePitch handles natural symbol'() {
        expect(parsePitch('E♮1')).to.equal(28);
    }
}