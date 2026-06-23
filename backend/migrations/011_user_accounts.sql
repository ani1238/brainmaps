-- BM-003: Single-learner user accounts (remove household concept)
--
-- Replaces the household → many-students model with a flat "one account = one
-- learner" model. Each user account now carries its own class (grade) and board
-- and is paired 1:1 with a single students row, which remains the anchor for all
-- progress, sessions, and revise scheduling. On login the user goes straight
-- into their own class + board curriculum (no child-picker step).
--
-- Apply with:
--   psql $DATABASE_URL -f migrations/011_user_accounts.sql

BEGIN;

-- ── 1. User accounts (parents → learners merged into one row) ─────────────────

CREATE TABLE IF NOT EXISTS users (
  id            UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT  NOT NULL,
  password_hash TEXT  NOT NULL,
  name          TEXT  NOT NULL,
  grade         INT   NOT NULL DEFAULT 6 CHECK (grade BETWEEN 3 AND 7),
  board         TEXT  NOT NULL DEFAULT 'CBSE' CHECK (board IN ('CBSE','ICSE')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(lower(email));

-- ── 2. Pair each student 1:1 with a user ─────────────────────────────────────

ALTER TABLE students ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- ── 3. Migrate existing households → users ───────────────────────────────────
-- Reuse the household id as the user id so auth_sessions / recovery_tokens can
-- simply be re-pointed. Grade/board are taken from the household's first
-- enrolled child (fallback: class 6 / CBSE).

INSERT INTO users (id, email, password_hash, name, grade, board, created_at)
SELECT h.id, h.email, h.password_hash, h.display_name,
       COALESCE(first_child.grade, 6),
       COALESCE(first_child.board, 'CBSE'),
       h.created_at
FROM households h
LEFT JOIN LATERAL (
  SELECT st.grade, st.board
  FROM household_students hs
  JOIN students st ON st.id = hs.student_id
  WHERE hs.household_id = h.id
  ORDER BY st.created_at
  LIMIT 1
) AS first_child ON TRUE
ON CONFLICT DO NOTHING;

-- Link each user to its first enrolled child (1:1).
UPDATE students st
SET user_id = link.household_id
FROM (
  SELECT DISTINCT ON (hs.household_id) hs.household_id, hs.student_id
  FROM household_students hs
  JOIN students s2 ON s2.id = hs.student_id
  ORDER BY hs.household_id, s2.created_at
) AS link
WHERE st.id = link.student_id;

-- ── 4. Re-point auth tables from households → users ──────────────────────────

ALTER TABLE auth_sessions   RENAME COLUMN household_id TO user_id;
ALTER TABLE auth_sessions   DROP CONSTRAINT IF EXISTS auth_sessions_household_id_fkey;
ALTER TABLE auth_sessions   ADD  CONSTRAINT auth_sessions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE recovery_tokens RENAME COLUMN household_id TO user_id;
ALTER TABLE recovery_tokens DROP CONSTRAINT IF EXISTS recovery_tokens_household_id_fkey;
ALTER TABLE recovery_tokens ADD  CONSTRAINT recovery_tokens_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ── 5. Drop orphaned demo students and enforce the 1:1 invariant ─────────────
-- Students never linked to a household (or extra children beyond the first)
-- have no owning account in the new model; remove them. Their progress,
-- sessions, and schedules cascade away.

DELETE FROM students WHERE user_id IS NULL;

ALTER TABLE students ALTER COLUMN user_id SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_user ON students(user_id);

-- ── 6. Drop the now-unused household tables ──────────────────────────────────

DROP TABLE IF EXISTS household_students;
DROP TABLE IF EXISTS households;

COMMIT;
