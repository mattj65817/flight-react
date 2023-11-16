import * as React from "react";
import {useCallback, useEffect} from "react";
import {DateTime} from "luxon";
import {useTracking} from "./TrackingProvider";

import type {PropsWithChildren} from "react";
import type {PositionService} from "./tracking-types";

interface TrackingManagerProps {
    service: PositionService;
}

export function TrackingManager({children, service}: PropsWithChildren<TrackingManagerProps>) {
    const [state, dispatch] = useTracking();

    /* Callback to trigger a request to the position provider and (if successful) corresponding status update. */
    const {ids} = state;
    const updatePositions = useCallback(() => {
        Promise.resolve()
            .then(async () => {
                const positions = await service.getPositions(ids);
                dispatch({
                    kind: "positions updated",
                    payload: {
                        timestamp: DateTime.utc(),
                        positions
                    }
                });
            })
            .catch(error => {
                dispatch({
                    kind: "error occurred",
                    payload: {
                        timestamp: DateTime.utc(),
                        error
                    }
                });
            });
    }, [dispatch, service, ...ids]);

    /* Effect to defer a position update upon expiration of the tracking interval. */
    const {nextUpdate} = state;
    useEffect(() => {
        const delay = nextUpdate.diff(DateTime.utc()).toMillis();
        if (delay <= 0) {
            updatePositions();
        } else {
            const id = setTimeout(updatePositions, delay);
            return () => clearTimeout(id);
        }
    }, [updatePositions, nextUpdate]);
    return (
        <>
            {children}
        </>
    );
}