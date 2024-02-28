import _ from "lodash";
import { convertUnits, convertVariables } from "../../src/performance/PerformanceUtils";

describe("PerformanceUtils", () => {
  describe("convertUnits()", () => {
    it("converts celsius to fahrenheit", () => {
      expect(convertUnits(0, "degrees celsius", "degrees fahrenheit")).toBeCloseTo(32);
      expect(convertUnits(15, "degrees celsius", "degrees fahrenheit")).toBeCloseTo(59);
      expect(convertUnits(-40, "degrees celsius", "degrees fahrenheit")).toBeCloseTo(-40);
    });
    it("converts fahrenheit to celsius", () => {
      expect(convertUnits(32, "degrees fahrenheit", "degrees celsius")).toBeCloseTo(0);
      expect(convertUnits(59, "degrees fahrenheit", "degrees celsius")).toBeCloseTo(15);
      expect(convertUnits(-40, "degrees fahrenheit", "degrees celsius")).toBeCloseTo(-40);
    });
    it("converts feet to meters", () => {
      expect(convertUnits(1_000, "feet", "meters")).toBeCloseTo(304.8, 1);
    });
    it("converts meters to feet", () => {
      expect(convertUnits(15, "meters", "feet")).toBeCloseTo(49.2, 1);
    });
    it("converts pounds to kilograms", () => {
      expect(convertUnits(2646, "pounds", "kilograms")).toBeCloseTo(1200.2, 1);
    });
    it("converts kilograms to pounds", () => {
      expect(convertUnits(1200, "kilograms", "pounds")).toBeCloseTo(2645.5, 1);
    });
    it("throws a descriptive error if no conversion is provided", () => {
      expect(() => convertUnits(0, "degrees celsius", "kilograms")).toThrow("No conversion: degrees celsius to kilograms");
    });
  });
  describe("convertVariables()", () => {
    it("converts variables to match the units of the inputs", () => {
      const converted = convertVariables({
        obstacleHeight: {
          unit: "feet",
          value: 50,
        },
        outsideAirTemperature: {
          unit: "degrees fahrenheit",
          value: 59,
        },
        weight: {
          unit: "pounds",
          value: 2646,
        },
      }, {
        obstacleHeight: {
          unit: "meters",
          range: [0, 0],
        },
        outsideAirTemperature: {
          unit: "degrees celsius",
          range: [0, 0],
        },
        weight: {
          unit: "kilograms",
          range: [0, 0],
        },
      });
      expect(_.keys(converted).sort()).toEqual(["obstacleHeight", "outsideAirTemperature", "weight"]);
      expect(converted["obstacleHeight"].unit).toEqual("meters");
      expect(converted["obstacleHeight"].value).toBeCloseTo(15.2, 1);
      expect(converted["outsideAirTemperature"].unit).toEqual("degrees celsius");
      expect(converted["outsideAirTemperature"].value).toBeCloseTo(15);
      expect(converted["weight"].unit).toEqual("kilograms");
      expect(converted["weight"].value).toBeCloseTo(1200.2, 1);
    });
  });
});
