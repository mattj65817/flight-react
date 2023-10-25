"use client"

import * as React from "react";
import _ from "lodash";
import {PropsWithChildren, useCallback, useEffect, useMemo, useReducer} from "react";
import Axios, {AxiosBasicCredentials} from "axios";
import {OpenSkyClient} from "./OpenSkyClient";
import {DateTime} from "luxon";
import {AircraftPositionState} from "./AircraftPositionState";
import {AircraftPositionContext} from "./AircraftPositionContext";

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
    const [state, dispatch] = useReducer(AircraftPositionState.reduce, modeSCodes, AircraftPositionState.initial);

    /* Callback to invoke the position service and update state. */
    const updatePositions = useCallback(() => {
        console.log("updatePositions()")
        service.getPositions(state.modeSCodes)
            .then(positions => {
                dispatch({
                    kind: "update positions",
                    payload: {
                        updated: DateTime.now().setZone("UTC"),
                        positions
                    }
                });
            });
    }, [dispatch, service, ...state.modeSCodes]);

    /* Trigger (or trigger deferred) position updates upon reaching next update time. */
    useEffect(() => {
        const delay = state.updated.plus({minute: 1}).diff(DateTime.now()).toMillis();
        console.log("Delay", delay);
        if (delay <= 0) {
            updatePositions();
        } else {
            const id = setTimeout(updatePositions, delay);
            return () => clearTimeout(id);
        }
    }, [updatePositions, state.updated.toMillis(), ...state.modeSCodes]);

    /* Component body. */
    return (
        <AircraftPositionContext.Provider value={state.positions}>
            {children}
        </AircraftPositionContext.Provider>
    );
}
