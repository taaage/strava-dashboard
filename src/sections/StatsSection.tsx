import { useQuery } from "@tanstack/react-query";
import { getStats, getActivities } from "../lib/api";
import { formatDistance, formatDuration, formatElevation } from "../lib/utils";
import { StatCard } from "../components/StatCard";

export function StatsSection() {
  const { data: stats } = useQuery({ queryKey: ["stats"], queryFn: getStats });
  const { data: activities = [] } = useQuery({
    queryKey: ["activities"],
    queryFn: getActivities,
  });

  if (!stats) return null;

  const ytd = stats.ytd_ride_totals;
  const allTime = stats.all_ride_totals;

  // Last year comparison
  const now = new Date();
  const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
  const lastYearSamePoint = new Date(
    now.getFullYear() - 1,
    now.getMonth(),
    now.getDate(),
  );

  const lastYearRides = activities.filter((a) => {
    const isRide =
      a.type === "Ride" || a.sport_type === "Ride" || a.type === "VirtualRide";
    const date = new Date(a.start_date_local);
    return isRide && date >= lastYearStart && date <= lastYearSamePoint;
  });

  const lastYearStats = {
    distance: lastYearRides.reduce((sum, a) => sum + a.distance, 0),
    count: lastYearRides.length,
    moving_time: lastYearRides.reduce((sum, a) => sum + a.moving_time, 0),
    elevation_gain: lastYearRides.reduce(
      (sum, a) => sum + a.total_elevation_gain,
      0,
    ),
  };

  const distanceDiffPct =
    lastYearStats.distance > 0
      ? Math.round(
          ((ytd.distance - lastYearStats.distance) / lastYearStats.distance) *
            100,
        )
      : 0;
  const ridesDiff = ytd.count - lastYearStats.count;
  const timeDiffPct =
    lastYearStats.moving_time > 0
      ? Math.round(
          ((ytd.moving_time - lastYearStats.moving_time) /
            lastYearStats.moving_time) *
            100,
        )
      : 0;
  const elevationDiffPct =
    lastYearStats.elevation_gain > 0
      ? Math.round(
          ((ytd.elevation_gain - lastYearStats.elevation_gain) /
            lastYearStats.elevation_gain) *
            100,
        )
      : 0;

  return (
    <>
      <section className="mb-8">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3 px-1">
          This year
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Distance"
            value={formatDistance(ytd.distance)}
            comparison={{
              value: distanceDiffPct,
              unit: "%",
              isPercentage: true,
            }}
          />
          <StatCard
            title="Rides"
            value={ytd.count.toString()}
            comparison={{ value: ridesDiff, unit: "rides" }}
          />
          <StatCard
            title="Time"
            value={formatDuration(ytd.moving_time)}
            comparison={{ value: timeDiffPct, unit: "%", isPercentage: true }}
          />
          <StatCard
            title="Elevation"
            value={formatElevation(ytd.elevation_gain)}
            comparison={{
              value: elevationDiffPct,
              unit: "%",
              isPercentage: true,
            }}
          />
        </div>
      </section>

      <section className="mb-8">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3 px-1">
          All time
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="Distance" value={formatDistance(allTime.distance)} />
          <StatCard title="Rides" value={allTime.count.toString()} />
          <StatCard title="Time" value={formatDuration(allTime.moving_time)} />
          <StatCard
            title="Elevation"
            value={formatElevation(allTime.elevation_gain)}
          />
        </div>
      </section>
    </>
  );
}
