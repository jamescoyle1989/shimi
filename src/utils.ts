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