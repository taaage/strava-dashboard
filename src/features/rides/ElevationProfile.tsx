import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/**
 * Moving-average smoothing to remove GPS/barometric altitude jitter.
 * `window` is the half-width in samples (total window = 2*window + 1).
 */
function smooth(values: number[], window: number): number[] {
  if (window < 1) return values;
  const out = new Array(values.length);
  for (let i = 0; i < values.length; i++) {
    let sum = 0;
    let count = 0;
    const lo = Math.max(0, i - window);
    const hi = Math.min(values.length - 1, i + window);
    for (let j = lo; j <= hi; j++) {
      sum += values[j];
      count++;
    }
    out[i] = sum / count;
  }
  return out;
}

interface ElevationProfileProps {
  altitude: number[];
  distance: number[];
  height?: number;
  // Called with the hovered position as a fraction of the ride (0..1), or null.
  onHoverFraction?: (fraction: number | null) => void;
}

/**
 * Elevation vs. distance area chart, styled like the dashboard's other charts.
 * Reports hover position as a 0..1 fraction so a synced map marker can follow.
 */
export function ElevationProfile({
  altitude,
  distance,
  height = 140,
  onHoverFraction,
}: ElevationProfileProps) {
  if (!altitude?.length || !distance?.length) return null;

  const maxDist = distance[distance.length - 1] || 1;

  // Smooth altitude to remove jitter. Window scales with sample density
  // (~0.5% of points each side), clamped to a sensible range.
  const window = Math.min(30, Math.max(3, Math.round(altitude.length * 0.005)));
  const smoothed = smooth(altitude, window);

  // Downsample to ~400 points for a smooth, light chart.
  const step = Math.max(1, Math.ceil(altitude.length / 400));
  const data: { km: number; alt: number; fraction: number }[] = [];
  for (let i = 0; i < smoothed.length; i += step) {
    data.push({
      km: Math.round((distance[i] / 1000) * 10) / 10,
      alt: Math.round(smoothed[i]),
      fraction: distance[i] / maxDist,
    });
  }

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          onMouseMove={(state: any) => {
            if (onHoverFraction && state?.isTooltipActive) {
              const f = state.activePayload?.[0]?.payload?.fraction;
              if (typeof f === "number") onHoverFraction(f);
            }
          }}
          onMouseLeave={() => onHoverFraction?.(null)}
        >
          <defs>
            <linearGradient id="colorElevation" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.02} />
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
              const d = payload[0]?.payload;
              return (
                <div className="bg-surface-muted rounded-lg px-3 py-2 border border-surface-border shadow-xl">
                  <p className="text-xs text-text-secondary">{d?.km} km</p>
                  <p className="text-sm font-medium text-white">{d?.alt} m</p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="alt"
            stroke="hsl(221, 83%, 53%)"
            strokeWidth={1.5}
            fill="url(#colorElevation)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
