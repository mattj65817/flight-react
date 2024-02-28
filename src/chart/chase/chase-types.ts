import _ from "lodash";
import { isAxialDirection } from "../../geometry";

import type { AxialDirection } from "../../geometry";
import type { AltitudeUnit, DistanceUnit, PowerUnit, TemperatureUnit } from "../../performance";

/**
 * Top level of a chase-around chart definition file.
 */
export interface ChaseChartDef {
  kind: "chase";
  version: "1.0";
  image: {
    src: string;
    size: [width: number, height: number];
  };
  project: {
    src: string;
  };
  steps: Step[];
}

/**
 * Union of all step types.
 */
export type Step =
  | Chase
  | Solve;

/**
 * Chase a guide to an intersecting scale.
 */
export interface Chase {
  chase: AxialDirection;
  along: GuideSpec;
  until: GuideName;
  unit: PerformanceUnit;
  advance?: false;
}

/**
 * Solve for a variable using a scale.
 */
export interface Solve {
  solve: AxialDirection;
  using: GuideName;
  unit: PerformanceUnit;
}

/**
 * Guide specification; either a single guide name or a hash of test expressions to guide names.
 */
export type GuideSpec =
  | GuideName
  | { [expr in string]: GuideName; };

/**
 * Guide name.
 */
export type GuideName = string;

/**
 * Any performance-related unit.
 */
type PerformanceUnit =
  | AltitudeUnit
  | DistanceUnit
  | PowerUnit
  | TemperatureUnit;

/**
 * Type guard for {@link Chase}.
 *
 * @param val the value.
 */
export function isChase(val: unknown): val is Chase {
  return _.isObject(val)
    && "chase" in val
    && isAxialDirection(val.chase);
}

/**
 * Type guard for {@link ChaseChartDef}.
 *
 * @param val the value.
 */
export function isChaseChartDef(val: unknown): val is ChaseChartDef {
  return _.isObject(val)
    && "kind" in val
    && "chase" === val.kind;
}

/**
 * Type guard for {@link Solve}.
 *
 * @param val the value.
 */
export function isSolve(val: unknown): val is Solve {
  return _.isObject(val)
    && "solve" in val
    && isAxialDirection(val.solve);
}
