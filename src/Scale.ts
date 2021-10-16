'use strict';

import ScaleTemplate from './ScaleTemplate';


export default class Scale {
    /** The name of the scale */
    get name(): string { return this._name; }
    /** The name of the scale */
    set name(value: string) { this._name = value; }
    private _name: string;

    /** The notes which make up the scale, ordered ascending from the scale's root */
    get pitches(): number[] { return this._pitches; }
    private _pitches: number[];

    /** The template which the scale is built from */
    get template(): ScaleTemplate { return this._template; }
    private _template: ScaleTemplate;

    /** How many notes are in the scale */
    get length(): number { return this.pitches.length; }

    constructor(template: ScaleTemplate, root: number) {
        const pitches = [((root % 12) + 12) % 12];
        for (const degree of template.shape)
            pitches.push((pitches[0] + degree) % 12);
        this._pitches = pitches;

        //TO-DO: At the moment this will give a name like '2 Major' rather than 'D Major'
        this.name = pitches[0] + ' ' + template.name;

        this._template = template;
    }

    /** Returns true if the passed in note belongs to the scale */
    contains(pitch: number): boolean {
        pitch = ((pitch % 12) + 12) % 12;
        return this.pitches.find(p => p == pitch) != undefined;
    }

    /** Returns the index of the passed in note, or -1 if it's not contained */
    indexOf(pitch: number): number {
        pitch = ((pitch % 12) + 12) % 12;
        for (let i = 0; i < this.pitches.length; i++) {
            if (this.pitches[i] == pitch)
                return i;
        }
        return -1;
    }
}