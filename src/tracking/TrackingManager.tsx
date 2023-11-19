import {useCallback, useEffect} from "react";
import {DateTime} from "luxon";
import {useTracking} from "./TrackingContext";

import type {PositionService} from "./tracking-types";

/**
 * Properties for a {@link TrackingManager} component.
 */
interface TrackingManagerProps {

    /**
     * Position service to query for aircraft positions.
     */
    service: PositionService;
}

/**
 * {@link TrackingManager} handles creation and update of the {@link TrackingState}. Performs periodic aircraft position
 * queries via a configured {@link PositionService}, updating state as appropriate.
 *
 * @param children the child element(s).
 * @param service the position service.
 * @constructor
 */
export function TrackingManager({service}: TrackingManagerProps) {
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
    }, [dispatch, service, ids.join(",")]);

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
    return null;
}
