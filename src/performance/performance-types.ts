import { Path } from "../geometry";
import _ from "lodash";

/**
 * {@link PerformanceCalculator} defines the public interface to an object which wraps a performance chart or grid and
 * performs performance calculations based on the data it contains.
 */
export interface PerformanceCalculator {

  /**
   * Inputs required by the calculator.
   */
  readonly inputs: {
    [name in VariableName]: {
      unit: AnyUnit;
      range: [min: number, max: number];
    }
  };

  /**
   * Outputs produced by the calculator.
   */
  readonly outputs: {
    [name in VariableName]: {
      unit: AnyUnit;
    }
  };

  /**
   * Calculate outputs for a given set of inputs.
   *
   * @param vars the variables.
   */
  calculate(vars: PerformanceVariables): Calculation;
}

/**
 * {@link Calculation} holds the result of a performance calculation.
 */
export interface Calculation {

  /**
   * Outputs produced by the calculation *and* inputs variables used in the calculation.
   */
  vars: PerformanceVariables;
}

/**
 * {@link VectorCalculation} holds the result of a performance calculation which was performed using vectors across a
 * chart, such as an aviation chase-around chart.
 */
export interface VectorCalculation extends Calculation {

  /**
   * Guides, such as gridlines and scales, which were used in the calculation.
   */
  guides: Path[];

  /**
   * Vectors in the calculation.
   */
  vectors: Path[];
}

/**
 * Any performance-related unit.
 */
export type AnyUnit =
  | AltitudeUnit
  | DistanceUnit
  | PowerUnit
  | TemperatureUnit
  | VelocityUnit
  | WeightUnit;

/**
 * Units in which an altitude may be expressed.
 */
export type AltitudeUnit =
  | "feet"
  | "meters";

/**
 * Units in which a distance may be expressed.
 */
export type DistanceUnit =
  | "kilometers"
  | "nautical miles"
  | "statute miles";

/**
 * Inputs to a performance solver.
 */
export type PerformanceVariables = {
  [name in VariableName]: {
    unit: AnyUnit;
    value: number;
  }
};

/**
 * Units in which engine power may be expressed.
 */
export type PowerUnit =
  | "percent";

/**
 * Units in which a temperature may be expressed.
 */
export type TemperatureUnit =
  | "degrees celsius"
  | "degrees fahrenheit";

/**
 * Units in which a velocity may be expressed.
 */
export type VelocityUnit =
  | "feet per minute"
  | "knots"
  | "meters per minute"
  | "miles per hour";

/**
 * Units in which a weight may be expressed.
 */
export type WeightUnit =
  | "kilograms"
  | "pounds";

export function isPerformanceCalculator(val: unknown): val is PerformanceCalculator {
  return _.isObject(val)
    && "calculate" in val
    && "inputs" in val
    && "outputs" in val
    && _.isFunction(val.calculate)
    && _.isObject(val.inputs)
    && _.isObject(val.outputs);
}

/**
 * Type guard for {@link VectorCalculation}.
 *
 * @param val the value.
 */
export function isVectorCalculation(val: unknown): val is VectorCalculation {
  return _.isObject(val)
    && "guides" in val
    && "vars" in val
    && "vectors" in val
    && _.isArray(val.guides)
    && _.isArray(val.vectors)
    && _.isObject(val.vars);
}

/**
 * Name of a performance variable.
 */
type VariableName = string;
