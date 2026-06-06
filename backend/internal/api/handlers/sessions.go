package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/ani1238/brainmaps-api/internal/db"
	"github.com/ani1238/brainmaps-api/internal/grade"
	"github.com/ani1238/brainmaps-api/internal/models"
	"github.com/go-chi/chi/v5"
)

// POST /sessions
func StartSession(w http.ResponseWriter, r *http.Request) {
	var req models.StartSessionReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	var sessionID string
	err := db.Pool.QueryRow(r.Context(), `
		INSERT INTO sessions (student_id, concept_id, station)
		VALUES ($1, $2, $3)
		RETURNING id
	`, req.StudentID, req.ConceptID, req.Station).Scan(&sessionID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"sessionId": sessionID})
}

// POST /sessions/{id}/complete
// Saves all answers, gives instant MCQ feedback, fires async AI grading.
func CompleteSession(w http.ResponseWriter, r *http.Request) {
	sessionID := chi.URLParam(r, "id")

	var req models.CompleteSessionReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	// Verify session exists
	var studentID, conceptID string
	err := db.Pool.QueryRow(r.Context(), `
		SELECT student_id, concept_id FROM sessions WHERE id = $1 AND completed_at IS NULL
	`, sessionID).Scan(&studentID, &conceptID)
	if err != nil {
		http.Error(w, "session not found or already completed", http.StatusNotFound)
		return
	}

	// Insert answers, tally MCQ
	mcqCorrect, mcqTotal := 0, 0
	hasOpenAnswers := false

	for _, ans := range req.Answers {
		switch ans.QuestionType {
		case models.MCQ:
			if ans.ChosenOption == nil {
				continue
			}
			var correct bool
			db.Pool.QueryRow(r.Context(), `
				SELECT is_correct FROM mcq_options
				WHERE question_id = $1 AND option_key = $2
			`, ans.QuestionID, *ans.ChosenOption).Scan(&correct)

			db.Pool.Exec(r.Context(), `
				INSERT INTO session_answers
				  (session_id, question_id, question_type, chosen_option, is_correct)
				VALUES ($1, $2, $3, $4, $5)
			`, sessionID, ans.QuestionID, ans.QuestionType, ans.ChosenOption, correct)

			mcqTotal++
			if correct {
				mcqCorrect++
			}

		default: // DESCRIPTIVE, FEYNMAN, BLURT, ACTIVE_RECALL
			if ans.StudentText == nil || *ans.StudentText == "" {
				continue
			}
			db.Pool.Exec(r.Context(), `
				INSERT INTO session_answers
				  (session_id, question_id, question_type, student_text)
				VALUES ($1, $2, $3, $4)
			`, sessionID, ans.QuestionID, ans.QuestionType, ans.StudentText)
			hasOpenAnswers = true
		}
	}

	// Mark session completed with MCQ-only score for now
	mcqScore := 0.0
	if mcqTotal > 0 {
		mcqScore = float64(mcqCorrect) / float64(mcqTotal)
	}
	db.Pool.Exec(r.Context(), `
		UPDATE sessions
		SET completed_at = $1, mcq_correct = $2, mcq_total = $3, score = $4
		WHERE id = $5
	`, time.Now(), mcqCorrect, mcqTotal, mcqScore, sessionID)

	if hasOpenAnswers {
		// Async: grade open answers, then recompute EMA
		go grade.GradeOpenAnswers(sessionID)
	} else {
		// Pure MCQ session: recompute EMA inline (fast, no AI call needed)
		go grade.RecomputeSession(sessionID)
	}

	// Fetch updated state for the response (may still be "MCQ-only" until AI finishes)
	var state models.MasteryState = models.NotStarted
	db.Pool.QueryRow(r.Context(), `
		SELECT state FROM concept_progress WHERE student_id = $1 AND concept_id = $2
	`, studentID, conceptID).Scan(&state)

	// Include whatever feedback is available right now (MCQ wrong answers + explanations).
	// Open-answer feedback is added once Gemini finishes — the client polls GetSession for that.
	feedback := buildFeedback(r.Context(), sessionID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(models.CompleteSessionResp{
		SessionID: sessionID,
		Score:     mcqScore,
		Passed:    mcqScore >= 0.80,
		NewState:  state,
		AIGrading: hasOpenAnswers,
		Feedback:  feedback,
	})
}
