import _ from "lodash";
import {Path, Point} from "./geometry-types";

/**
 * Find the *first* point, if any, at which two paths make contact, meaning that they intersect at or share that point.
 *
 * @param p0 the first path.
 * @param p1 the second path.
 */
export function contact(p0: Path, p1: Path) {
    for (let i0 = 0; i0 < p0.length - 1; i0 += 1) {
        const [p00x, p00y] = p0[i0];
        const [p01x, p01y] = p0[i0 + 1];
        for (let i1 = 0; i1 < p1.length - 1; i1 += 1) {
            const [p10x, p10y] = p1[i1];
            const [p11x, p11y] = p1[i1 + 1];
            const s0x = p01x - p00x;
            const s0y = p01y - p00y;
            const s1x = p11x - p10x;
            const x1y = p11y - p10y;
            const s = (-s0y * (p00x - p10x) + s0x * (p00y - p10y)) / (-s1x * s0y + s0x * x1y);
            const t = (s1x * (p00y - p10y) - x1y * (p00x - p10x)) / (-s1x * s0y + s0x * x1y);
            if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
                return [p00x + t * s0x, p00y + t * s0y] as Point;
            }
        }
    }

    /* The above will not match abutting points (two paths sharing an exact endpoint.) Handle that case. */
    return _.head(_.intersectionWith(p0, p1, _.isEqual));
}
