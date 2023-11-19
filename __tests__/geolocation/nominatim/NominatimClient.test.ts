import Axios from "axios";
import MockAdapter from "axios-mock-adapter";
import {isError} from "lodash";
import {readJsonResource} from "@mattj65817/test-js";
import {NominatimClient} from "../../../src/geolocation/nominatim/NominatimClient";

import type {NominatimResponse} from "../../../src/geolocation/nominatim/nominatim-types";

describe("NominatimClient", () => {
    describe("getLocation()", () => {
        test("Successfully returns results from nominatim-reverse-response.json", async () => {
            const axios = Axios.create({
                baseURL: "https://nominatim.openstreetmap.org/"
            });
            const axiosMock = new MockAdapter(axios);
            const instance = NominatimClient.create(axios.request);
            const response = await readJsonResource<NominatimResponse>(__dirname, "./nominatim-reverse-response.json");
            axiosMock.onGet("./reverse").reply(200, JSON.stringify(response));
            expect(await instance.getLocation([43.220, -89.765])).toBe("Mazomanie, WI");
        });
        test("Throws on rate limit failure", async () => {
            const axios = Axios.create({
                baseURL: "https://nominatim.openstreetmap.org/"
            });
            const axiosMock = new MockAdapter(axios);
            const instance = NominatimClient.create(axios.request);
            axiosMock.onGet("./reverse").reply(429);
            try {
                await instance.getLocation([43.220, -89.765]);
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
