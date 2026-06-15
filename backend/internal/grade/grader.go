package grade

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"sort"
	"strings"
	"time"

	"github.com/ani1238/brainmaps-api/internal/db"
	"github.com/ani1238/brainmaps-api/internal/models"
)

// GradeResult is the normalized result returned for one answer.
type GradeResult struct {
	Score    float64 `json:"score"`
	Feedback string  `json:"feedback"`
}

// GradeOpenAnswers runs async after a session completes.
// It grades EVERY non-MCQ answer (DESCRIPTIVE, FEYNMAN, BLURT, ACTIVE_RECALL,
// SPOT_IT, FIX_IT, PRODUCE_IT, CONTEXT_CLUE, GENERATIVE_PRODUCTION, …) via
// an available AI provider, then recomputes the session score and updates
// concept_progress.
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
		recomputeSession(ctx, sessionID, nil)
		return
	}

	// 2. Grade EVERY answer in a SINGLE model call. A session is always one
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

	results, weakConcepts, err := gradeBatch(ctx, shared.ConceptName, shared.SubjectKey, shared.ChapterName, items)
	if err != nil {
		log.Printf("[grade] session %s: AI grading failed: %v", sessionID, err)
		// Hard failure: neutral 0.5 for every answer so the session still completes
		results = make([]GradeResult, len(answers))
		for i := range results {
			results[i] = GradeResult{Score: 0.5, Feedback: "We had trouble grading this one — keep practising!"}
		}
	}

	// 3. Persist each grade. ai_graded_at is stamped only after the recompute
	//    below, so a GetSession poll never reports "grading done" before the
	//    station outcome (and the Passed flag derived from it) is final.
	for i, a := range answers {
		db.Pool.Exec(ctx, `
			UPDATE session_answers
			SET ai_score = $1, ai_feedback = $2
			WHERE id = $3
		`, results[i].Score, results[i].Feedback, a.AnswerID)
	}

	// 4. Recompute session score + advance the per-tag weakness lifecycle (AI's
	//    weak concepts unioned with the key_concepts of every wrong answer).
	recomputeSession(ctx, sessionID, weakConcepts)

	db.Pool.Exec(ctx, `
		UPDATE session_answers SET ai_graded_at = now()
		WHERE session_id = $1 AND question_type <> 'MCQ' AND student_text IS NOT NULL
	`, sessionID)
}

// gradeItem is one answer to grade inside a batch call.
type gradeItem struct {
	QType       string
	QText       string
	StudentText string
	KeyConcepts []string
	RubricHint  *string
}

// Stable default models used for grading. Each can be overridden at runtime so
// model migrations do not require a backend deployment.
const (
	defaultGroqModel   = "llama-3.3-70b-versatile"
	defaultGeminiModel = "gemini-3.1-flash-lite"
	defaultOpenAIModel = "gpt-5.4-mini"
)

func configuredModel(envKey, fallback string) string {
	if model := strings.TrimSpace(os.Getenv(envKey)); model != "" {
		return model
	}
	return fallback
}

// gradeBatch grades every answer in a session with ONE model call, and in the
// same call asks the model which key ideas the student is weak in. It always
// returns a grades slice aligned to `items` (gaps filled with a neutral score)
// plus the weak-concept tags, or a non-nil error on a hard failure.
func gradeBatch(ctx context.Context, conceptName, subjectKey, chapterName string, items []gradeItem) ([]GradeResult, []string, error) {
	prompt := buildBatchPrompt(conceptName, subjectKey, chapterName, items)
	text, err := callModel(ctx, prompt)
	if err != nil {
		return nil, nil, err
	}

	var parsed struct {
		Grades []struct {
			Index    int     `json:"index"`
			Score    float64 `json:"score"`
			Feedback string  `json:"feedback"`
		} `json:"grades"`
		WeakConcepts []string `json:"weakConcepts"`
	}
	if err := json.Unmarshal([]byte(text), &parsed); err != nil {
		return nil, nil, fmt.Errorf("parse batch json: %w", err)
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
	return results, parsed.WeakConcepts, nil
}

// callModel sends the grading prompt through the configured providers in order
// (Groq → Gemini → OpenAI), returning the first success. A single provider's
// quota/outage falls through to the next. Returns the model's JSON text, which
// gradeBatch then parses.
func callModel(ctx context.Context, prompt string) (string, error) {
	if key := os.Getenv("GROQ_API_KEY"); key != "" {
		text, err := callGroqRaw(ctx, key, prompt)
		if err == nil {
			return text, nil
		}
		log.Printf("[grade] groq failed, falling back: %v", err)
	}
	if key := os.Getenv("GEMINI_API_KEY"); key != "" {
		text, err := callGeminiRaw(ctx, key, prompt)
		if err == nil {
			return text, nil
		}
		log.Printf("[grade] gemini failed, falling back: %v", err)
	}
	if key := os.Getenv("OPENAI_API_KEY"); key != "" {
		return callOpenAIRaw(ctx, key, prompt)
	}
	return "", fmt.Errorf("no AI provider configured (set GROQ_API_KEY, GEMINI_API_KEY or OPENAI_API_KEY)")
}

// callGroqRaw POSTs the prompt to Groq's OpenAI-compatible chat completions API
// and returns the model's text output (expected to be the grading JSON).
func callGroqRaw(ctx context.Context, apiKey, prompt string) (string, error) {
	payload := map[string]any{
		"model":           configuredModel("GROQ_MODEL", defaultGroqModel),
		"messages":        []map[string]any{{"role": "user", "content": prompt}},
		"response_format": map[string]any{"type": "json_object"},
		"temperature":     0.2,
		// Grading output is small JSON (a few hundred tokens). Keep this modest:
		// Groq counts max_tokens against the free-tier 12k tokens/min budget, so
		// an oversized value rate-limits us after one request.
		"max_tokens": 2048,
	}

	body, _ := json.Marshal(payload)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.groq.com/openai/v1/chat/completions", bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	raw, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("groq %d: %s", resp.StatusCode, raw)
	}

	var r struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	if err := json.Unmarshal(raw, &r); err != nil {
		return "", err
	}
	if len(r.Choices) == 0 || strings.TrimSpace(r.Choices[0].Message.Content) == "" {
		return "", fmt.Errorf("groq: empty response: %s", raw)
	}
	return r.Choices[0].Message.Content, nil
}

// callOpenAIRaw POSTs the prompt to the OpenAI Responses API and returns the
// model's text output (expected to be the grading JSON).
func callOpenAIRaw(ctx context.Context, apiKey, prompt string) (string, error) {
	payload := map[string]any{
		"model": configuredModel("OPENAI_MODEL", defaultOpenAIModel),
		"input": prompt,
		"text": map[string]any{
			"format": map[string]any{"type": "json_object"},
		},
		"max_output_tokens": 8192,
	}

	body, _ := json.Marshal(payload)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.openai.com/v1/responses", bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	raw, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("openai %d: %s", resp.StatusCode, raw)
	}

	// Responses API envelope: prefer the convenience output_text, otherwise
	// find the message item's output_text content (skip any reasoning items).
	var r struct {
		OutputText string `json:"output_text"`
		Output     []struct {
			Type    string `json:"type"`
			Content []struct {
				Type string `json:"type"`
				Text string `json:"text"`
			} `json:"content"`
		} `json:"output"`
	}
	if err := json.Unmarshal(raw, &r); err != nil {
		return "", err
	}
	if strings.TrimSpace(r.OutputText) != "" {
		return r.OutputText, nil
	}
	for _, o := range r.Output {
		if o.Type != "message" {
			continue
		}
		for _, c := range o.Content {
			if c.Type == "output_text" && strings.TrimSpace(c.Text) != "" {
				return c.Text, nil
			}
		}
	}
	return "", fmt.Errorf("openai: empty response: %s", raw)
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
	model := configuredModel("GEMINI_MODEL", defaultGeminiModel)
	url := "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent"

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

	sb.WriteString("ALSO identify what the student is WEAK in: the specific key ideas they did NOT demonstrate")
	sb.WriteString(" across these answers. Choose tags ONLY from the 'Key ideas the answer should cover' lists above,")
	sb.WriteString(" copied verbatim in lowercase, in \"weakConcepts\". Free-form tags are not allowed.")
	sb.WriteString(" Use [] if they did everything well or no listed idea fits.\n\n")

	sb.WriteString("Return ONLY valid JSON (no markdown, no extra text). One \"grades\" entry per answer, in order, ")
	sb.WriteString("using the ANSWER number as \"index\", plus a session-wide \"weakConcepts\" array:\n")
	sb.WriteString(`{"grades":[{"index":1,"score":0.XX,"feedback":"sentence1 sentence2 sentence3"}],"weakConcepts":["tag one","tag two"]}`)

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
	recomputeSession(ctx, sessionID, nil) // MCQ-only: weakness derived from wrong answers' tags
}

// recomputeSession averages MCQ + AI scores and updates concept_progress.
func recomputeSession(ctx context.Context, sessionID string, aiWeak []string) {
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

	// Per-tag accuracy this session, the student's active weaknesses BEFORE any
	// lifecycle updates, and whether this attempt is a retry — together they
	// feed the tag-gated pass decision.
	tested := sessionTagStats(ctx, sessionID)
	activeBefore := activeWeakTags(ctx, studentID, conceptID)
	targeted := map[string]tagStat{}
	for _, tag := range activeBefore {
		if st, ok := tested[tag]; ok {
			targeted[tag] = st
		}
	}

	curCol := stationStateCol(models.StationKey(station))
	isRetry := false
	if curCol != "" {
		var st string
		if db.Pool.QueryRow(ctx, fmt.Sprintf(
			`SELECT %s FROM concept_progress WHERE student_id = $1 AND concept_id = $2`, curCol,
		), studentID, conceptID).Scan(&st) == nil {
			isRetry = st == "needs_fixing"
		}
	}

	// Update per-station state based on outcome. A retry must also demonstrate
	// every targeted weak tag (>= 50% of its questions) — score alone can't pass.
	stationPassed := false
	if curCol != "" {
		stationPassed = levelPassGate(sessionScore, isRetry, targeted)
		if stationPassed {
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
	unlockReviseIfEligible(ctx, studentID, conceptID)
	if models.StationKey(station) == models.StationRevise {
		updateReviseSchedule(ctx, studentID, conceptID, stationPassed && sessionScore >= 0.80)
	}

	updateWeakConceptLifecycle(ctx, studentID, conceptID, sessionWeakSet(ctx, sessionID, aiWeak), tested)
	updateStreak(ctx, studentID)
}

var recallIntervals = []int{1, 3, 7, 21, 60}

func nextRecallInterval(current int, passed bool) int {
	if !passed {
		return recallIntervals[0]
	}
	for _, interval := range recallIntervals {
		if interval > current {
			return interval
		}
	}
	return recallIntervals[len(recallIntervals)-1]
}

func updateReviseSchedule(ctx context.Context, studentID, conceptID string, passed bool) {
	var current int
	if err := db.Pool.QueryRow(ctx, `
		SELECT interval_days
		FROM revise_schedule
		WHERE student_id = $1 AND concept_id = $2
	`, studentID, conceptID).Scan(&current); err != nil {
		current = 0
	}
	next := nextRecallInterval(current, passed)
	db.Pool.Exec(ctx, `
		INSERT INTO revise_schedule
		  (student_id, concept_id, interval_days, next_due_at, last_done_at)
		VALUES ($1, $2, $3, now() + ($3 * interval '1 day'), now())
		ON CONFLICT (student_id, concept_id) DO UPDATE
		  SET interval_days = EXCLUDED.interval_days,
		      next_due_at = EXCLUDED.next_due_at,
		      last_done_at = EXCLUDED.last_done_at
	`, studentID, conceptID, next)
}

// unlockReviseIfEligible opens Revise once Levels 1–3 are done and mastery is
// strong. Strengthen remains optional, and the first recall is scheduled for
// the next day.
func unlockReviseIfEligible(ctx context.Context, studentID, conceptID string) {
	var unlocked bool
	err := db.Pool.QueryRow(ctx, `
		UPDATE concept_progress
		SET revise_unlocked = true,
		    revise_state = CASE WHEN revise_state = 'locked' THEN 'current' ELSE revise_state END
		WHERE student_id = $1
		  AND concept_id = $2
		  AND l1_state = 'done'
		  AND l2_state = 'done'
		  AND l3_state = 'done'
		  AND ema_score >= 0.80
		RETURNING true
	`, studentID, conceptID).Scan(&unlocked)
	if err != nil || !unlocked {
		return
	}

	db.Pool.Exec(ctx, `
		INSERT INTO revise_schedule
		  (student_id, concept_id, interval_days, next_due_at)
		VALUES ($1, $2, 1, now() + interval '1 day')
		ON CONFLICT (student_id, concept_id) DO NOTHING
	`, studentID, conceptID)
}

// updateStreak bumps the student's daily streak on session completion.
//   - same day as last activity → no change
//   - exactly the next day      → streak_days + 1
//   - any larger gap (or first) → reset to 1
//
// streak_best tracks the all-time high.
func updateStreak(ctx context.Context, studentID string) {
	db.Pool.Exec(ctx, `
		UPDATE students
		SET streak_days = CASE
		        WHEN streak_last_date = current_date           THEN streak_days
		        WHEN streak_last_date = current_date - 1        THEN streak_days + 1
		        ELSE 1
		    END,
		    streak_best = GREATEST(streak_best, CASE
		        WHEN streak_last_date = current_date           THEN streak_days
		        WHEN streak_last_date = current_date - 1        THEN streak_days + 1
		        ELSE 1
		    END),
		    streak_last_date = current_date
		WHERE id = $1
	`, studentID)
}

// ── Weak-concept lifecycle ──────────────────────────────────────────────────
// Each (student, concept, tag) row in student_weak_concepts tracks one
// weakness: wrong → active with wrong_count++; tested clean twice → cleared;
// a missed spaced recheck flips cleared back to active. Untested tags are
// never touched, so a targeted retry can't silently drop unrelated weaknesses.

// normalizeTag canonicalizes a weak-concept tag (mirrors SQL lower(trim())).
func normalizeTag(s string) string { return strings.TrimSpace(strings.ToLower(s)) }

// tagStat is one tested tag's accuracy within a single session.
type tagStat struct{ Total, Correct int }

// passed reports whether the tag was demonstrated well enough this session:
// at least half of its questions answered correctly.
func (t tagStat) passed() bool { return t.Total > 0 && t.Correct*2 >= t.Total }

// levelPassGate decides whether a session clears its station. Score must meet
// the unlock threshold; on a retry, every targeted weak tag must also have
// passed. First attempts have no targeted tags, so the gate degenerates to
// score-only by construction.
func levelPassGate(score float64, isRetry bool, targeted map[string]tagStat) bool {
	const unlockThreshold = 0.60
	if score < unlockThreshold {
		return false
	}
	if !isRetry {
		return true
	}
	for _, st := range targeted {
		if !st.passed() {
			return false
		}
	}
	return true
}

// decideTagLifecycle splits a session's outcome into tags to mark wrong and
// tags to credit progress on. Weakness wins: a tag both flagged weak and
// tested-correct counts as wrong. Progress requires tested, not flagged weak,
// and passed. Outputs are sorted for determinism.
func decideTagLifecycle(sessionWeak map[string]bool, tested map[string]tagStat) (wrongTags, progressTags []string) {
	for tag := range sessionWeak {
		wrongTags = append(wrongTags, tag)
	}
	for tag, st := range tested {
		if !sessionWeak[tag] && st.passed() {
			progressTags = append(progressTags, tag)
		}
	}
	sort.Strings(wrongTags)
	sort.Strings(progressTags)
	return wrongTags, progressTags
}

// sessionTagStats computes per-tag accuracy for the session: for every
// key_concept of every answered question, how many of its questions were
// answered correctly (correct MCQ/tap, or open answer >= 0.6). Only called
// after grades are persisted, so ai_score is always set for open answers.
func sessionTagStats(ctx context.Context, sessionID string) map[string]tagStat {
	stats := map[string]tagStat{}
	rows, err := db.Pool.Query(ctx, `
		SELECT lower(trim(kc)) AS tag,
		       COUNT(*) AS total,
		       COUNT(*) FILTER (WHERE (sa.chosen_option IS NOT NULL AND sa.is_correct)
		                           OR (sa.ai_score IS NOT NULL AND sa.ai_score >= 0.6)) AS correct
		FROM session_answers sa
		JOIN questions q ON q.id = sa.question_id
		CROSS JOIN LATERAL unnest(q.key_concepts) AS kc
		WHERE sa.session_id = $1 AND trim(kc) <> ''
		GROUP BY 1
	`, sessionID)
	if err != nil {
		return stats
	}
	defer rows.Close()
	for rows.Next() {
		var tag string
		var st tagStat
		if rows.Scan(&tag, &st.Total, &st.Correct) == nil {
			stats[tag] = st
		}
	}
	return stats
}

// activeWeakTags returns the student's active weak tags for a concept, ranked
// worst-first. Keep the ordering in sync with activeTagsRanked in the handlers
// package, which drives retry question selection.
func activeWeakTags(ctx context.Context, studentID, conceptID string) []string {
	rows, err := db.Pool.Query(ctx, `
		SELECT tag FROM student_weak_concepts
		WHERE student_id = $1 AND concept_id = $2 AND status = 'active'
		ORDER BY wrong_count DESC, last_seen_at DESC
	`, studentID, conceptID)
	if err != nil {
		return nil
	}
	defer rows.Close()
	var tags []string
	for rows.Next() {
		var t string
		if rows.Scan(&t) == nil {
			tags = append(tags, t)
		}
	}
	return tags
}

// sessionWeakSet builds the session's weakness set: the AI's weak-concept tags
// unioned with the key_concepts of every wrong answer (wrong MCQ/tap, or open
// answer < 0.6), normalized.
func sessionWeakSet(ctx context.Context, sessionID string, aiWeak []string) map[string]bool {
	set := map[string]bool{}
	add := func(s string) {
		if s = normalizeTag(s); s != "" {
			set[s] = true
		}
	}
	for _, w := range aiWeak {
		add(w)
	}

	rows, err := db.Pool.Query(ctx, `
		SELECT q.key_concepts
		FROM session_answers sa
		JOIN questions q ON q.id = sa.question_id
		WHERE sa.session_id = $1
		  AND (
		        (sa.chosen_option IS NOT NULL AND sa.is_correct = false)
		     OR (sa.ai_score IS NOT NULL AND sa.ai_score < 0.6)
		  )
	`, sessionID)
	if err == nil {
		for rows.Next() {
			var kc []string
			if rows.Scan(&kc) == nil {
				for _, k := range kc {
					add(k)
				}
			}
		}
		rows.Close()
	}
	return set
}

// updateWeakConceptLifecycle advances each tag's lifecycle after a session.
// Wrong tags are inserted or re-activated with wrong_count+1 (this is also
// what flips a cleared tag back to active when a spaced recheck is missed).
// Tags tested clean get a correct_streak bump and clear at streak 2.
func updateWeakConceptLifecycle(ctx context.Context, studentID, conceptID string, sessionWeak map[string]bool, tested map[string]tagStat) {
	wrongTags, progressTags := decideTagLifecycle(sessionWeak, tested)

	for _, tag := range wrongTags {
		db.Pool.Exec(ctx, `
			INSERT INTO student_weak_concepts
			  (student_id, concept_id, tag, wrong_count, correct_streak, status)
			VALUES ($1, $2, $3, 1, 0, 'active')
			ON CONFLICT (student_id, concept_id, tag) DO UPDATE
			SET wrong_count    = student_weak_concepts.wrong_count + 1,
			    correct_streak = 0,
			    status         = 'active',
			    cleared_at     = NULL,
			    last_seen_at   = now()
		`, studentID, conceptID, tag)
	}

	if len(progressTags) > 0 {
		db.Pool.Exec(ctx, `
			UPDATE student_weak_concepts
			SET correct_streak = correct_streak + 1,
			    status     = CASE WHEN correct_streak + 1 >= 2 THEN 'cleared' ELSE status END,
			    cleared_at = CASE WHEN correct_streak + 1 >= 2 THEN now() ELSE cleared_at END,
			    last_seen_at = now()
			WHERE student_id = $1 AND concept_id = $2
			  AND tag = ANY($3) AND status = 'active'
		`, studentID, conceptID, progressTags)
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
