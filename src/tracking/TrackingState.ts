import {freeze, immerable, produce} from "immer";
import _ from "lodash";
import {DateTime, DurationLike} from "luxon";

import type {ModeSCode, Position, TrackingAction} from "./tracking-types";

type TrackingStateConfig = Omit<TrackingState, "positionsByModeSCode">;

class TrackingState {
    [immerable] = true;

    error?: unknown;
    modeSCodes: ModeSCode[];
    nonTrackingInterval: DurationLike;
    positionsByModeSCode: Record<ModeSCode, TrackingPosition> = {};
    trackingInterval: DurationLike;

    private constructor(config: TrackingStateConfig) {
        this.modeSCodes = config.modeSCodes;
        this.nonTrackingInterval = config.nonTrackingInterval;
        this.trackingInterval = config.trackingInterval;
    }

    /**
     * Create an initial {@link TrackingState}.
     *
     * @param config the initial property values.
     */
    static initial(config: TrackingStateConfig) {
        return freeze(new TrackingState(_.cloneDeep(config)));
    }

    static reduce(previous: TrackingState, {kind, payload}: TrackingAction) {
        switch (kind) {
            case "error occurred":
                return produce(previous, draft => {
                    draft.error = payload;
                });
            case "positions updated":
                return produce(previous, draft => {
                    delete draft.error;

                    /* Remove positions which are not present in the updated data. */
                    const {positions, timestamp} = payload;
                    const positionsByModeSCode = _.keyBy(positions, "modeSCode");
                    Object.keys(draft.positionsByModeSCode)
                        .filter(modeSCode => !Object.hasOwn(positionsByModeSCode, modeSCode))
                        .forEach(modeSCode => {
                            delete draft.positionsByModeSCode[modeSCode as ModeSCode];
                        });

                    /* Add or update positions which are present. */
                    Object.entries(positionsByModeSCode)
                        .forEach(([modeSCode, position]) => {
                            // const target = draft.positionsByModeSCode[modeSCode as Uppercase<string>];
                            // if (null != target) {
                            //
                            // }
                            if (Object.hasOwn(draft.positionsByModeSCode, modeSCode)) {
                                Object.assign(draft.positionsByModeSCode)
                            }
                            Object.assign(positionsByModeSCode[modeSCode] || {},
                                _.merge(_.omit(position, "modeSCode")),
                                {modeSCode, timestamp});
                        });
                });
        }
    }
}

interface TrackingPosition extends Position {
    modeSCode: ModeSCode;
    timestamp: DateTime;
}