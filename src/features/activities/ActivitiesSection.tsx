import { useQuery } from "@tanstack/react-query";
import { getActivities } from "../../api/api";
import { ActivityList } from "./ActivityList";
import { Section } from "../../shared/layout";
import { CardPlaceholder } from "../../shared/CardPlaceholder";

export function ActivitiesSection() {
  const { data: activities = [] } = useQuery({
    queryKey: ["activities"],
    queryFn: getActivities,
  });

  if (activities.length === 0)
    return (
      <Section>
        <CardPlaceholder height="h-64" />
      </Section>
    );

  return (
    <Section>
      <ActivityList activities={activities} />
    </Section>
  );
}
