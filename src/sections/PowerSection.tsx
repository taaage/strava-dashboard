import { useQuery } from "@tanstack/react-query";
import { getPowerRecords } from "../lib/api";
import { PowerRadar } from "../components/PowerRadar";
import { Section } from "../components/layout";
import { CardPlaceholder } from "../components/CardPlaceholder";

export function PowerSection() {
  const { data: powerRecords } = useQuery({ queryKey: ["powerRecords"], queryFn: getPowerRecords });

  if (!powerRecords) return <Section><CardPlaceholder height="h-[430px]" /></Section>;

  return (
    <Section>
      <PowerRadar records={powerRecords} />
    </Section>
  );
}
