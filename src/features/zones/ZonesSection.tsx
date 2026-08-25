import { useQuery } from "@tanstack/react-query";
import { getZones } from "../../lib/api";
import { PowerZoneChart, HRZoneChart } from "./ZoneCharts";
import { Section } from "../../shared/layout";
import { CardPlaceholder } from "../../shared/CardPlaceholder";

export function ZonesSection() {
  const { data: zones } = useQuery({ queryKey: ["zones"], queryFn: getZones });

  if (!zones) {
    return (
      <>
        <Section><CardPlaceholder height="h-56" /></Section>
        <Section><CardPlaceholder height="h-48" /></Section>
      </>
    );
  }

  return (
    <>
      <Section><PowerZoneChart zones={zones} /></Section>
      <Section><HRZoneChart zones={zones} /></Section>
    </>
  );
}
