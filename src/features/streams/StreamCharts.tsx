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
import { ChartCard } from "../../shared";
import {
  type RideCategory,
  CATEGORIES,
  computeHrVsPower,
  computeCadenceDistribution,
} from "./utils";

interface StreamChartsProps {
  streams: RideStream[];
}

export function HrVsPowerChart({ streams }: StreamChartsProps) {
  const allData = useMemo(() => computeHrVsPower(streams), [streams]);
  const [selected, setSelected] = useState<RideCategory[]>(["Race"]);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
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
            <Scatter
              data={data}
              cursor="pointer"
              onClick={(entry: any) => {
                if (entry?.activityId) {
                  window.open(`https://www.strava.com/activities/${entry.activityId}`, "_blank");
                }
              }}
            >
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
