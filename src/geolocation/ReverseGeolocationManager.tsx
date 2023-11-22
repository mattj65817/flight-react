import {useCallback, useEffect} from "react";
import {useReverseGeolocation} from "./ReverseGeolocationContext";

import type {GeolocationService} from "./geolocation-types";
import {DateTime} from "luxon";
import {GeoCoordinates} from "../flight-types";

/**
 * Properties for a {@link ReverseGeolocationManager} component.
 */
interface ReverseGeolocationManagerProps {

    /**
     * Geolocation service.
     */
    service: GeolocationService;
}

export default function ReverseGeolocationManager({service}: ReverseGeolocationManagerProps) {
    const [state, dispatch] = useReverseGeolocation();

    const updatePlace = useCallback((coordinates: GeoCoordinates) => {
        Promise.resolve()
            .then(async () => {
                const place = await service.getPlace(coordinates);
                dispatch({
                    kind: "place resolved",
                    payload: place!
                });
            })
            .catch(error => {
                dispatch({
                    kind: "error occurred",
                    payload: {
                        timestamp: DateTime.utc(),
                        error
                    }
                })
            });
    }, [dispatch, service]);

    const {coordinates, place} = state;
    useEffect(() => {
        if (null == place) {
            updatePlace(coordinates);
        }
    }, [coordinates, place, updatePlace]);
    return null;
}
