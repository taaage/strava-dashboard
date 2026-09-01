import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ElevationProfileProps {
  altitude: number[];
  distance: number[];
  height?: number;
}

/**
 * Elevation vs. distance area chart, styled like the dashboard's other charts.
 */
export function ElevationProfile({
  altitude,
  distance,
  height = 140,
}: ElevationProfileProps) {
  if (!altitude?.length || !distance?.length) return null;

  // Downsample to ~400 points for a smooth, light chart.
  const step = Math.max(1, Math.ceil(altitude.length / 400));
  const data: { km: number; alt: number }[] = [];
  for (let i = 0; i < altitude.length; i += step) {
    data.push({
      km: Math.round((distance[i] / 1000) * 10) / 10,
      alt: Math.round(altitude[i]),
    });
  }

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
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
            domain={["dataMin", "dataMax"]}
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
