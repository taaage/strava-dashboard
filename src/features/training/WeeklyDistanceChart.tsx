import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { StravaActivity } from "../../lib/api";
import {
  isRide,
  getMondayKey,
  getWeekLabel,
  filterByDays,
} from "../../lib/activity-utils";
import { useTimeRange } from "../../shared/layout";
import { TimeRangeSelector } from "../../shared/TimeRangeSelector";
import { LineToggle, useLineToggle } from "../../shared/LineToggle";

interface WeeklyAreaChartProps {
  activities: StravaActivity[];
}

const LINES = [
  { key: "outdoor", label: "Outdoor", color: "hsl(221, 83%, 53%)" },
  { key: "indoor", label: "Indoor", color: "hsl(160, 60%, 45%)" },
  { key: "total", label: "Total", color: "#a1a1aa", dashed: true },
];

function getWeeklyData(activities: StravaActivity[], days: number) {
  const rides = filterByDays(activities, days).filter(isRide);
  const weekMap = new Map<string, { outdoor: number; indoor: number }>();

  rides.forEach((ride) => {
    const key = getMondayKey(ride.start_date_local);
    const existing = weekMap.get(key) || { outdoor: 0, indoor: 0 };
    const distKm = ride.distance / 1000;

    if (ride.type === "VirtualRide" || ride.trainer) existing.indoor += distKm;
    else existing.outdoor += distKm;
    weekMap.set(key, existing);
  });

  return Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, data]) => {
      const { week, dateRange } = getWeekLabel(key);
      return {
        week,
        dateRange,
        outdoor: Math.round(data.outdoor * 10) / 10,
        indoor: Math.round(data.indoor * 10) / 10,
        total: Math.round((data.outdoor + data.indoor) * 10) / 10,
      };
    });
}

export function WeeklyAreaChart({ activities }: WeeklyAreaChartProps) {
  const timeRange = useTimeRange(90);
  const data = getWeeklyData(activities, timeRange.days);
  const { visible, toggle } = useLineToggle({
    outdoor: true,
    indoor: false,
    total: false,
  });

  return (
    <div className="bg-surface-card rounded-3xl p-8 border border-surface-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-1">
            Weekly Distance
          </h2>
          <p className="text-sm text-text-muted">Outdoor vs indoor</p>
        </div>
        <div className="flex items-center gap-20">
          <LineToggle lines={LINES} visible={visible} onToggle={toggle} />
          <TimeRangeSelector
            selected={timeRange.selected}
            onChange={timeRange.onChange}
          />
        </div>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272a"
              vertical={false}
            />
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 11 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 11 }}
              domain={[0, "auto"]}
              dx={-4}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload;
                return (
                  <div className="bg-surface-muted rounded-lg px-3 py-2 border border-surface-border shadow-xl">
                    <p className="text-xs text-text-secondary mb-1">
                      {d?.dateRange}
                    </p>
                    {d?.outdoor > 0 && (
                      <p className="text-sm text-[hsl(221,83%,53%)]">
                        Outdoor: {d.outdoor} km
                      </p>
                    )}
                    {d?.indoor > 0 && (
                      <p className="text-sm text-[hsl(160,60%,45%)]">
                        Indoor: {d.indoor} km
                      </p>
                    )}
                    <p className="text-sm font-medium text-white mt-1">
                      Total: {d?.total} km
                    </p>
                  </div>
                );
              }}
            />
            {visible.outdoor && (
              <Line
                type="linear"
                dataKey="outdoor"
                stroke="hsl(221, 83%, 53%)"
                strokeWidth={2}
                dot={{
                  r: 3,
                  fill: "hsl(221, 83%, 53%)",
                  stroke: "#fff",
                  strokeWidth: 1.5,
                }}
              />
            )}
            {visible.indoor && (
              <Line
                type="linear"
                dataKey="indoor"
                stroke="hsl(160, 60%, 45%)"
                strokeWidth={2}
                dot={{
                  r: 3,
                  fill: "hsl(160, 60%, 45%)",
                  stroke: "#fff",
                  strokeWidth: 1.5,
                }}
              />
            )}
            {visible.total && (
              <Line
                type="linear"
                dataKey="total"
                stroke="#a1a1aa"
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
