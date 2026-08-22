import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { StravaActivity } from "../lib/api";
import { TimeRangeSelector } from "./TimeRangeSelector";

interface FitnessLineProps {
  activities: StravaActivity[];
}

export function FitnessLine({ activities }: FitnessLineProps) {
  const [days, setDays] = useState(90);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const rides = activities
    .filter(
      (a) =>
        (a.type === "Ride" || a.sport_type === "Ride" || a.type === "VirtualRide") &&
        a.average_watts &&
        a.average_heartrate &&
        a.average_watts > 0 &&
        a.average_heartrate > 0 &&
        new Date(a.start_date_local) >= cutoff
    )
    .reverse()
    .map((a) => ({
      date: new Date(a.start_date_local).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      watts: a.average_watts!,
      hr: Math.round(a.average_heartrate!),
      efficiency: Math.round((a.average_watts! / a.average_heartrate!) * 100) / 100,
    }));

  return (
    <div className="bg-surface-card rounded-3xl p-8 border border-surface-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-1">Fitness Signal (Dual Line)</h2>
          <p className="text-sm text-text-muted">Power and Heart Rate trend over recent rides</p>
        </div>
        <TimeRangeSelector selected={days} onChange={setDays} />
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rides}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 10 }} dy={8} interval={Math.max(0, Math.floor(rides.length / 6))} />
            <YAxis
              yAxisId="watts"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 11 }}
              domain={["auto", "auto"]}
              label={{ value: "Watts", angle: -90, position: "insideLeft", fill: "#71717a", fontSize: 10 }}
            />
            <YAxis
              yAxisId="hr"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 11 }}
              domain={["auto", "auto"]}
              label={{ value: "HR", angle: 90, position: "insideRight", fill: "#71717a", fontSize: 10 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0]?.payload;
                return (
                  <div className="bg-surface-muted rounded-lg px-3 py-2 border border-surface-border shadow-xl">
                    <p className="text-xs text-text-secondary mb-1">{data?.date}</p>
                    <p className="text-sm text-[hsl(221,83%,53%)]">Power: {data?.watts}W</p>
                    <p className="text-sm text-[hsl(0,70%,55%)]">HR: {data?.hr} bpm</p>
                    <p className="text-xs text-text-muted mt-1">Efficiency: {data?.efficiency} W/bpm</p>
                  </div>
                );
              }}
            />
            <Line yAxisId="watts" type="monotone" dataKey="watts" name="Power" stroke="hsl(221, 83%, 53%)" strokeWidth={2.5} dot={false} />
            <Line yAxisId="hr" type="monotone" dataKey="hr" name="Heart Rate" stroke="hsl(0, 70%, 55%)" strokeWidth={2} dot={false} strokeDasharray="4 2" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-text-muted">
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[hsl(221,83%,53%)] rounded inline-block" /> Avg Power</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 border-t-2 border-dashed border-[hsl(0,70%,55%)] inline-block" /> Avg HR</span>
      </div>
    </div>
  );
}
