# BrainMaps — Dummy Data Test Cases

All data lives in `src/data/dummy.ts`. No backend required — everything is frontend-only.

---

## 1. Mastery State Rendering

All 5 mastery states are present and visually distinct in the Brain Map.

| State | Color | Glyph | Border | Example concept |
|---|---|---|---|---|
| `NOT_STARTED` | Gray `#9ca3af` | `?` | Dashed | Transpiration (sci_ch1), all of sci_ch6, hist_ch4, civ_ch4 |
| `VERY_WEAK` | Red `#ef4444` | `!` | Solid | Xylem & phloem (c106), Nervous system (c406) |
| `WEAK` | Orange `#f97316` | `◐` | Solid | Chlorophyll & light (c104), Mansabdari system (h304) |
| `DEVELOPING` | Yellow `#eab308` | `↗` | Solid | Stomata & gas exchange (c103), Bhakti movement (h203) |
| `STRONG` | Green `#22c55e` | `✓` | Solid | Photosynthesis overview (c101), Newton's 1st Law (c501) |

**Where to see:** Brain Map → click any subject → click any chapter

---

## 2. Due-for-Recall Badge

Orange pulsing dot on top-right of a concept node when `dueForRecall: true`.

Appears across different mastery states:

| Concept | State | Chapter |
|---|---|---|
| Why leaves are green (c102) | STRONG | sci_ch1 |
| Chlorophyll & light (c104) | WEAK | sci_ch1 |
| Limiting factors (c205) | VERY_WEAK | sci_ch2 |
| Fish & aquatic life (c305) | DEVELOPING | sci_ch3 |
| Digestive system (c403) | DEVELOPING | sci_ch4 |
| Nervous system (c406) | VERY_WEAK | sci_ch4 |
| Newton's 2nd Law (c502) | STRONG | sci_ch5 |
| Indus Valley (h103) | STRONG | hist_ch1 |
| Bhakti movement (h203) | DEVELOPING | hist_ch2 |
| Mansabdari system (h304) | WEAK | hist_ch3 |
| Latitude & longitude (g101) | STRONG | geo_ch1 |
| Monsoon patterns (g202) | STRONG | geo_ch2 |
| Deccan plateau (g303) | DEVELOPING | geo_ch3 |
| Fundamental duties (v104) | DEVELOPING | civ_ch1 |
| Right to const. remedies (v206) | VERY_WEAK | civ_ch2 |
| President's role (v304) | DEVELOPING | civ_ch3 |

**Where to see:** Brain Map → concept level → any node with an orange dot

---

## 3. Chapter Mastery Arc Cases

The mastery arc ring on each chapter node shows `strongPct` as a circular arc.

| Case | Example | strongPct |
|---|---|---|
| 0% — brand new chapter, no arc | sci_ch6 Matter & Materials | 0% |
| 0% — History Independence Movement | hist_ch4 | 0% |
| 0% — Civics Local Government | civ_ch4 | 0% |
| 0% — Geography Rivers & Water Bodies | geo_ch4 | 0% (River landforms is VERY_WEAK) |
| Low ~22% | hist_ch3 The Mughal Empire | 22% |
| Low ~25% | geo_ch3 India — Physical Features | 25% |
| Mid ~37% | sci_ch1 Life Processes in Plants | 37% |
| Mid ~43% | hist_ch2 Medieval India | 43% |
| Mid ~50% | sci_ch2 Photosynthesis Deep Dive | 50% |
| High ~75% | hist_ch1 Ancient Civilisations | 75% |
| High ~83% | geo_ch1 Maps & Globe Skills | 83% |
| High ~57% | sci_ch5 Forces & Motion | 57% |

**Where to see:** Brain Map → click any subject → chapter level

---

## 4. All-NOT_STARTED Chapter (Brand New)

Three chapters are completely untouched — all concepts `NOT_STARTED`.

| Chapter | Subject | Concepts |
|---|---|---|
| sci_ch6 Matter & Materials | Science | 5 concepts, all `?` |
| hist_ch4 Independence Movement | History | 6 concepts, all `?` |
| civ_ch4 Local Government | Civics | 5 concepts, all `?` |

**Visual:** All concept nodes are gray dashed circles with `?` glyph. No color ring fill.

**Where to see:** Brain Map → History → Independence Movement (most dramatic — 6 gray nodes)

---

## 5. Nearly-Mastered Chapter

Maps & Globe Skills (geo_ch1): 5 out of 6 concepts are STRONG, 1 is DEVELOPING.

- Latitude & longitude: STRONG, dueForRecall
- Map symbols: STRONG
- Scale & distance: STRONG
- Contour lines: STRONG
- Cardinal directions: STRONG
- Time zones: DEVELOPING

**Where to see:** Brain Map → Geography → Maps & Globe Skills

---

## 6. RightPanel — Concept-Specific Content

Clicking a concept node opens the RightPanel (420px slide-in from right). Content differs per concept:

| Concept ID | Specific detail available |
|---|---|
| c101 Photosynthesis overview | 5-pt checklist (4/5 checked), misconception about soil food, curiosity byte |
| c102 Why leaves are green | Autumn pigments recap, dueForRecall history |
| c103 Stomata & gas exchange | Guard cells, 3/5 checklist unchecked |
| c104 Chlorophyll & light | Existing data — misconception O₂/CO₂, 3/5 checklist |
| c105 Root absorption | Root hairs recap, 4/5 checklist, STRONG state |
| c106 Xylem & phloem | VERY_WEAK — all 5 checklist items unchecked, weak history |
| h103 Indus Valley | Script undeciphered curiosity byte, 4/5 checklist |
| g101 Latitude & longitude | Time zones curiosity byte, 4/5 checklist, dueForRecall |
| v101 The Preamble | Constitutional history, 4/5 checklist, STRONG state |
| Any other concept | Default fallback — generic 4-item checklist, no misconception |

**Where to see:** Brain Map → concept level → click any node

### RightPanel tabs

| Tab | Content |
|---|---|
| Recap | 5-sentence recap + checklist (checked/unchecked) + misconception card + curiosity byte + Start Sharpen CTA |
| Session | Tier badge + question type breakdown (varies by mastery state) |
| History | Dated session log OR empty state with "No sessions yet" for unseen concepts |

---

## 7. All 5 Question Types

Available in `SESSION_QUESTIONS` (sharpen session).

| Type | Question ID | Trigger |
|---|---|---|
| `MCQ` | q1, q2, q3 | Multiple choice with A/B/C/D options, reveal on click, explanation card |
| `DESCRIPTIVE` | q4, q6 | Textarea + word counter + collapsible rubric hint |
| `FEYNMAN` | q5 | Prompt card (italic) + textarea + key concept chips |
| `BLURT` | q7 | SVG countdown circle (3:00) + locked textarea + Start timer button |
| `ACTIVE_RECALL` | ar1, ar2, ar3 | Step 1✓ / Step 2 tabs + scenario card + textarea |

**Where to see:**
- MCQ/DESCRIPTIVE/FEYNMAN/BLURT → `/sharpen`
- ACTIVE_RECALL → `/recall`

### MCQ Tier Variants

| Tier | Color | Example |
|---|---|---|
| `VERY_WEAK` | Red — "Very Weak · Rebuilding Foundation" | q3 (Guard cells) |
| `WEAK` | Orange — "Weak · Gap Targeted" | q1, q2 (Photosynthesis) |
| `DEVELOPING` | Yellow — "Developing · Push Past" | q6 (Water transport) |

---

## 8. All 5 Subjects

| Subject | Key | Chapters | Special behavior |
|---|---|---|---|
| Science | `sci` | 6 chapters | Standard drill-down |
| History | `hist` | 4 chapters | Standard drill-down |
| Geography | `geo` | 4 chapters | Standard drill-down |
| Civics | `civ` | 4 chapters | Standard drill-down |
| English | `eng` | 0 (tracks) | Special folder view — 5 pill tracks fan out |

---

## 9. English Folder (Special View)

Clicking English at subject level skips the chapter drill-down and shows 5 pill-shaped tracks fanning out from the center node.

| Track | Key | Note |
|---|---|---|
| Vocabulary | voc | 15 words · 2 due for recall |
| Grammar | grm | 5 rules · 1 weak area |
| Reading Comp. | rc | 3 passages today |
| Literature | lit | 4 chapters · poem unit |
| Writing Skills | wri | 2 drafts pending |

**Where to see:** Brain Map → English

---

## 10. Dashboard Data

All values driven from `dummy.ts`.

| Widget | Data |
|---|---|
| Brain Weather bar | 29 STRONG / 18 DEVELOPING / 14 WEAK / 9 VERY_WEAK / 21 NOT_STARTED = 91 total |
| Subject strip | Sci 54% (43), Hist 46% (30), Geo 38% (26), Civ 35% (26), Eng 55% (25) = 150 total |
| Yesterday wins | Photosynthesis +0.18, Map symbols +0.12, Newton's 1st Law +0.09, Indus Valley +0.07 |
| Yesterday slips | Xylem & phloem −0.08, Mansabdari system −0.06, Greenhouse effect −0.05 |
| Curiosity byte | DNA strand = 2 metres; why do skin cells differ from neurons? |
| Heatmap | 30-day grid; rest/miss days at indices 2, 8, 15, 23, 29 (cream = 0 activity) |
| Sharpen CTA | 5 fixes · top concept: Chlorophyll & light |
| Recall CTA | 3 concepts · Sci · Geo · History |
| Streak | 12 🔥 |

---

## 11. Heatmap Edge Cases

The 30-day heatmap includes:

- `0` → cream color `#ece5d3` (rest/miss days at indices 2, 8, 15, 23, 29)
- `1` → light indigo `#e0e7ff`
- `2–3` → medium indigo `#a5b4fc`
- `4–5` → strong indigo `#6366f1`
- `6+` → deep indigo `#4F46E5`

**Where to see:** Dashboard → bottom-right heatmap

---

## 12. Session Flow — Sharpen

Path: `/sharpen`

1. Q1 MCQ (WEAK tier) → click option → green/red reveal + explanation → Next
2. Q2 MCQ (WEAK tier) → same flow
3. Q3 MCQ (VERY_WEAK tier) → red tier badge
4. Q4 DESCRIPTIVE → textarea + rubric hint toggle
5. Q5 FEYNMAN → prompt card + key concept chips
6. Q6 DESCRIPTIVE → water transport question
7. Q7 BLURT → Start timer → 3:00 countdown → textarea unlocks → I'm done
8. Completion screen → "Session complete! 🎉" → Back to Dashboard

---

## 13. Session Flow — Active Recall

Path: `/recall`

1. Q1 Chlorophyll ACTIVE_RECALL — scenario: red-only grow lamp
2. Q2 Latitude ACTIVE_RECALL — scenario: equator vs poles
3. Q3 Causes of WW1 ACTIVE_RECALL — scenario: Archduke assassination debate
4. Completion screen → "Recall session done! ⚡" → Back to Dashboard

Queue sidebar shows strikethrough on completed concepts.

---

## 14. Brain Map Navigation

| Action | Result |
|---|---|
| Subject node click | Zooms to chapter level; breadcrumb updates |
| Chapter node click | Zooms to concept level |
| Concept node click | Opens RightPanel (420px); orbit re-centers left |
| × on panel | Panel closes; orbit re-centers to full width |
| ← back (from concept) | Returns to chapter level |
| ← back (from chapter) | Returns to subject level |
| English subject click | Goes to English tracks (special view, no chapter step) |

---

## 15. Score & Attempts Display

Concepts with `score` and `attempts` show them in the RightPanel header.

| Concept | Score | Attempts |
|---|---|---|
| c101 Photosynthesis | 0.82 | 14 |
| c104 Chlorophyll & light | 0.42 | 7 |
| c106 Xylem & phloem | 0.18 | 6 |
| c501 Newton's 1st Law | 0.93 | 18 (highest) |
| c406 Nervous system | 0.21 | 5 |
| g105 Cardinal directions | 0.93 | 20 (most attempts) |

NOT_STARTED concepts (e.g., c108, all hist_ch4) show no score/attempts in the header.

---

## Data File

All dummy data is centralized at:

```
src/data/dummy.ts
```

Exported constants:
- `STUDENT` — name, class, board, streak, queue counts
- `CHAPTER_DATA` — chapters per subject key
- `CONCEPT_DATA` — concepts per chapter id
- `ENGLISH_TRACKS` — 5 English track nodes
- `WEATHER` / `WEATHER_TOTAL` — brain weather bar data
- `DASH_SUBJECTS` — subject strip percentages
- `YESTERDAY` — wins and slips arrays
- `CURIOSITY_BYTE` — fact + open question
- `HEATMAP_DAYS` — 30-day activity values
- `CONCEPT_DETAILS` — per-concept recap/checklist/misconception/history (9 entries + default fallback)
- `DEFAULT_CONCEPT_DETAIL` — fallback for concepts without a specific entry
- `SESSION_QUESTIONS` — 7 questions covering all 5 question types
- `RECALL_QUESTIONS` — 3 ACTIVE_RECALL questions
- `RECALL_CONCEPT_INFO` — metadata for recall queue sidebar
