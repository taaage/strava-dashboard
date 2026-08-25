import { useQuery } from "@tanstack/react-query";
import { getActivities } from "../../api/api";
import { WeeklyAreaChart } from "./WeeklyDistanceChart";
import { EfficiencyAreaChart } from "./EfficiencyChart";
import { FitnessChart } from "./FitnessChart";
import { WeeklyTSSChart } from "./WeeklyTSSChart";
import { Section } from "../../shared/layout";
import { CardPlaceholder } from "../../shared/CardPlaceholder";

export function TrainingSection() {
  const { data: activities = [] } = useQuery({
    queryKey: ["activities"],
    queryFn: getActivities,
  });

  if (activities.length === 0) {
    return (
      <>
        {[...Array(4)].map((_, i) => (
          <Section key={i}>
            <CardPlaceholder />
          </Section>
        ))}
      </>
    );
  }

  return (
    <>
      <Section>
        <WeeklyAreaChart activities={activities} />
      </Section>
      <Section>
        <EfficiencyAreaChart activities={activities} />
      </Section>
      <Section>
        <FitnessChart activities={activities} />
      </Section>
      <Section>
        <WeeklyTSSChart activities={activities} />
      </Section>
    </>
  );
}
