import {TrackingState} from "../../src/tracking/TrackingState";
import {DateTime} from "luxon";

describe("TrackingState", () => {
    test("initial()", () => {
        const instance = TrackingState.initial({
            ids: ["a60631"],
            nonTrackingInterval: {minute: 5},
            trackingInterval: {minute: 1}
        });
        expect(instance.error).toBeUndefined();
        expect(instance.ids).toStrictEqual(["a60631"]);
        expect(instance.interval).toStrictEqual({minute: 5});
        expect(instance.positions).toStrictEqual({});
        expect(instance.nonTrackingInterval).toStrictEqual({minute: 5});
        expect(instance.trackingInterval).toStrictEqual({minute: 1});
    });
    describe("reduce()", () => {
        const initial = TrackingState.initial({
            ids: ["a60631"],
            nonTrackingInterval: {minute: 5},
            trackingInterval: {minute: 1}
        });
        test("Action: error occurred", () => {
            const now = DateTime.now().setZone("UTC");
            const intermediate = TrackingState.reduce(initial, {
                kind: "positions updated",
                payload: {
                    positions: {
                        a60631: {
                            altitude: 3_000,
                            coordinates: [43.029877, -89.117772],
                            track: 270,
                            velocity: {
                                horizontal: 102.9,
                                vertical: 128
                            }
                        }
                    },
                    timestamp: now
                }
            });
            const updated = TrackingState.reduce(intermediate, {
                kind: "error occurred",
                payload: {
                    error: "this is an error",
                    timestamp: now
                }
            });
            expect(updated.error).toStrictEqual({
                error: "this is an error",
                timestamp: now
            });
            expect(updated.ids).toStrictEqual(initial.ids);
            expect(updated.interval).toStrictEqual({minute: 5});
            expect(updated.nonTrackingInterval).toStrictEqual(initial.nonTrackingInterval);
            expect(updated.positions).toStrictEqual({});
            expect(updated.tracking).toBe(false);
            expect(updated.trackingInterval).toStrictEqual(initial.trackingInterval);
        });
        describe("Action: ids updated", () => {
            test("Clears any previous error", () => {
                const now = DateTime.now().setZone("UTC");
                const intermediate = TrackingState.reduce(initial, {
                    kind: "error occurred",
                    payload: {
                        error: "this is an error",
                        timestamp: now
                    }
                });
                expect(intermediate.error).not.toBeUndefined();
                const updated = TrackingState.reduce(intermediate, {
                    kind: "ids updated",
                    payload: []
                });
                expect(updated.error).toBeUndefined();
            });
            test("Makes no change if the list of IDs is the same.", () => {
                const updated = TrackingState.reduce(initial, {
                    kind: "ids updated",
                    payload: ["a60631"]
                });
                expect(updated.error).toBeUndefined();
                expect(updated.ids).toBe(initial.ids);
                expect(updated.positions).toBe(initial.positions);
                expect(updated.nextUpdate).toBe(initial.nextUpdate);
            });
            test("Adds newly tracked IDs.", () => {
                const before = Date.now();
                const updated = TrackingState.reduce(initial, {
                    kind: "ids updated",
                    payload: ["a60632", "a60631"]
                });
                expect(updated.error).toBeUndefined();
                expect(updated.ids).toStrictEqual(["a60631", "a60632"]);
                expect(updated.positions).toBe(initial.positions);
                expect(updated.nextUpdate.toMillis()).toBeGreaterThanOrEqual(before);
            });
            test("Removes no longer tracked IDs.", () => {
                const before = Date.now();
                const updated = TrackingState.reduce(initial, {
                    kind: "ids updated",
                    payload: ["a60632"]
                });
                expect(updated.error).toBeUndefined();
                expect(updated.ids).toStrictEqual(["a60632"]);
                expect(updated.positions).toStrictEqual({});
                expect(updated.nextUpdate.toMillis()).toBeGreaterThanOrEqual(before);
            });
            test("Sorts and ensures uniqueness of the ID list.", () => {
                const before = Date.now();
                const updated = TrackingState.reduce(initial, {
                    kind: "ids updated",
                    payload: ["a60634", "a60633", "a60632", "a60633", "a60634"]
                });
                expect(updated.error).toBeUndefined();
                expect(updated.ids).toStrictEqual(["a60632", "a60633", "a60634"]);
                expect(updated.positions).toStrictEqual({});
                expect(updated.nextUpdate.toMillis()).toBeGreaterThanOrEqual(before);
            });
        });
        describe("Action: positions updated", () => {
            test("Clears any previous error", () => {
                const now = DateTime.now().setZone("UTC");
                const intermediate = TrackingState.reduce(initial, {
                    kind: "error occurred",
                    payload: {
                        error: "this is an error",
                        timestamp: now
                    }
                });
                expect(intermediate.error).not.toBeUndefined();
                const updated = TrackingState.reduce(intermediate, {
                    kind: "positions updated",
                    payload: {
                        positions: {},
                        timestamp: now
                    }
                });
                expect(updated.error).toBeUndefined();
            });
            test("Removes position for previously seen aircraft which is no longer seen", () => {
                const now = DateTime.now().setZone("UTC");
                const intermediate = TrackingState.reduce(initial, {
                    kind: "positions updated",
                    payload: {
                        positions: {
                            a60631: {
                                altitude: 3_000,
                                coordinates: [43.029877, -89.117772],
                                track: 270,
                                velocity: {
                                    horizontal: 102.9,
                                    vertical: 128
                                }
                            }
                        },
                        timestamp: now
                    }
                });
                expect(Object.keys(intermediate.positions)).toStrictEqual(["a60631"]);
                const updated = TrackingState.reduce(intermediate, {
                    kind: "positions updated",
                    payload: {
                        positions: {},
                        timestamp: now
                    }
                });
                expect(updated.error).toBeUndefined();
                expect(updated.ids).toStrictEqual(["a60631"]);
                expect(updated.interval).toStrictEqual({minute: 5});
                expect(updated.nonTrackingInterval).toStrictEqual({minute: 5});
                expect(updated.positions).toStrictEqual({});
                expect(updated.tracking).toBe(false);
                expect(updated.trackingInterval).toStrictEqual({minute: 1});
            });
            describe("For previously seen aircraft", () => {
                test("Updates position for tracked aircraft", () => {
                    const now = DateTime.now().setZone("UTC");
                    const intermediate = TrackingState.reduce(initial, {
                        kind: "positions updated",
                        payload: {
                            positions: {
                                a60631: {
                                    altitude: 3_000,
                                    coordinates: [43.029877, -89.117772],
                                    track: 270,
                                    velocity: {
                                        horizontal: 102.9,
                                        vertical: 128
                                    }
                                }
                            },
                            timestamp: now
                        }
                    });
                    expect(Object.keys(intermediate.positions)).toStrictEqual(["a60631"]);
                    const oneMinuteFromNow = now.plus({minute: 1});
                    const updated = TrackingState.reduce(intermediate, {
                        kind: "positions updated",
                        payload: {
                            positions: {
                                a60631: {
                                    altitude: 4_000,
                                    coordinates: [43.029878, -89.117773],
                                    track: 90,
                                    velocity: {
                                        horizontal: 103,
                                        vertical: 129
                                    }
                                }
                            },
                            timestamp: oneMinuteFromNow
                        }
                    });
                    expect(updated.error).toBeUndefined();
                    expect(updated.ids).toStrictEqual(["a60631"]);
                    expect(updated.interval).toStrictEqual({minute: 1});
                    expect(updated.nonTrackingInterval).toStrictEqual({minute: 5});
                    expect(updated.positions).toStrictEqual({
                        a60631: {
                            altitude: 4_000,
                            coordinates: [43.029878, -89.117773],
                            timestamp: oneMinuteFromNow,
                            track: 90,
                            velocity: {
                                horizontal: 103,
                                vertical: 129
                            }
                        }
                    });
                    expect(updated.tracking).toBe(true);
                    expect(updated.trackingInterval).toStrictEqual({minute: 1});
                });
            });
            describe("For previously unseen aircraft", () => {
                test("Adds position for tracked aircraft", () => {
                    const now = DateTime.now().setZone("UTC");
                    const updated = TrackingState.reduce(initial, {
                        kind: "positions updated",
                        payload: {
                            positions: {
                                a60631: {
                                    altitude: 3_000,
                                    coordinates: [43.029877, -89.117772],
                                    track: 270,
                                    velocity: {
                                        horizontal: 102.9,
                                        vertical: 128
                                    }
                                }
                            },
                            timestamp: now
                        }
                    });
                    expect(updated.error).toBeUndefined();
                    expect(updated.ids).toStrictEqual(initial.ids);
                    expect(updated.interval).toStrictEqual({minute: 1});
                    expect(updated.nonTrackingInterval).toStrictEqual(initial.nonTrackingInterval);
                    expect(updated.positions).toStrictEqual({
                        a60631: {
                            altitude: 3_000,
                            coordinates: [43.029877, -89.117772],
                            timestamp: now,
                            track: 270,
                            velocity: {
                                horizontal: 102.9,
                                vertical: 128
                            }
                        }
                    });
                    expect(updated.tracking).toBe(true);
                    expect(updated.trackingInterval).toStrictEqual(initial.trackingInterval);
                });
                test("Ignores position for untracked aircraft", () => {
                    const now = DateTime.now().setZone("UTC");
                    const updated = TrackingState.reduce(initial, {
                        kind: "positions updated",
                        payload: {
                            positions: {
                                abc123: {
                                    altitude: 3_000,
                                    coordinates: [43.029877, -89.117772],
                                    track: 270,
                                    velocity: {
                                        horizontal: 102.9,
                                        vertical: 128
                                    }
                                }
                            },
                            timestamp: now
                        }
                    });
                    expect(updated.error).toBeUndefined();
                    expect(updated.ids).toStrictEqual(initial.ids);
                    expect(updated.interval).toStrictEqual({minute: 5});
                    expect(updated.nonTrackingInterval).toStrictEqual(initial.nonTrackingInterval);
                    expect(updated.positions).toStrictEqual(initial.positions);
                    expect(updated.tracking).toBe(false);
                    expect(updated.trackingInterval).toStrictEqual(initial.trackingInterval);
                });
            });
        });
    });
});
