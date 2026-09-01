import { useState } from "react";
import { StravaActivity } from "../../api/api";
import { isRide } from "../../shared/utils";
import { ActivityFilter, ActivityFilters } from "./ActivityFilters";
import { ActivityRow } from "./ActivityRow";

interface ActivityListProps {
  activities: StravaActivity[];
}

const DEFAULT_VISIBLE = 15;

export function ActivityList({ activities }: ActivityListProps) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const [visible, setVisible] = useState(DEFAULT_VISIBLE);

  const rides = activities
    .filter(isRide)
    .filter((a) => {
      const date = a.start_date_local.split("T")[0];
      if (from && date < from) return false;
      if (to && date > to) return false;
      if (filter === "races" && (a as any).workout_type !== 11) return false;
      if (filter === "outdoor" && (a.type === "VirtualRide" || a.trainer))
        return false;
      if (filter === "indoor" && a.type !== "VirtualRide" && !a.trainer)
        return false;
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.start_date_local).getTime() -
        new Date(a.start_date_local).getTime(),
    );

  const hasFilters = from || to || filter !== "all";

  const visibleRides = rides.slice(0, visible);
  const hasMore = rides.length > visible;

  const resetVisible = () => setVisible(DEFAULT_VISIBLE);

  return (
    <div className="bg-surface-card rounded-3xl border border-surface-border overflow-hidden">
      <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-4 flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-text-primary">Rides</h2>
        <ActivityFilters
          filter={filter}
          onFilterChange={(f) => {
            setFilter(filter === f ? "all" : f);
            resetVisible();
          }}
          from={from}
          to={to}
          onFromChange={(v) => {
            setFrom(v);
            resetVisible();
          }}
          onToChange={(v) => {
            setTo(v);
            resetVisible();
          }}
          onClear={() => {
            setFrom("");
            setTo("");
            setFilter("all");
            resetVisible();
          }}
          hasFilters={!!hasFilters}
        />
      </div>
      <div className="px-5 sm:px-8 pb-2 text-xs text-text-muted">
        {rides.length} rides{hasFilters && " found"}
      </div>
      <div className="px-4 pb-4">
        {visibleRides.map((activity) => (
          <ActivityRow key={activity.id} activity={activity} />
        ))}
      </div>
      {(hasMore || visible > DEFAULT_VISIBLE) && (
        <div className="px-5 sm:px-8 pb-6 flex justify-center gap-4 text-xs">
          {hasMore && (
            <button
              onClick={() => setVisible((v) => v + DEFAULT_VISIBLE)}
              className="px-3 py-1.5 rounded-lg bg-surface-muted text-text-primary hover:text-text-primary transition-colors"
            >
              Show more ({rides.length - visible} left)
            </button>
          )}
          {visible > DEFAULT_VISIBLE && (
            <button
              onClick={resetVisible}
              className="px-3 py-1.5 rounded-lg text-text-muted hover:text-text-secondary transition-colors"
            >
              Show less
            </button>
          )}
        </div>
      )}
    </div>
  );
}
