# Strava Dashboard

Personal cycling dashboard built with React. Displays training data, power analytics, and ride history from Strava.

## Features

- **Goals** — Weekly, monthly, and yearly distance targets with radial progress
- **Year Progress** — Cumulative distance chart vs previous year
- **Stats** — YTD and all-time totals with year-over-year comparison
- **Power Radar** — Best efforts across 14 durations vs Cat B reference
- **Power Curve** — Classic power duration curve from raw stream data
- **HR vs Power** — Aerobic efficiency scatter plot (W/bpm per ride)
- **Cadence Distribution** — Time-in-cadence histogram
- **Weekly Distance** — Stacked area chart (indoor vs outdoor)
- **Efficiency** — Power/HR ratio over time
- **Weekly TSS** — Training stress score (uses FTP from Strava)
- **Zones** — Time in power + HR zones (from Strava athlete settings)
- **Activity List** — Filterable ride history with links to Strava

## Project Structure

```
src/
├── api/
│   └── api.ts              # API client (fetches from strava-api backend)
├── features/
│   ├── overview/           # Goals, year progress chart
│   ├── stats/              # YTD + all-time stat cards
│   ├── power/              # Power radar chart
│   ├── streams/            # Power curve, HR vs power, cadence distribution
│   ├── training/           # Weekly distance, efficiency, TSS charts
│   ├── zones/              # Power + HR zone bar charts
│   └── activities/         # Activity list with filters
├── shared/
│   ├── layout/             # ChartCard, Section, StatsGrid, TimeRangeSelector
│   ├── StatCard.tsx
│   ├── CardPlaceholder.tsx
│   └── LineToggle.tsx
└── lib/
    ├── utils.ts            # Formatting helpers
    └── activity-utils.ts   # Activity filtering helpers
```

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

### Environment Variables

```
VITE_API_BASE=https://api.tiggenilsson.se
```

## Build & Deploy

```bash
npm run build      # TypeScript check + Vite build
npx vercel --prod  # Deploy to Vercel
```

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Recharts
- TanStack Query
