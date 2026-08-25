import { useQuery } from "@tanstack/react-query";
import { getActivities, getAthlete } from "../../api/api";
import { CardPlaceholder } from "../../shared/CardPlaceholder";
import { Section } from "../../shared/layout";
import { EfficiencyAreaChart } from "./EfficiencyChart";
import { WeeklyAreaChart } from "./WeeklyDistanceChart";
import { WeeklyTSSChart } from "./WeeklyTSSChart";

export function TrainingSection() {
  const { data: activities = [] } = useQuery({
    queryKey: ["activities"],
    queryFn: getActivities,
  });
  const { data: athlete } = useQuery({
    queryKey: ["athlete"],
    queryFn: getAthlete,
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

  const ftp = athlete?.ftp ?? 0;

  return (
    <>
      <Section>
        <WeeklyAreaChart activities={activities} />
      </Section>
      <Section>
        <EfficiencyAreaChart activities={activities} />
      </Section>

      {/* <Section>
        <FitnessChart activities={activities} ftp={ftp} />
      </Section> */}

      <Section>
        <WeeklyTSSChart activities={activities} ftp={ftp} />
      </Section>
    </>
  );
}
