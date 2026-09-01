import { useQuery } from "@tanstack/react-query";
import { getRideDetails } from "../../api/api";
import { RideMap } from "./RideMap";
import { ElevationProfile } from "./ElevationProfile";

interface RideDetailPanelProps {
  activityId: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${s}s`;
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
      <div className="px-4 pb-4 text-sm text-text-muted">Loading details…</div>
    );
  }

  if (!ride) {
    return (
      <div className="px-4 pb-4 text-sm text-text-muted">
        No detailed data for this ride.
      </div>
    );
  }

  const hasGps =
    Array.isArray(ride.streams.latlng) && ride.streams.latlng.length > 10;
  const hasElevation =
    !!ride.streams.altitude?.length && !!ride.streams.distance?.length;

  // Notable efforts first (PRs / KOMs), then longest.
  const efforts = [...ride.segmentEfforts]
    .sort((a, b) => {
      const aRank = a.prRank ?? a.komRank ?? 99;
      const bRank = b.prRank ?? b.komRank ?? 99;
      if (aRank !== bRank) return aRank - bRank;
      return b.distance - a.distance;
    })
    .slice(0, 8);

  return (
    <div className="px-4 pb-4 space-y-4">
      {hasGps ? (
        <RideMap latlng={ride.streams.latlng!} height={260} />
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

      {efforts.length > 0 && (
        <div>
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
            Segments ({ride.segmentEfforts.length})
          </p>
          <div className="flex flex-col gap-1">
            {efforts.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between text-sm py-1"
              >
                <span className="text-text-secondary truncate mr-3">
                  {e.name}
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  {e.prRank === 1 && (
                    <span className="text-xs text-yellow-400">🏆 PR</span>
                  )}
                  {e.komRank && e.komRank <= 10 && (
                    <span className="text-xs text-purple-400">
                      KOM #{e.komRank}
                    </span>
                  )}
                  <span className="text-text-primary tabular-nums">
                    {formatTime(e.elapsedTime)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
