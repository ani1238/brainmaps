-- Parent report history: keep every generated report (not just one per day),
-- so parents can browse previous reports and generate fresh ones on demand
-- (which we may later rate-limit / charge per week).

BEGIN;

-- Give each cached report its own identity.
ALTER TABLE parent_reports ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
UPDATE parent_reports SET id = gen_random_uuid() WHERE id IS NULL;
ALTER TABLE parent_reports ALTER COLUMN id SET NOT NULL;

-- Drop the one-row-per-day primary key; key on id instead so a student can
-- have a full history (including several reports in a single day).
ALTER TABLE parent_reports DROP CONSTRAINT IF EXISTS parent_reports_pkey;
ALTER TABLE parent_reports ADD PRIMARY KEY (id);

-- report_date is now informational only (no longer unique / required).
ALTER TABLE parent_reports ALTER COLUMN report_date DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_parent_reports_student_gen
  ON parent_reports (student_id, generated_at DESC);

COMMIT;
