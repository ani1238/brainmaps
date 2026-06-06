package handlers

import (
	"context"

	"github.com/ani1238/brainmaps-api/internal/db"
	"github.com/ani1238/brainmaps-api/internal/models"
)

// buildFeedback returns per-answer commentary for the results screen.
//   - Wrong MCQ: student's chosen option text + the correct explanation.
//   - Graded open answers: student's written text + Gemini's 3-sentence analysis.
// Correct MCQs and ungraded open answers are omitted.
func buildFeedback(ctx context.Context, sessionID string) []models.AnswerFeedback {
	rows, err := db.Pool.Query(ctx, `
		SELECT
			sa.question_type,
			q.text                                    AS question_text,
			COALESCE(q.explanation, '')               AS explanation,
			COALESCE(sa.is_correct, true)             AS is_correct,
			COALESCE(sa.student_text, '')             AS student_text,
			COALESCE(mo.text, '')                     AS chosen_option_text,
			COALESCE(sa.ai_feedback, '')              AS ai_feedback,
			COALESCE(sa.ai_score, 0.0)                AS ai_score
		FROM session_answers sa
		JOIN  questions  q  ON q.id  = sa.question_id
		LEFT JOIN mcq_options mo
			ON mo.question_id = sa.question_id
			AND mo.option_key = sa.chosen_option
		WHERE sa.session_id = $1
		ORDER BY sa.id
	`, sessionID)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var feedback []models.AnswerFeedback
	for rows.Next() {
		var qType, qText, explanation, studentText, chosenOptionText, aiFeedback string
		var isCorrect bool
		var aiScore float64
		if err := rows.Scan(
			&qType, &qText, &explanation, &isCorrect,
			&studentText, &chosenOptionText, &aiFeedback, &aiScore,
		); err != nil {
			continue
		}

		switch {
		case qType == "MCQ" && !isCorrect:
			studentAnswer := chosenOptionText
			if studentAnswer == "" {
				studentAnswer = "(no answer selected)"
			}
			fb := explanation
			if fb == "" {
				fb = "Review this topic — the answer was not quite right."
			}
			feedback = append(feedback, models.AnswerFeedback{
				QuestionType:  qType,
				QuestionText:  qText,
				StudentAnswer: studentAnswer,
				Feedback:      fb,
				Score:         0,
			})

		case qType != "MCQ" && aiFeedback != "":
			feedback = append(feedback, models.AnswerFeedback{
				QuestionType:  qType,
				QuestionText:  qText,
				StudentAnswer: studentText,
				Feedback:      aiFeedback,
				Score:         aiScore,
			})
		}
	}
	return feedback
}
