import { useState } from "react";
import { StravaActivity } from "../lib/api";
import { formatDistance, formatDuration, formatSpeed, formatDate, formatElevation } from "../lib/utils";
import zwiftLogo from "../assets/zwift.svg";

interface ActivityListProps {
  activities: StravaActivity[];
}

export function ActivityList({ activities }: ActivityListProps) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filter, setFilter] = useState<"all" | "races" | "outdoor" | "indoor">("all");

  const rides = activities
    .filter((a) => a.type === "Ride" || a.sport_type === "Ride" || a.type === "VirtualRide")
    .filter((a) => {
      const date = a.start_date_local.split("T")[0];
      if (from && date < from) return false;
      if (to && date > to) return false;
      if (filter === "races" && (a as any).workout_type !== 11) return false;
      if (filter === "outdoor" && (a.type === "VirtualRide" || a.trainer)) return false;
      if (filter === "indoor" && a.type !== "VirtualRide" && !a.trainer) return false;
      return true;
    });

  return (
    <div className="bg-surface-card rounded-3xl border border-surface-border overflow-hidden">
      <div className="px-8 pt-8 pb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Rides</h2>
        <div className="flex items-center gap-2 text-xs">
          {(["outdoor", "indoor", "races"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(filter === f ? "all" : f)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${filter === f ? "bg-surface-muted text-text-primary" : "text-text-muted hover:text-text-secondary"}`}
            >
              {f === "races" && "🏁 "}{f === "outdoor" && "🛣️ "}{f === "indoor" && <img src={zwiftLogo} alt="Zwift" className="w-4 h-4 inline-block mr-1" />}{f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="bg-surface-muted border border-surface-border rounded-lg px-2 py-1.5 text-text-primary"
          />
          <span className="text-text-muted">–</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="bg-surface-muted border border-surface-border rounded-lg px-2 py-1.5 text-text-primary"
          />
          {(from || to || filter !== "all") && (
            <button
              onClick={() => { setFrom(""); setTo(""); setFilter("all"); }}
              className="text-text-muted hover:text-text-primary px-2"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      <div className="px-8 pb-2 text-xs text-text-muted">
        {rides.length} rides{(from || to) && " found"}
      </div>
      <div className="px-4 pb-4 max-h-[600px] overflow-y-auto">
        {rides.slice(0, 50).map((activity) => (
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
              <span className="w-28">{(activity.type === "VirtualRide" || activity.trainer) ? <img src={zwiftLogo} alt="Zwift" className="w-4 h-4 inline-block mr-1" /> : "🛣️ "}{formatDistance(activity.distance)}</span>
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
