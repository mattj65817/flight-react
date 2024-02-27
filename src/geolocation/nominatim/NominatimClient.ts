import {freeze, immerable} from "immer";
import {AxiosInstance, AxiosResponse, isAxiosError} from "axios";
import {isNominatimError, NominatimPlace, NominatimResponse} from "./nominatim-types";

import type {GeoCoordinates} from "@mattj65817/aviation-js";

/**
 * {@link NominatimClient} handles low level interaction with Nominatim API services.
 */
export class NominatimClient {
    [immerable] = true;

    private constructor(private readonly axios: AxiosInstance["request"]) {
    }

    async getPlace(coordinates: GeoCoordinates) {
        let response: AxiosResponse<NominatimResponse>;
        try {
            response = await this.axios({
                method: "GET",
                url: "./reverse",
                params: {
                    format: "json",
                    lat: coordinates[0],
                    lon: coordinates[1],
                    zoom: 10
                }
            });
        } catch (ex) {
            if (isAxiosError(ex) && 429 === ex.response!.status) {
                throw Error("Exceeded rate limit"); // TODO: unverified that Nominatim responds this way.
            }
            throw ex;
        }
        const {data} = response;
        if (isNominatimError(data)) {
            throw Error(data.error);
        }
        return this.toPlaceName(data.address);
    }

    private toPlaceName(address: NominatimPlace["address"]) {
        const {country_code} = address,
            segments: Array<undefined | string> = [this.municipalityName(address)];
        if ("us" !== country_code && "ca" !== country_code) {
            const {county} = address;
            segments.push(county);
        }
        segments.push(this.stateAbbrOrName(address));
        return segments.filter(segment => null != segment).join(", ");
    }

    private municipalityName(address: NominatimPlace["address"]) {
        const {city, county, hamlet, municipality, town, village} = address,
            municipalityName = city || town || village || municipality || hamlet || county;
        if (null != municipalityName) {
            const prefix = MUNICIPALITY_PREFIXES.find(prefix => municipalityName.startsWith(prefix));
            if (null == prefix) {
                return municipalityName.trim();
            }
            return municipalityName.substring(prefix.length).trim();
        }
    }

    private stateAbbrOrName(address: NominatimPlace["address"]) {
        const {["ISO3166-2-lvl4"]: isoState} = address;
        if (null != isoState) {
            return isoState.split("-").pop();
        }
        const {state} = address;
        if (null != state) {
            return state;
        }
    }

    static create(axios: AxiosInstance["request"]) {
        return freeze(new NominatimClient(axios));
    }
}

/**
 * Prefixes to strip from municipality names in the interest of brevity.
 */
const MUNICIPALITY_PREFIXES = freeze([
    "Town of ",
    "City of ",
    "Village of "
]);
