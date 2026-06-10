-- 006: per-tag weak-concept lifecycle (adaptive retry layers 1+2)
-- Apply: psql $DATABASE_URL -f migrations/006_weak_concepts.sql
BEGIN;

CREATE TABLE IF NOT EXISTS student_weak_concepts (
  student_id     UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  concept_id     TEXT NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  tag            TEXT NOT NULL,                -- stored normalized: lower(trim())
  status         TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','cleared')),
  wrong_count    INT  NOT NULL DEFAULT 1 CHECK (wrong_count >= 1),
  correct_streak INT  NOT NULL DEFAULT 0 CHECK (correct_streak >= 0),
  first_seen_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  cleared_at     TIMESTAMPTZ,
  PRIMARY KEY (student_id, concept_id, tag)
);

-- Retry targeting: ranked active tags per (student, concept)
CREATE INDEX IF NOT EXISTS idx_swc_active
  ON student_weak_concepts (student_id, concept_id, wrong_count DESC, last_seen_at DESC)
  WHERE status = 'active';

-- Spaced recheck: recently cleared tags
CREATE INDEX IF NOT EXISTS idx_swc_cleared
  ON student_weak_concepts (student_id, concept_id, cleared_at DESC)
  WHERE status = 'cleared';

-- Backfill from legacy concept_progress.weak_concepts only if that column was
-- added manually to the live DB (it exists in no migration). No-op otherwise.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'concept_progress' AND column_name = 'weak_concepts'
  ) THEN
    INSERT INTO student_weak_concepts (student_id, concept_id, tag)
    SELECT cp.student_id, cp.concept_id, lower(trim(t))
    FROM concept_progress cp, unnest(cp.weak_concepts) AS t
    WHERE trim(t) <> ''
    ON CONFLICT (student_id, concept_id, tag) DO NOTHING;
    ALTER TABLE concept_progress DROP COLUMN weak_concepts;
  END IF;
END $$;

COMMIT;
