import * as React from "react";
import {AxiosHeaders, isAxiosError} from "axios";
import axiosRetry, {exponentialDelay} from "axios-retry";
import {freeze} from "immer";

import type {IAxiosRetryConfig} from "axios-retry";
import type {PropsWithChildren} from "react";
import type {AxiosFactory} from "../../flight-types";
import type {NominatimConfig} from "./nominatim-types";
import {useMemo} from "react";
import {GeolocationService} from "../geolocation-types";
import {NominatimClient} from "./NominatimClient";
import {NominatimGeolocationService} from "./NominatimGeolocationService";
import ReverseGeolocationManager from "../ReverseGeolocationManager";

/**
 * Properties for a {@link NominatimReverseGeolocationProvider} component.
 */
export interface NominatimReverseGeolocationProviderProps extends NominatimConfig {
    axiosFactory: AxiosFactory;
}

/**
 * Nominatim retry configuration, retries up to 3 times after exponential backoff on `429 TOO MANY REQUESTS` error.
 */
const retryConfig = freeze<IAxiosRetryConfig>({
    retries: 3,
    retryCondition: err => isAxiosError(err) && 429 === err.response!.status,
    retryDelay: exponentialDelay
});

export default function NominatimReverseGeolocationProvider(props: PropsWithChildren<NominatimReverseGeolocationProviderProps>) {
    const {axiosFactory, baseURL: {href}, children} = props;
    const geolocationService = useMemo<GeolocationService>(() => {
        const axios = axiosFactory(freeze({
            baseURL: href,
            responseType: "json",
            headers: {
                common: new AxiosHeaders().setAccept("application/json")
            }
        }, true));
        axiosRetry(axios, retryConfig);
        const client = NominatimClient.create(axios.request);
        return NominatimGeolocationService.create(client);
    }, [axiosFactory, href]);
    return (
        <>
            <ReverseGeolocationManager service={geolocationService}/>
            {children}
        </>
    );
}
