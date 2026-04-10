# ☕ ChayaSpot

> Community-powered chai spot finder. Real spots, real hours, one-tap directions.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, React Router v6, CSS Modules |
| Backend | Node.js, Express |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Maps | Google Maps (directions redirect) |
| Fonts | Syne (display) + Nunito (body) |

---

## Project Structure

```
chayaspot/
├── client/          # React frontend
├── server/          # Node.js + Express API
└── supabase/
    └── schema.sql   # Run this in Supabase SQL editor
```

---

## Setup

### 1. Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run everything in `supabase/schema.sql`
3. Go to **Storage** and confirm the `spot-photos` bucket is public
4. Copy your **Project URL** and **anon key** from Settings > API

### 2. Client (React)

```bash
cd client
cp .env.example .env
# Fill in your Supabase URL and anon key in .env
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Server (Node.js)

```bash
cd server
cp .env.example .env
# Fill in your Supabase URL and SERVICE ROLE key in .env
npm install
npm run dev
```

API runs at [http://localhost:4000](http://localhost:4000)

---

## Environment Variables

### client/.env
```
REACT_APP_SUPABASE_URL=https://xxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
REACT_APP_GOOGLE_MAPS_KEY=your_google_maps_api_key
```

### server/.env
```
PORT=4000
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CLIENT_ORIGIN=http://localhost:3000
```

---

## Features

- 🔍 **Search** spots by name or area — live as you type
- 📍 **Open/Closed status** — computed from opening hours in real time
- 🗺️ **One-tap directions** — opens Google Maps with route from your location
- 📸 **Photos** — up to 3 photos per spot (max 2MB each)
- ✏️ **Community editing** — any signed-in user can add or edit spots
- 📱 **Mobile-friendly** — responsive layout for all screen sizes

---

## How It Works

### Adding a Spot
1. Click **Add Spot** (or the floating button)
2. Sign in / create a free account
3. Fill in: name, price, hours, contact, location, photos, description
4. Paste a Google Maps link — coordinates are auto-extracted
5. Hit **Submit** — spot is live immediately

### Directions
Clicking **Directions** on any spot opens:
```
https://www.google.com/maps/dir/?api=1&destination=LAT,LNG&travelmode=driving
```
This hands off directly to the Google Maps app on mobile.

---

## Deployment

- **Client**: Deploy to [Vercel](https://vercel.com) — connect your repo, set env vars, done.
- **Server**: Deploy to [Railway](https://railway.app) or [Render](https://render.com) — set env vars in dashboard.
- **Database**: Supabase is already hosted — nothing to do.

---

## Design

- **Colors**: Orange `#E8621A` + Cream `#FFFBF7`
- **Fonts**: [Syne](https://fonts.google.com/specimen/Syne) (headings) + [Nunito](https://fonts.google.com/specimen/Nunito) (body)
- **Theme**: Modern, warm, community feel

---

Made with ☕ for chai lovers everywhere.
