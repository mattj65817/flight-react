import {createContext, Dispatch, useContext} from "react";
import {ReverseGeolocationAction, ReverseGeolocationState} from "./ReverseGeolocationState";

/**
 * Contents of the {@link ReverseGeolocationContext}.
 */
export type ReverseGeolocationContextContents = [
    state: ReverseGeolocationState,
    dispatch: Dispatch<ReverseGeolocationAction>
];

/**
 * Context through which reverse geolocation data is exposed by a {@link ReverseGeolocationProvider} component.
 */
export const ReverseGeolocationContext = createContext<ReverseGeolocationContextContents | null>(null);

/**
 * Hook to retrieve the {@link ReverseGeolocationContext}.
 */
export function useReverseGeolocation() {
    const context = useContext(ReverseGeolocationContext);
    if (null == context) {
        throw Error("Context is empty.");
    }
    return context;
}

export function useReverseGeolocationPlace() {

}