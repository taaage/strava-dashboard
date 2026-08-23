import { useQuery } from "@tanstack/react-query";
import { getZones } from "../lib/api";
import { PowerZoneChart, HRZoneChart } from "../components/ZoneCharts";

export function ZonesSection() {
  const { data: zones } = useQuery({
    queryKey: ["zones"],
    queryFn: getZones,
  });

  if (!zones) return null;

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
