import _ from "lodash";
import {Flow} from "./Flow";
import {Path} from "../geometry";
import {freeze} from "immer";

export class Contour {
    constructor(private readonly flow: Flow, private readonly path: Path) {
    }

    static create(flow: Flow, path: Path) {
        return freeze(new Contour(flow, flow.sort(_.cloneDeep(path))), true);
    }
}
