import { type RideStream, type AthleteZones } from "../../api/api";

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

function buildZoneBoundaries(zones: { min: number; max: number }[], names: string[]) {
  return zones.map((z, i) => ({
    min: z.min,
    max: z.max === -1 ? 9999 : z.max,
    name: names[i] ?? `Z${i + 1}`,
  }));
}

function computeTimeInZones(
  data: number[],
  zoneBoundaries: { min: number; max: number; name: string }[],
): ZoneEntry[] {
  const counts = zoneBoundaries.map((z) => ({ name: z.name, seconds: 0 }));

  for (const value of data) {
    for (let i = 0; i < zoneBoundaries.length; i++) {
      if (value >= zoneBoundaries[i].min && value < zoneBoundaries[i].max) {
        counts[i].seconds++;
        break;
      }
    }
  }

  const total = counts.reduce((s, z) => s + z.seconds, 0);
  return counts.map((z) => ({
    name: z.name,
    seconds: z.seconds,
    hours: Math.round((z.seconds / 3600) * 10) / 10,
    percentage: total > 0 ? Math.round((z.seconds / total) * 100) : 0,
  }));
}

export function computePowerZones(streams: RideStream[], athleteZones: AthleteZones): ZoneEntry[] {
  const boundaries = buildZoneBoundaries(athleteZones.power.zones, POWER_ZONE_NAMES);
  const allWatts: number[] = [];

  for (const stream of streams) {
    if (stream.watts.length === 0) continue;
    allWatts.push(...stream.watts);
  }

  return computeTimeInZones(allWatts, boundaries);
}

export function computeHrZones(streams: RideStream[], athleteZones: AthleteZones): ZoneEntry[] {
  const boundaries = buildZoneBoundaries(athleteZones.heart_rate.zones, HR_ZONE_NAMES);
  const allHr: number[] = [];

  for (const stream of streams) {
    if (!stream.heartrate || stream.heartrate.length === 0) continue;
    allHr.push(...stream.heartrate);
  }

  return computeTimeInZones(allHr, boundaries);
}

export function filterStreamsByDays(streams: RideStream[], days: number): RideStream[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return streams.filter((s) => new Date(s.date) >= cutoff);
}
