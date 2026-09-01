import { useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  DEFAULT_ELEVATION_HEIGHT,
  ELEVATION_COLOR,
  MAX_ELEVATION_POINTS,
} from "./constants";
import { movingAverage, smoothingWindow } from "./utils";

interface ElevationProfileProps {
  altitude: number[];
  distance: number[];
  height?: number;
  // Called with the hovered position as a fraction of the ride (0..1), or null.
  onHoverFraction?: (fraction: number | null) => void;
}

interface ElevationPoint {
  km: number;
  alt: number;
  fraction: number;
}

/** Builds the smoothed, downsampled chart series from raw streams. */
function buildSeries(altitude: number[], distance: number[]): ElevationPoint[] {
  const totalDistance = distance[distance.length - 1] || 1;
  const smoothed = movingAverage(altitude, smoothingWindow(altitude.length));
  const step = Math.max(1, Math.ceil(smoothed.length / MAX_ELEVATION_POINTS));

  const series: ElevationPoint[] = [];
  for (let i = 0; i < smoothed.length; i += step) {
    series.push({
      km: Math.round((distance[i] / 1000) * 10) / 10,
      alt: Math.round(smoothed[i]),
      fraction: distance[i] / totalDistance,
    });
  }
  return series;
}

/**
 * Elevation vs. distance area chart, styled like the dashboard's other charts.
 * Reports hover position as a 0..1 fraction so a synced map marker can follow.
 */
export function ElevationProfile({
  altitude,
  distance,
  height = DEFAULT_ELEVATION_HEIGHT,
  onHoverFraction,
}: ElevationProfileProps) {
  const data = useMemo(
    () =>
      altitude?.length && distance?.length
        ? buildSeries(altitude, distance)
        : [],
    [altitude, distance],
  );

  if (data.length === 0) return null;

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          onMouseMove={(state: any) => {
            if (!onHoverFraction || !state?.isTooltipActive) return;
            const fraction = state.activePayload?.[0]?.payload?.fraction;
            if (typeof fraction === "number") onHoverFraction(fraction);
          }}
          onMouseLeave={() => onHoverFraction?.(null)}
        >
          <defs>
            <linearGradient id="colorElevation" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ELEVATION_COLOR} stopOpacity={0.35} />
              <stop offset="100%" stopColor={ELEVATION_COLOR} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="km"
            type="number"
            domain={[0, "dataMax"]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#71717a", fontSize: 10 }}
            tickFormatter={(v) => `${v}km`}
            dy={6}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#71717a", fontSize: 10 }}
            domain={[(min: number) => Math.max(0, Math.floor(min)), "dataMax"]}
            tickFormatter={(v) => `${v}m`}
            width={40}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const point = payload[0]?.payload as ElevationPoint;
              return (
                <div className="bg-surface-muted rounded-lg px-3 py-2 border border-surface-border shadow-xl">
                  <p className="text-xs text-text-secondary">{point.km} km</p>
                  <p className="text-sm font-medium text-white">{point.alt} m</p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="alt"
            stroke={ELEVATION_COLOR}
            strokeWidth={1.5}
            fill="url(#colorElevation)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
