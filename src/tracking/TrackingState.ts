import {freeze, immerable, produce} from "immer";
import _ from "lodash";

import type {ModeSCode, Positions, Timestamped} from "./tracking-types";
import type {DurationLike} from "luxon";
import {DateTime} from "luxon";

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

    get interval() {
        return this.tracking ? this.trackingInterval : this.nonTrackingInterval;
    }

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
                    console.log("Interval", draft.interval);
                    draft.nextUpdate = timestamp.plus(draft.interval);
                    console.log(draft.nextUpdate.toISO());
                });
        }
    }
}

interface PositionsUpdated {
    kind: "positions updated";
    payload: Timestamped<{
        positions: Positions
    }>;
}

interface ErrorOccurred {
    kind: "error occurred";
    payload: Timestamped<{
        error: unknown;
    }>;
}

export type TrackingAction =
    | ErrorOccurred
    | PositionsUpdated;
