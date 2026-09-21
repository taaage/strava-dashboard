import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRideDetail } from "../../api/api";
import { queryKeys } from "../../api/queryKeys";
import { RideMap } from "./RideMap";
import { ElevationProfile } from "./ElevationProfile";
import { hasElevation, hasGps } from "./utils";

// Detail-panel layout heights (px).
const PANEL_MAP_HEIGHT = 440;
const PANEL_ELEVATION_HEIGHT = 120;

interface RideDetailPanelProps {
  activityId: number;
}

function PanelMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 pt-3 pb-4 text-sm text-text-muted">{children}</div>
  );
}

export function RideDetailPanel({ activityId }: RideDetailPanelProps) {
  const [hoverFraction, setHoverFraction] = useState<number | null>(null);

  // Fetch only this ride's detail (incl. streams) instead of the whole history.
  const { data: ride, isLoading } = useQuery({
    queryKey: queryKeys.rideDetail(activityId),
    queryFn: () => getRideDetail(activityId),
  });

  if (isLoading) return <PanelMessage>Loading details…</PanelMessage>;
  if (!ride) return <PanelMessage>No detailed data for this ride.</PanelMessage>;

  return (
    <div className="px-4 pt-3 pb-4 space-y-4">
      {hasGps(ride) ? (
        <RideMap
          latlng={ride.streams.latlng!}
          height={PANEL_MAP_HEIGHT}
          hoverFraction={hoverFraction}
        />
      ) : (
        <div className="flex items-center justify-center h-24 text-sm text-text-muted rounded-2xl border border-surface-border">
          No GPS data (indoor ride)
        </div>
      )}

      {hasElevation(ride) && (
        <div>
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">
            Elevation
          </p>
          <ElevationProfile
            altitude={ride.streams.altitude!}
            distance={ride.streams.distance!}
            height={PANEL_ELEVATION_HEIGHT}
            onHoverFraction={setHoverFraction}
          />
        </div>
      )}
    </div>
  );
}
