import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { StravaActivity } from "../../api/api";

interface YearProgressChartProps {
  activities: StravaActivity[];
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const YEARLY_GOAL = Number(import.meta.env.VITE_YEARLY_GOAL_KM) || 10000;

const YEAR_COLORS = [
  "#e76e50",
  "#2a9d8f",
  "hsl(221, 83%, 53%)",
  "hsl(280, 65%, 60%)",
  "hsl(45, 80%, 55%)",
  "#8FD4B4",
];

function getCumulativeByMonth(
  activities: StravaActivity[],
  year: number,
): (number | null)[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const monthly = new Array(12).fill(0);

  activities
    .filter((a) => {
      const isRide =
        a.type === "Ride" ||
        a.sport_type === "Ride" ||
        a.type === "VirtualRide";
      const date = new Date(a.start_date_local);
      return isRide && date.getFullYear() === year;
    })
    .forEach((a) => {
      const month = new Date(a.start_date_local).getMonth();
      monthly[month] += a.distance / 1000;
    });

  const cumulative: (number | null)[] = [];
  let total = 0;
  for (let i = 0; i < 12; i++) {
    total += monthly[i];
    if (year === currentYear && i > currentMonth) {
      cumulative.push(null);
    } else {
      cumulative.push(Math.round(total));
    }
  }
  return cumulative;
}

function getAvailableYears(activities: StravaActivity[]): number[] {
  const years = new Set<number>();
  activities.forEach((a) => {
    const isRide =
      a.type === "Ride" || a.sport_type === "Ride" || a.type === "VirtualRide";
    if (isRide) years.add(new Date(a.start_date_local).getFullYear());
  });
  return Array.from(years).sort((a, b) => b - a);
}

export function YearProgressChart({ activities }: YearProgressChartProps) {
  const now = new Date();
  const thisYear = now.getFullYear();
  const availableYears = getAvailableYears(activities);
  const [selectedYears, setSelectedYears] = useState<number[]>([
    thisYear,
    thisYear - 1,
  ]);

  const toggleYear = (year: number) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year],
    );
  };

  const goalPace = MONTHS.map((_, i) =>
    Math.round((YEARLY_GOAL / 12) * (i + 1)),
  );

  const data = MONTHS.map((month, i) => {
    const point: any = { month, goal: goalPace[i] };
    selectedYears.forEach((year) => {
      point[year.toString()] = getCumulativeByMonth(activities, year)[i];
    });
    return point;
  });

  // Sort selected years descending for consistent color assignment
  const sortedSelected = [...selectedYears].sort((a, b) => b - a);

  return (
    <div className="bg-surface-card rounded-3xl p-5 sm:p-8 border border-surface-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-1">
            Year Progress
          </h2>
          <p className="text-sm text-text-muted">
            Cumulative distance toward {YEARLY_GOAL.toLocaleString()} km
          </p>
        </div>
        <div className="flex gap-1 flex-wrap">
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => toggleYear(year)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                selectedYears.includes(year)
                  ? "bg-surface-muted text-text-primary"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <span className="sm:hidden">'{String(year).slice(2)}</span>
              <span className="hidden sm:inline">{year}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 11 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 11 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              dx={-4}
              domain={[0, YEARLY_GOAL]}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="bg-surface-muted rounded-lg px-3 py-2 border border-surface-border shadow-xl">
                    <p className="text-xs text-text-secondary mb-1">{label}</p>
                    {payload.map(
                      (entry: any) =>
                        entry.value !== null && (
                          <p
                            key={entry.dataKey}
                            className="text-sm"
                            style={{ color: entry.color }}
                          >
                            {entry.name}:{" "}
                            {Math.round(entry.value).toLocaleString("en-US")} km
                          </p>
                        ),
                    )}
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="goal"
              stroke="#71717a"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              name="Goal pace"
              connectNulls
            />
            {sortedSelected.map((year, i) => (
              <Line
                key={year}
                type="monotone"
                dataKey={year.toString()}
                stroke={YEAR_COLORS[i % YEAR_COLORS.length]}
                strokeWidth={year === thisYear ? 3 : 2}
                dot={false}
                name={year.toString()}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-text-muted flex-wrap">
        {sortedSelected.map((year, i) => (
          <span key={year} className="flex items-center gap-1.5">
            <span
              className="w-3 h-0.5 rounded inline-block"
              style={{ backgroundColor: YEAR_COLORS[i % YEAR_COLORS.length] }}
            />{" "}
            {year}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 border-t-2 border-dashed border-[#71717a] inline-block" />{" "}
          Goal
        </span>
      </div>
    </div>
  );
}
