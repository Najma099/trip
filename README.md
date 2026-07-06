# Spotter Trip Planner

Trip planner for US trucking dispatchers. Enter current location, pickup, dropoff, and cycle hours used — get back an HOS-compliant truck route map and FMCSA daily log sheets.

## Architecture

```
React (Vercel)  ──JSON──►  Django REST API (Render/Railway)  ──►  OpenRouteService
                                    │
                                    ▼
                              PostgreSQL
```

- **Frontend:** React + Vite, react-leaflet map, SVG log sheets, guest mode via `localStorage` UUID
- **Backend:** Django + DRF, pure-Python HOS engine, ORS `driving-hgv` truck routing
- **Database:** PostgreSQL for trip history keyed by `guest_id`

## Hours-of-Service rules enforced

| Clock | Limit | Reset | Regulation |
|---|---|---|---|
| Driving window | 14 hours from first on-duty | 10 consecutive hours off | 49 CFR §395.3(a)(2) |
| Driving limit | 11 hours driving per window | 10 consecutive hours off | 49 CFR §395.3(a)(3) |
| 30-minute break | After 8 cumulative driving hours | The break itself | 49 CFR §395.3(a)(3)(ii) |
| 70-hour cycle | 70 on-duty hours in 8 days | 34-hour restart | 49 CFR §395.3(b)(2) |

Trip sequence: pre-trip inspection → drive to pickup → 1 hr on-duty at pickup → drive to dropoff (fuel every ≤1,000 mi) → 1 hr on-duty at dropoff. Rest, break, and restart events are inserted automatically when clocks are exhausted.

## Requirements

- Python 3.11+
- Node 20+
- Docker (for local PostgreSQL)
- [OpenRouteService](https://openrouteservice.org/dev/) API key (free tier)

## Local setup

### 1. Environment

```bash
cp .env.example .env
# Edit .env — set ORS_API_KEY from https://openrouteservice.org/dev/
```

### 2. Database

```bash
docker compose up -d db
```

### 3. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
# → http://127.0.0.1:8000
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173  (proxies /api to Django)
```

### 5. Demo trip

Open the app → **Try Demo Trip** or on the plan form click **Load Demo Trip**:

- Current: Dallas, TX
- Pickup: Houston, TX
- Dropoff: Chicago, IL
- Cycle used: 20 hours

## Running tests

```bash
cd backend
source .venv/bin/activate
pytest tests/ -v
```

## API

### `POST /api/trips/`

```json
{
  "current_location": "Dallas, TX",
  "pickup_location": "Houston, TX",
  "dropoff_location": "Chicago, IL",
  "current_cycle_used": 20.0,
  "guest_id": "uuid-from-localStorage"
}
```

Returns trip envelope with `route.geometry`, `stops[]`, `daily_logs[]`, `is_legal`.

### `GET /api/trips/<id>/`

Retrieve a saved trip (no re-routing).

### `GET /api/trips/?guest_id=<uuid>`

List guest's past trips.

### `GET /api/geocode/?text=<query>`

Location autocomplete suggestions.

## Deployment

### Backend (Render)

1. Push repo to GitHub
2. Create Render Web Service from `render.yaml` or manually:
   - Root directory: `backend`
   - Build: `pip install -r requirements.txt && python manage.py migrate --noinput`
   - Start: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
3. Set env vars: `ORS_API_KEY`, `CORS_ALLOWED_ORIGINS` (your Vercel URL), `DATABASE_URL`

### Frontend (Vercel)

1. Import repo, set root directory to `frontend`
2. Set `VITE_API_URL` to your Render/Railway backend URL
3. Deploy

## Scope cuts (intentionally deferred)

- JWT auth / account login (guest mode only for MVP)
- Sleeper-berth split (§395.1(g))
- Adverse driving conditions (§395.1(b))
- Team drivers / co-drivers
- PDF export of log sheets
- Short-haul exemptions

## Project structure

```
trip/
├── backend/
│   ├── config/           Django settings & URLs
│   ├── trips/
│   │   ├── models.py     Trip, RouteStop, DutyStatusSegment
│   │   ├── hos_constants.py
│   │   └── services/
│   │       ├── hos_engine.py
│   │       ├── routing.py
│   │       ├── trip_simulator.py
│   │       └── log_builder.py
│   └── tests/
├── frontend/
│   └── src/
│       ├── components/   MapView, LogSheet, TripForm
│       ├── pages/        Landing, Plan, Results
│       └── context/      GuestContext
├── docker-compose.yml
└── render.yaml
```
