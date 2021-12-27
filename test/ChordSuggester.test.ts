import { suite, test } from '@testdeck/mocha';
import { expect } from 'chai';
import ChordSuggester, { ChordLookupData } from '../src/ChordSuggester';
import ScaleTemplate from '../src/ScaleTemplate';


@suite class ChordSuggesterTests {
    @test 'constructor populates lookup chords'() {
        const suggester = new ChordSuggester();
        expect(suggester.lookupData.length).to.be.greaterThan(0);
        expect(suggester.lookupData.length % 12).to.equal(0);
    }

    @test 'ChordLookupData populates pitchMap correctly'() {
        const lookupData = new ChordLookupData('7', [0,4,7,10], '{r}7', '{r}7/{b}', 8, 2);
        expect(lookupData.pitchMap).to.equal(Math.pow(2,2) + Math.pow(2,6) + Math.pow(2,9) + Math.pow(2,0));
    }

    @test 'getPitchMap returns expected result'() {
        const suggester = new ChordSuggester();
        const cMajor = suggester['_getPitchMap']([36, 40, 43]);
        expect(cMajor).to.equal(Math.pow(2,0) + Math.pow(2,4) + Math.pow(2,7));
    }

    @test 'getPitchMap ignores duplicate pitch classes'() {
        const suggester = new ChordSuggester();
        const map1 = suggester['_getPitchMap']([36, 40]);
        const map2 = suggester['_getPitchMap']([36, 40, 48]);
        expect(map1).to.equal(map2);
    }

    @test 'getPitchMapDistance returns zero distance for same pitch classes'() {
        const suggester = new ChordSuggester();
        const map1 = suggester['_getPitchMap']([0,2,4,7,9]);
        const map2 = suggester['_getPitchMap']([12,14,16,19,21]);
        const distance = suggester['_getPitchMapDistance'](map1, map2);
        expect(distance).to.equal(0);
    }

    @test 'getPitchMapDistance returns same distance regardless of parameter order'() {
        const suggester = new ChordSuggester();
        const map1 = suggester['_getPitchMap']([1,2,3,4].map(x => Math.floor(Math.random() * 24)));
        const map2 = suggester['_getPitchMap']([1,2,3,4].map(x => Math.floor(Math.random() * 24)));
        expect(suggester['_getPitchMapDistance'](map1, map2)).to.equal(suggester['_getPitchMapDistance'](map2, map1));
    }

    @test 'getPitchMapDistance returns 12 if all pitches different'() {
        const suggester = new ChordSuggester();
        const map1 = suggester['_getPitchMap']([0,2,4,6,8,10]);
        const map2 = suggester['_getPitchMap']([1,3,5,7,9,11]);
        expect(suggester['_getPitchMapDistance'](map1, map2)).to.equal(12);
    }

    @test 'lookupChord returns null if no pitches present'() {
        const suggester = new ChordSuggester();
        expect(suggester.lookupChord([])).to.be.null;
    }

    @test 'lookupChord throws error if root not in pitches'() {
        const suggester = new ChordSuggester();
        expect(() => suggester.lookupChord([12, 16, 19], 11)).to.throw();
    }

    @test 'lookupChord returns C major'() {
        const suggester = new ChordSuggester();
        const result = suggester.lookupChord([12, 16, 19]);
        expect(result.shapeName).to.equal('M');
        expect(result.root).to.equal(12);
        expect(result.bass).to.equal(12);
        expect(result.name).to.equal('{r}');
    }

    @test 'lookupChord returns inverse C major'() {
        const suggester = new ChordSuggester();
        const result = suggester.lookupChord([7, 12, 16]);
        expect(result.shapeName).to.equal('M');
        expect(result.root).to.equal(12);
        expect(result.bass).to.equal(7);
        expect(result.name).to.equal('{r}/{b}');
    }

    @test 'lookupChord returns D7 with missing 5th'() {
        const suggester = new ChordSuggester();
        const result = suggester.lookupChord([14, 18, 24]);
        expect(result.shapeName).to.equal('7');
        expect(result.root).to.equal(14);
        expect(result.bass).to.equal(14);
        expect(result.name).to.equal('{r}7');
    }

    @test 'lookupChord can be restricted by shape names'() {
        const suggester = new ChordSuggester();
        const result = suggester.lookupChord([23, 27, 30], null, ['5']);
        expect(result.shapeName).to.equal('5');
        expect(result.root).to.equal(23);
        expect(result.bass).to.equal(23);
        expect(result.name).to.equal('{r}5');
    }

    @test 'lookupChord can be restricted by root'() {
        const suggester = new ChordSuggester();
        const result = suggester.lookupChord([37, 39, 44], 44);
        expect(result.shapeName).to.equal('sus4');
        expect(result.root).to.equal(44);
        expect(result.bass).to.equal(37);
        expect(result.name).to.equal('{r}sus4/{b}');
    }

    @test 'lookupChord can be restricted by scale'() {
        const suggester = new ChordSuggester();
        const result = suggester.lookupChord([2, 9], null, ['M', 'm'], ScaleTemplate.major.create(0));
        expect(result.shapeName).to.equal('m');
        expect(result.root).to.equal(2);
        expect(result.bass).to.equal(2);
        expect(result.name).to.equal('{r}m');
    }
}