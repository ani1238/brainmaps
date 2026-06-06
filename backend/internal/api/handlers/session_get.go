package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/ani1238/brainmaps-api/internal/db"
	"github.com/ani1238/brainmaps-api/internal/models"
	"github.com/go-chi/chi/v5"
)

// GET /sessions/{id}
// Returns current score + whether AI grading is still in progress.
// The frontend polls this after CompleteSession when aiGrading=true.
func GetSession(w http.ResponseWriter, r *http.Request) {
	sessionID := chi.URLParam(r, "id")

	var studentID, conceptID string
	var score *float64

	err := db.Pool.QueryRow(r.Context(), `
		SELECT student_id, concept_id, score
		FROM sessions WHERE id = $1
	`, sessionID).Scan(&studentID, &conceptID, &score)
	if err != nil {
		http.Error(w, "session not found", http.StatusNotFound)
		return
	}

	// Count open answers that Gemini hasn't graded yet
	var ungradedCount int
	db.Pool.QueryRow(r.Context(), `
		SELECT COUNT(*) FROM session_answers
		WHERE session_id        = $1
		  AND question_type     IN ('DESCRIPTIVE','FEYNMAN','BLURT','ACTIVE_RECALL')
		  AND student_text      IS NOT NULL
		  AND ai_graded_at      IS NULL
	`, sessionID).Scan(&ungradedCount)

	// Current mastery state (updated after AI grading completes)
	var state models.MasteryState
	db.Pool.QueryRow(r.Context(), `
		SELECT state FROM concept_progress
		WHERE student_id = $1 AND concept_id = $2
	`, studentID, conceptID).Scan(&state)

	currentScore := 0.0
	if score != nil {
		currentScore = *score
	}

	// Build per-answer feedback (wrong MCQs + any Gemini-graded open answers so far)
	feedback := buildFeedback(r.Context(), sessionID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(models.CompleteSessionResp{
		SessionID: sessionID,
		Score:     currentScore,
		Passed:    currentScore >= 0.80,
		NewState:  state,
		AIGrading: ungradedCount > 0,
		Feedback:  feedback,
	})
}
