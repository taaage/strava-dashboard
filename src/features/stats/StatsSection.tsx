import { useQuery } from "@tanstack/react-query";
import { getStats, getActivities } from "../../api/api";
import {
  formatDistance,
  formatDuration,
  formatElevation,
} from "../../shared/utils";
import { StatCard, CardPlaceholder, Section, StatsGrid } from "../../shared";

export function StatsSection() {
  const { data: stats } = useQuery({ queryKey: ["stats"], queryFn: getStats });
  const { data: activities = [] } = useQuery({
    queryKey: ["activities"],
    queryFn: getActivities,
  });

  if (!stats || activities.length === 0) {
    return (
      <>
        <Section title="This year">
          <StatsGrid>
            {[...Array(4)].map((_, i) => (
              <CardPlaceholder key={i} height="h-28" />
            ))}
          </StatsGrid>
        </Section>
        <Section title="All time">
          <StatsGrid>
            {[...Array(4)].map((_, i) => (
              <CardPlaceholder key={i} height="h-28" />
            ))}
          </StatsGrid>
        </Section>
      </>
    );
  }

  const now = new Date();
  const thisYearStart = new Date(now.getFullYear(), 0, 1);
  const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
  const lastYearSamePoint = new Date(
    now.getFullYear() - 1,
    now.getMonth(),
    now.getDate(),
  );

  const isRide = (a: any) =>
    a.type === "Ride" || a.sport_type === "Ride" || a.type === "VirtualRide";

  const thisYearRides = activities.filter(
    (a) => isRide(a) && new Date(a.start_date_local) >= thisYearStart,
  );
  const lastYearRides = activities.filter(
    (a) =>
      isRide(a) &&
      new Date(a.start_date_local) >= lastYearStart &&
      new Date(a.start_date_local) <= lastYearSamePoint,
  );
  const allRides = activities.filter(isRide);

  const sum = (rides: any[], key: string) =>
    rides.reduce((s, a) => s + a[key], 0);
  const pct = (curr: number, prev: number) =>
    prev > 0 ? Math.round(((curr - prev) / prev) * 100) : 0;

  const ytd = {
    distance: sum(thisYearRides, "distance"),
    count: thisYearRides.length,
    moving_time: sum(thisYearRides, "moving_time"),
    elevation: sum(thisYearRides, "total_elevation_gain"),
  };
  const ly = {
    distance: sum(lastYearRides, "distance"),
    count: lastYearRides.length,
    moving_time: sum(lastYearRides, "moving_time"),
    elevation: sum(lastYearRides, "total_elevation_gain"),
  };
  const all = {
    distance: sum(allRides, "distance"),
    count: allRides.length,
    moving_time: sum(allRides, "moving_time"),
    elevation: sum(allRides, "total_elevation_gain"),
  };

  return (
    <>
      <Section title="This year">
        <StatsGrid>
          <StatCard
            title="Distance"
            value={formatDistance(ytd.distance)}
            comparison={{
              value: pct(ytd.distance, ly.distance),
              unit: "%",
              isPercentage: true,
            }}
          />
          <StatCard
            title="Rides"
            value={ytd.count.toString()}
            comparison={{ value: ytd.count - ly.count, unit: "rides" }}
          />
          <StatCard
            title="Time"
            value={formatDuration(ytd.moving_time)}
            comparison={{
              value: pct(ytd.moving_time, ly.moving_time),
              unit: "%",
              isPercentage: true,
            }}
          />
          <StatCard
            title="Elevation"
            value={formatElevation(ytd.elevation)}
            comparison={{
              value: pct(ytd.elevation, ly.elevation),
              unit: "%",
              isPercentage: true,
            }}
          />
        </StatsGrid>
      </Section>

      <Section title="All time">
        <StatsGrid>
          <StatCard title="Distance" value={formatDistance(all.distance)} />
          <StatCard title="Rides" value={all.count.toString()} />
          <StatCard title="Time" value={formatDuration(all.moving_time)} />
          <StatCard title="Elevation" value={formatElevation(all.elevation)} />
        </StatsGrid>
      </Section>
    </>
  );
}
