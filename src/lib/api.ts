const API_BASE = import.meta.env.VITE_API_BASE ?? "https://api.tiggenilsson.se";

export interface StravaAthlete {
  id: number;
  firstname: string;
  lastname: string;
  profile: string;
  city: string;
  country: string;
}

export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  sport_type: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  start_date: string;
  start_date_local: string;
  average_speed: number;
  max_speed: number;
  average_watts?: number;
  max_watts?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  suffer_score?: number;
  kudos_count: number;
  trainer: boolean;
}

export interface StravaStats {
  recent_ride_totals: RideTotals;
  ytd_ride_totals: RideTotals;
  all_ride_totals: RideTotals;
}

interface RideTotals {
  count: number;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  elevation_gain: number;
}

export interface PowerRecords {
  "5s": number;
  "15s": number;
  "30s": number;
  "1min": number;
  "2min": number;
  "3min": number;
  "5min": number;
  "8min": number;
  "10min": number;
  "15min": number;
  "20min": number;
  "30min": number;
  "45min": number;
  "60min": number;
}

export interface ZoneData {
  power: ZoneEntry[];
  hr: ZoneEntry[];
}

interface ZoneEntry {
  name: string;
  seconds: number;
  hours: number;
  percentage: number;
}

async function apiFetch<T>(endpoint: string, fallback: T): Promise<T> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${API_BASE}${endpoint}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) return fallback;
    const data = await response.json();
    return data ?? fallback;
  } catch {
    return fallback;
  }
}

const EMPTY_STATS: StravaStats = {
  recent_ride_totals: { count: 0, distance: 0, moving_time: 0, elapsed_time: 0, elevation_gain: 0 },
  ytd_ride_totals: { count: 0, distance: 0, moving_time: 0, elapsed_time: 0, elevation_gain: 0 },
  all_ride_totals: { count: 0, distance: 0, moving_time: 0, elapsed_time: 0, elevation_gain: 0 },
};

const EMPTY_POWER: PowerRecords = {
  "5s": 0, "15s": 0, "30s": 0, "1min": 0, "2min": 0, "3min": 0,
  "5min": 0, "8min": 0, "10min": 0, "15min": 0, "20min": 0,
  "30min": 0, "45min": 0, "60min": 0,
};

const EMPTY_ZONES: ZoneData = { power: [], hr: [] };

export function getAthlete(): Promise<StravaAthlete | null> {
  return apiFetch("/api/athlete", null);
}

export function getStats(): Promise<StravaStats> {
  return apiFetch("/api/stats", EMPTY_STATS);
}

export function getActivities(): Promise<StravaActivity[]> {
  return apiFetch("/api/activities", []);
}

export function getPowerRecords(): Promise<PowerRecords> {
  return apiFetch("/api/power-records", EMPTY_POWER);
}

export function getZones(): Promise<ZoneData> {
  return apiFetch("/api/zones", EMPTY_ZONES);
}
