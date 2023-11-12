import * as React from "react";
import Axios, {AxiosHeaders, AxiosInstance, CreateAxiosDefaults} from "axios";
import {freeze} from "immer";
import _ from "lodash";
import {PropsWithChildren, useMemo} from "react";
import {TrackingManager} from "../TrackingManager";
import {ADSBXConfig} from "./ADSBX-types";
import {ADSBXClient} from "./ADSBXClient";
import {ADSBXPositionService} from "./ADSBXPositionService";

/**
 * Configuration for an ADSB-X position provider.
 */
export interface ADSBXTrackingProviderProps extends ADSBXConfig {
    axiosFactory: (config?: CreateAxiosDefaults) => AxiosInstance;
}

export function ADSBXTrackingProvider({children, ...rest}: PropsWithChildren<ADSBXTrackingProviderProps>) {
    const {axiosFactory, auth, baseURL} = _.defaults({}, rest, DEFAULT_PROPS);
    const positionService = useMemo(() => {
        let headers = new AxiosHeaders().setAccept("application/json");
        if (null != auth) {
            headers = headers.set("api-auth", auth);
        }
        const axios = axiosFactory({
            baseURL: baseURL.href,
            headers
        });
        const client = ADSBXClient.create(axios);
        return ADSBXPositionService.create(client);
    }, [axiosFactory, auth, baseURL.href]);
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
