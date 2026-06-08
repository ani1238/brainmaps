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
// It grades EVERY non-MCQ answer (DESCRIPTIVE, FEYNMAN, BLURT, ACTIVE_RECALL,
// SPOT_IT, FIX_IT, PRODUCE_IT, CONTEXT_CLUE, GENERATIVE_PRODUCTION, …) via
// Gemini Flash, then recomputes the session score and updates concept_progress.
func GradeOpenAnswers(sessionID string) {
	ctx, cancel := context.WithTimeout(context.Background(), 90*time.Second)
	defer cancel()

	// 1. Load all open-ended answers for this session (anything that isn't MCQ)
	rows, err := db.Pool.Query(ctx, `
		SELECT sa.id, sa.question_id, sa.question_type, sa.student_text,
		       q.text, q.key_concepts, q.rubric_hint,
		       c.name AS concept_name, c.subject_key, ch.name AS chapter_name
		FROM session_answers sa
		JOIN questions q ON q.id = sa.question_id
		JOIN sessions  s ON s.id = sa.session_id
		JOIN concepts  c ON c.id = s.concept_id
		JOIN chapters  ch ON ch.id = c.chapter_id
		WHERE sa.session_id = $1
		  AND sa.question_type <> 'MCQ'
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
		SubjectKey  string
		ChapterName string
	}

	var answers []answerRow
	for rows.Next() {
		var a answerRow
		if err := rows.Scan(
			&a.AnswerID, &a.QuestionID, &a.QType, &a.StudentText,
			&a.QText, &a.KeyConcepts, &a.RubricHint,
			&a.ConceptName, &a.SubjectKey, &a.ChapterName,
		); err != nil {
			continue
		}
		answers = append(answers, a)
	}
	rows.Close()

	if len(answers) == 0 {
		recomputeSession(ctx, sessionID)
		return
	}

	// 2. Grade EVERY answer in a SINGLE Gemini call. A session is always one
	//    concept + one station, so all answers share the same curriculum
	//    context — we send them together instead of one call per answer.
	shared := answers[0]
	items := make([]gradeItem, len(answers))
	for i, a := range answers {
		items[i] = gradeItem{
			QType:       a.QType,
			QText:       a.QText,
			StudentText: a.StudentText,
			KeyConcepts: a.KeyConcepts,
			RubricHint:  a.RubricHint,
		}
	}

	results, err := callGeminiBatch(ctx, shared.ConceptName, shared.SubjectKey, shared.ChapterName, items)
	if err != nil {
		// Hard failure: neutral 0.5 for every answer so the session still completes
		results = make([]GradeResult, len(answers))
		for i := range results {
			results[i] = GradeResult{Score: 0.5, Feedback: "We had trouble grading this one — keep practising!"}
		}
	}

	// 3. Persist each grade
	for i, a := range answers {
		db.Pool.Exec(ctx, `
			UPDATE session_answers
			SET ai_score = $1, ai_feedback = $2, ai_graded_at = now()
			WHERE id = $3
		`, results[i].Score, results[i].Feedback, a.AnswerID)
	}

	// 4. Recompute session score including AI grades and update concept_progress
	recomputeSession(ctx, sessionID)
}

// gradeItem is one answer to grade inside a batch call.
type gradeItem struct {
	QType       string
	QText       string
	StudentText string
	KeyConcepts []string
	RubricHint  *string
}

// callGeminiBatch grades every answer in a session with ONE Gemini call.
// It always returns a slice aligned to `items` (gaps filled with a neutral
// score) on success, or a non-nil error on a hard failure.
func callGeminiBatch(ctx context.Context, conceptName, subjectKey, chapterName string, items []gradeItem) ([]GradeResult, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("GEMINI_API_KEY not set")
	}

	prompt := buildBatchPrompt(conceptName, subjectKey, chapterName, items)
	text, err := callGeminiRaw(ctx, apiKey, prompt)
	if err != nil {
		return nil, err
	}

	var parsed struct {
		Grades []struct {
			Index    int     `json:"index"`
			Score    float64 `json:"score"`
			Feedback string  `json:"feedback"`
		} `json:"grades"`
	}
	if err := json.Unmarshal([]byte(text), &parsed); err != nil {
		return nil, fmt.Errorf("parse batch json: %w", err)
	}

	// Align results to input order (1-based index); fill any gaps with neutral 0.5.
	results := make([]GradeResult, len(items))
	for i := range results {
		results[i] = GradeResult{Score: 0.5, Feedback: "We had trouble grading this one — keep practising!"}
	}
	for _, g := range parsed.Grades {
		idx := g.Index - 1
		if idx < 0 || idx >= len(results) {
			continue
		}
		score := g.Score
		if score < 0 {
			score = 0
		}
		if score > 1 {
			score = 1
		}
		results[idx] = GradeResult{Score: score, Feedback: g.Feedback}
	}
	return results, nil
}

// callGeminiRaw POSTs a prompt to Gemini Flash and returns the JSON text body.
func callGeminiRaw(ctx context.Context, apiKey, prompt string) (string, error) {
	payload := map[string]any{
		"contents": []map[string]any{
			{"parts": []map[string]any{{"text": prompt}}},
		},
		"generationConfig": map[string]any{
			"responseMimeType": "application/json",
			"maxOutputTokens":  8192, // batch of grades + thinking-model reasoning headroom
			"temperature":      0.2,
		},
	}

	body, _ := json.Marshal(payload)
	url := "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-goog-api-key", apiKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	raw, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("gemini %d: %s", resp.StatusCode, raw)
	}

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
		return "", err
	}
	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("empty gemini response")
	}
	return geminiResp.Candidates[0].Content.Parts[0].Text, nil
}

// buildBatchPrompt builds one prompt that grades all answers in a session.
func buildBatchPrompt(conceptName, subjectKey, chapterName string, items []gradeItem) string {
	var sb strings.Builder

	// ── Grader identity + shared curriculum context ──────────────────────────
	sb.WriteString("You are an expert grader for BrainMaps, an AI-powered learning app for Indian school students.\n\n")
	sb.WriteString("CURRICULUM CONTEXT (applies to every answer below):\n")
	sb.WriteString("- Board: CBSE (Central Board of Secondary Education), India\n")
	sb.WriteString("- Class: 6 (approx. age 11–12)\n")
	sb.WriteString("- Subject: " + subjectLabel(subjectKey) + "\n")
	sb.WriteString("- Chapter: " + chapterName + "\n")
	sb.WriteString("- Concept being tested: " + conceptName + "\n")
	sb.WriteString("- Reference: NCERT Class 6 textbooks for this subject\n")
	sb.WriteString("- Expected language level: simple English; basic vocabulary; no jargon required\n")
	sb.WriteString("- Expected knowledge depth: Class 6 NCERT level — broad understanding, not specialist detail\n\n")

	sb.WriteString(fmt.Sprintf("Grade the following %d student answers. Grade each one INDEPENDENTLY on its own merits.\n\n", len(items)))

	// ── Each answer with its own question context + scoring bands ─────────────
	for i, it := range items {
		sb.WriteString(fmt.Sprintf("════════ ANSWER %d ════════\n", i+1))
		sb.WriteString("Question type: " + it.QType + "\n")
		sb.WriteString("Question: " + it.QText + "\n")
		if len(it.KeyConcepts) > 0 {
			sb.WriteString("Key ideas the answer should cover: " + strings.Join(it.KeyConcepts, "; ") + "\n")
		}
		if it.RubricHint != nil && *it.RubricHint != "" {
			sb.WriteString("Marking guide (NCERT-aligned): " + *it.RubricHint + "\n")
		}
		sb.WriteString("Scoring bands (0.0–1.0):\n" + scoringRubric(it.QType))
		sb.WriteString("STUDENT'S ANSWER: " + it.StudentText + "\n\n")
	}

	// ── Feedback instructions + output schema ────────────────────────────────
	sb.WriteString("FEEDBACK INSTRUCTIONS (for every answer):\n")
	sb.WriteString("Write exactly 3 short sentences addressed directly to the student:\n")
	sb.WriteString("1. Acknowledge something they got right (be specific, name the idea — even if small).\n")
	sb.WriteString("2. Point out exactly what NCERT concept or fact was missing or wrong — name it explicitly.\n")
	sb.WriteString("3. Give one clear, actionable tip for next time (what to remember or how to improve).\n")
	sb.WriteString("Rules: each sentence ≤ 20 words; tone is warm and encouraging; use simple Class 6 language; no bullet points.\n\n")

	sb.WriteString("Return ONLY valid JSON (no markdown, no extra text). Include one entry per answer, in order, ")
	sb.WriteString("using the ANSWER number as \"index\":\n")
	sb.WriteString(`{"grades":[{"index":1,"score":0.XX,"feedback":"sentence1 sentence2 sentence3"}]}`)

	return sb.String()
}

// subjectLabel turns a DB subject_key into a human-readable subject name.
func subjectLabel(subjectKey string) string {
	switch subjectKey {
	case "science":
		return "Science"
	case "social_science":
		return "Social Science (History, Geography, Civics, Economics)"
	case "english", "english_lit":
		return "English — Literature"
	case "english_grammar":
		return "English — Grammar"
	case "english_vocab":
		return "English — Vocabulary"
	case "english_writing":
		return "English — Writing"
	case "english_rc":
		return "English — Reading Comprehension"
	default:
		return "Social Science"
	}
}

// scoringRubric returns the 0.0–1.0 marking band text for a question type.
// Every non-MCQ type is covered; unknown types fall back to a generic band.
func scoringRubric(qType string) string {
	switch qType {
	case "DESCRIPTIVE":
		return "- 0.8–1.0: correctly answers all parts of the question at Class 6 NCERT level; uses appropriate terms\n" +
			"- 0.5–0.8: mostly correct but missing one key NCERT fact or detail\n" +
			"- 0.2–0.5: partially correct — gets the gist but has significant gaps or errors\n" +
			"- 0.0–0.2: off-topic, fundamentally wrong, or just restates the question\n"
	case "FEYNMAN":
		return "- 0.8–1.0: explains the concept in simple, clear words; covers all key NCERT ideas as if teaching a younger child\n" +
			"- 0.5–0.8: explains most key ideas but is unclear or incomplete in places\n" +
			"- 0.2–0.5: touches on the concept but misses major ideas or is confusing\n" +
			"- 0.0–0.2: explanation is wrong, off-topic, or just copies the question back\n"
	case "BLURT":
		return "- 0.8–1.0: recalls most key NCERT facts about the topic from memory; good coverage\n" +
			"- 0.5–0.8: recalls several correct points but misses some important NCERT content\n" +
			"- 0.2–0.5: only recalls a few scattered points; significant gaps\n" +
			"- 0.0–0.2: recalls almost nothing relevant, or writes something unrelated\n"
	case "ACTIVE_RECALL":
		return "- 0.8–1.0: correctly applies the NCERT concept to the new scenario with clear reasoning\n" +
			"- 0.5–0.8: applies the concept in the right direction but reasoning is incomplete\n" +
			"- 0.2–0.5: shows partial understanding but mostly misapplies or confuses the concept\n" +
			"- 0.0–0.2: does not apply the concept; answer is generic or irrelevant\n"
	case "SPOT_IT":
		return "- 0.8–1.0: correctly identifies the target item/error/example and explains why it fits\n" +
			"- 0.5–0.8: identifies the right thing but the reason is thin or partly wrong\n" +
			"- 0.2–0.5: spots something related but misses the actual target\n" +
			"- 0.0–0.2: identifies the wrong thing or gives no valid reasoning\n"
	case "FIX_IT":
		return "- 0.8–1.0: correctly finds the mistake AND fixes it with the right correction\n" +
			"- 0.5–0.8: finds the mistake but the fix is incomplete or slightly off\n" +
			"- 0.2–0.5: senses something is wrong but mislocates or mis-fixes it\n" +
			"- 0.0–0.2: misses the error entirely or makes the answer worse\n"
	case "PRODUCE_IT", "GENERATIVE_PRODUCTION":
		return "- 0.8–1.0: produces a correct, original example/sentence/answer that fully meets the brief\n" +
			"- 0.5–0.8: produces something on-topic and mostly correct but with a small flaw\n" +
			"- 0.2–0.5: attempt is related but has clear errors or misses the brief\n" +
			"- 0.0–0.2: off-topic, copied, or does not meet the task at all\n"
	case "CONTEXT_CLUE":
		return "- 0.8–1.0: correctly infers the meaning/answer using clues from the passage, with sound reasoning\n" +
			"- 0.5–0.8: reasonable inference but reasoning is partly unsupported by the clues\n" +
			"- 0.2–0.5: guesses in the right area but ignores or misreads the clues\n" +
			"- 0.0–0.2: inference is unsupported, wrong, or unrelated to the passage\n"
	default:
		// Generic band for any other open-ended type
		return "- 0.8–1.0: fully correct and complete at Class 6 NCERT level\n" +
			"- 0.5–0.8: mostly correct but missing a key point or detail\n" +
			"- 0.2–0.5: partially correct with significant gaps or errors\n" +
			"- 0.0–0.2: off-topic, wrong, or just restates the question\n"
	}
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

	// Update per-station state based on outcome
	const unlockThreshold = 0.60
	curCol := stationStateCol(models.StationKey(station))
	if curCol != "" {
		if sessionScore >= unlockThreshold {
			// Passed: mark current station done and unlock the next one
			nextSt := nextStationKey(models.StationKey(station))
			nextCol := stationStateCol(nextSt)
			if nextCol != "" {
				db.Pool.Exec(ctx, fmt.Sprintf(
					`UPDATE concept_progress SET %s = 'done', %s = 'current'
					 WHERE student_id = $1 AND concept_id = $2`, curCol, nextCol,
				), studentID, conceptID)
			} else {
				// Last station (revise) — just mark done
				db.Pool.Exec(ctx, fmt.Sprintf(
					`UPDATE concept_progress SET %s = 'done'
					 WHERE student_id = $1 AND concept_id = $2`, curCol,
				), studentID, conceptID)
			}
		} else {
			// Failed: mark needs_fixing so Today's Fix can surface it
			db.Pool.Exec(ctx, fmt.Sprintf(
				`UPDATE concept_progress SET %s = 'needs_fixing'
				 WHERE student_id = $1 AND concept_id = $2`, curCol,
			), studentID, conceptID)
		}
	}
}

// stationStateCol returns the concept_progress column name for a given station.
func stationStateCol(station models.StationKey) string {
	switch station {
	case models.StationLevel1:
		return "l1_state"
	case models.StationLevel2:
		return "l2_state"
	case models.StationLevel3:
		return "l3_state"
	case models.StationStrengthen:
		return "strengthen_state"
	case models.StationRevise:
		return "revise_state"
	default:
		return ""
	}
}

// nextStationKey returns the station that follows the given one.
func nextStationKey(station models.StationKey) models.StationKey {
	switch station {
	case models.StationLevel1:
		return models.StationLevel2
	case models.StationLevel2:
		return models.StationLevel3
	case models.StationLevel3:
		return models.StationStrengthen
	case models.StationStrengthen:
		return models.StationRevise
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
