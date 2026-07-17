package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	authmw "github.com/ani1238/brainmaps-api/internal/api/middleware"
	"github.com/ani1238/brainmaps-api/internal/db"
	"github.com/ani1238/brainmaps-api/internal/grade"
	"github.com/ani1238/brainmaps-api/internal/models"
	"github.com/ani1238/brainmaps-api/internal/qtypes"
	"github.com/go-chi/chi/v5"
)

// POST /sessions
func StartSession(w http.ResponseWriter, r *http.Request) {
	var req models.StartSessionReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}
	if !authmw.AuthorizeStudent(r, req.StudentID) {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	token, tokenHash, err := newSessionToken()
	if err != nil {
		http.Error(w, "could not secure session", http.StatusInternalServerError)
		return
	}

	var sessionID string
	err = db.QueryRow(r.Context(), `
		INSERT INTO sessions (student_id, concept_id, station, access_token_hash)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`, req.StudentID, req.ConceptID, req.Station, tokenHash).Scan(&sessionID)
	if err != nil {
		serverErr(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(models.StartSessionResp{
		SessionID:    sessionID,
		SessionToken: token,
	})
}

// POST /sessions/{id}/complete
// Saves all answers, grades MCQs server-side, and fires async AI grading.
func CompleteSession(w http.ResponseWriter, r *http.Request) {
	sessionID := chi.URLParam(r, "id")
	tokenHash, ok := requestSessionTokenHash(r)
	if !ok {
		http.Error(w, "session not found", http.StatusNotFound)
		return
	}

	var req models.CompleteSessionReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	// Verify session exists
	var studentID, conceptID string
	err := db.QueryRow(r.Context(), `
		SELECT student_id, concept_id
		FROM sessions
		WHERE id = $1 AND access_token_hash = $2 AND completed_at IS NULL
	`, sessionID, tokenHash).Scan(&studentID, &conceptID)
	if err != nil {
		http.Error(w, "session not found or already completed", http.StatusNotFound)
		return
	}

	// Insert answers, tally objective (server-graded) items.
	mcqCorrect, mcqTotal := 0, 0
	hasOpenAnswers := false

	for _, ans := range req.Answers {
		// Load the authoritative type + payload. v12 items carry their full
		// structure (options, categories, pairs, blanks, …) in questions.payload;
		// legacy items instead have mcq_options rows and an empty payload.
		var dbType models.QuestionType
		var payload json.RawMessage
		db.QueryRow(r.Context(), `
			SELECT type, payload FROM questions WHERE id = $1
		`, ans.QuestionID).Scan(&dbType, &payload)
		if dbType == "" {
			dbType = ans.QuestionType
		}

		// v12 objective types: grade deterministically against the payload and
		// persist the structured answer. Emitted misconception tags are not
		// stored per-answer; the weak-tag lifecycle derives weakness from each
		// wrong answer's key_concepts (see grade.sessionWeakSet), so an is_correct
		// flag is all the lifecycle needs.
		if hasPayload(payload) && qtypes.IsObjective(dbType) {
			answerJSON := ans.AnswerPayload
			if len(answerJSON) == 0 && ans.ChosenOption != nil {
				// Back-compat: a single-option answer may arrive as chosenOption.
				answerJSON = json.RawMessage(fmt.Sprintf(`{"optionId":%q}`, *ans.ChosenOption))
			}
			if len(answerJSON) == 0 {
				continue // unanswered
			}
			correct, _, graded := qtypes.Grade(dbType, payload, answerJSON)
			if graded {
				db.Exec(r.Context(), `
					INSERT INTO session_answers
					  (session_id, question_id, question_type, answer_payload, is_correct)
					VALUES ($1, $2, $3, $4, $5)
				`, sessionID, ans.QuestionID, dbType, answerJSON, correct)
				mcqTotal++
				if correct {
					mcqCorrect++
				}
				continue
			}
		}

		// Legacy single-option items graded via the mcq_options table.
		if !hasPayload(payload) && isOptionQuestion(dbType) {
			if ans.ChosenOption == nil {
				continue
			}
			var correct bool
			db.QueryRow(r.Context(), `
				SELECT is_correct FROM mcq_options
				WHERE question_id = $1 AND option_key = $2
			`, ans.QuestionID, *ans.ChosenOption).Scan(&correct)

			db.Exec(r.Context(), `
				INSERT INTO session_answers
				  (session_id, question_id, question_type, chosen_option, is_correct)
				VALUES ($1, $2, $3, $4, $5)
			`, sessionID, ans.QuestionID, dbType, ans.ChosenOption, correct)

			mcqTotal++
			if correct {
				mcqCorrect++
			}
			continue
		}

		// Open-production items (DESCRIPTIVE, FEYNMAN, DESIGN_CHALLENGE, …) and
		// self-rated recall: store the text for async AI grading.
		if ans.StudentText == nil || *ans.StudentText == "" {
			continue
		}
		db.Exec(r.Context(), `
			INSERT INTO session_answers
			  (session_id, question_id, question_type, student_text)
			VALUES ($1, $2, $3, $4)
		`, sessionID, ans.QuestionID, dbType, ans.StudentText)
		hasOpenAnswers = true
	}

	// Record per-question time-on-task (drives the careless-vs-concept signal in
	// the parent report). Done as a follow-up update so it stays independent of
	// how each answer type is inserted above.
	for _, ans := range req.Answers {
		if ans.ElapsedMs != nil {
			db.Exec(r.Context(), `
				UPDATE session_answers SET elapsed_ms = $1
				WHERE session_id = $2 AND question_id = $3
			`, *ans.ElapsedMs, sessionID, ans.QuestionID)
		}
	}

	// Mark session completed with MCQ-only score for now
	mcqScore := 0.0
	if mcqTotal > 0 {
		mcqScore = float64(mcqCorrect) / float64(mcqTotal)
	}
	db.Exec(r.Context(), `
		UPDATE sessions
		SET completed_at = $1, mcq_correct = $2, mcq_total = $3, score = $4
		WHERE id = $5
	`, time.Now(), mcqCorrect, mcqTotal, mcqScore, sessionID)

	passed := mcqScore >= 0.60
	if hasOpenAnswers {
		// Async: grade open answers, then recompute EMA. The client polls
		// GetSession for the authoritative score and passed flag.
		go grade.GradeOpenAnswers(sessionID, studentID)
	} else {
		// Pure objective session: recompute synchronously on THIS request's RLS
		// transaction (fast, no AI call) so the response reflects the station
		// outcome — a retry that misses its targeted weak tags must not show as
		// passed even on a high score. Reusing the request transaction (rather
		// than acquiring a second connection via RecomputeSession) is required:
		// the handler already holds a row lock on this sessions row from the
		// UPDATE above, so a second connection's UPDATE would deadlock.
		grade.RecomputeSessionCtx(r.Context(), sessionID)
		passed = passed && stationCleared(r.Context(), sessionID)
	}

	// Fetch updated state for the response (may still be "MCQ-only" until AI finishes)
	var state models.MasteryState = models.NotStarted
	db.QueryRow(r.Context(), `
		SELECT state FROM concept_progress WHERE student_id = $1 AND concept_id = $2
	`, studentID, conceptID).Scan(&state)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(models.CompleteSessionResp{
		SessionID:       sessionID,
		Score:           mcqScore,
		Passed:          passed,
		NewState:        state,
		AIGrading:       hasOpenAnswers,
		ReviewAvailable: !hasOpenAnswers,
	})
}

func isOptionQuestion(qType models.QuestionType) bool {
	switch qType {
	case models.MCQ, models.StoryMCQ, models.HOTSMCQ, models.AssertionReason:
		return true
	default:
		return false
	}
}

// hasPayload reports whether a question row carries a real v12 payload (a
// non-empty JSON object). Legacy rows default to '{}' and grade via mcq_options.
func hasPayload(p json.RawMessage) bool {
	s := strings.TrimSpace(string(p))
	return s != "" && s != "{}" && s != "null"
}
