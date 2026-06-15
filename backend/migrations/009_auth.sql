-- BM-002: Authentication and Authorization
-- Adds household accounts, parent-student relationships, auth sessions,
-- and account recovery tokens.

BEGIN;

-- ── Household accounts (parents / guardians) ──────────────────────────────────

CREATE TABLE IF NOT EXISTS households (
  id            UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT  NOT NULL,
  display_name  TEXT  NOT NULL,
  password_hash TEXT  NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Case-insensitive unique index on email
CREATE UNIQUE INDEX IF NOT EXISTS idx_households_email ON households(lower(email));

-- ── Parent-to-student membership ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS household_students (
  household_id  UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  student_id    UUID NOT NULL REFERENCES students(id)   ON DELETE CASCADE,
  PRIMARY KEY   (household_id, student_id),
  added_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_household_students_household ON household_students(household_id);
CREATE INDEX IF NOT EXISTS idx_household_students_student   ON household_students(student_id);

-- ── Household auth sessions (opaque bearer tokens) ────────────────────────────

CREATE TABLE IF NOT EXISTS auth_sessions (
  id            UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  UUID  NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  token_hash    BYTEA NOT NULL UNIQUE,          -- SHA-256 of the bearer token
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  last_used_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_agent    TEXT,
  ip_address    TEXT
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_token     ON auth_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_household ON auth_sessions(household_id);

-- ── Account recovery tokens (password reset) ─────────────────────────────────

CREATE TABLE IF NOT EXISTS recovery_tokens (
  id            UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  UUID  NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  token_hash    BYTEA NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 hour'),
  used_at       TIMESTAMPTZ
);

COMMIT;
