import {freeze, immerable} from "immer";
import {isADSBXErrorResponse} from "./ADSBX-types";

import type {AxiosInstance} from "axios";
import type {ADSBXErrorResponse, ADSBXPositionResponse} from "./ADSBX-types";
import type {ModeSCode} from "../tracking-types";
import {validateIn} from "@mattj65817/util-js";

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
            return Promise.resolve(Date.now())
                .then(now => freeze({
                    ...ADSBXClient.EMPTY_POSITIONS,
                    ctime: now,
                    now
                }));
        }
        const response = await this.request<ADSBXErrorResponse | ADSBXPositionResponse>({
            method: "GET",
            url: `./hex/${ids.join(',')}`,
            validateStatus: validateIn(200, 429)
        });
        if (429 === response.status) {
            throw Error("Exceeded rate limit");
        }
        const {data} = response;
        if (isADSBXErrorResponse(data)) {
            throw Error(data.msg);
        }
        return freeze(data);
    }

    /**
     * Create an {@link ADSBXClient} instance.
     *
     * Optionally delegates to a caller supplied `axiosFactory` function to create the underlying Axios client to allow
     * overriding of individual settings.
     *
     * @param axios the Axios instance, preconfigured with the API base URL (e.g. `https://opendata.adsb.fi/api/v2/`.)
     */
    static create(axios: AxiosInstance["request"]) {
        return freeze(new ADSBXClient(axios));
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
