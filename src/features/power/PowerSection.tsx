import { useQuery } from "@tanstack/react-query";
import { getRideStreams } from "../../api/api";
import { PowerRadar } from "./PowerRadar";
import { Section } from "../../shared/layout";
import { CardPlaceholder } from "../../shared/CardPlaceholder";

export function PowerSection() {
  const { data: streams = [] } = useQuery({
    queryKey: ["rideStreams"],
    queryFn: getRideStreams,
  });

  if (streams.length === 0)
    return (
      <Section>
        <CardPlaceholder height="h-[430px]" />
      </Section>
    );

  return (
    <Section>
      <PowerRadar streams={streams} />
    </Section>
  );
}
