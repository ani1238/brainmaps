package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"math/rand/v2"
	"net/http"
	"strings"
	"time"

	authmw "github.com/ani1238/brainmaps-api/internal/api/middleware"
	"github.com/ani1238/brainmaps-api/internal/db"
	"github.com/ani1238/brainmaps-api/internal/models"
	"github.com/ani1238/brainmaps-api/internal/qtypes"
	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
)

// derefStr dereferences a nullable string pointer, returning fallback if nil.
func derefStr(s *string, fallback string) string {
	if s == nil {
		return fallback
	}
	return *s
}

// GET /concepts?chapter=soc_chB&student=<uuid>
// Returns all concepts in a chapter with the student's progress overlay.
func GetConcepts(w http.ResponseWriter, r *http.Request) {
	chapterID := r.URL.Query().Get("chapter")
	studentID := r.URL.Query().Get("student")
	if chapterID == "" || studentID == "" {
		http.Error(w, "chapter and student are required", http.StatusBadRequest)
		return
	}
	if !authmw.AuthorizeStudent(r, studentID) {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	rows, err := db.Query(r.Context(), `
		SELECT c.id, c.subject_key, c.chapter_id, c.name, c.order_idx,
		       cp.ema_score, cp.state,
		       cp.l1_state, cp.l2_state, cp.l3_state,
		       cp.strengthen_state, cp.revise_state, cp.revise_unlocked,
		       cp.total_attempts, cp.last_session_at,
		       rs.interval_days, rs.next_due_at, rs.last_done_at
		FROM concepts c
		LEFT JOIN concept_progress cp
		       ON cp.concept_id = c.id AND cp.student_id = $2
		LEFT JOIN revise_schedule rs
		       ON rs.concept_id = c.id AND rs.student_id = $2
		WHERE c.chapter_id = $1
		ORDER BY c.order_idx
	`, chapterID, studentID)
	if err != nil {
		serverErr(w, err)
		return
	}
	defer rows.Close()

	var result []models.ConceptWithProgress
	for rows.Next() {
		var cwp models.ConceptWithProgress
		var (
			emaScore                  *float64
			state                     *models.MasteryState
			l1s, l2s, l3s, strS, revS *string
			revUnlocked               *bool
			attempts                  *int
			lastAt                    interface{}
			intervalDays              *int
			nextDue                   *time.Time
			lastDone                  *time.Time
		)
		if err := rows.Scan(
			&cwp.ID, &cwp.SubjectKey, &cwp.ChapterID, &cwp.Name, &cwp.OrderIdx,
			&emaScore, &state,
			&l1s, &l2s, &l3s, &strS, &revS, &revUnlocked,
			&attempts, &lastAt,
			&intervalDays, &nextDue, &lastDone,
		); err != nil {
			serverErr(w, err)
			return
		}

		if emaScore != nil {
			ru := false
			if revUnlocked != nil {
				ru = *revUnlocked
			}
			cwp.Progress = &models.ConceptProgress{
				StudentID:       studentID,
				ConceptID:       cwp.ID,
				EMAScore:        *emaScore,
				State:           *state,
				L1State:         models.StationState(derefStr(l1s, "current")),
				L2State:         models.StationState(derefStr(l2s, "locked")),
				L3State:         models.StationState(derefStr(l3s, "locked")),
				StrengthenState: models.StationState(derefStr(strS, "locked")),
				ReviseState:     models.StationState(derefStr(revS, "locked")),
				ReviseUnlocked:  ru,
				TotalAttempts:   *attempts,
			}
		}
		if intervalDays != nil && nextDue != nil {
			cwp.ReviseSchedule = &models.ReviseSchedule{
				StudentID:    studentID,
				ConceptID:    cwp.ID,
				IntervalDays: *intervalDays,
				NextDueAt:    *nextDue,
				LastDoneAt:   lastDone,
			}
		}

		result = append(result, cwp)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// ConceptDetailResp is the single-concept payload used by the question screens.
type ConceptDetailResp struct {
	ID             string                  `json:"id"`
	SubjectKey     string                  `json:"subjectKey"`
	ChapterID      string                  `json:"chapterId"`
	ChapterName    string                  `json:"chapterName"`
	ChapterNumber  int                     `json:"chapterNumber"`
	Name           string                  `json:"name"`
	Recap          string                  `json:"recap"`
	Progress       *models.ConceptProgress `json:"progress,omitempty"`
	ReviseSchedule *models.ReviseSchedule  `json:"reviseSchedule,omitempty"`
}

// GET /concepts/{id}?student=<uuid>
// Returns a single concept's display details (name, subject, chapter, recap)
// plus the student's progress overlay when a student is supplied.
func GetConcept(w http.ResponseWriter, r *http.Request) {
	conceptID := chi.URLParam(r, "id")
	studentID := r.URL.Query().Get("student")
	if studentID != "" && !authmw.AuthorizeStudent(r, studentID) {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	var (
		resp                      ConceptDetailResp
		recap                     *string
		emaScore                  *float64
		state                     *models.MasteryState
		l1s, l2s, l3s, strS, revS *string
		revUnlocked               *bool
		attempts                  *int
		intervalDays              *int
		nextDue                   *time.Time
		lastDone                  *time.Time
	)

	err := db.QueryRow(r.Context(), `
		SELECT c.id, c.subject_key, c.chapter_id, c.name,
		       ch.name, ch.number,
		       c.metadata->>'recap_summary' AS recap,
		       cp.ema_score, cp.state,
		       cp.l1_state, cp.l2_state, cp.l3_state,
		       cp.strengthen_state, cp.revise_state, cp.revise_unlocked,
		       cp.total_attempts,
		       rs.interval_days, rs.next_due_at, rs.last_done_at
		FROM concepts c
		JOIN chapters ch ON ch.id = c.chapter_id
		LEFT JOIN concept_progress cp
		       ON cp.concept_id = c.id AND cp.student_id = $2
		LEFT JOIN revise_schedule rs
		       ON rs.concept_id = c.id AND rs.student_id = $2
		WHERE c.id = $1
	`, conceptID, studentID).Scan(
		&resp.ID, &resp.SubjectKey, &resp.ChapterID, &resp.Name,
		&resp.ChapterName, &resp.ChapterNumber,
		&recap,
		&emaScore, &state,
		&l1s, &l2s, &l3s, &strS, &revS, &revUnlocked,
		&attempts,
		&intervalDays, &nextDue, &lastDone,
	)
	if err != nil {
		http.Error(w, "concept not found", http.StatusNotFound)
		return
	}

	resp.Recap = derefStr(recap, "")

	if emaScore != nil {
		ru := false
		if revUnlocked != nil {
			ru = *revUnlocked
		}
		at := 0
		if attempts != nil {
			at = *attempts
		}
		resp.Progress = &models.ConceptProgress{
			StudentID:       studentID,
			ConceptID:       resp.ID,
			EMAScore:        *emaScore,
			State:           *state,
			L1State:         models.StationState(derefStr(l1s, "current")),
			L2State:         models.StationState(derefStr(l2s, "locked")),
			L3State:         models.StationState(derefStr(l3s, "locked")),
			StrengthenState: models.StationState(derefStr(strS, "locked")),
			ReviseState:     models.StationState(derefStr(revS, "locked")),
			ReviseUnlocked:  ru,
			TotalAttempts:   at,
		}
	}
	if intervalDays != nil && nextDue != nil {
		resp.ReviseSchedule = &models.ReviseSchedule{
			StudentID:    studentID,
			ConceptID:    resp.ID,
			IntervalDays: *intervalDays,
			NextDueAt:    *nextDue,
			LastDoneAt:   lastDone,
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// GET /concepts/{id}/questions?level=level1
func GetConceptQuestions(w http.ResponseWriter, r *http.Request) {
	conceptID := chi.URLParam(r, "id")
	level := r.URL.Query().Get("level")
	if level == "" {
		http.Error(w, "level is required", http.StatusBadRequest)
		return
	}
	if student := r.URL.Query().Get("student"); student != "" && !authmw.AuthorizeStudent(r, student) {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	rows, err := db.Query(r.Context(), `
		SELECT q.id, q.type, q.level, q.text, q.explanation, q.rubric_hint,
		       COALESCE(q.rubric_points, '{}'::text[]),
		       COALESCE(q.key_points, '{}'::text[]),
		       q.recall_guide, q.preamble,
		       q.key_concepts, q.payload,
		       o.option_key, o.text AS option_text, o.is_correct
		FROM questions q
		LEFT JOIN mcq_options o ON o.question_id = q.id
		WHERE q.concept_id = $1 AND q.level = $2 AND q.is_active
		ORDER BY q.id, o.option_key
	`, conceptID, level)
	if err != nil {
		serverErr(w, err)
		return
	}
	defer rows.Close()

	questions, err := scanQuestionRows(rows, conceptID)
	if err != nil {
		serverErr(w, err)
		return
	}

	// Shuffle once so equally-ranked questions (same type, same tag) vary
	// between attempts — a retry stays focused on the weak tags but isn't a
	// verbatim repeat. The selection functions themselves stay deterministic
	// so they remain unit-testable.
	rand.Shuffle(len(questions), func(i, j int) {
		questions[i], questions[j] = questions[j], questions[i]
	})

	// Every attempt is compact and varied. Retries additionally focus on the
	// student's worst active weak tags; revise sessions silently re-test
	// recently cleared ones (spaced recheck).
	selected := selectDiverseQuestions(questions, nil, 6)
	if student := r.URL.Query().Get("student"); student != "" {
		if col := levelStateCol(level); col != "" {
			var state string
			err := db.QueryRow(r.Context(), fmt.Sprintf(
				`SELECT %s FROM concept_progress WHERE student_id = $1 AND concept_id = $2`, col,
			), student, conceptID).Scan(&state)
			if err == nil && state == "needs_fixing" {
				rankedTags := activeTagsRanked(r.Context(), student, conceptID)
				recent := latestAttemptQuestionIDs(r, student, conceptID, level)
				if recent == nil {
					recent = make(map[string]bool)
				}
				previousOrder := r.URL.Query()["exclude"]
				for _, questionID := range previousOrder {
					if questionID != "" {
						recent[questionID] = true
					}
				}
				selected = selectRetryQuestions(questions, rankedTags, recent)
				selected = ensureDifferentAttempt(selected, questions, previousOrder)
			}
		}

		if level == "revise" {
			if clearedTags := recentlyClearedTags(r.Context(), student, conceptID); len(clearedTags) > 0 {
				candidates := recheckCandidates(r.Context(), conceptID, clearedTags)
				recent := latestAttemptQuestionIDs(r, student, conceptID, level)
				selected = injectRecheckQuestions(selected, candidates, clearedTags, recent)
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(activeQuestions(selected))
}

func activeQuestions(questions []models.Question) []models.ActiveQuestion {
	result := make([]models.ActiveQuestion, 0, len(questions))
	for _, question := range questions {
		active := models.ActiveQuestion{
			ID:          question.ID,
			ConceptID:   question.ConceptID,
			Type:        question.Type,
			Level:       question.Level,
			Text:        question.Text,
			RecallGuide: question.RecallGuide,
			Preamble:    question.Preamble,
		}
		if len(question.Payload) > 0 {
			if safe, err := qtypes.Sanitize(question.Type, question.Payload); err == nil {
				active.Payload = safe
			}
		}
		for _, option := range question.Options {
			active.Options = append(active.Options, models.ActiveMCQOption{
				Key:  option.Key,
				Text: option.Text,
			})
		}
		result = append(result, active)
	}
	return result
}

// scanQuestionRows assembles Question models (with their MCQ options) from a
// questions ⋈ mcq_options result set ordered by question id, option key.
func scanQuestionRows(rows pgx.Rows, conceptID string) ([]models.Question, error) {
	qMap := make(map[string]*models.Question)
	var order []string

	for rows.Next() {
		var (
			qID, qType, qLevel, qText string
			explanation, rubricHint   *string
			rubricPoints, keyPoints   []string
			recallGuide, preamble     *string
			keyConcepts               []string
			payload                   json.RawMessage
			optKey, optText           *string
			isCorrect                 *bool
		)
		if err := rows.Scan(
			&qID, &qType, &qLevel, &qText, &explanation, &rubricHint,
			&rubricPoints, &keyPoints, &recallGuide, &preamble, &keyConcepts,
			&payload,
			&optKey, &optText, &isCorrect,
		); err != nil {
			return nil, err
		}

		if _, exists := qMap[qID]; !exists {
			qMap[qID] = &models.Question{
				ID:           qID,
				ConceptID:    conceptID,
				Type:         models.QuestionType(qType),
				Level:        models.QuestionLevel(qLevel),
				Text:         qText,
				Explanation:  explanation,
				RubricHint:   rubricHint,
				RubricPoints: rubricPoints,
				KeyPoints:    keyPoints,
				RecallGuide:  recallGuide,
				Preamble:     preamble,
				KeyConcepts:  keyConcepts,
				Payload:      payload,
			}
			order = append(order, qID)
		}

		if optKey != nil {
			qMap[qID].Options = append(qMap[qID].Options, models.MCQOption{
				Key:       *optKey,
				Text:      *optText,
				IsCorrect: *isCorrect,
			})
		}
	}

	questions := make([]models.Question, 0, len(order))
	for _, id := range order {
		questions = append(questions, *qMap[id])
	}
	return questions, nil
}

// activeTagsRanked returns the student's active weak tags worst-first.
// Keep the ordering in sync with activeWeakTags in the grade package, which
// uses the same ranking for the tag-gated pass decision.
func activeTagsRanked(ctx context.Context, studentID, conceptID string) []string {
	rows, err := db.Query(ctx, `
		SELECT tag FROM student_weak_concepts
		WHERE student_id = $1 AND concept_id = $2 AND status = 'active'
		ORDER BY wrong_count DESC, last_seen_at DESC
	`, studentID, conceptID)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var tags []string
	for rows.Next() {
		var t string
		if rows.Scan(&t) == nil {
			tags = append(tags, t)
		}
	}
	return tags
}

// recentlyClearedTags returns up to two weak tags the student cleared in the
// last 30 days — revise sessions silently re-test them (spaced recheck).
func recentlyClearedTags(ctx context.Context, studentID, conceptID string) []string {
	rows, err := db.Query(ctx, `
		SELECT tag FROM student_weak_concepts
		WHERE student_id = $1 AND concept_id = $2 AND status = 'cleared'
		  AND cleared_at > now() - interval '30 days'
		ORDER BY cleared_at DESC
		LIMIT 2
	`, studentID, conceptID)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var tags []string
	for rows.Next() {
		var t string
		if rows.Scan(&t) == nil {
			tags = append(tags, t)
		}
	}
	return tags
}

// recheckCandidates loads questions across ALL levels of the concept whose
// key_concepts match any cleared tag — cleared weaknesses usually live on
// lower-level questions than the revise set itself.
func recheckCandidates(ctx context.Context, conceptID string, tags []string) []models.Question {
	rows, err := db.Query(ctx, `
		SELECT q.id, q.type, q.level, q.text, q.explanation, q.rubric_hint,
		       COALESCE(q.rubric_points, '{}'::text[]),
		       COALESCE(q.key_points, '{}'::text[]),
		       q.recall_guide, q.preamble,
		       q.key_concepts, q.payload,
		       o.option_key, o.text AS option_text, o.is_correct
		FROM questions q
		LEFT JOIN mcq_options o ON o.question_id = q.id
		WHERE q.concept_id = $1
		  AND q.is_active
		  AND EXISTS (SELECT 1 FROM unnest(q.key_concepts) kc WHERE lower(trim(kc)) = ANY($2))
		ORDER BY q.id, o.option_key
	`, conceptID, tags)
	if err != nil {
		return nil
	}
	defer rows.Close()

	questions, err := scanQuestionRows(rows, conceptID)
	if err != nil {
		return nil
	}
	return questions
}

func latestAttemptQuestionIDs(r *http.Request, studentID, conceptID, level string) map[string]bool {
	rows, err := db.Query(r.Context(), `
		SELECT sa.question_id
		FROM session_answers sa
		WHERE sa.session_id = (
			SELECT id
			FROM sessions
			WHERE student_id = $1
			  AND concept_id = $2
			  AND station = $3
			  AND completed_at IS NOT NULL
			ORDER BY completed_at DESC
			LIMIT 1
		)
	`, studentID, conceptID, level)
	if err != nil {
		return nil
	}
	defer rows.Close()

	recent := make(map[string]bool)
	for rows.Next() {
		var questionID string
		if rows.Scan(&questionID) == nil {
			recent[questionID] = true
		}
	}
	return recent
}

// levelStateCol maps a question level to its concept_progress station column.
func levelStateCol(level string) string {
	switch level {
	case "level1":
		return "l1_state"
	case "level2":
		return "l2_state"
	case "level3":
		return "l3_state"
	case "strengthen":
		return "strengthen_state"
	case "revise":
		return "revise_state"
	default:
		return ""
	}
}

// questionMatchesTag reports whether any of the question's key_concepts equals
// the (already normalized) tag.
func questionMatchesTag(q models.Question, tag string) bool {
	for _, kc := range q.KeyConcepts {
		if strings.ToLower(strings.TrimSpace(kc)) == tag {
			return true
		}
	}
	return false
}

// selectRetryQuestions builds a six-question adaptive retry set with per-tag
// slots. rankedTags is ordered worst-first (wrong_count DESC, last_seen_at
// DESC). The first (up to two) ranked tags with bank coverage become the
// focus: one focus tag gets 4 on-tag slots + 2 general; two get 3 + 2 + 1
// general. Tags without matching questions are skipped, promoting the next
// rank; a third active tag gets no dedicated slots until an earlier one
// clears, but its questions stay eligible for the general slots. With no
// focus tags at all, the set falls back to the plain diverse selection.
//
// FUTURE: when fewer than `quota` existing questions cover a focus tag, this
// is where we'll generate fresh AI questions targeting it instead of padding
// with unrelated ones — the rest of the pipeline already keys off
// key_concepts, so generated questions just need to be tagged the same way.
func selectRetryQuestions(all []models.Question, rankedTags []string, recent map[string]bool) []models.Question {
	const target = 6

	var focus []string
	for _, t := range rankedTags {
		tag := strings.ToLower(strings.TrimSpace(t))
		if tag == "" {
			continue
		}
		for _, q := range all {
			if questionMatchesTag(q, tag) {
				focus = append(focus, tag)
				break
			}
		}
		if len(focus) == 2 {
			break
		}
	}

	if len(focus) == 0 {
		var unseenRest, recentRest []models.Question
		for _, q := range all {
			if recent[q.ID] {
				recentRest = append(recentRest, q)
			} else {
				unseenRest = append(unseenRest, q)
			}
		}
		unseen := selectDiverseQuestionPools(target, unseenRest)
		return appendRecentQuestions(unseen, target, recentRest)
	}

	quotas := []int{4}
	if len(focus) == 2 {
		quotas = []int{3, 2}
	}

	picked := make(map[string]bool)
	out := make([]models.Question, 0, target)

	// take fills up to quota slots from questions satisfying match, unseen
	// first, preserving type variety within the group.
	take := func(quota int, match func(models.Question) bool) {
		if quota <= 0 {
			return
		}
		var unseenPool, recentPool []models.Question
		for _, q := range all {
			if picked[q.ID] || !match(q) {
				continue
			}
			if recent[q.ID] {
				recentPool = append(recentPool, q)
			} else {
				unseenPool = append(unseenPool, q)
			}
		}
		got := appendRecentQuestions(selectDiverseQuestionPools(quota, unseenPool), quota, recentPool)
		for _, q := range got {
			picked[q.ID] = true
			out = append(out, q)
		}
	}

	// Per-tag slots. A question matching both focus tags is consumed by the
	// first tag only (the picked guard).
	for i, tag := range focus {
		tag := tag
		take(quotas[i], func(q models.Question) bool { return questionMatchesTag(q, tag) })
	}

	// General slots: confirm the rest of the level with off-focus questions.
	take(target-len(out), func(q models.Question) bool {
		for _, tag := range focus {
			if questionMatchesTag(q, tag) {
				return false
			}
		}
		return true
	})

	// Small banks: pad with whatever remains to keep the retry meaningful.
	take(target-len(out), func(models.Question) bool { return true })

	return out
}

// injectRecheckQuestions swaps trailing questions in selected for one
// candidate per cleared tag — the spaced recheck. Questions already in the
// set are skipped and unseen candidates are preferred. A missed recheck flips
// its tag back to active via the grading lifecycle; no handling needed here.
func injectRecheckQuestions(selected, candidates []models.Question, clearedTags []string, recent map[string]bool) []models.Question {
	if len(selected) == 0 || len(candidates) == 0 || len(clearedTags) == 0 {
		return selected
	}

	present := make(map[string]bool, len(selected))
	for _, q := range selected {
		present[q.ID] = true
	}

	out := append([]models.Question(nil), selected...)
	slot := len(out) - 1
	for _, t := range clearedTags {
		if slot < 0 {
			break
		}
		tag := strings.ToLower(strings.TrimSpace(t))
		idx := -1
		for i, q := range candidates {
			if present[q.ID] || !questionMatchesTag(q, tag) {
				continue
			}
			if !recent[q.ID] {
				idx = i
				break
			}
			if idx == -1 {
				idx = i
			}
		}
		if idx == -1 {
			continue
		}
		delete(present, out[slot].ID)
		present[candidates[idx].ID] = true
		out[slot] = candidates[idx]
		slot--
	}
	return out
}

// ensureDifferentAttempt prevents an identical retry. Repeats are allowed when
// the pool is small, but the next attempt must replace at least one question or
// present the same small pool in a different order.
func ensureDifferentAttempt(selected, all []models.Question, previous []string) []models.Question {
	if len(selected) < 2 || len(selected) != len(previous) {
		return selected
	}
	for i, q := range selected {
		if q.ID != previous[i] {
			return selected
		}
	}

	previousSet := make(map[string]bool, len(previous))
	for _, id := range previous {
		previousSet[id] = true
	}
	for _, candidate := range all {
		if !previousSet[candidate.ID] {
			out := append([]models.Question(nil), selected...)
			out[len(out)-1] = candidate
			return out
		}
	}

	out := append([]models.Question(nil), selected[1:]...)
	return append(out, selected[0])
}

func appendRecentQuestions(selected []models.Question, target int, recent ...[]models.Question) []models.Question {
	if len(selected) >= target {
		return selected
	}
	padding := selectDiverseQuestionPools(target-len(selected), recent...)
	return append(selected, padding...)
}

// selectDiverseQuestions selects from primary before fallback, taking one
// question per available type before repeating a type. This keeps sessions
// compact while exposing the student to the broadest available interaction mix.
func selectDiverseQuestions(primary, fallback []models.Question, target int) []models.Question {
	return selectDiverseQuestionPools(target, primary, fallback)
}

// selectDiverseQuestionPools preserves pool priority while maximizing type
// variety across all pools. Retry pools are ordered so unseen questions always
// win over questions from the latest attempt.
func selectDiverseQuestionPools(target int, pools ...[]models.Question) []models.Question {
	if target <= 0 {
		return []models.Question{}
	}

	total := 0
	for _, pool := range pools {
		total += len(pool)
	}
	out := make([]models.Question, 0, min(target, total))
	selected := make(map[string]bool)
	usedTypes := make(map[models.QuestionType]bool)

	for _, pool := range pools {
		for _, q := range pool {
			if len(out) >= target {
				return out
			}
			if !selected[q.ID] && !usedTypes[q.Type] {
				out = append(out, q)
				selected[q.ID] = true
				usedTypes[q.Type] = true
			}
		}
	}

	for _, pool := range pools {
		for _, q := range pool {
			if len(out) >= target {
				return out
			}
			if !selected[q.ID] {
				out = append(out, q)
				selected[q.ID] = true
			}
		}
	}
	return out
}
