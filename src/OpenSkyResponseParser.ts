import _ from "lodash";
import {DateTime} from "luxon";
import {freeze} from "immer";
import {scale} from "@mattj65817/util-js";
import {AircraftPosition} from "./index";

/**
 * {@link OpenSkyResponseParser} parses OpenSky API responses into generic flight tracking data types,
 * {@link FlightPosition} or {@link GroundPosition}.
 */
export class OpenSkyResponseParser {
    private constructor() {
    }

    parseStatesAllResponse(response: StatesAllResponse) {
        return freeze(_.transform(response.states, (acc, state) => {
            const [
                icao24, , ,
                time_position,
                last_contact,
                longitude,
                latitude,
                baro_altitude,
                on_ground,
                velocity,
                true_track,
                vertical_rate
            ] = state;
            if (null != latitude && null != longitude && null != true_track) {
                const method = time_position === last_contact ? "observed" : "projected";
                const timestamp = DateTime.fromSeconds(time_position, {zone: "UTC"});
                if (on_ground) {
                    acc[icao24] = {
                        coordinates: [latitude, longitude],
                        track: true_track,
                        method, timestamp,
                        ...(null == velocity ? {} : {
                            velocity: {
                                horizontal: scale(velocity * 1.94384, 2)
                            }
                        })
                    };
                } else {
                    acc[icao24] = {
                        altitude: null == baro_altitude ? null : scale(3.28084 * baro_altitude, 2),
                        coordinates: [latitude, longitude],
                        track: true_track,
                        method, timestamp,
                        ...(null == velocity ? {} : {
                            velocity: {
                                horizontal: scale(velocity * 1.94384, 2),
                                ...(null == vertical_rate ? {} : {
                                    vertical: scale(vertical_rate * 3.28084, 2)
                                })
                            }
                        })
                    }
                }
            }
        }, {} as { [k in Lowercase<string>]: AircraftPosition }), true);
    }

    static create() {
        return freeze(new OpenSkyResponseParser(), true);
    }
}

/**
 * See the [OpenSky API docs](https://openskynetwork.github.io/opensky-api/rest.html#all-state-vectors)
 */
export interface StatesAllResponse {
    time: number;
    states: Array<[
        icao24: Lowercase<string>,
        callsign: string, /* must be trimmed. */
        origin_country: string,
        time_position: number,
        last_contact: number,
        longitude: number | null,
        latitude: number | null,
        baro_altitude: number | null,
        on_ground: boolean,
        velocity: number | null,
        true_track: number | null,
        vertical_rate: number | null,
        sensors: Array<number> | null,
        geo_altitude: number | null,
        squawk: string | null,
        spi: boolean,
        position_source: number,
        category: number
    ]>;
}
