import { useQuery } from "@tanstack/react-query";
import { getPowerRecords } from "../lib/api";
import { PowerRadar } from "../components/PowerRadar";
import { CardPlaceholder } from "../components/CardPlaceholder";

export function PowerSection() {
  const { data: powerRecords } = useQuery({
    queryKey: ["powerRecords"],
    queryFn: getPowerRecords,
  });

  if (!powerRecords) return <section className="mb-8"><CardPlaceholder height="h-[430px]" /></section>;

  return (
    <section className="mb-8">
      <PowerRadar records={powerRecords} />
    </section>
  );
}
