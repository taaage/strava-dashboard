import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Line, ComposedChart } from "recharts";
import { StravaActivity } from "../lib/api";
import { TimeRangeSelector } from "./TimeRangeSelector";

interface FitnessChartProps {
  activities: StravaActivity[];
}

const FTP = 325;
const CTL_DAYS = 42;
const ATL_DAYS = 7;

function calculateTSS(activity: StravaActivity): number {
  if (!activity.average_watts || activity.average_watts === 0) return 0;

  // Simplified TSS: (seconds * NP * IF) / (FTP * 3600) * 100
  // We approximate NP as average_watts * 1.05 (rough estimate without stream data)
  const np = activity.average_watts * 1.05;
  const intensityFactor = np / FTP;
  const tss = (activity.moving_time * np * intensityFactor) / (FTP * 3600) * 100;
  return Math.round(tss);
}

function calculateFitnessData(activities: StravaActivity[]) {
  const rides = activities
    .filter((a) => a.type === "Ride" || a.sport_type === "Ride" || a.type === "VirtualRide")
    .sort((a, b) => new Date(a.start_date_local).getTime() - new Date(b.start_date_local).getTime());

  if (rides.length === 0) return [];

  // Build daily TSS map
  const firstDate = new Date(rides[0].start_date_local);
  const today = new Date();
  const dailyTSS = new Map<string, number>();

  rides.forEach((ride) => {
    const dateKey = new Date(ride.start_date_local).toISOString().split("T")[0];
    const existing = dailyTSS.get(dateKey) || 0;
    dailyTSS.set(dateKey, existing + calculateTSS(ride));
  });

  // Calculate CTL, ATL, TSB for each day
  const data: { date: string; fitness: number; fatigue: number; form: number; tss: number }[] = [];
  let ctl = 0;
  let atl = 0;

  const current = new Date(firstDate);
  while (current <= today) {
    const dateKey = current.toISOString().split("T")[0];
    const tss = dailyTSS.get(dateKey) || 0;

    // Exponential decay
    ctl = ctl + (tss - ctl) * (1 / CTL_DAYS);
    atl = atl + (tss - atl) * (1 / ATL_DAYS);
    const tsb = ctl - atl;

    data.push({
      date: current.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      fitness: Math.round(ctl),
      fatigue: Math.round(atl),
      form: Math.round(tsb),
      tss,
    });

    current.setDate(current.getDate() + 1);
  }

  return data;
}

export function FitnessChart({ activities }: FitnessChartProps) {
  const [days, setDays] = useState(90);
  const allData = calculateFitnessData(activities);
  const data = allData.slice(-days);

  return (
    <div className="bg-surface-card rounded-3xl p-8 border border-surface-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-1">Fitness & Form</h2>
          <p className="text-sm text-text-muted">Based on TSS (FTP: {FTP}W)</p>
        </div>
        <TimeRangeSelector selected={days} onChange={setDays} />
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="colorFitness" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorFatigue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 70%, 55%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(0, 70%, 55%)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 10 }}
              dy={8}
              interval={Math.max(0, Math.floor(data.length / 7))}
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 11 }} dx={-4} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                return (
                  <div className="bg-surface-muted rounded-lg px-3 py-2 border border-surface-border shadow-xl">
                    <p className="text-xs text-text-secondary mb-1">{d?.date}</p>
                    <p className="text-sm text-[hsl(221,83%,53%)]">Fitness (CTL): {d?.fitness}</p>
                    <p className="text-sm text-[hsl(0,70%,55%)]">Fatigue (ATL): {d?.fatigue}</p>
                    <p className={`text-sm font-medium ${d?.form >= 0 ? "text-green-400" : "text-orange-400"}`}>
                      Form (TSB): {d?.form}
                    </p>
                    {d?.tss > 0 && <p className="text-xs text-text-muted mt-1">TSS: {d?.tss}</p>}
                  </div>
                );
              }}
            />
            <Area type="monotone" dataKey="fitness" stroke="hsl(221, 83%, 53%)" strokeWidth={2.5} fill="url(#colorFitness)" />
            <Area type="monotone" dataKey="fatigue" stroke="hsl(0, 70%, 55%)" strokeWidth={1.5} fill="url(#colorFatigue)" strokeDasharray="4 2" />
            <Line type="monotone" dataKey="form" stroke="hsl(160, 60%, 45%)" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-text-muted">
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[hsl(221,83%,53%)] rounded inline-block" /> Fitness</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 border-t-2 border-dashed border-[hsl(0,70%,55%)] inline-block" /> Fatigue</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[hsl(160,60%,45%)] rounded inline-block" /> Form</span>
      </div>
    </div>
  );
}
