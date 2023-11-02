import Axios, {AxiosHeaders} from "axios";
import {freeze, immerable} from "immer";
import _ from "lodash";
import {Duration} from "luxon";
import {validateIn} from "@mattj65817/util-js";
import {ModeSCode} from "../tracking-types";
import {ADSBXErrorResponse, ADSBXPositionResponse, isADSBXErrorResponse} from "./ADSBX-types";

import type {AxiosInstance, CreateAxiosDefaults} from "axios";

/**
 * {@link ADSBXClient} retrieves aircraft position data from a provider implementing the ADSBX v2 API (such as
 * {@link https://adsb.fi adsb.fi}).
 *
 * @see https://github.com/adsbfi/opendata/blob/main/README.md
 * @see https://www.adsbexchange.com/version-2-api-wip/
 */
export class ADSBXClient {
    [immerable] = true;

    private constructor(private readonly request: AxiosInstance["request"]) {
    }

    /**
     * Get latest known positions for zero or more aircraft.
     *
     * @param ids the aircraft Mode S hex codes.
     */
    async getPositions(ids: ModeSCode[]) {
        if (0 === ids.length) {
            const now = Date.now();
            return Promise.resolve(freeze<ADSBXPositionResponse>(_.assign({}, ADSBXClient.EMPTY_POSITIONS, {
                ctime: now,
                now
            })));
        }
        const response = await this.request<ADSBXErrorResponse | ADSBXPositionResponse>({
            method: "GET",
            headers: new AxiosHeaders().setAccept("application/json"),
            url: `./hex/${ids.join(',')}`,
            responseType: "json",
            validateStatus: validateIn(200, 429)
        });
        if (429 === response.status) {
            throw Error("Exceeded adsb.fi rate limit");
        }
        const {data} = response;
        if (isADSBXErrorResponse(data)) {
            throw Error(data.msg);
        }
        return freeze(data);
    }

    /**
     * Create a {@link ADSBXClient} instance.
     *
     * Optionally delegates to a caller supplied `axiosFactory` function to create the underlying Axios client to allow
     * overriding of individual settings.
     *
     * @param axiosFactory the factory to create an Axios instance from an assembled configuration.
     */
    static create(axiosFactory: (config: CreateAxiosDefaults) => AxiosInstance["request"] = Axios.create) {
        const axios = axiosFactory({
            baseURL: "https://opendata.adsb.fi/api/v2/",
            headers: new AxiosHeaders().setAccept("application/json"),
            responseType: "json",
            timeout: Duration.fromDurationLike({second: 15}).toMillis(),
            validateStatus: validateIn(200, 429)
        });
        return freeze(new ADSBXClient(_.throttle(axios, 1_250) as unknown as AxiosInstance["request"]));
    }

    /**
     * Empty {@link ADSBXPositionResponse}.
     */
    private static EMPTY_POSITIONS = freeze<Omit<ADSBXPositionResponse, "ctime" | "now">>({
        ac: [],
        msg: "No error",
        total: 0
    });
}
