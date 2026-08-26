import { StravaActivity } from "../api/api";

// Formatting

export function formatDistance(meters: number): string {
  return (meters / 1000).toFixed(1) + " km";
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function formatSpeed(metersPerSecond: number): string {
  return (metersPerSecond * 3.6).toFixed(1) + " km/h";
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatElevation(meters: number): string {
  return Math.round(meters) + " m";
}

// Activity helpers

export function isRide(a: StravaActivity) {
  return (
    a.type === "Ride" || a.sport_type === "Ride" || a.type === "VirtualRide"
  );
}

export function getMondayKey(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + mondayOffset);
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
}

export function getWeekLabel(weekKey: string) {
  const parts = weekKey.split("-");
  const date = new Date(
    parseInt(parts[0]),
    parseInt(parts[1]) - 1,
    parseInt(parts[2]),
  );
  const sunday = new Date(date);
  sunday.setDate(date.getDate() + 6);
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const weekNum = Math.ceil(
    ((date.getTime() - startOfYear.getTime()) / 86400000 +
      startOfYear.getDay() +
      1) /
      7,
  );
  const dateRange = `${date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${sunday.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
  return { week: `W${weekNum}`, dateRange };
}

export function filterByDays(activities: StravaActivity[], days: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return activities.filter((a) => new Date(a.start_date_local) >= cutoff);
}
