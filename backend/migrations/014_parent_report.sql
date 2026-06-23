-- BM-006: Parent Report
-- Adds a parent PIN (gates the in-app parent report) and a per-day cache of the
-- AI-generated report payload so it is generated at most once per student/day.

BEGIN;

-- Parent PIN (PBKDF2 hash, same scheme as passwords). NULL until the parent
-- sets one on first opening the report.
ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_pin_hash TEXT;

-- 24h cache of the generated report payload, keyed by student + date.
CREATE TABLE IF NOT EXISTS parent_reports (
  student_id   UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  report_date  DATE NOT NULL,
  payload      JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, report_date)
);

COMMIT;
