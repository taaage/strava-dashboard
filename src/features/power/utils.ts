import { type RideStream } from "../../api/api";

export const DURATIONS: { key: string; seconds: number }[] = [
  { key: "5s", seconds: 5 },
  { key: "15s", seconds: 15 },
  { key: "30s", seconds: 30 },
  { key: "1min", seconds: 60 },
  { key: "2min", seconds: 120 },
  { key: "3min", seconds: 180 },
  { key: "5min", seconds: 300 },
  { key: "8min", seconds: 480 },
  { key: "10min", seconds: 600 },
  { key: "15min", seconds: 900 },
  { key: "20min", seconds: 1200 },
  { key: "30min", seconds: 1800 },
  { key: "45min", seconds: 2700 },
  { key: "60min", seconds: 3600 },
];

// Reference values for the radar chart. Override via VITE_POWER_REFERENCE env var (JSON).
// Defaults are ~Cat B racing (3.6 W/kg @ 85 kg).
const DEFAULT_REFERENCE: Record<string, number> = {
  "5s": 1200,
  "15s": 950,
  "30s": 720,
  "1min": 570,
  "2min": 470,
  "3min": 430,
  "5min": 390,
  "8min": 365,
  "10min": 355,
  "15min": 340,
  "20min": 330,
  "30min": 315,
  "45min": 300,
  "60min": 290,
};

export const REFERENCE: Record<string, number> = (() => {
  const raw = import.meta.env.VITE_POWER_REFERENCE;
  if (!raw) return DEFAULT_REFERENCE;
  try {
    return { ...DEFAULT_REFERENCE, ...JSON.parse(raw) };
  } catch {
    console.warn("Invalid VITE_POWER_REFERENCE JSON, using defaults");
    return DEFAULT_REFERENCE;
  }
})();

export function computeBestEffort(
  watts: number[],
  durationSeconds: number,
): number {
  if (watts.length < durationSeconds) return 0;
  let maxAvg = 0;
  let windowSum = 0;
  for (let i = 0; i < durationSeconds; i++) windowSum += watts[i];
  maxAvg = windowSum / durationSeconds;
  for (let i = durationSeconds; i < watts.length; i++) {
    windowSum += watts[i] - watts[i - durationSeconds];
    const avg = windowSum / durationSeconds;
    if (avg > maxAvg) maxAvg = avg;
  }
  return Math.round(maxAvg);
}

export function computeRecords(streams: RideStream[]): Record<string, number> {
  const records: Record<string, number> = {};
  DURATIONS.forEach(({ key }) => (records[key] = 0));

  for (const stream of streams) {
    if (stream.watts.length === 0) continue;
    for (const { key, seconds } of DURATIONS) {
      const best = computeBestEffort(stream.watts, seconds);
      if (best > records[key]) records[key] = best;
    }
  }
  return records;
}

export function filterStreamsByDays(
  streams: RideStream[],
  days: number,
): RideStream[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return streams.filter((s) => new Date(s.date) >= cutoff);
}
