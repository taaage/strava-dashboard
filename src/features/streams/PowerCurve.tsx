import { useState, useMemo } from "react";
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
import { computeBestEffort } from "../power/utils";

interface PowerCurveProps {
  streams: RideStream[];
}

const CURVE_DURATIONS = [
  1, 2, 3, 5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 240, 300, 360, 420, 480,
  600, 720, 900, 1200, 1500, 1800, 2400, 3000, 3600,
];

const YEAR_COLORS: Record<string, string> = {
  "2026": "hsl(221, 83%, 53%)",
  "2025": "hsl(280, 65%, 60%)",
  "2024": "hsl(30, 80%, 55%)",
  "2023": "hsl(0, 70%, 55%)",
  "2022": "hsl(50, 70%, 50%)",
  "2021": "hsl(190, 60%, 50%)",
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${(seconds / 3600).toFixed(1)}h`;
}

function computePowerCurve(streams: RideStream[]): Record<number, { watts: number; activityId: number }> {
  const envelope: Record<number, { watts: number; activityId: number }> = {};
  for (const duration of CURVE_DURATIONS) {
    envelope[duration] = { watts: 0, activityId: 0 };
  }
  for (const stream of streams) {
    if (stream.watts.length === 0) continue;
    for (const duration of CURVE_DURATIONS) {
      const best = computeBestEffort(stream.watts, duration);
      if (best > envelope[duration].watts) {
        envelope[duration] = { watts: best, activityId: stream.activityId };
      }
    }
  }
  return envelope;
}

function getAvailableYears(streams: RideStream[]): string[] {
  const years = new Set<string>();
  for (const s of streams) {
    if (s.date) years.add(new Date(s.date).getFullYear().toString());
  }
  return Array.from(years).sort().reverse();
}

export function PowerCurve({ streams }: PowerCurveProps) {
  const years = useMemo(() => getAvailableYears(streams), [streams]);
  const [selected, setSelected] = useState<string[]>([years[0] ?? "2026"]);

  const toggle = (year: string) => {
    setSelected((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year],
    );
  };

  const curves = useMemo(() => {
    const result: Record<string, Record<number, { watts: number; activityId: number }>> = {};
    for (const key of selected) {
      const filtered = streams.filter((s) => new Date(s.date).getFullYear().toString() === key);
      result[key] = computePowerCurve(filtered);
    }
    return result;
  }, [streams, selected]);

  const chartData = CURVE_DURATIONS.map((d) => {
    const point: Record<string, any> = {
      duration: d,
      label: formatDuration(d),
    };
    for (const key of selected) {
      point[key] = curves[key]?.[d]?.watts ?? 0;
    }
    if (selected.length === 1) {
      point.activityId = curves[selected[0]]?.[d]?.activityId ?? 0;
    }
    return point;
  });

  const isClickable = selected.length === 1;

  const options = years;

  return (
    <div className="bg-surface-card rounded-3xl p-5 sm:p-8 border border-surface-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-1">
            Power Curve
          </h2>
          <p className="text-sm text-text-muted">
            Best efforts — {isClickable ? "click to open in Strava" : "select years to compare"}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {options.map((year) => (
            <button
              key={year}
              onClick={() => toggle(year)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                selected.includes(year)
                  ? "bg-surface-muted text-text-primary"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <span className="sm:hidden">'{year.slice(2)}</span>
              <span className="hidden sm:inline">{year}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
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
                const label = payload[0]?.payload?.label;
                return (
                  <div className="bg-surface-muted rounded-lg px-3 py-2 border border-surface-border shadow-xl">
                    <p className="text-xs text-text-secondary mb-1">{label}</p>
                    {payload.map((p) => (
                      <p
                        key={p.dataKey as string}
                        className="text-sm font-medium"
                        style={{ color: p.color }}
                      >
                        {p.dataKey}: {p.value}W
                      </p>
                    ))}
                  </div>
                );
              }}
            />
            {selected.map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={YEAR_COLORS[key] ?? "hsl(221, 83%, 53%)"}
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                  r: 4,
                  cursor: isClickable ? "pointer" : "default",
                  onClick: isClickable
                    ? (_: any, event: any) => {
                        const activityId = event?.payload?.activityId;
                        if (activityId) {
                          window.open(`https://www.strava.com/activities/${activityId}`, "_blank");
                        }
                      }
                    : undefined,
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
