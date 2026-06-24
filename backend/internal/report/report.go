// Package report builds the parent-facing progress report: a warm, effort-first
// AI narrative plus honest, structured "focus areas" derived from the learner's
// real data over the last 7 days.
package report

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/ani1238/brainmaps-api/internal/ai"
	"github.com/ani1238/brainmaps-api/internal/db"
)

type Effort struct {
	Sessions   int `json:"sessions"`
	ActiveDays int `json:"activeDays"`
	Streak     int `json:"streak"`
	Minutes    int `json:"minutes"`
}

type Mastery struct {
	Strong     int `json:"strong"`
	Developing int `json:"developing"`
	Weak       int `json:"weak"`
	Total      int `json:"total"`
}

type Improving struct {
	Name  string  `json:"name"`
	Delta float64 `json:"delta"`
}

type FocusArea struct {
	Concept string   `json:"concept"`
	Tags    []string `json:"tags"`
}

// Highlight is "a real win this week" — a concept the learner did well on.
type Highlight struct {
	Concept   string `json:"concept"`
	AllLevels bool   `json:"allLevels"`
	Detail    string `json:"detail"` // AI prose
}

// Gap is "one thing to look at" — the concept to nudge, in plain language.
type Gap struct {
	Concept     string `json:"concept"`
	Explanation string `json:"explanation"` // AI prose
}

// StudentVoice is the signature section: the learner's own answer, verbatim,
// with an AI note on what's missing.
type StudentVoice struct {
	Question string `json:"question"`
	Answer   string `json:"answer"`
	Note     string `json:"note"` // AI prose
}

// AskTonight is one conversation starter for the parent.
type AskTonight struct {
	Question string `json:"question"` // AI prose
	Hint     string `json:"hint"`     // AI prose
}

// Trend contrasts recall (knowing) with application (using).
type Trend struct {
	RecallPct int    `json:"recallPct"`
	ApplyPct  int    `json:"applyPct"`
	Caption   string `json:"caption"` // AI prose
}

// CarelessConcept estimates, among recent wrong answers, how much of the
// weakness is a genuine concept gap (the learner took time and still missed it)
// vs just rushing. 0 = mostly rushing, 100 = mostly a real concept gap.
type CarelessConcept struct {
	ConceptGapPct int    `json:"conceptGapPct"`
	Verdict       string `json:"verdict"` // AI prose
}

// Report is the cached parent-report payload.
type Report struct {
	StudentName  string           `json:"studentName"`
	WeekStart    string           `json:"weekStart"`
	WeekEnd      string           `json:"weekEnd"`
	WeekNumber   int              `json:"weekNumber"`
	FocusSubject string           `json:"focusSubject"`
	Headline     string           `json:"headline"`
	Narrative    string           `json:"narrative"`
	Suggestion   string           `json:"suggestion"`
	Win          *Highlight       `json:"win,omitempty"`
	Gap          *Gap             `json:"gap,omitempty"`
	Voice        *StudentVoice    `json:"voice,omitempty"`
	AskTonight   *AskTonight      `json:"askTonight,omitempty"`
	Trend        *Trend           `json:"trend,omitempty"`
	Careless     *CarelessConcept `json:"careless,omitempty"`
	Effort       Effort           `json:"effort"`
	Mastery      Mastery          `json:"mastery"`
	Improving    []Improving      `json:"improving"`
	FocusAreas   []FocusArea      `json:"focusAreas"`
}

// Generate builds a fresh report for the given student from the last 7 days.
func Generate(ctx context.Context, studentID string) (Report, error) {
	rep := Report{
		Improving:  []Improving{},
		FocusAreas: []FocusArea{},
		WeekStart:  time.Now().UTC().AddDate(0, 0, -7).Format("2006-01-02"),
		WeekEnd:    time.Now().UTC().Format("2006-01-02"),
	}

	// ── Student name + streak ────────────────────────────────────────────────
	var storedStreak, daysSince int
	db.Pool.QueryRow(ctx, `
		SELECT name, COALESCE(streak_days,0), COALESCE(current_date - streak_last_date, 2147483647)
		FROM students WHERE id = $1
	`, studentID).Scan(&rep.StudentName, &storedStreak, &daysSince)
	if daysSince >= 0 && daysSince <= 1 {
		rep.Effort.Streak = storedStreak
	}

	// ── Effort (last 7 days) ─────────────────────────────────────────────────
	var answers int
	db.Pool.QueryRow(ctx, `
		SELECT COUNT(*) FILTER (WHERE s.completed_at IS NOT NULL),
		       COUNT(DISTINCT s.completed_at::date) FILTER (WHERE s.completed_at IS NOT NULL),
		       COALESCE(SUM(s.mcq_total), 0)
		FROM sessions s
		WHERE s.student_id = $1 AND s.started_at >= now() - interval '7 days'
	`, studentID).Scan(&rep.Effort.Sessions, &rep.Effort.ActiveDays, &answers)
	// Rough time estimate: ~2 min per question, min 0.
	rep.Effort.Minutes = answers * 2

	// ── Mastery distribution (all attempted concepts) ────────────────────────
	db.Pool.QueryRow(ctx, `
		SELECT
		  COUNT(*) FILTER (WHERE cp.state IN ('STRONG','RECALL_DUE')),
		  COUNT(*) FILTER (WHERE cp.state = 'DEVELOPING'),
		  COUNT(*) FILTER (WHERE cp.state IN ('WEAK','VERY_WEAK')),
		  COUNT(*)
		FROM concept_progress cp
		JOIN concepts c ON c.id = cp.concept_id
		WHERE cp.student_id = $1
	`, studentID).Scan(&rep.Mastery.Strong, &rep.Mastery.Developing, &rep.Mastery.Weak, &rep.Mastery.Total)

	// ── Improving (biggest positive delta over last 2 sessions) ──────────────
	impRows, err := db.Pool.Query(ctx, `
		WITH ranked AS (
		  SELECT s.concept_id, s.score,
		         ROW_NUMBER() OVER (PARTITION BY s.concept_id ORDER BY s.completed_at DESC) rn
		  FROM sessions s WHERE s.student_id = $1 AND s.completed_at IS NOT NULL
		),
		deltas AS (
		  SELECT concept_id,
		         MAX(score) FILTER (WHERE rn = 1) AS latest,
		         MAX(score) FILTER (WHERE rn = 2) AS prev
		  FROM ranked WHERE rn <= 2 GROUP BY concept_id
		)
		SELECT c.name, (d.latest - d.prev) AS delta
		FROM deltas d JOIN concepts c ON c.id = d.concept_id
		WHERE d.prev IS NOT NULL AND d.latest > d.prev
		ORDER BY delta DESC LIMIT 3
	`, studentID)
	if err == nil {
		for impRows.Next() {
			var im Improving
			if impRows.Scan(&im.Name, &im.Delta) == nil {
				rep.Improving = append(rep.Improving, im)
			}
		}
		impRows.Close()
	}

	// ── Focus areas (active weak concepts + their tags) ──────────────────────
	faRows, err := db.Pool.Query(ctx, `
		SELECT c.name, array_agg(DISTINCT swc.tag) AS tags
		FROM student_weak_concepts swc
		JOIN concepts c ON c.id = swc.concept_id
		WHERE swc.student_id = $1 AND swc.status = 'active'
		GROUP BY c.name
		ORDER BY count(*) DESC
		LIMIT 6
	`, studentID)
	if err == nil {
		for faRows.Next() {
			var fa FocusArea
			if faRows.Scan(&fa.Concept, &fa.Tags) == nil {
				rep.FocusAreas = append(rep.FocusAreas, fa)
			}
		}
		faRows.Close()
	}

	// ── Recent AI feedback snippets (for the narrative) ──────────────────────
	var feedback []string
	fbRows, err := db.Pool.Query(ctx, `
		SELECT sa.ai_feedback
		FROM session_answers sa JOIN sessions s ON s.id = sa.session_id
		WHERE s.student_id = $1 AND sa.ai_feedback IS NOT NULL AND sa.ai_feedback <> ''
		  AND sa.ai_graded_at >= now() - interval '7 days'
		ORDER BY sa.ai_graded_at DESC LIMIT 12
	`, studentID)
	if err == nil {
		for fbRows.Next() {
			var f string
			if fbRows.Scan(&f) == nil {
				feedback = append(feedback, f)
			}
		}
		fbRows.Close()
	}

	// ── Week number + this week's focus subject ──────────────────────────────
	db.Pool.QueryRow(ctx, `
		SELECT COALESCE(CEIL(EXTRACT(epoch FROM now() - MIN(started_at)) / 604800.0), 1)
		FROM sessions WHERE student_id = $1
	`, studentID).Scan(&rep.WeekNumber)
	if rep.WeekNumber < 1 {
		rep.WeekNumber = 1
	}
	var focusSubjectKey string
	db.Pool.QueryRow(ctx, `
		SELECT c.subject_key
		FROM sessions s JOIN concepts c ON c.id = s.concept_id
		WHERE s.student_id = $1 AND s.started_at >= now() - interval '7 days'
		GROUP BY c.subject_key ORDER BY COUNT(*) DESC LIMIT 1
	`, studentID).Scan(&focusSubjectKey)
	rep.FocusSubject = subjectLabel(focusSubjectKey)

	// ── A real win this week (high score, ideally STRONG + all levels) ───────
	var win Highlight
	var winState, l1, l2, l3 string
	if db.Pool.QueryRow(ctx, `
		SELECT c.name, COALESCE(cp.state,''), COALESCE(cp.l1_state,''), COALESCE(cp.l2_state,''), COALESCE(cp.l3_state,'')
		FROM sessions s JOIN concepts c ON c.id = s.concept_id
		LEFT JOIN concept_progress cp ON cp.student_id = s.student_id AND cp.concept_id = s.concept_id
		WHERE s.student_id = $1 AND s.completed_at >= now() - interval '7 days' AND s.score >= 0.75
		ORDER BY (COALESCE(cp.state,'') = 'STRONG') DESC, s.score DESC, s.completed_at DESC
		LIMIT 1
	`, studentID).Scan(&win.Concept, &winState, &l1, &l2, &l3) == nil && win.Concept != "" {
		win.AllLevels = l1 == "done" && l2 == "done" && l3 == "done"
		rep.Win = &win
	}

	// ── The gap concept (top active weak area) ───────────────────────────────
	gapConcept := ""
	if len(rep.FocusAreas) > 0 {
		gapConcept = rep.FocusAreas[0].Concept
	}

	// ── Student's own words: a real answer that shows the gap ────────────────
	var voice StudentVoice
	var voiceFeedback string
	voiceQ := `
		SELECT q.text, sa.student_text, COALESCE(sa.ai_feedback, '')
		FROM session_answers sa
		JOIN sessions s ON s.id = sa.session_id
		JOIN questions q ON q.id = sa.question_id
		JOIN concepts c ON c.id = s.concept_id
		WHERE s.student_id = $1
		  AND sa.student_text IS NOT NULL AND sa.student_text <> ''
		  AND sa.ai_score IS NOT NULL
		  AND ($2 = '' OR c.name = $2)
		ORDER BY (sa.ai_score < 0.8) DESC, sa.answered_at DESC
		LIMIT 1`
	if db.Pool.QueryRow(ctx, voiceQ, studentID, gapConcept).Scan(&voice.Question, &voice.Answer, &voiceFeedback) != nil && gapConcept != "" {
		db.Pool.QueryRow(ctx, voiceQ, studentID, "").Scan(&voice.Question, &voice.Answer, &voiceFeedback)
	}
	haveVoice := voice.Answer != ""

	// ── Recall (knowing) vs application (using), last 30 days ────────────────
	var recallPct, applyPct *int
	db.Pool.QueryRow(ctx, `
		SELECT
		  round(100.0 * avg(CASE WHEN sa.question_type IN ('MCQ','STORY_MCQ') THEN sa.is_correct::int END))::int,
		  round(100.0 * avg(CASE WHEN sa.question_type NOT IN ('MCQ','STORY_MCQ','HOTS_MCQ','ASSERTION_REASON') AND sa.ai_score IS NOT NULL THEN sa.ai_score END))::int
		FROM session_answers sa JOIN sessions s ON s.id = sa.session_id
		WHERE s.student_id = $1 AND sa.answered_at >= now() - interval '30 days'
	`, studentID).Scan(&recallPct, &applyPct)

	// ── Careless vs concept: among recent wrong answers that have timing, what
	// share were "considered" (took real time) rather than rushed? ───────────
	var totalWrong, consideredWrong int
	db.Pool.QueryRow(ctx, `
		SELECT COUNT(*) FILTER (WHERE wrong),
		       COUNT(*) FILTER (WHERE wrong AND considered)
		FROM (
		  SELECT
		    (CASE WHEN sa.question_type IN ('MCQ','STORY_MCQ','HOTS_MCQ','ASSERTION_REASON')
		          THEN sa.is_correct = false
		          ELSE sa.ai_score IS NOT NULL AND sa.ai_score < 0.6 END) AS wrong,
		    (sa.elapsed_ms >= CASE WHEN sa.question_type IN ('MCQ','STORY_MCQ','HOTS_MCQ','ASSERTION_REASON')
		                           THEN 4000 ELSE 12000 END) AS considered
		  FROM session_answers sa JOIN sessions s ON s.id = sa.session_id
		  WHERE s.student_id = $1 AND sa.elapsed_ms IS NOT NULL
		    AND sa.answered_at >= now() - interval '30 days'
		) t
	`, studentID).Scan(&totalWrong, &consideredWrong)
	conceptGapPct := -1
	if totalWrong >= 4 {
		conceptGapPct = (100*consideredWrong + totalWrong/2) / totalWrong
	}

	// ── One structured AI pass fills all the prose ───────────────────────────
	note := generateNote(ctx, rep, feedback, noteInputs{
		gapConcept:    gapConcept,
		win:           rep.Win,
		voiceQuestion: voice.Question,
		voiceAnswer:   voice.Answer,
		voiceFeedback: voiceFeedback,
		recallPct:     recallPct,
		applyPct:      applyPct,
		conceptGapPct: conceptGapPct,
	})

	rep.Headline = note.Headline
	rep.Narrative = note.Narrative
	rep.Suggestion = note.Suggestion
	if rep.Win != nil {
		rep.Win.Detail = note.WinDetail
	}
	if gapConcept != "" {
		rep.Gap = &Gap{Concept: gapConcept, Explanation: note.GapExplanation}
	}
	if haveVoice {
		voice.Note = note.VoiceNote
		rep.Voice = &voice
	}
	if strings.TrimSpace(note.TonightQuestion) != "" {
		rep.AskTonight = &AskTonight{Question: note.TonightQuestion, Hint: note.TonightHint}
	}
	if recallPct != nil && applyPct != nil {
		rep.Trend = &Trend{RecallPct: *recallPct, ApplyPct: *applyPct, Caption: note.TrendCaption}
	}
	if conceptGapPct >= 0 {
		rep.Careless = &CarelessConcept{ConceptGapPct: conceptGapPct, Verdict: note.CarelessVerdict}
	}
	return rep, nil
}

type noteInputs struct {
	gapConcept    string
	win           *Highlight
	voiceQuestion string
	voiceAnswer   string
	voiceFeedback string
	recallPct     *int
	applyPct      *int
	conceptGapPct int
}

type noteOutput struct {
	Headline        string `json:"headline"`
	Narrative       string `json:"narrative"`
	Suggestion      string `json:"suggestion"`
	WinDetail       string `json:"winDetail"`
	GapExplanation  string `json:"gapExplanation"`
	VoiceNote       string `json:"voiceNote"`
	TonightQuestion string `json:"tonightQuestion"`
	TonightHint     string `json:"tonightHint"`
	TrendCaption    string `json:"trendCaption"`
	CarelessVerdict string `json:"carelessVerdict"`
}

// generateNote runs a single AI pass that fills every prose field of the report
// from real, grounded data. Concept names, the verbatim quote and the recall vs
// apply numbers are computed in Go and only described by the AI, so nothing is
// invented. Falls back to deterministic text for narrative + suggestion.
func generateNote(ctx context.Context, rep Report, feedback []string, in noteInputs) noteOutput {
	name := rep.StudentName
	if name == "" {
		name = "your child"
	}
	var sb strings.Builder
	sb.WriteString("You write a warm weekly progress note for the PARENT of an Indian Class 6 student, for an app called BrainMaps.\n")
	sb.WriteString("Tone: warm, calm, encouraging and effort-first — like a thoughtful teacher's note. Be honest but never alarming. Plain language a parent understands; no jargon, no raw scores or percentages.\n\n")
	sb.WriteString(fmt.Sprintf("Student first name: %s\n", name))
	if rep.FocusSubject != "" {
		sb.WriteString("This week's focus subject: " + rep.FocusSubject + ".\n")
	}
	sb.WriteString(fmt.Sprintf("Effort this week: %d practice sessions across %d active days; streak %d days.\n", rep.Effort.Sessions, rep.Effort.ActiveDays, rep.Effort.Streak))
	if in.win != nil {
		extra := ""
		if in.win.AllLevels {
			extra = " (cleared all three levels)"
		}
		sb.WriteString("A real win this week — did well on the concept: \"" + in.win.Concept + "\"" + extra + ".\n")
	}
	if in.gapConcept != "" {
		sb.WriteString("The one thing to look at (the gap to nudge): the concept \"" + in.gapConcept + "\".\n")
	}
	if in.voiceAnswer != "" {
		sb.WriteString("\nThe child's OWN answer to a recent question (verbatim — do NOT quote it back, the parent already sees it):\n")
		if in.voiceQuestion != "" {
			sb.WriteString("Question asked: " + trimTo(in.voiceQuestion, 240) + "\n")
		}
		sb.WriteString("Child's answer: " + trimTo(in.voiceAnswer, 400) + "\n")
		if in.voiceFeedback != "" {
			sb.WriteString("Our grader's note on it: " + trimTo(in.voiceFeedback, 300) + "\n")
		}
	}
	if in.recallPct != nil && in.applyPct != nil {
		sb.WriteString(fmt.Sprintf("\nSkill split: remembering facts %d/100, applying ideas to new situations %d/100.\n", *in.recallPct, *in.applyPct))
	}
	if in.conceptGapPct >= 0 {
		sb.WriteString(fmt.Sprintf("When the child gets something wrong, how much is a genuine concept gap vs just rushing: %d/100 (0 = nearly all rushing/careless, 100 = nearly all a real concept gap, i.e. they took their time and still missed it).\n", in.conceptGapPct))
	}
	if len(feedback) > 0 {
		sb.WriteString("\nMore per-answer feedback for context (do not quote verbatim):\n")
		for i, f := range feedback {
			if i >= 5 {
				break
			}
			sb.WriteString("- " + f + "\n")
		}
	}
	if rep.Effort.Sessions == 0 {
		sb.WriteString("\nNOTE: the child has not practised this week — gently encourage starting one short session; stay positive.\n")
	}

	sb.WriteString("\nReturn JSON ONLY with these keys (omit a key only if you truly have nothing for it):\n")
	sb.WriteString("{\"headline\":\"...\",\"narrative\":\"...\",\"suggestion\":\"...\",\"winDetail\":\"...\",\"gapExplanation\":\"...\",\"voiceNote\":\"...\",\"tonightQuestion\":\"...\",\"tonightHint\":\"...\",\"trendCaption\":\"...\",\"carelessVerdict\":\"...\"}\n")
	sb.WriteString("headline: ONE warm sentence summarising the week for " + name + ", e.g. how far they've come on a concept. No scores.\n")
	sb.WriteString("narrative: 2-3 short sentences to the parent, first name, no scores, no bullets.\n")
	sb.WriteString("suggestion: ONE concrete thing the parent can do this week to help (specific, kind, doable at home).\n")
	if in.win != nil {
		sb.WriteString("winDetail: 1-2 sentences celebrating the win concept above; mention if they cleared all levels.\n")
	}
	if in.gapConcept != "" {
		sb.WriteString("gapExplanation: 1-2 plain-language sentences on what hasn't clicked yet about the gap concept — what the child is mixing up or missing. No jargon.\n")
	}
	if in.voiceAnswer != "" {
		sb.WriteString("voiceNote: 1-2 sentences pointing kindly at what's missing or skipped in the child's own answer above, so the parent sees the gap.\n")
		sb.WriteString("tonightQuestion: ONE simple, friendly question the parent can ask the child tonight to gently probe/strengthen that gap.\n")
		sb.WriteString("tonightHint: ONE sentence telling the parent the answer to nudge toward.\n")
	}
	if in.recallPct != nil && in.applyPct != nil {
		sb.WriteString("trendCaption: ONE sentence comparing how the child is doing on remembering vs applying (use qualitatively, do not quote the numbers).\n")
	}
	if in.conceptGapPct >= 0 {
		sb.WriteString("carelessVerdict: ONE reassuring sentence telling the parent whether the wrong answers are mostly careless rushing or a genuine concept gap, and what that means for how to help (a chat helps a concept gap; slowing down helps rushing). Do not quote the number.\n")
	}

	out := noteOutput{}
	text, err := ai.Complete(ctx, sb.String())
	if err == nil {
		_ = json.Unmarshal([]byte(text), &out)
	}
	if strings.TrimSpace(out.Narrative) == "" {
		out.Narrative = fallbackNarrative(rep)
	}
	if strings.TrimSpace(out.Suggestion) == "" {
		out.Suggestion = fallbackSuggestion(rep)
	}
	return out
}

// subjectLabel maps a DB subject_key to a parent-friendly label.
func subjectLabel(key string) string {
	switch key {
	case "science":
		return "Science"
	case "social_science", "soc":
		return "Social Science"
	case "maths", "math":
		return "Maths"
	case "english_vocab":
		return "English (Vocabulary)"
	case "english_grammar":
		return "English (Grammar)"
	case "english_rc":
		return "English (Reading)"
	case "english_lit":
		return "English (Literature)"
	case "english_writing":
		return "English (Writing)"
	case "":
		return ""
	default:
		if strings.HasPrefix(key, "english") {
			return "English"
		}
		clean := strings.ReplaceAll(key, "_", " ")
		if clean == "" {
			return clean
		}
		return strings.ToUpper(clean[:1]) + clean[1:]
	}
}

// trimTo shortens s to at most n characters, adding an ellipsis when cut.
func trimTo(s string, n int) string {
	s = strings.TrimSpace(s)
	if len(s) <= n {
		return s
	}
	return s[:n] + "…"
}

// Deterministic fallbacks when the AI provider is unavailable.
func fallbackNarrative(rep Report) string {
	name := rep.StudentName
	if name == "" {
		name = "Your child"
	}
	if rep.Effort.Sessions == 0 {
		return name + " hasn't practised this week yet. A short 10-minute session is a great way to restart — every bit of effort counts."
	}
	s := fmt.Sprintf("%s practised %d times across %d days this week", name, rep.Effort.Sessions, rep.Effort.ActiveDays)
	if rep.Effort.Streak > 0 {
		s += fmt.Sprintf(" and is on a %d-day streak", rep.Effort.Streak)
	}
	s += "."
	if len(rep.Improving) > 0 {
		s += " Getting stronger on " + rep.Improving[0].Name + "."
	}
	if len(rep.FocusAreas) > 0 {
		s += " Keep encouraging the work on " + rep.FocusAreas[0].Concept + "."
	}
	return s
}

func fallbackSuggestion(rep Report) string {
	if len(rep.FocusAreas) > 0 {
		return "Spend 10 minutes on Today's Fix together, focusing on " + rep.FocusAreas[0].Concept + "."
	}
	return "Encourage a short 10-minute practice session this week to keep the streak going."
}
