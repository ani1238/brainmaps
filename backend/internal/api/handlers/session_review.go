package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/ani1238/brainmaps-api/internal/db"
	"github.com/go-chi/chi/v5"
)

// GET /sessions/{id}/review
// Returns answer keys and grading feedback only after the secured session is
// complete and every open answer has finished grading.
func GetSessionReview(w http.ResponseWriter, r *http.Request) {
	sessionID := chi.URLParam(r, "id")
	tokenHash, ok := requestSessionTokenHash(r)
	if !ok {
		http.Error(w, "session not found", http.StatusNotFound)
		return
	}

	var owned bool
	if err := db.QueryRow(r.Context(), `
		SELECT EXISTS(
			SELECT 1 FROM sessions
			WHERE id = $1 AND access_token_hash = $2 AND completed_at IS NOT NULL
		)
	`, sessionID, tokenHash).Scan(&owned); err != nil || !owned {
		http.Error(w, "session not found", http.StatusNotFound)
		return
	}

	var ungraded int
	if err := db.QueryRow(r.Context(), `
		SELECT COUNT(*)
		FROM session_answers
		WHERE session_id = $1
		  AND question_type NOT IN ('MCQ','STORY_MCQ','HOTS_MCQ','ASSERTION_REASON')
		  AND student_text IS NOT NULL
		  AND ai_graded_at IS NULL
	`, sessionID).Scan(&ungraded); err != nil {
		http.Error(w, "could not load review", http.StatusInternalServerError)
		return
	}
	if ungraded > 0 {
		http.Error(w, "review is not ready", http.StatusConflict)
		return
	}

	review, found, err := loadSessionReview(r.Context(), sessionID)
	if err != nil {
		http.Error(w, "could not load review", http.StatusInternalServerError)
		return
	}
	if !found {
		http.Error(w, "session not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(review)
}
