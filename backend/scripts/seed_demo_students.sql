\set ON_ERROR_STOP on

BEGIN;

-- ── Demo login ─────────────────────────────────────────────────────────────────
-- Email: demo@brainmaps.dev  |  Password: brainmaps2026
-- Household created via API (password_hash managed by auth handler).
-- This block links all three demo students to that household.

INSERT INTO household_students (household_id, student_id)
VALUES
  ('ea531c5d-06ae-425e-a72f-d9624d5d2af6', '22222222-2222-2222-2222-222222222222'),
  ('ea531c5d-06ae-425e-a72f-d9624d5d2af6', '33333333-3333-3333-3333-333333333333'),
  ('ea531c5d-06ae-425e-a72f-d9624d5d2af6', '44444444-4444-4444-4444-444444444444')
ON CONFLICT DO NOTHING;

-- ── Students ───────────────────────────────────────────────────────────────────
-- Aarav: 4-day active streak (studied today).
-- Meera: studied June 1–9 (9-day streak), last opened app June 15 → streak = 0.
-- Kabir: 1-day streak, just getting started.

INSERT INTO students (
  id, name, grade, board, streak_days, streak_best, streak_last_date
) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Aarav', 6, 'CBSE', 4,  7,  current_date),
  ('33333333-3333-3333-3333-333333333333', 'Meera', 6, 'CBSE', 9,  12, '2026-06-09'),
  ('44444444-4444-4444-4444-444444444444', 'Kabir', 6, 'CBSE', 1,  3,  current_date)
ON CONFLICT (id) DO UPDATE SET
  name             = EXCLUDED.name,
  grade            = EXCLUDED.grade,
  board            = EXCLUDED.board,
  streak_days      = EXCLUDED.streak_days,
  streak_best      = EXCLUDED.streak_best,
  streak_last_date = EXCLUDED.streak_last_date;

-- ── Concept progress ───────────────────────────────────────────────────────────

INSERT INTO concept_progress (
  student_id, concept_id, ema_score, state,
  l1_state, l2_state, l3_state, strengthen_state, revise_state,
  revise_unlocked, total_attempts, last_session_at
) VALUES
  -- Aarav: active learner, studied today. Two concepts in Today's Fix.
  ('22222222-2222-2222-2222-222222222222', 'cbse_g6_english_grammar_ch03_c01_nouns',
   0.46, 'DEVELOPING', 'needs_fixing', 'current', 'locked', 'locked', 'locked', false, 4, now() - interval '2 hours'),
  ('22222222-2222-2222-2222-222222222222', 'cbse_g6_science_ch03_c02_components_of_food',
   0.35, 'WEAK', 'needs_fixing', 'locked', 'locked', 'locked', 'locked', false, 2, now() - interval '1 day'),
  ('22222222-2222-2222-2222-222222222222', 'cbse_g6_science_ch04_c01_magnetic_and_nonmagnetic',
   0.84, 'STRONG', 'done', 'done', 'done', 'done', 'current', true, 6, now() - interval '3 days'),

  -- Meera: last studied June 9. Two STRONG concepts overdue for Revise.
  -- The Sentence failed Level 2 on her last session → in Today's Fix.
  ('33333333-3333-3333-3333-333333333333', 'cbse_g6_english_grammar_ch02_c01_parts_of_speech',
   0.91, 'STRONG', 'done', 'done', 'done', 'done', 'current', true, 8, '2026-06-09 18:00:00+05:30'),
  ('33333333-3333-3333-3333-333333333333', 'cbse_g6_science_ch08_c01_states_of_water',
   0.88, 'STRONG', 'done', 'done', 'done', 'done', 'current', true, 7, '2026-06-09 17:00:00+05:30'),
  ('33333333-3333-3333-3333-333333333333', 'cbse_g6_social_science_ch02_c01_continents',
   0.76, 'DEVELOPING', 'done', 'done', 'done', 'done', 'current', true, 9, '2026-06-09 16:00:00+05:30'),
  ('33333333-3333-3333-3333-333333333333', 'cbse_g6_english_grammar_ch01_c01_the_sentence',
   0.54, 'DEVELOPING', 'done', 'needs_fixing', 'locked', 'locked', 'locked', false, 5, '2026-06-09 15:00:00+05:30'),

  -- Kabir: just starting, studied today. One concept to fix, one in progress.
  ('44444444-4444-4444-4444-444444444444', 'cbse_g6_social_science_ch01_c01_maps',
   0.62, 'DEVELOPING', 'done', 'current', 'locked', 'locked', 'locked', false, 2, now() - interval '1 day'),
  ('44444444-4444-4444-4444-444444444444', 'cbse_g6_science_ch02_c01_variety_of_plants',
   0.28, 'VERY_WEAK', 'needs_fixing', 'locked', 'locked', 'locked', 'locked', false, 1, now() - interval '3 hours')

ON CONFLICT (student_id, concept_id) DO UPDATE SET
  ema_score        = EXCLUDED.ema_score,
  state            = EXCLUDED.state,
  l1_state         = EXCLUDED.l1_state,
  l2_state         = EXCLUDED.l2_state,
  l3_state         = EXCLUDED.l3_state,
  strengthen_state = EXCLUDED.strengthen_state,
  revise_state     = EXCLUDED.revise_state,
  revise_unlocked  = EXCLUDED.revise_unlocked,
  total_attempts   = EXCLUDED.total_attempts,
  last_session_at  = EXCLUDED.last_session_at,
  updated_at       = now();

-- ── Sessions (Meera, June 9) ───────────────────────────────────────────────────
-- Represents her last day of studying before the 6-day gap.

INSERT INTO sessions (
  student_id, concept_id, station, score, mcq_correct, mcq_total,
  started_at, completed_at
) VALUES
  -- Parts of Speech — Revise (strong, done well)
  ('33333333-3333-3333-3333-333333333333', 'cbse_g6_english_grammar_ch02_c01_parts_of_speech',
   'revise', 0.90, 9, 10,
   '2026-06-09 17:45:00+05:30', '2026-06-09 18:00:00+05:30'),
  -- Three States of Water — Level 3 (completed mastery)
  ('33333333-3333-3333-3333-333333333333', 'cbse_g6_science_ch08_c01_states_of_water',
   'level3', 0.85, 5, 6,
   '2026-06-09 16:40:00+05:30', '2026-06-09 17:00:00+05:30'),
  -- Continents — Strengthen (voluntary extra practice)
  ('33333333-3333-3333-3333-333333333333', 'cbse_g6_social_science_ch02_c01_continents',
   'strengthen', 0.70, 7, 10,
   '2026-06-09 15:45:00+05:30', '2026-06-09 16:00:00+05:30'),
  -- The Sentence — Level 2 (failed → needs_fixing)
  ('33333333-3333-3333-3333-333333333333', 'cbse_g6_english_grammar_ch01_c01_the_sentence',
   'level2', 0.42, 3, 7,
   '2026-06-09 15:00:00+05:30', '2026-06-09 15:20:00+05:30')

ON CONFLICT DO NOTHING;

-- ── Revise schedule ────────────────────────────────────────────────────────────
-- Meera: Parts of Speech and Three States of Water both overdue (due June 12,
-- she hasn't returned since June 9).
-- Continents: due June 16 (longer interval after strengthen session).

INSERT INTO revise_schedule (
  student_id, concept_id, interval_days, next_due_at, last_done_at
) VALUES
  ('33333333-3333-3333-3333-333333333333', 'cbse_g6_english_grammar_ch02_c01_parts_of_speech',
   3, '2026-06-12 18:00:00+05:30', '2026-06-09 18:00:00+05:30'),
  ('33333333-3333-3333-3333-333333333333', 'cbse_g6_science_ch08_c01_states_of_water',
   3, '2026-06-12 17:00:00+05:30', '2026-06-09 17:00:00+05:30'),
  ('33333333-3333-3333-3333-333333333333', 'cbse_g6_social_science_ch02_c01_continents',
   7, '2026-06-16 16:00:00+05:30', '2026-06-09 16:00:00+05:30')

ON CONFLICT (student_id, concept_id) DO UPDATE SET
  interval_days = EXCLUDED.interval_days,
  next_due_at   = EXCLUDED.next_due_at,
  last_done_at  = EXCLUDED.last_done_at;

-- ── Aarav revise schedule ──────────────────────────────────────────────────────

INSERT INTO revise_schedule (
  student_id, concept_id, interval_days, next_due_at, last_done_at
) VALUES
  ('22222222-2222-2222-2222-222222222222', 'cbse_g6_science_ch04_c01_magnetic_and_nonmagnetic',
   3, now() + interval '1 day', now() - interval '2 days')
ON CONFLICT (student_id, concept_id) DO UPDATE SET
  interval_days = EXCLUDED.interval_days,
  next_due_at   = EXCLUDED.next_due_at,
  last_done_at  = EXCLUDED.last_done_at;

COMMIT;
