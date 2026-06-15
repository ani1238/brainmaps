# BrainMaps Product and Engineering Backlog

Last reviewed: 2026-06-12

This is the working backlog for taking BrainMaps from the current prototype to
a production-ready learning product. Each ticket is intended to be implementable
and verifiable independently.

## How to Use This Backlog

- Work from the recommended order unless a product need changes the priority.
- Move a ticket from `[ ]` to `[~]` when active and `[x]` when verified.
- Before implementation, expand the ticket into a focused plan if it needs more
  than a few files or includes a migration.
- A ticket is complete only when its acceptance criteria and tests pass.

Effort guide:

- `S`: up to 2 focused engineering days
- `M`: 3-5 days
- `L`: 1-2 weeks
- `XL`: multiple milestones

## Recommended Order

1. BM-001 Secure answer delivery and answer review
2. BM-002 Authentication and authorization
3. BM-003 Transactional session completion
4. BM-004 Durable AI grading jobs
5. BM-005 Safe AI failure handling and grading audit
6. BM-006 Automated integration and learner-flow tests
7. BM-101 Strengthen suggestion library
8. BM-102 First-session onboarding
9. BM-103 Nightly memory decay
10. BM-104 Mobile navigation and responsive polish
11. BM-105 Practice exam
12. BM-201 Parent reporting
13. BM-202 English six-dimension rubrics
14. BM-301 Reproducible content ingestion
15. BM-401 RAG foundation and grounded grading pilot

## P0: Production Safety

### [~] BM-001 Secure Answer Delivery and Answer Review

**Priority:** P0 | **Effort:** M | **Dependencies:** none

**Why:** Active question responses currently expose correct-answer flags. This
ticket closes that leak and delivers the answer-review experience in the SoT.

**Implementation status (2026-06-12):**

- Implemented safe active-question payloads, server-side MCQ grading, opaque
  per-session access tokens, protected completed-session review, and `Show answer`
  UI.
- Applied migration `008_secure_session_review.sql` to Neon.
- Verified the API flow against real Neon data with a disposable student.
- Deployed the backend and frontend together and verified the production API
  flow with a disposable student.
- Remaining before `[x]`: add the planned Playwright review-flow test.

**Scope:**

- Remove `isCorrect`, answer keys, and hidden explanations from active question
  payloads.
- Grade MCQs on the server using the stored option key.
- Add an authorized completed-session review endpoint.
- Show the student's response, correct answer, explanation, and AI feedback.
- Keep the correct answer hidden behind a `Show answer` control by default.
- Permit review only after that student's session has completed.

**Done when:**

- Inspecting network responses during an active session cannot reveal answers.
- A completed station has a working `Review answers` action.
- Another student cannot retrieve the review.
- Backend contract tests and one Playwright review-flow test pass.

### [~] BM-002 Authentication and Authorization

**Priority:** P0 | **Effort:** L | **Dependencies:** none

**Scope:**

- Replace name-only login with authenticated parent/household accounts.
- Represent parent-to-student relationships in the database.
- Derive the acting student from an authenticated session, not a query parameter.
- Add authorization checks to every progress, session, review, and report route.
- Restrict CORS to approved frontend origins.
- Add logout, session expiry, and account recovery.

**Done when:**

- Student data cannot be read or changed without an authenticated household.
- Cross-household access tests return `403`.
- Production no longer accepts wildcard CORS.

### [ ] BM-003 Transactional Session Completion

**Priority:** P0 | **Effort:** M | **Dependencies:** BM-001

**Scope:**

- Validate that every submitted question belongs to the session concept and
  station.
- Read question type from the database instead of trusting the client.
- Reject duplicate, missing, foreign, or already-completed submissions.
- Save answers and mark completion in one database transaction.
- Return structured validation errors and log rejected attempts.

**Done when:**

- A forged question ID or type cannot affect another concept or session.
- Partial database failures roll back the whole completion.
- Integration tests cover valid, duplicate, foreign, and replayed submissions.

### [ ] BM-004 Durable AI Grading Jobs

**Priority:** P0 | **Effort:** L | **Dependencies:** BM-003

**Scope:**

- Replace in-process grading goroutines with a persistent jobs table and worker.
- Claim work using `FOR UPDATE SKIP LOCKED`.
- Store attempts, next retry time, provider, model, status, and last error.
- Retry transient failures with capped exponential backoff.
- Recover jobs after process restarts.
- Expose `pending`, `grading`, `complete`, and `needs_review` states to the UI.

**Done when:**

- Restarting the API during grading does not lose or permanently stall a job.
- Duplicate workers cannot grade the same job concurrently.
- A failed provider automatically falls through or retries with an audit trail.

### [ ] BM-005 Safe AI Failure Handling and Grading Audit

**Priority:** P0 | **Effort:** M | **Dependencies:** BM-004

**Scope:**

- Stop converting provider failure into a synthetic `0.5` student score.
- Keep the session pending or send it to manual review after retry exhaustion.
- Prevent failed AI calls from creating weak tags or station failures.
- Store prompt version, provider, model, latency, token use, retrieved evidence,
  raw structured output, and final normalized grade.
- Treat student text as untrusted data and harden prompts against instruction
  injection.
- Create a teacher-labelled grading evaluation set.

**Done when:**

- Provider failure cannot reduce mastery or create a false weakness.
- Every AI grade is traceable to its model, prompt, evidence, and output.
- Evaluation reports include score agreement and false weak-tag rates.

### [ ] BM-006 Automated Integration and Learner-Flow Tests

**Priority:** P0 | **Effort:** L | **Dependencies:** BM-003

**Scope:**

- Add database-backed tests for progression, retries, Revise, and SRS scheduling.
- Add Playwright tests for login, first attempt, failed retry, completion,
  answer review, and recall.
- Build deterministic test fixtures for at least two students and three subjects.
- Run lint, build, Go tests, migration tests, and Playwright in CI.

**Done when:**

- Critical progression regressions fail CI before deployment.
- A clean database can apply all migrations and run the full test suite.

## P1: Core Learner Experience

### [ ] BM-101 Strengthen Suggestion Library

**Priority:** P1 | **Effort:** M | **Dependencies:** BM-006

**Scope:**

- Create a dedicated Strengthen page with about six voluntary suggestions.
- Rank suggestions using weak tags, recent scores, inactivity, and subject mix.
- Rotate suggestions weekly and avoid repeating recently completed items.
- Quietly demote untouched suggestions after 14 days.
- Keep Strengthen optional; it must not block Revise or progression.

**Done when:**

- Suggestions are personalized, capped, explainable, and stable for a week.
- Completing Strengthen updates mastery without changing mandatory progression.

### [ ] BM-102 First-Session Onboarding

**Priority:** P1 | **Effort:** M | **Dependencies:** BM-002

**Scope:**

- Implement the SoT's skippable six-step parent-and-child walkthrough.
- Explain Levels 1-3, Today's Fix, Strengthen, Revise, and the Brain Map through
  interaction rather than a video.
- Persist completion per student/account.
- Add `How BrainMaps works` as a replayable text refresher.

**Done when:**

- A new student sees onboarding once and can replay it later.
- Keyboard, touch, Back, Next, Skip, and resume behavior are tested.

### [ ] BM-103 Nightly Memory Decay

**Priority:** P1 | **Effort:** M | **Dependencies:** BM-004, BM-006

**Scope:**

- Add a scheduled, idempotent decay worker.
- Apply the documented decay policy using elapsed time and recall history.
- Move due concepts to `RECALL_DUE` without overwriting active Fix work.
- Record every decay transition for debugging and reports.
- Provide a dry-run command that reports proposed changes.

**Done when:**

- Running the job twice produces no duplicate transitions.
- Due concepts appear in Revise at the correct date.
- Recent successful recalls are not decayed prematurely.

### [ ] BM-104 Mobile Navigation and Responsive Polish

**Priority:** P1 | **Effort:** M | **Dependencies:** none

**Scope:**

- Add the mobile bottom navigation and More menu specified in the SoT.
- Make Brain Map, question screens, reports, and review usable on phone/tablet.
- Verify touch targets, keyboard focus, loading states, and long-content behavior.

**Done when:**

- Primary learner flows work at common phone, tablet, and desktop widths.
- Automated accessibility checks have no critical violations.

### [ ] BM-105 Practice Exam

**Priority:** P1 | **Effort:** L | **Dependencies:** BM-003, BM-006

**Scope:**

- Let a student select subjects, chapters, concepts, question count, and time.
- Build a continuous paper from existing approved question pools.
- Keep practice results separate from mandatory station progression by default.
- Show score, timing, and per-concept breakdown with Fix/Strengthen suggestions.

**Done when:**

- Exams are reproducible from a stored configuration and question snapshot.
- Results clearly distinguish exam performance from mastery progression.

## P2: Parents and English

### [ ] BM-201 Parent Reporting

**Priority:** P2 | **Effort:** L | **Dependencies:** BM-002, BM-005, BM-103

**Scope:**

- Produce a weekly household report with effort, mastered concepts, unresolved
  weaknesses, due recall, streak, and suggested support.
- Use evidence-first, non-punitive language.
- Add in-app history first; add email/WhatsApp delivery only after consent,
  unsubscribe, and provider-cost decisions.
- Avoid exposing raw AI reasoning or unnecessary child data.

**Done when:**

- Every report number links back to stored sessions or progress events.
- Parents can control delivery preferences and access only their children.

### [ ] BM-202 English Six-Dimension Rubrics

**Priority:** P2 | **Effort:** XL | **Dependencies:** BM-005, BM-301

**Scope:**

- Grade Writing and speaking-derived text on Grammar, Structure, Relevance,
  Vocabulary, Coherence, and Creativity.
- Define age-appropriate anchored score bands for each dimension.
- Support track-specific rules for grammar, vocabulary, literature, writing, and
  reading comprehension.
- Detect copied/template answers where originality matters.
- Store dimension scores separately and show one actionable improvement at a time.
- Build a teacher-labelled English evaluation set.

**Done when:**

- Dimension scores are calibrated against teacher judgements.
- Reports show trends per dimension without collapsing everything into one score.
- Novelty checks cannot independently fail a student without review.

### [ ] BM-203 Fresh English Passage Pipeline

**Priority:** P2 | **Effort:** L | **Dependencies:** BM-202, BM-301, BM-401

**Scope:**

- Generate or select unseen passages for higher comprehension stations.
- Store passage provenance, reading level, vocabulary profile, and generated
  question set.
- Validate answerability, safety, uniqueness, and curriculum fit before release.
- Cache approved passages so a grading request never depends on live generation.

**Done when:**

- Level 2, Level 3, Strengthen, and Revise can serve unseen approved passages.
- Every question can be answered solely from its passage and approved context.

### [ ] BM-204 English Weekly Parent Report

**Priority:** P2 | **Effort:** M | **Dependencies:** BM-201, BM-202

**Scope:**

- Add trends for the six writing dimensions, grammar rules, vocabulary growth,
  comprehension, and recommended next practice.
- Show representative evidence without publishing a child's full answer by
  default.

**Done when:**

- The English report is explainable from stored dimension-level evidence.

## P2: Content Operations

### [ ] BM-301 Reproducible Content Ingestion

**Priority:** P2 | **Effort:** XL | **Dependencies:** BM-006

**Why:** Production currently contains 172 concepts and 10,079 questions, but the
repository does not fully reproduce that corpus.

**Scope:**

- Define versioned source files and schemas for subjects, chapters, concepts,
  questions, options, rubrics, and key concepts.
- Add validation for IDs, answer keys, duplicate questions, station coverage,
  weak-tag coverage, and reading level.
- Generate deterministic migrations or idempotent ingestion jobs.
- Track content version, reviewer, source/provenance, and publication state.
- Add a staging/preview workflow before production publication.

**Done when:**

- A clean database can recreate the approved production curriculum.
- Invalid content cannot be published.
- Every production question has provenance and review metadata.

## AI and RAG Track

### [ ] BM-401 RAG Source Library and pgvector Foundation

**Priority:** P2 | **Effort:** M | **Dependencies:** BM-301

**Scope:**

- Enable `pgvector` in Neon.
- Add `source_documents`, `source_chunks`, and `retrieval_events`.
- Store board, grade, subject, chapter, concept, source version, rights, and hash.
- Use section-aware chunks and `text-embedding-3-small` or a reviewed equivalent.
- Add metadata-filtered cosine retrieval and an HNSW index.
- Keep student answers out of the shared curriculum vector index.

**Done when:**

- Approved curriculum sources can be ingested, versioned, retrieved, and cited.
- Re-ingestion is idempotent and changed sources invalidate stale chunks.

### [ ] BM-402 Hybrid Retrieval and Evaluation

**Priority:** P2 | **Effort:** L | **Dependencies:** BM-401

**Scope:**

- Combine metadata filters, Postgres full-text search, and vector similarity.
- Retrieve a broad candidate set, then rerank to a small evidence set.
- Log query, filters, chunk IDs, scores, latency, and source version.
- Build retrieval evaluations for recall-at-k, answerability, and groundedness.
- Cache common retrieval by concept, task, and source version.

**Done when:**

- Evaluation demonstrates that approved evidence is retrieved reliably.
- Every generated or graded result can cite the exact source chunks used.

### [ ] BM-403 Grounded Grading Pilot

**Priority:** P2 | **Effort:** L | **Dependencies:** BM-005, BM-402

**Scope:**

- Pilot RAG on a limited set of open-answer concepts.
- Keep question rubrics and key concepts as the scoring authority.
- Use retrieved text only as supporting curriculum evidence.
- Compare grounded and current grading against teacher labels.
- Add confidence thresholds and manual review for disagreement.

**Done when:**

- Grounded grading improves teacher agreement or reduces unsupported feedback.
- It does not increase false weak tags, latency, or cost beyond agreed limits.

### [ ] BM-404 Grounded Hints and Remediation

**Priority:** P3 | **Effort:** M | **Dependencies:** BM-402

**Scope:**

- Generate hints, explanations, and remediation prompts from approved evidence.
- Never reveal the full answer before submission.
- Cite the source section in teacher/admin views.
- Cache approved outputs and provide a content-review workflow.

**Done when:**

- Hints are relevant, curriculum-grounded, and do not leak answer keys.

## New Product Ideas

### [ ] BM-501 Teacher Review Inbox

Route low-confidence, provider-failed, or model-disagreement grades to a compact
review screen. Teacher corrections should become labelled evaluation data rather
than silently changing model behavior.

### [ ] BM-502 Learning Evidence Timeline

Give parents and older students a chronological explanation of why mastery
changed: attempt, Fix, clean retry, decay, recall, and Strengthen. This makes the
EMA and queues understandable without exposing implementation details.

### [ ] BM-503 Content Health Dashboard

Flag questions with unusually high failure rates, weak distractors, grading
disagreement, ambiguous rubrics, missing tags, or excessive skips. This is likely
more valuable than generating more content before the existing bank is measured.

### [ ] BM-504 Confidence-Aware AI Routing

Use the cheapest validated model for routine answers, escalate ambiguous cases to
a stronger model, and send unresolved disagreement to review. Optimize against
teacher agreement, not model prestige.

### [ ] BM-505 Cost and Quality Budget

Track AI spend, latency, retry rate, teacher agreement, and false weak-tag rate by
provider/model/prompt version. Set launch limits and alerts before usage grows.

## Decisions Recorded

- BrainMaps remains an assessment engine; RAG supports evidence and feedback but
  does not own answer keys, progression, or mastery rules.
- Use Neon Postgres plus pgvector before introducing a separate vector service.
- Strengthen is voluntary and must not gate Revise.
- AI/provider failure must never be converted into a student weakness.
- Student data and minors' answers require paid contractual API terms and a
  privacy review before production scale.
