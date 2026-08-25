import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { type PowerRecords } from "../../api/api";

interface PowerRadarProps {
  records: PowerRecords;
}

// Reference values = Competitive Cat B racing (~3.6 w/kg for 85kg rider)
const REFERENCE: Record<keyof PowerRecords, number> = {
  "5s": 1200,
  "15s": 950,
  "30s": 720,
  "1min": 570,
  "2min": 470,
  "3min": 430,
  "5min": 390,
  "8min": 365,
  "10min": 355,
  "15min": 340,
  "20min": 330,
  "30min": 315,
  "45min": 300,
  "60min": 290,
};

// All-time personal records
const ALL_TIME: Record<keyof PowerRecords, number> = {
  "5s": 1320,
  "15s": 1100,
  "30s": 856,
  "1min": 726,
  "2min": 507,
  "3min": 455,
  "5min": 417,
  "8min": 395,
  "10min": 386,
  "15min": 349,
  "20min": 346,
  "30min": 325,
  "45min": 321,
  "60min": 317,
};

export function PowerRadar({ records }: PowerRadarProps) {
  const chartData = (Object.keys(REFERENCE) as (keyof PowerRecords)[]).map(
    (key) => ({
      effort: key,
      watts: records[key],
      allTimeWatts: ALL_TIME[key],
      reference: REFERENCE[key],
      normalized: Math.round((records[key] / REFERENCE[key]) * 100),
      allTimeNormalized:
        ALL_TIME[key] > 0
          ? Math.round((ALL_TIME[key] / REFERENCE[key]) * 100)
          : null,
    }),
  );

  return (
    <div className="bg-surface-card rounded-3xl p-8 border border-surface-border">
      <h2 className="text-lg font-semibold text-text-primary mb-1">
        Power Records
      </h2>
      <p className="text-sm text-text-muted mb-4">
        Best effort last 20 rides - category B references
      </p>
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
                    {data?.allTimeWatts > 0 && (
                      <p className="text-sm text-[hsl(280,65%,60%)]">
                        All-time: {data?.allTimeWatts}W
                      </p>
                    )}
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
