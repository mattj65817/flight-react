"use client"

import * as React from "react";
import {useCallback, useEffect, useMemo, useReducer} from "react";
import Axios from "axios";
import _ from "lodash";
import {DateTime} from "luxon";
import {PositionContext} from "./PositionContext";
import {PositionState} from "./PositionState";
import {OpenSkyClient} from "./OpenSkyClient";

import type {AxiosBasicCredentials} from "axios";
import type {DurationLike} from "luxon";
import type {PropsWithChildren} from "react";
import {freeze} from "immer";

/**
 * {@link PositionProviderProps} holds properties for a {@link PositionProvider} component.
 */
interface PositionProviderProps {

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

    /**
     * Interval between updates when not receiving position for any aircraft.
     */
    notTrackingInterval: DurationLike;

    /**
     * Interval between updates when receiving position for at least one aircraft.
     */
    trackingInterval: DurationLike;
}

/**
 * [PositionProvider] uses an underlying {@link PositionService} to track zero or more aircraft via Mode S code.
 *
 * @param props the component properties.
 * @constructor
 */
export function PositionProvider(props: PropsWithChildren<PositionProviderProps>) {

    /* Instantiate the position service on config change. */
    const {children, config, modeSCodes} = props;
    const service = useMemo(() => {
        const {auth} = config;
        return OpenSkyClient.create(config => Axios.create(_.assign({
            ...(null == auth ? {} : {auth})
        }, config)));
    }, [JSON.stringify(config.auth)]);

    /* Create state and dispatcher and determine poll interval on tracked aircraft change. */
    const [state, dispatch] = useReducer(PositionState.reduce, modeSCodes, PositionState.initial);
    const tracking = !_.isEmpty(state.positions);
    const {notTrackingInterval, trackingInterval} = config;
    const interval = useMemo(() => freeze(_.isEmpty(state.positions) ? notTrackingInterval : trackingInterval),
        [tracking, JSON.stringify([trackingInterval, notTrackingInterval])]);

    /* Callback to poll the position service and update state. */
    const updatePositions = useCallback(() => {
        service.getPositions(state.modeSCodes)
            .then(positions => {
                dispatch({
                    kind: "position updated",
                    payload: {
                        updated: DateTime.now().setZone("UTC"),
                        positions
                    }
                });
            })
            .catch(error => {
                console.error("Error updating positions.", error);
                dispatch({
                    kind: "position update failed",
                    payload: {
                        failed: DateTime.now().setZone("UTC"),
                        error
                    }
                });
            });
    }, [dispatch, service, ...state.modeSCodes]);

    /* Trigger (or trigger deferred) position updates upon reaching next update time. */
    useEffect(() => {
        const delay = Math.max(0, state.updated.plus(interval).diff(DateTime.now()).toMillis());
        console.log("Delay", delay);
        if (0 === delay) {
            updatePositions();
        } else {
            const id = setTimeout(updatePositions, delay);
            return () => clearTimeout(id);
        }
    }, [interval, updatePositions, state.updated.toMillis(), ...state.modeSCodes]);

    /* Component body. */
    return (
        <PositionContext.Provider value={state.positions}>
            {children}
        </PositionContext.Provider>
    );
}
