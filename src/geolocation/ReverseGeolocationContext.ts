import {createContext, useContext} from "react";

/**
 * Contents of the {@link ReverseGeolocationContext}.
 */
export type ReverseGeolocationContextContents = [];

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
