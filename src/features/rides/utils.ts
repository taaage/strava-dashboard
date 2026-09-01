import type { RideDetail } from "../../api/api";
import {
  MIN_GPS_POINTS,
  SMOOTHING_FRACTION,
  SMOOTHING_MAX_WINDOW,
  SMOOTHING_MIN_WINDOW,
} from "./constants";

export type LatLng = [number, number];

/** True when the ride has enough GPS points to draw a route. */
export function hasGps(ride: RideDetail): boolean {
  return (
    Array.isArray(ride.streams.latlng) &&
    ride.streams.latlng.length >= MIN_GPS_POINTS
  );
}

/** True when the ride has the altitude + distance streams needed to chart elevation. */
export function hasElevation(ride: RideDetail): boolean {
  return (
    !!ride.streams.altitude?.length && !!ride.streams.distance?.length
  );
}

/**
 * Evenly downsamples an array to at most `maxPoints`, always keeping the last
 * element so the series ends where the data does.
 */
export function downsample<T>(values: T[], maxPoints: number): T[] {
  if (values.length <= maxPoints) return values.slice();
  const step = Math.ceil(values.length / maxPoints);
  const out: T[] = [];
  for (let i = 0; i < values.length; i += step) out.push(values[i]);
  const last = values[values.length - 1];
  if (out[out.length - 1] !== last) out.push(last);
  return out;
}

/** Axis-aligned bounds of a set of coordinates: [[minLat,minLng],[maxLat,maxLng]]. */
export function boundsOf(points: LatLng[]): [LatLng, LatLng] | null {
  if (points.length === 0) return null;
  let minLat = Infinity,
    maxLat = -Infinity,
    minLng = Infinity,
    maxLng = -Infinity;
  for (const [lat, lng] of points) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }
  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ];
}

/**
 * Maps a 0..1 position along a track to the coordinate at that fraction.
 * Returns null for invalid input. Fraction is clamped to [0, 1].
 */
export function pointAtFraction(
  points: LatLng[],
  fraction: number | null | undefined,
): LatLng | null {
  if (
    fraction == null ||
    Number.isNaN(fraction) ||
    points.length === 0
  ) {
    return null;
  }
  const clamped = Math.min(1, Math.max(0, fraction));
  return points[Math.round(clamped * (points.length - 1))];
}

/** Smoothing half-width in samples, scaled to the series length and clamped. */
export function smoothingWindow(sampleCount: number): number {
  return Math.min(
    SMOOTHING_MAX_WINDOW,
    Math.max(SMOOTHING_MIN_WINDOW, Math.round(sampleCount * SMOOTHING_FRACTION)),
  );
}

/**
 * Moving-average smoothing to remove GPS/barometric jitter.
 * `window` is the half-width in samples (total window = 2*window + 1).
 */
export function movingAverage(values: number[], window: number): number[] {
  if (window < 1) return values;
  const out = new Array<number>(values.length);
  for (let i = 0; i < values.length; i++) {
    const lo = Math.max(0, i - window);
    const hi = Math.min(values.length - 1, i + window);
    let sum = 0;
    for (let j = lo; j <= hi; j++) sum += values[j];
    out[i] = sum / (hi - lo + 1);
  }
  return out;
}
