import {readJsonResource} from "@mattj65817/test-js";
import {ADSBXParser} from "../../../src/tracking/adsbx/ADSBXParser";
import {ADSBXPositionResponse} from "../../../src/tracking/adsbx/ADSBX-types";

describe("ADSBXv2Parser", () => {
    const instance = ADSBXParser.create();
    describe("parsePositions()", () => {
        test("", async () => {
            const source = await readJsonResource<ADSBXPositionResponse>(__dirname, "./ADSBX-positions-response.json");
            const parsed = instance.parsePositions(source);
            console.dir(parsed);
        });
    });
});
