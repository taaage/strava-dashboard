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
