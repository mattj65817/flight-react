import {Flow} from "../../src/chart/Flow";

describe("Flow", () => {
    describe("compare()", () => {
        it("should compare correctly for flow: DOWN", () => {
            expect(Flow.DOWN.compare([3, 1], [1, 3])).toBeLessThan(0);
            expect(Flow.DOWN.compare([1, 3], [3, 1])).toBeGreaterThan(0);
            expect(Flow.DOWN.compare([1, 3], [3, 3])).toEqual(0);
        });
        it("should compare correctly for flow: LEFT", () => {
            expect(Flow.LEFT.compare([1, 3], [3, 1])).toBeGreaterThan(0);
            expect(Flow.LEFT.compare([3, 1], [1, 3])).toBeLessThan(0);
            expect(Flow.LEFT.compare([3, 1], [3, 3])).toEqual(0);
        });
        it("should compare correctly for flow: RIGHT", () => {
            expect(Flow.RIGHT.compare([1, 3], [3, 1])).toBeLessThan(0);
            expect(Flow.RIGHT.compare([3, 1], [1, 3])).toBeGreaterThan(0);
            expect(Flow.RIGHT.compare([3, 1], [3, 3])).toEqual(0);
        });
        it("should compare correctly for flow: UP", () => {
            expect(Flow.UP.compare([3, 1], [1, 3])).toBeGreaterThan(0);
            expect(Flow.UP.compare([1, 3], [3, 1])).toBeLessThan(0);
            expect(Flow.UP.compare([1, 3], [3, 3])).toEqual(0);
        });
    });
    describe("position()", () => {
        it("should extract correctly for flow: DOWN", () => {
            expect(Flow.DOWN.position([1, 2])).toEqual(2);
        });
        it("should extract correctly for flow: LEFT", () => {
            expect(Flow.LEFT.position([1, 2])).toEqual(1);
        });
        it("should extract correctly for flow: RIGHT", () => {
            expect(Flow.RIGHT.position([1, 2])).toEqual(1);
        });
        it("should extract correctly for flow: UP", () => {
            expect(Flow.UP.position([1, 2])).toEqual(2);
        });
    });
    describe("sort()", () => {
        it("should sort correctly for flow: DOWN", () => {
            expect(Flow.DOWN.sort([[1, 3], [2, 2], [3, 1]])).toEqual([[3, 1], [2, 2], [1, 3]]);
        });
        it("should sort correctly for flow: LEFT", () => {
            expect(Flow.LEFT.sort([[1, 3], [2, 2], [3, 1]])).toEqual([[3, 1], [2, 2], [1, 3]]);
        });
        it("should sort correctly for flow: RIGHT", () => {
            expect(Flow.RIGHT.sort([[1, 3], [2, 2], [3, 1]])).toEqual([[1, 3], [2, 2], [3, 1]]);
        });
        it("should sort correctly for flow: DOWN", () => {
            expect(Flow.UP.sort([[1, 3], [2, 2], [3, 1]])).toEqual([[1, 3], [2, 2], [3, 1]]);
        });
    });
    describe("value()", () => {
        it("should extract correctly for flow: DOWN", () => {
            expect(Flow.DOWN.value([1, 2])).toEqual(1);
        });
        it("should extract correctly for flow: LEFT", () => {
            expect(Flow.LEFT.value([1, 2])).toEqual(2);
        });
        it("should extract correctly for flow: RIGHT", () => {
            expect(Flow.RIGHT.value([1, 2])).toEqual(2);
        });
        it("should extract correctly for flow: UP", () => {
            expect(Flow.UP.value([1, 2])).toEqual(1);
        });
    });
});
