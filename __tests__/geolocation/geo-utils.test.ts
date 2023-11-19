import {GeoCoordinates} from "../../src/flight-types";
import {pointRadialDistance, pointToPointCourseDistance, proximityBounds} from "../../src/geolocation/geo-utils";
import {scale} from "@mattj65817/util-js";

describe("geo-utils.ts", () => {
    const msn: GeoCoordinates = [43.1398791, -89.3375045],
        lse: GeoCoordinates = [43.8792657, -91.2566336];
    test("pointRadialDistance()", () => {
        const point = pointRadialDistance(msn, 298.5525002, 94.8071826);
        expect(scale(point[0], 7)).toBe(lse[0]);
        expect(scale(point[1], 7)).toBe(lse[1]);
    });
    test("pointToPointCourseDistance()", () => {
        const cd = pointToPointCourseDistance(msn, lse);
        expect(scale(cd.course, 7)).toBe(298.5525002);
        expect(scale(cd.distance, 7)).toBe(94.8071826);
        expect(scale(cd.returnCourse, 7)).toBe(117.2311335);
    });
    test("proximityBounds()", () => {
        const bounds = proximityBounds(msn, 10);
        expect(scale(bounds[0][0], 7)).toBe(42.9731732);
        expect(scale(bounds[0][1], 7)).toBe(-89.5651461);
        expect(scale(bounds[1][0], 7)).toBe(43.3065801);
        expect(scale(bounds[1][1], 7)).toBe(-89.1098629);
    });
});
