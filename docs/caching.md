# Caching (Redis)

Running log of **what we cache in Redis and why**. Append a bullet whenever you
add/remove a cached path so this stays the single source of truth.

## Infrastructure
- **Provider:** Fly/Upstash Redis — instance `brainmaps-cache`, region `sin`, eviction **enabled** (behaves as a true LRU cache).
- **Connection:** `REDIS_URL` Fly secret on `brainmaps-api`. In production the app and Redis are co-located in `sin` (private network, sub-ms); locally use `fly redis proxy`.
- **Code:** `backend/internal/cache/cache.go` (go-redis wrapper) + per-handler cache-aside.

## Design rules
- **Optional / graceful:** if `REDIS_URL` is unset or Redis is unreachable, the cache disables itself and every request falls through to Postgres. Nothing depends on the cache being up.
- **Off the hot path:** per-op timeouts default **250 ms** (`REDIS_TIMEOUT_MS` env override); a slow/down cache never delays a response.
- **Observability:** cached endpoints return an `X-Cache: HIT|MISS` response header.
- **Invalidation:** currently **TTL-only** (no explicit busting yet). TTLs are tuned per how fast each value changes — see the table.

## What is cached right now

| What | Key pattern | TTL | Source | Notes |
|------|-------------|-----|--------|-------|
| Dashboard aggregate (Today Home + My Progress) | `dash:<studentId>` | 3 min | `GET /dashboard` | Streak, mastery distribution, subject rollups, activity, improving/needs-attention. Heavy Neon query. Changes once per session; mild staleness is fine. |
| Today queues | `today:<studentId>` | 60s | `GET /today` | Fix queue + Revise queue + upcoming revise. Action-sensitive (a just-passed level should leave the Fix queue), so kept short. |
| Chapter mastery markers | `chapters:<studentId>:<subjectKey>` | 10 min | `GET /chapters?subject=` | Per-chapter mastered/in-progress counts for the brain-map. Only change when a concept becomes *fully mastered* (rare); the detailed per-station node markers come from the uncached `GET /concepts?chapter=`. Safe to cache long. |

## Not cached (and why)
- **Parent reports** (`parent_reports` table) — this is permanent **history**, not a cache; it must live in Postgres so parents can browse past reports.
- **Questions / session flow** (`/sessions`, `/concepts/*/questions`, grading) — write-heavy / correctness-critical; not safe to serve stale.
- **Auth / tokens** — handled in Postgres + JWT; no Redis.
- **Resume-an-attempt** — client-side `localStorage` (3h), not server cache.

## Backlog / ideas
- [ ] Bust `dash:`, `today:`, `chapters:<sid>:*` for a student on session completion (instant freshness, would let us raise TTLs further). Deferred because it touches in-flight WIP files.
- [ ] Cache `GET /concepts/{id}` detail (curriculum + progress overlay).
- [ ] Rate-limit / weekly quota for on-demand parent-report generation (the future billing gate) — natural Redis use.

## Changelog
- 2026-06-24 — Initial Redis cache: dashboard, today, chapters (30s TTL each). PR #28.
- 2026-06-24 — Tuned TTLs by change-rate: chapters 10 min, dashboard 3 min, today 60s. PR #30.
