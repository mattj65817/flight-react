import { contact, interpolatePath, sortPath } from "../../src/geometry";

import type { Path } from "../../src/geometry";

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
  describe("interpolatePath()", () => {
    it("should return the first path if factor is 0", () => {
      const original: Path = [[1, 1], [1, 2], [1, 3]];
      expect(interpolatePath(original, [[2, 1], [2, 2], [2, 3]], "right", 0)).toBe(original);
    });
    it("should return the second path if factor is 1", () => {
      const original: Path = [[2, 1], [2, 2], [2, 3]];
      expect(interpolatePath([[1, 1], [1, 2], [1, 3]], original, "right", 1)).toBe(original);
    });
    it("should interpolate between paths in direction: down", () => {
      expect(interpolatePath([[1, 1], [1, 2]], [[2, 1], [2, 2]], "down", 0.25))
        .toEqual([[1.25, 1], [1.25, 2]]);
    });
    it("should interpolate between paths in direction: left", () => {
      expect(interpolatePath([[1, 1], [2, 1]], [[1, 2], [2, 2]], "left", 0.5))
        .toEqual([[2, 1.5], [1, 1.5]]);
    });
    it("should interpolate between paths in direction: right", () => {
      expect(interpolatePath([[1, 1], [2, 1]], [[1, 2], [2, 2]], "right", 0.75))
        .toEqual([[1, 1.75], [2, 1.75]]);
    });
    it("should interpolate between paths in direction: up", () => {
      expect(interpolatePath([[1, 1], [1, 2]], [[2, 1], [2, 2]], "up", 0.5))
        .toEqual([[1.5, 2], [1.5, 1]]);
    });
    it("should interpolate between staggered paths", () => {
      expect(interpolatePath([[1, 1], [2, 1], [3, 1]], [[1.5, 2], [2.5, 2], [3.5, 2]], "right", 0.5))
        .toEqual([[1.5, 1.5], [2, 1.5], [2.5, 1.5], [3, 1.5]]);
    });
  });
  describe("sortPath()", () => {
    it("sorts a path in direction: down", () => {
      expect(sortPath([[2, 1], [2, 2], [2, 0]], "down")).toEqual([[2, 0], [2, 1], [2, 2]]);
    });
    it("sorts a path in direction: left", () => {
      expect(sortPath([[1, 2], [2, 2], [0, 2]], "left")).toEqual([[2, 2], [1, 2], [0, 2]]);
    });
    it("sorts a path in direction: right", () => {
      expect(sortPath([[1, 2], [2, 2], [0, 2]], "right")).toEqual([[0, 2], [1, 2], [2, 2]]);
    });
    it("sorts a path in direction: up", () => {
      expect(sortPath([[2, 1], [2, 2], [2, 0]], "up")).toEqual([[2, 2], [2, 1], [2, 0]]);
    });
  });
});
