import {freeze, immerable, produce} from "immer";
import _ from "lodash";
import {DateTime} from "luxon";

import type {Position} from "./position-types";

/**
 * {@link PositionState} holds backing state for an {@link PositionProvider} component.
 */
export class PositionState {
    [immerable] = true;

    /**
     * Aircraft positions, if known.
     */
    positions: Record<Lowercase<string>, Position> = {};

    /**
     * Time at which positions were last updated.
     */
    updated: DateTime = DateTime.fromSeconds(0, {zone: "UTC"});

    private constructor(readonly modeSCodes: Lowercase<string>[]) {

    }

    /**
     * Create an initial {@link PositionState}.
     *
     * @param modeSCodes the Mode S codes of aircraft whose positions are to be tracked.
     */
    static initial(modeSCodes: Lowercase<string>[]) {
        return freeze(new PositionState(_.uniq(modeSCodes).sort()));
    }

    /**
     * Reducer for {@link PositionAction} on an {@link PositionState}.
     *
     * @param previous the previous state.
     * @param action the action.
     */
    static reduce(previous: PositionState, action: PositionAction): PositionState {
        const {kind} = action;
        switch (kind) {
            case "position update failed":
                return produce(previous, draft => {
                    draft.updated = action.payload.failed;
                });
            case "position updated":
                return produce(previous, draft => {
                    const {payload: {updated, positions}} = action;
                    draft.updated = updated;

                    /* Remove aircraft for which we did not receive a position. */
                    _.keys(draft.positions)
                        .map(key => key as Lowercase<string>)
                        .forEach(modeSCode => {
                            if (!Object.hasOwn(positions, modeSCode)) {
                                delete draft.positions[modeSCode];
                            }
                        });

                    /* Add or update aircraft for which we did receive a position. */
                    _.keys(positions)
                        .map(key => key as Lowercase<string>)
                        .forEach(modeSCode => {
                            if (_.includes(draft.modeSCodes, modeSCode)) {
                                draft.positions[modeSCode] = positions[modeSCode];
                            }
                        });
                });
        }
    }
}

/**
 * Aircraft position(s) updated successfully.
 */
interface PositionUpdated {
    kind: "position updated";
    payload: {
        updated: DateTime;
        positions: Record<Lowercase<string>, Position>;
    };
}

/**
 * Attempt to update aircraft position(s) failed with an error.
 */
interface PositionUpdateFailed {
    kind: "position update failed";
    payload: {
        failed: DateTime;
        error: any;
    }
}

/**
 * Actions supported by {@link PositionState.reduce}.
 */
type PositionAction =
    | PositionUpdateFailed
    | PositionUpdated;
