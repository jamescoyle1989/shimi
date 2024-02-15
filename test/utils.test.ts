import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import { parsePitch, parsePitchFromStringStart, parseRomanNumeralsFromStringStart, toHertz } from '../src/utils';
import { ScaleTemplate } from '../src';


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

    @test 'parsePitchFromStringStart ignores any text after valid pitch symbols'() {
        const result = parsePitchFromStringStart('D#b==/hello');
        expect(result.pitch).to.equal(2);
        expect(result.parseEndIndex).to.equal(3);
    }

    @test 'toHertz converts middle C into correct hertz value'() {
        expect(toHertz(60)).to.be.approximately(261.63, 0.01);
    }

    @test 'toHertz converts A4 to correct hertz value'() {
        expect(toHertz('A4')).to.equal(440);
    }

    @test 'parseRomanNumeralsFromStringStart throws error if scale not provided'() {
        expect(() => parseRomanNumeralsFromStringStart('I', null)).to.throw();
    }

    @test 'parseRomanNumeralsFromStringStart correctly identifies I for major scale'() {
        const result = parseRomanNumeralsFromStringStart('I', ScaleTemplate.major.create('D'));
        expect(result.pitch).to.equal(2);
        expect(result.isMajor).to.be.true;
        expect(result.parseEndIndex).to.equal(1);
    }

    @test 'parseRomanNumeralsFromStringStart correctly identifies i for major scale'() {
        const result = parseRomanNumeralsFromStringStart('i', ScaleTemplate.major.create('D'));
        expect(result.pitch).to.equal(2);
        expect(result.isMajor).to.be.false;
        expect(result.parseEndIndex).to.equal(1);
    }

    @test 'parseRomanNumeralsFromStringStart correctly identifies iv for minor scale'() {
        const result = parseRomanNumeralsFromStringStart('iv', ScaleTemplate.naturalMinor.create('D'));
        expect(result.pitch).to.equal(7);
        expect(result.isMajor).to.be.false;
        expect(result.parseEndIndex).to.equal(2);
    }

    @test 'parseRomanNumeralsFromStringStart correctly identifies IV for minor scale'() {
        const result = parseRomanNumeralsFromStringStart('IV', ScaleTemplate.naturalMinor.create('D'));
        expect(result.pitch).to.equal(7);
        expect(result.isMajor).to.be.true;
        expect(result.parseEndIndex).to.equal(2);
    }

    @test 'parseRomanNumeralsFromStringStart correctly identifies III for major scale'() {
        const result = parseRomanNumeralsFromStringStart('III', ScaleTemplate.major.create('D'));
        expect(result.pitch).to.equal(6);
        expect(result.isMajor).to.be.true;
        expect(result.parseEndIndex).to.equal(3);
    }

    @test 'parseRomanNumeralsFromStringStart correctly identifies III for minor scale'() {
        const result = parseRomanNumeralsFromStringStart('III', ScaleTemplate.naturalMinor.create('D'));
        expect(result.pitch).to.equal(5);
        expect(result.isMajor).to.be.true;
        expect(result.parseEndIndex).to.equal(3);
    }

    @test 'parseRomanNumeralsFromStringStart correctly identifies bIII for major scale'() {
        const result = parseRomanNumeralsFromStringStart('bIII', ScaleTemplate.major.create('D'));
        expect(result.pitch).to.equal(5);
        expect(result.isMajor).to.be.true;
        expect(result.parseEndIndex).to.equal(4);
    }

    @test 'parseRomanNumeralsFromStringStart correctly identifies bIII for minor scale'() {
        const result = parseRomanNumeralsFromStringStart('bIII', ScaleTemplate.naturalMinor.create('D'));
        expect(result.pitch).to.equal(5);
        expect(result.isMajor).to.be.true;
        expect(result.parseEndIndex).to.equal(4);
    }

    @test 'parseRomanNumeralsFromStringStart only allows 1 accidental'() {
        expect(() => parseRomanNumeralsFromStringStart('bbI', ScaleTemplate.major.create(1))).to.throw();
    }

    @test 'parseRomanNumeralsFromStringStart throws error if mixed casing in numerals'() {
        expect(() => parseRomanNumeralsFromStringStart('Ii', ScaleTemplate.major.create(0))).to.throw();
    }
}