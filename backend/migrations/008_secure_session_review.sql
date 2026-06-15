-- 008: protect session completion, polling, and answer review with an opaque
-- per-session token. Only the SHA-256 hash is stored.
BEGIN;

ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS access_token_hash bytea;

COMMENT ON COLUMN sessions.access_token_hash IS
  'SHA-256 hash of the opaque token returned when the session starts';

COMMIT;
