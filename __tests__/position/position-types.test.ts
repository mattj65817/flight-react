import {isFlightPosition, isGroundPosition} from "../../src";
import {DateTime} from "luxon";
import {isAircraftPosition} from "../../src/position/position-types";

describe("flight-types.ts", () => {
    describe("Type guards", () => {
        test("isAircraftPosition()", () => {
            expect(isAircraftPosition({
                coordinates: [41.7866, -87.7601],
                method: "observed",
                timestamp: DateTime.fromISO("2023-10-15T14:49:20Z", {setZone: true}),
                track: 182.81,
                velocity: {
                    horizontal: 8.01
                }
            })).toBe(true);
            expect(isAircraftPosition({
                altitude: 43_000,
                coordinates: [43.0125, -89.9872],
                method: "observed",
                timestamp: DateTime.fromISO("2023-10-15T14:49:20Z", {setZone: true}),
                track: 292.52,
                velocity: {
                    horizontal: 368.09,
                    vertical: 0,
                }
            })).toBe(true);
        });
        test("isFlightPosition()", () => {
            expect(isFlightPosition({
                coordinates: [41.7866, -87.7601],
                method: "observed",
                timestamp: DateTime.fromISO("2023-10-15T14:49:20Z", {setZone: true}),
                track: 182.81,
                velocity: {
                    horizontal: 8.01
                }
            })).toBe(false);
            expect(isFlightPosition({
                altitude: 43_000,
                coordinates: [43.0125, -89.9872],
                method: "observed",
                timestamp: DateTime.fromISO("2023-10-15T14:49:20Z", {setZone: true}),
                track: 292.52,
                velocity: {
                    horizontal: 368.09,
                    vertical: 0,
                }
            })).toBe(true);
        });
        test("isGroundPosition()", () => {
            expect(isGroundPosition({
                altitude: 43_000,
                coordinates: [43.0125, -89.9872],
                method: "observed",
                timestamp: DateTime.fromISO("2023-10-15T14:49:20Z", {setZone: true}),
                track: 292.52,
                velocity: {
                    horizontal: 368.09,
                    vertical: 0,
                }
            })).toBe(false);
            expect(isGroundPosition({
                coordinates: [41.7866, -87.7601],
                method: "observed",
                timestamp: DateTime.fromISO("2023-10-15T14:49:20Z", {setZone: true}),
                track: 182.81,
                velocity: {
                    horizontal: 8.01
                }
            })).toBe(true);
        });
    });
})