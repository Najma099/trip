# Spotter — HOS Trip Planner

**Ship it. Log it. Stay legal.** (Or at least know when you won't.)

Spotter is a dispatcher-grade trip planner for US freight. Punch in four fields — where you are, where the freight is, where it's going, and how many cycle hours you've burned — and get back a truck-safe route, a color-coded stop timeline, and FMCSA §395.8 daily log sheets that respect the 11-hour drive limit, 14-hour window, 30-minute break rule, and 70-hour/8-day cycle.

No login required. Not because we don't know how to build auth (we do — it's in there, JWT and all). Because when you're dispatching a load at 2 AM, the last thing you need is a sign-up form.

---

## Why guest login?

Dispatch doesn't happen during business hours. You should be able to open the page, plan a trip, and hand the driver a log sheet without creating an account, verifying an email, or remembering yet another password.

Auth exists (register, login, password-reset, token refresh) for when you *do* want your trips saved to an account. But it's optional. The guest mode generates a local ID, stashes it in your browser, and works exactly the same way. No account? No problem. Want an account? Also no problem.

---

## What's inside

| Output | What you get |
|--------|-------------|
| **Route map** | HGV routing via OpenRouteService with color-coded stops. The truck animates along the route. Overlapping stops get nudged apart so you can actually see them. |
| **Stop timeline** | Every planned event — pickup, dropoff, fuel, rest, break — with arrival and departure times. |
| **Daily logs** | FMCSA grid with duty-colored segments (Off · Sleeper · Driving · On Duty). Print 'em, hand 'em to the driver, stay compliant. |
| **Compliance verdict** | Legal or illegal with a plain-English reason if your clocks are fried. |

---

## HOS rules enforced (the ones that matter)

| Rule | Limit | Reset |
|------|-------|-------|
| Driving window | 14 hours from first on-duty | 10 consecutive hours off |
| Driving limit | 11 hours driving per window | 10 consecutive hours off |
| 30-minute break | After 8 cumulative driving hours | The break itself |
| 70-hour cycle | 70 on-duty hours in 8 days | 34-hour restart |
| Split-berth | 7+3 or 8+2 sleeper splits | Pair of sleeper periods |

**Scope:** Property-carrying only. 70h/8d cycle. No adverse-conditions exemption (yet). If you need short-haul or passenger-carrying rules, this isn't that — but the engine is built to extend.

---

## Architecture decisions (and why)

| Decision | Why we went that way |
|----------|---------------------|
| **Explicit reset model** | Most FMCSA implementations detect resets by checking if a gap exceeds 10 hours. That's fragile — it conflates "driver took a nap" with "driver did a full reset." Spotter inserts reset segments explicitly during simulation. Resets are *events*, not heuristics. |
| **Split-berth support** | It's in the regulations (49 CFR §395.1(g)). Most trip planners skip it. Spotter handles 7/3 and 8/2 sleeper splits natively. |
| **Road-distance interpolation** | Fuel stops were initially positioned at haversine (crow-flies) fractions along the route. That puts them in the wrong place — the road doesn't follow a straight line. Now we scale segment lengths by `road_total / haversine_total` so stops land where they'd actually occur. |
| **JWT auth + guest mode** | Auth is necessary for production. Guest mode is necessary for not losing users at the first hurdle. Both exist, neither blocks the other. Backward compat was preserved — all existing guest trips still work. |
| **TypeScript (3 files only)** | Full migration would touch 37 files with zero runtime benefit. We migrated the hardest component (TripMap), the constants file, and the shared types — that proves the pattern without signing up for a week of type-nannying. |
| **Service layer over fat views** | `hos_engine.py`, `trip_simulator.py`, `routing.py`, `log_builder.py`, `trip_builder.py` each own one thing. Views are thin. If you need to change how fuel stops work, you change one file, not one view. |
| **Docker over manual setup** | One command (`docker compose up --build`) and you're running. No Python version wars, no PostgreSQL install, no "works on my machine." |
| **Map animation fix** | The original code used React state to drive Leaflet's `dashArray`/`dashOffset`, causing a re-render race that broke the route animation. Fixed by using a `useRef` flag and firing the animation once via `requestAnimationFrame`. |
| **30-min break semantics** | Only driving time counts toward the 8-hour window that triggers a 30-minute break. On-duty (non-driving) time does NOT reset the driving clock — matching the actual regulation. |
| **BREAK_AFTER_DRIVE_MINUTES = 480** | The 30-minute break is triggered after 8 cumulative *driving* hours, not 8 on-duty hours. Subtle distinction, important for compliance. |
| **Fuel stop every 1000 miles** | Spec requirement. Not negotiable. Fuel stops are inserted at road-distance-scaled positions along the route. |

---

## Quick start (Docker)

```bash
docker compose up --build
# → http://localhost:3000  (frontend)
# → http://localhost:8000  (backend API)
```

---

## Quick start (local — for when Docker is being a diva)

### Prerequisites
- Python 3.11+
- Node 20+
- Docker (just for PostgreSQL)
- [OpenRouteService API key](https://openrouteservice.org/dev/) (free tier)

### Backend
```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Running tests

```bash
# Backend (25 tests — core engine, routing, API, log builder)
cd backend && python -m pytest tests/ -v

# Frontend (8 tests — TripMap, TripResults, FMCSALogSheet)
cd frontend && npm run test
```

---

## Project structure

```
spotter/
├── backend/
│   ├── accounts/          # JWT auth (register, login, me, password-reset)
│   ├── config/            # Django settings, URLs, WSGI
│   ├── trips/
│   │   ├── services/
│   │   │   ├── hos_engine.py       # Core FMCSA compliance engine
│   │   │   ├── trip_simulator.py   # Trip simulation + stop planning
│   │   │   ├── routing.py          # ORS client + road interpolation
│   │   │   ├── log_builder.py      # Daily log sheet generation
│   │   │   └── trip_builder.py     # Persist trip to DB
│   │   ├── models.py, views.py, serializers.py, urls.py
│   │   └── migrations/
│   ├── tests/             # 25 tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # React components (TripMap.tsx, FMCSALogSheet, etc.)
│   │   ├── pages/         # Landing, PlanTrip, TripResults, auth pages
│   │   ├── context/       # Auth, Guest, Toast providers
│   │   ├── services/      # Axios client
│   │   ├── hooks/         # useReducedMotion, useDocumentTitle
│   │   ├── utils/         # format, validation helpers
│   │   ├── types/         # TypeScript type definitions
│   │   └── constants/     # stopColors (typed)
│   ├── Dockerfile.frontend
│   └── nginx.conf
├── docker-compose.yml
└── .github/workflows/ci.yml
```

---

## Tech stack

- **Frontend:** React 19, Vite, Tailwind v4, Leaflet, Recharts
- **Backend:** Django 5 + DRF, pure-Python HOS engine
- **Routing:** OpenRouteService `driving-hgv` profile
- **Database:** PostgreSQL
- **Auth:** djangorestframework-simplejwt (JWT)
- **Container:** Docker + docker-compose

---

## License

MIT — for dispatch planning only, not a certified ELD device.
