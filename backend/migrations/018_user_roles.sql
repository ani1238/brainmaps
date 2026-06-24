-- 018: user roles.
--
-- Adds a role to every user so internal/admin accounts can be distinguished
-- from learners and parents, and admin-only endpoints can be gated server-side.

BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'student'
  CHECK (role IN ('student', 'parent', 'admin'));

COMMIT;
