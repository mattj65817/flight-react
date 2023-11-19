import {DateTime} from "luxon";
import {AxiosInstance, CreateAxiosDefaults} from "axios";

/**
 * Factory function for creating Axios instances with merged configuration.
 */
export type AxiosFactory = (config?: CreateAxiosDefaults) => AxiosInstance;

/**
 * Geographic coordinates (2-dimensional.)
 */
export type GeoCoordinates = [
    latitude: number,
    longitude: number
];

/**
 * Generic object with an associated `kind` attribute.
 */
export type Kinded<T extends object, K extends string> = T & { kind: K };

/**
 * Generic object with an associated timestamp.
 */
export type Timestamped<T extends object> = T & { timestamp: DateTime };
