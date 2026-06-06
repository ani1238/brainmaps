# BrainMaps API — Documentation

Go backend for the BrainMaps learning engine (Class 5–7, CBSE/ICSE).

## Contents

| Doc | What it covers |
|---|---|
| [architecture.md](./architecture.md) | System overview, component layout, hosting |
| [database.md](./database.md) | ER diagram, table reference, index strategy |
| [api.md](./api.md) | All endpoints, request/response shapes |
| [session-flow.md](./session-flow.md) | How a student works through a station |
| [ai-grading.md](./ai-grading.md) | FEYNMAN / BLURT / ACTIVE_RECALL grading pipeline |
| [scoring.md](./scoring.md) | EMA formula, mastery states, station unlock logic |

## Quick start

```bash
# 1. Copy env template
cp .env.example .env
# Fill in DATABASE_URL (Neon) and GEMINI_API_KEY (Google AI Studio)

# 2. Run migrations
psql $DATABASE_URL -f migrations/001_schema.sql
psql $DATABASE_URL -f migrations/002_seed_tapestry.sql

# 3. Start the server
go run ./cmd/server
# → listening on :8080
```

## Stack

| Layer | Choice | Why |
|---|---|---|
| Language | Go 1.22 | Fast, simple concurrency for async AI grading |
| Router | chi v5 | Lightweight, idiomatic, stdlib-compatible |
| DB driver | pgx v5 | Best-in-class Postgres driver for Go |
| Database | Neon (serverless Postgres) | Free tier, scales to zero, Postgres-compatible |
| AI grading | Gemini Flash 2.0 | 1,500 free req/day, fast, great JSON output |
| Hosting (API) | Fly.io or Railway free tier | Easy Go deploys, $0 to start |
