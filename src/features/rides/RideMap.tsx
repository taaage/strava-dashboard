import { useMemo } from "react";
import { MapContainer, TileLayer, Polyline, CircleMarker } from "react-leaflet";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  DEFAULT_MAP_HEIGHT,
  FINISH_COLOR,
  HOVER_MARKER_RADIUS,
  MAP_BACKGROUND,
  MAP_FIT_PADDING,
  MARKER_RADIUS,
  MARKER_STROKE,
  MARKER_STROKE_WIDTH,
  MAX_TRACK_POINTS,
  ROUTE_COLOR,
  ROUTE_WEIGHT,
  START_COLOR,
  TILE_ATTRIBUTION,
  TILE_URL,
} from "./constants";
import { boundsOf, downsample, pointAtFraction, type LatLng } from "./utils";

interface RideMapProps {
  // Strava streams are [lat, lng] — same order Leaflet expects.
  latlng: LatLng[];
  height?: number;
  // Position along the track to highlight (0..1), synced from the elevation chart.
  hoverFraction?: number | null;
}

/** A filled circle marker with a white ring, used for start/finish/hover. */
function Dot({
  center,
  color,
  radius = MARKER_RADIUS,
}: {
  center: LatLngExpression;
  color: string;
  radius?: number;
}) {
  return (
    <CircleMarker
      center={center}
      radius={radius}
      pathOptions={{
        color: MARKER_STROKE,
        weight: MARKER_STROKE_WIDTH,
        fillColor: color,
        fillOpacity: 1,
      }}
    />
  );
}

export function RideMap({
  latlng,
  height = DEFAULT_MAP_HEIGHT,
  hoverFraction,
}: RideMapProps) {
  const track = useMemo(() => {
    if (!latlng || latlng.length < 2) return null;
    const points = downsample(latlng, MAX_TRACK_POINTS);
    const bounds = boundsOf(points);
    if (!bounds) return null;
    return {
      points: points as LatLngExpression[],
      bounds: bounds as LatLngBoundsExpression,
      start: points[0] as LatLngExpression,
      end: points[points.length - 1] as LatLngExpression,
    };
  }, [latlng]);

  const hoverPoint = useMemo(
    () => pointAtFraction(latlng, hoverFraction) as LatLngExpression | null,
    [latlng, hoverFraction],
  );

  if (!track) {
    return (
      <div
        className="flex items-center justify-center text-sm text-text-muted"
        style={{ height }}
      >
        No GPS data
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden border border-surface-border"
      style={{ height }}
    >
      <MapContainer
        bounds={track.bounds}
        boundsOptions={{ padding: [MAP_FIT_PADDING, MAP_FIT_PADDING] }}
        scrollWheelZoom={false}
        style={{ width: "100%", height: "100%", background: MAP_BACKGROUND }}
      >
        <TileLayer
          url={TILE_URL}
          attribution={TILE_ATTRIBUTION}
          className="ride-map-tiles"
        />
        <Polyline
          positions={track.points}
          pathOptions={{ color: ROUTE_COLOR, weight: ROUTE_WEIGHT }}
        />
        <Dot center={track.start} color={START_COLOR} />
        <Dot center={track.end} color={FINISH_COLOR} />
        {hoverPoint && (
          <Dot
            center={hoverPoint}
            color={ROUTE_COLOR}
            radius={HOVER_MARKER_RADIUS}
          />
        )}
      </MapContainer>
    </div>
  );
}
