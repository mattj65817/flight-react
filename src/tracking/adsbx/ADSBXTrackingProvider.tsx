import * as React from "react";
import Axios, {AxiosHeaders, isAxiosError} from "axios";
import axiosRetry, {exponentialDelay} from "axios-retry";
import {freeze} from "immer";
import _ from "lodash";
import {useMemo} from "react";
import {TrackingManager} from "../TrackingManager";
import {ADSBXClient} from "./ADSBXClient";
import {ADSBXPositionService} from "./ADSBXPositionService";

import type {AxiosInstance, CreateAxiosDefaults} from "axios";
import type {IAxiosRetryConfig} from "axios-retry";
import type {PropsWithChildren} from "react";
import type {ADSBXConfig} from "./ADSBX-types";

/**
 * Configuration for an ADSB-X position provider.
 */
export interface ADSBXTrackingProviderProps extends ADSBXConfig {
    axiosFactory: (config?: CreateAxiosDefaults) => AxiosInstance;
}

/**
 * ADSB-X retry configuration, retries up to 3 times after exponential backoff on `429 TOO MANY REQUESTS` error.
 */
const retryConfig = freeze<IAxiosRetryConfig>({
    retries: 3,
    retryCondition: err => isAxiosError(err) && 429 === err.response!.status,
    retryDelay: exponentialDelay
});

export function ADSBXTrackingProvider({children, ...props}: PropsWithChildren<ADSBXTrackingProviderProps>) {
    const {axiosFactory, auth, baseURL: {href}} = _.defaults({}, props, DEFAULT_PROPS);
    const positionService = useMemo(() => {
        let headers = new AxiosHeaders().setAccept("application/json");
        if (null != auth) {
            headers = headers.set("api-auth", auth);
        }
        const axios = axiosFactory(freeze({
            baseURL: href,
            responseType: "json",
            headers: {
                common: headers
            }
        }, true));
        axiosRetry(axios, retryConfig);
        const client = ADSBXClient.create(axios.request);
        return ADSBXPositionService.create(client);
    }, [axiosFactory, auth, href]);
    return (
        <TrackingManager service={positionService}>
            {children}
        </TrackingManager>
    );
}

const DEFAULT_PROPS = freeze<Partial<ADSBXTrackingProviderProps>>({
    axiosFactory: Axios.create,
    baseURL: new URL("https://opendata.adsb.fi/api/v2/")
});
