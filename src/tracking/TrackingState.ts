import {freeze, immerable, produce} from "immer";
import _ from "lodash";
import {DateTime} from "luxon";

import type {DurationLike} from "luxon";
import type {Timestamped} from "../flight-types";
import type {ModeSCode, Positions} from "./tracking-types";

/**
 * Configuration for creating an initial {@link TrackingState}.
 */
export type TrackingStateConfig = Omit<TrackingState, "error" | "interval" | "nextUpdate" | "positions" | "tracking" | typeof immerable>;

/**
 * {@link TrackingState} holds the current state
 */
export class TrackingState {
    [immerable] = true;

    error?: Timestamped<{
        error: unknown;
    }>;
    ids: ModeSCode[];
    nextUpdate = DateTime.utc();
    nonTrackingInterval: DurationLike;
    positions: { [K in ModeSCode]: Timestamped<Positions[ModeSCode]> } = {};
    trackingInterval: DurationLike;

    private constructor(config: TrackingStateConfig) {
        this.ids = _.uniq(config.ids).sort();
        this.nonTrackingInterval = config.nonTrackingInterval;
        this.trackingInterval = config.trackingInterval;
    }

    /**
     * Current update interval, {@link TrackingState.nonTrackingInterval} if at least one aircraft is being actively
     * tracked, else {@link TrackingState.trackingInterval}.
     */
    get interval() {
        const {nonTrackingInterval, tracking, trackingInterval} = this;
        return tracking ? trackingInterval : nonTrackingInterval;
    }

    /**
     * Flag indicating whether at least one aircraft is being actively tracked.
     */
    get tracking() {
        return 0 !== Object.keys(this.positions).length;
    }

    /**
     * Create an initial {@link TrackingState}.
     *
     * @param config the initial property values.
     */
    static initial(config: TrackingStateConfig) {
        return freeze(new TrackingState(_.cloneDeep(config)));
    }

    /**
     * Reducer for {@link TrackingAction} against a {@link TrackingState}.
     *
     * @param previous the previous state.
     * @param kind the action kind.
     * @param payload the action payload.
     */
    static reduce(previous: TrackingState, {kind, payload}: TrackingAction) {
        switch (kind) {
            case "error occurred":
                return produce(previous, draft => {
                    draft.error = _.cloneDeep(payload);
                    draft.positions = {};
                    draft.nextUpdate = payload.timestamp.plus(draft.nonTrackingInterval);
                });
            case "ids updated":
                return produce(previous, draft => {
                    delete draft.error;

                    /* Do nothing unless the list has actually changed. */
                    const uniqueIds = _.uniq(payload).sort();
                    if (!_.isEqual(draft.ids, uniqueIds)) {

                        /* Update the list of IDs to track. */
                        const removedIds = _.remove(draft.ids, id => -1 === payload.indexOf(id));
                        draft.ids.push(..._.difference(uniqueIds, draft.ids));
                        draft.ids.sort();

                        /* Remove positions for aircraft which are no longer tracked. */
                        removedIds.forEach(idString => {
                            const id = idString as ModeSCode;
                            if (-1 === payload.indexOf(id)) {
                                delete draft.positions[id];
                            }
                        });
                        draft.nextUpdate = DateTime.utc();
                    }
                });
            case "positions updated":
                return produce(previous, draft => {
                    delete draft.error;

                    /* Remove positions which are not present in the updated data. */
                    const {positions, timestamp} = payload;
                    Object.keys(draft.positions)
                        .filter(id => !Object.hasOwn(positions, id))
                        .forEach(id => delete draft.positions[id as ModeSCode]);

                    /* Add or update positions which are present in the updated data. */
                    Object.entries(positions)
                        .forEach(([idString, position]) => {
                            const id = idString as ModeSCode;
                            if (-1 !== draft.ids.indexOf(id)) {
                                draft.positions[id] = Object.assign(draft.positions[id] || {}, position, {timestamp});
                            }
                        });
                    draft.nextUpdate = timestamp.plus(draft.interval);
                });
        }
    }
}

/**
 * Action performed when an ADSB-X API request returns an error.
 */
interface ErrorOccurred {
    kind: "error occurred";
    payload: Timestamped<{
        error: unknown;
    }>;
}

/**
 * Action performed when the list of aircraft IDs to track changes.
 */
interface IdsUpdated {
    kind: "ids updated",
    payload: ModeSCode[]
}

/**
 * Action performed when an ADSB-X API request returns updated aircraft positions.
 */
interface PositionsUpdated {
    kind: "positions updated";
    payload: Timestamped<{
        positions: Positions
    }>;
}

/**
 * All actions supported by {@link TrackingState.reduce}.
 */
export type TrackingAction =
    | ErrorOccurred
    | IdsUpdated
    | PositionsUpdated;
