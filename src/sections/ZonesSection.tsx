import { useQuery } from "@tanstack/react-query";
import { getZones } from "../lib/api";
import { PowerZoneChart, HRZoneChart } from "../components/ZoneCharts";
import { CardPlaceholder } from "../components/CardPlaceholder";

export function ZonesSection() {
  const { data: zones } = useQuery({
    queryKey: ["zones"],
    queryFn: getZones,
  });

  if (!zones) {
    return (
      <>
        <section className="mb-8"><CardPlaceholder height="h-56" /></section>
        <section className="mb-8"><CardPlaceholder height="h-48" /></section>
      </>
    );
  }

  return (
    <>
      <section className="mb-8">
        <PowerZoneChart zones={zones} />
      </section>
      <section className="mb-8">
        <HRZoneChart zones={zones} />
      </section>
    </>
  );
}
