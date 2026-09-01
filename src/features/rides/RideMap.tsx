import { useMemo } from "react";
import { MapContainer, TileLayer, Polyline, CircleMarker } from "react-leaflet";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

interface RideMapProps {
  // Strava streams are [lat, lng] — same order Leaflet expects.
  latlng: [number, number][];
  height?: number;
}

// CARTO dark basemap (no labels) — clean, minimalist dark style.
// Key is read from env; CARTO basemap keys are public (used in client tile URLs).
const CARTO_KEY = import.meta.env.VITE_CARTO_API_KEY as string;
const CARTO_DARK = `https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png?api_key=${CARTO_KEY}`;
const CARTO_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

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
        attributionControl={false}
        style={{ width: "100%", height: "100%", background: "#18181b" }}
      >
        <TileLayer url={CARTO_DARK} attribution={CARTO_ATTR} />
        <Polyline
          positions={positions}
          pathOptions={{ color: "hsl(221, 83%, 53%)", weight: 3 }}
        />
        {start && (
          <CircleMarker
            center={start}
            radius={5}
            pathOptions={{
              color: "#18181b",
              weight: 2,
              fillColor: "hsl(160, 60%, 45%)",
              fillOpacity: 1,
            }}
          />
        )}
        {end && (
          <CircleMarker
            center={end}
            radius={5}
            pathOptions={{
              color: "#18181b",
              weight: 2,
              fillColor: "hsl(0, 70%, 55%)",
              fillOpacity: 1,
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
