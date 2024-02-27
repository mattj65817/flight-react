import type {GeoCoordinates} from "@mattj65817/aviation-js";

/**
 * Service which provides forward and/or reverse geolocation functions.
 */
export interface GeolocationService {

    /**
     * Given a set of geographic coordinates, perform reverse geolocation to determine a place name.
     *
     * @param coordinates the geographic coordinates.
     */
    getPlace(coordinates: GeoCoordinates): Promise<null | string>;
}
