-- 010: v2 diagnostic question schema.
--
-- Adds first-class fields required by the question-quality plan:
-- rubric_points/key_points for checkable grading, recall_guide for BLURT,
-- and passage/assertion fields for HOTS/Assertion-Reason formats.

BEGIN;

ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS rubric_points  TEXT[],
  ADD COLUMN IF NOT EXISTS key_points     TEXT[],
  ADD COLUMN IF NOT EXISTS recall_guide   TEXT,
  ADD COLUMN IF NOT EXISTS preamble       TEXT,
  ADD COLUMN IF NOT EXISTS assertion_text TEXT,
  ADD COLUMN IF NOT EXISTS reason_text    TEXT;

UPDATE questions
SET rubric_points = regexp_split_to_array(rubric_hint, '\s*;\s*')
WHERE rubric_points IS NULL
  AND rubric_hint IS NOT NULL
  AND btrim(rubric_hint) <> '';

ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS strong_concepts      TEXT[],
  ADD COLUMN IF NOT EXISTS parent_summary       TEXT,
  ADD COLUMN IF NOT EXISTS misconception_labels TEXT[],
  ADD COLUMN IF NOT EXISTS retry_count          INT NOT NULL DEFAULT 0;

ALTER TABLE session_answers
  ADD COLUMN IF NOT EXISTS covered_points TEXT[],
  ADD COLUMN IF NOT EXISTS missed_points  TEXT[];

ALTER TABLE questions
  DROP CONSTRAINT IF EXISTS questions_type_check;

ALTER TABLE questions
  ADD CONSTRAINT questions_type_check
  CHECK (type IN (
    'MCQ',
    'STORY_MCQ',
    'HOTS',
    'HOTS_MCQ',
    'ASSERTION_REASON',
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

COMMIT;
