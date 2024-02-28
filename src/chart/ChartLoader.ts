import { freeze } from "immer";
import { ChaseChart, isChaseChartDef } from "./chase";
import { WpdProject, WpdProjectDef } from "./chase/wpd";
import { Chart } from "./chart-types";

/**
 * {@link ChartLoader} loads performance charts by URL, providing the appropriate {@link Chart} instance based on the
 * content of the chart definition.
 */
export class ChartLoader {
  private constructor(private readonly base: URL, private readonly fetchJson: typeof defaultFetchJson) {
  }

  /**
   * Load a performance chart.
   *
   * @param src the URL of the chart definition.
   */
  public async load(src: string | URL): Promise<Chart> {
    const { fetchJson } = this;
    const url = src instanceof URL ? src : new URL(src, this.base);
    const def = await fetchJson<object>(url);
    if (isChaseChartDef(def)) {
      const proj = WpdProject.create(await fetchJson<WpdProjectDef>(new URL(def.project.src, url)));
      return ChaseChart.create(def, proj, url);
    }
    throw Error("Unsupported chart type.");
  }

  /**
   * Create a {@link ChartLoader} instance.
   *
   * @param base the base URL.
   * @param fetchJson the JSON fetch callback, primarily for testing.
   */
  static create(base: URL, fetchJson: typeof defaultFetchJson = defaultFetchJson) {
    return freeze(new ChartLoader(base, fetchJson), true);
  }
}

/**
 * Default JSON fetch implementation.
 *
 * @param src the URL to fetch.
 */
async function defaultFetchJson<B>(src: URL) {
  const response = await fetch(src.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch ${src}: ${response.statusText}`);
  }
  return await response.json() as B;
}
