import { useQuery } from "@tanstack/react-query";
import { getRideDetails } from "../../api/api";
import { RideMap } from "./RideMap";
import { ElevationProfile } from "./ElevationProfile";

interface RideDetailPanelProps {
  activityId: number;
}

export function RideDetailPanel({ activityId }: RideDetailPanelProps) {
  // ride-details is one cached blob; look up this ride by id.
  const { data: rides = [], isLoading } = useQuery({
    queryKey: ["rideDetails"],
    queryFn: getRideDetails,
  });

  const ride = rides.find((r) => r.activityId === activityId);

  if (isLoading) {
    return (
      <div className="px-4 pt-3 pb-4 text-sm text-text-muted">Loading details…</div>
    );
  }

  if (!ride) {
    return (
      <div className="px-4 pt-3 pb-4 text-sm text-text-muted">
        No detailed data for this ride.
      </div>
    );
  }

  const hasGps =
    Array.isArray(ride.streams.latlng) && ride.streams.latlng.length > 10;
  const hasElevation =
    !!ride.streams.altitude?.length && !!ride.streams.distance?.length;

  return (
    <div className="px-4 pt-3 pb-4 space-y-4">
      {hasGps ? (
        <RideMap latlng={ride.streams.latlng!} height={440} />
      ) : (
        <div className="flex items-center justify-center h-24 text-sm text-text-muted rounded-2xl border border-surface-border">
          No GPS data (indoor ride)
        </div>
      )}

      {hasElevation && (
        <div>
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">
            Elevation
          </p>
          <ElevationProfile
            altitude={ride.streams.altitude!}
            distance={ride.streams.distance!}
            height={120}
          />
        </div>
      )}
    </div>
  );
}
