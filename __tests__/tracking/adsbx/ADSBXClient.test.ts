import Axios from "axios";
import MockAdapter from "axios-mock-adapter";
import _, {isError} from "lodash";
import {readJsonResource} from "@mattj65817/test-js";
import {ADSBXClient} from "../../../src/tracking/adsbx/ADSBXClient";

import type {ADSBXPositionResponse} from "../../../src/tracking/adsbx/adsbx-types";

describe("ADSBXClient", () => {
    describe("getPositions()", () => {
        test("Successfully returns results from adsbx-positions-response.json", async () => {
            const axios = Axios.create({
                baseURL: "https://opendata.adsb.fi/api/v2/"
            });
            const axiosMock = new MockAdapter(axios);
            const instance = ADSBXClient.create(axios.request);
            const response = await readJsonResource<ADSBXPositionResponse>(__dirname, "./adsbx-positions-response.json");
            const modeSCodes = _.uniq(_.map(response.ac, "hex")).sort();
            axiosMock.onGet(`./hex/${modeSCodes.join(",")}`).reply(200, JSON.stringify(response));
            const positions = await instance.getPositions(modeSCodes);
            expect(positions).toStrictEqual(response);
        });
        test("Throws on rate limit failure", async () => {
            const axios = Axios.create({
                baseURL: "https://opendata.adsb.fi/api/v2/"
            });
            const axiosMock = new MockAdapter(axios);
            const instance = ADSBXClient.create(axios.request);
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
