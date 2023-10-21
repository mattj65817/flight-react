import * as React from "react";
import _ from "lodash";
import {createContext, PropsWithChildren, useContext, useEffect, useMemo, useState} from "react";
import Axios, {AxiosBasicCredentials} from "axios";
import {AircraftPosition, AircraftPositionService} from "./flight-types";
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
    const initialState = useMemo(() => new AircraftPositionProviderState(modeSCodes.sort()), [modeSCodes.sort().join(":")]);
    const [state, updateState] = useState(initialState);
    const service = useMemo<AircraftPositionService>(() => {
        const {auth} = config;
        if (null == auth) {
            return OpenSkyClient.create();
        }
        return OpenSkyClient.create(config => Axios.create(_.assign({auth}, config)));
    }, [JSON.stringify(config)]);

    useEffect(() => {
        const nextUpdate = state.lastUpdate.plus({minutes: 5});
        const delay = Math.max(0, nextUpdate.diff(DateTime.now()).toMillis());
        const timeout = setTimeout(() => Promise.resolve().then(async () => {
            const positions = await service.getPositions(state.modeSCodes);
            updateState(previous => produce(previous, draft => {
                draft.positions = positions;
            }));
        }), delay);
        return () => clearTimeout(timeout);
    }, [state.lastUpdate, state.modeSCodes, service, updateState]);

    return (
        <AircraftPositionContext.Provider value={state.positions}>
            {children}
        </AircraftPositionContext.Provider>
    );
}

export function useAircraftPosition() {
    const context = useContext(AircraftPositionContext);
    if (null == context) {
        throw Error("Context is empty.");
    }
    return context;
}

class AircraftPositionProviderState {
    [immerable] = true;

    lastUpdate: DateTime;
    positions: Record<Lowercase<string>, AircraftPosition>;

    constructor(readonly modeSCodes: Lowercase<string>[]) {
        this.lastUpdate = DateTime.fromSeconds(0, {zone: "UTC"});
        this.positions = {};
    }
}

const AircraftPositionContext = createContext<null | Record<Lowercase<string>, AircraftPosition>>(null);
