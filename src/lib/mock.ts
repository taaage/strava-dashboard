import type { StravaAthlete, StravaStats, StravaActivity, PowerRecords } from "./api";

export const mockAthlete: StravaAthlete = {
  id: 87275826,
  firstname: "Tigge",
  lastname: "Nilsson",
  profile: "",
  city: "Stockholm",
  country: "Sweden",
};

export const mockStats: StravaStats = {
  recent_ride_totals: { count: 12, distance: 580000, moving_time: 72000, elapsed_time: 75000, elevation_gain: 4200 },
  ytd_ride_totals: { count: 177, distance: 6808600, moving_time: 827280, elapsed_time: 860000, elevation_gain: 65420 },
  all_ride_totals: { count: 520, distance: 18500000, moving_time: 2400000, elapsed_time: 2500000, elevation_gain: 185000 },
};

export const mockPowerRecords: PowerRecords = {
  "5s": 980,
  "15s": 820,
  "30s": 650,
  "1min": 520,
  "2min": 410,
  "3min": 380,
  "5min": 350,
  "8min": 330,
  "10min": 320,
  "15min": 305,
  "20min": 295,
  "30min": 280,
  "45min": 270,
  "60min": 260,
};

function seededRandom(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function generateRides(count: number): StravaActivity[] {
  const rides: StravaActivity[] = [];
  const now = new Date();
  const random = seededRandom(42);

  for (let i = 0; i < count; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(i * 2.5));
    const distance = 30000 + random() * 60000;
    const movingTime = distance / (7 + random() * 3);
    const isIndoor = random() < 0.15;

    rides.push({
      id: 19800000000 - i,
      name: isIndoor
        ? ["Zwift Race", "Indoor Session", "Recovery Spin"][i % 3]
        : ["Morning Ride", "Lunch Ride", "Evening Ride", "Weekend Long Ride", "Hill Repeats", "Coffee Ride", "Group Ride"][i % 7],
      type: isIndoor ? "VirtualRide" : "Ride",
      sport_type: "Ride",
      distance,
      moving_time: Math.round(movingTime),
      elapsed_time: Math.round(movingTime * 1.05),
      total_elevation_gain: isIndoor ? 0 : 150 + random() * 600,
      start_date: date.toISOString(),
      start_date_local: date.toISOString(),
      average_speed: distance / movingTime,
      max_speed: (distance / movingTime) * 1.4,
      average_watts: 180 + Math.round(random() * 80),
      max_watts: 400 + Math.round(random() * 300),
      average_heartrate: 130 + Math.round(random() * 30),
      max_heartrate: 170 + Math.round(random() * 15),
      kudos_count: Math.floor(random() * 20),
      trainer: isIndoor,
    });
  }

  // Add some last year rides
  for (let i = 0; i < 150; i++) {
    const date = new Date(now.getFullYear() - 1, Math.floor(i / 13), (i % 28) + 1);
    const distance = 25000 + random() * 55000;
    const movingTime = distance / (6.5 + random() * 3);

    rides.push({
      id: 18000000000 - i,
      name: ["Ride", "Morning Ride", "Lunch Ride"][i % 3],
      type: "Ride",
      sport_type: "Ride",
      distance,
      moving_time: Math.round(movingTime),
      elapsed_time: Math.round(movingTime * 1.05),
      total_elevation_gain: 100 + random() * 500,
      start_date: date.toISOString(),
      start_date_local: date.toISOString(),
      average_speed: distance / movingTime,
      max_speed: (distance / movingTime) * 1.4,
      average_watts: 170 + Math.round(random() * 70),
      max_watts: 380 + Math.round(random() * 250),
      average_heartrate: 128 + Math.round(random() * 28),
      max_heartrate: 168 + Math.round(random() * 15),
      kudos_count: Math.floor(random() * 15),
      trainer: false,
    });
  }

  return rides;
}

export const mockActivities: StravaActivity[] = generateRides(180);
