/**
 * Configuration for the Nominatim geolocation service.
 */
export interface NominatimConfig {

    /**
     * Nominatim base URL, such as `https://nominatim.openstreetmap.org/`.
     */
    baseURL: URL;
}

/**
 * Significant items from a reverse geocode query for a place.
 */
export interface NominatimPlace {
    place_id: string;
    licence: string;
    display_name: string;
    address: {
        city?: string;
        county: string;
        hamlet?: string;
        municipality?: string;
        state: string;
        town?: string;
        village?: string;
        "ISO3166-2-lvl4": string;
        country: string;
        country_code: string;
    }
}

/**
 * Nominatim API response contents.
 */
export type NominatimResponse =
    | NominatimError
    | NominatimPlace;

/**
 * Type guard to determine whether a Nominatim API response indicates that an error occurred.
 *
 * @param value the value to check.
 */
export function isNominatimError(value: unknown): value is NominatimError {
    return null != value
        && "object" === typeof value
        && "error" in value
        && "string" === typeof value.error;
}

/**
 * Error response from a Nominatim API, comes back as a `200 OK`.
 */
interface NominatimError {

    /**
     * Error message.
     */
    error: string;
}
