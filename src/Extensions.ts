import { safeMod } from "./utils";

export {};

declare global {
    interface Number {
        near(target: number): number;
    }
}


Number.prototype.near = function(target: number): number {
    let pitchDiff = target - this;
    if (safeMod(pitchDiff, 12) == 6) {
        if (pitchDiff > 0)
            pitchDiff--;
        else
            pitchDiff++;
    }
    const octaveDiff = Math.round(pitchDiff / 12);
    return this + (octaveDiff * 12);
}