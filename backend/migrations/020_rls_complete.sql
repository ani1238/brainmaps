-- 020: complete RLS coverage on every table (tiered policies, single app role).
--
-- 019 enabled RLS on the per-student data tables. This finishes the job so NO
-- table is left RLS-disabled, while keeping the app working under the
-- non-bypass brainmaps_app role. Three tiers:
--
--   * auth/identity (users, students, auth_sessions, recovery_tokens):
--       owner-scoped, with a pre-auth escape — pre-login flows (login, register,
--       refresh, password reset) run with NO app.user_id set and legitimately
--       need to read/write before identity exists; authenticated requests
--       (app.user_id set by middleware.RLSContext) can only touch their own rows.
--   * curriculum/reference (subjects, chapters, concepts, questions, mcq_options):
--       global read-only — everyone may SELECT; writes are denied for the app
--       role (curriculum is seeded by migrations as the owner).
--   * leads: insert-only for the app (public lead capture); reads stay owner-only.
--
-- Stale content-replace backup tables are dropped (unused, not referenced in code).

BEGIN;

-- 0. Drop stale backup tables (no code references; superseded 2026-06-19).
DROP TABLE IF EXISTS content_replace_backup_20260619_session_answers;
DROP TABLE IF EXISTS content_replace_backup_20260619_mcq_options;
DROP TABLE IF EXISTS content_replace_backup_20260619_questions;

-- Identity GUC helper (app.student_id helper already exists from 019).
CREATE OR REPLACE FUNCTION app_user_id() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('app.user_id', true), '')::uuid
$$;

-- 1. Auth / identity tables — owner-scoped with a pre-auth escape.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE  ROW LEVEL SECURITY;
DROP POLICY IF EXISTS users_rls ON users;
CREATE POLICY users_rls ON users
  USING      (app_user_id() IS NULL OR id = app_user_id())
  WITH CHECK (app_user_id() IS NULL OR id = app_user_id());

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE students FORCE  ROW LEVEL SECURITY;
DROP POLICY IF EXISTS students_rls ON students;
CREATE POLICY students_rls ON students
  USING      (app_user_id() IS NULL OR user_id = app_user_id())
  WITH CHECK (app_user_id() IS NULL OR user_id = app_user_id());

ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_sessions FORCE  ROW LEVEL SECURITY;
DROP POLICY IF EXISTS auth_sessions_rls ON auth_sessions;
CREATE POLICY auth_sessions_rls ON auth_sessions
  USING      (app_user_id() IS NULL OR user_id = app_user_id())
  WITH CHECK (app_user_id() IS NULL OR user_id = app_user_id());

ALTER TABLE recovery_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_tokens FORCE  ROW LEVEL SECURITY;
DROP POLICY IF EXISTS recovery_tokens_rls ON recovery_tokens;
CREATE POLICY recovery_tokens_rls ON recovery_tokens
  USING      (app_user_id() IS NULL OR user_id = app_user_id())
  WITH CHECK (app_user_id() IS NULL OR user_id = app_user_id());

-- 2. Curriculum / reference tables — global read, writes denied for the app role.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['subjects','chapters','concepts','questions','mcq_options'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE  ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS %1$s_read ON %1$I', t);
    EXECUTE format('CREATE POLICY %1$s_read ON %1$I FOR SELECT USING (true)', t);
  END LOOP;
END $$;

-- 3. leads — public insert only (CreateLead); reads remain owner-only.
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads FORCE  ROW LEVEL SECURITY;
DROP POLICY IF EXISTS leads_insert ON leads;
CREATE POLICY leads_insert ON leads FOR INSERT WITH CHECK (true);

COMMIT;
