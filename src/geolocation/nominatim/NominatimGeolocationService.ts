import {freeze, immerable} from "immer";
import {NominatimClient} from "./NominatimClient";

import type {GeoCoordinates} from "../../flight-types";
import type {GeolocationService} from "../geolocation-types";

export class NominatimGeolocationService implements GeolocationService {
    [immerable] = true;

    private constructor(private readonly client: NominatimClient) {
    }

    getPlace(coordinates: GeoCoordinates): Promise<string | null> {
        return this.client.getPlace(coordinates);
    }

    static create(client: NominatimClient) {
        return freeze(new NominatimGeolocationService(client));
    }
}
