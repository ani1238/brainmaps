package grade

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/ani1238/brainmaps-api/internal/db"
	"github.com/ani1238/brainmaps-api/internal/models"
)

// GradeResult is what the Gemini API returns for one answer.
type GradeResult struct {
	Score    float64 `json:"score"`
	Feedback string  `json:"feedback"`
}

// GradeOpenAnswers runs async after a session completes.
// It grades DESCRIPTIVE, FEYNMAN, BLURT, and ACTIVE_RECALL answers via Gemini Flash,
// then recomputes the session score and updates concept_progress.
func GradeOpenAnswers(sessionID string) {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	// 1. Load all open-ended answers for this session
	rows, err := db.Pool.Query(ctx, `
		SELECT sa.id, sa.question_id, sa.question_type, sa.student_text,
		       q.text, q.key_concepts, q.rubric_hint,
		       c.name AS concept_name
		FROM session_answers sa
		JOIN questions q ON q.id = sa.question_id
		JOIN sessions  s ON s.id = sa.session_id
		JOIN concepts  c ON c.id = s.concept_id
		WHERE sa.session_id = $1
		  AND sa.question_type IN ('DESCRIPTIVE','FEYNMAN','BLURT','ACTIVE_RECALL')
		  AND sa.student_text IS NOT NULL
		  AND sa.ai_graded_at IS NULL
	`, sessionID)
	if err != nil {
		return
	}
	defer rows.Close()

	type answerRow struct {
		AnswerID    string
		QuestionID  string
		QType       string
		StudentText string
		QText       string
		KeyConcepts []string
		RubricHint  *string
		ConceptName string
	}

	var answers []answerRow
	for rows.Next() {
		var a answerRow
		if err := rows.Scan(
			&a.AnswerID, &a.QuestionID, &a.QType, &a.StudentText,
			&a.QText, &a.KeyConcepts, &a.RubricHint, &a.ConceptName,
		); err != nil {
			continue
		}
		answers = append(answers, a)
	}
	rows.Close()

	// 2. Grade each answer
	for _, a := range answers {
		result, err := callGemini(ctx, a.QType, a.ConceptName, a.QText, a.StudentText, a.KeyConcepts, a.RubricHint)
		if err != nil {
			// On failure: assign a neutral 0.5 so the session can still complete
			result = &GradeResult{Score: 0.5, Feedback: "We had trouble grading this one — keep practising!"}
		}

		db.Pool.Exec(ctx, `
			UPDATE session_answers
			SET ai_score = $1, ai_feedback = $2, ai_graded_at = now()
			WHERE id = $3
		`, result.Score, result.Feedback, a.AnswerID)
	}

	// 3. Recompute session score including AI grades and update concept_progress
	recomputeSession(ctx, sessionID)
}

// callGemini sends one answer to Gemini Flash and returns a score + feedback.
func callGemini(ctx context.Context, qType, conceptName, question, answer string, keyConcepts []string, rubricHint *string) (*GradeResult, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("GEMINI_API_KEY not set")
	}

	prompt := buildPrompt(qType, conceptName, question, answer, keyConcepts, rubricHint)

	payload := map[string]any{
		"contents": []map[string]any{
			{"parts": []map[string]any{{"text": prompt}}},
		},
		"generationConfig": map[string]any{
			"responseMimeType": "application/json",
			"maxOutputTokens":  2048, // gemini-3.5-flash is a thinking model; needs headroom beyond its reasoning tokens
			"temperature":      0.2,
		},
	}

	body, _ := json.Marshal(payload)
	url := "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-goog-api-key", apiKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	raw, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("gemini %d: %s", resp.StatusCode, raw)
	}

	// Extract text from Gemini response envelope
	var geminiResp struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}
	if err := json.Unmarshal(raw, &geminiResp); err != nil {
		return nil, err
	}
	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("empty gemini response")
	}

	text := geminiResp.Candidates[0].Content.Parts[0].Text
	var result GradeResult
	if err := json.Unmarshal([]byte(text), &result); err != nil {
		return nil, fmt.Errorf("parse grade json: %w", err)
	}

	// Clamp score to [0, 1]
	if result.Score < 0 {
		result.Score = 0
	}
	if result.Score > 1 {
		result.Score = 1
	}

	return &result, nil
}

func buildPrompt(qType, conceptName, question, answer string, keyConcepts []string, rubricHint *string) string {
	var sb strings.Builder

	sb.WriteString("You are grading a Class 6 Indian student's answer for the BrainMaps learning app.\n\n")
	sb.WriteString("Concept: " + conceptName + "\n")
	sb.WriteString("Question type: " + qType + "\n")
	sb.WriteString("Question: " + question + "\n")

	if len(keyConcepts) > 0 {
		sb.WriteString("Key concepts that should be covered: " + strings.Join(keyConcepts, "; ") + "\n")
	}
	if rubricHint != nil && *rubricHint != "" {
		sb.WriteString("Grading rubric: " + *rubricHint + "\n")
	}

	sb.WriteString("Student's answer: " + answer + "\n\n")

	switch qType {
	case "DESCRIPTIVE":
		sb.WriteString("Score criteria (0.0–1.0):\n")
		sb.WriteString("- 0.8–1.0: answers all parts of the question accurately and completely\n")
		sb.WriteString("- 0.5–0.8: mostly correct but missing one key part or detail\n")
		sb.WriteString("- 0.2–0.5: partially correct — some right points but major gaps\n")
		sb.WriteString("- 0.0–0.2: incorrect or does not address the question\n")
	case "FEYNMAN":
		sb.WriteString("Score criteria (0.0–1.0):\n")
		sb.WriteString("- 0.8–1.0: covers all key concepts clearly and simply, like explaining to a friend\n")
		sb.WriteString("- 0.5–0.8: covers most key concepts but unclear or incomplete\n")
		sb.WriteString("- 0.2–0.5: partially correct but missing major ideas\n")
		sb.WriteString("- 0.0–0.2: off-topic or fundamentally wrong\n")
	case "BLURT":
		sb.WriteString("Score criteria (0.0–1.0):\n")
		sb.WriteString("- 0.8–1.0: comprehensive brain-dump covering most key facts about the topic\n")
		sb.WriteString("- 0.5–0.8: good recall but missing some important points\n")
		sb.WriteString("- 0.2–0.5: partial recall — only a few facts mentioned\n")
		sb.WriteString("- 0.0–0.2: almost nothing relevant recalled\n")
	case "ACTIVE_RECALL":
		sb.WriteString("Score criteria (0.0–1.0):\n")
		sb.WriteString("- 0.8–1.0: correctly applies concept to the scenario with clear reasoning\n")
		sb.WriteString("- 0.5–0.8: partial application — correct direction but incomplete\n")
		sb.WriteString("- 0.2–0.5: shows some understanding but mostly misapplied\n")
		sb.WriteString("- 0.0–0.2: does not apply the concept at all\n")
	}

	sb.WriteString("\nWrite feedback for a 12-year-old in exactly 3 short sentences:\n")
	sb.WriteString("1. What they got right (start with something positive, even if small).\n")
	sb.WriteString("2. What was missing or wrong — be specific, name the exact concept or fact.\n")
	sb.WriteString("3. One concrete thing to remember or do differently next time.\n")
	sb.WriteString("Keep each sentence under 20 words. Be warm and encouraging, not harsh.\n")
	sb.WriteString(`Return ONLY valid JSON: {"score": 0.XX, "feedback": "sentence1 sentence2 sentence3"}`)

	return sb.String()
}

// RecomputeSession is exported so the sessions handler can call it for MCQ-only sessions.
func RecomputeSession(sessionID string) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	recomputeSession(ctx, sessionID)
}

// recomputeSession averages MCQ + AI scores and updates concept_progress.
func recomputeSession(ctx context.Context, sessionID string) {
	var studentID, conceptID, station string
	var mcqCorrect, mcqTotal int
	db.Pool.QueryRow(ctx, `
		SELECT student_id, concept_id, station, mcq_correct, mcq_total
		FROM sessions WHERE id = $1
	`, sessionID).Scan(&studentID, &conceptID, &station, &mcqCorrect, &mcqTotal)

	// Average all answer scores (MCQ converted to 0/1 + AI scores)
	var totalScore float64
	var totalCount int

	// MCQ contribution
	if mcqTotal > 0 {
		totalScore += float64(mcqCorrect) / float64(mcqTotal) * float64(mcqTotal)
		totalCount += mcqTotal
	}

	// AI score contribution
	aiRows, _ := db.Pool.Query(ctx, `
		SELECT ai_score FROM session_answers
		WHERE session_id = $1 AND ai_score IS NOT NULL
	`, sessionID)
	defer aiRows.Close()
	for aiRows.Next() {
		var s float64
		aiRows.Scan(&s)
		totalScore += s
		totalCount++
	}
	aiRows.Close()

	sessionScore := 0.0
	if totalCount > 0 {
		sessionScore = totalScore / float64(totalCount)
	}

	// Update session with final score
	db.Pool.Exec(ctx, `UPDATE sessions SET score = $1 WHERE id = $2`, sessionScore, sessionID)

	// Fetch last 5 session scores for EMA
	scoreRows, _ := db.Pool.Query(ctx, `
		SELECT score FROM sessions
		WHERE student_id = $1 AND concept_id = $2 AND score IS NOT NULL
		ORDER BY completed_at DESC LIMIT 5
	`, studentID, conceptID)
	defer scoreRows.Close()

	var scores []float64
	for scoreRows.Next() {
		var s float64
		scoreRows.Scan(&s)
		scores = append(scores, s)
	}
	scoreRows.Close()

	ema := computeEMA(scores)
	state := scoreToState(ema)

	db.Pool.Exec(ctx, `
		INSERT INTO concept_progress (student_id, concept_id, ema_score, state, total_attempts, last_session_at)
		VALUES ($1, $2, $3, $4, 1, now())
		ON CONFLICT (student_id, concept_id) DO UPDATE
		  SET ema_score       = $3,
		      state           = $4,
		      total_attempts  = concept_progress.total_attempts + 1,
		      last_session_at = now(),
		      updated_at      = now()
	`, studentID, conceptID, ema, state)

	// Unlock next station if score >= 0.60 (forgiving threshold)
	const unlockThreshold = 0.60
	if sessionScore >= unlockThreshold {
		col := stationUnlockCol(models.StationKey(station))
		if col != "" {
			db.Pool.Exec(ctx, fmt.Sprintf(
				`UPDATE concept_progress SET %s = true WHERE student_id = $1 AND concept_id = $2`, col,
			), studentID, conceptID)
		}
	}
}

func stationUnlockCol(station models.StationKey) string {
	switch station {
	case models.StationLevel1:
		return "l1_done"
	case models.StationLevel2:
		return "l2_done"
	case models.StationLevel3:
		return "l3_done"
	case models.StationStrengthen:
		return "strengthen_done"
	default:
		return ""
	}
}

// computeEMA applies weights [0.35, 0.25, 0.20, 0.12, 0.08] to the most recent scores.
func computeEMA(scores []float64) float64 {
	weights := []float64{0.35, 0.25, 0.20, 0.12, 0.08}
	var sum, wTotal float64
	for i, s := range scores {
		if i >= len(weights) {
			break
		}
		sum += s * weights[i]
		wTotal += weights[i]
	}
	if wTotal == 0 {
		return 0
	}
	return sum / wTotal
}

func scoreToState(ema float64) models.MasteryState {
	switch {
	case ema >= 0.80:
		return models.Strong
	case ema >= 0.45:
		return models.Developing
	case ema >= 0.25:
		return models.Weak
	default:
		return models.VeryWeak
	}
}
