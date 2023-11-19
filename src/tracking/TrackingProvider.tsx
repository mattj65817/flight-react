import * as React from "react";
import {useReducer, useMemo, useEffect} from "react";
import {freeze} from "immer";
import {TrackingState} from "./TrackingState";
import {ADSBXTrackingProvider} from "./adsbx/ADSBXTrackingProvider";
import {TrackingContext} from "./TrackingContext";

import type {DurationLike} from "luxon";
import type {PropsWithChildren} from "react";
import type {Kinded} from "../flight-types";
import type {ModeSCode} from "./tracking-types";
import type {TrackingContextContents} from "./TrackingContext";
import type {ADSBXTrackingProviderProps} from "./adsbx/ADSBXTrackingProvider";

/**
 * Properties for a {@link TrackingProvider} component.
 */
export interface TrackingProviderProps {
    config:
        | Kinded<ADSBXTrackingProviderProps, "adsbx">;
    ids: ModeSCode[];
    nonTrackingInterval: DurationLike;
    trackingInterval: DurationLike;
}

/**
 * {@link TrackingProvider} provides aircraft positions via an underlying {@link PositionService}, creating and
 * publishing the {@link TrackingContext}.
 *
 * @param props the component properties.
 * @constructor
 */
export function TrackingProvider(props: PropsWithChildren<TrackingProviderProps>) {
    const {config, children} = props;
    const [state, dispatch] = useReducer(TrackingState.reduce, props, TrackingState.initial);
    const contents = useMemo(() => freeze<TrackingContextContents>([state, dispatch]), [dispatch, state]);

    /* Update state when the ID list changes. */
    const {ids} = props;
    useEffect(() => {
        dispatch({
            kind: "ids updated",
            payload: ids
        });
    }, [dispatch, ids.join(",")]);

    /* Emit the appropriate tracking provider per config.kind. */
    switch (config.kind) {
        case "adsbx":
            return (
                <TrackingContext.Provider value={contents}>
                    <ADSBXTrackingProvider {...config}/>
                    {children}
                </TrackingContext.Provider>
            );
    }
}

