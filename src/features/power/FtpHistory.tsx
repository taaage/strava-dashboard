import { useMemo } from "react";
import { type RideStream } from "../../api/api";
import { computeBestEffort } from "./utils";

interface FtpHistoryProps {
  streams: RideStream[];
}

function computeFtpByYear(streams: RideStream[]) {
  const yearMap = new Map<number, { ftp: number; activityId: number }>();
  for (const stream of streams) {
    if (stream.watts.length < 1200) continue;
    const year = new Date(stream.date).getFullYear();
    const ftp = Math.round(computeBestEffort(stream.watts, 1200) * 0.95);
    const existing = yearMap.get(year);
    if (!existing || ftp > existing.ftp) {
      yearMap.set(year, { ftp, activityId: stream.activityId });
    }
  }
  return Array.from(yearMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, { ftp, activityId }]) => ({ year, ftp, activityId }));
}

export function FtpHistory({ streams }: FtpHistoryProps) {
  const data = useMemo(() => computeFtpByYear(streams), [streams]);

  if (data.length === 0) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {data.map((d) => (
        <a
          key={d.year}
          href={`https://www.strava.com/activities/${d.activityId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-surface-card rounded-3xl p-6 border border-surface-border hover:bg-surface-muted transition-colors text-center"
        >
          <p className="text-sm font-medium text-text-muted mb-2">{d.year}</p>
          <p className="text-2xl font-semibold text-text-primary">
            {d.ftp}
            <span className="text-sm font-normal text-text-muted">W</span>
          </p>
        </a>
      ))}
    </div>
  );
}
