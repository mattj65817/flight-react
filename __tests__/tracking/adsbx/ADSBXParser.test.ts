import {readJsonResource} from "@mattj65817/test-js";
import {ADSBXParser} from "../../../src/tracking/adsbx/ADSBXParser";

import type {ADSBXPositionResponse} from "../../../src/tracking/adsbx/adsbx-types";

describe("ADSBXParser", () => {
    const instance = ADSBXParser.create();
    describe("parsePositions()", () => {
        test("adsbx-positions-response.json", async () => {
            const source = await readJsonResource<ADSBXPositionResponse>(__dirname, "./adsbx-positions-response.json");
            expect(instance.parsePositions(source)).toStrictEqual({
                a800d3: {
                    altitude: 1700,
                    coordinates: [43.029877, -89.117772],
                    track: 212.3,
                    velocity: {horizontal: 102.9, vertical: 128}
                },
                a2dac0: {
                    altitude: 20200,
                    coordinates: [44.076357, -90.260991],
                    track: 311.31,
                    velocity: {horizontal: 131.8}
                },
                a97172: {
                    altitude: 3400,
                    coordinates: [43.202897, -89.639544],
                    track: 316.79,
                    velocity: {horizontal: 90.6}
                },
                a6aba5: {altitude: 'ground', coordinates: [43.140358, -89.332022]}
            });
        });
    });
});
