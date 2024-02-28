import { freeze } from "immer";
import _ from "lodash";
import { interpolatePath, pointAt, sortPath } from "../../../geometry";
import { pickAdjacent } from "../../../misc";
import { Contour } from "./Contour";

import type { AxialDirection, Path, Point } from "../../../geometry";
import type { GuideName } from "../chase-types";
import type { WpdProjectDef } from "./wpd-types";

export class WpdProject {

  /**
   * Guides, which are non-valued contours ending in "@{number}" where "{number}" is simple sort order.
   *
   * The `contours` array is sorted in ascending order by `order`.
   */
  readonly guides: {
    [name in string]: {
      contours: {
        order: number;
        path: Path;
      }[];
    }
  } = {};

  /**
   * Scales, which are valued contours ending in "={number}" where "{number}" is the value associated with the contour.
   *
   * The `values` array is sorted in ascending order by `value`.
   */
  readonly scales: {
    [name in string]: {
      values: {
        path: Path;
        value: number;
      }[];
    }
  } = {};

  private constructor(private readonly proj: WpdProjectDef) {
    const { guides, scales } = this;
    proj.datasetColl.forEach(({ name, data }) => {
      const path: Path = _.map(data, "value");
      const guideMatcher = GUIDE.exec(name);
      if (null != guideMatcher) {
        const [, guide, type, value] = guideMatcher;
        if ("=" === type) {
          if (!(guide in scales)) {
            scales[guide] = { values: [] };
          }
          scales[guide].values.push({ path, value: parseFloat(value) });
        } else if ("@" === type) {
          if (!(guide in guides)) {
            guides[guide] = { contours: [] };
          }
          guides[guide].contours.push({ order: parseInt(value), path });
        }
      }
    });
    _.values(guides).forEach(({ contours }) => contours.sort(({ order: o0 }, { order: o1 }) => o0 - o1));
    _.values(scales).forEach(({ values }) => values.sort(({ value: v0 }, { value: v1 }) => v0 - v1));
  }

  public isScale(guide: GuideName) {
    return guide in this.scales;
  }

  public guide(guide: GuideName, dir: AxialDirection, through: Point) {
    const { guides } = this;
    if (!(guide in guides)) {
      throw Error(`Guide not found: ${guide}.`);
    }
    const nPK = "left" === dir || "right" === dir ? 0 : 1;
    const nVK = 1 - nPK;
    const negative = "left" === dir || "up" === dir;
    const nPaths = guides[guide].contours.map(({ path }) => {
      const sorted = sortPath(path, dir);
      const pos = negative
        ? Math.min(through[nPK], sorted[0][nPK])
        : Math.max(through[nPK], sorted[0][nPK]);
      const pt = pointAt(sorted, pos, nPK);
      return [pt[nVK], sorted] as const;
    });
    const val = through[nVK];
    const [, nAdjacent] = pickAdjacent(nPaths, 0, val);
    const [[nFirstVal, nFirstPath]] = nAdjacent;
    if (val === nFirstVal) {
      return Contour.create(nFirstPath, dir);
    } else if (2 === nAdjacent.length) {
      const [, [nSecondVal, nSecondPath]] = nAdjacent;
      const factor = (val - nFirstVal) / (nSecondVal - nFirstVal);
      const nPath = interpolatePath(nFirstPath, nSecondPath, dir, factor);
      return Contour.create(nPath, dir);
    }
    throw Error("TODO: interpolate below min or above max.");
  }

  public scale(scale: GuideName, dir: AxialDirection, value: number) {
    const { scales } = this;
    if (!(scale in scales)) {
      throw Error(`Scale not found: ${scale}.`);
    }
    const { [scale]: { values } } = scales;
    const [, adjacent] = pickAdjacent(values, "value", value);
    if (value === adjacent[0].value) {
      return Contour.create(sortPath(adjacent[0].path, dir), dir);
    } else if (2 === adjacent.length) {
      const [{ path: p0, value: v0 }, { path: p1, value: v1 }] = adjacent;
      const factor = (value - v0) / (v1 - v0);
      return Contour.create(interpolatePath(p0, p1, dir, factor), dir);
    }
    throw Error("TODO: interpolate below min or above max.");
  }

  public solve(scale: GuideName, dir: AxialDirection, pos: Point): [number, Contour] {
    const { scales } = this;
    if (!(scale in scales)) {
      throw Error(`Scale not found: ${scale}.`);
    }
    const vK = "left" === dir || "right" === dir ? 1 : 0;
    const value = pos[vK];
    const { [scale]: { values } } = scales;
    const points = _.transform(values, (values, { value, path }) => {
      values.push([path[0][vK], value, path]);
    }, [] as [number, number, Path][]);
    const [, adjacent] = pickAdjacent(points, 0, value);
    const [first] = adjacent;
    const [p0, v0] = first;
    if (value === p0) {
      return [v0, Contour.create(first[2], dir)];
    }
    if (1 === adjacent.length) {
      throw Error("Value not in scale.");
    }
    const [, [p1, v1, path1]] = adjacent;
    const factor = (value - p0) / (p1 - p0);
    return [v0 + (v1 - v0) * factor, Contour.create(first[2], dir).interpolate(Contour.create(path1, dir), factor)];
  }

  /**
   * Get the range of values associated with a scale.
   *
   * @param scale the scale.
   */
  public range(scale: string) {
    const { scales } = this;
    if (!(scale in scales)) {
      throw Error(`Scale not found: ${scale}.`);
    }
    const values = _.map(scales[scale].values, "value");
    return [_.min(values)!, _.max(values)!] as const;
  }

  /**
   * Create a {@link WpdProject} instance.
   *
   * @param proj the project definition file.
   */
  static create(proj: WpdProjectDef): WpdProject {
    return freeze(new WpdProject(_.cloneDeep(proj)), true);
  }
}

/**
 * Name pattern for a guide dataset.
 *
 * @private
 */
const GUIDE = freeze(/^guide:([^=]+)([=@])(0|(-?[1-9]\d*))$/, true);
