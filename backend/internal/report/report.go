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

// Report is the cached parent-report payload.
type Report struct {
	StudentName string      `json:"studentName"`
	WeekStart   string      `json:"weekStart"`
	WeekEnd     string      `json:"weekEnd"`
	Narrative   string      `json:"narrative"`
	Suggestion  string      `json:"suggestion"`
	Effort      Effort      `json:"effort"`
	Mastery     Mastery     `json:"mastery"`
	Improving   []Improving `json:"improving"`
	FocusAreas  []FocusArea `json:"focusAreas"`
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

	// ── AI narrative + suggestion ────────────────────────────────────────────
	narrative, suggestion := generateNarrative(ctx, rep, feedback)
	rep.Narrative = narrative
	rep.Suggestion = suggestion
	return rep, nil
}

func generateNarrative(ctx context.Context, rep Report, feedback []string) (string, string) {
	name := rep.StudentName
	if name == "" {
		name = "your child"
	}
	var sb strings.Builder
	sb.WriteString("You write a warm weekly progress note for the PARENT of an Indian Class 6 student, for an app called BrainMaps.\n")
	sb.WriteString("Tone: encouraging and effort-first. Celebrate effort and progress. Be honest but kind about what to work on.\n\n")
	sb.WriteString(fmt.Sprintf("Student first name: %s\n", name))
	sb.WriteString(fmt.Sprintf("This week: %d practice sessions across %d active days; current streak %d days.\n", rep.Effort.Sessions, rep.Effort.ActiveDays, rep.Effort.Streak))
	sb.WriteString(fmt.Sprintf("Mastery so far: %d strong, %d getting there, %d still to work on (of %d concepts practised).\n", rep.Mastery.Strong, rep.Mastery.Developing, rep.Mastery.Weak, rep.Mastery.Total))
	if len(rep.Improving) > 0 {
		names := make([]string, 0, len(rep.Improving))
		for _, im := range rep.Improving {
			names = append(names, im.Name)
		}
		sb.WriteString("Getting stronger on: " + strings.Join(names, ", ") + ".\n")
	}
	if len(rep.FocusAreas) > 0 {
		names := make([]string, 0, len(rep.FocusAreas))
		for _, fa := range rep.FocusAreas {
			names = append(names, fa.Concept)
		}
		sb.WriteString("Still working on: " + strings.Join(names, ", ") + ".\n")
	}
	if len(feedback) > 0 {
		sb.WriteString("\nExamples of this week's per-answer feedback (for your context, do not quote verbatim):\n")
		for i, f := range feedback {
			if i >= 6 {
				break
			}
			sb.WriteString("- " + f + "\n")
		}
	}
	sb.WriteString("\nWrite JSON ONLY: {\"narrative\":\"...\",\"suggestion\":\"...\"}.\n")
	sb.WriteString("narrative: 2-3 short sentences to the parent. Address the child by first name. No raw scores or percentages. No bullet points.\n")
	sb.WriteString("suggestion: ONE short, concrete action the parent can take this week (e.g. encourage a specific concept, 10 minutes of Today's Fix). One sentence.\n")
	if rep.Effort.Sessions == 0 {
		sb.WriteString("NOTE: the child has not practised this week — gently encourage starting a short session, stay positive.\n")
	}

	text, err := ai.Complete(ctx, sb.String())
	if err != nil {
		return fallbackNarrative(rep), fallbackSuggestion(rep)
	}
	var parsed struct {
		Narrative  string `json:"narrative"`
		Suggestion string `json:"suggestion"`
	}
	if err := json.Unmarshal([]byte(text), &parsed); err != nil || strings.TrimSpace(parsed.Narrative) == "" {
		return fallbackNarrative(rep), fallbackSuggestion(rep)
	}
	if strings.TrimSpace(parsed.Suggestion) == "" {
		parsed.Suggestion = fallbackSuggestion(rep)
	}
	return parsed.Narrative, parsed.Suggestion
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
