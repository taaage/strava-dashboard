import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { StravaActivity } from "../lib/api";

interface YearProgressChartProps {
  activities: StravaActivity[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEARLY_GOAL = 10000;

function getCumulativeByMonth(activities: StravaActivity[], year: number): (number | null)[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const monthly = new Array(12).fill(0);

  activities
    .filter((a) => {
      const isRide = a.type === "Ride" || a.sport_type === "Ride" || a.type === "VirtualRide";
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

export function YearProgressChart({ activities }: YearProgressChartProps) {
  const now = new Date();
  const thisYear = now.getFullYear();
  const lastYear = thisYear - 1;

  const thisYearCumulative = getCumulativeByMonth(activities, thisYear);
  const lastYearCumulative = getCumulativeByMonth(activities, lastYear);
  const goalPace = MONTHS.map((_, i) => Math.round((YEARLY_GOAL / 12) * (i + 1)));

  const data = MONTHS.map((month, i) => ({
    month,
    thisYear: thisYearCumulative[i],
    lastYear: lastYearCumulative[i],
    goal: goalPace[i],
  }));

  return (
    <div className="bg-surface-card rounded-3xl p-8 border border-surface-border">
      <h2 className="text-lg font-semibold text-text-primary mb-1">Year Progress</h2>
      <p className="text-sm text-text-muted mb-6">Cumulative distance toward 10,000 km</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 11 }} dy={8} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} dx={-4} domain={[0, 10000]} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="bg-surface-muted rounded-lg px-3 py-2 border border-surface-border shadow-xl">
                    <p className="text-xs text-text-secondary mb-1">{label}</p>
                    {payload.map((entry: any) => entry.value !== null && (
                      <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {Math.round(entry.value).toLocaleString("en-US")} km
                      </p>
                    ))}
                  </div>
                );
              }}
            />
            <Line type="monotone" dataKey="goal" stroke="#71717a" strokeWidth={2} strokeDasharray="6 4" dot={false} name="Goal pace" connectNulls />
            <Line type="monotone" dataKey="lastYear" stroke="#2a9d8f" strokeWidth={2.5} dot={false} name={lastYear.toString()} connectNulls />
            <Line type="monotone" dataKey="thisYear" stroke="#e76e50" strokeWidth={3} dot={false} name={thisYear.toString()} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-text-muted">
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#e76e50] rounded inline-block" /> {thisYear}</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#2a9d8f] rounded inline-block" /> {lastYear}</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 border-t-2 border-dashed border-[#71717a] inline-block" /> Goal pace</span>
      </div>
    </div>
  );
}
