import Axios from "axios";
import MockAdapter from "axios-mock-adapter";
import _, {isError} from "lodash";
import {readJsonResource} from "@mattj65817/test-js";
import {ADSBXPositionService} from "../../../src/tracking/adsbx";
import {ADSBXClient} from "../../../src/tracking/adsbx/ADSBXClient";
import {ADSBXParser} from "../../../src/tracking/adsbx/ADSBXParser";

import type {ADSBXPositionResponse} from "../../../src/tracking/adsbx/adsbx-types";

describe("ADSBXPositionService", () => {
    describe("getPositionsByModeSCodes()", () => {
        test("Successfully returns results from adsbx-positions-response.json", async () => {
            const axios = Axios.create({
                baseURL: "https://opendata.adsb.fi/api/v2/"
            });
            const axiosMock = new MockAdapter(axios);
            const client = ADSBXClient.create(axios);
            const instance = ADSBXPositionService.create(client, ADSBXParser.INSTANCE);
            const response = await readJsonResource<ADSBXPositionResponse>(__dirname, "./adsbx-positions-response.json");
            const modeSCodes = _.uniq(_.map(response.ac, "hex")).sort();
            axiosMock.onGet(`./hex/${modeSCodes.join(",")}`).reply(200, JSON.stringify(response));
            const positions = await instance.getPositions(modeSCodes);
            expect(positions).toStrictEqual({
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
                a6aba5: {
                    altitude: 'ground',
                    coordinates: [43.140358, -89.332022]
                }
            });
        });
        test("Throws on rate limit failure", async () => {
            const axios = Axios.create({
                baseURL: "https://opendata.adsb.fi/api/v2/"
            });
            const axiosMock = new MockAdapter(axios);
            const client = ADSBXClient.create(axios);
            const instance = ADSBXPositionService.create(client, ADSBXParser.INSTANCE);
            axiosMock.onGet("./hex/abc123").reply(429);
            try {
                await instance.getPositions(["abc123"]);
                expect(true).toBe(false);
            } catch (ex) {
                if (isError(ex)) {
                    expect(ex.message).toBe("Exceeded rate limit");
                } else {
                    expect(true).toBe(false);
                }
            }
        });
    });
});
