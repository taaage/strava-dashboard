import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from "recharts";
import { ZoneData } from "../lib/api";

interface ZoneChartsProps {
  zones: ZoneData;
}

const POWER_ZONE_CONFIG = [
  { min: 0, max: 179, name: "Z1 Recovery", color: "hsl(210, 50%, 70%)" },
  { min: 180, max: 244, name: "Z2 Endurance", color: "hsl(210, 70%, 55%)" },
  { min: 245, max: 293, name: "Z3 Tempo", color: "hsl(160, 60%, 45%)" },
  { min: 294, max: 341, name: "Z4 Threshold", color: "hsl(45, 80%, 55%)" },
  { min: 342, max: 390, name: "Z5 VO2max", color: "hsl(25, 80%, 55%)" },
  { min: 391, max: 488, name: "Z6 Anaerobic", color: "hsl(0, 70%, 55%)" },
  { min: 489, max: Infinity, name: "Z7 Neuromuscular", color: "hsl(280, 65%, 55%)" },
];

const HR_ZONE_CONFIG = [
  { min: 0, max: 121, name: "Z1 Recovery", color: "hsl(210, 50%, 70%)" },
  { min: 121, max: 147, name: "Z2 Endurance", color: "hsl(210, 70%, 55%)" },
  { min: 147, max: 161, name: "Z3 Tempo", color: "hsl(160, 60%, 45%)" },
  { min: 161, max: 181, name: "Z4 Threshold", color: "hsl(25, 80%, 55%)" },
  { min: 181, max: Infinity, name: "Z5 VO2max", color: "hsl(0, 70%, 55%)" },
];

function aggregateBucketsToZones(
  buckets: Record<string, number>,
  zoneConfig: typeof POWER_ZONE_CONFIG
) {
  const zoneTimes = zoneConfig.map((z) => ({ ...z, time: 0 }));

  Object.entries(buckets).forEach(([key, time]) => {
    const [minStr] = key.split("-");
    const bucketMin = parseInt(minStr);
    for (let i = zoneTimes.length - 1; i >= 0; i--) {
      if (bucketMin >= zoneTimes[i].min) {
        zoneTimes[i].time += time;
        break;
      }
    }
  });

  const totalTime = zoneTimes.reduce((sum, z) => sum + z.time, 0);

  return zoneTimes.map((z) => ({
    name: z.name,
    hours: Math.round((z.time / 3600) * 10) / 10,
    minutes: Math.round(z.time / 60),
    percentage: totalTime > 0 ? Math.round((z.time / totalTime) * 100) : 0,
    color: z.color,
  }));
}

function CustomLabel(props: any) {
  const { x, y, width, height, value } = props;
  if (width < 50) return null;
  return (
    <text x={x + 10} y={y + height / 2} fill="white" fontSize={11} fontWeight={500} dominantBaseline="middle">
      {value}
    </text>
  );
}

function PercentageLabel(props: any) {
  const { x, y, width, height, value } = props;
  return (
    <text x={x + width + 8} y={y + height / 2} fill="#a1a1aa" fontSize={11} dominantBaseline="middle">
      {value}%
    </text>
  );
}

export function PowerZoneChart({ zones }: ZoneChartsProps) {
  const data = aggregateBucketsToZones(zones.powerZones, POWER_ZONE_CONFIG);

  return (
    <div className="bg-surface-card rounded-3xl p-8 border border-surface-border">
      <h2 className="text-lg font-semibold text-text-primary mb-1">Power Zones</h2>
      <p className="text-sm text-text-muted mb-6">Time in zone from last 20 rides</p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barCategoryGap="20%" margin={{ right: 50 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" hide />
            <Bar dataKey="hours" radius={[6, 6, 6, 6]} maxBarSize={28} background={{ fill: "#1c1c1f", radius: 6 }}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
              <LabelList dataKey="name" content={CustomLabel} />
              <LabelList dataKey="percentage" content={PercentageLabel} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function HRZoneChart({ zones }: ZoneChartsProps) {
  const data = aggregateBucketsToZones(zones.hrZones, HR_ZONE_CONFIG);

  return (
    <div className="bg-surface-card rounded-3xl p-8 border border-surface-border">
      <h2 className="text-lg font-semibold text-text-primary mb-1">Heart Rate Zones</h2>
      <p className="text-sm text-text-muted mb-6">Time in zone from last 20 rides</p>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barCategoryGap="20%" margin={{ right: 50 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" hide />
            <Bar dataKey="hours" radius={[6, 6, 6, 6]} maxBarSize={28} background={{ fill: "#1c1c1f", radius: 6 }}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
              <LabelList dataKey="name" content={CustomLabel} />
              <LabelList dataKey="percentage" content={PercentageLabel} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
