import _ from "lodash";
import { pickAdjacent } from "../misc";

import type { AxialDirection, Path, Point } from "./geometry-types";
import { scale } from "@mattj65817/util-js";

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

/**
 * Interpolate a path at some position between two existing paths.
 *
 * Always returns a path that is sorted according to `dir`; there is no need to pre-sort paths.
 *
 * @param p0 the first path.
 * @param p1 the second path.
 * @param dir the direction of the paths.
 * @param factor the interpolation factor; e.g. `0.5` to interpolate at the midpoint between the two paths.
 */
export function interpolatePath(p0: Path, p1: Path, dir: AxialDirection, factor: number = 0.5) {
  if (0 === factor) {
    return p0;
  } else if (1 === factor) {
    return p1;
  }
  const pK = "down" === dir || "up" === dir ? 1 : 0;
  const vK = 1 - pK;
  const [lVertices, uVertices] = [sortPath([...p0], dir), sortPath([...p1], dir)].sort(
    ([pt0], [pt1]) => pt0[pK] - pt1[pK]);
  const iPath: Path = [];
  let inRange = false;
  while (0 !== lVertices.length && 0 !== uVertices.length) {
    const l = lVertices[0];
    const u = uVertices[0];
    const lPos = l[pK];
    const uPos = u[pK];
    if (!inRange) {
      if (lPos < uPos) {
        lVertices.shift();
        continue;
      }
      inRange = true;
    }

    /* Determine next position to add to the interpolated contour. */
    let pos: number;
    if (lPos > uPos) {
      pos = uPos;
      uVertices.shift();
    } else {
      pos = lPos;
      lVertices.shift();
      if (lPos === uPos) {
        uVertices.shift();
      }
    }

    /* Interpolate between values at the current position. */
    const pt0 = pointAt(p0, pos, pK);
    const pt1 = pointAt(p1, pos, pK);
    const v0 = pt0[vK];
    if (0 === pK) {
      iPath.push([pos, v0 + factor * (pt1[vK] - v0)]);
    } else {
      iPath.push([v0 + factor * (pt1[vK] - v0), pos]);
    }
  }
  return iPath;
}

/**
 * Normalize a path by sorting it according to its direction and scaling it to four decimal places.
 *
 * @param path the path.
 * @param dir the direction.
 */
export function normalizePath(path: Path, dir: AxialDirection): Path {
  return sortPath(path, dir).map(([x, y]) => [scale(x, 4), scale(y, 4)]);
}

/**
 * Sort a path according to a direction.
 *
 * @param path the path.
 * @param dir the direction.
 * @private
 */
export function sortPath(path: Path, dir: AxialDirection) {
  const order = "left" === dir || "up" === dir ? -1 : 1;
  const key = "left" === dir || "right" === dir ? 0 : 1;
  return _.clone(path).sort((p0, p1) => order * (p0[key] - p1[key]));
}

/**
 * Get the point at a specific position in a path, interpolating if necessary.
 *
 * @param path the path.
 * @param pos the position.
 * @param pK the position key (`0` for the X coordinate, `1` for the Y coordinate.)
 */
export function pointAt(path: Path, pos: number, pK: number): Point {
  const [, adjacent] = pickAdjacent(path, pK, pos);
  if (1 === adjacent.length) {
    if (pos !== adjacent[0][pK]) {
      throw Error(`Position not in path: ${pos}`);
    }
    return adjacent[0];
  }
  const [pt0, pt1] = adjacent;
  const p0 = pt0[pK];
  const factor = (pos - p0) / (pt1[pK] - p0);
  const vK = 1 - pK;
  const v0 = pt0[vK];
  if (0 === pK) {
    return [pos, v0 + factor * (pt1[vK] - v0)];
  } else {
    return [v0 + factor * (pt1[vK] - v0), pos];
  }
}
