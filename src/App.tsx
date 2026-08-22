import { useEffect, useState } from "react";
import { getAthlete, getStats, getActivities, getPowerRecords } from "./lib/api";
import type { StravaAthlete, StravaStats, StravaActivity, PowerRecords } from "./lib/api";
import { formatDistance, formatDuration, formatElevation } from "./lib/utils";
import { StatCard } from "./components/StatCard";
import { GoalsSection } from "./components/GoalsSection";
import { YearProgressChart } from "./components/YearProgressChart";
import { PowerRadar } from "./components/PowerRadar";
import { WeeklyChart } from "./components/WeeklyChart";
import { ActivityList } from "./components/ActivityList";

export default function App() {
  const [athlete, setAthlete] = useState<StravaAthlete | null>(null);
  const [stats, setStats] = useState<StravaStats | null>(null);
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [powerRecords, setPowerRecords] = useState<PowerRecords | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [a, s, acts] = await Promise.all([
          getAthlete(),
          getStats(),
          getActivities(),
        ]);
        setAthlete(a);
        setStats(s);
        setActivities(acts);

        // Fetch power records in background (slower)
        getPowerRecords().then(setPowerRecords).catch(console.error);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="px-6 py-12 max-w-4xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-10">
          <div className="h-8 w-48 bg-surface-card rounded-xl animate-pulse" />
          <div className="h-4 w-64 bg-surface-card rounded-lg animate-pulse mt-2" />
        </div>

        {/* Goals skeleton */}
        <section className="mb-8">
          <div className="h-4 w-16 bg-surface-card rounded animate-pulse mb-3" />
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-surface-card rounded-3xl p-6 border border-surface-border h-56" />
            ))}
          </div>
        </section>

        {/* Year progress skeleton */}
        <section className="mb-8">
          <div className="bg-surface-card rounded-3xl p-8 border border-surface-border h-96" />
        </section>

        {/* Stats skeleton */}
        <section className="mb-8">
          <div className="h-4 w-20 bg-surface-card rounded animate-pulse mb-3" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-surface-card rounded-3xl p-6 border border-surface-border h-28" />
            ))}
          </div>
        </section>
      </main>
    );
  }

  if (error || !athlete || !stats) {
    return (
      <main className="px-6 py-12 max-w-4xl mx-auto">
        <div className="bg-surface-card rounded-3xl p-8 border border-surface-border text-center">
          <h1 className="text-xl font-semibold text-text-primary mb-2">Connection Error</h1>
          <p className="text-text-secondary">Could not load data from Strava API.</p>
          <p className="text-sm text-text-muted mt-2">{error}</p>
        </div>
      </main>
    );
  }

  const ytd = stats.ytd_ride_totals;
  const allTime = stats.all_ride_totals;

  // Last year comparison
  const now = new Date();
  const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
  const lastYearSamePoint = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

  const lastYearRides = activities.filter((a) => {
    const isRide = a.type === "Ride" || a.sport_type === "Ride" || a.type === "VirtualRide";
    const date = new Date(a.start_date_local);
    return isRide && date >= lastYearStart && date <= lastYearSamePoint;
  });

  const lastYearStats = {
    distance: lastYearRides.reduce((sum, a) => sum + a.distance, 0),
    count: lastYearRides.length,
    moving_time: lastYearRides.reduce((sum, a) => sum + a.moving_time, 0),
    elevation_gain: lastYearRides.reduce((sum, a) => sum + a.total_elevation_gain, 0),
  };

  const distanceDiffPct = lastYearStats.distance > 0
    ? Math.round(((ytd.distance - lastYearStats.distance) / lastYearStats.distance) * 100)
    : 0;
  const ridesDiff = ytd.count - lastYearStats.count;
  const timeDiffPct = lastYearStats.moving_time > 0
    ? Math.round(((ytd.moving_time - lastYearStats.moving_time) / lastYearStats.moving_time) * 100)
    : 0;
  const elevationDiffPct = lastYearStats.elevation_gain > 0
    ? Math.round(((ytd.elevation_gain - lastYearStats.elevation_gain) / lastYearStats.elevation_gain) * 100)
    : 0;

  return (
    <main className="px-6 py-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-text-primary">
          Hey {athlete.firstname} 👋
        </h1>
        <p className="text-text-muted mt-1">Here's how your riding is going</p>
      </div>

      {/* Goals */}
      <section className="mb-8">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3 px-1">Goals</p>
        <GoalsSection activities={activities} stats={stats} />
      </section>

      {/* Year Progress */}
      <section className="mb-8">
        <YearProgressChart activities={activities} />
      </section>

      {/* YTD Stats */}
      <section className="mb-8">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3 px-1">This year</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="Distance" value={formatDistance(ytd.distance)} comparison={{ value: distanceDiffPct, unit: "%", isPercentage: true }} />
          <StatCard title="Rides" value={ytd.count.toString()} comparison={{ value: ridesDiff, unit: "rides" }} />
          <StatCard title="Time" value={formatDuration(ytd.moving_time)} comparison={{ value: timeDiffPct, unit: "%", isPercentage: true }} />
          <StatCard title="Elevation" value={formatElevation(ytd.elevation_gain)} comparison={{ value: elevationDiffPct, unit: "%", isPercentage: true }} />
        </div>
      </section>

      {/* All Time Stats */}
      <section className="mb-8">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3 px-1">All time</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="Distance" value={formatDistance(allTime.distance)} />
          <StatCard title="Rides" value={allTime.count.toString()} />
          <StatCard title="Time" value={formatDuration(allTime.moving_time)} />
          <StatCard title="Elevation" value={formatElevation(allTime.elevation_gain)} />
        </div>
      </section>

      {/* Power Records */}
      {powerRecords && (
        <section className="mb-8">
          <PowerRadar records={powerRecords} />
        </section>
      )}

      {/* Weekly Chart */}
      <section className="mb-8">
        <WeeklyChart activities={activities} />
      </section>

      {/* Recent Activities */}
      <section>
        <ActivityList activities={activities} />
      </section>
    </main>
  );
}
