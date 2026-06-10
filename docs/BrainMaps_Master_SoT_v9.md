🧠

# BrainMaps — Master Source of Truth

**Version 9.0 · Real-Time Architecture**

| Target Audience | CBSE / ICSE Classes 5–7 (primary), 3–4 (Phase 2) |
| :--- | :--- |
| Status | In Development — v9 architecture |
| Replaces | All prior versions (including v7/v8). This document is the single canonical reference. |
| Key changes from v8 | Shifted from nightly batch processing to Real-Time AI Grading & Routing; Instant promotion to "Today's Fix" (needs_fixing state) upon level failure; Fully async queue architecture for grading. |
| Last updated | 2026-06-11 — per-tag weak-concept lifecycle + slot-based adaptive retry shipped (see §19 Date Log) |

---

# 1. Product Vision

BrainMaps is a gamified, spaced-repetition **assessment engine** for school students, built around an orbital mastery map and adaptive question delivery. It replaces linear chapter lists with a living visual map of a student's mind, where every node reflects real mastery.

**Core identity:** BrainMaps is an assessment engine, not a content library. Schools, tutors, parents, and textbooks provide the teaching; BrainMaps measures what stuck, repairs weak areas, and resurfaces strong areas before forgetting.

**Three jobs, always:**
1. **Measure** what stuck (the three assessment sets per concept).
2. **Repair** weak areas (Today's Fix, AI-targeted).
3. **Resurface** strong areas before forgetting (Revise, spaced repetition).

**Aesthetic:** Premium light mode. Off-white/cream background (never pure white). Frosted-glass panels with soft indigo borders. Clean rounded sans typography, generous whitespace. Warm, encouraging, never a basic-MVP feel. No shame language anywhere.

**Onboarding philosophy (new in v7):** A child should never have to study the app before using it. The system is sophisticated underneath, but the surface introduces itself through a 5-minute first-session walkthrough (§16) that the parent and child do together. After that walkthrough, every label on every screen has been experienced once and therefore makes sense.

---

# 2. Content Architecture — Subject → Chapter → Concept

The entire system is a three-level tree. Everything (questions, scores, sessions) lives at the **concept** level.

```
SUBJECT  (Science, History, Geography, Civics, Society, English…)
  └── CHAPTER  (e.g. "Life Processes in Plants")
        └── CONCEPT  (e.g. "Chlorophyll & light")
              └── 5 STATIONS: Level 1 · Level 2 · Level 3 · Strengthen · Revise
```

**English is special.** English has no chapters. The English subject node is a folder that expands into **5 skill tracks**, each of which contains concepts:

```
ENGLISH (folder)
  ├── Vocabulary
  ├── Grammar
  ├── Reading Comprehension
  ├── Literature (textbook prose/poetry/drama)
  └── Writing Skills
        └── CONCEPTS inside each track → same 5-station structure (adapted, see §7)
```

Everywhere a non-English subject shows "chapters," English shows "tracks." Downstream behaviour is identical.

---

# 3. The Five Concept Stations (the heart of v7)

Every concept presents five stations in a fixed left-to-right progression on a **stepped path** (not a flat pill row). Each station is a numbered circle connected by a dotted line — visually like video-game levels, immediately readable to a 10-year-old.

```
 ①  ───  ②  ───  ③  ───  ④  ───  ⑤
Level 1  Level 2  Level 3  Strength  Revise
                                en
 (easy) (moderate) (strong) (optional) (spaced recall)
```

| Station | Role | Difficulty | Bloom | Unlock condition |
| :--- | :--- | :--- | :--- | :--- |
| 1 · Level 1 | First assessment | Easy | Remember | Always open |
| 2 · Level 2 | Second assessment | Moderate | Understand | Level 1 cleared |
| 3 · Level 3 | Third assessment | Strong | Apply | Level 2 cleared |
| 4 · Strengthen | Voluntary reinforcement | Mixed | Understand→Apply | All 3 sets done |
| 5 · Revise | Spaced recall | Medium→Hard transfer | Apply→Analyze | 3 sets done AND mastery ≥ 0.80 |

> **Naming notes (v7):**
> - The three assessment sets were called "Learn It / Get It / Master It" in v6. They are now **"Level 1 / Level 2 / Level 3"** — gamified, instantly readable as a progression, no jargon to learn.
> - The fifth station was called "Keep It Fresh" in v6. It is now **"Revise"** — the word Indian students already use naturally.
> - The system function is unchanged in both cases; only the labels changed. See Strategy doc §3.7 for full reasoning on both renames.

**Why three sets instead of one session:** Three escalating sets triangulate true mastery. A student who aces Level 1 but fails Level 3 has surface knowledge, not understanding — one-shot assessment cannot detect this. The three-set sweep produces a reliable mastery score.

**Why a stepped path replaces the v6 pill row:** A path with numbered stations and a pulsing "you are here" marker visually answers the student's unspoken question ("what do I do right now?") without any words. A flat row of 5 equal pills required the student to decode 20 possible visual states. The stations visually escalate; the pill row did not.

### 3.1 Station States (one consistent model everywhere)

| State | Meaning | Visual |
| :--- | :--- | :--- |
| Locked | Previous station not yet cleared | Greyed circle with lock icon |
| Current | The station to do now | Indigo filled circle, pulsing "you are here" glow |
| Needs fixing | Attempted and failed | Red badge attached to the station |
| Done | Cleared | Teal filled circle with checkmark |

A failed station **never renames itself** — it keeps its name and gains a badge. Renaming breaks the student's mental map. The badged item is exactly what surfaces in Today's Fix.

### 3.2 Forgiving Unlock Rule

Failing a station does not permanently block progress. A failed station routes the student to **Today's Fix** (AI-regenerated questions targeting the specific mistake). The next station unlocks once the student clears a low bar (≥ 0.60) in a Today's Fix attempt — not by repeatedly re-passing the failed station. Failure routes sideways to repair, never backward.

### 3.3 Review Answers

A done station shows `[ Review answers → ]`. This opens each question with: the student's response, the correct answer, and (for text questions) the AI feedback. A "Show answer" toggle keeps the answer hidden until tapped, so review doubles as a self-quiz. Answer keys are stored per-station, per-concept, persistently in the progress file.

---

# 4. The Mastery State Machine

Every concept is bound to exactly one state, which governs node colour and routing.

| State | Colour | Mastery Score | Node click routes to |
| :--- | :--- | :--- | :--- |
| NOT_STARTED | Gray (dashed, "?") | No data | Level 1 |
| VERY_WEAK | Red | < 0.25 | Today's Fix / current station |
| WEAK | Amber | 0.25–0.44 | Current station |
| DEVELOPING | Amber (lighter) | 0.45–0.74 | Current station |
| STRONG | Teal + ✓ | ≥ 0.80 | Revise |
| RECALL_DUE | Teal + orange outer ring | Strong but interval elapsed | Revise |

Red is reserved for genuinely very weak only. Urgency gradient: **gray → red → amber → teal → teal+orange ring**.

### 4.1 Scoring — Exponential Moving Average

Recent performance weighted more heavily. Not a simple average.

```
WEIGHTS = [0.35, 0.25, 0.20, 0.12, 0.08]   # index 0 = most recent
For each of the last 5 responses:
  MCQ:  score_val = 1.0 (correct) or 0.0 (incorrect)
  Text: score_val = AI-graded fraction (0.0–1.0)
mastery_score = Σ score_val[i] * WEIGHTS[i]
```

Mastery ≥ 0.80 → STRONG → promotes to Revise.

---

# 5. The Three Action Surfaces

These are how a student does daily work without navigating the map.

| Surface | Type | Phrase used | What it contains |
| :--- | :--- | :--- | :--- |
| Today's Fix | System daily queue | "Today's Fix" | Every station across all concepts in `needsFixing` state |
| Strengthen | Voluntary library | "Strengthen" | Smart capped list of ~6 suggestions |
| Revise | System daily queue | "Revise" | Concepts whose spaced-repetition interval elapsed |

> **Renaming note (v7):** "Keep It Fresh" → "Revise" throughout. All surfaces, all UI text, all parent reports.

### 5.1 Today's Fix

Tapping opens a **report first**, then routes into questions. Report lists each item with what went wrong:

```
Today's Fix · 5 items · ~9 min
🔴 Xylem & phloem        Science · Life Processes   Stuck on Level 2 — 3 days
🟡 Chlorophyll & light   Science · Life Processes   Confused chlorophyll w/ stomata
…
[ Start fixing → ]   (or tap any item to start there)
```

`Start fixing` runs the queue top-down with auto-advance and a brief "1 of 5 done, X up next" transition. Tapping an item routes directly into that concept's failed station. Unfinished items roll to the next day — nothing is lost. The AI remediation prepends a line referencing the prior mistake (see §8.3).

### 5.2 Revise

Same report-first pattern. No error messages — only timing context:

```
Revise · 3 items · ~5 min
🟢 Photosynthesis overview   Science     Day 3 check · last seen 3 days ago
🟢 Latitude & longitude      Geography   Day 7 check
🟢 Causes of WW1             History     Day 1 check
[ Start → ]   These take ~90 seconds each
```

Tap → that concept's Revise station.

### 5.3 Strengthen (voluntary)

No natural daily list (every finished concept is eligible forever), so it shows a **capped list of ~6 suggestions grouped by reason**:

```
Strengthen · 6 suggested · no pressure
RECENTLY LEARNED — worth reinforcing      (done in last 7 days)
GETTING A BIT RUSTY                        (recall score dipped, not below threshold)
PART OF YOUR CURRENT WORK                  (concepts in recently-active chapters)
[ Browse all my concepts → ]
```

No "Start all" (forcing a queue would feel like homework). Suggestions rotate weekly. If untouched for 14 days, the entry renders as a quiet text link rather than a prominent button. Tap → that concept's Strengthen station.

---

# 6. Practice — Exam Sandbox

A standalone mode for building a custom practice paper before an exam.

```
1. Pick a subject
2. Tick chapters
3. Tick concepts (optional — or leave all)
4. Question count: 10 / 20 / 30
5. Difficulty: Easy / Mixed / Challenge
→ [ Generate practice paper ]
```

The system pulls questions from the existing bank across the selected concepts' station pools, assembles one continuous paper, and at the end shows a score + per-concept breakdown that gently suggests Strengthen / Today's Fix items.

**Critical rule:** Practice is read-only. It must NOT mutate mastery scores, spaced-repetition intervals, or any station state. A student can practise the same chapter five times before an exam without being flagged as struggling. This is a primary adoption driver in the exam-focused Indian market.

---

# 7. The English Engine (production-based)

English does not test memorised definitions; it tests language **use**. No Feynman, no Blurt. The engine is built on three principles missing from competitor apps:

1. **Production over recognition** — child writes and produces; doesn't just tap MCQs.
2. **Atomic rule-by-rule drilling** in the Wren & Martin tradition — one rule per session, dozens of varied items, never mixed practice early.
3. **Per-dimension AI grading** — every piece of writing scored on Grammar, Structure, Relevance, Vocabulary, Coherence, Creativity (the 6-dim rubric).

### 7.1 The 5 Tracks

English has no chapters — the subject expands into 5 parallel skill tracks, all worked on concurrently:

- **Vocabulary** — words in context, then in the child's own production
- **Grammar** — error-finding skill, not rule-reciting
- **Reading Comprehension** — three-rung ladder on fresh passages
- **Literature** — curriculum-linked (textbook prose / poetry / drama)
- **Writing Skills** — full production across 8 formats

### 7.2 The Track × Station Matrix

How the 5-station model adapts per track (v7 station names):

| Track | Level 1 (Easy) | Level 2 (Moderate) | Level 3 (Strong) | Strengthen | Revise |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Vocabulary** | Guess meaning from context (MCQ) + simple fill-in-blank | Context-clue mapping; collocation MCQs ("scored a goal" vs "won a goal") | Constrained sentence — write using the word about a specified topic; AI grades correctness | Mixed pool — context, collocation, constrained sentence | Generative production: write a *novel* sentence ≥ 6 words; AI checks correctness **AND** novelty (lesson sentences rejected) |
| **Grammar** | Rule shown + one correct/one incorrect example side by side; recognition MCQ | **Spot-It** — 3 chat-bubble sentences, tap the one with the rule's error | **Fix-It** (rewrite error in red) + **Produce-It** (new sentence using rule about a given topic) | Mixed Spot-It + Fix-It, with rule variants | Constrained writing using the rule in a 1-sentence task |
| **Reading Comprehension** | Textbook passage + full 3-rung ladder (one each rung) | **Fresh AI-generated passage** + full ladder | Fresh passage + **adaptive ladder** (starts at the rung they failed in Level 2) | Fresh passage + 1 rung the child chooses | Fresh 80-word passage + **Rung 1 only** (Main Idea MCQ) — under 90 sec |
| **Literature** | MCQ on plot, characters, basic recall of the textbook piece | Theme & meaning questions — "Why did the character do X?" short descriptive | Interpretation — "What does this poem suggest about courage?" longer response, Bloom: Analyse | Mix of theme/character/interpretation prompts | 1-sentence revival: "In one sentence, what is the main lesson?" |
| **Writing Skills** | Format intro + guided template fill (placeholders shown) | Half-guided write — prompt given, basic structure scaffolded; lenient 6-dim AI grading | Unguided write to a prompt; full 6-dim grading at normal threshold | Pick-your-prompt — choose 1 from 3 prompts in that format | Quick write — shorter format (e.g. 4-sentence note instead of full letter) |

### 7.3 The Three-Rung Ladder (Comprehension)

| Rung | Skill | Format |
| :--- | :--- | :--- |
| 1 | Main Idea | MCQ — pick the best summary from 4 |
| 2 | Evidence Hunt | Tap the sentence in the passage that proves a given claim |
| 3 | Inference | Open-text written response, AI-scored against rubric |

### 7.4 Fresh Passage Policy (absolute)

Level 2, Level 3, Strengthen, and Revise in the Reading Comprehension track ALWAYS use a passage the child has never seen. Only Level 1 uses the textbook passage.

The passage bank is tagged by class level, length, and topic. The system filters to "unseen by this student" before serving. If the bank doesn't have an appropriate fresh option, an AI-generation fallback creates one and stores it.

### 7.5 The 6-Dimension Writing Rubric

Every piece of writing in the Writing Skills track and every Inference/Interpretation in Comprehension/Literature is graded on these 6 dimensions, each 0–10:

| Dimension | What it measures | 6/10 looks like | 9/10 looks like |
| :--- | :--- | :--- | :--- |
| **Grammar** | Correctness of sentences, tenses, agreement | Mostly correct, 2–3 minor errors | Near-perfect, errors absent or invisible |
| **Structure** | Beginning / middle / end; paragraphing; format adherence (letter format, diary format etc.) | Structure present but sections uneven | Polished, format-perfect |
| **Relevance** | Stays on prompt; answers what was asked | Mostly on-topic, some drift | Tightly on-topic, every sentence earns its place |
| **Vocabulary** | Word range, precision, age-appropriate sophistication | Adequate but repetitive | Varied, precise, occasionally surprising |
| **Coherence** | Logical flow between sentences and paragraphs; connectives used naturally | Clear ideas but jumpy transitions | Each sentence builds on the last; reads smoothly |
| **Creativity** | Originality of ideas, vivid description, voice | Standard ideas, some specific detail | Distinctive voice, fresh angle, memorable detail |

Feedback to the child is **per-dimension** with **specific quoted examples from their own writing**:

> Grammar 7/10 — "He don't like mangoes" should be "He doesn't like mangoes" (subject-verb agreement).
> Vocabulary 6/10 — you used 'good' four times. Try 'helpful', 'kind', 'fascinating' next time.
> Coherence 8/10 — your second paragraph flows well from the first. The third feels disconnected — try starting it with 'Because of this…'.

### 7.6 Vocabulary — Novelty Checking

Revise in Vocabulary is the strictest grading moment in the app. The AI grader does two checks:

1. **Correctness** — is the word used grammatically and semantically right?
2. **Novelty** — is this sentence substantially different from any lesson-provided example or the child's previous attempts?

Failed novelty check returns: *"We need this in your own words — try writing about something from your day."*

This is the W&M idea on steroids — workbooks can never enforce novelty; we can.

### 7.7 Grammar — Personalised Error Targeting

The system maintains a per-child error history. When a child consistently breaks a rule (e.g. their/there/they're, subject-verb agreement, comma splices), Spot-It and Fix-It sessions weight questions on that specific rule.

Two children in the same class on the same day get different Grammar Spot-It sessions targeting their *own* historical mistakes. This is impossible in a workbook.

### 7.8 Atomic Rule Taxonomy (per class)

Grammar rules are atomic — one per session, never mixed in early stations. Mixed practice only appears in Strengthen and Revise. Rough scope per class:

- **Class 5:** ~10 rules — noun types, pronoun forms, verb tenses (simple), articles, basic punctuation, sentence types
- **Class 6:** ~15 rules — collective nouns, adverbs, prepositions, helping verbs, perfect tenses, common confusables (their/there/they're, its/it's, your/you're), apostrophes
- **Class 7:** ~18 rules — active/passive, direct/indirect speech, conjunctions, relative clauses, modifiers, parallel structure, complex tenses

Each rule has its own concept JSON file with full 5-station content (Spot-It items, Fix-It items, Produce-It prompts, Strengthen mix, Revise constrained writing task).

### 7.9 Writing Formats (Writing Skills track)

8 format concepts, each with its own 5-station structure:

1. Paragraph writing (descriptive, narrative, expository)
2. Letter writing (formal, informal)
3. Essay
4. Story / Story completion
5. Diary entry
6. Notice writing
7. Email / Message
8. Speech / Debate (text production; spoken version is Phase 2)

### 7.10 Phase 2 — Spoken English Engine (deferred)

Designed-for-but-not-built-in-v7. The Phase 2 spoken engine plugs into the same 5-station model with these track variants:

| Track | Spoken adaptation |
| :--- | :--- |
| Read-Aloud | Child reads a passage; AI scores pronunciation accuracy, fluency rate (WPM), pause patterns |
| Picture Story | Child sees a picture, speaks a 60-sec story; AI transcribes + grades on the same 6-dim rubric as Writing |
| Dialogue Practice | Short AI-led conversations on everyday topics (school, family, weekend plans) |

When Phase 2 launches, each Writing Skills concept gains a "Speak it" companion station. The Brain Map gains a 6th English track: Spoken English.

### 7.11 The Parent English Report (weekly)

In addition to the general parent report (§8.4), English produces its own weekly summary because parents care about English specifically:

- **Per-dimension trend** — Grammar 7→8, Vocabulary 6→7 (this week), Coherence 8→5 ⚠️
- **One actual writing sample from the week** — the child's own paragraph/letter/story, with the AI's per-dimension feedback shown
- **Vocabulary milestones** — "Actively used 8 new words in own sentences this week"
- **One specific celebration** — "Aarav's story about Diwali used the word 'glistening' really well"
- **One specific concern (if any)** — "Coherence dropped this week — his paragraphs are losing their logical flow. The diary entry below shows it."

This is the marketing-critical feature: parents have never seen this level of English insight from any other app at this price.

### 7.12 Wren & Martin Influence (positioning)

The methodology lineage is W&M: atomic rules, drill-heavy, spot/fix/produce sequence. The atomic taxonomy in §7.8 follows the W&M structure. **Content originality is mandatory** — all questions, sentences, and prompts are originally written; never copy from W&M or any published workbook. The pedagogical *approach* is shared; the *content* is original to BrainMaps.

What we add on top of W&M:
- Adaptive difficulty per child
- Personalised error targeting (§7.7)
- AI-graded production (vs workbook self-checking)
- Novelty enforcement on vocabulary
- Spaced repetition resurfacing of forgotten rules
- Parent-facing per-dimension transparency

---

# 8. Real-Time AI Grading & Routing

The system has shifted away from a nightly batch process. AI grading and routing now happen **instantly and asynchronously** via an active grading queue (`idx_sa_ai_grading_queue`).

| Action | When it happens | Description |
| :--- | :--- | :--- |
| AI Grading | Instant (Async Queue) | When a subjective response (Feynman, descriptive, etc.) is submitted, the grading microservice picks it up instantly, scores it, and generates per-dimension feedback. |
| State Routing | End of Session | Mastery score (EMA) is immediately recalculated. If the student passes the threshold, they progress to the next level. If they fail, their state immediately flips to `needs_fixing` (Today's Fix). |
| Parent Report | Nightly (10:00 PM IST) | Generates effort-first WhatsApp/email summary per student based on the day's real-time events. |

### 8.1 Instant Routing to Today's Fix — Per-Tag Weak-Concept Lifecycle (SHIPPED 2026-06-11)

When a student fails a level, they are not blocked until tomorrow. The system:
1. Detects the triggered misconceptions from the AI grading — weak tags are constrained to the questions' `key_concepts` vocabulary (so every detected weakness is testable), unioned with the tags of every wrong answer.
2. Upserts each tag into the **`student_weak_concepts`** table (migration 006) — one row per student × concept × tag, with `status` (active/cleared), `wrong_count`, and `correct_streak`. Untested tags are never touched, so a good targeted retry on tag A can't silently wipe tags B and C.
3. Flips the concept's state to `needs_fixing`.
4. Surfaces this concept instantly in the "Today's Fix" queue with targeted remediation:

> "Last time you confused chlorophyll with stomata. Explain to your friend who missed class: what does chlorophyll do, and how is it different?"

**Slot-based retry composition (6 questions).** A retry set targets the student's worst (up to 2) active tags, ranked by `wrong_count`:
- 1 active tag → 4 on-tag + 2 general
- 2+ active tags → 3 + 2 + 1 general (a third tag waits its turn but stays eligible for the general slot)
- The question pool is shuffled before selection and the set is guaranteed to differ from the previous attempt — retries are misconception-focused but never identical.

**Tag-gated level pass.** On a retry, score alone is not enough: every *targeted* tag (active before the session AND tested in it) must hit ≥ 50% in-session, on top of the ≥ 0.60 unlock score. The user-facing "passed" celebration requires score ≥ 0.80 AND the station actually clearing — the gate can demote, never promote. First attempts gate on score only.

**Clearing & spaced recheck.** A tag tested clean in 2 consecutive sessions flips to `cleared`. Revise sessions silently swap in up to 2 recheck questions for tags cleared in the last 30 days; a missed recheck reactivates the tag and the concept re-enters Today's Fix (failed revise sessions also surface there directly).

**Why this is the moat:** the misconception graph — which tags each student broke, how often, and what cleared them — accumulates only inside BrainMaps. It compounds with usage and cannot be copied by cloning the UI or the prompts.

### 8.2 Spaced Repetition Intervals (Revise)

| Recall # | Interval since last review |
| :--- | :--- |
| 1st | Day 1 |
| 2nd | Day 3 |
| 3rd | Day 7 |
| 4th | Day 21 |
| 5th | Day 60 |

Correct recall advances the interval to the next tier. Incorrect recall resets to Day 1 and drops the mastery score.

### 8.3 Nightly Memory Decay

While grading is real-time, memory decay is applied nightly via a fast background job:
- STRONG concept not reviewed > 14 days → score −= 0.08
- DEVELOPING concept not reviewed > 7 days → score −= 0.06
- If score drops below threshold, state downgrades and the node shows the orange recall ring.

### 8.4 Parent Report

Effort-first framing — effort, trend, encouragement. **No raw scores, no "weak" labels.** Delivered outside the child's app (WhatsApp/email). Example: "Aarav practised 3 concepts today and is getting stronger on Photosynthesis. Still working on Xylem — keep encouraging him. 4-day streak 🔥"

---

# 9. Navigation — Web App

The app has two layouts sharing one logic: mobile-first, desktop-responsive.

### 9.1 Mobile Layout (design for this first)

- Left navigation collapses to a hamburger (☰ top-left).
- A bottom tab bar carries the four primary destinations.
- **Home opens to the "Today" screen, NOT the Brain Map.** Fastest path to the daily loop: open → see finite task list → start.

**Bottom tab bar:**
```
[ 🏠 Today ]   [ 🧠 Map ]   [ 📝 Practice ]   [ ☰ More ]
```

**Hamburger (More):** Strengthen · Practice · My Progress · Settings · Switch student.

### 9.2 The "Today" Home Screen (mobile) — v7

The v7 home screen leads with **a single primary daily action** and a calmer dashboard. The v6 layout (two equal action cards as the first thing) felt task-list-y; v7 frames the dashboard before the actions.

```
☰                                      🔥 12
Hi Aarav 👋 · about 15 min today
[ thin brain-health bar: teal/amber/red/gray segments ]
4 strong · 3 to fix · 5 new

YOUR SUBJECTS
[🔬 Science  ▭▭▯]    [📜 History  ▭▭▯]
[🌍 Geo     ▭▯▯]    [📖 English  ▭▭▯]

TODAY'S ACTIONS
[ 🔧 Today's Fix · 3 → ]   [ 🔄 Revise · 2 → ]
   ~9 min                     ~4 min

(optional) Did you know? curiosity byte
```

Order matters: greeting → health snapshot → "your whole brain" (subjects) → "what to do today" (two action cards). Subject cards open the Brain Map at that subject. Today's Fix and Revise still surface as cards here AND as floating buttons on the Brain Map — both entry points.

**Removed from v6 home:** the "Brain Power 73%" big circle. Replaced by concrete counts in the thin health bar. A percentage without context creates anxiety; specific counts ("4 strong · 3 to fix") create understanding.

**Removed from v6 home:** the "Next chapter" cards under each subject — they duplicated the Brain Map. Subject cards now go directly to the Map.

### 9.3 The Brain Map (orbital — the signature interface)

The Brain Map is the exploration and progress surface, reached via the Map tab. It is the orbital engine:

- Center node is the **Brain**. It spawns orbiting **Subject** nodes based on enrolled subjects.
- Tapping a Subject triggers an immersive zoom; the subject becomes the anchor and its **chapters** (or English **tracks**) orbit outward.
- Tapping a Chapter zooms again; its **concepts** orbit outward.
- Tapping a Concept opens the 5-station concept page.
- Every node is colour-coded in real time per the state machine (§4).
- Breadcrumbs (`Brain › Science › Life Processes`) are clickable for jump-back navigation.
- Two floating buttons persist on the map: `Fix · 5` and `Revise · 3`.
- Streak persists in a corner.

### 9.4 Desktop Layout

Left sidebar (persistent): Home · Brain Map · Today's Fix · Revise · Strengthen · Practice · My Progress. Wider three-zone layout (rail / orbital center / right session panel). Same logic, same data.

### 9.5 Gamification & Reports Placement

| Element | Placement |
| :--- | :--- |
| Streak (🔥) | Top-right of Today + corner of Map. Always glanceable. |
| Monthly activity grid (GitHub-style) | My Progress screen. |
| Improving / Needs attention lists | My Progress screen. |
| Curiosity bytes | Small card on Today, or Map center-node tap reward. |
| Parent report | Outside the child app entirely (WhatsApp/email). |

---

# 10. Screen-Level Display Rules

### 10.1 Subject node

```
6 chapters · 43 concepts · 18 attempted
```
Ring segments = chapters, each coloured by that chapter's average state.

**English:** `5 tracks · 25 concepts · 12 attempted`. Ring = 5 track segments. Clicking English orbits the 5 tracks.

### 10.2 Chapter node

Segmented ring, one segment per concept, coloured by concept state. Below:
```
8 concepts · 5 attempted · 3 strong
```
If zero attempts → show "Not started yet", never "0% got it".

### 10.3 Concept node states

| State | Visual |
| :--- | :--- |
| Not attempted | Gray dashed circle, "?" inside |
| Very weak | Red ring |
| Getting there | Amber partial ring |
| All stations done, recall unlocked | Full teal ring, ✓ |
| Recall unlocked but overdue | Teal ✓ inner + orange outer ring |
| Recall badly overdue | Small orange "Complete recall" badge below node |

### 10.4 Station Path Display (NEW in v7)

Replaces the v6 5-tab pill row. Used on every concept page.

- 5 numbered circles connected by a dotted line
- Current station: indigo fill, white number, pulsing glow
- Done station: teal fill, white checkmark
- Locked station: gray fill, lock icon
- Needs-fixing station: keeps its number/colour and shows a small red badge above it

Label below each circle: the station name ("Level 1", "Level 2", "Level 3", "Strengthen", "Revise"). Use both the number AND the name — number for quick scanning, name for clarity.

---

# 11. Database Architecture

Decoupled JSON. The frontend reads and renders; no hard-coded content in the UI layer.

### 11.1 Runtime Data Layers

| Layer | File(s) | Purpose |
| :--- | :--- | :--- |
| Node Manifest | `manifests/{board}_class_{N}.json` | Visual hierarchy — Brain Map tree (subjects, chapters/tracks, concepts) |
| Content Store | `content/concepts/**/*.json` | Per-concept question banks (5 buckets) |
| Passage Bank | `content/passages/**/*.json` | Comprehension passages, tagged by topic + level |
| Student Progress | `progress/{student_id}.json` | Mastery state, scores, station states, weakness profiles, recall intervals, session history |
| Daily Queue | `queues/{date}.json` | Pre-built Today's Fix + Revise + Strengthen suggestions |
| AI Reports | `reports/{date}.json` | Nightly parent reports |

### 11.2 Folder Structure

```
content/
  concepts/
    cbse/class_6/
      science/
        ch01_c01_chlorophyll_light.json
        ch01_c02_stomata_gas_exchange.json
        ch01_c03_xylem_phloem.json
        ...
      history/
        ch01_c01_indus_valley.json
        ...
      geography/
        ch01_c01_map_symbols.json
        ...
    cbse/class_6/english/
      vocabulary/  unit01_precious.json ...
      grammar/     unit01_past_tense.json ...
      reading_comprehension/  ...
      literature/  unit01_fables.json ...
      writing/     diary_entry.json ...
  passages/
    cbse/class_6/
      main_idea_bank.json
      evidence_hunt_bank.json
      inference_bank.json
manifests/
  cbse_class_6.json
progress/
  {student_id}.json
queues/
  {date}.json
reports/
  {date}.json
```

### 11.3 Concept JSON Schema (v7)

The schema is unchanged structurally from v6. The fifth bucket is still stored as `keep_it_fresh` in the JSON (for backward compatibility with the 12 demo lesson files already generated). Display layer translates `keep_it_fresh` → "Revise" everywhere in the UI.

> **Migration note:** A future v8 schema may rename the bucket key to `revise`. For v7, the rule is: **JSON key stays `keep_it_fresh`, displayed label is always "Revise".** This avoids breaking the demo content.

```json
{
  "concept_id": "cbse_g6_science_ch01_c01_chlorophyll_light",
  "board": "CBSE",
  "class": 6,
  "subject": "Science",
  "engine": "CONCEPTUAL",
  "chapter": { "number": 1, "name": "Life Processes in Plants" },
  "concept": { "name": "Chlorophyll & light", "order": 1 },

  "shared": {
    "recap_summary": "4-6 sentence NCERT-aligned overview",
    "concept_checklist": ["item1", "...5-8 items"],
    "misconceptions": [
      { "id": "m1", "wrong_belief": "...", "reality": "...", "why_common": "..." }
    ],
    "curiosity_bytes": [ { "fact": "...", "open_question": "..." } ]
  },

  "sets": {
    "learn_it": {
      "difficulty": "EASY", "bloom": "REMEMBER",
      "mcqs": [
        { "id": "li_mcq_01", "subtype": "recognition", "prompt": "...",
          "options": [ {"id":"a","text":"...","correct":false}, {"id":"b","text":"...","correct":true} ],
          "correctOptionId": "b", "hint": "...", "explanation": "...",
          "target_subtypes": ["recognition"] }
      ],
      "descriptive": [
        { "id": "li_desc_01", "subtype": "what", "prompt": "...",
          "rubric_points": ["p1","p2"], "example_answer": "...", "target_subtypes": ["recall"] }
      ],
      "feynman_prompt": { "scenario": "Explain to a friend who missed class...", "key_concepts_to_cover": [] },
      "include_blurt": true
    },
    "get_it": {
      "difficulty": "MODERATE", "bloom": "UNDERSTAND",
      "mcqs": [], "descriptive": [],
      "feynman_prompt": { "scenario": "...", "key_concepts_to_cover": [] }
    },
    "master_it": {
      "difficulty": "STRONG", "bloom": "APPLY",
      "mcqs": [], "descriptive": [],
      "feynman_prompt": { "scenario": "Explain it to a younger student...", "key_concepts_to_cover": [] }
    }
  },

  "strengthen": {
    "mcqs": [], "descriptive": [],
    "feynman_prompt": { "scenario": "Strengthen — explain again in your own words...", "key_concepts_to_cover": [] }
  },

  "keep_it_fresh": {
    "step1": { "mcqs": [], "descriptive": [] },
    "step2_transfer": {
      "descriptive": [],
      "feynman_prompt": { "scenario": "Apply this to a new situation — a farmer grows...", "key_concepts_to_cover": [] }
    }
  }
}
```

### 11.4 Progress JSON (per concept entry)

```json
{
  "concept_id": "...",
  "mastery_score": 0.62,
  "state": "DEVELOPING",
  "set_states": { "learn_it": "done", "get_it": "needsFixing", "master_it": "locked" },
  "strengthen_unlocked": false,
  "revise": { "unlocked": false, "interval_tier": 0, "next_due": null, "due_for_recall": false },
  "weakness_profile": {
    "last_updated": "2026-05-29",
    "misconception_ids": ["m2"],
    "weak_question_subtypes": ["mechanism","application"],
    "coverage_gaps": ["stomata function"],
    "last_feynman_raw": "..."
  },
  "session_history": [
    { "date": "2026-05-28", "tab": "get_it", "score": 0.40,
      "items": [ { "question_id": "gi_mcq_02", "student_response": "c", "correct": false, "ai_feedback": null } ] }
  ]
}
```

> **Progress JSON change in v7:** the field formerly called `keep_it_fresh` in progress files is now `revise`. New progress files use `revise`; older files are migrated on first read.

### 11.5 Concept ID Format

`{board}_g{class}_{subject}_{chapter|unit}{NN}_c{NN}_{short_name}`

Examples: `cbse_g6_science_ch01_c01_chlorophyll_light`, `cbse_g6_english_unit01_grammar_past_tense`.

---

# 12. Content Generation Workflow

```
1. Concept Manifest      Human-approved list of concepts per chapter (Node Manifest JSON)
2. Master Prompt         Conceptual or English prompt + concept details filled
3. AI generates JSON     Full concept JSON: 5 buckets + shared content
4. Human Review          ~15-20 min per concept: fix answer keys, distractors, rubrics
5. Validated JSON        Passes schema validation → stored in content/
6. App Session Builders  Read deterministically; zero AI during daytime
```

**Question count per concept (v7):** ~6 per station × 3 sets = 18, plus ~6 Strengthen, plus ~6 Revise = **~30 questions/concept**. Each question carries `target_subtypes` tags so the queue builder can match weakness profiles.

**Volume estimate:** ~185 concepts (full Class 6 across subjects) × ~30 = ~5,500 questions. Mitigated by systematic Easy/Moderate/Strong templates that are easier to prompt and validate than fuzzy tiers.

**Demo content (already generated):** 12 concepts across Science, History, Geography, English — enough to test every screen and every engine type in the webapp build. See `brainmaps_demo_content/` for files.

---

# 13. Quick Reference — Key Rules

```
SCORE THRESHOLDS
≥ 0.80  → STRONG → Revise
0.45–0.79 → DEVELOPING → current station / Today's Fix
0.25–0.44 → WEAK → current station / Today's Fix
< 0.25  → VERY_WEAK → Today's Fix (scaffolded)
no data → NOT_STARTED → Level 1
```

```
STATION RULES (never break)
1. Three sets done in order: Level 1 → Level 2 → Level 3.
2. A failed station keeps its name + gains a "needs fixing" badge; it surfaces in Today's Fix.
3. Failure routes sideways to Today's Fix, never backward. Next station unlocks at ≥0.60 in a fix attempt — AND every targeted weak tag at ≥50% in-session (tag gate, §8.1).
4. Strengthen unlocks after 3 sets done. Revise unlocks after 3 sets done AND mastery ≥0.80.
5. Never share questions across stations — same concept, different questions per station.
6. Feynman escalates: explain → explain what you got wrong → apply in a new context.
```

```
ENGLISH RULES (never break)
1. Fresh passage every time for Comprehension Strengthen & Revise.
2. Vocabulary generative production rejects copied lesson sentences (correctness AND novelty).
3. Grammar = debugging skill (spot-it / fix-it / produce-it), not memorisation.
4. Revise Comprehension = Rung 1 (Main Idea) only — keep review fast.
```

```
PRACTICE RULE (never break)
Practice is read-only. It must NOT change mastery scores, SRS intervals, or station states.
```

```
NIGHTLY BATCH — every night 10 PM IST
P1 Grade text responses · P2 Recalculate EMA · P3 Memory decay
P4 Build Today's Fix + Revise queues, refresh Strengthen · P5 Parent reports
```

```
COPY RULES (v7)
No "weak" labels — use "to fix". Never "0% got it" — use "Not started yet".
Stations: Level 1 / Level 2 / Level 3 / Strengthen / Revise.
Warm coach, never judge.
"Brain Power %" is forbidden — use concrete counts.
```

---

# 14. Platform & Launch Decisions (v7)

**Build sequence (formalised in v7):**

| Phase | What | Tool | Output |
| :--- | :--- | :--- | :--- |
| **Phase 1** | First-session walkthrough validation | HTML prototype (`brainmaps_walkthrough.html`) | Self + friend feedback on the 6-step flow |
| **Phase 2** | Web app v1 with 12 demo lessons | React + localStorage, no backend | Clickable webapp for founder + friends self-testing |
| **Phase 3** | Real user testing with kids | Live testing on the webapp | 3-day streak validation, daily-loop observation |
| **Phase 4** | Native mobile app build | React Native or platform-specific | iOS + Android app informed by Phase 3 feedback |

**Why webapp before mobile:**
- Mobile is expensive to iterate. Validate UX cheaply on web first.
- Backend is anyway easy to build because the engine logic is identical.
- A webapp lets a parent and child sit at a laptop or tablet to do the first-session walkthrough — closer to the intended onboarding context than a phone.
- After Phase 3 validation, native mobile is built knowing what to optimise.

**Voice input for Feynman/text: Phase 2.** MVP substitute is instant keyword feedback — a frontend match against `concept_checklist` that tells the student what they covered/missed immediately, while the real AI grade runs overnight. Zero API cost.

**Class scope:** Launch cohort is Classes 5–7 (typing fluency, abstract navigation ability present). Classes 3–4 deferred with a simplified mode.

---

# 15. Roadmap (v7)

| # | Task | Phase | Priority |
| :-- | :--- | :--- | :--- |
| 1 | Build first-session walkthrough as live web component | Phase 2 | 🔴 Critical |
| 2 | Build Today screen v7 (subject blocks + two actions) | Phase 2 | 🔴 Critical |
| 3 | Build 5-station path component (replace pill row) | Phase 2 | 🔴 Critical |
| 4 | Build concept page with active question session | Phase 2 | 🔴 Critical |
| 5 | Wire 12 demo lessons into webapp | Phase 2 | 🔴 Critical |
| 6 | localStorage persistence + EMA scoring engine | Phase 2 | 🔴 Critical |
| 7 | Build the three action reports (Fix / Revise / Strengthen) | Phase 2 | 🔴 Critical |
| 8 | Build orbital Brain Map (subject + chapter level) | Phase 2 | 🔴 Critical |
| 9 | Friend testing — collect feedback on the daily loop | Phase 3 | 🔴 Critical |
| 10 | Real user testing — 10–20 Class 6 students | Phase 3 | 🔴 Critical |
| 11 | Generate full Class 6 concept JSON (all subjects) | After Phase 3 | 🟠 High |
| 12 | Build Practice paper builder (read-only sandbox) | After Phase 3 | 🟠 High |
| 13 | Nightly batch — production implementation (5 phases) | After Phase 3 | 🟠 High |
| 14 | Fresh comprehension passage pipeline | After Phase 3 | 🟠 High |
| 15 | Writing evaluator — 6-dimension rubric | After Phase 3 | 🟠 High |
| 16 | English-specific weekly parent report | After Phase 3 | 🟠 High |
| 17 | Parent report generator + delivery | Phase 4 | 🟡 Medium |
| 18 | My Progress screen (grid, streaks, improving/needs-attention) | Phase 4 | 🟡 Medium |
| 19 | Native mobile app build | Phase 4 | 🟠 High |
| 20 | Phase 2 — Spoken English engine (read-aloud, picture story, dialogue) | Phase 5 | ⬜ Backlog |
| 21 | Hindi engine / Math engine | Phase 5 | ⬜ Backlog |

---

# 16. The First-Session Walkthrough (NEW in v7)

The single biggest UX addition in v7. A one-time onboarding flow that runs the first time a student opens BrainMaps on a device. After it runs, the regular home screen is used forever. Skippable but discouraged.

### 16.1 Why this exists

The system has 9 distinct concepts a child must hold in their head to use it confidently: 3 sets, Strengthen, Revise, Today's Fix, the Brain Map orbital, mastery scores, "needs fixing" status. Dropping a Class 6 child into the middle of this fails them — and a parent-narrated explainer video is worse because children won't watch one before tapping.

**The walkthrough is the explainer, integrated into the first session.** Child engaged tap-by-tap. Parent present, watching the system work, not being pitched at.

### 16.2 The 6 Steps

| # | Screen | Purpose | Approx time |
| :-- | :--- | :--- | :--- |
| 1 | **Warm welcome** | Big brain emoji, "Hi Aarav!", parent callout: "Sit with your parent for 5 min." | 30s |
| 2 | **Pick where you are** | Subject grid → chapter list. Curriculum lock from §1 happens here. | 1 min |
| 3 | **Your first lesson** | Real concept page with stations path + tooltip + 1 real MCQ + auto-correct + completion modal showing Level 1 done, Level 2 unlocked | 2 min |
| 4 | **Meet your Brain Map** | Dark galaxy with Science glowing teal, others dim. "As you learn more, your map fills up." | 45s |
| 5 | **Your daily rhythm** | Three rows explaining the three daily activity types: Learn new / Today's Fix / Revise | 30s |
| 6 | **Your home screen** | Land on the real home with "You're all set!" plus all the elements they now understand | 30s |

Total time budget: 5 minutes.

### 16.3 Why each step exists

- **Step 1** sets expectation that this is the only screen needing the parent. Reduces parent friction for future sessions.
- **Step 2** does the curriculum lock — picking the chapter the class is currently on. Without this, the system can't sensibly choose what to surface first.
- **Step 3** is the critical step. The child literally watches Station 1 turn from current → done, and the lock disappear from Station 2. They understand the system because they experience one cycle.
- **Step 4** shows the metaphor (galaxy = brain) and creates the first emotional hook: "I want to see all four subjects light up."
- **Step 5** is the only explicit "here are the three types of daily work" screen. It appears AFTER one cycle has been done, so each term has context.
- **Step 6** is the regular home screen. Every element on it has now been earned by experience.

### 16.4 Reference asset

The clickable HTML walkthrough is in `brainmaps_walkthrough.html`. Use it as the spec when the developer builds the onboarding flow into the webapp. The HTML covers all 6 steps with Next/Back controls and contains the exact copy + structure to implement.

### 16.5 Replaces the "parent video" idea

An earlier plan included a 1-2 minute parent explainer video. **Rejected in favour of the walkthrough**, because:
- Children skip videos before tapping in
- Parents trust what they see, not what they're told
- The walkthrough cost is one-time per device, max 5 min, with the child engaged the whole time

A "How BrainMaps works" link still lives in the More menu for parents who want a recap later. Not a video — a 3-screen text refresher.

---

# 17. Tone & Copy Reference

These rules govern every UI string in the app.

### 17.1 Stations (display names)

```
Station 1: Level 1
Station 2: Level 2
Station 3: Level 3
Station 4: Strengthen
Station 5: Revise
```

Use the format "1 · Level 1" — the leading number doubles as the station number, the trailing label is the station name. This is the canonical UI form.

For longer-form copy (parent reports, tooltips, completion messages), describe what each level does rather than just saying the name:
- Level 1 — "the basics" / "first questions"
- Level 2 — "understanding it" / "slightly harder"
- Level 3 — "using it in new situations" / "the toughest set"

### 17.2 Forbidden phrases

| Don't say | Say instead |
| :--- | :--- |
| "Weak" / "weak concept" | "to fix" / "needs work" |
| "0% got it" / "0 attempts" | "Not started yet" |
| "Brain Power 73%" | "4 strong · 3 to fix · 5 new" |
| "Active Recall" | "Revise" |
| "Keep It Fresh" | "Revise" |
| "Sharpen Set X" | (removed in v6 — never use) |
| "Exercise 1 / 2 / 3" | "Level 1 / Level 2 / Level 3" |
| "Learn It / Get It / Master It" (v6 names) | "Level 1 / Level 2 / Level 3" |
| "Lesson complete" (cold) | "Awesome work! 🎉" or "Nice — you got it!" |

### 17.3 Tone

- Warm coach. Never judge. Never schoolteacher voice.
- Celebrate small wins specifically ("You got 4 out of 4 right" not just "Done").
- Encourage effort, not result ("Your brain is building new connections right now").
- No shame language ever.
- No homework framing ("Exercise" is forbidden as a UI label).

### 17.4 Empty states

- A subject with no attempts: "Not started yet" (never "0% got it").
- A station card with no items today: "None yet · comes back when you need it" or "None yet · starts after 3 days".
- An empty Today's Fix: a small green checkmark with "All clear today 🎉 — see you tomorrow."

### 17.5 Hierarchy principle

**Every screen has one primary action.** At most two secondary actions. Everything else is exploration or background context. If a screen looks like a feature dashboard, it's wrong — redesign with one clear next step.

---

# 18. Things Explicitly Decided NOT to Do (v7)

Carried forward from prior versions and reconfirmed:

- **No parent-narrated explainer video** — replaced by the walkthrough (§16)
- **No renaming "Level 1 / Level 2 / Level 3" to "Exercise 1/2/3"** — feels like school homework
- **No "Brain Power %" headline number** — meaningless to a child; concrete counts work
- **No two-mode app (simple view + power view toggle)** — one good UX beats two compromised ones
- **No live tutors** — different business, different problem
- **No conversational chatbot "practice"** — gimmicky, doesn't build skill
- **No leaderboards or social comparison** — Indian academic culture is comparison-heavy already
- **No daily XP / hearts / badges** — streak + Brain Map are sufficient gamification
- **No video lectures** — assessment engine, not content library
- **No "AI tutor that explains concepts"** — drifts the product into content delivery
- **No persuading parents to push children harder** — parent report stays effort-first

---

# 19. Date Log (Build Journal)

Running log of what shipped, newest first. Commit hashes refer to the `brainmaps` repo on `main`.

### 2026-06-11

**Adaptive Retry v2 — per-tag weak-concept lifecycle, slot-based retry, spaced recheck** (`2ff5bff`) — the main work of the day; full spec now in §8.1.
- New `student_weak_concepts` table (migration `006_weak_concepts.sql`): per student × concept × tag rows with `status` (active/cleared), `wrong_count`, `correct_streak`. Replaces the destructive full-overwrite of the ad-hoc `weak_concepts` column (which a clean targeted retry could silently wipe). Migration backfilled 13 existing weakness rows on the live Neon DB and dropped the legacy column.
- Slot-based retry selection: worst 2 active tags get dedicated question slots (4+2 or 3+2+1 of 6); uncovered tags are skipped and the next rank promoted.
- Tag-gated level pass (`levelPassGate`): retry clears only at score ≥ 0.60 AND every targeted tag ≥ 50% in-session. User-facing `passed` flag aligned: requires score ≥ 0.80 AND station cleared (gate can demote, never promote). MCQ-only sessions now recompute synchronously so the immediate result is accurate.
- Clearing rule: 2 consecutive clean sessions → tag `cleared`. Spaced recheck: revise sessions inject up to 2 questions for tags cleared within 30 days; a miss reactivates the tag. Failed revise sessions now surface in Today's Fix.
- AI weak-tag detection constrained to the questions' `key_concepts` vocabulary, so every detected weakness is testable and clearable.
- Pure-function test coverage added for lifecycle decisions, the pass gate, slot allocation, and recheck injection.
- Deployed to Fly.io (both machines healthy); migration applied to live Neon.

**Retry variety fix** (`f6415cf`) — question pool is shuffled before selection, so equally-ranked questions vary between attempts even on small banks. (Root cause of the "identical retries" report was production still running the pre-migration backend; redeploy + shuffle fixed it.)

**Revise schedule surfaced in the UI** (`2b1159b`) — `intervalDays` / `nextDueAt` / `lastDoneAt` exposed through the API client and rendered in the recall page, dashboard right panel, and Brain Map; `/today` now also returns an `upcomingReviseQueue`.

### 2026-06-10

**Adaptive Retry v1** (`0b35eb5`) — weak concepts detected at grade time and targeted on retry; superseded by v2 above.

**Retry selection hardening** (`fc19027`, `66492a4`, `7654ce8`, `192f210`, `1232592`) — compact diverse question sets, avoid recently-seen questions, refetch fresh questions on retry, guarantee the set differs from the previous attempt.

**Today's Fix improvements** (`1c19390`, `0ff8ddb`) — shows the specific flagged levels to retry (not a pick-a-concept prompt) and surfaces failed levels immediately.

**Student profiles & navigation** (`ffee29c`, `f6b9590`, `ef31c3e`, `6a4332a`) — name-based student profiles, active student in the dashboard greeting, assessments return to their source page, left-nav renamed to wireframe terminology.

**Revision queue & dashboard** (`1709f19`, `8aa534f`, `b56e83a`) — scheduled revision queue built; dashboard wired to real data with My Progress page and streak tracking; crash fix for null `/today` queues.

---

*— End of Master Source of Truth v9.0 (last updated 2026-06-11) —*
