import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRideStreams, getAthleteZones } from "../../api/api";
import { PowerZoneChart, HRZoneChart } from "./ZoneCharts";
import { Section, CardPlaceholder } from "../../shared";
import { computePowerZones, computeHrZones, filterStreamsByDays } from "./utils";

export function ZonesSection() {
  const { data: streams = [] } = useQuery({
    queryKey: ["rideStreams"],
    queryFn: getRideStreams,
  });
  const { data: athleteZones } = useQuery({
    queryKey: ["athleteZones"],
    queryFn: getAthleteZones,
  });

  if (streams.length === 0 || !athleteZones) {
    return (
      <Section>
        <CardPlaceholder height="h-56" />
      </Section>
    );
  }

  return (
    <>
      <Section>
        <PowerZoneChart streams={streams} athleteZones={athleteZones} />
      </Section>
      <Section>
        <HRZoneChart streams={streams} athleteZones={athleteZones} />
      </Section>
    </>
  );
}
