import {PositionState} from "../../src/position/PositionState";
import {DateTime, FixedOffsetZone} from "luxon";
import _ from "lodash";
import {freeze} from "immer";

describe("PositionState", () => {
    const moreyModeSCodes: Lowercase<string>[] = freeze([
        "a3daa1", // N3477E
        "a5414a", // N438ER
        "a54501", // N439ER
        "a5de70", // N4777H
        "a60631", // N4879D
        "a6b340", // N5303T
        "a97172", // N70739
        "aa3681" // N75706
    ]);
    test("initial()", () => {
        const instance = PositionState.initial([...moreyModeSCodes].reverse());
        expect(instance.modeSCodes).toStrictEqual(moreyModeSCodes);
        expect(instance.updated.toSeconds()).toBe(0);
        expect(instance.updated.zone).toStrictEqual(FixedOffsetZone.instance(0));
    });
    describe("reduce()", () => {
        const base = PositionState.initial(moreyModeSCodes);
        const updated = DateTime.now().setZone("UTC");
        test("Aircraft position added", () => {
            const after = PositionState.reduce(base, {
                kind: "position updated",
                payload: {
                    positions: {
                        "a3daa1": {
                            altitude: 3_500,
                            coordinates: [-89.6187, 43.2299],
                            method: "observed",
                            timestamp: updated,
                            track: 360,
                            velocity: {
                                horizontal: 90,
                                vertical: 0
                            }
                        }
                    },
                    updated
                }
            });
            expect(after.updated).toStrictEqual(updated);
            expect(_.keys(after.positions)).toStrictEqual(["a3daa1"]);
            expect(after.positions["a3daa1"]).toStrictEqual({
                altitude: 3_500,
                coordinates: [-89.6187, 43.2299],
                method: "observed",
                timestamp: updated,
                track: 360,
                velocity: {
                    horizontal: 90,
                    vertical: 0
                }
            });
        });
        test("Aircraft position removed", () => {
            const before = PositionState.reduce(base, {
                kind: "position updated",
                payload: {
                    positions: {
                        "a3daa1": {
                            altitude: 3_500,
                            coordinates: [-89.6187, 43.2299],
                            method: "observed",
                            timestamp: updated,
                            track: 360,
                            velocity: {
                                horizontal: 90,
                                vertical: 0
                            }
                        },
                        "aa3681": {
                            altitude: 3_000,
                            coordinates: [-89.5187, 43.1299],
                            method: "observed",
                            timestamp: updated,
                            track: 180,
                            velocity: {
                                horizontal: 95,
                                vertical: 500
                            }
                        }
                    },
                    updated
                }
            });
            const after = PositionState.reduce(before, {
                kind: "position updated",
                payload: {
                    positions: {
                        "aa3681": {
                            altitude: 3_000,
                            coordinates: [-89.5187, 43.1299],
                            method: "observed",
                            timestamp: updated,
                            track: 180,
                            velocity: {
                                horizontal: 95,
                                vertical: 500
                            }
                        }
                    },
                    updated
                }
            });
            expect(after.updated).toBe(updated);
            expect(_.keys(after.positions)).toStrictEqual(["aa3681"]);
            expect(after.positions["aa3681"]).toStrictEqual({
                altitude: 3_000,
                coordinates: [-89.5187, 43.1299],
                method: "observed",
                timestamp: updated,
                track: 180,
                velocity: {
                    horizontal: 95,
                    vertical: 500
                }
            });
        });
        test("Aircraft position updated", () => {
            const before = PositionState.reduce(base, {
                kind: "position updated",
                payload: {
                    positions: {
                        "aa3681": {
                            altitude: 3_500,
                            coordinates: [-89.4187, 43.0299],
                            method: "observed",
                            timestamp: updated,
                            track: 90,
                            velocity: {
                                horizontal: 85,
                                vertical: -100
                            }
                        }
                    },
                    updated
                }
            });
            const after = PositionState.reduce(before, {
                kind: "position updated",
                payload: {
                    positions: {
                        "aa3681": {
                            altitude: 3_200,
                            coordinates: [-89.5187, 43.1299],
                            method: "observed",
                            timestamp: updated,
                            track: 180,
                            velocity: {
                                horizontal: 95,
                                vertical: 500
                            }
                        }
                    },
                    updated
                }
            });
            expect(after.updated).toBe(updated);
            expect(_.keys(after.positions)).toStrictEqual(["aa3681"]);
            expect(after.positions["aa3681"]).toStrictEqual({
                altitude: 3_200,
                coordinates: [-89.5187, 43.1299],
                method: "observed",
                timestamp: updated,
                track: 180,
                velocity: {
                    horizontal: 95,
                    vertical: 500
                }
            });
        });
    });
});
