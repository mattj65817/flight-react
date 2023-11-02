import {ADSBXClient} from "../../../src/tracking/adsbx/ADSBXClient";
import {DateTime} from "luxon";

describe("ADSBXClient", () => {
    test("Test", async () => {
        const client = ADSBXClient.create();
        const position = await client.getPositions(["a800d3", "a2dac0", "a9dc27", "a97172", "a3bafc", "a6aba5", "a3c73c", "a049da", "aa9b7b", "ada922", "ab0697"]);
        console.log(JSON.stringify(position, null, "  "));
        console.log(DateTime.fromMillis(position.now, {zone: "UTC"}).toISO());
    });
});
