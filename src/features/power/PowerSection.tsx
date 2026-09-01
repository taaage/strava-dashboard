import { useQuery } from "@tanstack/react-query";
import { getRideStreams } from "../../api/api";
import { queryKeys } from "../../api/queryKeys";
import { PowerRadar } from "./PowerRadar";
import { FtpHistory } from "./FtpHistory";
import { Section, CardPlaceholder } from "../../shared";

export function PowerSection() {
  const { data: streams = [] } = useQuery({
    queryKey: queryKeys.rideStreams,
    queryFn: getRideStreams,
  });

  if (streams.length === 0)
    return (
      <Section>
        <CardPlaceholder height="h-[430px]" />
      </Section>
    );

  return (
    <>
      <Section>
        <PowerRadar streams={streams} />
      </Section>
      <Section title="FTP by season — 95% of best 20′">
        <FtpHistory streams={streams} />
      </Section>
    </>
  );
}
