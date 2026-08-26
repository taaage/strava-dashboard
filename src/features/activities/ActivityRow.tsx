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
      <div className="flex items-center justify-between mb-1.5">
        <h3 className="font-medium text-text-primary">{activity.name}</h3>
        <span className="text-sm text-text-muted">
          {formatDate(activity.start_date_local)}
        </span>
      </div>
      <div className="flex flex-wrap text-sm text-text-secondary">
        <span className="w-28">
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
        <span className="w-24">🕑 {formatDuration(activity.moving_time)}</span>
        <span className="w-28">💨 {formatSpeed(activity.average_speed)}</span>
        <span className="w-24">
          ⛰️ {formatElevation(activity.total_elevation_gain)}
        </span>
        {activity.average_watts && (
          <span className="w-24">⚡ {activity.average_watts}W</span>
        )}
        {activity.average_heartrate && (
          <span className="w-28">
            ❤️ {Math.round(activity.average_heartrate)} bpm
          </span>
        )}
      </div>
    </a>
  );
}
