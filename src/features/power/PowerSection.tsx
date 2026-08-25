import { useQuery } from "@tanstack/react-query";
import { getPowerRecords } from "../../api/api";
import { PowerRadar } from "./PowerRadar";
import { Section } from "../../shared/layout";
import { CardPlaceholder } from "../../shared/CardPlaceholder";

export function PowerSection() {
  const { data: powerRecords } = useQuery({
    queryKey: ["powerRecords"],
    queryFn: getPowerRecords,
  });

  if (!powerRecords)
    return (
      <Section>
        <CardPlaceholder height="h-[430px]" />
      </Section>
    );

  return (
    <Section>
      <PowerRadar records={powerRecords} />
    </Section>
  );
}
