import { useMemo, useRef, useCallback } from "react";
import Map, { Layer, Source, Marker, MapRef } from "react-map-gl";
import type { LineLayer } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;

interface RideMapProps {
  // Strava streams are [lat, lng]; Mapbox/GeoJSON expect [lng, lat].
  latlng: [number, number][];
  height?: number;
}

const routeLayer: LineLayer = {
  id: "route",
  type: "line",
  source: "route",
  layout: { "line-join": "round", "line-cap": "round" },
  paint: {
    "line-color": "hsl(221, 83%, 53%)",
    "line-width": 3,
  },
};

export function RideMap({ latlng, height = 320 }: RideMapProps) {
  const mapRef = useRef<MapRef | null>(null);

  const { geojson, bounds, start, end } = useMemo(() => {
    if (!latlng || latlng.length < 2) {
      return { geojson: null, bounds: null, start: null, end: null };
    }

    // Downsample to ~1000 points for a light payload.
    const step = Math.max(1, Math.ceil(latlng.length / 1000));
    const coords: [number, number][] = [];
    for (let i = 0; i < latlng.length; i += step) {
      coords.push([latlng[i][1], latlng[i][0]]); // [lng, lat]
    }
    // Always include the final point.
    const last = latlng[latlng.length - 1];
    coords.push([last[1], last[0]]);

    let minLng = Infinity,
      minLat = Infinity,
      maxLng = -Infinity,
      maxLat = -Infinity;
    for (const [lng, lat] of coords) {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }

    return {
      geojson: {
        type: "Feature" as const,
        properties: {},
        geometry: { type: "LineString" as const, coordinates: coords },
      },
      bounds: [
        [minLng, minLat],
        [maxLng, maxLat],
      ] as [[number, number], [number, number]],
      start: coords[0],
      end: coords[coords.length - 1],
    };
  }, [latlng]);

  // Fit the route in view once the map has loaded.
  const handleLoad = useCallback(() => {
    if (mapRef.current && bounds) {
      mapRef.current.fitBounds(bounds, { padding: 32, duration: 0 });
    }
  }, [bounds]);

  if (!MAPBOX_TOKEN) {
    return (
      <div
        className="flex items-center justify-center text-sm text-text-muted rounded-2xl border border-surface-border"
        style={{ height }}
      >
        Set VITE_MAPBOX_TOKEN to enable maps
      </div>
    );
  }

  if (!geojson || !bounds) {
    return (
      <div
        className="flex items-center justify-center text-sm text-text-muted"
        style={{ height }}
      >
        No GPS data
      </div>
    );
  }

  const [[minLng, minLat], [maxLng, maxLat]] = bounds;

  return (
    <div
      className="rounded-2xl overflow-hidden border border-surface-border"
      style={{ height }}
    >
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        initialViewState={{
          bounds: [minLng, minLat, maxLng, maxLat],
          fitBoundsOptions: { padding: 32 },
        }}
        onLoad={handleLoad}
        attributionControl={false}
        dragRotate={false}
        style={{ width: "100%", height: "100%" }}
      >
        <Source id="route" type="geojson" data={geojson}>
          <Layer {...routeLayer} />
        </Source>
        {start && (
          <Marker longitude={start[0]} latitude={start[1]}>
            <div className="w-3 h-3 rounded-full bg-[hsl(160,60%,45%)] border-2 border-surface-card" />
          </Marker>
        )}
        {end && (
          <Marker longitude={end[0]} latitude={end[1]}>
            <div className="w-3 h-3 rounded-full bg-[hsl(0,70%,55%)] border-2 border-surface-card" />
          </Marker>
        )}
      </Map>
    </div>
  );
}
