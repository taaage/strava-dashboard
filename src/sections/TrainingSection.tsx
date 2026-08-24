import { useQuery } from "@tanstack/react-query";
import { getActivities } from "../lib/api";
import { WeeklyAreaChart } from "../components/WeeklyAreaChart";
import { EfficiencyAreaChart } from "../components/EfficiencyAreaChart";
import { FitnessChart } from "../components/FitnessChart";
import { WeeklyTSSChart } from "../components/WeeklyTSSChart";
import { Section } from "../components/layout";
import { CardPlaceholder } from "../components/CardPlaceholder";

export function TrainingSection() {
  const { data: activities = [] } = useQuery({ queryKey: ["activities"], queryFn: getActivities });

  if (activities.length === 0) {
    return (
      <>
        {[...Array(4)].map((_, i) => <Section key={i}><CardPlaceholder /></Section>)}
      </>
    );
  }

  return (
    <>
      <Section><WeeklyAreaChart activities={activities} /></Section>
      <Section><EfficiencyAreaChart activities={activities} /></Section>
      <Section><FitnessChart activities={activities} /></Section>
      <Section><WeeklyTSSChart activities={activities} /></Section>
    </>
  );
}
