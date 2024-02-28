import _ from "lodash";
import { WpdProject } from "../../../../src/chart/chase/wpd";
import { WpdProjectDef } from "../../../../src/chart/chase/wpd/wpd-types";

import projectJson from "./da40-takeoff-distance.wpd.json";

describe("WpdProject", () => {
  describe("range()", () => {
    const proj = WpdProject.create(projectJson as unknown as WpdProjectDef);
    it("correctly extracts guides", () => {
      expect(_.keys(proj.guides).sort()).toEqual([
        "headwindComponentCorrection",
        "obstacleHeightCorrection",
        "tailwindComponentCorrection",
        "weightCorrection",
      ]);
    });
    it("correctly extracts scales", () => {
      expect(_.keys(proj.scales).sort()).toEqual([
        "obstacleHeight",
        "outsideAirTemperature",
        "pressureAltitude",
        "takeoffDistance",
        "weight",
        "windComponent",
      ]);
      expect(proj.range("obstacleHeight")).toEqual([0, 15]);
      expect(proj.range("outsideAirTemperature")).toEqual([-20, 50]);
      expect(proj.range("pressureAltitude")).toEqual([0, 10_000]);
      expect(proj.range("takeoffDistance")).toEqual([100, 1400]);
      expect(proj.range("weight")).toEqual([850, 1200]);
      expect(proj.range("windComponent")).toEqual([-5, 20]);
    });
  });
});
