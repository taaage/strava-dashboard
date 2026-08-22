import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { StravaActivity } from "../lib/api";
import { TimeRangeSelector } from "./TimeRangeSelector";

interface WeeklyAreaChartProps {
  activities: StravaActivity[];
}

function getWeeklyData(activities: StravaActivity[], days: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const rides = activities.filter(
    (a) =>
      (a.type === "Ride" || a.sport_type === "Ride" || a.type === "VirtualRide") &&
      new Date(a.start_date_local) >= cutoff
  );

  const weekMap = new Map<string, { outdoor: number; indoor: number }>();

  rides.forEach((ride) => {
    const date = new Date(ride.start_date_local);
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + 1);
    const key = startOfWeek.toISOString().split("T")[0];

    const existing = weekMap.get(key) || { outdoor: 0, indoor: 0 };
    const isIndoor = ride.type === "VirtualRide" || ride.trainer;
    const distKm = ride.distance / 1000;

    if (isIndoor) {
      existing.indoor += distKm;
    } else {
      existing.outdoor += distKm;
    }
    weekMap.set(key, existing);
  });

  return Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, data]) => {
      const date = new Date(week);
      const sunday = new Date(date);
      sunday.setDate(date.getDate() + 6);
      const startOfYear = new Date(date.getFullYear(), 0, 1);
      const weekNum = Math.ceil(((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
      const dateRange = `${date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${sunday.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
      return {
        week: `W${weekNum}`,
        dateRange,
        outdoor: Math.round(data.outdoor * 10) / 10,
        indoor: Math.round(data.indoor * 10) / 10,
      };
    });
}

export function WeeklyAreaChart({ activities }: WeeklyAreaChartProps) {
  const [days, setDays] = useState(90);
  const data = getWeeklyData(activities, days);

  return (
    <div className="bg-surface-card rounded-3xl p-8 border border-surface-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-1">Weekly Distance (Area)</h2>
          <p className="text-sm text-text-muted">Outdoor vs indoor</p>
        </div>
        <TimeRangeSelector selected={days} onChange={setDays} />
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorOutdoor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorIndoor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(212, 95%, 68%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(212, 95%, 68%)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 11 }} dy={8} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 11 }} domain={[0, "auto"]} dx={-4} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const dateRange = payload[0]?.payload?.dateRange;
                const total = payload.reduce((sum: number, p: any) => sum + (p.value || 0), 0);
                return (
                  <div className="bg-surface-muted rounded-lg px-3 py-2 border border-surface-border shadow-xl">
                    <p className="text-xs text-text-secondary mb-1">{dateRange || label}</p>
                    {payload.map((entry: any) => (
                      <p key={entry.dataKey} className="text-sm" style={{ color: entry.stroke }}>
                        {entry.name}: {entry.value} km
                      </p>
                    ))}
                    <p className="text-sm font-medium text-white mt-1">Total: {total.toFixed(1)} km</p>
                  </div>
                );
              }}
            />
            <Area type="monotone" dataKey="outdoor" name="Outdoor" stroke="hsl(221, 83%, 53%)" strokeWidth={2} fill="url(#colorOutdoor)" stackId="1" />
            <Area type="monotone" dataKey="indoor" name="Indoor" stroke="hsl(212, 95%, 68%)" strokeWidth={2} fill="url(#colorIndoor)" stackId="1" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-text-muted">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[hsl(221,83%,53%)] inline-block" /> Outdoor</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[hsl(212,95%,68%)] inline-block" /> Indoor</span>
      </div>
    </div>
  );
}
