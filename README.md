# Personal AI Fitness Assistant

A React/Vite + FastAPI fitness dashboard using the existing PostgreSQL/SQLAlchemy-style backend models and Gemini-backed AI services.

## Stack

- Frontend: React 18, Vite, Tailwind CSS v4, Recharts
- Backend: FastAPI, SQLAlchemy, Pydantic
- Auth: JWT
- Database: SQLite for local development; PostgreSQL supported for production
- AI: Gemini (`google-genai`)

## Run locally

### Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env   # Windows: copy .env.example .env
```

Set `JWT_SECRET` (16+ characters, required), `DATABASE_URL`, and optionally `GEMINI_API_KEY` / `GEMINI_MODEL` in `.env`. AI features return a clear 503 until a Gemini key is set; everything else works without one.

Start:

```bash
uvicorn app.main:app --reload
```

Backend health: `http://127.0.0.1:8000/health`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

For a deployed backend, set:

```text
VITE_API_URL=https://your-backend.example.com
```

## Architecture

```text
React
  ↓
src/api.js
  ↓
FastAPI
  ↓
SQLAlchemy services/models
  ↓
Database

AI pages
  ↓
FastAPI AI endpoints
  ↓
Gemini
```

The Gemini API key, JWT secret and database credentials remain backend-only.

## Important backend behavior

The existing backend was kept as the source of truth. The frontend uses its actual endpoint names and response structures rather than creating duplicate APIs.

Features currently wired to the backend:

- Authentication and protected sessions
- Profile (create **and edit**) and calculated goals
- Dashboard and daily briefing
- Nutrition and AI food logging
- Water (quick-add on Dashboard and Nutrition)
- Workouts and exercise logs
- Activity
- Sleep/recovery
- Weight and body measurements
- Progress photo URL references
- AI dietitian, trainer and coach
- AI recommendations
- Weekly/monthly reports
- Notifications

If `GEMINI_API_KEY` is not configured, AI endpoints return a clear `503` instead of exposing a backend traceback.

## Testing

```bash
cd backend
pytest
```

The tests use a temporary SQLite database and never call Gemini.

## Authentication / JWT setup

The backend must use a stable `JWT_SECRET`. If this value changes between backend restarts or differs between worker processes, previously issued JWTs become invalid and the frontend will show `Your session has expired`.

Create `backend/.env` from `backend/.env.example` and set a long random secret:

```env
JWT_SECRET=<long-random-secret>
JWT_ACCESS_MINUTES=10080
```

For a deployed backend, set the same `JWT_SECRET` in the hosting provider's environment variables. Do not commit the secret.

After changing the backend code or JWT secret, restart the backend and sign in again. If an old token remains in the browser, remove the site's `token` local-storage entry once and sign in again.
