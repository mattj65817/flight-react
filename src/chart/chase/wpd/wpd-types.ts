import _ from "lodash";

/**
 * JSON format of a WebPlotDigitizer project file (the subset of it that we care about.)
 */
export interface WpdProjectDef {
  version: [
    major: 4,
    minor: 2
  ];
  datasetColl: {
    name: DatasetName;
    data: {
      value: [
        x: number,
        y: number
      ];
    }[];
  }[];
}

/**
 * Name of a dataset in a WebPlotDigitizer project.
 */
type DatasetName =
  | `guide:${string}@${number}`
  | `guide:${string}=${number}`
  | `panel:${string}`;

/**
 * Type guard for {@link WpdProjectDef}.
 *
 * @param val the value.
 */
export function isWpdProject(val: unknown): val is WpdProjectDef {
  return _.isObject(val)
    && "datasetColl" in val
    && "version" in val
    && _.isEqual(val.version, [4, 2])
    && _.isArray(val.datasetColl)
    && -1 === val.datasetColl.findIndex(next => !(
      _.isObject(next)
      && "data" in next
      && _.isArray(next.data)
    ));
}
