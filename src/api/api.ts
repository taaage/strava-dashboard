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

// Precomputed dashboard-ready aggregate for a ride's power/HR/cadence
// streams. The backend never ships raw per-second arrays for chart data —
// only this small summary (see strava-api's stream-summary.service.ts).
export interface RideStreamSummary {
  activityId: number;
  date: string;
  name: string;
  // seconds -> best average watts for that duration, within this ride.
  bestEfforts: Record<number, number>;
  avgWatts: number | null;
  avgHr: number | null;
  hrDropout: boolean;
  // 5rpm bucket -> seconds spent there (coasting excluded).
  cadenceHistogram: Record<number, number>;
  // Seconds spent in each zone, index-aligned with the athlete's current
  // power/HR zone boundaries (see AthleteZones below).
  powerZoneSeconds: number[] | null;
  hrZoneSeconds: number[] | null;
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

export function getRideStreams(): Promise<RideStreamSummary[]> {
  return apiFetch("/api/ride-streams", []);
}

export function getAthleteZones(): Promise<AthleteZones | null> {
  return apiFetch("/api/athlete-zones", null);
}

export interface SegmentEffortSummary {
  id: number;
  segmentId: number;
  name: string;
  elapsedTime: number;
  movingTime: number;
  distance: number;
  averageWatts: number | null;
  prRank: number | null;
  komRank: number | null;
}

export interface RideDetail {
  activityId: number;
  date: string;
  name: string;
  type: string;
  distance: number;
  movingTime: number;
  totalElevationGain: number;
  map: {
    polyline: string | null;
    summaryPolyline: string | null;
  };
  streams: {
    time: number[] | null;
    latlng: [number, number][] | null;
    altitude: number[] | null;
    distance: number[] | null;
    velocity: number[] | null;
    grade: number[] | null;
  };
  segmentEfforts: SegmentEffortSummary[];
}

export function getRideDetails(): Promise<RideDetail[]> {
  return apiFetch("/api/ride-details", []);
}

export function getRideDetail(activityId: number): Promise<RideDetail | null> {
  return apiFetch(`/api/ride-details/${activityId}`, null);
}
