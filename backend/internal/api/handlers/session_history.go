package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	authmw "github.com/ani1238/brainmaps-api/internal/api/middleware"
	"github.com/ani1238/brainmaps-api/internal/db"
	"github.com/ani1238/brainmaps-api/internal/models"
	"github.com/go-chi/chi/v5"
)

// PastSession is a single completed attempt in a concept's history.
type PastSession struct {
	SessionID   string    `json:"sessionId"`
	Station     string    `json:"station"`
	Score       float64   `json:"score"`
	CompletedAt time.Time `json:"completedAt"`
}

// GET /concepts/{id}/sessions?level=level1
// Lists the authenticated student's completed attempts for a concept, newest
// first. An optional ?level filters to a single station. Unlike the per-session
// review endpoint this is student-authenticated (the access token for an old
// session is no longer held by the client), so ownership is checked against the
// JWT student rather than the session token.
func ListConceptSessions(w http.ResponseWriter, r *http.Request) {
	studentID, ok := authmw.StudentForUser(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	conceptID := chi.URLParam(r, "id")
	if conceptID == "" {
		http.Error(w, "concept is required", http.StatusBadRequest)
		return
	}
	level := strings.TrimSpace(r.URL.Query().Get("level"))

	rows, err := db.Query(r.Context(), `
		SELECT id, station, COALESCE(score, 0), completed_at
		FROM sessions
		WHERE student_id = $1
		  AND concept_id = $2
		  AND completed_at IS NOT NULL
		  AND ($3 = '' OR station = $3)
		ORDER BY completed_at DESC
		LIMIT 30
	`, studentID, conceptID, level)
	if err != nil {
		http.Error(w, "could not load sessions", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	out := []PastSession{}
	for rows.Next() {
		var ps PastSession
		if err := rows.Scan(&ps.SessionID, &ps.Station, &ps.Score, &ps.CompletedAt); err != nil {
			http.Error(w, "could not load sessions", http.StatusInternalServerError)
			return
		}
		out = append(out, ps)
	}
	if err := rows.Err(); err != nil {
		http.Error(w, "could not load sessions", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(out)
}

// GET /sessions/{id}/report
// Student-authenticated review of any of the learner's own completed sessions,
// used to revisit previous reports from the history list. Mirrors the payload
// of the token-gated GetSessionReview but authorizes by JWT student ownership.
func GetSessionReportByStudent(w http.ResponseWriter, r *http.Request) {
	studentID, ok := authmw.StudentForUser(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	sessionID := chi.URLParam(r, "id")

	// Ownership + completion check, scoped to the authenticated student.
	var owned bool
	if err := db.QueryRow(r.Context(), `
		SELECT EXISTS(
			SELECT 1 FROM sessions
			WHERE id = $1 AND student_id = $2 AND completed_at IS NOT NULL
		)
	`, sessionID, studentID).Scan(&owned); err != nil || !owned {
		http.Error(w, "session not found", http.StatusNotFound)
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

// loadSessionReview assembles a full SessionReview (header + per-answer keys and
// feedback) for a completed session, regardless of how the caller authorized.
// Returns found=false when the session does not exist or isn't complete.
func loadSessionReview(ctx context.Context, sessionID string) (models.SessionReview, bool, error) {
	var review models.SessionReview
	var score *float64
	err := db.QueryRow(ctx, `
		SELECT s.id, s.concept_id, c.name, s.station, s.score
		FROM sessions s
		JOIN concepts c ON c.id = s.concept_id
		WHERE s.id = $1 AND s.completed_at IS NOT NULL
	`, sessionID).Scan(
		&review.SessionID,
		&review.ConceptID,
		&review.ConceptName,
		&review.Station,
		&score,
	)
	if err != nil {
		return models.SessionReview{}, false, nil
	}
	if score != nil {
		review.Score = *score
	}

	kcDescriptions := keyConceptDescriptions(ctx, review.ConceptID)

	rows, err := db.Query(ctx, `
		SELECT
			sa.question_id,
			q.type,
			q.text,
			COALESCE(sa.student_text, ''),
			COALESCE(sa.chosen_option::text, ''),
			COALESCE(chosen.text, ''),
			sa.is_correct,
			sa.ai_score,
			COALESCE(sa.ai_feedback, ''),
			COALESCE(correct.option_key::text, ''),
			COALESCE(correct.text, ''),
			COALESCE(q.explanation, ''),
			COALESCE(q.rubric_hint, ''),
			COALESCE(q.key_concepts, '{}'::text[]),
			CASE WHEN q.payload = '{}'::jsonb THEN NULL ELSE q.payload END,
			sa.answer_payload
		FROM session_answers sa
		JOIN questions q ON q.id = sa.question_id
		LEFT JOIN mcq_options chosen
		  ON chosen.question_id = sa.question_id
		 AND chosen.option_key = sa.chosen_option
		LEFT JOIN LATERAL (
			SELECT option_key, text
			FROM mcq_options
			WHERE question_id = sa.question_id AND is_correct
			ORDER BY option_key
			LIMIT 1
		) correct ON true
		WHERE sa.session_id = $1
		ORDER BY sa.answered_at, sa.id
	`, sessionID)
	if err != nil {
		return models.SessionReview{}, false, err
	}
	defer rows.Close()

	for rows.Next() {
		var answer models.SessionReviewAnswer
		var chosenKey, chosenText, correctKey, correctText string
		var explanation, rubricHint string
		var keyConcepts []string
		if err := rows.Scan(
			&answer.QuestionID,
			&answer.QuestionType,
			&answer.QuestionText,
			&answer.StudentAnswer,
			&chosenKey,
			&chosenText,
			&answer.IsCorrect,
			&answer.Score,
			&answer.Feedback,
			&correctKey,
			&correctText,
			&explanation,
			&rubricHint,
			&keyConcepts,
			&answer.Payload,
			&answer.AnswerPayload,
		); err != nil {
			return models.SessionReview{}, false, err
		}

		if chosenKey != "" {
			answer.StudentAnswer = strings.ToUpper(chosenKey) + ". " + chosenText
		}
		if correctKey != "" {
			answer.CorrectAnswer = strings.ToUpper(correctKey) + ". " + correctText
		}
		answer.Explanation = explanation
		answer.AnswerGuide = buildAnswerGuide(rubricHint, keyConcepts, kcDescriptions)
		review.Answers = append(review.Answers, answer)
	}
	if err := rows.Err(); err != nil {
		return models.SessionReview{}, false, err
	}

	return review, true, nil
}
