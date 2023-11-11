'use strict';

import { FitPitchOptions, IPitchContainer } from './IPitchContainer';
import { parsePitch, safeMod, sortComparison } from './utils';


/**
 * This class is designed to allow optimized pitch fitting.
 * Using the regular pitch fitting methods on scale and chord objects often results in different input pitches being mapped to the same output pitch.
 * This takes a collection of pitches which are to be optimized for, as well as a pitch container to check against.
 * It uses a modified version of the stable marriage algorithm to decide where pitches need to be mapped to.
 */
export default class PitchFitter {
    private _map: Map<number, number>;
    
    /**
     * @param pitches The collection of pitches which we want to optimize mapping for
     * @param pitchContainer The scale/chord that we want the pitches to be fitted to
     * @param fitOptions Options to configure how the fitting works
     */
    constructor(
        pitches: Array<number>,
        pitchContainer: IPitchContainer,
        fitOptions: Partial<FitPitchOptions>
    ) {
        this.optimize(pitches, pitchContainer, fitOptions);
    }

    /**
     * Calling this will invalidate the current fitting and recalculate.
     * @param pitches The collection of pitches which we want to optimize mapping for
     * @param pitchContainer The scale/chord that we want the pitches to be fitted to
     * @param fitOptions Options to configure how the fitting works
     */
    optimize(
        pitches: Array<number>,
        pitchContainer: IPitchContainer,
        fitOptions: Partial<FitPitchOptions>
    ): void {
        const containerPitches = [];
        for (let i = 12; i < 24; i++) {
            if (pitchContainer.contains(i))
                containerPitches.push(i);
        }

        pitches = pitches
            .map(x => safeMod(x, 12) + 12)
            .filter((value, index, array) => array.indexOf(value) === index);
        
        //Modified stable marriage algorithm
        //This will handle an imbalance of men and women
        //Where men are pitch classes that we want to optimize mappings for
        //And women are pitch classes within our pitch container that we're mapping to
        //Each round, a man proposes to his favourite woman that he hasn't already proposed to
        //The woman then chooses her favourite man from her available options
        //If 2 equally suitable men have both proposed to a woman, the most recent one to propose will be taken
        const proposals = new Array<{man: number, woman: number, status: number, distance: number}>();

        function getManWomanDistance(man: number, woman: number): number {
            let distance = Math.abs(man - woman);
            if (distance > 6)
                distance = 12 - distance;
            return distance;
        }

        function resolveProposals(): void {
            for (const woman of containerPitches) {
                let engagement = proposals.find(x => x.woman == woman && x.status == 1);
                const newProposals = proposals.filter(x => x.woman == woman && x.status == 0);
                if (!!engagement && newProposals.find(x => x.distance <= engagement.distance)) {
                    engagement.status = -1;
                    engagement = null;
                }
                if (!engagement && newProposals.length > 0) {
                    engagement = newProposals.sort((a, b) => sortComparison(a, b, x => x.distance))[0];
                    engagement.status = 1;
                    for (const proposal of newProposals.filter(x => x.status == 0))
                        proposal.status = -1;
                }
            }
        }

        //In round 1 each man attempts to go with his favourite woman
        for (const man of pitches) {
            const woman = pitchContainer.fitPitch(man, fitOptions);
            proposals.push({man, woman, status: 0, distance: getManWomanDistance(man, woman)});
        }
        resolveProposals();

        //In each subsequent round, each man just tries to find a nearby woman
        while (proposals.filter(x => x.status == 1).length < Math.min(pitches.length, containerPitches.length)) {
            for (const man of pitches) {
                if (proposals.find(x => x.man == man && x.status == 1))
                    continue;
                const failedProposals = proposals.filter(x => x.man == man && x.status == -1);
                const newLove = containerPitches
                    .filter(woman => !failedProposals.find(x => x.woman == woman))
                    .map(woman => ({ woman, distance: getManWomanDistance(man, woman) }))
                    .sort((a, b) => sortComparison(a, b, x => x.distance))[0];
                proposals.push({man, woman: newLove.woman, status: 0, distance: newLove.distance});
            }
            resolveProposals();
        }

        this._map = new Map<number, number>();
        for (const engagement of proposals.filter(x => x.status == 1))
            this._map.set(engagement.man, engagement.woman);

        //For any men not yet engaged, map them to their preferred woman
        for (const man of pitches) {
            if (!proposals.find(x => x.man == man && x.status == 1))
                this._map.set(man, pitchContainer.fitPitch(man, fitOptions));
        }

        //For all other pitches, use the pitch container fitting
        for (let i = 12; i < 24; i++) {
            if (!pitches.find(x => x == i))
                this._map.set(i, pitchContainer.fitPitch(i, fitOptions));
        }
    }

    /**
     * Returns a pitch near to the passed in pitch, but which should fit better with the notes within the container that was optimized against.
     * @param pitch The pitch which we want to fit to the scale. Can also take pitch names, see the [pitch](../functions/pitch.html) method for more information.
     * @returns Returns a new pitch number.
     */
    fitPitch(pitch: number | string): number {
        if (typeof pitch === 'string')
            pitch = parsePitch(pitch);
        const lookupPitch = safeMod(pitch, 12) + 12;
        return this._map.get(lookupPitch) + pitch - lookupPitch;
    }
}