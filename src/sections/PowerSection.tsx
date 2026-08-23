import { useQuery } from "@tanstack/react-query";
import { getPowerRecords } from "../lib/api";
import { PowerRadar } from "../components/PowerRadar";

export function PowerSection() {
  const { data: powerRecords } = useQuery({
    queryKey: ["powerRecords"],
    queryFn: getPowerRecords,
  });

  if (!powerRecords) return null;

  return (
    <section className="mb-8">
      <PowerRadar records={powerRecords} />
    </section>
  );
}
