import { freeze } from "immer";
import _ from "lodash";
import { isChase } from "./chase-types";
import { Contour } from "./wpd";

import type { Path } from "../../geometry";
import type { PerformanceVariables, VectorCalculation } from "../../performance";
import type { Step } from "./chase-types";

/**
 * {@link CalcContext} holds context for a performance calculation by {@link ChaseChart.calculate}.
 */
export class CalcContext implements VectorCalculation {
  pos: Path = [];
  steps: StepResult[] = [];

  private constructor(public readonly vars: PerformanceVariables) {
  }

  /**
   * Direction of the most recent chase step.
   */
  get dir() {
    const last = _.findLast(_.map(this.steps, "step"), isChase);
    if (null == last) {
      throw Error("No direction set.");
    }
    return last.chase;
  }

  /**
   * All guides used during calculation.
   */
  get guides() {
    return _.map(_.flatMap(this.steps, step => step.guides), "path");
  }

  /**
   * Current cursor position within the calculation.
   */
  get position() {
    const { pos } = this;
    if (_.isEmpty(pos)) {
      throw Error("Position not set.");
    }
    return _.last(pos)!;
  }

  /**
   * All vectors navigated during calculation.
   */
  get vectors() {
    return _.transform(this.steps, (acc, { vector }, index, steps) => {
      if (index > 0) {
        const { step: previous } = steps[index - 1];
        if (isChase(previous) && false === previous.advance) {
          acc.push([]);
        }
      }
      acc[acc.length - 1].push(...vector.path);
    }, [[]] as Path[]);
  }

  get(variable: string) {
    const { vars } = this;
    if (!(variable in vars)) {
      throw Error(`Variable not set: ${variable}`);
    }
    return vars[variable].value;
  }

  apply(result: StepResult) {
    const copy = _.cloneDeep(result);
    this.steps.push(copy);
    const { outputs, step } = copy;
    if (isChase(step) && false !== step.advance) {
      this.pos.push(_.last(copy.vector.path)!);
    }
    if (null != outputs) {
      _.assign(this.vars, outputs);
    }
    return this;
  }

  static create(vars: PerformanceVariables): CalcContext {
    return freeze(new CalcContext(vars), true);
  }
}

/**
 * Step which was applied during a performance calculation and its results.
 */
interface StepResult {
  step: Step;
  guides: Contour[];
  outputs?: PerformanceVariables;
  vector: Contour;
}
