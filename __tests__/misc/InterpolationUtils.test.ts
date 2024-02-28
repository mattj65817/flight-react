import { pickAdjacent } from "../../src/misc";

describe("InterpolationUtils", () => {
  describe("pickAdjacent()", () => {
    it("returns the first entry if out of range low", () => {
      const entries = [
        { value: 100 },
        { value: 200 },
      ];
      const [index, adjacent] = pickAdjacent(entries, "value", 0);
      expect(index).toEqual(0);
      expect(adjacent[0]).toBe(entries[0]);
    });
    it("returns the last entry if out of range high", () => {
      const entries = [
        { value: 100 },
        { value: 200 },
      ];
      const [index, adjacent] = pickAdjacent(entries, "value", 300);
      expect(index).toEqual(1);
      expect(adjacent[0]).toBe(entries[1]);
    });
    it("returns a single entry if exact match", () => {
      const entries = [
        { value: 100 },
        { value: 200 },
      ];
      const [index, adjacent] = pickAdjacent(entries, "value", 200);
      expect(index).toEqual(1);
      expect(adjacent[0]).toBe(entries[1]);
    });
    it("returns two adjacent entries if between", () => {
      const entries = [
        { value: 100 },
        { value: 200 },
      ];
      const [index, adjacent] = pickAdjacent(entries, "value", 150);
      expect(index).toEqual(0);
      expect(adjacent.length).toBe(2);
      expect(adjacent[0]).toBe(entries[0]);
      expect(adjacent[1]).toBe(entries[1]);
    });
  });
});
