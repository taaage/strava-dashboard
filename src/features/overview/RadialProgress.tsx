import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";

interface RadialProgressProps {
  title: string;
  value: number;
  max: number;
  unit: string;
  color: string;
  subtitle?: string;
}

export function RadialProgress({
  title,
  value,
  max,
  unit,
  color,
  subtitle,
}: RadialProgressProps) {
  const rawPct = (value / max) * 100;
  const isOverflow = rawPct > 100;
  const displayPct = isOverflow ? rawPct % 100 : rawPct;

  const data = isOverflow
    ? [
        { value: displayPct, fill: color, fillOpacity: 0.5 },
        { value: 100, fill: color },
      ]
    : [{ value: displayPct, fill: color }];

  return (
    <div className="bg-surface-card rounded-3xl p-3 sm:p-6 border border-surface-border flex flex-col items-center">
      <p className="text-xs sm:text-sm font-medium text-text-muted mb-1 sm:mb-2">{title}</p>
      <div className="h-20 w-20 sm:h-36 sm:w-36">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius={isOverflow ? "60%" : "75%"}
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            data={data}
            barSize={10}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: "#27272a" }}
              dataKey="value"
              cornerRadius={12}
              angleAxisId={0}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center mt-1 sm:-mt-2">
        <p className="text-sm sm:text-xl font-semibold text-text-primary">
          {Math.round(value)}
          <span className="text-xs sm:text-sm font-normal text-text-muted hidden sm:inline">
            {" "}/ {Math.round(max)} {unit}
          </span>
          <span className="text-xs font-normal text-text-muted sm:hidden">
            {" "}{unit}
          </span>
        </p>
        {subtitle && <p className="text-xs text-text-muted mt-1 hidden sm:block">{subtitle}</p>}
      </div>
    </div>
  );
}
