import {createContext, useContext} from "react";

import type {Position} from "./position-types";

export function usePosition() {
    const context = useContext(PositionContext);
    if (null == context) {
        throw Error("Context is empty.");
    }
    return context;
}

export const PositionContext = createContext<null | Record<Lowercase<string>, Position>>(null);
