import { type RideStreamSummary } from "../../api/api";

export type RideCategory = "Race" | "Tempo" | "Endurance" | "Recovery";

// Override via VITE_CATEGORY_*_MIN_WATTS env vars
const RACE_MIN = Number(import.meta.env.VITE_CATEGORY_RACE_MIN_WATTS) || 250;
const TEMPO_MIN = Number(import.meta.env.VITE_CATEGORY_TEMPO_MIN_WATTS) || 200;
const ENDURANCE_MIN =
  Number(import.meta.env.VITE_CATEGORY_ENDURANCE_MIN_WATTS) || 150;

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
    minWatts: RACE_MIN,
    maxWatts: 9999,
    color: "hsl(0, 70%, 55%)",
  },
  {
    key: "Tempo",
    label: "Tempo",
    minWatts: TEMPO_MIN,
    maxWatts: RACE_MIN,
    color: "hsl(30, 80%, 55%)",
  },
  {
    key: "Endurance",
    label: "Zone 2",
    minWatts: ENDURANCE_MIN,
    maxWatts: TEMPO_MIN,
    color: "hsl(221, 83%, 53%)",
  },
  {
    key: "Recovery",
    label: "Zzz",
    minWatts: 0,
    maxWatts: ENDURANCE_MIN,
    color: "hsl(160, 60%, 45%)",
  },
];

function categorizeRide(avgWatts: number): RideCategory {
  if (avgWatts >= RACE_MIN) return "Race";
  if (avgWatts >= TEMPO_MIN) return "Tempo";
  if (avgWatts >= ENDURANCE_MIN) return "Endurance";
  return "Recovery";
}

export interface HrPowerPoint {
  activityId: number;
  name: string;
  watts: number;
  hr: number;
  category: RideCategory;
}

export function computeHrVsPower(summaries: RideStreamSummary[]): HrPowerPoint[] {
  return summaries
    .filter((s) => s.avgHr != null && s.avgWatts != null && !s.hrDropout)
    .map((s) => ({
      activityId: s.activityId,
      name: s.name,
      watts: s.avgWatts!,
      hr: s.avgHr!,
      category: categorizeRide(s.avgWatts!),
    }))
    .filter((d) => d.hr >= 80 && d.hr <= 210 && d.watts >= 50);
}

export function computeCadenceDistribution(summaries: RideStreamSummary[]) {
  const buckets: Record<number, number> = {};

  for (const summary of summaries) {
    for (const [bucket, seconds] of Object.entries(summary.cadenceHistogram)) {
      buckets[Number(bucket)] = (buckets[Number(bucket)] || 0) + seconds;
    }
  }

  return Object.entries(buckets)
    .map(([rpm, seconds]) => ({ rpm: Number(rpm), seconds }))
    .filter((d) => d.rpm >= 40 && d.rpm <= 130)
    .sort((a, b) => a.rpm - b.rpm)
    .map((d) => ({ ...d, minutes: Math.round(d.seconds / 60) }));
}
