import * as React from "react";
import {useMemo, useReducer} from "react";
import {ReverseGeolocationContext} from "./ReverseGeolocationContext";
import NominatimReverseGeolocationProvider from "./nominatim/NominatimReverseGeolocationProvider";

import type {PropsWithChildren} from "react";
import type {GeoCoordinates, Kinded} from "../flight-types";
import type {ReverseGeolocationContextContents} from "./ReverseGeolocationContext";
import type {NominatimReverseGeolocationProviderProps} from "./nominatim/NominatimReverseGeolocationProvider";
import {ReverseGeolocationState} from "./ReverseGeolocationState";
import {freeze} from "immer";

/**
 * Properties for a {@link ReverseGeolocationProvider} component.
 */
export interface ReverseGeolocationProviderProps {
    config:
        | Kinded<NominatimReverseGeolocationProviderProps, "nominatim">;
    coordinates: GeoCoordinates;

    /**
     * Minimum distance, in nautical miles, which coordinates must change before a reverse geolocation update is needed.
     */
    threshold: number;
}

/**
 * {@link TrackingProvider} provides reverse geolocation functions via an underlying {@link GeolocationService},
 * creating and publishing the {@link ReverseGeolocationContext}.
 *
 * @param props the component properties.
 * @constructor
 */
export default function ReverseGeolocationProvider(props: PropsWithChildren<ReverseGeolocationProviderProps>) {
    const {config, children} = props;
    const [state, dispatch] = useReducer(ReverseGeolocationState.reduce, props, ReverseGeolocationState.initial);
    const contents = useMemo(() => freeze<ReverseGeolocationContextContents>([state, dispatch]), []);
    switch (config.kind) {
        case "nominatim":
            return (
                <ReverseGeolocationContext.Provider value={contents}>
                    <NominatimReverseGeolocationProvider {...config}/>
                    {children}
                </ReverseGeolocationContext.Provider>
            );
    }
}
