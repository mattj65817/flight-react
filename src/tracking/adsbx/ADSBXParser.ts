import {freeze, immerable} from "immer";
import _ from "lodash";
import {
    isADSBXAltitude,
    isADSBXCoords,
    isADSBXPositionResponse,
    isADSBXTrack
} from "./ADSBX-types";

import type {ADSBXPositionResponse} from "./ADSBX-types";
import type {ModeSCode, Positions} from "../tracking-types";

/**
 * {@link ADSBXParser} parses responses from ADSBX v2 API requests.
 */
export class ADSBXParser {
    [immerable] = true;

    private constructor() {
    }

    /**
     * Parse a response from an aircraft position query.
     *
     * @param source the response.
     */
    parsePositions(source: ADSBXPositionResponse) {
        if (!isADSBXPositionResponse(source)) {
            throw Error("Unexpected response.");
        }
        return freeze(_.transform(source.ac, (acc, ac) => {
            const coords = [ac, "lastPosition" in ac && ac.lastPosition]
                .filter(isADSBXCoords)
                .shift();
            if (coords && isADSBXAltitude(ac)) {
                const {hex} = ac;
                if ("ground" === ac.alt_baro) {
                    acc[hex] = {
                        altitude: "ground",
                        coordinates: [coords.lat, coords.lon]
                    } as Positions[ModeSCode];
                } else {
                    acc[hex] = Object.assign({
                        altitude: ac.alt_baro,
                        coordinates: [coords.lat, coords.lon]
                    }, isADSBXTrack(ac) && {
                        track: ac.track,
                        velocity: {
                            horizontal: ac.gs,
                            ...(!ac.baro_rate ? {} : {
                                vertical: ac.baro_rate
                            })
                        }
                    }) as Positions[ModeSCode]
                }
            }
        }, {} as Positions));
    }

    /**
     * Create an {@link ADSBXParser} instance.
     */
    static create() {
        return freeze(new ADSBXParser(), true);
    }

    /**
     * Default instance.
     */
    static readonly INSTANCE = ADSBXParser.create();
}
