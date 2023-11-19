import {freeze, immerable} from "immer";
import {NominatimClient} from "./NominatimClient";

import type {GeoCoordinates} from "../../flight-types";
import type {GeolocationService} from "../geolocation-types";

export class NominatimGeolocationService implements GeolocationService {
    [immerable] = true;

    private constructor(private readonly client: NominatimClient) {
    }

    getLocation(coordinates: GeoCoordinates): Promise<string | null> {
        throw "TODO";
    }

    static create(client: NominatimClient) {
        return freeze(new NominatimGeolocationService(client));
    }
}
