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

## 6. Row-Level Security — ENABLED on every table

RLS is **live and forced on every table**, under the non-bypass `brainmaps_app`
role, with tiered policies (migrations `019` + `020`):

| Tier | Tables | Policy |
|---|---|---|
| Per-student data | concept_progress, revise_schedule, sessions, session_answers, student_weak_concepts, parent_reports, study_plans, plan_items, plan_leaves | `student_id = app_student_id()` (USING + WITH CHECK) |
| Auth / identity | users, students, auth_sessions, recovery_tokens | `app_user_id() IS NULL OR <owner = app_user_id()>` |
| Curriculum / reference | subjects, chapters, concepts, questions, mcq_options | `FOR SELECT USING (true)` — global read; writes denied for the app role |
| Lead capture | leads | `FOR INSERT WITH CHECK (true)` — public insert; reads owner-only |

**Identity GUCs**, set per request by `middleware.RLSContext` inside a
transaction (`SET LOCAL app.user_id` + `app.student_id`), and by
`db.RunAsStudent` for background jobs (`app.student_id`):
- Authenticated requests are scoped to their own user + student rows.
- **Pre-auth flows** (login, register, refresh, forgot/reset) run with *no*
  GUC — `app_user_id() IS NULL` — which is the deliberate escape that lets them
  read a user by email / create accounts before identity exists. This is
  inherent: the lookup that *establishes* identity can't itself be
  identity-scoped. `SET LOCAL` is transaction-scoped, so a pooled connection
  never leaks one request's identity into the next.

**Why a dedicated role:** the default `neondb_owner` has `BYPASSRLS`, so policies
never apply to it. The app connects as **`brainmaps_app`** (`NOSUPERUSER
NOBYPASSRLS`, DML + sequence grants only). Migrations/admin still use the owner.

> ⚠️ **Operational note / how login once broke:** if a table has
> `relrowsecurity = true` but **no policy**, it is **deny-all** for the
> non-bypass role. Never `ENABLE ROW LEVEL SECURITY` without also creating a
> policy. Verified end-to-end as `brainmaps_app`: register/login/forgot, all
> protected reads + writes (incl. session complete → background recompute, plan
> generate), cross-user 403, and SQL isolation (a scoped user sees only its own
> user/student rows; pre-auth sees all users so login works).

**Rollback:** point the `DATABASE_URL` Fly secret back at `neondb_owner` (owner
bypasses RLS — instant), or `ALTER TABLE <t> DISABLE ROW LEVEL SECURITY;`.

## 7. Backlog / recommendations

- Distributed (per-account) login throttling — current limiter is per-instance
  and per-IP; add per-email backoff for credential-stuffing resistance.
- Consider a separate low-privilege auth role for the pre-auth handlers to
  remove the `app_user_id() IS NULL` escape on identity tables entirely.
- Rotate `JWT_SECRET` / DB creds if ever shared; confirm `JWT_SECRET` entropy.
- Lightweight audit logging for sensitive actions (PIN changes, report access).

## Changelog
- 2026-06-25 — Audit + hardening: roles (018), error sanitization, security
  headers, auth rate limiting; RLS staged (019) with rollout plan.
- 2026-06-25 — RLS **enabled** on per-student tables: dedicated non-bypass
  `brainmaps_app` role, per-request `app.student_id` (RLSContext) +
  `db.RunAsStudent` for background jobs; protected handlers routed through a
  context querier.
- 2026-06-25 — RLS **completed on every table** (020): auth/identity tables
  owner-scoped with a pre-auth escape (RLSContext also sets `app.user_id`),
  curriculum read-only, leads insert-only; stale content-replace backup tables
  dropped. (Fixes a deny-all login outage caused by tables left RLS-on with no
  policy.)
