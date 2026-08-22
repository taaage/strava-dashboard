const API_BASE = import.meta.env.VITE_API_BASE ?? "https://api.tiggenilsson.se";
const USE_MOCK = import.meta.env.DEV && !import.meta.env.VITE_API_BASE;

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
  powerZones: Record<string, number>;
  hrZones: Record<string, number>;
}

async function apiFetch<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

export function getAthlete(): Promise<StravaAthlete> {
  if (USE_MOCK) return import("./mock").then((m) => m.mockAthlete);
  return apiFetch("/api/athlete");
}

export function getStats(): Promise<StravaStats> {
  if (USE_MOCK) return import("./mock").then((m) => m.mockStats);
  return apiFetch("/api/stats");
}

export function getActivities(): Promise<StravaActivity[]> {
  if (USE_MOCK) return import("./mock").then((m) => m.mockActivities);
  return apiFetch("/api/activities?pages=10");
}

export function getPowerRecords(): Promise<PowerRecords> {
  if (USE_MOCK) return import("./mock").then((m) => m.mockPowerRecords);
  return apiFetch("/api/power-records?max=20");
}

export function getZones(): Promise<ZoneData> {
  if (USE_MOCK) return import("./mock").then((m) => m.mockZones);
  return apiFetch("/api/zones?max=20");
}
