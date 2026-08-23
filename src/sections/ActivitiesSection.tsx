import { useQuery } from "@tanstack/react-query";
import { getActivities } from "../lib/api";
import { ActivityList } from "../components/ActivityList";

export function ActivitiesSection() {
  const { data: activities = [] } = useQuery({
    queryKey: ["activities"],
    queryFn: getActivities,
  });

  if (activities.length === 0) return null;

  return (
    <section>
      <ActivityList activities={activities} />
    </section>
  );
}
