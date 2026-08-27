const API_BASE = import.meta.env.VITE_API_BASE as string;

if (!API_BASE) {
  throw new Error("VITE_API_BASE is required. Set it in .env.local");
}

export interface StravaAthlete {
  id: number;
  firstname: string;
  lastname: string;
  profile: string;
  city: string;
  country: string;
  weight: number;
  ftp: number;
  sex: string;
  bikes: { id: string; name: string; distance: number }[];
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

export interface RideStream {
  activityId: number;
  date: string;
  name: string;
  watts: number[];
  heartrate: number[] | null;
  cadence: number[] | null;
}

const EMPTY_STATS: StravaStats = {
  recent_ride_totals: {
    count: 0,
    distance: 0,
    moving_time: 0,
    elapsed_time: 0,
    elevation_gain: 0,
  },
  ytd_ride_totals: {
    count: 0,
    distance: 0,
    moving_time: 0,
    elapsed_time: 0,
    elevation_gain: 0,
  },
  all_ride_totals: {
    count: 0,
    distance: 0,
    moving_time: 0,
    elapsed_time: 0,
    elevation_gain: 0,
  },
};

export interface AthleteZones {
  heart_rate: { zones: { min: number; max: number }[] };
  power: { zones: { min: number; max: number }[] };
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

export function getAthlete(): Promise<StravaAthlete | null> {
  return apiFetch("/api/athlete", null);
}

export function getStats(): Promise<StravaStats> {
  return apiFetch("/api/stats", EMPTY_STATS);
}

export function getActivities(): Promise<StravaActivity[]> {
  return apiFetch("/api/activities", []);
}

export function getRideStreams(): Promise<RideStream[]> {
  return apiFetch("/api/ride-streams", []);
}

export function getAthleteZones(): Promise<AthleteZones | null> {
  return apiFetch("/api/athlete-zones", null);
}
