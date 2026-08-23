import { useQuery } from "@tanstack/react-query";
import { getStats, getActivities } from "../lib/api";
import { formatDistance, formatDuration, formatElevation } from "../lib/utils";
import { StatCard } from "../components/StatCard";
import { CardPlaceholder } from "../components/CardPlaceholder";

export function StatsSection() {
  const { data: stats } = useQuery({ queryKey: ["stats"], queryFn: getStats });
  const { data: activities = [] } = useQuery({ queryKey: ["activities"], queryFn: getActivities });

  if (!stats) {
    return (
      <>
        <section className="mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <CardPlaceholder key={i} height="h-28" />)}
          </div>
        </section>
        <section className="mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <CardPlaceholder key={i} height="h-28" />)}
          </div>
        </section>
      </>
    );
  }

  const ytd = stats.ytd_ride_totals;
  const allTime = stats.all_ride_totals;

  const now = new Date();
  const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
  const lastYearSamePoint = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

  const lastYearRides = activities.filter((a) => {
    const isRide = a.type === "Ride" || a.sport_type === "Ride" || a.type === "VirtualRide";
    const date = new Date(a.start_date_local);
    return isRide && date >= lastYearStart && date <= lastYearSamePoint;
  });

  const ly = {
    distance: lastYearRides.reduce((sum, a) => sum + a.distance, 0),
    count: lastYearRides.length,
    moving_time: lastYearRides.reduce((sum, a) => sum + a.moving_time, 0),
    elevation_gain: lastYearRides.reduce((sum, a) => sum + a.total_elevation_gain, 0),
  };

  const pct = (curr: number, prev: number) => prev > 0 ? Math.round(((curr - prev) / prev) * 100) : 0;

  return (
    <>
      <section className="mb-8">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3 px-1">This year</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="Distance" value={formatDistance(ytd.distance)} comparison={{ value: pct(ytd.distance, ly.distance), unit: "%", isPercentage: true }} />
          <StatCard title="Rides" value={ytd.count.toString()} comparison={{ value: ytd.count - ly.count, unit: "rides" }} />
          <StatCard title="Time" value={formatDuration(ytd.moving_time)} comparison={{ value: pct(ytd.moving_time, ly.moving_time), unit: "%", isPercentage: true }} />
          <StatCard title="Elevation" value={formatElevation(ytd.elevation_gain)} comparison={{ value: pct(ytd.elevation_gain, ly.elevation_gain), unit: "%", isPercentage: true }} />
        </div>
      </section>

      <section className="mb-8">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3 px-1">All time</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="Distance" value={formatDistance(allTime.distance)} />
          <StatCard title="Rides" value={allTime.count.toString()} />
          <StatCard title="Time" value={formatDuration(allTime.moving_time)} />
          <StatCard title="Elevation" value={formatElevation(allTime.elevation_gain)} />
        </div>
      </section>
    </>
  );
}
