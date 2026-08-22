import { useState } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { StravaActivity } from "../lib/api";
import { TimeRangeSelector } from "./TimeRangeSelector";

interface FitnessScatterProps {
  activities: StravaActivity[];
}

export function FitnessScatter({ activities }: FitnessScatterProps) {
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
    .map((a) => ({
      watts: a.average_watts!,
      hr: Math.round(a.average_heartrate!),
      name: a.name,
      date: new Date(a.start_date_local).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      efficiency: (a.average_watts! / a.average_heartrate!).toFixed(2),
    }));

  return (
    <div className="bg-surface-card rounded-3xl p-8 border border-surface-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-1">Fitness Signal (Scatter)</h2>
          <p className="text-sm text-text-muted">Power vs Heart Rate — up and left = fitter</p>
        </div>
        <TimeRangeSelector selected={days} onChange={setDays} />
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="hr"
              name="Heart Rate"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 11 }}
              label={{ value: "Avg HR (bpm)", position: "bottom", fill: "#71717a", fontSize: 11 }}
            />
            <YAxis
              dataKey="watts"
              name="Power"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 11 }}
              label={{ value: "Avg Watts", angle: -90, position: "insideLeft", fill: "#71717a", fontSize: 11 }}
            />
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0]?.payload;
                return (
                  <div className="bg-surface-muted rounded-lg px-3 py-2 border border-surface-border shadow-xl">
                    <p className="text-xs text-text-secondary">{data?.name} · {data?.date}</p>
                    <p className="text-sm text-white">{data?.watts}W @ {data?.hr} bpm</p>
                    <p className="text-xs text-text-muted">Efficiency: {data?.efficiency} W/bpm</p>
                  </div>
                );
              }}
            />
            <Scatter data={rides} fill="hsl(221, 83%, 53%)" fillOpacity={0.7} r={5} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
