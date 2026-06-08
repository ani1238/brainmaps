package handlers

import (
	"encoding/json"
	"net/http"

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
			nextDue                   interface{}
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

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(questions)
}
