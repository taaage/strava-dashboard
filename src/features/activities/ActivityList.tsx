import { useState } from "react";
import { StravaActivity } from "../../api/api";
import { isRide } from "../../shared/utils";
import { ActivityFilter, ActivityFilters } from "./ActivityFilters";
import { ActivityRow } from "./ActivityRow";

interface ActivityListProps {
  activities: StravaActivity[];
}

export function ActivityList({ activities }: ActivityListProps) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filter, setFilter] = useState<ActivityFilter>("all");

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

  return (
    <div className="bg-surface-card rounded-3xl border border-surface-border overflow-hidden">
      <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-4 flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-text-primary">Rides</h2>
        <ActivityFilters
          filter={filter}
          onFilterChange={(f) => setFilter(filter === f ? "all" : f)}
          from={from}
          to={to}
          onFromChange={setFrom}
          onToChange={setTo}
          onClear={() => {
            setFrom("");
            setTo("");
            setFilter("all");
          }}
          hasFilters={!!hasFilters}
        />
      </div>
      <div className="px-5 sm:px-8 pb-2 text-xs text-text-muted">
        {rides.length} rides{hasFilters && " found"}
      </div>
      <div className="px-4 pb-4 max-h-[600px] overflow-y-auto">
        {rides.slice(0, 7).map((activity) => (
          <ActivityRow key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
}
