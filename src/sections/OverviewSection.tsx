import { useQuery } from "@tanstack/react-query";
import { getActivities, getStats } from "../lib/api";
import { GoalsSection as Goals } from "../components/GoalsSection";
import { YearProgressChart } from "../components/YearProgressChart";
import { Section } from "../components/layout";
import { CardPlaceholder } from "../components/CardPlaceholder";

export function OverviewSection() {
  const { data: stats } = useQuery({ queryKey: ["stats"], queryFn: getStats });
  const { data: activities = [] } = useQuery({ queryKey: ["activities"], queryFn: getActivities });

  if (!stats || activities.length === 0) {
    return (
      <>
        <Section><CardPlaceholder height="h-56" /></Section>
        <Section><CardPlaceholder height="h-96" /></Section>
      </>
    );
  }

  return (
    <>
      <Section title="Goals">
        <Goals activities={activities} stats={stats} />
      </Section>
      <Section>
        <YearProgressChart activities={activities} />
      </Section>
    </>
  );
}
