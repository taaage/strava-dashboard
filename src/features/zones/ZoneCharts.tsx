import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { ZoneData } from "../../api/api";

interface ZoneChartsProps {
  zones: ZoneData;
}

const POWER_COLORS = [
  "hsl(210, 50%, 70%)",
  "hsl(210, 70%, 55%)",
  "hsl(160, 60%, 45%)",
  "hsl(45, 80%, 55%)",
  "hsl(25, 80%, 55%)",
  "hsl(0, 70%, 55%)",
  "hsl(280, 65%, 55%)",
];
const HR_COLORS = [
  "hsl(210, 50%, 70%)",
  "hsl(210, 70%, 55%)",
  "hsl(160, 60%, 45%)",
  "hsl(25, 80%, 55%)",
  "hsl(0, 70%, 55%)",
];

function CustomLabel(props: any) {
  const { x, y, width, height, value } = props;
  if (width < 50) return null;
  return (
    <text
      x={x + 10}
      y={y + height / 2}
      fill="white"
      fontSize={11}
      fontWeight={500}
      dominantBaseline="middle"
    >
      {value}
    </text>
  );
}

function PercentageLabel(props: any) {
  const { x, y, width, height, value } = props;
  return (
    <text
      x={x + width + 8}
      y={y + height / 2}
      fill="#a1a1aa"
      fontSize={11}
      dominantBaseline="middle"
    >
      {value}%
    </text>
  );
}

function ZoneBar({
  data,
  colors,
  height,
}: {
  data: { name: string; hours: number; percentage: number }[];
  colors: string[];
  height: string;
}) {
  return (
    <div className={height}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          barCategoryGap="20%"
          margin={{ right: 50 }}
        >
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" hide />
          <Bar
            dataKey="hours"
            radius={[6, 6, 6, 6]}
            maxBarSize={28}
            background={{ fill: "#1c1c1f", radius: 6 }}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={colors[index]} />
            ))}
            <LabelList dataKey="name" content={CustomLabel} />
            <LabelList dataKey="percentage" content={PercentageLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PowerZoneChart({ zones }: ZoneChartsProps) {
  return (
    <div className="bg-surface-card rounded-3xl p-8 border border-surface-border">
      <h2 className="text-lg font-semibold text-text-primary mb-1">
        Power Zones
      </h2>
      <p className="text-sm text-text-muted mb-6">
        Time in zone from last 20 rides
      </p>
      <ZoneBar data={zones.power} colors={POWER_COLORS} height="h-56" />
    </div>
  );
}

export function HRZoneChart({ zones }: ZoneChartsProps) {
  return (
    <div className="bg-surface-card rounded-3xl p-8 border border-surface-border">
      <h2 className="text-lg font-semibold text-text-primary mb-1">
        Heart Rate Zones
      </h2>
      <p className="text-sm text-text-muted mb-6">
        Time in zone from last 20 rides
      </p>
      <ZoneBar data={zones.hr} colors={HR_COLORS} height="h-44" />
    </div>
  );
}
