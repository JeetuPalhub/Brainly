# Production Release Checklist

This checklist is focused on deployment hardening and release safety.

## 1) Configuration and secrets

- [ ] Copy `backend/.env.example` to deployment secret manager.
- [ ] Set strong `JWT_SECRET` (32+ random chars).
- [ ] Set production `MONGO_URI` (TLS enabled, auth enabled).
- [ ] Set `CORS_ORIGIN` to exact frontend domain (no wildcard for prod).
- [ ] Set `PUBLIC_API_BASE_URL` to deployed backend API root (e.g. `https://api.example.com/api/v1`).
- [ ] Set `HF_API_TOKEN` (free Hugging Face token).
- [ ] Set optional AI configs (`HF_*`, `AI_CACHE_TTL_HOURS`, `AI_DUPLICATE_THRESHOLD`).
- [ ] Set `PORT` from platform/runtime if required.
- [ ] Set `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX` to production values.
- [ ] Do not commit `.env` files.

Frontend:
- [ ] Set `REACT_APP_API_BASE_URL` to deployed backend API root.

## 2) Build and deploy readiness

- [ ] Backend compiles: `cd backend && npm run build`.
- [ ] Frontend compiles/type-checks:
  - [ ] `cd frontend && npx tsc --noEmit`
  - [ ] `cd frontend && npm run build`
- [ ] Run `TESTING_CHECKLIST.md` before tagging release.

## 3) API security hardening

- [ ] Confirm security headers are active (`X-Frame-Options`, `X-Content-Type-Options`, etc.).
- [ ] Confirm rate limiting returns `429` after threshold.
- [ ] Confirm JWT-protected routes reject missing/invalid tokens.
- [ ] Validate request payload sizes and reject abnormal imports.
- [ ] Ensure CORS allows only expected origin.

## 4) Infrastructure hardening

- [ ] Use HTTPS only for frontend and backend.
- [ ] Put backend behind reverse proxy/load balancer.
- [ ] Enable request/body size limits at proxy and app layers.
- [ ] Restrict MongoDB network access to app hosts only.
- [ ] Enable daily automated backups for database.

## 5) Observability and operations

- [ ] Centralize logs with timestamps and severity.
- [ ] Capture error alerts (API 5xx spikes, process crashes).
- [ ] Add uptime checks for `/` and critical API paths.
- [ ] Define rollback plan (previous image/artifact ready).

## 6) Post-deploy verification

- [ ] Login/signup flow works on production URL.
- [ ] Add/edit/delete content works.
- [ ] Collections and import work.
- [ ] Share link works end-to-end.
- [ ] AI auto-tagging + summarization works from Add modal.
- [ ] Semantic search toggle works with ranked results.
- [ ] Duplicate detection warns for similar links.
- [ ] Run smoke test: `cd backend && npm run smoke:stage` (or set `SMOKE_BASE_URL` for deployed stage).
- [ ] Dark mode, notifications, mobile layout verified on production.
