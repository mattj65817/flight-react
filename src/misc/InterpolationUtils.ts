import _ from "lodash";

/**
 * Given a list of entries containing some *value* property, pick the one or two entries that are adjacent to a given
 * value, returning the index of the *first* adjacent entry and the adjacent entries themselves.
 *
 * * If `value` exactly matches one of the entries, that entry will be returned.
 * * If `value` falls before the first entry, the first entry will be returned.
 * * If `value` falls after the last entry, the last entry will be returned.
 * * If `value` falls between two entries, those two entries will be returned (preceding then following).
 *
 * @param entries the entries.
 * @param key the key under which the value is stored in each entry.
 * @param value the value.
 */
export function pickAdjacent<E>(entries: E[], key: keyof E, value: number): [number, E[]] {
  const keyed = _.keyBy(entries, key);
  const keys = _.keys(keyed).map(parseFloat).sort(_.subtract);
  const uI = keys.findIndex(key => key >= value);
  if (-1 === uI) {
    return [keys.length - 1, [keyed[keys[keys.length - 1]]]];
  }
  const uE = keyed[keys[uI]];
  const { [key]: uV } = uE;
  if (uV === value || 0 === uI) {
    return [uI, [uE]];
  }
  return [uI - 1, [keyed[keys[uI - 1]], uE]];
}
