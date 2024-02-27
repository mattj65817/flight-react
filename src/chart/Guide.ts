import {freeze, immerable, produce} from "immer";
import _ from "lodash";
import {Contour} from "./Contour";
import {Flow} from "./Flow";

import type {Path, Point} from "../geometry";

export class Guide {
    [immerable] = true;

    readonly contours: [[order: number, value?: number], Contour][] = [];

    private constructor(private readonly flow: Flow, private readonly bounds: ("max" | "min")[]) {
    }

    /**
     * Determine whether the contours in this guide have values associated with them.
     */
    get valued() {
        const {contours} = this;
        if (0 === contours.length) {
            return false;
        }
        return null != contours[0][0][1];
    }

    /**
     * Get the contour associated with a given value, interpolating if necessary.
     *
     * @param value the value.
     */
    public at(value: number): Contour {
        if (!this.valued) {
            throw Error("Guide does not have valued contours.");
        }
        throw Error("TODO");
    }

    /**
     * Get the contour *contacting* (intersecting or abutting) a given contour, interpolating if necessary.
     *
     * @param contour the contour.
     */
    public contacting(contour: Contour): Contour {
        throw Error("TODO");
    }

    /**
     * Get the contour passing through a given point, interpolating if necessary.
     *
     * @param point the point.
     */
    public through(point: Point): Contour {
        throw Error("TODO");
    }

    /**
     * Add a contour, optionally associating it with a value.
     *
     * @param path the path.
     * @param value the value, if any.
     */
    public addContour(path: Path, value?: number) {
        const valued = this.valued;
        if (valued !== (null != value)) {
            throw Error("Guide cannot mix valued and unvalued contours.");
        }
        const {contours, flow} = this;
        if (null != value && -1 !== contours.findIndex(([[nextValue]]) => value === nextValue)) {
            throw Error(`Guide already contains a contour for value ${value}.`);
        }
        const contour: Guide["contours"][number] = [[contours.length, value], Contour.create(flow, path)];
        const index = _.sortedIndexBy(contours, contour,
            ([[order, value]]) => valued ? value! : order);
        return produce(this, draft => {
            draft.contours.splice(index, 0, contour);
        });
    }

    /**
     * Create a new, empty {@link Guide} instance.
     *
     * @param flow the guide flow.
     * @param bounds the end(s) at which the guide is bounded.
     */
    static create(flow: Flow, bounds: Guide["bounds"] = ["max", "min"]) {
        return freeze(new Guide(flow, [...bounds]), true);
    }
}
