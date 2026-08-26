import { useState, useMemo } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { type RideStream } from "../../api/api";
import { TimeRangeSelector } from "../../shared/TimeRangeSelector";
import { DURATIONS, REFERENCE, computeRecords, filterStreamsByDays } from "./utils";

interface PowerRadarProps {
  streams: RideStream[];
}

export function PowerRadar({ streams }: PowerRadarProps) {
  const [days, setDays] = useState(90);

  const allTimeRecords = useMemo(() => computeRecords(streams), [streams]);
  const filteredStreams = useMemo(() => filterStreamsByDays(streams, days), [streams, days]);
  const currentRecords = useMemo(() => computeRecords(filteredStreams), [filteredStreams]);

  const chartData = DURATIONS.map(({ key }) => ({
    effort: key,
    watts: currentRecords[key],
    allTimeWatts: allTimeRecords[key],
    reference: REFERENCE[key],
    normalized: Math.round((currentRecords[key] / REFERENCE[key]) * 100),
    allTimeNormalized:
      allTimeRecords[key] > 0
        ? Math.round((allTimeRecords[key] / REFERENCE[key]) * 100)
        : null,
  }));

  return (
    <div className="bg-surface-card rounded-3xl p-8 border border-surface-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-1">
            Power Records
          </h2>
          <p className="text-sm text-text-muted">
            Best efforts vs all-time — Cat B reference
          </p>
        </div>
        <TimeRangeSelector selected={days} onChange={setDays} />
      </div>
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="#27272a" />
            <PolarAngleAxis
              dataKey="effort"
              tick={{ fill: "#a1a1aa", fontSize: 10 }}
            />
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0]?.payload;
                const pct = data?.normalized;
                const diff = data?.watts - data?.reference;
                return (
                  <div className="bg-surface-muted rounded-lg px-3 py-2 border border-surface-border shadow-xl">
                    <p className="text-xs text-text-secondary mb-1">
                      {data?.effort}
                    </p>
                    <p className="text-sm font-medium text-white">
                      Current: {data?.watts}W
                    </p>
                    <p className="text-sm text-[hsl(280,65%,60%)]">
                      All-time: {data?.allTimeWatts}W
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      Cat B: {data?.reference}W
                    </p>
                    <p
                      className={`text-xs font-medium ${diff >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {diff >= 0 ? "+" : ""}
                      {diff}W ({pct}%)
                    </p>
                  </div>
                );
              }}
            />
            <Radar
              name="All-time"
              dataKey="allTimeNormalized"
              stroke="hsl(280, 65%, 60%)"
              fill="hsl(280, 65%, 60%)"
              fillOpacity={0.08}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              dot={{ r: 2, fill: "hsl(280, 65%, 60%)", fillOpacity: 1 }}
            />
            <Radar
              name="Power"
              dataKey="normalized"
              stroke="hsl(221, 83%, 53%)"
              fill="hsl(221, 83%, 53%)"
              fillOpacity={0.2}
              strokeWidth={2}
              dot={{ r: 3, fill: "hsl(221, 83%, 53%)", fillOpacity: 1 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-7 gap-2 mt-4 text-center">
        {chartData.map((d) => (
          <div key={d.effort}>
            <p className="text-base font-semibold text-text-primary">
              {d.watts}
            </p>
            <p className="text-xs text-text-muted">{d.effort}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
