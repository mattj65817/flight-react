import {isModeSCode} from "../../src/tracking/tracking-types";

describe("tracking-types.ts", () => {
    describe("isModeSCode()", () => {
        test("Invalid Mode S code (uppercase)", () => {
            expect(isModeSCode("123ABC")).toBe(false);
        });
        test("Valid Mode S code", () => {
            expect(isModeSCode("123abc")).toBe(true);
        });
    });
});
