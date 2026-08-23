import { useQuery } from "@tanstack/react-query";
import { getActivities, getStats } from "../lib/api";
import { GoalsSection } from "../components/GoalsSection";
import { YearProgressChart } from "../components/YearProgressChart";
import { CardPlaceholder } from "../components/CardPlaceholder";

export function OverviewSection() {
  const { data: stats } = useQuery({ queryKey: ["stats"], queryFn: getStats });
  const { data: activities = [] } = useQuery({ queryKey: ["activities"], queryFn: getActivities });

  if (!stats || activities.length === 0) {
    return (
      <>
        <section className="mb-8"><CardPlaceholder height="h-56" /></section>
        <section className="mb-8"><CardPlaceholder height="h-96" /></section>
      </>
    );
  }

  return (
    <>
      <section className="mb-8">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3 px-1">Goals</p>
        <GoalsSection activities={activities} stats={stats} />
      </section>

      <section className="mb-8">
        <YearProgressChart activities={activities} />
      </section>
    </>
  );
}
