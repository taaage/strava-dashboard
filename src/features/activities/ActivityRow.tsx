import { StravaActivity } from "../../api/api";
import {
  formatDistance,
  formatDuration,
  formatSpeed,
  formatDate,
  formatElevation,
} from "../../shared/utils";
import zwiftLogo from "../../assets/zwift.svg";

interface ActivityRowProps {
  activity: StravaActivity;
}

function isIndoor(activity: StravaActivity) {
  return activity.type === "VirtualRide" || activity.trainer;
}

export function ActivityRow({ activity }: ActivityRowProps) {
  return (
    <a
      href={`https://www.strava.com/activities/${activity.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block px-4 py-4 rounded-2xl hover:bg-surface-muted transition-colors"
    >
      <div className="flex items-center justify-between gap-4 mb-1.5">
        <h3 className="font-medium text-text-primary text-sm sm:text-base truncate">{activity.name}</h3>
        <span className="text-xs sm:text-sm text-text-muted shrink-0">
          {formatDate(activity.start_date_local)}
        </span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-y-1 text-sm text-text-secondary">
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
        <span>⚡ {activity.average_watts ? `${activity.average_watts}W` : "–"}</span>
        <span>❤️ {activity.average_heartrate ? `${Math.round(activity.average_heartrate)} bpm` : "–"}</span>
      </div>
    </a>
  );
}
