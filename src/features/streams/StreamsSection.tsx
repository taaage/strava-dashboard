import { useQuery } from "@tanstack/react-query";
import { getRideStreams } from "../../api/api";
import { PowerCurve } from "./PowerCurve";
import { HrVsPowerChart, CadenceDistribution } from "./StreamCharts";
import { Section, CardPlaceholder } from "../../shared";

export function StreamsSection() {
  const { data: streams = [] } = useQuery({
    queryKey: ["rideStreams"],
    queryFn: getRideStreams,
  });

  if (streams.length === 0) {
    return (
      <Section>
        <CardPlaceholder height="h-[350px]" />
      </Section>
    );
  }

  return (
    <>
      <Section>
        <PowerCurve streams={streams} />
      </Section>
      <Section>
        <HrVsPowerChart streams={streams} />
      </Section>
      <Section>
        <CadenceDistribution streams={streams} />
      </Section>
    </>
  );
}
