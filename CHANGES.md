# What changed

## Bugs fixed
**Backend**
- Config named `anthropic_api_key`/`ai_model` while everything else used Gemini; `JWT_ACCESS_MINUTES` in `.env.example` was ignored (field was `token_minutes`). Settings now match `.env.example`; `database.py` and AI code read from one `settings` object.
- AI responses wrapped in ```json fences crashed `json.loads` (→ 502). All AI services now share `ai_client.py` (JSON mode + tolerant parser); AI numbers are coerced before DB insert.
- "Profile/goals missing" returned HTTP 200 with `{"error": ...}` from 6 endpoints; now 409 with a message. Missing photo/notification returned 200 → now 404.
- Monthly report used the same 7-day window as weekly; it now covers 30 days (`/analytics/progress?days=`).
- Profile could be created but never edited (POST → 400 afterwards). Added `PUT /profile`.
- AI food log always saved to the *server's* today; it now accepts the selected date. Dashboard/briefing/diet advice accept a client date too.
- Nutrition endpoint didn't return `calories_target`/`protein_target`, so progress bars on the Nutrition page never rendered.
- Notification generation created duplicates on every click.
- Exercise library was empty (no seed) so exercises couldn't be logged; added a starter library + `GET /workouts/{id}/exercises`.
- Login/registration: emails are case-insensitive; password min length enforced; input ranges validated (age, weight, water, sleep…).
- `models/__init__.py` was missing (alembic saw no models); removed stray `models/backend/` directory.

**Frontend**
- Dates used `toISOString()` (UTC) → wrong day near midnight in non-UTC zones. Now local dates.
- Dashboard, AI and Reports pages used `Promise.all` with AI calls: if Gemini was down/unconfigured, the *entire page* failed. AI is now on-demand per card, cached for the session (also stops silent API spend on every page view).
- Any non-404 error while loading the profile (server down, 500) dropped users into profile setup. Now only a real 404 does.
- Failed login showed "session expired" (401 handler); now shows the real message. 422 validation errors render readably.
- `useEffect(() => load())` returned a Promise (React warning) on Recovery/Progress.
- No way to log water or create exercises; now added. Logged exercises per workout are visible.
- Removed ~16 unused legacy components that imported functions that no longer exist.

## UI
Tokenised design system with automatic dark mode, Bricolage Grotesque/Figtree fonts (they were loaded but unused), icon nav with unread badge, calorie ring + macro bars, toasts, loading/disabled states, password show/hide, profile editing, 7/30-day report switcher with real stat cards (instead of raw JSON), AI chat suggestions + auto-scroll, accessible labels/focus states, reduced-motion support.

## Not verified
No network in my sandbox, so I could not `npm install`/`vite build` or run `pytest`/the API. I verified: all Python compiles, all JSX parses, every import/export resolves, and the JSON-extraction helper was exercised directly. Please run `pytest` and `npm run dev` once.
