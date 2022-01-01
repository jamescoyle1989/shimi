'use strict';

import { sortComparison } from './utils';


/**
 * Returns the sum of values in the passed in array
 * @param array The array to sum up
 * @param accessor What value to access from each item in the array
 */
export function sum<T>(array: T[], accessor?: (item: T) => number): number {
    if (!accessor)
        accessor = x => Number(x);
    
    let output = 0;
    for (const item of array)
        output += accessor(item);
    return output;
}

/**
 * Returns an array of only the distinct items in the passed in array
 * @param array The array to search through
 */
export function distinct<T>(array: T[]): T[] {
    const output = [];
    for (let i = 0; i < array.length; i++) {
        if (array.indexOf(array[i]) == i)
            output.push(array[i]);
    }
    return output;
}

/**
 * Returns the most common value in an array
 * @param array The array to search through
 * @param accessor What value to access on each item in the array
 * @returns Returns the most common accessed value, not the objects where it was found
 */
export function mode<TItem, TValue>(array: TItem[], accessor: (item: TItem) => TValue): TValue {
    if (!array || array.length == 0)
        return null;

    let tally: {value: TValue, count: number}[] = [];
    for (const i of array) {
        const val = accessor(i);
        const tallyElement = tally.find(x => x.value === val);
        if (tallyElement)
            tallyElement.count++;
        else
            tally.push({value: val, count: 1});
        tally.sort((a, b) => sortComparison(a, b, x => x.count));
        return tally.pop().value;
    }
}