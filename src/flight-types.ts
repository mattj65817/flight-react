import { DateTime } from "luxon";
import { AxiosInstance, CreateAxiosDefaults } from "axios";

/**
 * Geographic coordinates.
 */
export type GeoCoordinates = [latitude: number, longitude: number];

/**
 * Factory function for creating Axios instances with merged configuration.
 */
export type AxiosFactory = (config?: CreateAxiosDefaults) => AxiosInstance;

/**
 * Generic object with an associated `kind` attribute.
 */
export type Kinded<T extends object, K extends string> = T & { kind: K };

/**
 * Generic object with an associated timestamp.
 */
export type Timestamped<T extends object> = T & { timestamp: DateTime<true> };
