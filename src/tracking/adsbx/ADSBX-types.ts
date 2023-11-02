import {isModeSCode, ModeSCode} from "../tracking-types";

/**
 * Altitude, either on ground or feet MSL.
 */
export interface ADSBXAltitude {
    alt_baro: "ground" | number;
}

/**
 * Geographic coordinates.
 */
export interface ADSBXCoords {
    lat: number;
    lon: number;
}

/**
 * Track vector, with heading and horizontal and/or vertical speeds.
 */
export interface ADSBXTrack {
    baro_rate?: number;
    gs: number;
    track: number;
}

/**
 * Error response from an ADSBX v2 request.
 */
export interface ADSBXErrorResponse {
    msg: Exclude<string, "No error">;
}

/**
 * Success response from an ADSBX v2 position query.
 */
export interface ADSBXPositionResponse {
    ac: {
        hex: ModeSCode
    }[],
    ctime: number;
    msg: "No error";
    now: number;
    total: number;
}

/**
 * Type guard for {@link ADSBXAltitude}.
 *
 * @param value the value to check.
 */
export function isADSBXAltitude(value: unknown): value is ADSBXAltitude {
    return null != value
        && "object" === typeof value
        && "alt_baro" in value
        && ("ground" === value.alt_baro || "number" === typeof value.alt_baro);
}

/**
 * Type guard for {@link ADSBXCoords}.
 *
 * @param value the value to check.
 */
export function isADSBXCoords(value: unknown): value is ADSBXCoords {
    return null != value
        && "object" === typeof value
        && "lat" in value
        && "lon" in value
        && "number" === typeof value.lat
        && "number" === typeof value.lon;
}

/**
 * Type guard for {@link ADSBXErrorResponse}.
 *
 * @param value the value to check.
 */
export function isADSBXErrorResponse(value: unknown): value is ADSBXErrorResponse {
    return null != value
        && "object" === typeof value
        && "msg" in value
        && "No error" !== value.msg;
}

/**
 * Type guard for {@link ADSBXPositionResponse}.
 *
 * @param value the value to check.
 */
export function isADSBXPositionResponse(value: unknown): value is ADSBXPositionResponse {
    return !isADSBXErrorResponse(value)
        && null != value
        && "object" === typeof value
        && "ac" in value
        && "now" in value
        && "total" in value
        && "number" === typeof value.now
        && "number" === typeof value.total
        && Array.isArray(value.ac)
        && value.ac.reduce((acc, next) =>
            acc
            && "object" === typeof next
            && "hex" in next
            && isModeSCode(next.hex), true);
}

/**
 * Type guard for {@link ADSBXTrack}.
 *
 * @param value the value to check.
 */
export function isADSBXTrack(value: unknown): value is ADSBXTrack {
    return null != value
        && "object" === typeof value
        && (!("baro_rate" in value) || "number" === typeof value.baro_rate)
        && "gs" in value
        && "track" in value
        && "number" === typeof value.gs
        && "number" === typeof value.track;
}
