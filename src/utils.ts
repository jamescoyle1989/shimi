export function safeMod(value: number, divisor: number): number {
    return ((value % divisor) + divisor) % divisor;
}

export function sortComparison<T>(a: T, b: T, accessor: (T) => number): number {
    const aVal = accessor(a);
    const bVal = accessor(b);
    if (aVal < bVal) return -1;
    if (aVal > bVal) return 1;
    return 0;
}