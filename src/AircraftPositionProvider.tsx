"use client"

import * as React from "react";
import {useCallback, useEffect, useMemo, useReducer} from "react";
import Axios from "axios";
import {freeze} from "immer";
import _ from "lodash";
import {DateTime} from "luxon";
import {AircraftPositionContext} from "./AircraftPositionContext";
import {AircraftPositionState} from "./AircraftPositionState";
import {OpenSkyClient} from "./OpenSkyClient";

import type {AxiosBasicCredentials} from "axios";
import type {DurationLike} from "luxon";
import type {PropsWithChildren} from "react";

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
    const tracking = Object.keys(state.positions).length > 0;
    useEffect(() => {
        const interval = tracking ? TRACKING_INTERVAL : NOT_TRACKING_INTERVAL;
        const delay = Math.max(0, state.updated.plus(interval).diff(DateTime.now()).toMillis());
        console.log("Delay", delay);
        if (0 === delay) {
            updatePositions();
        } else {
            const id = setTimeout(updatePositions, delay);
            return () => clearTimeout(id);
        }
    }, [tracking, updatePositions, state.updated.toMillis(), ...state.modeSCodes]);

    /* Component body. */
    return (
        <AircraftPositionContext.Provider value={state.positions}>
            {children}
        </AircraftPositionContext.Provider>
    );
}

/**
 * Position update interval when no aircraft are being tracked (haven't received a position for any aircraft.)
 */
const NOT_TRACKING_INTERVAL = freeze<DurationLike>({minute: 5});

/**
 * Position update interval when at least one aircraft is being tracked (have received a position for any aircraft.)
 */
const TRACKING_INTERVAL = freeze<DurationLike>({minute: 1});
