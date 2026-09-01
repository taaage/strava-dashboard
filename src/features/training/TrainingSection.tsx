import { useQuery } from "@tanstack/react-query";
import { getActivities, getAthlete } from "../../api/api";
import { queryKeys } from "../../api/queryKeys";
import { CardPlaceholder, Section } from "../../shared";
import { EfficiencyAreaChart } from "./EfficiencyChart";
import { WeeklyTSSChart } from "./WeeklyTSSChart";

export function TrainingSection() {
  const { data: activities = [] } = useQuery({
    queryKey: queryKeys.activities,
    queryFn: getActivities,
  });
  const { data: athlete } = useQuery({
    queryKey: queryKeys.athlete,
    queryFn: getAthlete,
  });

  if (activities.length === 0) {
    return (
      <>
        {[...Array(3)].map((_, i) => (
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
        <WeeklyTSSChart activities={activities} ftp={ftp} />
      </Section>
      <Section>
        <EfficiencyAreaChart activities={activities} />
      </Section>

      {/* <Section>
        <FitnessChart activities={activities} ftp={ftp} />
      </Section> */}
    </>
  );
}
