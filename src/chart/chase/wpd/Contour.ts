import { freeze } from "immer";
import { scale } from "@mattj65817/util-js";
import { contact, interpolatePath } from "../../../geometry";
import { normalizePath } from "../../../geometry";
import { pickAdjacent } from "../../../misc";

import type { AxialDirection, Path, Point } from "../../../geometry";

export class Contour {
  private constructor(public readonly path: Path, private readonly dir: AxialDirection) {
  }

  public interpolate(other: Contour, factor: number): Contour {
    const { dir, path } = this;
    return Contour.create(interpolatePath(path, other.path, dir, factor), dir);
  }

  public split(at: Contour | Point): [Contour, Contour] {
    const { dir, path } = this;
    let pt: Point;
    if (!(at instanceof Contour)) {
      pt = at;
    } else {
      const point = contact(path, at.path);
      if (null == point) {
        throw Error("No contact between contours.");
      }
      pt = point;
    }
    const pK = "left" === dir || "right" === dir ? 0 : 1;
    const pos = pt[pK];
    const [index, adjacent] = pickAdjacent(path, pK, pos);
    if (pos === adjacent[0][pK]) {
      return [Contour.create(path.slice(0, index + 1), dir), Contour.create(path.slice(index), dir)];
    }
    if (1 === adjacent.length) {
      throw Error("Point not in path.");
    }
    const [pa0, pa1] = adjacent;
    const p0 = pa0[pK];
    const factor = (pos - p0) / (pa1[pK] - p0);
    const vK = 1 - pK;
    const v0 = pa0[vK];
    const value = scale(v0 + factor * (pa1[vK] - v0), 4);
    if (0 === pK) {
      return [
        Contour.create([...path.slice(0, index + 1), [pos, value]], dir),
        Contour.create([[pos, value], ...path.slice(index + 1)], dir),
      ];
    } else {
      return [
        Contour.create([...path.slice(0, index + 1), [value, pos]], dir),
        Contour.create([[value, pos], ...path.slice(index + 1)], dir),
      ];
    }
  }

  static create(path: Path, dir: AxialDirection) {
    return freeze(new Contour(normalizePath(path, dir), dir), true);
  }
}