# Security

Audit + hardening done before opening BrainMaps to real (internal) users.
Tenant isolation — "user 1 can never see user 2's data" — is the headline
requirement and is enforced at the application layer (see §3), with Postgres
RLS staged as defense-in-depth (§6).

## 1. Authentication

- **Access tokens**: stateless HS256 JWTs. Secret from `JWT_SECRET` env
  (rejected if &lt;16 chars). Verification recomputes HMAC-SHA256 with the
  server key and does a **constant-time** compare, then checks `exp` — there is
  no `alg:none` / algorithm-confusion path. Short TTL.
- **Refresh tokens**: opaque random 32-byte values; only their SHA-256 hash is
  stored (`auth_sessions.token_hash`); rotated on every refresh.
- **Passwords & parent PINs**: `sha256pbkdf2` with **600,000** iterations + a
  32-byte random salt, constant-time verify. Never stored in plaintext.

## 2. Roles (migration 018)

`users.role ∈ {student, parent, admin}` (default `student`). Server-side gate
`middleware.RequireAdmin` (+ `middleware.Role(ctx)`) is available for admin-only
routes; `role` is returned by `GET /auth/me`. Promote an internal user with:

```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```

## 3. Authorization / tenant isolation

Every data endpoint scopes to the authenticated identity — there is no endpoint
that returns another user's data from a client-supplied id without an ownership
check:

| Pattern | Where | How |
|---|---|---|
| Token-derived student | `/today`, `/dashboard` | `?student=` must pass `AuthorizeStudent` (student belongs to the JWT user) |
| Token-derived student | all `/plan/*`, `/concepts/{id}/sessions` | `StudentForUser(ctx)` + `WHERE student_id = $self` |
| Per-session capability | `/sessions/{id}`, `/sessions/{id}/review` | bound to a per-session `access_token_hash` the client holds |
| Owned by student | `/sessions/{id}/report` | `WHERE id = $1 AND student_id = $self` |
| Owned by student (PIN) | `/report`, `/report/item` | student resolved from user + parent PIN, then `WHERE student_id = $self` |
| Write | `POST /sessions` | `AuthorizeStudent(req.studentId)` before insert |
| Curriculum (global) | `/chapters`, `/concepts*` | non-personal; answer keys/rubrics are stripped server-side (`activeQuestions`) before returning |

## 4. Hardening shipped this pass

- **No internal-error leakage**: all 22 handlers that echoed raw `err.Error()`
  on 500s now use `serverErr` — logs the real error server-side, returns a
  generic `"something went wrong"`. (SQL text / driver / schema no longer leak.)
- **Security headers** (every response): `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`,
  `Cross-Origin-Resource-Policy: same-origin`, `X-Robots-Tag: noindex`.
- **Auth rate limiting**: per-IP token bucket (~60/min, burst 20) on
  `/auth/*` to slow brute force / abuse (real client IP via `Fly-Client-IP`).
  Generous enough that real users are never blocked.

## 5. CORS

Deny-by-default: only origins in `ALLOWED_ORIGINS` (+ localhost) are reflected;
methods limited to GET/POST/OPTIONS. In production the browser calls the API
**same-origin** through the Next.js rewrite (`/api/v1/* → fly`), so no
cross-origin requests occur. `ALLOWED_ORIGINS` is intentionally unset in prod.

## 6. Row-Level Security — status & rollout plan

**Status: staged, NOT enabled** (migration `019_rls.sql` is written but not
applied). Tenant isolation is already enforced in the app (§3); RLS would add a
DB-level backstop.

**Why not flipped on today:** RLS only protects data if the app sets a
per-request identity on the connection (`SET LOCAL app.user_id` inside a
transaction) and connects as a role subject to RLS. The backend currently runs
queries directly on a shared pgx pool (no per-request transaction), and the
async grader runs on a background context. Turning on `FORCE ROW LEVEL
SECURITY` before that plumbing exists would deny every query and take the app
down — unacceptable while real users are testing.

**Rollout plan (safe, tested, separate change):**
1. Add request-scoped transaction middleware on the authenticated group that
   runs `SET LOCAL app.user_id = '<jwt user>'`; expose a `db.Q(ctx)` querier
   and switch protected handlers from `db.Pool` to it.
2. Make the async grader open its own transaction and set `app.user_id` for the
   session's owner.
3. Apply `019_rls.sql`.
4. Verify (positive: a user sees only their rows; negative: cross-user reads
   return 0 rows) on staging, with `DISABLE ROW LEVEL SECURITY` as instant
   rollback.

## 7. Backlog / recommendations

- Execute the RLS rollout above.
- Distributed (per-account) login throttling — current limiter is per-instance
  and per-IP; add per-email backoff for credential-stuffing resistance.
- Rotate `JWT_SECRET` / DB creds if they were ever shared; confirm
  `JWT_SECRET` is high-entropy.
- Lightweight audit logging for sensitive actions (PIN changes, report access).

## Changelog
- 2026-06-25 — Audit + hardening: roles (018), error sanitization, security
  headers, auth rate limiting; RLS staged (019) with rollout plan.
