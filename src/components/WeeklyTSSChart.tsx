import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { StravaActivity } from "../lib/api";
import { TimeRangeSelector } from "./TimeRangeSelector";

interface WeeklyTSSChartProps {
  activities: StravaActivity[];
}

const FTP = 325;

function calculateTSS(activity: StravaActivity): number {
  if (!activity.average_watts || activity.average_watts === 0) return 0;
  const np = activity.average_watts * 1.05;
  const intensityFactor = np / FTP;
  const tss = (activity.moving_time * np * intensityFactor) / (FTP * 3600) * 100;
  return Math.round(tss);
}

function getWeeklyTSS(activities: StravaActivity[], days: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const rides = activities.filter(
    (a) =>
      (a.type === "Ride" || a.sport_type === "Ride" || a.type === "VirtualRide") &&
      new Date(a.start_date_local) >= cutoff
  );

  const weekMap = new Map<string, number>();

  rides.forEach((ride) => {
    const date = new Date(ride.start_date_local);
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + 1);
    const key = startOfWeek.toISOString().split("T")[0];

    const existing = weekMap.get(key) || 0;
    weekMap.set(key, existing + calculateTSS(ride));
  });

  const entries = Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, tss]) => {
      const date = new Date(week);
      const sunday = new Date(date);
      sunday.setDate(date.getDate() + 6);
      const startOfYear = new Date(date.getFullYear(), 0, 1);
      const weekNum = Math.ceil(((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
      const dateRange = `${date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${sunday.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
      return {
        week: `W${weekNum}`,
        dateRange,
        tss,
      };
    });

  const maxTSS = Math.max(...entries.map((e) => e.tss), 1);
  return entries.map((e) => ({ ...e, intensity: e.tss / maxTSS }));
}

export function WeeklyTSSChart({ activities }: WeeklyTSSChartProps) {
  const [days, setDays] = useState(90);
  const data = getWeeklyTSS(activities, days);

  return (
    <div className="bg-surface-card rounded-3xl p-8 border border-surface-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-1">Weekly TSS</h2>
          <p className="text-sm text-text-muted">Training Stress Score per week (FTP: {FTP}W)</p>
        </div>
        <TimeRangeSelector selected={days} onChange={setDays} />
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 11 }} dy={8} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 11 }} domain={[0, "auto"]} dx={-4} />
            <Tooltip
              cursor={{ fill: "rgba(39, 39, 42, 0.5)" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const dateRange = payload[0]?.payload?.dateRange;
                return (
                  <div className="bg-surface-muted rounded-lg px-3 py-2 border border-surface-border shadow-xl">
                    <p className="text-xs text-text-secondary mb-1">{dateRange || label}</p>
                    <p className="text-sm font-medium text-white">TSS: {payload[0].value}</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="tss" radius={[6, 6, 0, 0]} maxBarSize={32}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={`hsla(280, 65%, ${30 + entry.intensity * 35}%, ${0.4 + entry.intensity * 0.6})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
