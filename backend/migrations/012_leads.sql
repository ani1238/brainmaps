-- BM-004: Enrollment lead capture
-- Stores "Request a call" submissions from the login/enroll form so the team
-- can follow up with prospective families. Public (unauthenticated) insert.

BEGIN;

CREATE TABLE IF NOT EXISTS leads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone       TEXT NOT NULL,
  name        TEXT,
  note        TEXT,
  source      TEXT NOT NULL DEFAULT 'login_enroll',
  status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','converted','dropped')),
  user_agent  TEXT,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_status_created ON leads(status, created_at DESC);

COMMIT;
