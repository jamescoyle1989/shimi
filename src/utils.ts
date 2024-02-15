import Scale from './Scale';

export function safeMod(value: number, divisor: number): number {
    return ((value % divisor) + divisor) % divisor;
}


export function sortComparison<T>(a: T, b: T, accessor: (x: T) => number): number {
    const aVal = accessor(a);
    const bVal = accessor(b);
    if (aVal < bVal) return -1;
    if (aVal > bVal) return 1;
    return 0;
}


/**
 * This function accepts a string representation of a pitch, and returns the MIDI number representation of it.
 * 
 * An important point to note is that the way shimi uses the term "pitch" isn't technically correct, but does serve to make things less ambiguous in areas where otherwise things could get confusing. In musical terminology, "pitch" is usually measured in hertz as the frequency at which some instrument is producing sound waves, meanwhile a "note" is a musical sound which has some frequency and duration. In MIDI terminology, "pitch" isn't really used, and "note" is a value from 0 - 127 which maps to a frequency (usually within the Western tuning system) that the receiving oscillator should resonate at.
 * 
 * In order to avoid confusion, and since shimi is very much within the MIDI space and so barely touches upon frequencies, "note" keeps its definition from the musical world (see the [Note](https://jamescoyle1989.github.io/shimi/classes/Note.html) class). Meanwhile "pitch" refers to the MIDI note number ranging from 0 - 127 that the MIDI specification allows (https://www.inspiredacoustics.com/en/MIDI_note_numbers_and_center_frequencies).
 * 
 * @param name The name parameter accepts 'A', 'B', ..., 'G' to return a value within the lowest octave that MIDI supports (range 0 - 11). 
 * 
 * Accidental symbols ♯, #, ♭, b, ♮, 𝄪 (double sharp), x (also double sharp), 𝄫 (double flat) are also supported, and can be stacked on top of each other, for example: 'C♯', 'Dx#', 'F♭♯'.
 * 
 * A number can also be added to the end of the string to determine which octave the returned value should be in, for example: 'C5', 'D#7', 'Ab8'
 * @returns 
 */
export function parsePitch(name: string): number {
    const internalResult = parsePitchFromStringStart(name);
    let octave = -1;
    if (internalResult.parseEndIndex < name.length)
        octave = Number(name.substring(internalResult.parseEndIndex));
    if (Number.isNaN(octave))
        throw new Error(name + ' is not a valid pitch name');
    return internalResult.pitch + ((octave + 1) * 12);
}

/**
 * Internal method called by parsePitch, this will interpret the start of the passed in string as a pitch name up until the first non-valid character is encountered.
 * @returns Returns an object containing the parsed MIDI pitch number, plus the index of the input at which it stopped parsing the pitch name.
 */
export function parsePitchFromStringStart(name: string): { pitch: number, parseEndIndex: number } {
    let output = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 }[name[0]];
    if (output == undefined)
        throw new Error(name + ' is not a valid pitch name');

    let i = 1;
    for (; i < name.length; i++) {
        const char = name[i];
        if (char == '♮')
            continue;
        if (char == 'b' || char == '♭')
            output--;
        else if (char == '#' || char == '♯')
            output++;
        else if (char == 'x')
            output += 2;
        else if (char == '𝄪'[0] && name.length > i + 1 && name[i + 1] == '𝄪'[1]) {
            output += 2;
            i++;
        }
        else if (char == '𝄫'[0] && name.length > i + 1 && name[i + 1] == '𝄫'[1]) {
            output -= 2;
            i++;
        }
        else
            break;
    }

    return { pitch: safeMod(output, 12), parseEndIndex: i };
}


export function parseRomanNumeralsFromStringStart(numerals: string, scale: Scale): { pitch: number, isMajor: boolean, parseEndIndex: number } {
    if (!scale)
        throw Error('scale must be provided');
    if (scale.length != 7)
        throw Error('scale provided must have length 7');
    let parseEndIndex = 0;

    //Read accidentals
    let accidentalsSum = 0;
    for (; parseEndIndex < numerals.length; parseEndIndex++) {
        const char = numerals[parseEndIndex];
        if (char == 'b' || char == '♭')
            accidentalsSum -= 1;
        else if (char == '#' || char == '♯')
            accidentalsSum += 1;
        else
            break;
    }
    if (parseEndIndex > 1)
        throw Error('Expected at most one accidental symbol');

    //Read numerals
    let numeralsStart = parseEndIndex;
    const numeralChars = ['i', 'I', 'v', 'V'];
    for (; parseEndIndex < numerals.length; parseEndIndex++) {
        const char = numerals[parseEndIndex];
        if (!numeralChars.includes(char))
            break;
    }
    let pureNumerals = numerals.substring(numeralsStart, parseEndIndex);
    let isMajor = true;
    if (pureNumerals == pureNumerals.toLowerCase())
        isMajor = false;
    else if (pureNumerals != pureNumerals.toUpperCase())
        throw Error('Invalid mixed casing of roman numerals');
    pureNumerals = pureNumerals.toUpperCase();

    let degree = 0;
    switch (pureNumerals) {
        case 'I': degree = 1; break;
        case 'II': degree = 2; break;
        case 'III': degree = 3; break;
        case 'IV': degree = 4; break;
        case 'V': degree = 5; break;
        case 'VI': degree = 6; break;
        case 'VII': degree = 7; break;
        default: throw Error('Unrecognised roman numerals');
    }

    //Use the scale to determine the actual pitch info
    let pitch = scale.getPitchByDegree(degree) + accidentalsSum;
    switch (degree) {
        case 1: pitch = Math.max(scale.root, Math.min(pitch, scale.root + 1)); break;
        case 2: pitch = Math.max(scale.root + 1, Math.min(pitch, scale.root + 2)); break;
        case 3: pitch = Math.max(scale.root + 3, Math.min(pitch, scale.root + 4)); break;
        case 4: pitch = Math.max(scale.root + 5, Math.min(pitch, scale.root + 6)); break;
        case 5: pitch = Math.max(scale.root + 6, Math.min(pitch, scale.root + 8)); break;
        case 6: pitch = Math.max(scale.root + 8, Math.min(pitch, scale.root + 9)); break;
        case 7: pitch = Math.max(scale.root + 10, Math.min(pitch, scale.root + 11)); break;
    }
    
    return { pitch, isMajor, parseEndIndex };
}


export function parsePitchOrRomanNumeralsFromStringStart(input: string, scale: Scale): { pitch: number, isMajor: boolean, parseEndIndex: number } {
    try {
        const output = parsePitchFromStringStart(input);
        return { pitch: output.pitch, isMajor: null, parseEndIndex: output.parseEndIndex };
    }
    catch (ex) {
        return parseRomanNumeralsFromStringStart(input, scale);
    }
}


/**
 * Converts a MIDI pitch or note name into a hertz value.
 * @param pitch The MIDI pitch, or note name to be converted
 * @returns 
 */
export function toHertz(pitch: number | string): number {
    if (typeof(pitch) === 'string')
        pitch = parsePitch(pitch);
    return Math.pow(2, ((pitch - 69) / 12)) * 440;
}