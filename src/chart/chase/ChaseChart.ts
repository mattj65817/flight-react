import { freeze } from "immer";
import _ from "lodash";
import { convertVariables } from "../../performance";
import { isChase, isSolve } from "./chase-types";
import { WpdProject } from "./wpd";
import { CalcContext } from "./CalcContext";

import type { AxialDirection } from "../../geometry";
import type { PerformanceCalculator, PerformanceVariables, Calculation } from "../../performance";
import type { Chart } from "../chart-types";
import type { Chase, ChaseChartDef, GuideSpec, Solve } from "./chase-types";

/**
 * {@link ChaseChart} implements the {@link PerformanceCalculator} interface for an aviation chase-around chart.
 */
export class ChaseChart implements Chart, PerformanceCalculator {
  readonly inputs: PerformanceCalculator["inputs"] = {};
  readonly outputs: PerformanceCalculator["outputs"] = {};

  meta: Chart["meta"];

  private constructor(
    private readonly def: ChaseChartDef,
    private readonly proj: WpdProject,
    src: URL,
  ) {
    const { inputs, outputs } = this;
    def.steps.forEach(step => {
      if (isChase(step) && step.until) {
        inputs[step.until] = {
          unit: step.unit,
          range: proj.range(step.until) as [number, number],
        };
      } else if (isSolve(step)) {
        outputs[step.using] = {
          unit: step.unit,
        };
      }
    });
    const { image } = def;
    this.meta = {
      image: {
        src: new URL(image.src, src),
        size: [...image.size],
      },
      src,
    };
  }

  calculate(vars: PerformanceVariables): Calculation {

    /* Check for inputs not present in the variables. */
    const { inputs } = this;
    const missing = _.omit(inputs, _.keys(vars));
    if (!_.isEmpty(missing)) {
      throw new Error(`Missing inputs: ${_.keys(missing).sort().join(", ")}`);
    }

    /* Attempt to solve. */
    const { def: { steps } } = this;
    return _.reduce(steps, (context, step) => {
      if (isChase(step)) {
        return this.doChase(context, step);
      } else if (isSolve(step)) {
        return this.doSolve(context, step);
      }
      throw Error("Unsupported step type.");
    }, CalcContext.create(convertVariables(vars, inputs)));
  }

  /**
   * Apply a {@link Chase} step to a solution context.
   *
   * @param context the context.
   * @param step the step.
   * @private
   */
  private doChase(context: CalcContext, step: Chase): CalcContext {
    const { chase } = step;
    const along = this.resolveContour(context, step.along, chase);
    if (null == step.until) {
      const [, vector] = along.split(context.position);
      context = context.apply({
        guides: [along],
        step, vector,
      });
    } else {
      const cross = "left" === chase || "right" === chase ? "down" : "right";
      const until = this.resolveContour(context, step.until, cross);
      const [vector] = along.split(until);
      context = context.apply({
        guides: [along, until],
        step, vector,
      });
    }
    return context;
  }

  /**
   * Apply a {@link Solve} step to a solution context.
   *
   * @param context the context.
   * @param step the step.
   * @private
   */
  private doSolve(context: CalcContext, step: Solve): CalcContext {
    const { solve, using } = step;
    const { outputs: { [using]: { unit } }, proj } = this;
    const [value, along] = proj.solve(using, solve, context.position);
    const vector = solve === context.dir ? along : along.split(context.position)[1];
    return context.apply({
      guides: [vector],
      outputs: { [using]: { value, unit } },
      step, vector,
    });
  }

  /**
   * Resolve a guide, returning it as a sorted path.
   *
   * @param context the solution context.
   * @param guide the guide or scale name.
   * @param dir the guide direction.
   * @private
   */
  private resolveContour(context: CalcContext, guide: GuideSpec, dir: AxialDirection) {
    const { proj } = this;
    if (_.isString(guide)) {
      if (proj.isScale(guide)) {
        return proj.scale(guide, dir, context.get(guide));
      } else {
        return proj.guide(guide, dir, context.position);
      }
    } else {
      const vars = _.mapValues(context.vars, "value");
      const matches = _.entries(guide).flatMap(
        ([expr, guide]) => {
          const evaluate = new Function("vars", `with (vars) { return !!(${expr}); }`);
          try {
            if (evaluate(vars)) {
              return [guide];
            }
          } catch (e) {
            if (!(e instanceof ReferenceError)) {
              throw e;
            }
          }
          return [];
        });
      if (1 !== matches.length) {
        throw Error(`Expected exactly one match in expression(s): [${_.keys(guide).join("], [")}]`);
      }
      return proj.guide(matches[0], dir, context.position);
    }
  }

  /**
   * Create a {@link ChaseChart} instance.
   *
   * @param def the chart definition.
   * @param proj the associated WebPlotDigital project.
   * @param src the URL from which the chart was loaded.
   */
  static create(def: ChaseChartDef, proj: WpdProject, src: URL): ChaseChart {
    return freeze(new ChaseChart(_.cloneDeep(def), proj, src), true);
  }
}