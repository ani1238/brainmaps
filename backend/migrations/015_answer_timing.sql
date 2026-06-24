-- Per-question time-on-task, used for the careless-vs-concept signal in the
-- parent report. Nullable: older answers and clients that don't report it stay NULL.
ALTER TABLE session_answers ADD COLUMN IF NOT EXISTS elapsed_ms INTEGER;
