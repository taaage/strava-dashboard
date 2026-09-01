/** Centralized React Query keys so cache reads/writes stay consistent. */
export const queryKeys = {
  athlete: ["athlete"] as const,
  stats: ["stats"] as const,
  activities: ["activities"] as const,
  rideStreams: ["rideStreams"] as const,
  rideDetails: ["rideDetails"] as const,
  athleteZones: ["athleteZones"] as const,
};
