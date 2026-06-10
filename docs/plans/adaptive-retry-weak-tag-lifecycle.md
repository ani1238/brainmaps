# Per-Tag Weak-Concept Lifecycle + Slot-Based Adaptive Retry (Layers 1+2)

> Repo: `/Users/anirbanmanna/Code/brainmaps` · Go backend (pgx, no ORM) + Next.js frontend · Neon Postgres, manual SQL migrations via `psql $DATABASE_URL -f`.
> On execution, copy this plan to `~/Code/brainmaps/docs/plans/` for the repo's record.

## Context

Adaptive retry v1 (`0b35eb5`) detects weak concepts at grade time (the batch grading call returns `weakConcepts`, unioned with wrong answers' `key_concepts`) and serves retry sets biased toward them. Three problems:

1. **Destructive overwrite**: `storeWeakConcepts` (grader.go:678) does a full replace of `concept_progress.weak_concepts`. A targeted retry testing only tag A that goes well returns `weakConcepts=[]`, silently wiping untested tags B and C.
2. **No per-tag lifecycle**: a student with 1 weakness and one with 3 get identical flat-match treatment — no ranking, no slot allocation, no clearing rule, no spaced recheck.
3. **Schema gap**: `concept_progress.weak_concepts` exists in **no migration** (001–005). The QueryRow error is swallowed (`if err == nil`), so on a fresh DB the whole retry path is dead code. The live Neon DB may have the column added manually.

Bonus inconsistency found during planning: the user-facing `passed` flag is `score >= 0.80` (sessions.go:132, session_get.go:62), while station progression unlocks at 0.60 (grader.go). The new tag gate must not let the UI say "Continue" while the backend keeps the level `needs_fixing`.

**Approved scope** (user decisions): Layers 1+2 only — per-tag lifecycle + slot-based retry + spaced recheck via the existing revise queue. No new AI calls. Level pass is **gated on tags** (score ≥ 0.60 AND each targeted tag ≥ 50% in-session).

---

## Step 1 — Migration `backend/migrations/006_weak_concepts.sql` (new file)

```sql
-- 006: per-tag weak-concept lifecycle (adaptive retry layers 1+2)
BEGIN;

CREATE TABLE IF NOT EXISTS student_weak_concepts (
  student_id     UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  concept_id     TEXT NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  tag            TEXT NOT NULL,                -- stored normalized: lower(trim())
  status         TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','cleared')),
  wrong_count    INT  NOT NULL DEFAULT 1 CHECK (wrong_count >= 1),
  correct_streak INT  NOT NULL DEFAULT 0 CHECK (correct_streak >= 0),
  first_seen_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  cleared_at     TIMESTAMPTZ,
  PRIMARY KEY (student_id, concept_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_swc_active
  ON student_weak_concepts (student_id, concept_id, wrong_count DESC, last_seen_at DESC)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_swc_cleared
  ON student_weak_concepts (student_id, concept_id, cleared_at DESC)
  WHERE status = 'cleared';

-- Backfill from legacy concept_progress.weak_concepts only if it was added
-- manually to the live DB (it exists in no migration). No-op otherwise.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'concept_progress' AND column_name = 'weak_concepts') THEN
    INSERT INTO student_weak_concepts (student_id, concept_id, tag)
    SELECT cp.student_id, cp.concept_id, lower(trim(t))
    FROM concept_progress cp, unnest(cp.weak_concepts) AS t
    WHERE trim(t) <> ''
    ON CONFLICT (student_id, concept_id, tag) DO NOTHING;
    ALTER TABLE concept_progress DROP COLUMN weak_concepts;
  END IF;
END $$;

COMMIT;
```

Decision: do **not** keep `concept_progress.weak_concepts`; remove all code references (Steps 2–3). Fresh and live DBs converge.

---

## Step 2 — Grader: lifecycle + tag-gated pass (`backend/internal/grade/grader.go`)

### 2a. Pure helpers (testable without DB — repo convention)

```go
func normalizeTag(s string) string { return strings.TrimSpace(strings.ToLower(s)) }

type tagStat struct{ Total, Correct int }
// passed: >= 50% of this tag's questions correct this session
func (t tagStat) passed() bool { return t.Total > 0 && t.Correct*2 >= t.Total }

// decideTagLifecycle: wrongTags = tags in sessionWeak (weakness wins even if
// also tested-correct); progressTags = tested, NOT in sessionWeak, and passed().
// Returns sorted slices for deterministic tests.
func decideTagLifecycle(sessionWeak map[string]bool, tested map[string]tagStat) (wrongTags, progressTags []string)

// levelPassGate: score >= 0.60 AND (not a retry, or every targeted tag passed()).
// isRetry = station column was 'needs_fixing' before this session.
// targeted = tags active for the student pre-session ∩ tags tested this session.
// First attempts have no pre-session active tags → gate degenerates to score-only
// by construction (no special-casing).
func levelPassGate(score float64, isRetry bool, targeted map[string]tagStat) bool
```

### 2b. DB helpers

`sessionTagStats(ctx, sessionID) map[string]tagStat` — per-tag accuracy of the session:

```sql
SELECT lower(trim(kc)) AS tag, COUNT(*) AS total,
       COUNT(*) FILTER (WHERE (sa.chosen_option IS NOT NULL AND sa.is_correct)
                           OR (sa.ai_score IS NOT NULL AND sa.ai_score >= 0.6)) AS correct
FROM session_answers sa
JOIN questions q ON q.id = sa.question_id
CROSS JOIN LATERAL unnest(q.key_concepts) AS kc
WHERE sa.session_id = $1 AND trim(kc) <> ''
GROUP BY 1
```

Safe: `recomputeSession` only runs after grades are persisted (incl. the neutral-0.5 hard-failure path).

`activeWeakTags(ctx, studentID, conceptID) []string` — ranked:

```sql
SELECT tag FROM student_weak_concepts
WHERE student_id = $1 AND concept_id = $2 AND status = 'active'
ORDER BY wrong_count DESC, last_seen_at DESC
```

Keep the existing aiWeak ∪ wrong-answers union (grader.go:691–711) as `sessionWeakSet(ctx, sessionID, aiWeak) map[string]bool`, normalized via `normalizeTag`.

### 2c. Replace `storeWeakConcepts` → `updateWeakConceptLifecycle(ctx, studentID, conceptID, sessionWeak, tested)`

Delete the `UPDATE concept_progress SET weak_concepts` statement. Call `decideTagLifecycle`, then:

**Wrong tags** (also implements Layer-2 "failed recheck → reactivate", since it flips `cleared` back):

```sql
INSERT INTO student_weak_concepts (student_id, concept_id, tag, wrong_count, correct_streak, status)
VALUES ($1, $2, $3, 1, 0, 'active')
ON CONFLICT (student_id, concept_id, tag) DO UPDATE
SET wrong_count = student_weak_concepts.wrong_count + 1,
    correct_streak = 0, status = 'active', cleared_at = NULL, last_seen_at = now()
```

**Progress tags** (clear threshold = streak 2; `status='active'` guard leaves cleared/never-weak tags untouched):

```sql
UPDATE student_weak_concepts
SET correct_streak = correct_streak + 1,
    status     = CASE WHEN correct_streak + 1 >= 2 THEN 'cleared' ELSE status END,
    cleared_at = CASE WHEN correct_streak + 1 >= 2 THEN now() ELSE cleared_at END,
    last_seen_at = now()
WHERE student_id = $1 AND concept_id = $2 AND tag = ANY($3) AND status = 'active'
```

Untested tags: untouched by either statement — the overwrite bug is gone structurally.

### 2d. Reorder + re-gate `recomputeSession` (lines ~579–611)

1. Before the station-state branch: `tested := sessionTagStats(...)`; `activeBefore := activeWeakTags(...)` (**before** lifecycle upserts); `targeted := activeBefore ∩ tested`; read current station state via `curCol` → `isRetry := state == "needs_fixing"`.
2. Replace `if sessionScore >= unlockThreshold` with `if levelPassGate(sessionScore, isRetry, targeted)` — done/unlock vs needs_fixing branches unchanged. Applies to the revise station too; `updateReviseSchedule` call unchanged.
3. Replace `storeWeakConcepts(...)` with `updateWeakConceptLifecycle(ctx, studentID, conceptID, sessionWeakSet(ctx, sessionID, aiWeak), tested)`.

### 2e. Prompt vocabulary constraint (`buildBatchPrompt`, ~line 415)

Change the weakConcepts instruction: tags must be chosen **only from the 'Key ideas' lists shown above**; `[]` if none fit. Free-form tags matching no question's `key_concepts` can never be tested and therefore never cleared.

---

## Step 3 — Slot-based retry + recheck injection (`backend/internal/api/handlers/concepts.go`)

### 3a. Rewrite `selectRetryQuestions` (line ~374) — new signature, pure function

```go
// rankedTags ordered by wrong_count DESC, last_seen_at DESC (from SQL).
func selectRetryQuestions(all []models.Question, rankedTags []string, recent map[string]bool) []models.Question
```

1. `focus` = first ≤ 2 ranked tags that have ≥ 1 matching question in `all` (uncovered tags skipped → next rank promoted).
2. Quotas for 6 slots: 1 focus tag → `[4]` + 2 general; 2 focus tags → `[3,2]` + 1 general; 0 → today's exact general fallback.
3. Per focus tag: partition into unseen/recent matched pools (skip already-picked IDs; a question matching both tags counts against the first only), then `appendRecentQuestions(selectDiverseQuestionPools(quota, unseenTag), quota, recentTag)` — reuse existing helpers.
4. General slots: questions matching **no** focus tag, same helper pattern.
5. If total < 6, pad from all remaining (unseen first). `ensureDifferentAttempt` unchanged, still applied after.

### 3b. Handler wiring in `GetConceptQuestions` (lines ~289–312)

Drop `weak_concepts` from the QueryRow (Scan `state` only). When `state == "needs_fixing"`: `rankedTags := activeTagsRanked(ctx, student, conceptID)` (5-line query duplicated in handlers package with a comment cross-referencing grader.go — don't create a shared package for it). Recent/exclude handling unchanged.

### 3c. Layer-2 recheck injection (revise sessions)

After `selected` is built, when `level == "revise" && student != ""`:

1. Cleared tags (cap **2**/session, keeps ≥ 4 genuine revise questions):

```sql
SELECT tag FROM student_weak_concepts
WHERE student_id = $1 AND concept_id = $2 AND status = 'cleared'
  AND cleared_at > now() - interval '30 days'
ORDER BY cleared_at DESC LIMIT 2
```

2. Recheck candidates span **all levels** (cleared tags usually live on lower-level questions) — one extra query filtered by `EXISTS (SELECT 1 FROM unnest(q.key_concepts) kc WHERE lower(trim(kc)) = ANY($2))`. Factor the existing row-assembly loop (lines ~240–285) into `scanQuestionRows(...)` shared by both call sites.
3. Pure helper `injectRecheckQuestions(selected, candidates []models.Question, clearedTags []string, recent map[string]bool) []models.Question` — replaces trailing questions, one per tag, skipping IDs already present.
4. **No grader change needed for failed rechecks**: missed recheck → its key_concepts enter `sessionWeakSet` → wrong-tag upsert flips `cleared → active` (Step 2c).

### 3d. Today's Fix surfaces reactivated revise (`today.go`, fix-queue WHERE, lines ~32–37)

Add `OR cp.revise_state = 'needs_fixing'` — currently a failed revise session vanishes from both queues (revise queue filters it out, fix queue doesn't include it).

---

## Step 4 — Align user-facing `passed` with the gate

Today `Passed` = `score >= 0.80` in **sessions.go:132** (immediate response) and **session_get.go:62** (polled). With tag gating, a 0.85 retry that fails a targeted tag would show "Continue to next level" while the station stays `needs_fixing`. Rule: **the gate can demote, never promote** — keep the 0.80 celebration bar, but never show pass when the station didn't clear.

- **session_get.go** (polled — authoritative after AI grading): `Passed = currentScore >= 0.80 && stationState == 'done'` (read the session's station column post-recompute; recompute runs before grading completes from the poller's perspective since `GradeOpenAnswers` calls it before returning).
- **sessions.go** (immediate): for the MCQ-only path, change `go grade.RecomputeSession(sessionID)` to a **synchronous** call (it's pure SQL, a handful of queries — no AI), then read the station state for `Passed`. The open-answer path keeps `AIGrading: true` + polling, so its immediate `Passed` value is never displayed as final.
- Update the comment on `models.CompleteSessionResp.Passed` (models.go:179).
- Frontend needs **no change** (sharpen/page.tsx:326 already prefers `apiResult.passed`).

---

## Step 5 — Remove legacy references & docs

- `grep -rn "weak_concepts" backend/ src/` must return only migration 006 after Steps 2–3.
- Update `backend/docs/database.md` + `backend/docs/scoring.md`: `student_weak_concepts` table, lifecycle rules (wrong → active/streak reset; tested-clean ×2 → cleared; missed recheck → reactivate), tag-gated retry pass.

---

## Step 6 — Tests (pure-function, no DB — repo convention)

`backend/internal/api/handlers/concepts_test.go` — update existing tests for the new signature, then add:
1. Single-tag slots: 4 on-tag + 2 general, type-diverse within groups.
2. Two-tag slots: 3+2+1; dual-match question consumed by top tag only.
3. Caps at two tags: tag 3 gets no dedicated slots but stays eligible as general.
4. Uncovered tag skipped → next rank promoted.
5. All matched questions recent → falls back to recentMatched, set still differs (`ensureDifferentAttempt`).
6. No active tags → byte-identical to current general fallback.
7. `TestInjectRecheckQuestions`: replaces trailing slots, skips duplicates, no-op on empty cleared list.

`backend/internal/grade/grader_test.go` — add:
8. `TestDecideTagLifecycle` (table-driven): weak-only → wrong; tested-clean → progress; weak ∧ tested-correct → wrong wins; tested-failed-but-not-in-weak → neither; untested → absent.
9. `TestLevelPassGate`: score 0.55 → fail always; 0.70 first attempt + failing tag → pass; 0.70 retry + tag 1/3 → fail; retry all tags ≥ 50% → pass; retry empty targeted → pass.
10. `TestTagStatPassed` boundaries: 1/2 pass, 1/3 fail, 0/0 fail.
Keep `TestNextRecallInterval` untouched.

---

## Edge cases (explicit)

| Case | Handling |
|---|---|
| Tag normalization | `normalizeTag` in Go, `lower(trim())` in every SQL; DB stores normalized only |
| Tag with zero bank questions | Skipped in focus selection; prompt constraint (2e) minimizes new ones |
| All matches recently seen | Per-tag recent fallback + `ensureDifferentAttempt` |
| >2 active tags (tag 3 starves) | Eligible as general; enters top-2 when tags 1–2 clear (~2 retries). Accepted; document |
| First-ever attempt | No rows → empty targeted → score-only gate; selection unchanged |
| Concurrent sessions | Single-statement atomic upserts; worst case double-counted wrong_count (ranking only) |
| Grading hard-failure (neutral 0.5) | 0.5 < 0.6 → counts wrong for tag stats — conservative, matches score behavior |
| MCQ-only sessions | `aiWeak=nil`; weakness from wrong answers' tags; lifecycle + gate work identically |
| Revise session also needs_fixing | Retry targeting runs first, recheck injection after, duplicates skipped |

---

## Rollout order

1. **Migration** — apply 006 to a Neon branch first, verify, then main. Safe pre-deploy: old code's `weak_concepts` references already error-and-noop.
2. **Backend** — grader + handlers ship together (handler reads what grader writes). Deploy via Fly.io (`fly.toml`).
3. **Frontend** — no changes required.

## Verification

1. `cd backend && go build ./... && go test ./...`
2. Neon branch: apply 001→006; check `\d student_weak_concepts`, indexes, and `concept_progress` has no `weak_concepts`.
3. Run backend against the branch (`DATABASE_URL=<branch> go run ./cmd/server`, `GROQ_API_KEY` set). Use a live 'Tapestry of the Past' concept.
4. E2E: fail level1 with wrong answers across tags A+B → assert `student_weak_concepts` rows active, `l1_state='needs_fixing'`. Fetch retry questions → verify 3+2+1 composition via `keyConcepts`. Retry with A correct / B wrong → A streak=1 active, B wrong_count++, station stays `needs_fixing` even at score ≥ 0.60 (gate) — and `passed=false` in the API response even at ≥ 0.80 (Step 4). Two clean A retries → A cleared. Drive to revise → recheck question for A appears; miss it → A active again, concept in `/today` fix queue.
5. Frontend smoke: `npm run dev`, one sharpen retry loop.

**Critical files**: `backend/migrations/006_weak_concepts.sql` (new), `backend/internal/grade/grader.go`, `backend/internal/api/handlers/concepts.go`, `backend/internal/api/handlers/sessions.go`, `backend/internal/api/handlers/session_get.go`, `backend/internal/api/handlers/today.go`, tests, `backend/internal/models/models.go` (comment), `backend/docs/{database,scoring}.md`.
