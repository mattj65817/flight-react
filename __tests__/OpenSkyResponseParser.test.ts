import {readJsonResource} from "@mattj65817/test-js";
import {OpenSkyResponseParser} from "../src/OpenSkyResponseParser";
import {DateTime} from "luxon";

import type {StatesAllResponse} from "../src/OpenSkyResponseParser";

describe("OpenSkyResponseParser", () => {
    const parser = OpenSkyResponseParser.create();
    test("Parse opensky-states-all.json", async () => {
        const response = await readJsonResource<StatesAllResponse>(__dirname, "opensky-states-all.json");
        const parsed = parser.parseStatesAllResponse(response);
        expect(parsed).toStrictEqual({
            "abcdef": {
                altitude: 43_000,
                coordinates: [43.0125, -89.9872],
                method: "observed",
                timestamp: DateTime.fromISO("2023-10-15T14:49:20Z", {setZone: true}),
                track: 292.52,
                velocity: {
                    horizontal: 368.09,
                    vertical: 0,
                }
            },
            "abcdf0": {
                altitude: 2_175,
                coordinates: [43.2299, -89.6187],
                method: "observed",
                timestamp: DateTime.fromISO("2023-10-15T14:49:20Z", {setZone: true}),
                track: 308.32,
                velocity: {
                    horizontal: 79.02,
                    vertical: 2.13,
                }
            },
            "abcdf1": {
                coordinates: [41.7866, -87.7601],
                method: "observed",
                timestamp: DateTime.fromISO("2023-10-15T14:49:20Z", {setZone: true}),
                track: 182.81,
                velocity: {
                    horizontal: 8.01
                }
            },
            "abcdf2": {
                altitude: 1_500,
                coordinates: [43.2802, -89.7591],
                method: "observed",
                timestamp: DateTime.fromISO("2023-10-20T15:29:47.000Z", {setZone: true}),
                track: 92.53,
                velocity: {
                    horizontal: 68.07,
                    vertical: -13.88
                }
            }
        });
    });
});
