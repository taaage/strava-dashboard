import { useState, useMemo } from "react";
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
  Cell,
} from "recharts";
import { type RideStream } from "../../api/api";
import { ChartCard } from "../../shared/layout";

interface StreamChartsProps {
  streams: RideStream[];
}

type RideCategory = "Race" | "Tempo" | "Endurance" | "Recovery";

const CATEGORIES: { key: RideCategory; label: string; minWatts: number; maxWatts: number; color: string }[] = [
  { key: "Race", label: "Race", minWatts: 250, maxWatts: 9999, color: "hsl(0, 70%, 55%)" },
  { key: "Tempo", label: "Tempo", minWatts: 200, maxWatts: 250, color: "hsl(30, 80%, 55%)" },
  { key: "Endurance", label: "Endurance", minWatts: 150, maxWatts: 200, color: "hsl(221, 83%, 53%)" },
  { key: "Recovery", label: "Recovery", minWatts: 0, maxWatts: 150, color: "hsl(160, 60%, 45%)" },
];

function categorizeRide(avgWatts: number): RideCategory {
  if (avgWatts >= 250) return "Race";
  if (avgWatts >= 200) return "Tempo";
  if (avgWatts >= 150) return "Endurance";
  return "Recovery";
}

function computeHrVsPower(streams: RideStream[]) {
  return streams
    .filter((s) => s.heartrate && s.heartrate.length > 0 && s.watts.length > 0)
    .filter((s) => {
      // Exclude rides with >10% zero/low HR readings (sensor dropouts)
      const lowReadings = s.heartrate!.filter((hr) => hr < 60).length;
      return lowReadings / s.heartrate!.length < 0.1;
    })
    .map((s) => {
      const avgWatts = Math.round(
        s.watts.reduce((a, b) => a + b, 0) / s.watts.length,
      );
      const avgHr = Math.round(
        s.heartrate!.reduce((a, b) => a + b, 0) / s.heartrate!.length,
      );
      return {
        activityId: s.activityId,
        name: s.name,
        watts: avgWatts,
        hr: avgHr,
        category: categorizeRide(avgWatts),
      };
    })
    .filter((d) => d.hr >= 80 && d.hr <= 210 && d.watts >= 50);
}

export function HrVsPowerChart({ streams }: StreamChartsProps) {
  const allData = useMemo(() => computeHrVsPower(streams), [streams]);
  const [selected, setSelected] = useState<RideCategory[]>(["Race", "Tempo", "Endurance"]);

  const toggle = (cat: RideCategory) => {
    setSelected((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const data = useMemo(
    () => allData.filter((d) => selected.includes(d.category)),
    [allData, selected],
  );

  if (allData.length === 0) return null;

  return (
    <div className="bg-surface-card rounded-3xl p-8 border border-surface-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-1">
            HR vs Power
          </h2>
          <p className="text-sm text-text-muted">
            Click a dot to open in Strava
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => toggle(cat.key)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1.5 ${
                selected.includes(cat.key)
                  ? "bg-surface-muted text-text-primary"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              {cat.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            onClick={(e) => {
              const point = e?.activePayload?.[0]?.payload;
              if (point?.activityId) {
                window.open(`https://www.strava.com/activities/${point.activityId}`, "_blank");
              }
            }}
          >
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
            <ZAxis range={[50, 50]} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                return (
                  <div className="bg-surface-muted rounded-lg px-3 py-2 border border-surface-border shadow-xl">
                    <p className="text-xs text-text-secondary mb-1 truncate max-w-[200px]">
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
            <Scatter data={data} cursor="pointer">
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={CATEGORIES.find((c) => c.key === entry.category)?.color ?? "hsl(221, 83%, 53%)"}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
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
