-- BrainMaps schema
-- Run against your Neon database via:
--   psql $DATABASE_URL -f migrations/001_schema.sql

-- ── Curriculum ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS concepts (
  id          TEXT PRIMARY KEY,
  subject_key TEXT NOT NULL,
  chapter_id  TEXT NOT NULL,
  name        TEXT NOT NULL,
  order_idx   INT  NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_concepts_chapter ON concepts(chapter_id);

CREATE TABLE IF NOT EXISTS questions (
  id           TEXT PRIMARY KEY,
  concept_id   TEXT NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('MCQ','DESCRIPTIVE','FEYNMAN','BLURT','ACTIVE_RECALL')),
  level        TEXT NOT NULL CHECK (level IN ('level1','level2','level3','strengthen','revise')),
  text         TEXT NOT NULL,
  explanation  TEXT,
  rubric_hint  TEXT,
  key_concepts TEXT[] DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_questions_concept_level ON questions(concept_id, level);

CREATE TABLE IF NOT EXISTS mcq_options (
  id          TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_key  CHAR(1) NOT NULL CHECK (option_key IN ('a','b','c','d')),
  text        TEXT NOT NULL,
  is_correct  BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (question_id, option_key)
);

-- ── Students ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS students (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  grade      INT  NOT NULL CHECK (grade BETWEEN 3 AND 7),
  board      TEXT NOT NULL DEFAULT 'CBSE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Progress ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS concept_progress (
  student_id       UUID REFERENCES students(id) ON DELETE CASCADE,
  concept_id       TEXT REFERENCES concepts(id) ON DELETE CASCADE,
  PRIMARY KEY (student_id, concept_id),

  ema_score        FLOAT   NOT NULL DEFAULT 0 CHECK (ema_score BETWEEN 0 AND 1),
  state            TEXT    NOT NULL DEFAULT 'NOT_STARTED'
                           CHECK (state IN ('NOT_STARTED','VERY_WEAK','WEAK','DEVELOPING','STRONG')),

  l1_done          BOOLEAN NOT NULL DEFAULT FALSE,
  l2_done          BOOLEAN NOT NULL DEFAULT FALSE,
  l3_done          BOOLEAN NOT NULL DEFAULT FALSE,
  strengthen_done  BOOLEAN NOT NULL DEFAULT FALSE,

  total_attempts   INT     NOT NULL DEFAULT 0,
  last_session_at  TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS revise_schedule (
  student_id    UUID REFERENCES students(id) ON DELETE CASCADE,
  concept_id    TEXT REFERENCES concepts(id) ON DELETE CASCADE,
  PRIMARY KEY (student_id, concept_id),

  interval_days INT         NOT NULL DEFAULT 1 CHECK (interval_days > 0),
  next_due_at   TIMESTAMPTZ NOT NULL,
  last_done_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_revise_due ON revise_schedule(student_id, next_due_at);

-- ── Sessions ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  concept_id   TEXT NOT NULL REFERENCES concepts(id),
  station      TEXT NOT NULL CHECK (station IN ('level1','level2','level3','strengthen','revise')),

  score        FLOAT CHECK (score BETWEEN 0 AND 1),
  mcq_correct  INT NOT NULL DEFAULT 0,
  mcq_total    INT NOT NULL DEFAULT 0,

  started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessions_student_concept ON sessions(student_id, concept_id, completed_at DESC);

CREATE TABLE IF NOT EXISTS session_answers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  question_id   TEXT NOT NULL REFERENCES questions(id),
  question_type TEXT NOT NULL,

  -- MCQ
  chosen_option CHAR(1),
  is_correct    BOOLEAN,

  -- Open-ended
  student_text  TEXT,
  ai_score      FLOAT CHECK (ai_score BETWEEN 0 AND 1),
  ai_feedback   TEXT,
  ai_graded_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_answers_session ON session_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_answers_ungraded ON session_answers(session_id) WHERE ai_graded_at IS NULL;
