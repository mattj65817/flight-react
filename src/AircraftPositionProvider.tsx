"use client"

import * as React from "react";
import _ from "lodash";
import {createContext, PropsWithChildren, useContext, useEffect, useMemo, useState} from "react";
import Axios, {AxiosBasicCredentials} from "axios";
import {AircraftPosition} from "./flight-types";
import {OpenSkyClient} from "./OpenSkyClient";
import {immerable, produce} from "immer";
import {DateTime} from "luxon";

/**
 * {@link AircraftPositionProviderProps} holds properties for a {@link AircraftPositionProvider} component.
 */
interface AircraftPositionProviderProps {

    /**
     * Mode-S codes to track in lowercase hexadecimal format (ex. `abcd1234`.)
     */
    modeSCodes: Lowercase<string>[];

    /**
     * Aircraft position service configuration.
     */
    config:
        | OpenSkyConfig;
}

/**
 * OpenSky position service configuration.
 */
interface OpenSkyConfig {
    provider: "opensky";
    auth?: AxiosBasicCredentials;
}

export function AircraftPositionProvider(props: PropsWithChildren<AircraftPositionProviderProps>) {
    const {children, config, modeSCodes} = props;
    const service = useMemo(() => {
        const {auth} = config;
        return OpenSkyClient.create(config => Axios.create(_.assign({
            ...(null == auth ? {} : {auth})
        }, config)));
    }, [JSON.stringify(config)]);
    const initialState = useMemo(() => new AircraftPositionProviderState(modeSCodes.sort()), [modeSCodes.sort().join(":")]);
    const [state, updateState] = useState(initialState);

    /* Trigger position updates upon reaching next update time. */
    useEffect(() => {

        /* Callback to invoke the position service and update state. */
        const updatePositions = () => {
            console.log("updatePositions()")
            service.getPositions(state.modeSCodes)
                .then(positions => {
                    updateState(previous => produce(previous, draft => {
                        draft.nextUpdate = DateTime.now().plus({minute: 1});
                        draft.positions = positions;
                    }));
                });
        }

        /* Calculate delay until next update; if <= 0, invoke now, else invoke after timeout. */
        const delay = state.nextUpdate.diff(DateTime.now()).toMillis();
        console.log("Delay", delay);
        if (delay <= 0) {
            updatePositions();
        } else {
            const id = setTimeout(updatePositions, delay);
            return () => clearTimeout(id);
        }
    }, [state.nextUpdate, state.modeSCodes, service]);

    /* Component body. */
    return (
        <AircraftPositionContext.Provider value={state.positions}>
            {children}
        </AircraftPositionContext.Provider>
    );
}

export function useAircraftPositions() {
    const context = useContext(AircraftPositionContext);
    if (null == context) {
        throw Error("Context is empty.");
    }
    return context;
}

class AircraftPositionProviderState {
    [immerable] = true;

    nextUpdate: DateTime;
    positions: Record<Lowercase<string>, AircraftPosition>;

    constructor(readonly modeSCodes: Lowercase<string>[]) {
        this.nextUpdate = DateTime.fromSeconds(0, {zone: "UTC"});
        this.positions = {};
    }
}

const AircraftPositionContext = createContext<null | Record<Lowercase<string>, AircraftPosition>>(null);
