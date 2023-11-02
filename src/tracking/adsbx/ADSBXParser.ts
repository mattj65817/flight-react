import {freeze, immerable} from "immer";
import {ModeSCode} from "../tracking-types";
import {
    ADSBXPositionResponse,
    isADSBXAltitude,
    isADSBXCoords,
    isADSBXPositionResponse,
    isADSBXTrack
} from "./ADSBX-types";
import {DateTime} from "luxon";

export class ADSBXParser {
    [immerable] = true;

    private constructor() {
    }

    parsePositions(source: ADSBXPositionResponse): AircraftPosition[] {
        if (!isADSBXPositionResponse(source)) {
            throw Error("Unexpected response.");
        }
        const timestamp = DateTime.fromMillis(source.now, {zone: "UTC"});
        return source.ac.filter(ac => isADSBXAltitude(ac))
            .map(ac => {
                if (!isADSBXAltitude(ac)) {
                    throw Error(); /* won't happen, already checked, just anchoring types. */
                }
                const {hex} = ac;
                if ("ground" === ac.alt_baro) {
                    return Object.assign({
                        id: hex,
                        altitude: "ground"
                    }, isADSBXCoords(ac) && {
                        coordinates: [ac.lat, ac.lon]
                    }) as GroundPosition;
                }
                return Object.assign({
                    id: hex,
                    altitude: ac.alt_baro
                }, isADSBXCoords(ac) && {
                    coordinates: [ac.lat, ac.lon]
                }, isADSBXTrack(ac) && {
                    track: ac.track,
                    velocity: {
                        horizontal: ac.gs,
                        ...(!ac.baro_rate ? {} : {
                            vertical: ac.baro_rate
                        })
                    }
                }) as FlightPosition;
            });
    }

    /**
     * Create an {@link ADSBXParser} instance.
     */
    static create() {
        return freeze(new ADSBXParser(), true);
    }
}

interface FlightPosition {
    id: ModeSCode;
    altitude: number;
    coordinates: [
        latitude: number,
        longitude: number
    ];
    track?: number;
    velocity: {
        horizontal: number;
        vertical?: number;
    }
}

interface GroundPosition {
    id: ModeSCode;
    altitude: "ground";
    coordinates?: [
        latitude: number,
        longitude: number
    ];
}

export type AircraftPosition =
    | FlightPosition
    | GroundPosition;

// export interface PositionResponse {
//     ac: Position & {
//         hex: ModeSCode;
//         type: "adsr_icao"; /* todo */
//         flight: Uppercase<string>; /* callsign (usually  registration number with trailing spaces) */
//         r: Uppercase<string>; /* registration number. */
//         t: Uppercase<string>; /* Type, such as "P28A". */
//         desc: string; /* Type description, such as "PIPER PA-28-140/150/160/180" or "CESSNA 172 Skyhawk". */
//         alt_baro: "ground" | number; /* Baro altitude in feet. */
//         alt_geom: number;
//         gs: number; /* Groundspeed in knots. */
//         track: number;
//         baro_rate: number; /* Baro vertical speed. */
//         squawk: Uppercase<string>;
//         emergency: "none" | string; /* todo */
//         category: "A1" | string; /* todo */
//         lastPosition?: Position;
//         nac_v: number; /* todo */
//         sil_type: "perhour" | string; /* todo */
//         alert: number; /* todo */
//         spi: number; /* todo */
//         mlat: unknown[]; /* todo */
//         tisb: unknown[]; /* todo */
//         messages: number; /* todo */
//         seen: number; /* todo */
//         rssi: number; /* todo */
//     }[],
//     msg: "No error" | string;
//     now: number; /* Millisecond timestamp. */
//     total: number;
//     ctime: number; /* Millisecond timestamp. */
//     ptime: number;
// }
//
