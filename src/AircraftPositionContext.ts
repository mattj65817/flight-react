import {createContext, useContext} from "react";
import {AircraftPosition} from "./flight-types";

export function useAircraftPosition() {
    const context = useContext(AircraftPositionContext);
    if (null == context) {
        throw Error("Context is empty.");
    }
    return context;
}

export const AircraftPositionContext = createContext<null | Record<Lowercase<string>, AircraftPosition>>(null);
