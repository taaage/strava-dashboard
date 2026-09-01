import { useState } from "react";
import { StravaActivity } from "../../api/api";
import {
  formatDistance,
  formatDuration,
  formatSpeed,
  formatDate,
  formatElevation,
} from "../../shared/utils";
import { RideDetailPanel } from "../rides/RideDetailPanel";
import zwiftLogo from "../../assets/zwift.svg";

interface ActivityRowProps {
  activity: StravaActivity;
}

function isIndoor(activity: StravaActivity) {
  return activity.type === "VirtualRide" || activity.trainer;
}

export function ActivityRow({ activity }: ActivityRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl transition-colors">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className={`w-full text-left px-4 py-4 rounded-2xl transition-colors ${
          expanded ? "bg-surface-muted" : "hover:bg-surface-muted"
        }`}
      >
        <div className="flex items-center justify-between gap-4 mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`text-text-muted text-xs transition-transform ${expanded ? "rotate-90" : ""}`}
            >
              ▶
            </span>
            <h3 className="font-medium text-text-primary text-sm sm:text-base truncate">
              {activity.name}
            </h3>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs sm:text-sm text-text-muted">
              {formatDate(activity.start_date_local)}
            </span>
            <a
              href={`https://www.strava.com/activities/${activity.id}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-text-muted hover:text-[hsl(221,83%,53%)] transition-colors"
              title="Open in Strava"
            >
              ↗
            </a>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-y-1 text-sm text-text-secondary pl-5">
          <span>
            {isIndoor(activity) ? (
              <img
                src={zwiftLogo}
                alt="Zwift"
                className="w-4 h-4 inline-block mr-1"
              />
            ) : (
              "🛣️ "
            )}
            {formatDistance(activity.distance)}
          </span>
          <span>🕑 {formatDuration(activity.moving_time)}</span>
          <span>💨 {formatSpeed(activity.average_speed)}</span>
          <span>⛰️ {formatElevation(activity.total_elevation_gain)}</span>
          <span>
            ⚡ {activity.average_watts ? `${activity.average_watts}W` : "–"}
          </span>
          <span>
            ❤️{" "}
            {activity.average_heartrate
              ? `${Math.round(activity.average_heartrate)} bpm`
              : "–"}
          </span>
        </div>
      </button>

      {expanded && <RideDetailPanel activityId={activity.id} />}
    </div>
  );
}
