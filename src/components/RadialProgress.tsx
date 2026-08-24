import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

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
    <div className="bg-surface-card rounded-3xl p-6 border border-surface-border flex flex-col items-center">
      <p className="text-sm font-medium text-text-muted mb-2">{title}</p>
      <div className="h-36 w-36 flex items-center justify-center">
        <RadialBarChart
          width={144}
          height={144}
          cx="50%"
          cy="50%"
          innerRadius={isOverflow ? "60%" : "75%"}
          outerRadius="100%"
          startAngle={90}
          endAngle={-270}
          data={data}
          barSize={12}
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
      </div>
      <div className="text-center -mt-2">
        <p className="text-xl font-semibold text-text-primary">
          {Math.round(value)}{" "}
          <span className="text-sm font-normal text-text-muted">
            / {Math.round(max)} {unit}
          </span>
        </p>
        {subtitle && <p className="text-xs text-text-muted mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
