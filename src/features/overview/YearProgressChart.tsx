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

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

// Cumulative distance (km) indexed by day-of-year (1..366).
// For the current year, days after today are null so the line stops at today.
function getCumulativeByDay(
  activities: StravaActivity[],
  year: number,
): (number | null)[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const todayOfYear = dayOfYear(now);

  const daily = new Array(367).fill(0);

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
      const day = dayOfYear(new Date(a.start_date_local));
      daily[day] += a.distance / 1000;
    });

  const cumulative: (number | null)[] = [];
  let total = 0;
  for (let d = 1; d <= 366; d++) {
    total += daily[d];
    if (year === currentYear && d > todayOfYear) {
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

  // Cumulative daily goal pace (km) — linear toward the yearly goal.
  const goalPerDay = YEARLY_GOAL / 365;

  // Precompute cumulative-by-day for each selected year.
  const cumulativeByYear: Record<number, (number | null)[]> = {};
  selectedYears.forEach((year) => {
    cumulativeByYear[year] = getCumulativeByDay(activities, year);
  });

  // One data point per day of year (index 0 = day 1).
  const data = Array.from({ length: 366 }, (_, i) => {
    const day = i + 1;
    const point: any = {
      day,
      goal: Math.round(goalPerDay * day),
    };
    selectedYears.forEach((year) => {
      point[year.toString()] = cumulativeByYear[year][i];
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
              dataKey="day"
              type="number"
              domain={[1, 366]}
              ticks={[1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335]}
              tickFormatter={(day) => MONTHS[new Date(2001, 0, day).getMonth()]}
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
                const dateLabel = new Date(
                  2001,
                  0,
                  Number(label),
                ).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                });
                return (
                  <div className="bg-surface-muted rounded-lg px-3 py-2 border border-surface-border shadow-xl">
                    <p className="text-xs text-text-secondary mb-1">
                      {dateLabel}
                    </p>
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
