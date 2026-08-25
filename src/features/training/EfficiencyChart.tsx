import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { StravaActivity } from "../../api/api";
import { ChartCard, useTimeRange } from "../../shared/layout";

interface EfficiencyAreaChartProps {
  activities: StravaActivity[];
}

export function EfficiencyAreaChart({ activities }: EfficiencyAreaChartProps) {
  const timeRange = useTimeRange(90);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - timeRange.days);

  const rides = activities
    .filter(
      (a) =>
        (a.type === "Ride" ||
          a.sport_type === "Ride" ||
          a.type === "VirtualRide") &&
        a.average_watts &&
        a.average_heartrate &&
        a.average_watts > 0 &&
        a.average_heartrate > 0 &&
        new Date(a.start_date_local) >= cutoff,
    )
    .reverse()
    .map((a) => ({
      date: new Date(a.start_date_local).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
      efficiency:
        Math.round((a.average_watts! / a.average_heartrate!) * 100) / 100,
      watts: a.average_watts!,
      hr: Math.round(a.average_heartrate!),
      name: a.name,
    }));

  return (
    <ChartCard
      title="Efficiency Over Time"
      subtitle="Watts per heartbeat — higher = fitter"
      timeRange={timeRange}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rides}>
          <defs>
            <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="hsl(160, 60%, 45%)"
                stopOpacity={0.4}
              />
              <stop
                offset="95%"
                stopColor="hsl(160, 60%, 45%)"
                stopOpacity={0.05}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#27272a"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#71717a", fontSize: 10 }}
            dy={8}
            interval={Math.max(0, Math.floor(rides.length / 6))}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#71717a", fontSize: 11 }}
            domain={["auto", "auto"]}
            dx={-4}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const data = payload[0]?.payload;
              return (
                <div className="bg-surface-muted rounded-lg px-3 py-2 border border-surface-border shadow-xl">
                  <p className="text-xs text-text-secondary mb-1">
                    {data?.name} · {data?.date}
                  </p>
                  <p className="text-sm font-medium text-white">
                    {data?.efficiency} W/bpm
                  </p>
                  <p className="text-xs text-text-muted">
                    {data?.watts}W @ {data?.hr} bpm
                  </p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="efficiency"
            stroke="hsl(160, 60%, 45%)"
            strokeWidth={2.5}
            fill="url(#colorEfficiency)"
            dot={
              rides.length < 30 ? { r: 3, fill: "hsl(160, 60%, 45%)" } : false
            }
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
