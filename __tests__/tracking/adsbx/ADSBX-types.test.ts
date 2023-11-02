import {isADSBXAltitude, isADSBXCoords, isADSBXPositionResponse, isADSBXTrack} from "../../../src/tracking/adsbx/ADSBX-types";
import {readJsonResource} from "@mattj65817/test-js";

describe("ADSBX-types", () => {
    describe("isADSBXAltitude()", () => {
        test("Ground altitude", () => {
            expect(isADSBXAltitude({alt_baro: "ground"})).toBe(true);
        });
        test("Flight altitude", () => {
            expect(isADSBXAltitude({alt_baro: 2500})).toBe(true);
        });
        test("Non-altitudes", () => {
            expect(isADSBXAltitude(null)).toBe(false);
            expect(isADSBXAltitude(undefined)).toBe(false);
            expect(isADSBXAltitude(2500)).toBe(false);
            expect(isADSBXAltitude({})).toBe(false);
        });
    });
    describe("isADSBXCoords()", () => {
        test("Coordinates", () => {
            expect(isADSBXCoords({lat: 43.114975, lon: -89.541449})).toBe(true);
        });
        test("Non-coordinates", () => {
            expect(isADSBXCoords(null)).toBe(false);
            expect(isADSBXCoords(undefined)).toBe(false);
            expect(isADSBXCoords({})).toBe(false);
        });
    });
    describe("isADSBXPositionResponse()", () => {
        test("Sample response", async () => {
            const source = await readJsonResource(__dirname, "ADSBX-positions-response.json");
            expect(isADSBXPositionResponse(source)).toBe(true);
        });
    });
    describe("isADSBXTrack()", () => {
        test("Track with vertical rate", () => {
            expect(isADSBXTrack({baro_rate: 500, gs: 80, track: 270})).toBe(true);
        });
        test("Track without vertical rate", () => {
            expect(isADSBXTrack({track: 270, gs: 80})).toBe(true);
        });
        test("Non-coordinates", () => {
            expect(isADSBXTrack(null)).toBe(false);
            expect(isADSBXTrack(undefined)).toBe(false);
            expect(isADSBXTrack({})).toBe(false);
        });
    });
});
