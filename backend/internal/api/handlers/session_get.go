package handlers

import (
	"context"
	"encoding/json"
	"fmt"
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
	tokenHash, ok := requestSessionTokenHash(r)
	if !ok {
		http.Error(w, "session not found", http.StatusNotFound)
		return
	}

	var studentID, conceptID string
	var score *float64

	err := db.Pool.QueryRow(r.Context(), `
		SELECT student_id, concept_id, score
		FROM sessions WHERE id = $1 AND access_token_hash = $2
	`, sessionID, tokenHash).Scan(&studentID, &conceptID, &score)
	if err != nil {
		http.Error(w, "session not found", http.StatusNotFound)
		return
	}

	// Count open answers that an AI provider hasn't graded yet. This MUST match the
	// grader's filter (grade.GradeOpenAnswers) — every non-MCQ answer with text
	// — or polling stops early for the newer types (GENERATIVE_PRODUCTION, etc.)
	// and the results screen freezes on the provisional MCQ-only score.
	var ungradedCount int
	db.Pool.QueryRow(r.Context(), `
		SELECT COUNT(*) FROM session_answers
		WHERE session_id    = $1
		  AND question_type <> 'MCQ'
		  AND student_text  IS NOT NULL
		  AND ai_graded_at  IS NULL
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

	// The station gate can demote, never promote: a high-scoring retry that
	// missed its targeted weak tags stays needs_fixing and must not show as
	// passed. Only checked once grading (and thus the recompute) is final.
	passed := currentScore >= 0.80
	if ungradedCount == 0 {
		passed = passed && stationCleared(r.Context(), sessionID)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(models.CompleteSessionResp{
		SessionID:       sessionID,
		Score:           currentScore,
		Passed:          passed,
		NewState:        state,
		AIGrading:       ungradedCount > 0,
		ReviewAvailable: ungradedCount == 0,
	})
}

// stationCleared reports whether the session's station column reads 'done' —
// i.e. recomputeSession passed the (tag-gated) outcome for this attempt.
func stationCleared(ctx context.Context, sessionID string) bool {
	var studentID, conceptID, station string
	if db.Pool.QueryRow(ctx, `
		SELECT student_id, concept_id, station FROM sessions WHERE id = $1
	`, sessionID).Scan(&studentID, &conceptID, &station) != nil {
		return false
	}
	col := levelStateCol(station)
	if col == "" {
		return false
	}
	var state string
	if db.Pool.QueryRow(ctx, fmt.Sprintf(
		`SELECT %s FROM concept_progress WHERE student_id = $1 AND concept_id = $2`, col,
	), studentID, conceptID).Scan(&state) != nil {
		return false
	}
	return state == "done"
}
