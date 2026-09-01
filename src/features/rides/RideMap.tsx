import { useMemo } from "react";
import { MapContainer, TileLayer, Polyline, CircleMarker } from "react-leaflet";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

interface RideMapProps {
  // Strava streams are [lat, lng] — same order Leaflet expects.
  latlng: [number, number][];
  height?: number;
}

// Keyless OpenStreetMap tiles — darkened via CSS filter (index.css).
// No API key or account needed; full color control in the browser.
const OSM_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export function RideMap({ latlng, height = 320 }: RideMapProps) {
  const { positions, bounds, start, end } = useMemo(() => {
    if (!latlng || latlng.length < 2) {
      return { positions: [], bounds: null, start: null, end: null };
    }

    // Downsample to ~1500 points for a light polyline.
    const step = Math.max(1, Math.ceil(latlng.length / 1500));
    const pts: [number, number][] = [];
    for (let i = 0; i < latlng.length; i += step) pts.push(latlng[i]);
    pts.push(latlng[latlng.length - 1]);

    let minLat = Infinity,
      maxLat = -Infinity,
      minLng = Infinity,
      maxLng = -Infinity;
    for (const [lat, lng] of pts) {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    }

    return {
      positions: pts as LatLngExpression[],
      bounds: [
        [minLat, minLng],
        [maxLat, maxLng],
      ] as LatLngBoundsExpression,
      start: pts[0] as LatLngExpression,
      end: pts[pts.length - 1] as LatLngExpression,
    };
  }, [latlng]);

  if (!bounds) {
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
        bounds={bounds}
        boundsOptions={{ padding: [24, 24] }}
        scrollWheelZoom={false}
        attributionControl={true}
        style={{ width: "100%", height: "100%", background: "#18181b" }}
      >
        <TileLayer
          url={OSM_TILES}
          attribution={OSM_ATTR}
          className="ride-map-tiles"
        />
        <Polyline
          positions={positions}
          pathOptions={{ color: "#FC4C02", weight: 3 }}
        />
        {start && (
          <CircleMarker
            center={start}
            radius={6}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              fillColor: "#00B21E",
              fillOpacity: 1,
            }}
          />
        )}
        {end && (
          <CircleMarker
            center={end}
            radius={6}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              fillColor: "#E01B24",
              fillOpacity: 1,
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
