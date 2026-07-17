package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/ani1238/brainmaps-api/internal/db"
	"github.com/ani1238/brainmaps-api/internal/models"
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

	var review models.SessionReview
	var score *float64
	err := db.QueryRow(r.Context(), `
		SELECT s.id, s.concept_id, c.name, s.station, s.score
		FROM sessions s
		JOIN concepts c ON c.id = s.concept_id
		WHERE s.id = $1
		  AND s.access_token_hash = $2
		  AND s.completed_at IS NOT NULL
	`, sessionID, tokenHash).Scan(
		&review.SessionID,
		&review.ConceptID,
		&review.ConceptName,
		&review.Station,
		&score,
	)
	if err != nil {
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

	if score != nil {
		review.Score = *score
	}

	kcDescriptions := keyConceptDescriptions(r.Context(), review.ConceptID)

	rows, err := db.Query(r.Context(), `
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
			COALESCE(q.key_concepts, '{}'::text[])
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
		http.Error(w, "could not load review", http.StatusInternalServerError)
		return
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
		); err != nil {
			http.Error(w, "could not load review", http.StatusInternalServerError)
			return
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
		http.Error(w, "could not load review", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(review)
}
