import {contact} from "../../src/geometry";

describe("GeometryUtils", () => {
    describe("contact()", () => {
        it("should return abutting paths", () => {
            expect(contact([[1, 1], [1, 2]], [[1, 2], [1, 3]])).toEqual([1, 2]);
            expect(contact([[1, 2], [1, 3]], [[1, 1], [1, 2]])).toEqual([1, 2]);
            expect(contact([[1, 1], [2, 1]], [[2, 1], [3, 1]])).toEqual([2, 1]);
        });
        it("should return intersecting paths", () => {
            expect(contact([[1, 1], [2, 2]], [[1, 2], [2, 1]])).toEqual([1.5, 1.5]);
        });
        it("should return undefined for paths that do not abut or intersect", () => {
            expect(contact([[1, 1], [1, 2]], [[2, 1], [2, 2]])).toBeUndefined();
        });
    });
});
