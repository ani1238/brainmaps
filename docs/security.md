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

## 6. Row-Level Security — ENABLED

RLS is **live** on the per-student data tables (`concept_progress`,
`revise_schedule`, `sessions`, `session_answers`, `student_weak_concepts`,
`parent_reports`, `study_plans`, `plan_items`, `plan_leaves`) — migration
`019_rls.sql`, `FORCE ROW LEVEL SECURITY`, policies keyed on a per-request GUC
`app.student_id` (USING + WITH CHECK).

How the identity is set:
- **Request path** — `middleware.RLSContext` opens a per-request transaction and
  runs `SET LOCAL app.student_id = <JWT student id>`; all protected handlers run
  their queries on that transaction (via the `db.Q(ctx)` querier). Commits on
  success, rolls back on panic/5xx.
- **Background** — the async grader and MCQ recompute wrap their DB phases in
  `db.RunAsStudent(ctx, studentID, …)` (a short transaction with the GUC set;
  slow AI calls are kept outside it so a pool connection isn't held).

**Dedicated role (the key piece):** the default Neon role `neondb_owner` has
`BYPASSRLS`, so policies never apply to it. The app therefore connects as a
separate **`brainmaps_app`** role — `NOSUPERUSER NOBYPASSRLS`, granted only
DML + sequence usage. Migrations and admin still use the owner. With this role
the policies are enforced: verified that with `app.student_id = A`, a query for
B's rows returns **0**, inserting B's row is **rejected** by `WITH CHECK`, and
with **no** GUC every protected table returns **0** (fail-closed).

**Rollback:** set the `DATABASE_URL` Fly secret back to the owner role (instant —
owner bypasses RLS), or `ALTER TABLE <t> DISABLE ROW LEVEL SECURITY;` per table.

## 7. Backlog / recommendations

- Distributed (per-account) login throttling — current limiter is per-instance
  and per-IP; add per-email backoff for credential-stuffing resistance.
- Extend RLS to `users`/`students`/`auth_sessions` (needs a bypass path for the
  pre-auth register/login/reset flows).
- Rotate `JWT_SECRET` / DB creds if ever shared; confirm `JWT_SECRET` entropy.
- Lightweight audit logging for sensitive actions (PIN changes, report access).

## Changelog
- 2026-06-25 — Audit + hardening: roles (018), error sanitization, security
  headers, auth rate limiting; RLS staged (019) with rollout plan.
- 2026-06-25 — RLS **enabled**: dedicated non-bypass `brainmaps_app` role,
  per-request `app.student_id` (RLSContext) + `db.RunAsStudent` for background
  jobs; all protected handlers routed through a context querier.
