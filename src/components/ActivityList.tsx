import { StravaActivity } from "../lib/api";
import { formatDistance, formatDuration, formatSpeed, formatDate, formatElevation } from "../lib/utils";

interface ActivityListProps {
  activities: StravaActivity[];
}

export function ActivityList({ activities }: ActivityListProps) {
  const rides = activities.filter(
    (a) => a.type === "Ride" || a.sport_type === "Ride" || a.type === "VirtualRide"
  );

  return (
    <div className="bg-surface-card rounded-3xl border border-surface-border overflow-hidden">
      <div className="px-8 pt-8 pb-4">
        <h2 className="text-lg font-semibold text-text-primary">Recent Rides</h2>
      </div>
      <div className="px-4 pb-4">
        {rides.slice(0, 15).map((activity) => (
          <a
            key={activity.id}
            href={`https://www.strava.com/activities/${activity.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-4 rounded-2xl hover:bg-surface-muted transition-colors"
          >
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="font-medium text-text-primary">{activity.name}</h3>
              <span className="text-sm text-text-muted">{formatDate(activity.start_date_local)}</span>
            </div>
            <div className="flex flex-wrap text-sm text-text-secondary">
              <span className="w-28">🛣️ {formatDistance(activity.distance)}</span>
              <span className="w-24">🕑 {formatDuration(activity.moving_time)}</span>
              <span className="w-28">💨 {formatSpeed(activity.average_speed)}</span>
              <span className="w-24">⛰️ {formatElevation(activity.total_elevation_gain)}</span>
              {activity.average_watts && <span className="w-24">⚡ {activity.average_watts}W</span>}
              {activity.average_heartrate && <span className="w-28">❤️ {Math.round(activity.average_heartrate)} bpm</span>}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
