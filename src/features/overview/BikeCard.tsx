import { StravaAthlete } from "../../api/api";

interface BikeCardProps {
  athlete: StravaAthlete;
}

export function BikeCard({ athlete }: BikeCardProps) {
  const mainBike = athlete.bikes?.[0];
  const wkg =
    athlete.weight > 0 ? (athlete.ftp / athlete.weight).toFixed(2) : null;
  const bikeKm = mainBike
    ? (mainBike.distance / 1000)
        .toFixed(0)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    : null;

  return (
    <div className="bg-surface-card rounded-3xl px-4 sm:px-8 py-4 sm:py-5 border border-surface-border flex items-center justify-between text-xs sm:text-sm">
      {mainBike && (
        <span className="text-text-primary">
          {mainBike.name} <span className="text-text-muted">{bikeKm} km</span>
        </span>
      )}
      <div className="flex gap-3 sm:gap-6 text-text-muted">
        <span>
          FTP{" "}
          <span className="text-text-primary font-medium">{athlete.ftp}W</span>
        </span>
        {wkg && (
          <span>
            W/kg <span className="text-text-primary font-medium">{wkg}</span>
          </span>
        )}
      </div>
    </div>
  );
}
