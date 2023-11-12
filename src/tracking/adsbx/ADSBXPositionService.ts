import {freeze, immerable} from "immer";
import {ADSBXClient} from "./ADSBXClient";
import {ADSBXParser} from "./ADSBXParser";

import type {ModeSCode, PositionService} from "../tracking-types";

/**
 * {@link ADSBXPositionService} is an implementation of the {@link PositionService} interface which uses a service
 * provider implementing the ADSBX v2 API, such as {@link https://adsb.fi adsb.fi} to retrieve aircraft positions.
 */
export class ADSBXPositionService implements PositionService {
    [immerable] = true;

    private constructor(private readonly client: ADSBXClient, private readonly parser: ADSBXParser) {
    }

    async getPositionsByModeSCodes(ids: ModeSCode[]) {
        const response = await this.client.getPositionsByModeSCodes(ids);
        return this.parser.parsePositions(response);
    }

    /**
     * Create an {@link ADSBXPositionService} instance.
     *
     * @param client the API client.
     * @param parser the API response parser.
     */
    static create(client: ADSBXClient, parser: ADSBXParser = ADSBXParser.INSTANCE) {
        return freeze(new ADSBXPositionService(client, parser));
    }
}
