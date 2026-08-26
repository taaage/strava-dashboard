import { type RideStream } from "../../api/api";

export type RideCategory = "Race" | "Tempo" | "Endurance" | "Recovery";

export const CATEGORIES: {
  key: RideCategory;
  label: string;
  minWatts: number;
  maxWatts: number;
  color: string;
}[] = [
  {
    key: "Race",
    label: "Race",
    minWatts: 250,
    maxWatts: 9999,
    color: "hsl(0, 70%, 55%)",
  },
  {
    key: "Tempo",
    label: "Tempo",
    minWatts: 200,
    maxWatts: 250,
    color: "hsl(30, 80%, 55%)",
  },
  {
    key: "Endurance",
    label: "Zone 2",
    minWatts: 150,
    maxWatts: 200,
    color: "hsl(221, 83%, 53%)",
  },
  {
    key: "Recovery",
    label: "Zzz",
    minWatts: 0,
    maxWatts: 150,
    color: "hsl(160, 60%, 45%)",
  },
];

function categorizeRide(avgWatts: number): RideCategory {
  if (avgWatts >= 250) return "Race";
  if (avgWatts >= 200) return "Tempo";
  if (avgWatts >= 150) return "Endurance";
  return "Recovery";
}

export interface HrPowerPoint {
  activityId: number;
  name: string;
  watts: number;
  hr: number;
  category: RideCategory;
}

export function computeHrVsPower(streams: RideStream[]): HrPowerPoint[] {
  return streams
    .filter((s) => s.heartrate && s.heartrate.length > 0 && s.watts.length > 0)
    .filter((s) => {
      // Exclude rides with >10% zero/low HR readings (sensor dropouts)
      const lowReadings = s.heartrate!.filter((hr) => hr < 60).length;
      return lowReadings / s.heartrate!.length < 0.1;
    })
    .map((s) => {
      const avgWatts = Math.round(
        s.watts.reduce((a, b) => a + b, 0) / s.watts.length,
      );
      const avgHr = Math.round(
        s.heartrate!.reduce((a, b) => a + b, 0) / s.heartrate!.length,
      );
      return {
        activityId: s.activityId,
        name: s.name,
        watts: avgWatts,
        hr: avgHr,
        category: categorizeRide(avgWatts),
      };
    })
    .filter((d) => d.hr >= 80 && d.hr <= 210 && d.watts >= 50);
}

export function computeCadenceDistribution(streams: RideStream[]) {
  const buckets: Record<number, number> = {};

  for (const stream of streams) {
    if (!stream.cadence) continue;
    for (const c of stream.cadence) {
      if (c === 0) continue; // skip coasting
      const bucket = Math.floor(c / 5) * 5;
      buckets[bucket] = (buckets[bucket] || 0) + 1;
    }
  }

  return Object.entries(buckets)
    .map(([rpm, seconds]) => ({ rpm: Number(rpm), seconds }))
    .filter((d) => d.rpm >= 40 && d.rpm <= 130)
    .sort((a, b) => a.rpm - b.rpm)
    .map((d) => ({ ...d, minutes: Math.round(d.seconds / 60) }));
}
