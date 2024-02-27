import {Path, Point} from "../geometry";
import {freeze} from "immer";

/**
 * Axial flows.
 */
export const Flows = freeze<Record<Uppercase<string>, Flow>>({
    DOWN: {
        descending: false,
        vertical: true,
        compare(pt0: Point, pt1: Point) {
            return pt0[1] - pt1[1];
        },
        position(pt: Point) {
            return pt[1];
        },
        sort(path: Path) {
            return path.sort(this.compare);
        },
        value(pt: Point) {
            return pt[0];
        }
    },
    LEFT: {
        descending: true,
        vertical: false,
        compare(pt0: Point, pt1: Point) {
            return pt1[0] - pt0[0];
        },
        position(pt: Point) {
            return pt[0];
        },
        sort(path: Path): Path {
            return path.sort(this.compare);
        },
        value(pt: Point) {
            return pt[1];
        }
    },
    RIGHT: {
        descending: false,
        vertical: false,
        compare(pt0: Point, pt1: Point) {
            return pt0[0] - pt1[0];
        },
        position(pt: Point) {
            return pt[0];
        },
        sort(path: Path) {
            return path.sort(this.compare);
        },
        value(pt: Point) {
            return pt[1];
        }
    },
    UP: {
        descending: true,
        vertical: true,
        compare(pt0: Point, pt1: Point) {
            return pt1[1] - pt0[1];
        },
        position(pt: Point) {
            return pt[1];
        },
        sort(path: Path) {
            return path.sort(this.compare);
        },
        value(pt: Point) {
            return pt[0];
        }
    }
}, true);

/**
 * {@link Flow} implements comparison and extraction functions for an axial flow.
 */
export interface Flow {

    /**
     * Flag indicating that the flow is in *descending* coordinate order, rather than the default *ascending*.
     */
    descending: boolean;

    /**
     * Flag indicating that the flow is vertical, rather than the default horizontal.
     */
    vertical: boolean;

    /**
     * Compare two points on the *position* axis.
     *
     * @param pt0 the first point.
     * @param pt1 the second point.
     */
    compare(pt0: Point, pt1: Point): number;

    /**
     * Get the value of a point on the *position* axis.
     *
     * @param pt the point.
     */
    position(pt: Point): number;

    /**
     * Sort a path on the *position* axis.
     *
     * @param path the path.
     */
    sort(path: Path): Path;

    /**
     * Get the value of a point on the *value* axis.
     *
     * @param pt the point.
     */
    value(pt: Point): number;
}
