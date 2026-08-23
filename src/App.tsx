import { useQuery } from "@tanstack/react-query";
import { getAthlete } from "./lib/api";
import { OverviewSection } from "./sections/OverviewSection";
import { StatsSection } from "./sections/StatsSection";
import { PowerSection } from "./sections/PowerSection";
import { TrainingSection } from "./sections/TrainingSection";
import { ZonesSection } from "./sections/ZonesSection";
import { ActivitiesSection } from "./sections/ActivitiesSection";

export default function App() {
  const { data: athlete } = useQuery({
    queryKey: ["athlete"],
    queryFn: getAthlete,
  });

  return (
    <main className="px-6 py-12 max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-text-primary">
          Hey {athlete?.firstname ?? "rider"} 👋
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
