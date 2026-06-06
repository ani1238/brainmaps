-- Seed: Tapestry of the Past (soc_chB) — 7 concepts, 77 questions
-- Run AFTER 001_schema.sql

-- ── Concepts ──────────────────────────────────────────────────────────────────

INSERT INTO concepts (id, subject_key, chapter_id, name, order_idx) VALUES
  ('s201', 'soc', 'soc_chB', 'Reading Time: BCE & CE',          1),
  ('s202', 'soc', 'soc_chB', 'How We Know History',             2),
  ('s203', 'soc', 'soc_chB', 'What is Bharat?',                 3),
  ('s204', 'soc', 'soc_chB', 'Ancient Texts of India',          4),
  ('s205', 'soc', 'soc_chB', 'Yoga, Ayurveda & Ancient Science',5),
  ('s206', 'soc', 'soc_chB', 'Trade & Crafts in Ancient India', 6),
  ('s207', 'soc', 'soc_chB', 'Early Kingdoms & Republics',      7)
ON CONFLICT (id) DO NOTHING;

-- ── s201: Reading Time: BCE & CE ─────────────────────────────────────────────

INSERT INTO questions (id, concept_id, type, level, text, explanation, key_concepts) VALUES

-- Level 1
('s201_l1_mcq',  's201', 'MCQ',         'level1',
 'Gautama Buddha lived around 563–483 BCE. "BCE" stands for:',
 'BCE = Before Common Era. It replaced the older notation BC (Before Christ). CE replaces AD.',
 NULL),

('s201_l1_desc', 's201', 'DESCRIPTIVE', 'level1',
 'Two events: one at 600 BCE and one at 200 BCE. Which is older? Explain why in one sentence.',
 NULL, NULL),

('s201_l1_feyn', 's201', 'FEYNMAN',     'level1',
 'Your cousin says: "I don''t get it — if BCE counts backwards, what comes after 1 BCE?" Explain the BCE/CE dividing point in plain words.',
 NULL,
 ARRAY['BCE counts backward toward zero','CE counts forward from one','no year zero — it goes 1 BCE then 1 CE','the dividing point is a fixed reference, not a special event']),

-- Level 2
('s201_l2_mcq',  's201', 'MCQ',         'level2',
 'Ashoka ruled around 268 BCE. Roughly how many years ago did he rule? (assume today ≈ 2000 CE)',
 'To convert a BCE date to "years ago": add the BCE number to the current CE year. 268 + 2000 ≈ 2,268 years ago.',
 NULL),

('s201_l2_desc', 's201', 'DESCRIPTIVE', 'level2',
 'A historian writes "about 2,500 years ago" instead of "500 BCE." Why might she prefer approximate language?',
 NULL, NULL),

('s201_l2_feyn', 's201', 'FEYNMAN',     'level2',
 'A friend asks: "Why can''t we just write the number 500 — why add BCE or CE after it?" Explain why the label is essential.',
 NULL,
 ARRAY['500 CE and 500 BCE are 1,000 years apart — completely different eras','the label tells you which side of the reference point','without it, the date is dangerously ambiguous']),

-- Level 3
('s201_l3_mcq',  's201', 'MCQ',         'level3',
 'A coin is dated 184 BCE. An inscription nearby is dated 84 CE. How many years apart are they?',
 '184 BCE to 1 CE = 184 years, plus 1 CE to 84 CE = 84 years. Total = 268 years. (There is no year zero.)',
 NULL),

('s201_l3_desc', 's201', 'DESCRIPTIVE', 'level3',
 'The Rigveda was composed around 1500–1200 BCE; the Mahabharata around 400 BCE–400 CE. Use BCE/CE reasoning to explain which is older and by roughly how much.',
 NULL, NULL),

('s201_l3_feyn', 's201', 'FEYNMAN',     'level3',
 'A friend says: "BCE/CE is universal — everyone in the world uses it." Explain why this is only partly true.',
 NULL,
 ARRAY['BCE/CE is one of many calendar systems in use','India has the Hindu Panchang, Islam uses the Hijri calendar, China has its own','BCE/CE is convenient for international historical comparison','the reference point was set by a medieval European monk and is approximate']),

-- Strengthen + Revise
('s201_str_blurt','s201','BLURT',       'strengthen',
 'the BCE and CE timeline system — what the terms mean, which direction each counts, how to calculate "years ago" from a BCE date, and why historians need fixed labels instead of "X years ago"',
 NULL, NULL),

('s201_rev_recall','s201','ACTIVE_RECALL','revise',
 'An archaeologist finds two ancient sites near Patna. Site A has coins stamped with the number "152" (no era label). Site B has an inscription saying "built 300 years after the great king Ashoka died." Ashoka died around 232 BCE. (1) When was Site B''s building constructed? (2) Why can''t the historian be sure whether Site A''s coins are 152 BCE or 152 CE? (3) What evidence would help her decide?',
 NULL, NULL)

ON CONFLICT (id) DO NOTHING;

-- MCQ options for s201

INSERT INTO mcq_options (id, question_id, option_key, text, is_correct) VALUES
('s201_l1_mcq_a','s201_l1_mcq','a','Before Common Era',      TRUE),
('s201_l1_mcq_b','s201_l1_mcq','b','British Calendar Era',   FALSE),
('s201_l1_mcq_c','s201_l1_mcq','c','Before Calendar Existed',FALSE),
('s201_l1_mcq_d','s201_l1_mcq','d','Bharat''s Calendar Era', FALSE),

('s201_l2_mcq_a','s201_l2_mcq','a','268 years ago',           FALSE),
('s201_l2_mcq_b','s201_l2_mcq','b','About 2,268 years ago',   TRUE),
('s201_l2_mcq_c','s201_l2_mcq','c','About 1,732 years ago',   FALSE),
('s201_l2_mcq_d','s201_l2_mcq','d','About 268,000 years ago', FALSE),

('s201_l3_mcq_a','s201_l3_mcq','a','100 years', FALSE),
('s201_l3_mcq_b','s201_l3_mcq','b','268 years', TRUE),
('s201_l3_mcq_c','s201_l3_mcq','c','184 years', FALSE),
('s201_l3_mcq_d','s201_l3_mcq','d','84 years',  FALSE)

ON CONFLICT (id) DO NOTHING;

-- ── s203: What is Bharat? (sample — add s202, s204-s207 similarly) ────────────

INSERT INTO questions (id, concept_id, type, level, text, explanation, key_concepts) VALUES

('s203_l1_mcq', 's203', 'MCQ', 'level1',
 'In the Ṛig Veda, India''s most ancient text, the northwest region is called "Sapta Sindhava". What does this mean?',
 '"Sapta Sindhava" means "the land of the seven rivers". The word "Sindhava" comes from "Sindhu", the Indus River.',
 NULL),

('s203_l2_mcq', 's203', 'MCQ', 'level2',
 'Foreign names for India such as "Hind" (Persian), "Indoi" (Greek) and "Yindu" (Chinese) were all adapted from which original word?',
 'All these foreign names trace back to "Sindhu". Persians said "Hindu", Greeks dropped the "h" to get "Indoi", and the Chinese said "Yindu".',
 NULL),

('s203_l3_mcq', 's203', 'MCQ', 'level3',
 'In ancient Persian, the word "Hindu" originally referred to a geographical region — NOT a religion. Which fact best supports this?',
 'The Persians used "Hind/Hindu" simply for the land near the Sindhu (Indus) River. It was a place-name, not a religious label.',
 NULL)

ON CONFLICT (id) DO NOTHING;

INSERT INTO mcq_options (id, question_id, option_key, text, is_correct) VALUES
('s203_l1_mcq_a','s203_l1_mcq','a','The land of the seven rivers',  TRUE),
('s203_l1_mcq_b','s203_l1_mcq','b','The land of the seven mountains',FALSE),
('s203_l1_mcq_c','s203_l1_mcq','c','The country of the Bharatas',   FALSE),
('s203_l1_mcq_d','s203_l1_mcq','d','The island of the jamun tree',   FALSE),

('s203_l2_mcq_a','s203_l2_mcq','a','Bharata',                FALSE),
('s203_l2_mcq_b','s203_l2_mcq','b','Jambudvīpa',             FALSE),
('s203_l2_mcq_c','s203_l2_mcq','c','Sindhu (the Indus River)',TRUE),
('s203_l2_mcq_d','s203_l2_mcq','d','Hindustān',               FALSE),

('s203_l3_mcq_a','s203_l3_mcq','a','The Persians used "Hindu" for the land around the Sindhu (Indus) River', TRUE),
('s203_l3_mcq_b','s203_l3_mcq','b','The Persians worshipped Indian gods',                                    FALSE),
('s203_l3_mcq_c','s203_l3_mcq','c','The word "Hindu" first appears in the Ṛig Veda',                        FALSE),
('s203_l3_mcq_d','s203_l3_mcq','d','Greeks invented the word "Hindu"',                                       FALSE)

ON CONFLICT (id) DO NOTHING;

-- NOTE: s202, s204, s205, s206, s207 follow the same pattern above.
-- Full seed for all 7 concepts is generated by: go run ./cmd/seed
-- (to be added in a future migration)
