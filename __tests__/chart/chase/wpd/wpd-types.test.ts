import projectJson from "./da40-takeoff-distance.wpd.json";
import { isWpdProject } from "../../../../src/chart/chase/wpd/wpd-types";

describe("wpd-types", () => {
  describe("isWpdProject()", () => {
    it("correctly identifies a valid WPD project", () => {
      expect(isWpdProject(projectJson)).toBe(true);
    });
  });
});
