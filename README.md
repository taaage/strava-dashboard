# Strava Dashboard

A personal cycling dashboard that displays your training data, power analytics, and ride history from Strava. Built with React, designed to be deployed on Vercel.

This is the **frontend** — it reads data from the companion [strava-api](#strava-api-backend) backend.

![React](https://img.shields.io/badge/React_18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)

## Features

- **Goals** — Weekly, monthly, and yearly distance targets with radial progress rings
- **Year Progress** — Cumulative distance chart comparing multiple years + goal pace line
- **Stats** — YTD and all-time totals with year-over-year comparison
- **Power Radar** — Best efforts across 14 durations vs a configurable reference profile
- **Power Curve** — Classic power duration curve with per-year comparison
- **HR vs Power** — Aerobic efficiency scatter plot (W/bpm per ride, categorized)
- **Cadence Distribution** — Time-in-cadence histogram
- **Weekly Distance** — Indoor vs outdoor stacked line chart
- **Efficiency** — Power/HR ratio trend over time
- **Weekly TSS** — Training Stress Score (computed from FTP)
- **Power + HR Zones** — Time in zone using your Strava zone settings
- **Activity List** — Filterable ride history with links to Strava

## Deploy Your Own

### Prerequisites

- A [Strava](https://www.strava.com) account with ride data
- A [Vercel](https://vercel.com) account (free tier works)
- Node.js 18+

### Step 1: Deploy the backend

The dashboard needs data from the strava-api backend. See [strava-api setup](#strava-api-backend) below — deploy that first and note the URL.

### Step 2: Clone and configure

```bash
git clone <your-repo-url>
cd strava-dashboard
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_API_BASE=https://your-api.vercel.app
```

### Step 3: Deploy to Vercel

```bash
npx vercel --prod
```

Or connect the repo in the Vercel dashboard — it auto-deploys on push.

Set `VITE_API_BASE` in your Vercel project's Environment Variables settings.

### Step 4: Customize (optional)

All customization is through environment variables. Add these to `.env.local` (dev) or Vercel environment settings (production):

#### Distance goals

```env
VITE_WEEKLY_GOAL_KM=150        # Default: 150
VITE_MONTHLY_GOAL_KM=650       # Default: 650
VITE_YEARLY_GOAL_KM=10000      # Default: 10000
```

#### Power reference profile

The radar chart compares your best efforts against a reference. Default is ~Cat B racing (~3.6 W/kg @ 85 kg). Override with your own targets:

```env
VITE_POWER_REFERENCE='{"5s":1000,"15s":800,"30s":600,"1min":480,"2min":400,"3min":370,"5min":340,"8min":320,"10min":310,"15min":300,"20min":290,"30min":275,"45min":260,"60min":250}'
VITE_POWER_REFERENCE_LABEL=My targets
```

#### Ride category thresholds

Controls how rides are categorized in the HR vs Power chart:

```env
VITE_CATEGORY_RACE_MIN_WATTS=250       # Default: 250
VITE_CATEGORY_TEMPO_MIN_WATTS=200      # Default: 200
VITE_CATEGORY_ENDURANCE_MIN_WATTS=150  # Default: 150
```

## Local development

```bash
npm install
cp .env.example .env.local     # then set VITE_API_BASE
npm run dev                    # starts at http://localhost:5173
```

## Project structure

```
src/
├── api/
│   └── api.ts                # API client (fetches from strava-api backend)
├── features/
│   ├── overview/             # Goals, year progress chart
│   ├── stats/                # YTD + all-time stat cards
│   ├── power/                # Power radar chart
│   ├── streams/              # Power curve, HR vs power, cadence distribution
│   ├── training/             # Weekly distance, efficiency, TSS charts
│   ├── zones/                # Power + HR zone bar charts
│   └── activities/           # Activity list with filters
├── shared/                   # Reusable layout + chart components
└── lib/
    └── utils.ts              # Formatting helpers
```

## Tech stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Recharts
- TanStack Query

---

## strava-api backend

The backend lives in a separate repo/directory. It handles Strava OAuth, caches data in Vercel Blob, and auto-syncs via webhooks — no polling.

### Backend setup

1. **Create a Strava API app** at https://www.strava.com/settings/api
   - Set Authorization Callback Domain to your deployment domain

2. **Get a Gemini API key** (optional, for AI activity descriptions) at https://aistudio.google.com/app/apikey

3. **Create Vercel Blob storage** in the Vercel dashboard under Storage > Blob

4. **Configure environment variables:**

```env
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_REFRESH_TOKEN=your_refresh_token
STRAVA_VERIFY_TOKEN=any_random_string
STRAVA_CACHE_READ_WRITE_TOKEN=from_vercel_blob
GEMINI_API_KEY=your_gemini_key            # optional
APP_URL=https://your-dashboard.vercel.app  # optional, appended to AI descriptions
```

5. **Deploy:**

```bash
cd strava-api
npm install
npx vercel --prod
```

6. **Register the webhook** with Strava:

```bash
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -F client_id=YOUR_CLIENT_ID \
  -F client_secret=YOUR_CLIENT_SECRET \
  -F callback_url=https://your-api.vercel.app/api/webhook \
  -F verify_token=YOUR_VERIFY_TOKEN
```

7. **Trigger initial data sync:**

```bash
curl https://your-api.vercel.app/api/sync-athlete
```

After this, the webhook keeps everything in sync automatically whenever you upload or edit a ride on Strava.

### Getting a Strava refresh token

1. Authorize your app in the browser:
   ```
   https://www.strava.com/oauth/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost&scope=read_all,activity:read_all,activity:write
   ```
2. Copy the `code` parameter from the redirect URL
3. Exchange it for tokens:
   ```bash
   curl -X POST https://www.strava.com/oauth/token \
     -d client_id=YOUR_CLIENT_ID \
     -d client_secret=YOUR_CLIENT_SECRET \
     -d code=THE_CODE \
     -d grant_type=authorization_code
   ```
4. Use the `refresh_token` from the response

## License

MIT
