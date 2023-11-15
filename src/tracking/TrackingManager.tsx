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

    useEffect(() => {
        console.log("dispatch changed");
    }, [dispatch]);

    useEffect(() => {
        console.log("service changed");
    }, [service]);

    useEffect(() => {
        console.log("ids changed");
    }, [...ids]);

    useEffect(() => {
        console.log("updatePositions changed");
    }, [updatePositions]);


    /* Effect to defer a position update upon expiration of the tracking interval. */
    const {nextUpdate} = state;
    useEffect(() => {
        console.log("nextUpdate changed");
    }, [nextUpdate]);
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