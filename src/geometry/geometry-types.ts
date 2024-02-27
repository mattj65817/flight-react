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
