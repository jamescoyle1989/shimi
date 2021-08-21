'use strict';


export function sum(array: any[], accessor: (item: any) => number) {
    let output = 0;
    for (const item of array)
        output += accessor(item);
    return output;
}