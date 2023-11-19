import {GeoCoordinates} from "../flight-types";

/**
 * Hexadecimal Mode S code.
 */
export type ModeSCode = Lowercase<string>;

/**
 * Hash of positions keyed on hexadecimal Mode S code.
 */
export type Positions = {
    [K in ModeSCode]: {
        altitude: "ground" | number;
        coordinates: GeoCoordinates;
        track?: number;
        velocity?: {
            horizontal: number;
            vertical?: number;
        }
    };
}

/**
 * Service which provides aircraft positions, typically an ADS-B aggregator.
 */
export interface PositionService {

    /**
     * Get current positions for zero or more aircraft based on Mode C hex code.
     *
     * The returned {@link Positions} object may not contain an entry for *every* aircraft present in the Mode S code
     * list; typically only aircraft that are currently in flight (or in a ground-tracked area) are returned.
     *
     * @param ids the Mode C hex codes.
     */
    getPositions(ids: ModeSCode[]): Promise<Positions>;
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
