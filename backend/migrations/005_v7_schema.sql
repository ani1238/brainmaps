-- ════════════════════════════════════════════════════════════════════
-- BrainMaps Schema Migration — v7
-- Corrected for current app naming conventions:
--   • level values stay as 'level1'/'level2'/'level3' (not 'l1')
--   • question types stay UPPERCASE (MCQ, DESCRIPTIVE, etc.)
--   • concepts_chapter_fk deferred until chapters table is seeded
-- Safe to re-run (idempotent). Tested on Postgres 14+ / Neon.
-- ════════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────────────
-- 1. New reference tables: subjects and chapters
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS subjects (
  key            text PRIMARY KEY,
  display_name   text NOT NULL,
  icon           text,
  parent_subject text REFERENCES subjects(key),
  board          text NOT NULL,
  grade          integer NOT NULL,
  order_idx      integer NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subjects_board_grade
  ON subjects (board, grade);

CREATE TABLE IF NOT EXISTS chapters (
  id          text PRIMARY KEY,
  subject_key text NOT NULL REFERENCES subjects(key),
  board       text NOT NULL,
  grade       integer NOT NULL,
  number      integer NOT NULL,
  name        text NOT NULL,
  order_idx   integer NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chapters_subject
  ON chapters (subject_key, board, grade, order_idx);

-- ─────────────────────────────────────────────────────────────────────
-- 2. concepts — add engine_type, board, grade, metadata
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE concepts
  ADD COLUMN IF NOT EXISTS engine_type text NOT NULL DEFAULT 'CONCEPTUAL',
  ADD COLUMN IF NOT EXISTS board       text NOT NULL DEFAULT 'CBSE',
  ADD COLUMN IF NOT EXISTS grade       integer NOT NULL DEFAULT 6,
  ADD COLUMN IF NOT EXISTS metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at  timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at  timestamptz NOT NULL DEFAULT now();

DO $$ BEGIN
  ALTER TABLE concepts
    ADD CONSTRAINT concepts_engine_type_check
    CHECK (engine_type IN (
      'CONCEPTUAL',
      'ENGLISH_VOCAB',
      'ENGLISH_GRAMMAR',
      'ENGLISH_LITERATURE',
      'ENGLISH_WRITING',
      'ENGLISH_COMPREHENSION'
    ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- NOTE: concepts_chapter_fk is intentionally deferred.
-- It will be added during content ingestion after chapters rows are seeded.

CREATE INDEX IF NOT EXISTS idx_concepts_chapter
  ON concepts (chapter_id, order_idx);
CREATE INDEX IF NOT EXISTS idx_concepts_board_grade
  ON concepts (board, grade);
CREATE INDEX IF NOT EXISTS idx_concepts_engine
  ON concepts (engine_type);

-- ─────────────────────────────────────────────────────────────────────
-- 3. questions — add order_idx, metadata; constrain level and type
--    Level values: 'level1'|'level2'|'level3'|'strengthen'|'revise'
--    Type values:  uppercase, matching the app's QuestionType constants
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS order_idx  integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS metadata   jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

DO $$ BEGIN
  ALTER TABLE questions
    ADD CONSTRAINT questions_level_check
    CHECK (level IN ('level1','level2','level3','strengthen','revise'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
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
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_questions_concept_level
  ON questions (concept_id, level, order_idx);
CREATE INDEX IF NOT EXISTS idx_questions_type
  ON questions (type);

-- ─────────────────────────────────────────────────────────────────────
-- 4. concept_progress — replace booleans with per-station state columns
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE concept_progress
  ADD COLUMN IF NOT EXISTS l1_state         text NOT NULL DEFAULT 'current',
  ADD COLUMN IF NOT EXISTS l2_state         text NOT NULL DEFAULT 'locked',
  ADD COLUMN IF NOT EXISTS l3_state         text NOT NULL DEFAULT 'locked',
  ADD COLUMN IF NOT EXISTS strengthen_state text NOT NULL DEFAULT 'locked',
  ADD COLUMN IF NOT EXISTS revise_state     text NOT NULL DEFAULT 'locked',
  ADD COLUMN IF NOT EXISTS revise_unlocked  boolean NOT NULL DEFAULT false;

-- Backfill 'done' from old boolean columns
UPDATE concept_progress
SET l1_state         = CASE WHEN l1_done         THEN 'done' ELSE l1_state END,
    l2_state         = CASE WHEN l2_done         THEN 'done' ELSE l2_state END,
    l3_state         = CASE WHEN l3_done         THEN 'done' ELSE l3_state END,
    strengthen_state = CASE WHEN strengthen_done THEN 'done' ELSE strengthen_state END
WHERE l1_done OR l2_done OR l3_done OR strengthen_done;

-- Promote the next unlocked station to 'current'
UPDATE concept_progress SET l2_state         = 'current' WHERE l1_state = 'done'         AND l2_state         = 'locked';
UPDATE concept_progress SET l3_state         = 'current' WHERE l2_state = 'done'         AND l3_state         = 'locked';
UPDATE concept_progress SET strengthen_state = 'current' WHERE l3_state = 'done'         AND strengthen_state = 'locked';
UPDATE concept_progress SET revise_state     = 'current' WHERE strengthen_state = 'done' AND revise_state     = 'locked';

-- Drop old boolean columns
ALTER TABLE concept_progress
  DROP COLUMN IF EXISTS l1_done,
  DROP COLUMN IF EXISTS l2_done,
  DROP COLUMN IF EXISTS l3_done,
  DROP COLUMN IF EXISTS strengthen_done;

-- Add check constraints on state columns
DO $$ BEGIN
  ALTER TABLE concept_progress
    ADD CONSTRAINT cp_l1_state_check         CHECK (l1_state         IN ('locked','current','done','needs_fixing')),
    ADD CONSTRAINT cp_l2_state_check         CHECK (l2_state         IN ('locked','current','done','needs_fixing')),
    ADD CONSTRAINT cp_l3_state_check         CHECK (l3_state         IN ('locked','current','done','needs_fixing')),
    ADD CONSTRAINT cp_strengthen_state_check CHECK (strengthen_state IN ('locked','current','done','needs_fixing')),
    ADD CONSTRAINT cp_revise_state_check     CHECK (revise_state     IN ('locked','current','done','needs_fixing'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE concept_progress
    ADD CONSTRAINT cp_state_check
    CHECK (state IN ('NOT_STARTED','VERY_WEAK','WEAK','DEVELOPING','STRONG','RECALL_DUE'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_cp_student_state
  ON concept_progress (student_id, state);

-- ─────────────────────────────────────────────────────────────────────
-- 5. sessions — station constraint (matches app's QuestionLevel values)
-- ─────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  ALTER TABLE sessions
    ADD CONSTRAINT sessions_station_check
    CHECK (station IN ('level1','level2','level3','strengthen','revise'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_sessions_student_concept
  ON sessions (student_id, concept_id, started_at DESC);

-- ─────────────────────────────────────────────────────────────────────
-- 6. students — streak tracking
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS streak_days       integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak_last_date  date,
  ADD COLUMN IF NOT EXISTS streak_best       integer NOT NULL DEFAULT 0;

-- ─────────────────────────────────────────────────────────────────────
-- 7. session_answers — self-rating + answered_at
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE session_answers
  ADD COLUMN IF NOT EXISTS self_rating  double precision,
  ADD COLUMN IF NOT EXISTS answered_at  timestamptz NOT NULL DEFAULT now();

DO $$ BEGIN
  ALTER TABLE session_answers
    ADD CONSTRAINT sa_self_rating_range
    CHECK (self_rating IS NULL OR (self_rating >= 0.0 AND self_rating <= 1.0));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_sa_session
  ON session_answers (session_id);
CREATE INDEX IF NOT EXISTS idx_sa_ai_grading_queue
  ON session_answers (ai_graded_at)
  WHERE student_text IS NOT NULL AND ai_graded_at IS NULL;

-- ─────────────────────────────────────────────────────────────────────
-- 8. revise_schedule — index for nightly batch
-- ─────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_revise_due
  ON revise_schedule (next_due_at)
  WHERE next_due_at <= now();

-- ─────────────────────────────────────────────────────────────────────
-- 9. updated_at triggers for concepts and concept_progress
-- ─────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_concepts_updated_at ON concepts;
CREATE TRIGGER trg_concepts_updated_at
  BEFORE UPDATE ON concepts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_cp_updated_at ON concept_progress;
CREATE TRIGGER trg_cp_updated_at
  BEFORE UPDATE ON concept_progress
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────────────────────────────
-- 10. Seed subjects (CBSE Class 6)
-- ─────────────────────────────────────────────────────────────────────

INSERT INTO subjects (key, display_name, icon, parent_subject, board, grade, order_idx)
VALUES
  ('science',          'Science',          '🔬', NULL,              'CBSE', 6, 1),
  ('social_science',   'Social Science',   '🌐', NULL,              'CBSE', 6, 2),
  ('history',          'History',          '📜', 'social_science',  'CBSE', 6, 3),
  ('geography',        'Geography',        '🌍', 'social_science',  'CBSE', 6, 4),
  ('civics',           'Civics',           '⚖️', 'social_science',  'CBSE', 6, 5),
  ('english',          'English',          '📖', NULL,              'CBSE', 6, 6)
ON CONFLICT (key) DO NOTHING;

COMMIT;

-- ════════════════════════════════════════════════════════════════════
-- Migration complete.
-- Next: seed chapters → concepts → questions → mcq_options
-- ════════════════════════════════════════════════════════════════════
