import _ from "lodash";

/**
 * Cardinal direction along an axis on a plane.
 */
export type AxialDirection =
  | "down"
  | "left"
  | "right"
  | "up";

/**
 * Bounding box on a plane, in polar coordinates, defined by top-left and bottom-right points.
 */
export type Box = [
  topLeft: Point,
  bottomRight: Point
];

/**
 * Single point on a plane, in polar coordinates.
 */
export type Point = [
  x: number,
  y: number
];

/**
 * Sequence of one or more connected points on a plane.
 */
export type Path = Point[];

/**
 * Type guard for {@link AxialDirection}.
 *
 * @param val the value.
 */
export function isAxialDirection(val: unknown): val is AxialDirection {
  return _.isString(val)
    && ["down", "left", "right", "up"].includes(val);
}
