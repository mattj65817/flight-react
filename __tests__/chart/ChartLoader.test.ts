import { ChartLoader } from "../../src/chart";
import { isPerformanceCalculator, PerformanceCalculator } from "../../src/performance/performance-types";

import cruiseAirspeedJson from "./chase/da40-cruise-airspeed.json";
import cruiseAirspeedProjJson from "./chase/wpd/da40-cruise-airspeed.wpd.json";

describe("ChartLoader", () => {
  describe("load()", () => {
    const instance = ChartLoader.create(new URL("http://localhost"), fetchTestJson);
    it("loads the cruise-airspeed chart", async () => {
      const chart = await instance.load("http://localhost/cruise-airspeed.json");
      expect(isPerformanceCalculator(chart)).toBe(true);
      expect(chart.meta.src.href).toEqual("http://localhost/cruise-airspeed.json");
      expect(chart.meta.image.src.href).toEqual("http://localhost/cruise-airspeed.png");
      expect(chart.meta.image.size).toEqual([978, 692]);
      const solution = (chart as unknown as PerformanceCalculator).calculate({
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
});

function fetchTestJson<B>(url: URL): Promise<B> {
  switch (url.href) {
    case "http://localhost/cruise-airspeed.json":
      return Promise.resolve(cruiseAirspeedJson) as Promise<B>;
    case "http://localhost/cruise-airspeed.wpd.json":
      return Promise.resolve(cruiseAirspeedProjJson) as Promise<B>;
    default:
      throw Error("Unsupported URL.");
  }
}
