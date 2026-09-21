import { type RideStreamSummary, type AthleteZones } from "../../api/api";

const POWER_ZONE_NAMES = [
  "Z1 Recovery",
  "Z2 Endurance",
  "Z3 Tempo",
  "Z4 Threshold",
  "Z5 VO2max",
  "Z6 Anaerobic",
  "Z7 Neuromuscular",
];

const HR_ZONE_NAMES = [
  "Z1 Recovery",
  "Z2 Endurance",
  "Z3 Tempo",
  "Z4 Threshold",
  "Z5 VO2max",
];

export interface ZoneEntry {
  name: string;
  seconds: number;
  hours: number;
  percentage: number;
}

function buildZoneNames(count: number, names: string[]): string[] {
  return Array.from({ length: count }, (_, i) => names[i] ?? `Z${i + 1}`);
}

function sumZoneSeconds(
  summaries: RideStreamSummary[],
  pick: (s: RideStreamSummary) => number[] | null,
  zoneCount: number,
  names: string[],
): ZoneEntry[] {
  const totals = new Array(zoneCount).fill(0);
  for (const summary of summaries) {
    const seconds = pick(summary);
    if (!seconds) continue;
    for (let i = 0; i < zoneCount; i++) {
      totals[i] += seconds[i] ?? 0;
    }
  }

  const total = totals.reduce((s, v) => s + v, 0);
  const zoneNames = buildZoneNames(zoneCount, names);
  return totals.map((seconds, i) => ({
    name: zoneNames[i],
    seconds,
    hours: Math.round((seconds / 3600) * 10) / 10,
    percentage: total > 0 ? Math.round((seconds / total) * 100) : 0,
  }));
}

export function computePowerZones(
  summaries: RideStreamSummary[],
  athleteZones: AthleteZones,
): ZoneEntry[] {
  return sumZoneSeconds(
    summaries,
    (s) => s.powerZoneSeconds,
    athleteZones.power.zones.length,
    POWER_ZONE_NAMES,
  );
}

export function computeHrZones(
  summaries: RideStreamSummary[],
  athleteZones: AthleteZones,
): ZoneEntry[] {
  return sumZoneSeconds(
    summaries,
    (s) => s.hrZoneSeconds,
    athleteZones.heart_rate.zones.length,
    HR_ZONE_NAMES,
  );
}

export function filterStreamsByDays(
  summaries: RideStreamSummary[],
  days: number,
): RideStreamSummary[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return summaries.filter((s) => new Date(s.date) >= cutoff);
}
