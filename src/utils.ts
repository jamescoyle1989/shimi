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
    let output = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 }[name[0]];
    if (output == undefined)
        throw new Error(name + ' is not a valid pitch name');

    let octave = -1;
    for (let i = 1; i < name.length; i++) {
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
        else {
            octave = Number(name.substring(i));
            if (Number.isNaN(octave))
                throw new Error(name + ' is not a valid pitch name');
            break;
        }
    }

    return safeMod(output, 12) + ((octave + 1) * 12);
}


export function toHertz(pitch: number | string): number {
    if (typeof(pitch) === 'string')
        pitch = parsePitch(pitch);
    return Math.pow(2, ((pitch - 69) / 12)) * 440;
}