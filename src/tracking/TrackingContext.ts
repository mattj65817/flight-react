import {createContext, useContext, useMemo} from "react";
import {TrackingState} from "./TrackingState";

import type {Dispatch} from "react";
import type {ModeSCode} from "@mattj65817/aviation-js";
import type {Positions} from "./tracking-types";
import type {TrackingAction} from "./TrackingState";

/**
 * Contents of the {@link TrackingContext}.
 */
export type TrackingContextContents = [
    state: TrackingState,
    dispatch: Dispatch<TrackingAction>
];

/**
 * Context through which aircraft position data is exposed by a {@link TrackingProvider} component.
 */
export const TrackingContext = createContext<TrackingContextContents | null>(null);

/**
 * Hook to retrieve the {@link TrackingContext}.
 */
export function useTracking() {
    const context = useContext(TrackingContext);
    if (null == context) {
        throw Error("Context is empty.");
    }
    return context;
}

/**
 * Hook to retrieve the positions of all aircraft which are currently being tracked.
 */
export function useTrackingPositions() {
    return useTracking()[0].positions;
}

/**
 * Hook to retrieve the position of an aircraft *if* it is currently being tracked, else `null`.
 *
 * @param id the hex Mode S code of the aircraft.
 */
export function useTrackingPosition<T extends ModeSCode>(id: T): null | Positions[T] {
    const {positions} = useTracking()[0];
    return useMemo(() => {
        if (null == Object.hasOwn(positions, id)) {
            return null;
        }
        return positions[id];
    }, [id, positions]);
}
