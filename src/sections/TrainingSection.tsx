import { useQuery } from "@tanstack/react-query";
import { getActivities } from "../lib/api";
import { WeeklyAreaChart } from "../components/WeeklyAreaChart";
import { EfficiencyAreaChart } from "../components/EfficiencyAreaChart";
import { FitnessChart } from "../components/FitnessChart";
import { WeeklyTSSChart } from "../components/WeeklyTSSChart";

export function TrainingSection() {
  const { data: activities = [] } = useQuery({
    queryKey: ["activities"],
    queryFn: getActivities,
  });

  if (activities.length === 0) return null;

  return (
    <>
      <section className="mb-8">
        <WeeklyAreaChart activities={activities} />
      </section>

      <section className="mb-8">
        <EfficiencyAreaChart activities={activities} />
      </section>

      <section className="mb-8">
        <FitnessChart activities={activities} />
      </section>

      <section className="mb-8">
        <WeeklyTSSChart activities={activities} />
      </section>
    </>
  );
}
