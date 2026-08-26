import { StravaActivity, StravaStats } from "../../api/api";
import { RadialProgress } from "./RadialProgress";

interface GoalsSectionProps {
  activities: StravaActivity[];
  stats: StravaStats;
}

function getThisWeekDistance(activities: StravaActivity[]): number {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  return activities
    .filter((a) => {
      const isRide =
        a.type === "Ride" ||
        a.sport_type === "Ride" ||
        a.type === "VirtualRide";
      const actDate = new Date(a.start_date_local);
      return isRide && actDate >= monday;
    })
    .reduce((sum, a) => sum + a.distance / 1000, 0);
}

function getThisMonthDistance(activities: StravaActivity[]): number {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return activities
    .filter((a) => {
      const isRide =
        a.type === "Ride" ||
        a.sport_type === "Ride" ||
        a.type === "VirtualRide";
      const actDate = new Date(a.start_date_local);
      return isRide && actDate >= firstOfMonth;
    })
    .reduce((sum, a) => sum + a.distance / 1000, 0);
}

export function GoalsSection({ activities, stats }: GoalsSectionProps) {
  const weeklyDistance = getThisWeekDistance(activities);
  const monthlyDistance = getThisMonthDistance(activities);
  const ytdDistance = stats.ytd_ride_totals.distance / 1000;

  const weeklyGoalKm = 150;
  const monthlyGoalKm = 650;
  const ytdGoalKm = 10000;

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <RadialProgress
        title="Weekly"
        value={weeklyDistance}
        max={weeklyGoalKm}
        unit="km"
        color="hsl(221, 83%, 53%)"
        subtitle={`${Math.round((weeklyDistance / weeklyGoalKm) * 100)}% complete`}
      />
      <RadialProgress
        title="Monthly"
        value={monthlyDistance}
        max={monthlyGoalKm}
        unit="km"
        color="hsl(280, 65%, 60%)"
        subtitle={`${Math.round((monthlyDistance / monthlyGoalKm) * 100)}% complete`}
      />
      <RadialProgress
        title="Year"
        value={ytdDistance}
        max={ytdGoalKm}
        unit="km"
        color="hsl(160, 60%, 45%)"
        subtitle={`${Math.round((ytdDistance / ytdGoalKm) * 100)}% of 10,000 km`}
      />
    </div>
  );
}
