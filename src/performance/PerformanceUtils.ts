import { freeze } from "immer";
import _ from "lodash";

import type { AnyUnit, PerformanceCalculator, PerformanceVariables } from "./performance-types";

/**
 * Convert a value from one unit to another.
 *
 * @param value the value to convert.
 * @param from the unit from which to convert.
 * @param to the unit to which to convert.
 */
export function convertUnits(value: number, from: AnyUnit, to: AnyUnit): number {
  if (from === to) {
    return value;
  }
  let conv = UNIT_CONVERSIONS[`${from}:${to}`];
  if (null != conv) {
    const [proportion, adjustment] = conv;
    let converted = value * proportion;
    if (null != adjustment) {
      converted += adjustment;
    }
    return converted;
  } else {
    conv = UNIT_CONVERSIONS[`${to}:${from}`];
    if (null != conv) {
      const [proportion, adjustment] = conv;
      let converted = value;
      if (null != adjustment) {
        converted -= adjustment;
      }
      return converted / proportion;
    }
  }
  throw Error(`No conversion: ${from} to ${to}`);
}

/**
 * Perform unit conversions on a set of variables as needed to match the units of the inputs.
 *
 * @param vars the variables.
 * @param inputs the inputs.
 */
export function convertVariables(vars: PerformanceVariables, inputs: PerformanceCalculator["inputs"]) {
  return _.transform(_.entries(vars), (acc, [name, variable]) => {
    const input = inputs[name];
    if (null != input) {
      const { value, unit } = variable;
      acc[name] = {
        unit: input.unit,
        value: convertUnits(value, unit, input.unit),
      };
    }
  }, _.cloneDeep(vars));
}

/**
 * Simple proportion-based unit conversion table.
 */
const UNIT_CONVERSIONS = freeze<Partial<{ [from in `${AnyUnit}:${AnyUnit}`]: [proportion: number, adjustment?: number] }>>({
  "degrees celsius:degrees fahrenheit": [9 / 5, 32],
  "feet:meters": [0.3048],
  "feet per minute:meters per minute": [0.3048],
  "pounds:kilograms": [0.453592],
}, true);
