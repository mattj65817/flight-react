import { convertUnits, convertVariables } from "./PerformanceUtils";
import { isVectorCalculation } from "./performance-types";
import type {
  AltitudeUnit,
  AnyUnit,
  DistanceUnit,
  PerformanceCalculator,
  PerformanceVariables,
  PowerUnit,
  Calculation,
  TemperatureUnit,
  VectorCalculation,
} from "./performance-types";

/* Module exports. */
export {
  AltitudeUnit,
  AnyUnit,
  DistanceUnit,
  PerformanceCalculator,
  PerformanceVariables,
  PowerUnit,
  Calculation,
  TemperatureUnit,
  VectorCalculation,
  convertUnits,
  convertVariables,
  isVectorCalculation,
};
