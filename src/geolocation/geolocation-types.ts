import {GeoCoordinates} from "../flight-types";

/**
 * Service which provides forward and/or reverse geolocation functions.
 */
export interface GeolocationService {

    /**
     * Given a set of geographic coordinates, perform reverse geolocation to determine a place name.
     *
     * @param coordinates the geographic coordinates.
     */
    getLocation(coordinates: GeoCoordinates): Promise<null | string>;
}
