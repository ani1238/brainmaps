-- Migration 004: Seed s204–s207 questions so all Tapestry of the Past concepts have AI grading

-- ══════════════════════════════════════════════════════════════════════════════
-- s204 · Ancient Texts of India
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO questions (id, concept_id, type, level, text, explanation, rubric_hint, key_concepts) VALUES

('s204_l1_mcq', 's204', 'MCQ', 'level1',
 'How many Vedas are there, and what is the oldest one called?',
 'There are four Vedas: Rigveda, Samaveda, Yajurveda, Atharvaveda. The Rigveda is the oldest — composed around 1500–1200 BCE.',
 NULL, NULL),

('s204_l1_desc', 's204', 'DESCRIPTIVE', 'level1',
 'What are the Vedas? In 2–3 sentences, describe what kind of texts they are and what they contain.',
 NULL,
 'Vedas are the oldest sacred texts of India; they are a collection of hymns, prayers, and knowledge about rituals; they were composed in Sanskrit and transmitted orally before being written down; Rigveda contains over 1,000 hymns praising nature and the gods.',
 ARRAY['Vedas','Rigveda','Sanskrit','oral tradition','hymns']),

('s204_l1_feyn', 's204', 'FEYNMAN', 'level1',
 'Your friend asks: "Why did ancient Indians memorise the Vedas instead of writing them down right away?" Explain two possible reasons in simple words.',
 NULL, NULL,
 ARRAY['writing was rare and expensive — palm leaves and bark were hard to prepare in large numbers','oral tradition was trusted — trained reciters memorised word for word using special chanting patterns','the sacred sound of the words was considered essential — reading was seen as less reliable','this was the culture before printing existed']),

('s204_l2_mcq', 's204', 'MCQ', 'level2',
 'The Mahabharata and Ramayana are called "epics." What makes a text an epic?',
 'An epic is a long narrative poem featuring heroes, wars, journeys, and moral dilemmas. The Mahabharata has 100,000 verses — the world''s longest epic.',
 NULL, NULL),

('s204_l2_desc', 's204', 'DESCRIPTIVE', 'level2',
 'What is the difference between the Vedas and the Epics (Mahabharata, Ramayana)? Give at least two differences.',
 NULL,
 'Vedas are older (1500 BCE+) vs epics are more recent (400 BCE–400 CE); Vedas are hymns and rituals vs epics are stories of heroes and battles; Vedas are considered sacred/revealed texts vs epics are narrative literature; Vedas were memorised by priests vs epics were told widely to all people.',
 ARRAY['Vedas vs epics','Mahabharata','Ramayana','Puranas','ancient Indian literature']),

('s204_l2_feyn', 's204', 'FEYNMAN', 'level2',
 'A friend says: "The Puranas are just made-up stories, so they''re not useful for historians." Explain why Puranas ARE useful as historical sources even if they mix mythology with history.',
 NULL, NULL,
 ARRAY['Puranas contain king lists and genealogies that help historians trace dynasties','they preserve cultural traditions, values, and social practices of their time','myths often carry historical memory in symbolic form','even "stories" reflect the world of the people who told them']),

('s204_l3_mcq', 's204', 'MCQ', 'level3',
 'The Upanishads are philosophical texts that ask: "What is the nature of reality? What is the self?" This makes them most similar to:',
 'The Upanishads (c. 800–200 BCE) are philosophical dialogues exploring Brahman (ultimate reality) and Atman (the self). They form the basis of Indian philosophical traditions.',
 NULL, NULL),

('s204_l3_desc', 's204', 'DESCRIPTIVE', 'level3',
 'The Rigveda has been transmitted accurately for over 3,000 years — mostly through memory. How did ancient Indians manage this without printing or writing?',
 NULL,
 'Special chanting techniques (patha) where reciters learned words forward, backward, and in complex patterns to detect errors; training began in childhood and took years; cross-checked across families and regions; mistakes were considered religiously unacceptable — creating strong motivation for accuracy.',
 ARRAY['oral transmission','chanting techniques','Vedic memorisation','accuracy without writing']),

('s204_l3_feyn', 's204', 'FEYNMAN', 'level3',
 'Your friend says: "India has so many ancient texts — that''s a bit much. Why did they write so much?" Explain two real reasons why ancient India produced so many texts.',
 NULL, NULL,
 ARRAY['India had a long uninterrupted tradition of scholarship — each generation added to the existing body of knowledge','oral culture valued comprehensive documentation of ideas, rituals, and stories','Sanskrit was a highly developed language suitable for complex thought','many different schools of thought (Vedic, Buddhist, Jain) each produced their own texts']),

('s204_str_blurt', 's204', 'BLURT', 'strengthen',
 'the ancient texts of India — the four Vedas, the Upanishads, the epics (Mahabharata and Ramayana), the Puranas — what each type is, roughly when it was composed, and what it contains',
 NULL, NULL,
 ARRAY['four Vedas','Upanishads','Mahabharata','Ramayana','Puranas','Sanskrit','oral tradition']),

('s204_rev_recall', 's204', 'ACTIVE_RECALL', 'revise',
 'A researcher discovers an ancient palm-leaf manuscript in a Kerala library. The text contains hymns praising the sun and fire, written in very old Sanskrit. The librarian says it might be part of the Rigveda. Using what you know about the Vedas: (1) What would confirm whether this is actually a Vedic text? (2) Why is it significant that it survived on palm leaves when the Vedas were supposed to be oral? (3) What can this manuscript tell a historian about ancient India?',
 NULL, NULL,
 ARRAY['Vedic authentication','oral vs written tradition','manuscript significance','historical evidence'])

ON CONFLICT (id) DO NOTHING;

INSERT INTO mcq_options (id, question_id, option_key, text, is_correct) VALUES
('s204_l1_mcq_a', 's204_l1_mcq', 'a', 'Three Vedas; the oldest is Samaveda', false),
('s204_l1_mcq_b', 's204_l1_mcq', 'b', 'Four Vedas; the oldest is the Rigveda', true),
('s204_l1_mcq_c', 's204_l1_mcq', 'c', 'Two Vedas; the oldest is Atharvaveda', false),
('s204_l1_mcq_d', 's204_l1_mcq', 'd', 'Seven Vedas; the oldest is Yajurveda', false),
('s204_l2_mcq_a', 's204_l2_mcq', 'a', 'It was written in a foreign language', false),
('s204_l2_mcq_b', 's204_l2_mcq', 'b', 'It is a very long poem/narrative with heroic characters, battles, and moral lessons', true),
('s204_l2_mcq_c', 's204_l2_mcq', 'c', 'It is a scientific textbook from ancient times', false),
('s204_l2_mcq_d', 's204_l2_mcq', 'd', 'It is a short story about a king', false),
('s204_l3_mcq_a', 's204_l3_mcq', 'a', 'A recipe book', false),
('s204_l3_mcq_b', 's204_l3_mcq', 'b', 'Philosophy — deep questions about existence and knowledge', true),
('s204_l3_mcq_c', 's204_l3_mcq', 'c', 'A war chronicle', false),
('s204_l3_mcq_d', 's204_l3_mcq', 'd', 'A trade manual', false)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- s205 · Yoga, Ayurveda & Ancient Science
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO questions (id, concept_id, type, level, text, explanation, rubric_hint, key_concepts) VALUES

('s205_l1_mcq', 's205', 'MCQ', 'level1',
 'The word "Ayurveda" comes from Sanskrit and means:',
 '"Ayus" = life, "Veda" = knowledge. Ayurveda is India''s ancient system of medicine, covering diet, herbs, surgery, and lifestyle.',
 NULL, NULL),

('s205_l1_desc', 's205', 'DESCRIPTIVE', 'level1',
 'What is Yoga, and where does the word come from? Describe it in 2–3 sentences.',
 NULL,
 'Yoga comes from Sanskrit "yuj" meaning to join or unite; it is a practice that combines physical postures, breathing, and meditation; the goal is to unite the body and mind; Patanjali wrote the Yoga Sutras (c. 400 CE), the foundational text of classical yoga.',
 ARRAY['Yoga','Patanjali','Yoga Sutras','Sanskrit','mind-body']),

('s205_l1_feyn', 's205', 'FEYNMAN', 'level1',
 'Your cousin says: "Aryabhata was just an ancient mathematician — what did he discover that we don''t already know?" Name two things Aryabhata figured out and explain why they mattered.',
 NULL, NULL,
 ARRAY['Aryabhata (476–550 CE) calculated the value of pi accurately to 4 decimal places','He said the Earth rotates on its axis — centuries before Europeans accepted this','He worked on algebra and trigonometry','His decimal and zero system influenced the numerals the whole world uses today']),

('s205_l2_mcq', 's205', 'MCQ', 'level2',
 'Sushruta, the ancient Indian physician, is especially famous for:',
 'Sushruta''s Sushruta Samhita (c. 600 BCE) describes over 300 surgical procedures, 120 surgical instruments, and techniques including plastic surgery and cataract removal.',
 NULL, NULL),

('s205_l2_desc', 's205', 'DESCRIPTIVE', 'level2',
 'The Iron Pillar at Delhi has stood for over 1,600 years without rusting significantly. Why is this remarkable, and what does it tell us about ancient Indian knowledge?',
 NULL,
 'Modern iron rusts quickly when exposed to air and moisture; the pillar (built c. 400 CE under Chandragupta II) contains a special phosphorus-rich composition that forms a protective layer; this shows ancient Indian metallurgists had sophisticated knowledge of iron alloys far ahead of the rest of the world.',
 ARRAY['Iron Pillar','metallurgy','rust resistance','ancient Indian science','Chandragupta II']),

('s205_l2_feyn', 's205', 'FEYNMAN', 'level2',
 'A friend says: "The invention of zero — it''s just a placeholder. What''s the big deal?" Explain why zero is one of the most important inventions in human history.',
 NULL, NULL,
 ARRAY['without zero, you can''t write large numbers efficiently','zero enables the decimal place-value system — the foundation of all modern arithmetic and computing','without zero, algebra, calculus, and all of modern mathematics would be impossible','before India invented it, Europeans used Roman numerals (no zero) — far harder to compute with']),

('s205_l3_mcq', 's205', 'MCQ', 'level3',
 'The Iron Pillar was built in approximately 400 CE. Modern engineers have studied it. What is the most significant finding?',
 'The pillar''s high phosphorus content creates a thin protective iron hydrogen phosphate layer (misawite). This process was only understood by modern metallurgists in the 1990s — yet ancient Indians achieved it empirically.',
 NULL, NULL),

('s205_l3_desc', 's205', 'DESCRIPTIVE', 'level3',
 'In what two ways has ancient Indian science directly shaped the modern world? Give specific examples.',
 NULL,
 'The decimal number system with zero (invented in India, transmitted via Arabs to Europe as "Arabic numerals") is the foundation of all modern mathematics and computing; Yoga is now a global wellness practice; Ayurvedic principles (herbal medicine, mind-body connection) have influenced modern integrative medicine; Indian astronomy (Aryabhata''s work) advanced the understanding of planetary motion.',
 ARRAY['zero and decimal system','global impact of Indian science','Yoga worldwide','Ayurveda influence']),

('s205_l3_feyn', 's205', 'FEYNMAN', 'level3',
 'Aryabhata lived in 476 CE and claimed that the Earth rotates on its axis causing day and night — not the Sun moving around the Earth. Explain why this claim was remarkable for his time, and why most people probably didn''t believe him.',
 NULL, NULL,
 ARRAY['to the naked eye it looks like the Sun moves across the sky — the intuitive assumption is Earth is still','most ancient civilisations (Greek, Roman, Egyptian) believed in a geocentric (Earth-centred) universe','without telescopes, Aryabhata reached this conclusion through mathematical reasoning alone','he was right — but it took Europe 1,000 more years to reach the same conclusion (Copernicus, 1543 CE)']),

('s205_str_blurt', 's205', 'BLURT', 'strengthen',
 'ancient Indian science and knowledge systems — Yoga (Patanjali), Ayurveda (Charaka, Sushruta), mathematics (Aryabhata, zero, decimal system), astronomy, and metallurgy (Iron Pillar) — what each achievement was and why it mattered',
 NULL, NULL,
 ARRAY['Yoga','Ayurveda','Aryabhata','zero','decimal system','Iron Pillar','Sushruta']),

('s205_rev_recall', 's205', 'ACTIVE_RECALL', 'revise',
 'A doctor at a wellness clinic is combining modern medicine with Ayurvedic herbal remedies and yoga for her patients. A colleague argues: "This is pseudoscience — ancient practices have no place in modern medicine." Using what you know about Ayurveda and Yoga, give two arguments for why the doctor''s approach might be reasonable, and one fair limitation she should keep in mind.',
 NULL, NULL,
 ARRAY['Ayurveda evidence base','integrative medicine','yoga benefits','critical evaluation of ancient science'])

ON CONFLICT (id) DO NOTHING;

INSERT INTO mcq_options (id, question_id, option_key, text, is_correct) VALUES
('s205_l1_mcq_a', 's205_l1_mcq', 'a', 'Science of the stars', false),
('s205_l1_mcq_b', 's205_l1_mcq', 'b', 'Knowledge of life / science of life', true),
('s205_l1_mcq_c', 's205_l1_mcq', 'c', 'Art of breathing', false),
('s205_l1_mcq_d', 's205_l1_mcq', 'd', 'Study of plants', false),
('s205_l2_mcq_a', 's205_l2_mcq', 'a', 'Inventing the zero', false),
('s205_l2_mcq_b', 's205_l2_mcq', 'b', 'Performing plastic surgery and detailed surgical procedures over 2,500 years ago', true),
('s205_l2_mcq_c', 's205_l2_mcq', 'c', 'Writing the Yoga Sutras', false),
('s205_l2_mcq_d', 's205_l2_mcq', 'd', 'Building the Iron Pillar at Delhi', false),
('s205_l3_mcq_a', 's205_l3_mcq', 'a', 'It is made of pure gold covered in iron paint', false),
('s205_l3_mcq_b', 's205_l3_mcq', 'b', 'Ancient Indian metallurgists achieved a rust-resistant iron composition that modern science only recently understood', true),
('s205_l3_mcq_c', 's205_l3_mcq', 'c', 'It was brought to India from China', false),
('s205_l3_mcq_d', 's205_l3_mcq', 'd', 'It rusts on the inside but looks clean outside', false)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- s206 · Trade & Crafts in Ancient India
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO questions (id, concept_id, type, level, text, explanation, rubric_hint, key_concepts) VALUES

('s206_l1_mcq', 's206', 'MCQ', 'level1',
 'Ancient India was famous for exporting which goods to foreign lands?',
 'Ancient India exported spices (pepper, cardamom), fine cotton textiles, precious stones, and iron goods. These were highly prized in Rome, Arabia, and China.',
 NULL, NULL),

('s206_l1_desc', 's206', 'DESCRIPTIVE', 'level1',
 'What was a "shreni" (guild) in ancient India, and what role did it play?',
 NULL,
 'A shreni was an organised group of craftsmen or traders of the same occupation (weavers, potters, metalworkers); they set quality standards, fixed prices, trained apprentices, and helped members in need; somewhat like a modern trade union or professional association.',
 ARRAY['shreni','guild','ancient Indian trade','craftsmen','vaishyas']),

('s206_l1_feyn', 's206', 'FEYNMAN', 'level1',
 'Your cousin asks: "Why were spices so valuable in ancient times? Can''t you just grow them?" Explain in simple words why spices were almost like gold for foreign traders.',
 NULL, NULL,
 ARRAY['spices only grew in specific climates (tropical India, Southeast Asia)','they were essential for preserving food before refrigeration','they were highly desired in Europe and the Middle East where they couldn''t be grown','the rarity + demand made them extremely expensive — a sack of pepper was worth its weight in gold in Rome']),

('s206_l2_mcq', 's206', 'MCQ', 'level2',
 'How did seasonal monsoon winds help ancient Indian sea traders?',
 'Sailors called Hippalus "discovered" (for Europeans) that monsoon winds blow northeast in summer and southwest in winter — allowing predictable round trips between India and the Red Sea/East Africa.',
 NULL, NULL),

('s206_l2_desc', 's206', 'DESCRIPTIVE', 'level2',
 'Roman gold coins have been found in large numbers at ancient sites in South India (like Arikamedu in Tamil Nadu). What does this tell a historian about ancient trade?',
 NULL,
 'It proves direct trade between Rome and India; India must have been exporting enough goods that Romans paid in gold coins; South Indian ports like Arikamedu were active trading hubs; the trade was large-scale and well-established, not occasional.',
 ARRAY['Roman-India trade','Arikamedu','archaeological evidence','trade surplus','ancient globalisation']),

('s206_l2_feyn', 's206', 'FEYNMAN', 'level2',
 'A friend says: "Trade was just about buying and selling things. Why do historians say trade routes also spread ideas and culture?" Explain using at least two examples from ancient history.',
 NULL, NULL,
 ARRAY['Buddhism spread from India to China, Sri Lanka and Southeast Asia along trade routes','Indian numerals (including zero) reached the Arab world and then Europe through trade contacts','Spices reached Europe, changing European cuisine and motivating voyages of "discovery"','traders carried stories, religions, languages, and art alongside their goods']),

('s206_l3_mcq', 's206', 'MCQ', 'level3',
 'The Roman writer Pliny the Elder (c. 75 CE) complained that Rome was losing huge amounts of gold to India every year in trade. What does this reveal?',
 'Pliny complained that Indian spices, gems, and textiles were draining Roman gold. This is an early documented trade deficit — and confirms that Indian goods were in massive demand in the ancient world.',
 NULL, NULL),

('s206_l3_desc', 's206', 'DESCRIPTIVE', 'level3',
 'Why were merchants (vaishyas) respected and wealthy in ancient Indian society, even though the traditional varna order placed them below brahmins and kshatriyas?',
 NULL,
 'Merchants financed wars, built temples, and funded scholars; wealthy traders were patrons of Buddhist monasteries; guilds gave merchants political influence; long-distance trade brought in foreign currency and goods that rulers valued; in practice, wealthy traders had enormous social power despite theoretical rank.',
 ARRAY['vaishyas','merchant class','varna system','trade power','shreni influence']),

('s206_l3_feyn', 's206', 'FEYNMAN', 'level3',
 'A friend says: "Globalisation — where the world is connected economically — is a modern invention from the last 100 years." Using ancient Indian trade as your example, explain why this is wrong.',
 NULL, NULL,
 ARRAY['India traded with Rome, Arabia, East Africa, and China 2,000 years ago','Indian goods (pepper, cotton) were essential to Roman and Chinese markets','trade routes carried ideas, religions, and technology across continents','the only difference from today is speed and scale — the interconnection itself is ancient']),

('s206_str_blurt', 's206', 'BLURT', 'strengthen',
 'ancient Indian trade and crafts — what India exported, who it traded with, how monsoon winds helped sea trade, what guilds (shrenis) were, and how trade spread ideas and culture beyond goods',
 NULL, NULL,
 ARRAY['exports','spices','cotton','monsoon trade','shreni','Rome-India trade','cultural diffusion']),

('s206_rev_recall', 's206', 'ACTIVE_RECALL', 'revise',
 'Imagine you are a pepper merchant in the port city of Bharuch (Gujarat) around 100 CE. A ship captain from Rome has arrived wanting to buy pepper. (1) What route did the Roman captain most likely take to reach India? (2) What will you ask in exchange — and why was your pepper so valuable to him? (3) What might the captain bring from Rome to trade back? (4) What is one non-physical thing (idea, religion, technology) that might travel along with this trade?',
 NULL, NULL,
 ARRAY['ancient trade routes','monsoon winds','Bharuch port','Rome-India exchange','cultural diffusion'])

ON CONFLICT (id) DO NOTHING;

INSERT INTO mcq_options (id, question_id, option_key, text, is_correct) VALUES
('s206_l1_mcq_a', 's206_l1_mcq', 'a', 'Oil, cars, and computers', false),
('s206_l1_mcq_b', 's206_l1_mcq', 'b', 'Spices, cotton cloth, gems, and iron goods', true),
('s206_l1_mcq_c', 's206_l1_mcq', 'c', 'Potatoes and chillies', false),
('s206_l1_mcq_d', 's206_l1_mcq', 'd', 'Wheat and dairy only', false),
('s206_l2_mcq_a', 's206_l2_mcq', 'a', 'The winds blew ships back to port if they got lost', false),
('s206_l2_mcq_b', 's206_l2_mcq', 'b', 'The summer monsoon blew ships toward Arabia/Africa; the winter monsoon blew them back — creating a reliable annual trade cycle', true),
('s206_l2_mcq_c', 's206_l2_mcq', 'c', 'Monsoon winds were avoided — traders only sailed in calm weather', false),
('s206_l2_mcq_d', 's206_l2_mcq', 'd', 'Winds were used to power waterwheels in harbours', false),
('s206_l3_mcq_a', 's206_l3_mcq', 'a', 'Rome was richer than India', false),
('s206_l3_mcq_b', 's206_l3_mcq', 'b', 'Indian goods were so desirable that Rome bought far more from India than India bought from Rome, creating a trade deficit', true),
('s206_l3_mcq_c', 's206_l3_mcq', 'c', 'India conquered Rome', false),
('s206_l3_mcq_d', 's206_l3_mcq', 'd', 'Gold was mined in India', false)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- s207 · Early Kingdoms & Republics
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO questions (id, concept_id, type, level, text, explanation, rubric_hint, key_concepts) VALUES

('s207_l1_mcq', 's207', 'MCQ', 'level1',
 'A "janapada" in ancient India (around 1000–600 BCE) was:',
 '"Jana" = people/tribe, "pada" = foot/settlement. Janapadas were the first settled kingdoms of ancient India, formed when cattle-herding tribes settled down and farmed.',
 NULL, NULL),

('s207_l1_desc', 's207', 'DESCRIPTIVE', 'level1',
 'What were the Mahajanapadas? Name at least three of them.',
 NULL,
 'The 16 Mahajanapadas (c. 600 BCE) were the major kingdoms/republics of ancient India. Any 3 of: Magadha, Kosala, Vajji, Kashi, Anga, Avanti, Vatsa, Gandhara, Kamboja, Panchala, etc. They had capital cities, armies, and collected taxes.',
 ARRAY['Mahajanapadas','16 kingdoms','Magadha','Vajji','Kosala','ancient India']),

('s207_l1_feyn', 's207', 'FEYNMAN', 'level1',
 'Your friend asks: "What''s the difference between a janapada and a mahajanapada? They sound the same." Explain in simple words.',
 NULL, NULL,
 ARRAY['janapada = small tribal settlement, like a village-territory','mahajanapada = "maha" means great — a bigger, more powerful kingdom with a capital city, army, and taxes','over time, stronger janapadas absorbed weaker ones and grew into mahajanapadas','by 600 BCE there were 16 major mahajanapadas across north India']),

('s207_l2_mcq', 's207', 'MCQ', 'level2',
 'The Vajji republic (Licchavi people, capital Vaishali) was different from most ancient kingdoms because:',
 'Vajji was among the earliest republics in the world. The assembly (gana) of representative elders met in large halls to make decisions collectively. Gautama Buddha, born among the Shakyas (another republic), was familiar with this system.',
 NULL, NULL),

('s207_l2_desc', 's207', 'DESCRIPTIVE', 'level2',
 'Why did Magadha (near modern Patna, Bihar) become the most powerful of the 16 Mahajanapadas? Give at least two reasons.',
 NULL,
 'Fertile land in the Gangetic plains for growing food and paying taxes; rich iron ore deposits in nearby hills (iron tools = better farming and weapons); access to rivers (Ganga, Son) for transport and trade; strong kings like Bimbisara and Ajatashatru who used diplomacy and war strategically; use of war elephants.',
 ARRAY['Magadha','iron ore','Gangetic plains','Bimbisara','Ajatashatru','war elephants']),

('s207_l2_feyn', 's207', 'FEYNMAN', 'level2',
 'A friend asks: "How could a republic (where many people decide) work in 500 BCE without phones, email, or printing?" Explain how Vajji''s gana sangha might have actually functioned.',
 NULL, NULL,
 ARRAY['representatives from different clans or villages gathered physically at a hall','decisions were made by discussion and vote among the assembly members','messengers carried news and decisions to different parts of the republic','it was slower than a king''s decree but gave many groups a voice — trading efficiency for legitimacy']),

('s207_l3_mcq', 's207', 'MCQ', 'level3',
 'Republics like Vajji and the Shakyas existed in 500 BCE. This is significant because:',
 'Greek city-states (like Athens) and Indian gana sanghas (like Vajji) both developed forms of representative government around 500 BCE independently. This challenges the idea that democracy is solely a Greek invention.',
 NULL, NULL),

('s207_l3_desc', 's207', 'DESCRIPTIVE', 'level3',
 'Magadha eventually became so powerful it formed the base for the Maurya Empire (under Chandragupta Maurya, c. 321 BCE). Trace the logic: why would a kingdom that was already the strongest Mahajanapada be well-positioned to create an empire?',
 NULL,
 'Already had the largest army (iron weapons, elephants); controlled the richest agricultural land and river trade routes; had experience absorbing smaller kingdoms; had a strong administrative tradition (tax collection, record-keeping) dating from Bimbisara; this gave Chandragupta the military, economic, and administrative foundation to expand into an empire.',
 ARRAY['Maurya Empire','Chandragupta Maurya','Magadha expansion','empire building','administration']),

('s207_l3_feyn', 's207', 'FEYNMAN', 'level3',
 'Your friend says: "Indian democracy came from the British — we had no democratic tradition before that." Using the gana sanghas (republics of 500 BCE), explain why this is historically inaccurate.',
 NULL, NULL,
 ARRAY['Vajji and Shakya gana sanghas were functioning republics with assemblies ~2,500 years ago','decisions were made collectively, not by a single king','B.R. Ambedkar explicitly cited Vajji''s Licchavi assembly as an ancient Indian democratic precedent','colonialism disrupted these traditions, but they existed long before British rule']),

('s207_str_blurt', 's207', 'BLURT', 'strengthen',
 'the early kingdoms and republics of ancient India — what janapadas and mahajanapadas were, which were the major ones, what a gana sangha (republic) was and how Vajji worked, and why Magadha became the most powerful',
 NULL, NULL,
 ARRAY['janapada','mahajanapada','Vajji','gana sangha','Magadha','republics','16 kingdoms']),

('s207_rev_recall', 's207', 'ACTIVE_RECALL', 'revise',
 'It is 450 BCE. You are an advisor to the king of Vatsa (one of the 16 Mahajanapadas, centred at Kaushambi). Your king wants to expand his territory. (1) Which neighbouring mahajanapada is the most dangerous threat, and why? (2) What resources would your kingdom need to compete with Magadha specifically? (3) Would you recommend forming an alliance with Vajji (a republic) — and what challenge would negotiating with a republic (vs a king) involve?',
 NULL, NULL,
 ARRAY['Vatsa','Magadha threat','alliance strategy','gana sangha diplomacy','ancient warfare'])

ON CONFLICT (id) DO NOTHING;

INSERT INTO mcq_options (id, question_id, option_key, text, is_correct) VALUES
('s207_l1_mcq_a', 's207_l1_mcq', 'a', 'A type of ancient coin', false),
('s207_l1_mcq_b', 's207_l1_mcq', 'b', 'A settlement or small territory where a tribe settled and farmed', true),
('s207_l1_mcq_c', 's207_l1_mcq', 'c', 'A large army', false),
('s207_l1_mcq_d', 's207_l1_mcq', 'd', 'A religious text', false),
('s207_l2_mcq_a', 's207_l2_mcq', 'a', 'It was ruled by the richest merchant', false),
('s207_l2_mcq_b', 's207_l2_mcq', 'b', 'It was a gana sangha — a republic with an elected assembly of representatives, not a single hereditary king', true),
('s207_l2_mcq_c', 's207_l2_mcq', 'c', 'It was ruled by Buddhist monks', false),
('s207_l2_mcq_d', 's207_l2_mcq', 'd', 'It had no army', false),
('s207_l3_mcq_a', 's207_l3_mcq', 'a', 'Democracy was invented in India before ancient Greece', false),
('s207_l3_mcq_b', 's207_l3_mcq', 'b', 'Non-monarchical governance was not unique to ancient Greece — India had functioning republics at the same time, independently', true),
('s207_l3_mcq_c', 's207_l3_mcq', 'c', 'These republics eventually conquered Greece', false),
('s207_l3_mcq_d', 's207_l3_mcq', 'd', 'Republics in India had no influence on later governments', false)
ON CONFLICT (id) DO NOTHING;
