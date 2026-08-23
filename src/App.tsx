import { useQuery } from "@tanstack/react-query";
import { getAthlete } from "./lib/api";
import { Skeleton } from "./components/Skeleton";
import { OverviewSection } from "./sections/OverviewSection";
import { StatsSection } from "./sections/StatsSection";
import { PowerSection } from "./sections/PowerSection";
import { TrainingSection } from "./sections/TrainingSection";
import { ZonesSection } from "./sections/ZonesSection";
import { ActivitiesSection } from "./sections/ActivitiesSection";

export default function App() {
  const {
    data: athlete,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["athlete"],
    queryFn: getAthlete,
  });

  if (isLoading) return <Skeleton />;

  if (error || !athlete) {
    return (
      <main className="px-6 py-12 max-w-4xl mx-auto">
        <div className="bg-surface-card rounded-3xl p-8 border border-surface-border text-center">
          <h1 className="text-xl font-semibold text-text-primary mb-2">
            Connection Error
          </h1>
          <p className="text-text-secondary">
            Could not load data from Strava API.
          </p>
          <p className="text-sm text-text-muted mt-2">{String(error)}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 py-12 max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-text-primary">
          Hey {athlete.firstname} 👋
        </h1>
        <p className="text-text-muted mt-1">Here's how your riding is going</p>
      </div>
      <OverviewSection />
      <StatsSection />
      <PowerSection />
      <TrainingSection />
      <ZonesSection />
      <ActivitiesSection />
    </main>
  );
}
