import {freeze} from "immer";
import _ from "lodash";

import type {GeoCoordinates} from "@mattj65817/aviation-js";

/**
 * Calculate the coordinates of the point on some `course` at some `distance` (in nautical miles) from some `from`
 * point.
 *
 * @param from the starting point.
 * @param course the course (degrees true) from the starting point.
 * @param distance the distance in nautical miles.
 */
export function pointRadialDistance(from: GeoCoordinates, course: number, distance: number) {
    const [latitude, longitude] = from,
        lat1 = RADIANS_IN_DEGREE * latitude,
        lon1 = RADIANS_IN_DEGREE * longitude,
        d12 = distance,
        crs12 = course * RADIANS_IN_DEGREE,
        cde = direct_ell(lat1, lon1, crs12, d12);
    return freeze<GeoCoordinates>([
        cde.lat * DEGREES_IN_RADIAN,
        cde.lon * DEGREES_IN_RADIAN
    ]);
}

/**
 * Calculate the course, return course, and distance in nautical miles between `from` and `to` coordinates.
 *
 * @param from the starting point.
 * @param to the ending point.
 */
export function pointToPointCourseDistance(from: GeoCoordinates, to: GeoCoordinates) {
    const lat1 = RADIANS_IN_DEGREE * from[0],
        lat2 = RADIANS_IN_DEGREE * to[0],
        lon1 = RADIANS_IN_DEGREE * from[1],
        lon2 = RADIANS_IN_DEGREE * to[1],
        cde = crsdist_ell(lat1, lon1, lat2, lon2);
    return {
        course: cde.crs12 * DEGREES_IN_RADIAN,
        distance: cde.d,
        returnCourse: cde.crs21 * DEGREES_IN_RADIAN
    }
}

/**
 * Calculate the bounding coordinates around all points within some distance of a center point.
 *
 * @param center the center point.
 * @param distance the distance in nautical miles.
 */
export function proximityBounds(center: GeoCoordinates, distance: number): [min: GeoCoordinates, max: GeoCoordinates] {
    const bounds = _.map([0, 90, 180, 270], course => pointRadialDistance(center, course, distance)),
        latitude = _.map(bounds, 0),
        longitude = _.map(bounds, 1);
    return [
        [_.min(latitude)!, _.min(longitude)!],
        [_.max(latitude)!, _.max(longitude)!]
    ];
}

/*
 * The following internal utility functions are lightly reformatted and minimally transformed to TypeScript from the
 * original code at the [Aviation Formulary](https://edwilliams.org/avform147.htm).
 */

function atan2(y: number, x: number) {
    if (x < 0) {
        return Math.atan(y / x) + Math.PI;
    }
    if ((x > 0) && (y >= 0)) {
        return Math.atan(y / x);
    }
    if ((x > 0) && (y < 0)) {
        return Math.atan(y / x) + TWO_PI;
    }
    if ((x == 0) && (y > 0)) {
        return HALF_PI;
    }
    if ((x == 0) && (y < 0)) {
        return 3 * HALF_PI;
    }
    throw Error("atan2(0,0) undefined");
}

function mod(x: number, y: number) {
    return x - y * Math.floor(x / y);
}

function modlat(x: number) {
    return mod(x + HALF_PI, TWO_PI) - HALF_PI;
}

function modlon(x: number) {
    return mod(x + Math.PI, TWO_PI) - Math.PI;
}

function modcrs(x: number) {
    return mod(x, TWO_PI);
}

function direct_ell(glat1: number, glon1: number, faz: number, s: number) {
    const EPS = 0.00000000005;
    if (Math.abs(Math.cos(glat1)) < EPS && Math.abs(Math.sin(faz)) >= EPS) {
        throw Error("Only N-S courses are meaningful, starting at a pole!");
    }
    const f = 1 / WGS84.invf;
    const r = 1 - f;
    let tu = r * Math.tan(glat1);
    const sf = Math.sin(faz),
        cf = Math.cos(faz);
    let b = 0 === cf ? 0 : 2 * atan2(tu, cf);
    const cu = 1 / Math.sqrt(1 + tu * tu),
        su = tu * cu,
        sa = cu * sf,
        c2a = 1 - sa * sa;
    let x = 1 + Math.sqrt(1 + c2a * (1 / (r * r) - 1));
    x = (x - 2) / x;
    let c = 1 - x;
    c = (x * x / 4 + 1) / c;
    let d = (0.375 * x * x - 1) * x;
    tu = s / (r * WGS84.a * c);
    let y = tu;
    c = y + 1;
    let cy, cz, e, sy;
    if (Math.abs(y - c) <= EPS) {
        throw Error("Illegal argument."); /* mj: appease TypeScript compiler. */
    } else {
        do {
            sy = Math.sin(y);
            cy = Math.cos(y);
            cz = Math.cos(b + y);
            e = 2 * cz * cz - 1;
            c = y;
            x = e * cy;
            y = e + e - 1;
            y = (((sy * sy * 4 - 3) * y * cz * d / 6 + x) * d / 4 - cz) * sy * d + tu;
        } while (Math.abs(y - c) > EPS);
    }
    b = cu * cy * cf - su * sy;
    c = r * Math.sqrt(sa * sa + b * b);
    d = su * cy + cu * sy * cf;
    const glat2 = modlat(atan2(d, c));
    c = cu * cy - su * sy * cf;
    x = atan2(sy * sf, c);
    c = ((-3 * c2a + 4) * f + 4) * c2a * f / 16;
    d = ((e * cy * c + cz) * sy * c + y) * sa;
    return {
        lat: glat2,
        lon: modlon(glon1 + x - (1 - c) * d * f), /* fix date line problems, */
        crs21: modcrs(atan2(sa, b) + Math.PI)
    };
}

function crsdist_ell(glat1: number, glon1: number, glat2: number, glon2: number) {
    const EPS = 0.00000000005,
        f = 1 / WGS84.invf,
        MAXITER = 100;
    if ((glat1 + glat2 === 0) && (Math.abs(glon1 - glon2) === Math.PI)) {
        throw Error("Course and distance between antipodal points is undefined");
    }
    if (glat1 === glat2 && (glon1 === glon2 || Math.abs(Math.abs(glon1 - glon2) - TWO_PI) < EPS)) {
        throw Error("Points 1 and 2 are identical- course undefined");
    }
    const r = 1 - f;
    let tu1 = r * Math.tan(glat1),
        tu2 = r * Math.tan(glat2);
    const cu1 = 1 / Math.sqrt(1 + tu1 * tu1);
    const su1 = cu1 * tu1,
        cu2 = 1 / Math.sqrt(1 + tu2 * tu2),
        s1 = cu1 * cu2,
        b1 = s1 * tu2,
        f1 = b1 * tu1;
    let x = glon2 - glon1,
        d = x + 1, /* force one pass */
        iter = 1,
        c2a, cx, cy, cz, e, c, sa, sx, sy, y;
    if ((Math.abs(d - x) <= EPS) || (iter >= MAXITER)) {
        throw Error("Illegal argument."); /* mj: appease TypeScript compiler. */
    } else {
        do {
            iter = iter + 1;
            sx = Math.sin(x);
            cx = Math.cos(x);
            tu1 = cu2 * sx;
            tu2 = b1 - su1 * cu2 * cx;
            sy = Math.sqrt(tu1 * tu1 + tu2 * tu2);
            cy = s1 * cx + f1;
            y = atan2(sy, cy);
            sa = s1 * sx / sy;
            c2a = 1 - sa * sa;
            cz = f1 + f1;
            if (c2a > 0) {
                cz = cy - cz / c2a;
            }
            e = cz * cz * 2 - 1;
            c = ((-3 * c2a + 4) * f + 4) * c2a * f / 16;
            d = x;
            x = ((e * cy * c + cz) * sy * c + y) * sa;
            x = (1 - c) * x * f + glon2 - glon1;
        } while ((Math.abs(d - x) > EPS) && (iter < MAXITER));
    }
    if (Math.abs(iter - MAXITER) < EPS) {
        throw Error("Algorithm did not converge");
    }
    const faz = modcrs(atan2(tu1, tu2)),
        baz = modcrs(atan2(cu1 * sx, b1 * cx - su1 * cu2) + Math.PI);
    x = Math.sqrt((1 / (r * r) - 1) * c2a + 1);
    x += 1;
    x = (x - 2) / x;
    c = 1 - x;
    c = (x * x / 4 + 1) / c;
    d = (0.375 * x * x - 1) * x;
    x = e * cy;
    return {
        d: ((((sy * sy * 4 - 3) * (1 - e - e) * cz * d / 6 - x) * d / 4 + cz) * sy * d + y) * c * WGS84.a * r,
        crs12: faz,
        crs21: baz
    }
}

const DEGREES_IN_RADIAN = 180 / Math.PI,
    HALF_PI = Math.PI / 2,
    RADIANS_IN_DEGREE = Math.PI / 180,
    TWO_PI = 2 * Math.PI,
    WGS84 = freeze({
        a: 6378.137 / 1.852,
        invf: 298.257223563
    });
