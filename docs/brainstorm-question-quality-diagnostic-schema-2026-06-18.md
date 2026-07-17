# BrainMaps Brainstorm: Question Quality, Diagnostic Grading, Parent Insight

Date: 2026-06-18 / 2026-06-19  
Sources: Claude brainstorming session, `/Users/anirbanmanna/.claude/plans/tingly-napping-anchor.md`, `docs/plans/adaptive-retry-weak-tag-lifecycle.md`, `backend/migrations/010_v2_diagnostic_questions.sql`, and the v2 content import/deploy work.

## Executive Summary

The discussion reframed BrainMaps content from "questions that produce a score" to "questions that produce a diagnosis." The earlier Class 6 CBSE bank had quantity, but not enough diagnostic structure. A parent seeing "3 to fix" does not know what the child misunderstood; the product needs to say things like "Arjun still believes roots absorb food from soil."

The agreed direction:

- Improve the production Class 6 CBSE question bank, not only demo/static questions.
- Keep DB-authored questions as the MVP source of truth; reject RAG-generated live questions for now.
- Make every station pool rich enough for adaptive retry and varied attempts.
- Add first-class diagnostic fields so AI grading can return covered/missed points.
- Preserve the existing weak-tag retry architecture, but feed it better question metadata.
- Add parent-facing insight later from the same diagnostic fields.

## Problems Identified

### 1. Question quality was uneven

The existing DB had many generated questions, but the spec was weak:

- BLURT was often just a topic label.
- FEYNMAN prompts lacked structured grading anchors.
- DESCRIPTIVE grading lived in a single `rubricHint` string.
- HOTS, story-format, Assertion-Reason, Spot-It, Fix-It, and stronger production tasks were missing or underused.
- English Grammar and Writing had rote format/rule questions, which directly violated the intended USP.

### 2. Scoring hid the reason for failure

A holistic `0.0–1.0` score says the child did poorly, but not which part failed. The new requirement is per-answer, per-rubric coverage:

- what the student covered,
- what they missed,
- which misconception was exposed,
- which weak tags should drive retry.

### 3. Parent insight lacked meaning

Counts are not actionable. Parent reporting should explain the child’s current misunderstanding in plain language:

- "Thinks roots absorb food from soil."
- "Confuses herb/shrub classification with plant use."
- "Understands magnet poles attract/repel but misses compass alignment with Earth's field."

## Brainstorm Decisions

### Scope

The work applies to the production Class 6 CBSE MVP bank across Science, Social Science, and English. The immediate v2 import was Science-focused, but the schema and content rules are intended for all 172 Class 6 concepts.

### No live RAG for MVP

RAG was rejected for the MVP because it risks hallucinated answer keys, unreviewed questions reaching students, and extra implementation complexity. The selected architecture is reviewed DB questions with strong metadata.

### No fixed retry sets

There will not be pre-authored Set A / Set B / Set C. The pool is the pool. Retry attempts draw from the same station pool, weighted toward active weak tags, with shuffle/recency logic to avoid identical retries.

### FEYNMAN scaffolds must not feel like fill-in-the-blanks

This was an explicit correction in the session. FEYNMAN prompts must be scenario/challenge prompts, not templates with blanks or numbered slots.

Good patterns:

- misconception correction,
- teaching a younger child,
- expert challenge,
- story-embedded dilemma.

Bad patterns:

- "Explain covering: 1, 2, 3",
- "Plants make food using ___",
- any prompt that lets the child guess from placeholders.

### Every level should retain the core modes

Every level should include the current core types:

- MCQ,
- DESCRIPTIVE,
- FEYNMAN,
- BLURT.

Advanced types may be inserted as appropriate:

- STORY_MCQ can appear at all levels.
- SPOT_IT / FIX_IT can appear across levels where useful.
- HOTS / HOTS_MCQ / ASSERTION_REASON are most useful at L3, Strengthen, and Revise.

### Pool size vs session size

The brainstorm moved toward large authoring pools, not fixed small sets:

| Station | Student session size | Authored pool target |
|---|---:|---:|
| Level 1 | 6 | 30 |
| Level 2 | 7 | 30 |
| Level 3 | 8 | 30 |
| Strengthen | 8 | 30 own, plus possible L3 reach-in |
| Revise | 5 | no own pool; draws from L1+L2+L3+Strengthen |

This gives each concept about 120 authored questions. Revise reuses the 120-question concept pool.

## Question Type Rules

### Conceptual Subjects

Conceptual subjects include Science, History, Geography, and Civics.

| Type | Use |
|---|---|
| `MCQ` | Scenario/reasoning-based four-option question. Avoid rote recall. |
| `STORY_MCQ` | MCQ inside a 3-5 sentence Indian-context story. |
| `DESCRIPTIVE` | Written answer graded against `rubric_points[]`. |
| `FEYNMAN` | Scenario-based explanation challenge. |
| `BLURT` | Guided free recall with `recall_guide` and hidden `key_points[]`. |
| `SPOT_IT` | Identify the error in a statement. |
| `FIX_IT` | Identify and correct the error. |
| `HOTS` / `HOTS_MCQ` | Higher-order unfamiliar scenario or data/passage question. |
| `ASSERTION_REASON` | CBSE-style assertion + reason relationship question. |
| `ACTIVE_RECALL` | Apply the concept to a new real-world scenario. |

Conceptual station mix target:

| Station | MCQ/STORY_MCQ | DESCRIPTIVE | FEYNMAN | BLURT | SPOT_IT/FIX_IT | HOTS/AR | Total |
|---|---:|---:|---:|---:|---:|---:|---:|
| L1 | 10 incl. 2 STORY | 6 | 6 | 5 | 3 | 0 | 30 |
| L2 | 9 incl. 2 STORY | 6 | 6 | 5 | 4 | 0 | 30 |
| L3 | 7 incl. 2 STORY | 5 | 5 | 4 | 4 | 5 | 30 |
| Strengthen | 6 incl. 1 STORY | 5 | 5 | 4 | 5 | 5 | 30 |

## English Track Rules

English is not just another conceptual subject. Each track has its own engine.

### English Grammar

Grammar must be assessed through use, not rule recall.

Allowed:

- `SPOT_IT`,
- `FIX_IT`,
- `PRODUCE_IT`,
- `STORY_MCQ`,
- limited DESCRIPTIVE "why is this wrong?" questions.

Avoid:

- "What is a noun?"
- "Which of these is a conjunction?"
- "What is the function of a preposition?"

### English Writing

Writing must be assessed through production.

Allowed:

- `PRODUCE_IT`,
- `GENERATIVE_PRODUCTION`,
- `STORY_MCQ` critique,
- peer-review style DESCRIPTIVE.

Avoid:

- "What are the parts of a paragraph?"
- "Explain the format of a friendly letter."

### English Vocabulary

Vocabulary must be assessed through context and usage.

Allowed:

- `CONTEXT_CLUE`,
- `PRODUCE_IT`,
- `GENERATIVE_PRODUCTION`,
- DESCRIPTIVE word-difference explanation.

Avoid bare definition tests.

### English Comprehension

Questions must be passage-anchored. The current inline-passage approach is acceptable for MVP, but a future `passages` table and `passage_id` relationship should be tracked separately.

### English Literature

L1 may use direct retrieval MCQs. L2+ should test character motivation, theme, author choices, evidence, and personal connection.

## Diagnostic Field Design

### DESCRIPTIVE

Old:

```text
rubricHint: "Mention: (1) X, (2) Y, (3) Z"
```

New:

```json
"rubric_points": [
  "specific checkable point 1",
  "specific checkable point 2",
  "specific checkable point 3"
]
```

Why: the AI can return `covered_points[]` and `missed_points[]` instead of vague feedback.

### FEYNMAN

New fields:

```json
"explanation_frame": "Scenario/challenge prompt shown to student",
"key_concepts": ["short-tag-1", "short-tag-2"],
"rubric_points": ["specific grading criterion 1", "specific grading criterion 2"]
```

Rules:

- `explanation_frame` is a scenario sentence.
- No blanks.
- No numbered checklist shown to the student.
- AI grades against `key_concepts` and `rubric_points`.

### BLURT

New fields:

```json
"text": "Without looking anywhere — write down everything you know about X.",
"recall_guide": "Try to cover: dimensions, relationships, and why it matters.",
"key_points": ["hidden checklist item 1", "hidden checklist item 2"]
```

Rules:

- `recall_guide` is shown to the student.
- `key_points` is hidden and used by AI.
- The guide must be a nudge, not a fill-in answer list.

## AI Grading Target

The target grading response expands from:

```json
{ "score": 0.65, "feedback": "..." }
```

to:

```json
{
  "grades": [{
    "index": 1,
    "score": 0.65,
    "feedback": "short student-facing feedback",
    "coveredPoints": ["point covered"],
    "missedPoints": ["point missed"]
  }],
  "weakConcepts": ["tag one"],
  "strongConcepts": ["tag two"],
  "misconceptionLabels": ["plain-language misconception"],
  "parentSummary": "One sentence for the parent."
}
```

The important product change is that grading becomes diagnostic, not just evaluative.

## Retry and Progression Decisions

### Level progression

Levels are a difficulty ramp. The discussion clarified that students should not be hard-blocked forever by a failed score. The app can mark a station as `needs_fixing` while the next level is available under the chosen progression model.

Current implementation still uses per-station state and a 60% pass threshold for the user-facing pass response. Retry pass is tag-gated: score must meet the threshold and targeted weak tags must be demonstrated.

### Adaptive retry

Retry pulls from the same pool, weighted toward active weak tags:

- worst active tags get slots first,
- recent question IDs are avoided,
- equal-rank pools are shuffled,
- recheck questions can be injected in Revise.

### Weak-tag lifecycle

`student_weak_concepts` tracks:

- active vs cleared tags,
- wrong count,
- correct streak,
- first/last seen timestamps,
- cleared timestamp.

Wrong tag:

- status becomes `active`,
- wrong count increments,
- correct streak resets.

Clean tested tag:

- correct streak increments,
- after two clean demonstrations it becomes `cleared`.

Revise recheck miss:

- cleared tag reactivates.

## Parent Insight Direction

Parent insight should be derived from:

- active weak tags,
- latest session `misconception_labels`,
- latest `missed_points`,
- cleared tags in the last 14 days,
- retry count per student/concept/station.

Target API shape:

```json
{
  "insights": [{
    "conceptId": "...",
    "conceptName": "...",
    "subjectLabel": "Science",
    "retryCount": 3,
    "struggling": true,
    "stillFiguringOut": "Thinks roots absorb food from soil",
    "recentWin": "Now understands that light is needed",
    "status": "needs_fixing"
  }]
}
```

This is a later surface, but the schema changes are designed to enable it.

## Schema Changes

Implemented as `backend/migrations/010_v2_diagnostic_questions.sql`.

### `questions`

Added:

```sql
rubric_points  TEXT[];
key_points     TEXT[];
recall_guide   TEXT;
preamble       TEXT;
assertion_text TEXT;
reason_text    TEXT;
```

Backfill:

```sql
UPDATE questions
SET rubric_points = regexp_split_to_array(rubric_hint, '\s*;\s*')
WHERE rubric_points IS NULL
  AND rubric_hint IS NOT NULL
  AND btrim(rubric_hint) <> '';
```

Rationale:

- `rubric_points` makes DESCRIPTIVE / FEYNMAN / FIX_IT / HOTS grading checkable.
- `key_points` makes BLURT coverage measurable.
- `recall_guide` gives students a useful free-recall nudge.
- `preamble`, `assertion_text`, and `reason_text` support HOTS / Assertion-Reason formats.

### `sessions`

Added:

```sql
strong_concepts      TEXT[];
parent_summary       TEXT;
misconception_labels TEXT[];
retry_count          INT NOT NULL DEFAULT 0;
```

Rationale:

- capture session-level diagnostic output,
- support parent summaries,
- track repeated struggle without blocking the child.

### `session_answers`

Added:

```sql
covered_points TEXT[];
missed_points  TEXT[];
```

Rationale:

- store per-answer rubric coverage,
- make review and parent insight explain exactly what was understood/missed.

### Question type constraint

Expanded allowed types to:

```sql
MCQ
STORY_MCQ
HOTS
HOTS_MCQ
ASSERTION_REASON
DESCRIPTIVE
FEYNMAN
BLURT
ACTIVE_RECALL
SPOT_IT
FIX_IT
PRODUCE_IT
CONTEXT_CLUE
GENERATIVE_PRODUCTION
```

Note: generated v2 Science content used `HOTS` as open-answer HOTS, so `HOTS` is preserved separately from `HOTS_MCQ`.

## Content Import Decisions

The v2 Science output was imported as a strict replacement for covered pools, not a loose upsert.

Important numbers from the import:

- v2 source files read: 78 per-concept station files.
- v2 questions added to master workbook: 2,338.
- old workbook question rows removed for those concept-level pools: 1,332.
- final master workbook question count: 9,463.
- final live DB question count after strict replace: 9,463.
- final live DB option count: 16,888.

Before deleting non-master DB rows, backup tables were created:

```sql
content_replace_backup_20260619_questions
content_replace_backup_20260619_mcq_options
content_replace_backup_20260619_session_answers
```

## Content Generation Workflow

The agreed workflow is to use Claude.ai Projects for content generation, not Claude Code.

Reason:

- Claude Code is better for engineering.
- Claude.ai Projects can hold persistent content instructions and allow parallel generation sessions.

Project instructions should include:

- master quality rules,
- FEYNMAN scenario-only rules,
- BLURT recall-guide/key-points rules,
- DESCRIPTIVE rubric-points rules,
- English track-specific rules,
- JSON output schema.

Per concept input should contain:

- concept name,
- subject,
- chapter,
- CBSE class,
- curriculum points,
- key concepts,
- common misconceptions,
- requested stations.

Run 4-6 Project windows in parallel for throughput.

## Validation Requirements

A generated question validator should check:

- station type distribution,
- DESCRIPTIVE has 3-5 `rubric_points`,
- BLURT has `recall_guide` and `key_points`,
- FEYNMAN `explanation_frame` has no blanks/underscores/numbered checklist style,
- grammar/writing banned phrases are absent,
- MCQ-like questions have valid options and exactly one correct answer,
- no duplicate question text within concept,
- key concepts are non-empty where retry targeting needs them.

## Implementation Status As Of 2026-06-20

Completed:

- `010_v2_diagnostic_questions.sql` added and applied.
- Backend models and handlers understand new question types and diagnostic fields.
- Option-based types are treated as option-scored where appropriate.
- Open HOTS is preserved as open-answer `HOTS`.
- Frontend recognizes and submits new question types correctly.
- DB content replaced to match the master workbook.
- Backend and frontend deployed.
- Level pass API threshold aligned to 60%.

Still to do:

- Extend AI grading prompt/output to persist `covered_points`, `missed_points`, `strong_concepts`, `misconception_labels`, and `parent_summary`.
- Build parent insight endpoint and dashboard strip.
- Build automated v2 question validation tooling.
- Finish full subject generation beyond the imported Science v2 batch.
- Decide whether/when to add a proper `passages` table for English Comprehension.

## Critical Files

- `backend/migrations/010_v2_diagnostic_questions.sql`
- `backend/internal/models/models.go`
- `backend/internal/api/handlers/concepts.go`
- `backend/internal/api/handlers/sessions.go`
- `backend/internal/api/handlers/session_get.go`
- `backend/internal/api/handlers/session_review.go`
- `backend/internal/grade/grader.go`
- `src/types/index.ts`
- `src/components/QuestionScreen.tsx`
- `src/app/sharpen/page.tsx`
- `docs/claude-project-instructions.md`
- `/Users/anirbanmanna/.claude/plans/tingly-napping-anchor.md`
- `docs/plans/adaptive-retry-weak-tag-lifecycle.md`
