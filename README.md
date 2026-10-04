# Personal AI Fitness (Phase 1 + core Phase 3)

## Run locally
```bash
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env     # set JWT_SECRET and ANTHROPIC_API_KEY
uvicorn app.main:app --reload       # API docs: http://localhost:8000/docs
cd ../frontend && npm install && npm run dev   # http://localhost:5173
```
Tests: `cd backend && pytest`

## Database
SQLite by default. For PostgreSQL create a DB and set `DATABASE_URL=postgresql+psycopg2://user:pass@host/fitness`.
Tables are auto-created in dev. For production run `alembic init migrations`, point it at `app.models.Base.metadata`, then `alembic revision --autogenerate && alembic upgrade head`, and remove `create_all` in `main.py`.

## AI
Set `ANTHROPIC_API_KEY` (never commit `.env`). The model can only call read-only tools (`get_user_profile`, `get_today_summary`, `get_nutrition_history`, `get_weight_history`); the user id comes from the JWT. Food parsing returns a *proposal* the user edits before it is saved.

## Production
Serve behind HTTPS, set a strong `JWT_SECRET`, restrict `CORS_ORIGINS`, run `uvicorn` with several workers, build the frontend with `npm run build`, and add rate limiting (e.g. slowapi or your reverse proxy) on `/auth/*` and `/ai/*`.

## Not yet built
Workouts/exercise DB, sleep, steps, measurements, progress photos, image food recognition, weekly/monthly reports, adaptive calories, notifications, streaks, history search, budget/ingredient planners.

## Phase 1 database migrations

The application no longer creates tables automatically at startup. Use Alembic:

```bash
cd backend
alembic upgrade head
```

After model changes, generate a migration:

```bash
alembic revision --autogenerate -m "describe change"
alembic upgrade head
```

## Phase 1 tracking APIs

- `GET /health`
- `GET /daily-log/{date}`
- `POST /daily-log`
- `GET /daily-log?days=14`

Daily logs combine stored daily activity/recovery information with calculated nutrition and hydration totals. Profile updates create a historical profile snapshot before applying the new values.
