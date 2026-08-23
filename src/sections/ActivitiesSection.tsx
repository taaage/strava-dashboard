import { useQuery } from "@tanstack/react-query";
import { getActivities } from "../lib/api";
import { ActivityList } from "../components/ActivityList";
import { CardPlaceholder } from "../components/CardPlaceholder";

export function ActivitiesSection() {
  const { data: activities = [] } = useQuery({
    queryKey: ["activities"],
    queryFn: getActivities,
  });

  if (activities.length === 0) return <section><CardPlaceholder height="h-64" /></section>;

  return (
    <section>
      <ActivityList activities={activities} />
    </section>
  );
}
