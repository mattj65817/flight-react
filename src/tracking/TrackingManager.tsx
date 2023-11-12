import * as React from "react";
import {PositionService} from "./tracking-types";
import {PropsWithChildren, useCallback, useEffect} from "react";
import {DateTime} from "luxon";
import {useTracking} from "./TrackingProvider";

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
                console.log("GET POSITIONS");
                const positions = await service.getPositionsByModeSCodes(ids);
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
    }, [dispatch, ids, service]);

    /* Effect to defer a position update upon expiration of the tracking interval. */
    const {nextUpdate} = state;
    useEffect(() => {
        const delay = nextUpdate.diff(DateTime.utc()).toMillis();
        if (delay <= 0) {
            updatePositions();
        } else {
            return () => clearTimeout(setTimeout(updatePositions, delay));
        }
    }, [updatePositions, nextUpdate]);
    return (
        <>
            {children}
        </>
    );
}