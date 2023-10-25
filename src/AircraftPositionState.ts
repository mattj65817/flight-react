import _ from "lodash";
import {freeze, immerable, produce} from "immer";
import {DateTime} from "luxon";
import {AircraftPosition} from "./flight-types";

/**
 * {@link AircraftPositionState} holds backing state for an {@link AircraftPositionProvider} component.
 */
export class AircraftPositionState {
    [immerable] = true;

    /**
     * Aircraft positions, if known.
     */
    positions: Record<Lowercase<string>, AircraftPosition> = {};

    /**
     * Time at which positions were last updated.
     */
    updated: DateTime = DateTime.fromSeconds(0, {zone: "UTC"});

    private constructor(readonly modeSCodes: Lowercase<string>[]) {

    }

    /**
     * Create an initial {@link AircraftPositionState}.
     *
     * @param modeSCodes the Mode S codes of aircraft whose positions are to be tracked.
     */
    static initial(modeSCodes: Lowercase<string>[]) {
        return freeze(new AircraftPositionState(_.uniq(modeSCodes).sort()));
    }

    /**
     * Reducer for {@link AircraftPositionAction} on an {@link AircraftPositionState}.
     *
     * @param previous the previous state.
     * @param action the action.
     */
    static reduce(previous: AircraftPositionState, action: AircraftPositionAction): AircraftPositionState {
        const {kind} = action;
        switch (kind) {
            case "update positions":
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
 * Update aircraft positions.
 */
interface UpdatePositions {
    kind: "update positions";
    payload: {
        updated: DateTime;
        positions: Record<Lowercase<string>, AircraftPosition>;
    };
}

/**
 * Actions supported by {@link AircraftPositionState.reduce}.
 */
type AircraftPositionAction =
    | UpdatePositions;
