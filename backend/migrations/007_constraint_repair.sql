-- 007: repair constraints left behind by the v7 compatibility migration.
--
-- 001_schema.sql creates automatically named CHECK constraints. The v7
-- migration added broader constraints under new names but did not remove the
-- originals, so values such as RECALL_DUE remained invalid.
BEGIN;

ALTER TABLE questions
  DROP CONSTRAINT IF EXISTS questions_type_check;

ALTER TABLE questions
  ADD CONSTRAINT questions_type_check
  CHECK (type IN (
    'MCQ',
    'DESCRIPTIVE',
    'FEYNMAN',
    'BLURT',
    'ACTIVE_RECALL',
    'SPOT_IT',
    'FIX_IT',
    'PRODUCE_IT',
    'CONTEXT_CLUE',
    'GENERATIVE_PRODUCTION'
  ));

ALTER TABLE concept_progress
  DROP CONSTRAINT IF EXISTS concept_progress_state_check,
  DROP CONSTRAINT IF EXISTS cp_state_check;

ALTER TABLE concept_progress
  ADD CONSTRAINT cp_state_check
  CHECK (state IN (
    'NOT_STARTED',
    'VERY_WEAK',
    'WEAK',
    'DEVELOPING',
    'STRONG',
    'RECALL_DUE'
  ));

-- The original index begins with student_id and cannot efficiently drive a
-- global due-recall scan.
CREATE INDEX IF NOT EXISTS idx_revise_due_time
  ON revise_schedule (next_due_at);

COMMIT;
