import Axios, {AxiosHeaders, AxiosInstance, CreateAxiosDefaults} from "axios";
import {validateIn} from "@mattj65817/util-js";
import qs from "qs";
import _ from "lodash";
import {OpenSkyResponseParser} from "./OpenSkyResponseParser";
import {freeze} from "immer";
import type {AircraftPosition, AircraftPositionService} from "./flight-types";

/**
 * {@link OpenSkyClient} encapsulates requests to OpenSky API web services.
 */
export class OpenSkyClient implements AircraftPositionService {
    constructor(private readonly request: AxiosInstance["request"], private readonly parser: OpenSkyResponseParser) {
    }

    /**
     * Get the positions of zero or more aircraft.
     *
     * @param modeSCodes the Mode S codes (lowercase hex) of the aircraft.
     * @return {@link Record} of aircraft positions keyed on Mode S code.
     */
    async getPositions(modeSCodes: Lowercase<string>[]): Promise<Record<Lowercase<string>, AircraftPosition>> {
        if (0 === modeSCodes.length) {
            return Promise.resolve({});
        }
        const response = await this.request({
            method: "get",
            url: "./states/all",
            params: {
                icao24: _.uniq(modeSCodes).sort()
            }
        });
        if (200 !== response.status) {
            return Promise.resolve({});
        }
        return this.parser.parseStatesAllResponse(response.data);
    }

    /**
     * Create an {@link OpenSkyClient} instance.
     *
     * @param axiosFactory the Axios factory function.
     */
    static create(axiosFactory: (config: CreateAxiosDefaults) => AxiosInstance["request"] = Axios.create) {
        const axios = axiosFactory({
            baseURL: "https://opensky-network.org/api/",
            headers: new AxiosHeaders().setAccept("application/json"),
            paramsSerializer: params => qs.stringify(params, {arrayFormat: "repeat"}),
            responseType: "json",
            timeout: 10_000,
            validateStatus: validateIn(200, 429)
        });
        return freeze(new OpenSkyClient(axios, OpenSkyResponseParser.create()));
    }
}
