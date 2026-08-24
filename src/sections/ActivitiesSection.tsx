import { useQuery } from "@tanstack/react-query";
import { getActivities } from "../lib/api";
import { ActivityList } from "../components/ActivityList";
import { Section } from "../components/layout";
import { CardPlaceholder } from "../components/CardPlaceholder";

export function ActivitiesSection() {
  const { data: activities = [] } = useQuery({ queryKey: ["activities"], queryFn: getActivities });

  if (activities.length === 0) return <Section><CardPlaceholder height="h-64" /></Section>;

  return (
    <Section>
      <ActivityList activities={activities} />
    </Section>
  );
}
