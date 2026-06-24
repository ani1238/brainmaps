# Student Planner / Calendar

A per-student study plan that paces the syllabus across the year, drives a small
daily agenda, and never lets work pile up after a break. Goal: **fewer negative
reinforcements, more positive ones.**

Implemented in PRs #40 (core), #41 (calendar + day detail), and the leave-aware
move / rebuild-warning follow-up.

---

## Concepts

The curriculum backbone already exists: `subjects → chapters → concepts` (all
ordered) → stations (Level 1/2/3, Strengthen, Revise). The planner is a
**scheduling layer on top** of that, plus the existing `concept_progress`
(per-station states) and `revise_schedule` (SRS intervals `[1,3,7,21,60]`).

## Data model (migration `017_study_plan.sql`)

| Table | Purpose |
|---|---|
| `study_plans` | One row per student: pace settings — `start_date`, `study_days` (ISO weekdays), `new_concepts_per_day` (2), `revise_cap_per_day` (5), `fix_cap_per_day` (3), `subjects_per_week` (3). |
| `plan_items` | One row per concept: `ref_id`, `subject_key`, `planned_date`, `order_idx`, `status` (`planned`/`started`/`done`/`skipped`), `source` (`auto`/`manual`). `UNIQUE(student_id, ref_id)`. |
| `plan_leaves` | Leave ranges: `start_date`, `end_date`, `reason`. |

## Year-plan generation (`plan.Generate`)

1. Read the student's grade/board curriculum in `(subject, chapter, concept)`
   order.
2. **Round-robin interleave** subjects so they advance together (varied daily
   mix), not one subject at a time.
3. Pack concepts onto **open days** at `new_concepts_per_day`. An *open day* is a
   study day **and not** inside a leave range.
4. Write one `plan_items` row per concept (`source='auto'`). Re-running replaces
   all items (full rebuild).

> Default pace (2 concepts / study-day, Mon–Fri) packs grade-6 CBSE (~128
> concepts) into ~3 months. Lower `new_concepts_per_day` to stretch it across a
> full school year. Pace is adjustable via `POST /plan/settings`.

## Daily agenda (`plan.Agenda` → `GET /plan/agenda`)

The "Today" of the planner. Small and **capped**, always ending positive:

- **Learn** — planned (and carried-over) concepts due on/before today, capped at
  `new_concepts_per_day`.
- **Fix** — concepts with a `needs_fixing` station (from `concept_progress`),
  capped at `fix_cap_per_day`, weakest first.
- **Revise** — concepts due from `revise_schedule`, capped at
  `revise_cap_per_day`, most-overdue / weakest first.
- Plus `estMinutes`, a `status` (`ahead`/`on_track`/`done`/`on_leave`), and a
  `positiveNote`. `onLeave` pauses everything.

Surfaced on the **dashboard** as a Learn-first "Today's learning" card (or a
"Create my plan" nudge for new students), fixing the empty day-0 Today.

## Calendar + day detail (`plan.Calendar` → `GET /plan/calendar`)

`GET /plan/calendar?from&to` returns, per day, both **Learn** (`plan_items`) and
**Revise** (`revise_schedule`) entries with concept names.

- **Calendar cells**: subject-colored dots + per-kind counts (📘 learn / 🔄
  revise), today + selected-day highlight, 🌴 for leave. Tappable.
- **Day detail panel**: tap a day → its concepts by name (Learn + Revise) where
  the student can **Start**, **Move**, or **Skip** (see below).

## Move / skip (rearrange)

- `POST /plan/item/move {id, date}` → `plan.MoveItem`. Reschedules an item and
  marks it `manual`. **If the target is a non-study day or a leave day it snaps
  forward to the next open working day** — nothing lands on a break or weekend.
- `POST /plan/item/skip {id}` → marks the item `skipped` (drops out of agenda &
  calendar).

## Leave & anti-pileup (the heart of it)

`POST /plan/leave {start, end, reason}` → `plan.AddLeave`:

1. Records the leave range.
2. **Slides** not-done learning that starts on/after the leave forward by the
   leave length (no "overdue lessons" guilt).
3. **Freezes** revises whose due date falls inside the break (pushes them past
   it) — a 10-day break can't create a wall of overdue revises.
4. **Re-spreads** the overdue revise backlog (`plan.Reflow`) across upcoming open
   days so no day exceeds `revise_cap_per_day` — drain, don't dump.

`POST /plan/reflow` runs step 4 on demand ("Tidy my revisions").
`POST /plan/leave/remove {id}` deletes a leave.

### Streak freeze

`updateStreak` (in `internal/grade`) treats a gap whose in-between days are **all
covered by leave** as continuous — a planned break no longer resets the streak.

## Rebuild

The "Rebuild plan" tool calls `POST /plan/generate`, which **replaces all items**
from scratch. Because that **discards manual moves/skips**, the UI shows a
**confirmation modal** first. Rebuild still **skips leave days** (generation is
leave-aware), so breaks are preserved.

## Endpoints (all under `/api/v1`, student resolved from the token)

| Method | Path | Purpose |
|---|---|---|
| GET  | `/plan` | settings + `hasPlan` |
| POST | `/plan/generate` | (re)build the year plan |
| POST | `/plan/settings` | update pace |
| GET  | `/plan/agenda?date=` | daily agenda |
| GET  | `/plan/items?from&to` | raw plan items |
| GET  | `/plan/calendar?from&to` | learn + revise per day |
| POST | `/plan/item/move` | reschedule (snaps off leave/weekends) |
| POST | `/plan/item/skip` | skip an item |
| POST | `/plan/reflow` | re-spread overdue revises |
| GET  | `/plan/leaves` | list leaves |
| POST | `/plan/leave` | add leave + reflow |
| POST | `/plan/leave/remove` | delete leave |

> Mutations are POST to match the GET/POST-only CORS policy.

## Frontend surfaces

- `src/app/plan/page.tsx` — the planner page (agenda, calendar, day detail,
  leave editor, tidy/rebuild tools, rebuild modal).
- `src/app/dashboard/page.tsx` — Learn-first "Today's learning" card.
- `src/components/LeftRail.tsx` — "Plan" nav entry (desktop + mobile).
- `src/lib/api.ts` — plan API client + types.

## Backlog / future

- **AI rearrange** (Phase 2): a button where the student describes intent
  ("exams next week, lighten science") → an LLM emits reflow *parameters* that
  the deterministic engine applies (AI never writes the schedule directly).
- **Pace slider / start-date picker** in a setup screen.
- **Add-a-concept-to-a-day** picker (current Move only reschedules existing
  planned items).
- Coalesce many same-chapter overdue revises into one "quick refresh".

## Changelog

- 2026-06-25 — Initial planner: tables, generator, agenda, leave reflow, streak
  freeze, /plan page, dashboard card, nav. PR #40.
- 2026-06-25 — Calendar shows learn + revise per day; clickable day detail with
  Start/Move/Skip. PR #41.
- 2026-06-25 — Move snaps off leave/weekend days; rebuild skips leave days +
  shows a confirmation modal.
