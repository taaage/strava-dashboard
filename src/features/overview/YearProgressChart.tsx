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

// Maps a 1-based day-of-year to a Date in a leap year (2000) so that day 366
// (Dec 31) is representable. Used only for axis/tooltip labels.
function dayToLabelDate(day: number): Date {
  return new Date(2000, 0, day);
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

  // Sample at ~weekly intervals by day-of-year: day 1, 8, 15, … and always
  // day 366 (Dec 31), plus today. This keeps the x-axis spanning the full
  // Jan 1 – Dec 31 range, and the current year's line ends exactly at today.
  // Day-of-year sampling keeps cross-year comparison fair (same day = same point).
  const todayOfYear = dayOfYear(now);
  const sampleDays: number[] = [];
  for (let d = 1; d <= 366; d += 7) sampleDays.push(d);
  if (!sampleDays.includes(366)) sampleDays.push(366);
  if (!sampleDays.includes(todayOfYear)) sampleDays.push(todayOfYear);
  sampleDays.sort((a, b) => a - b);

  const data = sampleDays.map((day) => {
    const point: any = {
      day,
      goal: Math.round(Math.min(goalPerDay * day, YEARLY_GOAL)),
    };
    selectedYears.forEach((year) => {
      // cumulative array is 0-indexed by (day - 1)
      point[year.toString()] = cumulativeByYear[year][day - 1];
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
              ticks={[1, 32, 61, 92, 122, 153, 183, 214, 245, 275, 306, 336]}
              tickFormatter={(day) => MONTHS[dayToLabelDate(day).getMonth()]}
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
                const dateLabel = dayToLabelDate(
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
