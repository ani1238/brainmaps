-- 017: Student planner / calendar.
--
-- Adds a per-student study plan (pace settings), a per-concept schedule of
-- plan_items spread across the year, and leave ranges used to reflow the plan
-- so revises don't pile up after a break.

BEGIN;

CREATE TABLE IF NOT EXISTS study_plans (
  student_id           UUID PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,
  start_date           DATE        NOT NULL DEFAULT current_date,
  timezone             TEXT        NOT NULL DEFAULT 'Asia/Kolkata',
  -- ISO weekday numbers that count as study days (1=Mon … 7=Sun).
  study_days           INT[]       NOT NULL DEFAULT '{1,2,3,4,5}',
  new_concepts_per_day INT         NOT NULL DEFAULT 2,
  revise_cap_per_day   INT         NOT NULL DEFAULT 5,
  fix_cap_per_day      INT         NOT NULL DEFAULT 3,
  subjects_per_week    INT         NOT NULL DEFAULT 3,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS plan_items (
  id           BIGSERIAL PRIMARY KEY,
  student_id   UUID  NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  kind         TEXT  NOT NULL DEFAULT 'concept' CHECK (kind IN ('concept','chapter')),
  ref_id       TEXT  NOT NULL,            -- concept id (or chapter id)
  subject_key  TEXT  NOT NULL,
  planned_date DATE  NOT NULL,
  order_idx    INT   NOT NULL DEFAULT 0,  -- ordering within a day
  status       TEXT  NOT NULL DEFAULT 'planned'
                 CHECK (status IN ('planned','started','done','skipped')),
  source       TEXT  NOT NULL DEFAULT 'auto' CHECK (source IN ('auto','manual')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, ref_id)
);

CREATE INDEX IF NOT EXISTS plan_items_student_date_idx
  ON plan_items (student_id, planned_date);

CREATE TABLE IF NOT EXISTS plan_leaves (
  id         BIGSERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date   DATE NOT NULL,
  reason     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS plan_leaves_student_idx
  ON plan_leaves (student_id, start_date, end_date);

COMMIT;
