package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/ani1238/brainmaps-api/internal/db"
	"github.com/ani1238/brainmaps-api/internal/models"
	"github.com/go-chi/chi/v5"
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

	rows, err := db.Pool.Query(r.Context(), `
		SELECT c.id, c.subject_key, c.chapter_id, c.name, c.order_idx,
		       cp.ema_score, cp.state,
		       cp.l1_state, cp.l2_state, cp.l3_state,
		       cp.strengthen_state, cp.revise_state, cp.revise_unlocked,
		       cp.total_attempts, cp.last_session_at,
		       rs.interval_days, rs.next_due_at
		FROM concepts c
		LEFT JOIN concept_progress cp
		       ON cp.concept_id = c.id AND cp.student_id = $2
		LEFT JOIN revise_schedule rs
		       ON rs.concept_id = c.id AND rs.student_id = $2
		WHERE c.chapter_id = $1
		ORDER BY c.order_idx
	`, chapterID, studentID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
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
		)
		if err := rows.Scan(
			&cwp.ID, &cwp.SubjectKey, &cwp.ChapterID, &cwp.Name, &cwp.OrderIdx,
			&emaScore, &state,
			&l1s, &l2s, &l3s, &strS, &revS, &revUnlocked,
			&attempts, &lastAt,
			&intervalDays, &nextDue,
		); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
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
			}
		}

		result = append(result, cwp)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// ConceptDetailResp is the single-concept payload used by the question screens.
type ConceptDetailResp struct {
	ID            string                  `json:"id"`
	SubjectKey    string                  `json:"subjectKey"`
	ChapterID     string                  `json:"chapterId"`
	ChapterName   string                  `json:"chapterName"`
	ChapterNumber int                     `json:"chapterNumber"`
	Name          string                  `json:"name"`
	Recap         string                  `json:"recap"`
	Progress      *models.ConceptProgress `json:"progress,omitempty"`
}

// GET /concepts/{id}?student=<uuid>
// Returns a single concept's display details (name, subject, chapter, recap)
// plus the student's progress overlay when a student is supplied.
func GetConcept(w http.ResponseWriter, r *http.Request) {
	conceptID := chi.URLParam(r, "id")
	studentID := r.URL.Query().Get("student")

	var (
		resp                      ConceptDetailResp
		recap                     *string
		emaScore                  *float64
		state                     *models.MasteryState
		l1s, l2s, l3s, strS, revS *string
		revUnlocked               *bool
		attempts                  *int
	)

	err := db.Pool.QueryRow(r.Context(), `
		SELECT c.id, c.subject_key, c.chapter_id, c.name,
		       ch.name, ch.number,
		       c.metadata->>'recap_summary' AS recap,
		       cp.ema_score, cp.state,
		       cp.l1_state, cp.l2_state, cp.l3_state,
		       cp.strengthen_state, cp.revise_state, cp.revise_unlocked,
		       cp.total_attempts
		FROM concepts c
		JOIN chapters ch ON ch.id = c.chapter_id
		LEFT JOIN concept_progress cp
		       ON cp.concept_id = c.id AND cp.student_id = $2
		WHERE c.id = $1
	`, conceptID, studentID).Scan(
		&resp.ID, &resp.SubjectKey, &resp.ChapterID, &resp.Name,
		&resp.ChapterName, &resp.ChapterNumber,
		&recap,
		&emaScore, &state,
		&l1s, &l2s, &l3s, &strS, &revS, &revUnlocked,
		&attempts,
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

	rows, err := db.Pool.Query(r.Context(), `
		SELECT q.id, q.type, q.level, q.text, q.explanation, q.rubric_hint, q.key_concepts,
		       o.option_key, o.text AS option_text, o.is_correct
		FROM questions q
		LEFT JOIN mcq_options o ON o.question_id = q.id
		WHERE q.concept_id = $1 AND q.level = $2
		ORDER BY q.id, o.option_key
	`, conceptID, level)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	qMap := make(map[string]*models.Question)
	var order []string

	for rows.Next() {
		var (
			qID, qType, qLevel, qText string
			explanation, rubricHint   *string
			keyConcepts               []string
			optKey, optText           *string
			isCorrect                 *bool
		)
		if err := rows.Scan(
			&qID, &qType, &qLevel, &qText, &explanation, &rubricHint, &keyConcepts,
			&optKey, &optText, &isCorrect,
		); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if _, exists := qMap[qID]; !exists {
			qMap[qID] = &models.Question{
				ID:          qID,
				ConceptID:   conceptID,
				Type:        models.QuestionType(qType),
				Level:       models.QuestionLevel(qLevel),
				Text:        qText,
				Explanation: explanation,
				RubricHint:  rubricHint,
				KeyConcepts: keyConcepts,
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

	// Every attempt is compact and varied. Retries additionally prioritize
	// questions whose key concepts overlap the student's recorded weaknesses.
	selected := selectDiverseQuestions(questions, nil, 6)
	if student := r.URL.Query().Get("student"); student != "" {
		if col := levelStateCol(level); col != "" {
			var state string
			var weak []string
			err := db.Pool.QueryRow(r.Context(), fmt.Sprintf(
				`SELECT %s, weak_concepts FROM concept_progress WHERE student_id = $1 AND concept_id = $2`, col,
			), student, conceptID).Scan(&state, &weak)
			if err == nil && state == "needs_fixing" {
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
				selected = selectRetryQuestions(questions, weak, recent)
				selected = ensureDifferentAttempt(selected, questions, previousOrder)
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(selected)
}

func latestAttemptQuestionIDs(r *http.Request, studentID, conceptID, level string) map[string]bool {
	rows, err := db.Pool.Query(r.Context(), `
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

// selectRetryQuestions builds a six-question adaptive retry set. Questions
// matching the student's weak concepts are selected first with as much type
// variety as possible, then non-matching questions pad any remaining slots.
//
// FUTURE: when fewer than `target` existing questions cover the weak concepts,
// this is where we'll generate fresh AI questions targeting `weak` instead of
// padding with unrelated ones — the rest of the pipeline already keys off
// key_concepts, so generated questions just need to be tagged the same way.
func selectRetryQuestions(all []models.Question, weak []string, recent map[string]bool) []models.Question {
	const target = 6

	weakSet := map[string]bool{}
	for _, w := range weak {
		if normalized := strings.ToLower(strings.TrimSpace(w)); normalized != "" {
			weakSet[normalized] = true
		}
	}

	var unseenMatched, unseenRest, recentMatched, recentRest []models.Question
	for _, q := range all {
		hit := false
		for _, kc := range q.KeyConcepts {
			normalized := strings.ToLower(strings.TrimSpace(kc))
			if normalized != "" && weakSet[normalized] {
				hit = true
				break
			}
		}
		switch {
		case hit && !recent[q.ID]:
			unseenMatched = append(unseenMatched, q)
		case !hit && !recent[q.ID]:
			unseenRest = append(unseenRest, q)
		case hit:
			recentMatched = append(recentMatched, q)
		default:
			recentRest = append(recentRest, q)
		}
	}

	if len(unseenMatched)+len(recentMatched) == 0 {
		unseen := selectDiverseQuestionPools(target, unseenRest)
		return appendRecentQuestions(unseen, target, recentRest)
	}

	unseen := selectDiverseQuestionPools(target, unseenMatched, unseenRest)
	return appendRecentQuestions(unseen, target, recentMatched, recentRest)
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
