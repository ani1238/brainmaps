\set ON_ERROR_STOP on

BEGIN;

INSERT INTO students (
  id, name, grade, board, streak_days, streak_best, streak_last_date
) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Aarav', 6, 'CBSE', 4, 7, current_date),
  ('33333333-3333-3333-3333-333333333333', 'Meera', 6, 'CBSE', 9, 12, current_date),
  ('44444444-4444-4444-4444-444444444444', 'Kabir', 6, 'CBSE', 1, 3, current_date)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  grade = EXCLUDED.grade,
  board = EXCLUDED.board,
  streak_days = EXCLUDED.streak_days,
  streak_best = EXCLUDED.streak_best,
  streak_last_date = EXCLUDED.streak_last_date;

INSERT INTO concept_progress (
  student_id, concept_id, ema_score, state,
  l1_state, l2_state, l3_state, strengthen_state, revise_state,
  revise_unlocked, total_attempts, last_session_at
) VALUES
  -- Aarav: active learner with two concepts requiring fixes.
  ('22222222-2222-2222-2222-222222222222', 'cbse_g6_english_grammar_ch03_c01_nouns',
   0.46, 'DEVELOPING', 'needs_fixing', 'current', 'locked', 'locked', 'locked', false, 4, now() - interval '2 hours'),
  ('22222222-2222-2222-2222-222222222222', 'cbse_g6_science_ch03_c02_components_of_food',
   0.35, 'WEAK', 'needs_fixing', 'locked', 'locked', 'locked', 'locked', false, 2, now() - interval '1 day'),
  ('22222222-2222-2222-2222-222222222222', 'cbse_g6_science_ch04_c01_magnetic_and_nonmagnetic',
   0.84, 'STRONG', 'done', 'done', 'done', 'done', 'current', true, 6, now() - interval '3 days'),

  -- Meera: strong progress with three concepts due for revision.
  ('33333333-3333-3333-3333-333333333333', 'cbse_g6_english_grammar_ch02_c01_parts_of_speech',
   0.91, 'STRONG', 'done', 'done', 'done', 'done', 'current', true, 8, now() - interval '3 days'),
  ('33333333-3333-3333-3333-333333333333', 'cbse_g6_science_ch08_c01_states_of_water',
   0.88, 'STRONG', 'done', 'done', 'done', 'done', 'current', true, 7, now() - interval '4 days'),
  ('33333333-3333-3333-3333-333333333333', 'cbse_g6_social_science_ch02_c01_continents',
   0.86, 'STRONG', 'done', 'done', 'done', 'done', 'current', true, 7, now() - interval '5 days'),
  ('33333333-3333-3333-3333-333333333333', 'cbse_g6_english_grammar_ch01_c01_the_sentence',
   0.68, 'DEVELOPING', 'done', 'current', 'locked', 'locked', 'locked', false, 3, now() - interval '1 day'),

  -- Kabir: just starting, with one current concept and one early weakness.
  ('44444444-4444-4444-4444-444444444444', 'cbse_g6_social_science_ch01_c01_maps',
   0.62, 'DEVELOPING', 'done', 'current', 'locked', 'locked', 'locked', false, 2, now() - interval '1 day'),
  ('44444444-4444-4444-4444-444444444444', 'cbse_g6_science_ch02_c01_variety_of_plants',
   0.28, 'VERY_WEAK', 'needs_fixing', 'locked', 'locked', 'locked', 'locked', false, 1, now() - interval '3 hours')
ON CONFLICT (student_id, concept_id) DO UPDATE SET
  ema_score = EXCLUDED.ema_score,
  state = EXCLUDED.state,
  l1_state = EXCLUDED.l1_state,
  l2_state = EXCLUDED.l2_state,
  l3_state = EXCLUDED.l3_state,
  strengthen_state = EXCLUDED.strengthen_state,
  revise_state = EXCLUDED.revise_state,
  revise_unlocked = EXCLUDED.revise_unlocked,
  total_attempts = EXCLUDED.total_attempts,
  last_session_at = EXCLUDED.last_session_at,
  updated_at = now();

INSERT INTO revise_schedule (
  student_id, concept_id, interval_days, next_due_at, last_done_at
) VALUES
  ('33333333-3333-3333-3333-333333333333', 'cbse_g6_english_grammar_ch02_c01_parts_of_speech',
   3, now() - interval '1 hour', now() - interval '4 days'),
  ('33333333-3333-3333-3333-333333333333', 'cbse_g6_science_ch08_c01_states_of_water',
   3, now() - interval '2 hours', now() - interval '5 days'),
  ('33333333-3333-3333-3333-333333333333', 'cbse_g6_social_science_ch02_c01_continents',
   3, now() - interval '3 hours', now() - interval '6 days')
ON CONFLICT (student_id, concept_id) DO UPDATE SET
  interval_days = EXCLUDED.interval_days,
  next_due_at = EXCLUDED.next_due_at,
  last_done_at = EXCLUDED.last_done_at;

COMMIT;
