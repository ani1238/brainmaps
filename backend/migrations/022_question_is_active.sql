-- 022_question_is_active.sql
-- Adds a reversible "disable" flag so questions can be retired from serving
-- without deleting them (preserves history and allows re-enabling).
--
-- Serving reads (GetConceptQuestions, recheckCandidates) filter on is_active.
-- Grading reads a single question by id and intentionally ignores the flag so
-- already-answered questions can still be scored.

ALTER TABLE questions
    ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Retire the legacy (pre-v12, payload-less) questions for the Thermometer
-- concept so only the new v12 payload-driven questions are served.
UPDATE questions
   SET is_active = false
 WHERE concept_id = 'cbse_g6_science_ch07_c02_thermometer'
   AND payload = '{}'::jsonb;
