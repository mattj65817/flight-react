import { WpdProject } from "../../../src/chart/chase/wpd";
import { WpdProjectDef } from "../../../src/chart/chase/wpd";
import { ChaseChartDef } from "../../../src/chart/chase/chase-types";

import cruiseAirspeedJson from "./da40-cruise-airspeed.json";
import cruiseAirspeedProjJson from "./wpd/da40-cruise-airspeed.wpd.json";
import landingDistanceFlapsUpJson from "./da40-landing-distance-flaps-up.json";
import landingDistanceFlapsUpProjJson from "./wpd/da40-landing-distance-flaps-up.wpd.json";
import landingDistanceJson from "./da40-landing-distance.json";
import landingDistanceProjJson from "./wpd/da40-landing-distance.wpd.json";
import takeoffClimbRateJson from "./da40-takeoff-climb-rate.json";
import takeoffClimbRateProjJson from "./wpd/da40-takeoff-climb-rate.wpd.json";
import takeoffDistanceJson from "./da40-takeoff-distance.json";
import takeoffDistanceProjJson from "./wpd/da40-takeoff-distance.wpd.json";
import { ChaseChart } from "../../../src/chart/chase";

describe("ChaseChart", () => {
  const src = new URL("https://bogus.com/chart.json");
  describe("create()", () => {
    const proj = WpdProject.create(takeoffDistanceProjJson as unknown as WpdProjectDef);
    const chart = ChaseChart.create(takeoffDistanceJson as unknown as ChaseChartDef, proj, src);
    it("correctly extracts inputs and outputs", () => {
      expect(chart.inputs).toEqual({
        obstacleHeight: {
          range: [0, 15],
          unit: "meters",
        },
        outsideAirTemperature: {
          range: [-20, 50],
          unit: "degrees celsius",
        },
        pressureAltitude: {
          range: [0, 10000],
          unit: "feet",
        },
        weight: {
          range: [850, 1200],
          unit: "kilograms",
        },
        windComponent: {
          range: [-5, 20],
          unit: "knots",
        },
      });
      expect(chart.outputs).toEqual({
        takeoffDistance: {
          unit: "meters",
        },
      });
    });
    it("throws an error if inputs are missing", () => {
      expect(() => chart.calculate({})).toThrow("Missing inputs: obstacleHeight, outsideAirTemperature, pressureAltitude, weight, windComponent");
    });
  });
  describe("calculate()", () => {
    describe("da40-cruise-airspeed.json", () => {
      const proj = WpdProject.create(cruiseAirspeedProjJson as unknown as WpdProjectDef);
      const chart = ChaseChart.create(cruiseAirspeedJson as unknown as ChaseChartDef, proj, src);
      it("calculates cruise airspeed", () => {
        const solution = chart.calculate({
          outsideAirTemperature: {
            value: 15,
            unit: "degrees celsius",
          },
          power: {
            value: 55,
            unit: "percent",
          },
          pressureAltitude: {
            value: 5_000,
            unit: "feet",
          },
        });
        const { vars: { trueAirspeed } } = solution;
        expect(trueAirspeed.unit).toEqual("knots");
        expect(trueAirspeed.value).toBeCloseTo(118.46);
      });
    });
    describe("da40-landing-distance.json", () => {
      const proj = WpdProject.create(landingDistanceProjJson as unknown as WpdProjectDef);
      const chart = ChaseChart.create(landingDistanceJson as unknown as ChaseChartDef, proj, src);
      it("calculates landing distance", () => {
        const solution = chart.calculate({
          obstacleHeight: {
            value: 15,
            unit: "meters",
          },
          outsideAirTemperature: {
            value: 15,
            unit: "degrees celsius",
          },
          pressureAltitude: {
            value: 2_000,
            unit: "feet",
          },
          weight: {
            value: 1_000,
            unit: "kilograms",
          },
          windComponent: {
            value: 10,
            unit: "knots",
          },
        });
        const { vars: { landingDistance } } = solution;
        expect(landingDistance.unit).toEqual("meters");
        expect(landingDistance.value).toBeCloseTo(422.70);
      });
    });
    describe("da40-landing-distance-flaps-up.json", () => {
      const proj = WpdProject.create(landingDistanceFlapsUpProjJson as unknown as WpdProjectDef);
      const chart = ChaseChart.create(landingDistanceFlapsUpJson as unknown as ChaseChartDef, proj, src);
      it("calculates flaps-up landing distance", () => {
        const solution = chart.calculate({
          obstacleHeight: {
            value: 15,
            unit: "meters",
          },
          outsideAirTemperature: {
            value: 10,
            unit: "degrees celsius",
          },
          pressureAltitude: {
            value: 4_000,
            unit: "feet",
          },
          weight: {
            value: 1_000,
            unit: "kilograms",
          },
          windComponent: {
            value: 10,
            unit: "knots",
          },
        });
        const { vars: { landingDistance } } = solution;
        expect(landingDistance.unit).toEqual("meters");
        expect(landingDistance.value).toBeCloseTo(567.51);
      });
    });
    describe("da40-takeoff-climb-rate.json", () => {
      const proj = WpdProject.create(takeoffClimbRateProjJson as unknown as WpdProjectDef);
      const chart = ChaseChart.create(takeoffClimbRateJson as unknown as ChaseChartDef, proj, src);
      it("calculates takeoff climb rate", () => {
        const solution = chart.calculate({
          outsideAirTemperature: {
            value: 15,
            unit: "degrees celsius",
          },
          pressureAltitude: {
            value: 2_000,
            unit: "feet",
          },
          weight: {
            value: 1_000,
            unit: "kilograms",
          },
        });
        const { vars: { climbRate } } = solution;
        expect(climbRate.unit).toEqual("feet per minute");
        expect(climbRate.value).toBeCloseTo(987.17);
      });
    });
    describe("da40-takeoff-distance.json", () => {
      const proj = WpdProject.create(takeoffDistanceProjJson as unknown as WpdProjectDef);
      const chart = ChaseChart.create(takeoffDistanceJson as unknown as ChaseChartDef, proj, src);
      it("calculates takeoff distance", () => {
        const solution = chart.calculate({
          obstacleHeight: {
            value: 15,
            unit: "meters",
          },
          outsideAirTemperature: {
            value: 15,
            unit: "degrees celsius",
          },
          pressureAltitude: {
            value: 2_000,
            unit: "feet",
          },
          weight: {
            value: 1_000,
            unit: "kilograms",
          },
          windComponent: {
            value: 10,
            unit: "knots",
          },
        });
        const { vars: { takeoffDistance } } = solution;
        expect(takeoffDistance.unit).toEqual("meters");
        expect(takeoffDistance.value).toBeCloseTo(304.48);
      });
    });
  });
});
