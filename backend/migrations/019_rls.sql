-- 019: Row-Level Security on the per-student data tables.
--
-- Defense-in-depth on top of the app-layer ownership checks. Every one of these
-- tables is keyed (directly or via its session) on a student. The application
-- sets the current student per request/job via `SET LOCAL app.student_id`:
--   * request path: middleware.RLSContext (app.student_id = JWT student id)
--   * background:    db.RunAsStudent (async grader, MCQ recompute)
-- With those in place, FORCE RLS guarantees a connection can only read/write the
-- rows of the student it was scoped to — even if a query forgets its WHERE.
--
-- Rollback: `ALTER TABLE <t> DISABLE ROW LEVEL SECURITY;` per table.
--
-- NOTE: users / students / auth_sessions / recovery_tokens are intentionally NOT
-- covered — they're touched by pre-auth flows (register/login/reset) that have
-- no student context. Their access is guarded at the application layer.

BEGIN;

-- Current student from the per-request/job GUC (NULL when unset).
CREATE OR REPLACE FUNCTION app_student_id() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('app.student_id', true), '')::uuid
$$;

-- Tables with a student_id column.
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
    EXECUTE format('DROP POLICY IF EXISTS %1$s_rls ON %1$I', t);
    EXECUTE format($f$
      CREATE POLICY %1$s_rls ON %1$I
        USING      (student_id = app_student_id())
        WITH CHECK (student_id = app_student_id())
    $f$, t);
  END LOOP;
END $$;

-- session_answers has no student_id; scope it through its session.
ALTER TABLE session_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_answers FORCE  ROW LEVEL SECURITY;
DROP POLICY IF EXISTS session_answers_rls ON session_answers;
CREATE POLICY session_answers_rls ON session_answers
  USING (session_id IN (SELECT id FROM sessions WHERE student_id = app_student_id()))
  WITH CHECK (session_id IN (SELECT id FROM sessions WHERE student_id = app_student_id()));

COMMIT;
