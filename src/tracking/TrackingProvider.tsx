import * as React from "react";
import {
    Dispatch,
    PropsWithChildren,
    createContext,
    useContext,
    useReducer, useMemo
} from "react";
import {freeze} from "immer";
import {DurationLike} from "luxon";
import {TrackingAction, TrackingState} from "./TrackingState";
import {ADSBXTrackingProvider, ADSBXTrackingProviderProps} from "./adsbx/ADSBXTrackingProvider";
import {Kinded, ModeSCode} from "./tracking-types";

interface TrackingProviderProps {
    config: Kinded<ADSBXTrackingProviderProps, "adsbx">;
    ids: ModeSCode[];
    nonTrackingInterval: DurationLike;
    trackingInterval: DurationLike;
}

export function TrackingProvider(props: PropsWithChildren<TrackingProviderProps>) {
    const {config, children} = props;
    const [state, dispatch] = useReducer(TrackingState.reduce, props, TrackingState.initial);
    const contents = useMemo(() => freeze<TrackingContextContents>([state, dispatch]), [dispatch, state]);
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

type TrackingContextContents = [
    state: TrackingState,
    dispatch: Dispatch<TrackingAction>
];

export const TrackingContext = createContext<TrackingContextContents | null>(null);

export function useTracking() {
    const context = useContext(TrackingContext);
    if (null == context) {
        throw Error("Context is empty.");
    }
    return context;
}

export function useTrackingState() {
    return useTracking()[0];
}
