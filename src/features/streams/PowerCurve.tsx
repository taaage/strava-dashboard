import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { type RideStream } from "../../api/api";
import { ChartCard } from "../../shared/layout";

interface PowerCurveProps {
  streams: RideStream[];
}

// Durations to compute (in seconds) — log-distributed
const CURVE_DURATIONS = [
  1, 2, 3, 5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 240, 300, 360, 420, 480,
  600, 720, 900, 1200, 1500, 1800, 2400, 3000, 3600,
];

function computeBestEffort(watts: number[], durationSeconds: number): number {
  if (watts.length < durationSeconds) return 0;
  let maxAvg = 0;
  let windowSum = 0;
  for (let i = 0; i < durationSeconds; i++) windowSum += watts[i];
  maxAvg = windowSum / durationSeconds;
  for (let i = durationSeconds; i < watts.length; i++) {
    windowSum += watts[i] - watts[i - durationSeconds];
    const avg = windowSum / durationSeconds;
    if (avg > maxAvg) maxAvg = avg;
  }
  return Math.round(maxAvg);
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${(seconds / 3600).toFixed(1)}h`;
}

function computePowerCurve(streams: RideStream[]) {
  const envelope: Record<number, number> = {};

  for (const duration of CURVE_DURATIONS) {
    envelope[duration] = 0;
  }

  for (const stream of streams) {
    for (const duration of CURVE_DURATIONS) {
      const best = computeBestEffort(stream.watts, duration);
      if (best > envelope[duration]) {
        envelope[duration] = best;
      }
    }
  }

  return CURVE_DURATIONS.map((d) => ({
    duration: d,
    label: formatDuration(d),
    watts: envelope[d],
  }));
}

export function PowerCurve({ streams }: PowerCurveProps) {
  const data = computePowerCurve(streams);

  return (
    <ChartCard
      title="Power Curve"
      subtitle={`Best efforts across ${streams.length} rides`}
      height="h-72"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#71717a", fontSize: 10 }}
            dy={8}
            interval={3}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#71717a", fontSize: 11 }}
            dx={-4}
            domain={[0, "auto"]}
            unit="W"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0]?.payload;
              return (
                <div className="bg-surface-muted rounded-lg px-3 py-2 border border-surface-border shadow-xl">
                  <p className="text-xs text-text-secondary mb-1">{d?.label}</p>
                  <p className="text-sm font-medium text-white">{d?.watts}W</p>
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="watts"
            stroke="hsl(221, 83%, 53%)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: "hsl(221, 83%, 53%)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
