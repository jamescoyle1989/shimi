export function safeMod(value: number, divisor: number): number {
    return ((value % divisor) + divisor) % divisor;
}