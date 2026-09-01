import { useQuery } from "@tanstack/react-query";
import { getAthlete } from "./api/api";
import { queryKeys } from "./api/queryKeys";
import { ActivitiesSection } from "./features/activities/ActivitiesSection";
import { BikeCard } from "./features/overview/BikeCard";
import { OverviewSection } from "./features/overview/OverviewSection";
import { PowerSection } from "./features/power/PowerSection";
import { StatsSection } from "./features/stats/StatsSection";
import { StreamsSection } from "./features/streams/StreamsSection";
import { TrainingSection } from "./features/training/TrainingSection";
import { ZonesSection } from "./features/zones/ZonesSection";

export default function App() {
  const { data: athlete } = useQuery({
    queryKey: queryKeys.athlete,
    queryFn: getAthlete,
  });

  return (
    <main className="px-4 sm:px-6 py-8 sm:py-12 max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-text-primary">
          Hey {athlete?.firstname ?? "rider"} 👋
        </h1>
        <p className="text-text-muted mt-1">Here's how your riding is going</p>
      </div>

      {athlete && (
        <div className="mb-8">
          <BikeCard athlete={athlete} />
        </div>
      )}

      <OverviewSection />
      <StatsSection />
      <PowerSection />
      <TrainingSection />
      <StreamsSection />
      <ZonesSection />
      <ActivitiesSection />
    </main>
  );
}
