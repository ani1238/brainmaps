-- 019: Row-Level Security (STAGED — DO NOT APPLY YET).
--
-- ⚠️  This migration is intentionally NOT applied in production yet. RLS only
--     protects data when the application sets a per-request identity on the
--     connection (via `SET LOCAL app.user_id = '<uuid>'` inside a transaction)
--     AND the app connects as a role that is subject to RLS.
--
--     The current backend issues queries directly on a shared pgx pool (no
--     per-request transaction) and the async grader runs on a background
--     context. Enabling FORCE RLS before that plumbing exists would deny every
--     query and take the app down. See docs/security.md → "RLS rollout plan".
--
-- Tenant isolation is ALREADY enforced at the application layer (every endpoint
-- scopes by the authenticated user/student). This migration adds defense in
-- depth once the request-scoped identity is wired up.
--
-- To roll out: (1) ship the request-scoped transaction middleware that runs
-- `SET LOCAL app.user_id`, (2) make the async grader set it too, (3) apply this
-- file, (4) verify, with a tested rollback (DISABLE ROW LEVEL SECURITY).

BEGIN;

-- Identity helpers reading the per-request GUC.
CREATE OR REPLACE FUNCTION app_user_id() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('app.user_id', true), '')::uuid
$$;

-- Tables keyed directly on the user.
ALTER TABLE users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE users           FORCE  ROW LEVEL SECURITY;
CREATE POLICY users_self ON users
  USING (id = app_user_id());

ALTER TABLE students        ENABLE ROW LEVEL SECURITY;
ALTER TABLE students        FORCE  ROW LEVEL SECURITY;
CREATE POLICY students_own ON students
  USING (user_id = app_user_id());

ALTER TABLE auth_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_sessions   FORCE  ROW LEVEL SECURITY;
CREATE POLICY auth_sessions_own ON auth_sessions
  USING (user_id = app_user_id());

-- Tables keyed on student → students.user_id.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'concept_progress', 'revise_schedule', 'sessions',
    'student_weak_concepts', 'parent_reports',
    'study_plans', 'plan_items', 'plan_leaves'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE  ROW LEVEL SECURITY', t);
    EXECUTE format($f$
      CREATE POLICY %1$s_own ON %1$I
        USING (student_id IN (SELECT id FROM students WHERE user_id = app_user_id()))
    $f$, t);
  END LOOP;
END $$;

-- session_answers is keyed via its session.
ALTER TABLE session_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_answers FORCE  ROW LEVEL SECURITY;
CREATE POLICY session_answers_own ON session_answers
  USING (session_id IN (
    SELECT s.id FROM sessions s
    JOIN students st ON st.id = s.student_id
    WHERE st.user_id = app_user_id()
  ));

COMMIT;
