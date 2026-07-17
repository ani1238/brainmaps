-- 021: v12 question architecture — payload-driven multi-type items.
--
-- The v7/v10 schema modelled every question as a flat row plus a separate
-- mcq_options join table. That shape only fits pick-one MCQ items. v12 introduces
-- 10 new interaction shapes (classify, match, sequence, cloze, true/false-why,
-- predict-justify, conclusion-draw, evidence-hunt, mcq-cluster, design-challenge)
-- whose structure (categories, pairs, ordered lists, numbered blanks, nested
-- sub-questions, two-step verdict+reason) cannot be expressed as flat columns.
--
-- Rather than bolt a dozen more nullable columns onto `questions`, this migration
-- adds a single validated `payload jsonb` that carries all type-specific content,
-- graded per-type at the application layer. It also promotes the misconception-tag
-- and key-concept glossaries (previously bare text[]) to first-class reference
-- tables so the moat signal in student_weak_concepts stays queryable, and adds a
-- station_config table so a station can draw a small session out of a larger pool.

BEGIN;

-- 1. questions.payload — full type-specific structure (options, categories, pairs,
--    blanks, sub_questions, rubric, example_answer, …). Legacy MCQ rows keep using
--    mcq_options; new-architecture rows carry everything in payload.
ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS payload jsonb NOT NULL DEFAULT '{}'::jsonb;

-- 2. Widen the type CHECK to cover the 10 new v12 types. Existing legacy values are
--    retained so already-seeded content keeps validating.
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_type_check;
ALTER TABLE questions
  ADD CONSTRAINT questions_type_check
  CHECK (type IN (
    -- legacy / carried forward
    'MCQ','STORY_MCQ','HOTS','HOTS_MCQ','ASSERTION_REASON',
    'DESCRIPTIVE','FEYNMAN','BLURT','ACTIVE_RECALL',
    'SPOT_IT','FIX_IT','PRODUCE_IT','CONTEXT_CLUE','GENERATIVE_PRODUCTION',
    -- new in v12
    'CLASSIFY','MATCH','SEQUENCE','CLOZE',
    'TRUE_FALSE_WHY','PREDICT_JUSTIFY','CONCLUSION_DRAW','EVIDENCE_HUNT',
    'MCQ_CLUSTER','DESIGN_CHALLENGE'
  ));

-- 3. Misconception-tag glossary — one row per (concept, tag). Replaces the bare
--    text[] with a described, reusable reference the parent report can label.
CREATE TABLE IF NOT EXISTS misconception_tags (
  concept_id  text NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  tag         text NOT NULL,
  description text NOT NULL,
  PRIMARY KEY (concept_id, tag)
);

-- 4. Key-concept glossary — the checkable "what this item teaches" units.
CREATE TABLE IF NOT EXISTS concept_key_concepts (
  concept_id  text NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  key         text NOT NULL,
  description text NOT NULL,
  PRIMARY KEY (concept_id, key)
);

-- 5. Per-station pool/session sizing + Bloom level. A station draws session_size
--    items out of a pool_size bank so retries vary without repeating verbatim.
CREATE TABLE IF NOT EXISTS station_config (
  concept_id   text NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  level        text NOT NULL CHECK (level IN ('level1','level2','level3','strengthen','revise')),
  pool_size    int  NOT NULL DEFAULT 0,
  session_size int  NOT NULL DEFAULT 6,
  bloom        text,
  PRIMARY KEY (concept_id, level)
);

-- 6. session_answers.answer_payload — most v12 types are not single-option answers
--    (bucket assignments, pairs, ordering, blank fills, cluster sub-answers, or a
--    two-step {verdict, reason}), so the scalar chosen_option can't hold them.
ALTER TABLE session_answers
  ADD COLUMN IF NOT EXISTS answer_payload jsonb;

-- 7. RLS — the three new reference tables are curriculum tier: global read, no app
--    writes (seeded by migrations / the importer running as owner), mirroring 020.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['misconception_tags','concept_key_concepts','station_config'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE  ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS %1$s_read ON %1$I', t);
    EXECUTE format('CREATE POLICY %1$s_read ON %1$I FOR SELECT USING (true)', t);
  END LOOP;
END $$;

COMMIT;
