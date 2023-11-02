import {DateTime} from "luxon";

/**
 * Type guard for [AircraftPosition].
 *
 * @param value the value to check.
 */
export function isAircraftPosition(value: unknown): value is Position {
    return null != value
        && "object" === typeof value
        && "coordinates" in value
        && "method" in value
        && "timestamp" in value
        && "track" in value
        && Array.isArray(value.coordinates)
        && 2 === value.coordinates.length
        && "number" === typeof value.coordinates[0]
        && "number" === typeof value.coordinates[1]
        && -1 !== ["observed", "projected"].indexOf(value.method as string)
        && value.timestamp instanceof DateTime
        && "number" === typeof value.track;
}

/**
 * Position of an aircraft that is in flight.
 */
export interface FlightPosition {
    altitude: number | null;
    coordinates: [
        latitude: number,
        longitude: number
    ];
    method:
        | "observed"
        | "projected";
    timestamp: DateTime;
    track: number;
    velocity?: {
        horizontal: number;
        vertical?: number;
    };
}

/**
 * Position of an aircraft that is on the ground.
 */
export interface GroundPosition {
    coordinates: [
        latitude: number,
        longitude: number
    ];
    method:
        | "observed"
        | "projected";
    timestamp: DateTime;
    track: number;
    velocity?: {
        horizontal: number;
    };
}

/**
 * Type guard for [FlightPosition].
 *
 * @param value the value to check.
 */
export function isFlightPosition(value: unknown): value is FlightPosition {
    return isAircraftPosition(value) && "altitude" in value;
}

/**
 * Type guard for [GroundPosition].
 *
 * @param value the value to check.
 */
export function isGroundPosition(value: unknown): value is GroundPosition {
    return isAircraftPosition(value) && !isFlightPosition(value);
}

/**
 * Position of an aircraft, whether it is in on the ground or in flight.
 */
export type Position =
    | FlightPosition
    | GroundPosition;

/**
 * Public interface to an object which interfaces with an aircraft position service provider.
 */
export interface PositionService {

    /**
     * Get the positions of zero or more aircraft.
     *
     * @param modeSCodes the Mode S codes (lowercase hex) of the aircraft.
     * @return {@link Record} of aircraft positions keyed on Mode S code.
     */
    getPositions(modeSCodes: Lowercase<string>[]): Promise<Record<Lowercase<string>, Position>>;
}
