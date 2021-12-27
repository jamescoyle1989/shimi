'use strict';

import { sortComparison } from './utils';


export function sum(array: any[], accessor: (item: any) => number) {
    let output = 0;
    for (const item of array)
        output += accessor(item);
    return output;
}

export function distinct(array: any[]): any[] {
    const output = [];
    for (let i = 0; i < array.length; i++) {
        if (array.indexOf(array[i]) == i)
            output.push(array[i]);
    }
    return output;
}

export function mode(array: any[], accessor: (item: any) => number) {
    if (!array || array.length == 0)
        return null;
    let tally: {item: any, count: number}[] = [];
    for (const i of array) {
        const val = accessor(i);
        const tallyElement = tally.find(x => x.item === val);
        if (tallyElement)
            tallyElement.count++;
        else
            tally.push({item: i, count: 1});
        tally.sort((a, b) => sortComparison(a, b, x => x.count));
        return tally.pop().item;
    }
}