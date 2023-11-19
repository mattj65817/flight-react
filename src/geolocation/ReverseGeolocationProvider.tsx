import * as React from "react";
import {useMemo} from "react";
import {ReverseGeolocationContext} from "./ReverseGeolocationContext";
import NominatimReverseGeolocationProvider from "./nominatim/NominatimReverseGeolocationProvider";

import type {PropsWithChildren} from "react";
import type {GeoCoordinates, Kinded} from "../flight-types";
import type {ReverseGeolocationContextContents} from "./ReverseGeolocationContext";
import type {NominatimReverseGeolocationProviderProps} from "./nominatim/NominatimReverseGeolocationProvider";

/**
 * Properties for a {@link ReverseGeolocationProvider} component.
 */
export interface ReverseGeolocationProviderProps {
    config:
        | Kinded<NominatimReverseGeolocationProviderProps, "nominatim">;
    coordinates: Record<string, GeoCoordinates>;
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
    const context = useMemo<ReverseGeolocationContextContents>(() => [], []);
    switch (config.kind) {
        case "nominatim":
            return (
                <ReverseGeolocationContext.Provider value={context}>
                    <NominatimReverseGeolocationProvider {...config}/>
                    {children}
                </ReverseGeolocationContext.Provider>
            );
    }
}
