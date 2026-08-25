import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import { type RideStream } from "../../api/api";
import { ChartCard } from "../../shared/layout";

interface StreamChartsProps {
  streams: RideStream[];
}

/**
 * Shows average HR vs average power per ride — a simple efficiency view.
 * Lower HR for the same power = better aerobic fitness.
 */
function computeHrVsPower(streams: RideStream[]) {
  return streams
    .filter((s) => s.heartrate && s.heartrate.length > 0)
    .map((s) => {
      const avgWatts = Math.round(
        s.watts.reduce((a, b) => a + b, 0) / s.watts.length,
      );
      const avgHr = Math.round(
        s.heartrate!.reduce((a, b) => a + b, 0) / s.heartrate!.length,
      );
      return { name: s.name, watts: avgWatts, hr: avgHr };
    });
}

/**
 * Cadence distribution across all rides — bucketed into 5rpm bands.
 */
function computeCadenceDistribution(streams: RideStream[]) {
  const buckets: Record<number, number> = {};

  for (const stream of streams) {
    if (!stream.cadence) continue;
    for (const c of stream.cadence) {
      if (c === 0) continue; // skip coasting
      const bucket = Math.floor(c / 5) * 5;
      buckets[bucket] = (buckets[bucket] || 0) + 1;
    }
  }

  return Object.entries(buckets)
    .map(([rpm, seconds]) => ({ rpm: Number(rpm), seconds }))
    .filter((d) => d.rpm >= 40 && d.rpm <= 130)
    .sort((a, b) => a.rpm - b.rpm)
    .map((d) => ({ ...d, minutes: Math.round(d.seconds / 60) }));
}

export function HrVsPowerChart({ streams }: StreamChartsProps) {
  const data = computeHrVsPower(streams);

  if (data.length === 0) return null;

  return (
    <ChartCard
      title="HR vs Power"
      subtitle="Average per ride — lower HR at same power = fitter"
      height="h-56"
    >
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="watts"
            name="Power"
            unit="W"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#71717a", fontSize: 11 }}
            type="number"
            domain={["auto", "auto"]}
          />
          <YAxis
            dataKey="hr"
            name="HR"
            unit="bpm"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#71717a", fontSize: 11 }}
            domain={["auto", "auto"]}
          />
          <ZAxis range={[40, 40]} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0]?.payload;
              return (
                <div className="bg-surface-muted rounded-lg px-3 py-2 border border-surface-border shadow-xl">
                  <p className="text-xs text-text-secondary mb-1 truncate max-w-[180px]">
                    {d?.name}
                  </p>
                  <p className="text-sm text-white">
                    {d?.watts}W @ {d?.hr}bpm
                  </p>
                  <p className="text-xs text-text-muted">
                    Efficiency: {(d?.watts / d?.hr).toFixed(2)} W/bpm
                  </p>
                </div>
              );
            }}
          />
          <Scatter data={data} fill="hsl(0, 70%, 55%)" />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function CadenceDistribution({ streams }: StreamChartsProps) {
  const data = computeCadenceDistribution(streams);

  if (data.length === 0) return null;

  return (
    <ChartCard
      title="Cadence Distribution"
      subtitle="Time spent at each cadence (excl. coasting)"
      height="h-56"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="15%">
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#27272a"
            vertical={false}
          />
          <XAxis
            dataKey="rpm"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#71717a", fontSize: 10 }}
            dy={8}
            unit=" rpm"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#71717a", fontSize: 11 }}
            dx={-4}
            label={{
              value: "min",
              position: "insideTopLeft",
              fill: "#71717a",
              fontSize: 10,
            }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0]?.payload;
              return (
                <div className="bg-surface-muted rounded-lg px-3 py-2 border border-surface-border shadow-xl">
                  <p className="text-xs text-text-secondary mb-1">
                    {d?.rpm}–{d?.rpm + 5} rpm
                  </p>
                  <p className="text-sm font-medium text-white">
                    {d?.minutes} minutes
                  </p>
                </div>
              );
            }}
          />
          <Bar
            dataKey="minutes"
            fill="hsl(160, 60%, 45%)"
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
