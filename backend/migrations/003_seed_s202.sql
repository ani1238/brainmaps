-- Migration 003: Seed "How We Know History" (s202) questions + MCQ options
-- IDs match src/data/questions.ts so local dummy and API share the same keys.

INSERT INTO questions (id, concept_id, type, level, text, explanation, rubric_hint, key_concepts) VALUES

-- ── Level 1 ──────────────────────────────────────────────────────────────────
('s202_l1_mcq', 's202', 'MCQ', 'level1',
 'A "manuscript" is best described as:',
 'Manuscripts are handwritten texts — on palm leaves, birch bark, or parchment. They are one of India''s richest historical sources.',
 NULL, NULL),

('s202_l1_desc', 's202', 'DESCRIPTIVE', 'level1',
 'Name three different types of sources historians use to learn about the past, and give one example of each.',
 NULL,
 'Any three of: manuscripts (palm-leaf texts), inscriptions (Ashokan edicts on rock/pillar), coins (Gupta gold coins), buildings/ruins (Ajanta caves), tools/pottery (Harappan pots), oral traditions (folk songs and stories).',
 ARRAY['manuscripts','inscriptions','coins','oral traditions','archaeology']),

('s202_l1_feyn', 's202', 'FEYNMAN', 'level1',
 'Your friend says: "Archaeology is just digging in the dirt." Explain what an archaeologist actually does and why it matters.',
 NULL, NULL,
 ARRAY['carefully excavates layers of soil','studies objects people left behind (pottery, bones, coins)','uses evidence to reconstruct how people lived','small objects can reveal big facts about a civilisation']),

-- ── Level 2 ──────────────────────────────────────────────────────────────────
('s202_l2_mcq', 's202', 'MCQ', 'level2',
 'A stone pillar inscription carved by King Ashoka himself is a:',
 'Primary sources come directly from the period being studied — inscriptions, coins, tools. A textbook summarising Ashoka would be secondary.',
 NULL, NULL),

('s202_l2_desc', 's202', 'DESCRIPTIVE', 'level2',
 'A king''s inscription boasts that he won a great battle and the enemy was completely destroyed. Why might a historian be cautious about trusting this?',
 NULL,
 'Kings commissioned inscriptions to glorify themselves — they would exaggerate victories, hide defeats, and omit inconvenient facts. One-sided sources can mislead; historians cross-check with other sources (enemy records, coins, archaeology).',
 ARRAY['bias in sources','cross-checking','primary source limitations','royal inscriptions']),

('s202_l2_feyn', 's202', 'FEYNMAN', 'level2',
 'A friend says: "If we have one old text that says X happened, then X definitely happened." Explain why historians are not satisfied with just one source.',
 NULL, NULL,
 ARRAY['every source has a point of view or bias','single sources can be wrong, exaggerated, or incomplete','historians cross-check multiple sources','only when several independent sources agree can historians feel confident']),

-- ── Level 3 ──────────────────────────────────────────────────────────────────
('s202_l3_mcq', 's202', 'MCQ', 'level3',
 'Historians find no written records of a particular ancient tribe. This most likely means:',
 'Absence of written records often means ordinary people''s lives were not recorded (rulers wrote history), or records decayed, or they simply haven''t been found yet.',
 NULL, NULL),

('s202_l3_desc', 's202', 'DESCRIPTIVE', 'level3',
 'If historians only had a single manuscript describing Ashoka as a bad king, and all other evidence (inscriptions, coins, Buddhist texts) described him as a great reformer — what should a historian do? Explain your reasoning.',
 NULL,
 'The single conflicting source should be treated with skepticism but not dismissed — check who wrote it and why; weigh it against the many consistent sources; if the single source is clearly from a rival or enemy, discount it; good historians assess quality and motive, not just quantity.',
 ARRAY['evaluating conflicting sources','weighing quality vs quantity','historian''s method','source credibility']),

('s202_l3_feyn', 's202', 'FEYNMAN', 'level3',
 'A friend says: "The further back in history we go, the more we know — because there are more years of records." Explain why the opposite is actually true.',
 NULL, NULL,
 ARRAY['older records are rarer — most have been lost to time, fire, floods, decay','ancient societies had less writing to begin with','more recent history has more surviving sources and more people who could write','deep history relies heavily on archaeology (physical objects), not just text']),

-- ── Strengthen ───────────────────────────────────────────────────────────────
('s202_str_blurt', 's202', 'BLURT', 'strengthen',
 'how historians find out about the past — sources (manuscripts, inscriptions, coins, buildings, oral traditions), what primary vs secondary means, why sources can be biased, and why multiple sources matter',
 NULL, NULL,
 ARRAY['historical sources','manuscripts','inscriptions','primary source','secondary source','bias','cross-checking']),

-- ── Revise ────────────────────────────────────────────────────────────────────
('s202_rev_recall', 's202', 'ACTIVE_RECALL', 'revise',
 'Workers digging a new road in Tamil Nadu uncover a sealed clay pot containing 200 old Roman gold coins. As a historian, list at least three questions you must answer before you can say what this discovery tells us about ancient India. For each question, explain why it matters.',
 NULL, NULL,
 ARRAY['archaeological context','trade evidence','dating methods','source evaluation','India-Rome trade'])

ON CONFLICT (id) DO NOTHING;

-- ── MCQ options for s202 ──────────────────────────────────────────────────────
INSERT INTO mcq_options (id, question_id, option_key, text, is_correct) VALUES
-- s202_l1_mcq
('s202_l1_mcq_a', 's202_l1_mcq', 'a', 'A handwritten text from the past, often on palm leaves or bark', true),
('s202_l1_mcq_b', 's202_l1_mcq', 'b', 'A stone carving made by a sculptor',                              false),
('s202_l1_mcq_c', 's202_l1_mcq', 'c', 'An old metal coin',                                                false),
('s202_l1_mcq_d', 's202_l1_mcq', 'd', 'A modern printed book about history',                              false),

-- s202_l2_mcq
('s202_l2_mcq_a', 's202_l2_mcq', 'a', 'Secondary source — someone wrote about Ashoka later',             false),
('s202_l2_mcq_b', 's202_l2_mcq', 'b', 'Primary source — it comes directly from Ashoka''s own time',      true),
('s202_l2_mcq_c', 's202_l2_mcq', 'c', 'An oral tradition',                                                false),
('s202_l2_mcq_d', 's202_l2_mcq', 'd', 'A manuscript',                                                     false),

-- s202_l3_mcq
('s202_l3_mcq_a', 's202_l3_mcq', 'a', 'The tribe never existed',                                          false),
('s202_l3_mcq_b', 's202_l3_mcq', 'b', 'The tribe was not important',                                      false),
('s202_l3_mcq_c', 's202_l3_mcq', 'c', 'Records were lost, destroyed, or never made — absence of evidence is not proof of absence', true),
('s202_l3_mcq_d', 's202_l3_mcq', 'd', 'Historians are not skilled enough to find them',                  false)

ON CONFLICT (id) DO NOTHING;
