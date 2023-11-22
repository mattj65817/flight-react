import {freeze, immerable, produce} from "immer";
import _ from "lodash";
import {GeoCoordinates, Timestamped} from "../flight-types";
import {pointToPointCourseDistance} from "./geo-utils";

/**
 * Configuration for creating an initial {@link ReverseGeolocationState}.
 */
export type ReverseGeolocationStateConfig = Omit<ReverseGeolocationState, "error" | "place" | "placeCoordinates" | typeof immerable>;

/**
 * {@link ReverseGeolocationState} holds the state of a {@link ReverseGeolocationProvider} component.
 */
export class ReverseGeolocationState {
    [immerable] = true;

    /**
     * Current coordinates.
     */
    coordinates: GeoCoordinates;
    error?: Timestamped<{
        error: unknown;
    }>;
    place?: {
        coordinates: GeoCoordinates;
        name: string;
    };
    threshold: number;

    private constructor(config: ReverseGeolocationStateConfig) {
        this.coordinates = config.coordinates;
        this.threshold = config.threshold;
    }

    /**
     * Create an initial {@link ReverseGeolocationState}.
     *
     * @param config the initial property values.
     */
    static initial(config: ReverseGeolocationStateConfig) {
        return freeze(new ReverseGeolocationState(config));
    }

    /**
     * Reducer for {@link ReverseGeolocationAction} against a {@link ReverseGeolocationState}.
     *
     * @param previous the previous state.
     * @param kind the action kind.
     * @param payload the action payload.
     */
    static reduce(previous: ReverseGeolocationState, {kind, payload}: ReverseGeolocationAction) {
        switch (kind) {
            case "coordinates updated":
                return produce(previous, draft => {
                    delete draft.error;
                    draft.coordinates = [...payload];
                    const {place, threshold} = draft;
                    if (null != place) {
                        const {distance} = pointToPointCourseDistance(place.coordinates, payload);
                        if (distance >= threshold) {
                            delete draft.place;
                        }
                    }
                });
            case "error occurred":
                return produce(previous, draft => {
                    draft.error = _.cloneDeep(payload);
                    delete draft.place;
                });
            case "place resolved":
                return produce(previous, draft => {
                    delete draft.error;
                    draft.place = {
                        coordinates: draft.coordinates,
                        name: payload
                    };
                });
        }
    }
}

/**
 * Action performed when the coordinates for which to perform reverse geolocation change.
 */
interface CoordinatesUpdated {
    kind: "coordinates updated";
    payload: GeoCoordinates;
}

/**
 * Action performed when a Nominatim API request returns an error.
 */
interface ErrorOccurred {
    kind: "error occurred";
    payload: Timestamped<{
        error: unknown;
    }>;
}

/**
 * Action performed when a reverse geolocation request resolves to a place name.
 */
interface PlaceResolved {
    kind: "place resolved";
    payload: string;
}

/**
 * All actions supported by {@link ReverseGeolocationState.reduce}.
 */
export type ReverseGeolocationAction =
    | CoordinatesUpdated
    | ErrorOccurred
    | PlaceResolved;
