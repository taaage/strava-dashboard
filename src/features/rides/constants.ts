/** Shared constants for the ride map + elevation profile feature. */

// Strava-style route/marker colors.
export const ROUTE_COLOR = "#FC4C02"; // Strava orange
export const START_COLOR = "#00B21E"; // green
export const FINISH_COLOR = "#E01B24"; // red
export const MARKER_STROKE = "#ffffff";

export const MARKER_RADIUS = 6;
export const HOVER_MARKER_RADIUS = 7;
export const MARKER_STROKE_WIDTH = 2;
export const ROUTE_WEIGHT = 3;

// Keyless OpenStreetMap raster tiles, darkened via CSS (.ride-map-tiles).
export const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// Map surface color (matches surface-card) shown before tiles load.
export const MAP_BACKGROUND = "#18181b";
export const MAP_FIT_PADDING = 24;

// Elevation chart accent (matches the dashboard's primary chart color).
export const ELEVATION_COLOR = "hsl(221, 83%, 53%)";

// Downsampling targets — cap points for light payloads without visible loss.
export const MAX_TRACK_POINTS = 1500; // route polyline
export const MAX_ELEVATION_POINTS = 400; // elevation chart

// Altitude smoothing (moving average). Window scales with sample density.
export const SMOOTHING_FRACTION = 0.005; // ~0.5% of samples on each side
export const SMOOTHING_MIN_WINDOW = 3;
export const SMOOTHING_MAX_WINDOW = 30;

// A ride is considered to have usable GPS with at least this many points.
export const MIN_GPS_POINTS = 10;

// Default component heights (px).
export const DEFAULT_MAP_HEIGHT = 320;
export const DEFAULT_ELEVATION_HEIGHT = 140;
