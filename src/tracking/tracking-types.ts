import {DateTime} from "luxon";

export type GeoCoords = [
    latitude: number,
    longitude: number
];

export type ModeSCode = Lowercase<string>;

export type TrackingAction =
    | ErrorOccurred
    | PositionsUpdated;

export interface Position {
    altitude: "ground" | number;
    coordinates: [
        latitude: number,
        longitude: number
    ];
    velocity?: {
        horizontal: number;
        vertical?: number;
    }
}

interface PositionsUpdated {
    kind: "positions updated";
    payload: {
        positions: (Position & { modeSCode: ModeSCode })[];
        timestamp: DateTime;
    }
}

interface ErrorOccurred {
    kind: "error occurred";
    payload: unknown;
}

/**
 * Type guard for {@link ModeSCode}.
 *
 * @param value the value to check.
 */
export function isModeSCode(value: unknown): value is ModeSCode {
    return "string" === typeof value
        && /[0-9a-f]{6}/g.test(value);
}
