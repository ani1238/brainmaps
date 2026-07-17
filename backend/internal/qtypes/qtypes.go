// Package qtypes implements the BrainMaps v12 payload-driven question types:
// which types grade deterministically vs. by AI, how to strip answer keys from a
// question payload before serving it (Sanitize), and how to grade a student's
// structured answer while emitting the misconception tags that feed the
// student_weak_concepts moat (Grade).
//
// A question's full structure lives in questions.payload (JSONB). The client
// never sees answer keys — GetConceptQuestions serves Sanitize(payload), and the
// server grades the returned answer against the original payload here.
package qtypes

import (
	"encoding/json"
	"sort"
	"strings"

	"github.com/ani1238/brainmaps-api/internal/models"
)

// objective lists the types graded deterministically on the server (instant, no
// AI cost). Every other type is either self-rated (BLURT) or AI-graded.
var objective = map[models.QuestionType]bool{
	models.MCQ:             true,
	models.StoryMCQ:        true,
	models.HOTSMCQ:         true,
	models.ContextClue:     true,
	models.AssertionReason: true,
	models.ConclusionDraw:  true,
	models.SpotIt:          true,
	models.Classify:        true,
	models.Match:           true,
	models.Sequence:        true,
	models.Cloze:           true,
	models.TrueFalseWhy:    true,
	models.PredictJustify:  true,
	models.EvidenceHunt:    true,
	models.MCQCluster:      true,
}

// aiGraded lists open-production types routed to the async AI grading queue.
var aiGraded = map[models.QuestionType]bool{
	models.Descriptive:          true,
	models.Feynman:              true,
	models.FixIt:                true,
	models.ProduceIt:            true,
	models.GenerativeProduction: true,
	models.DesignChallenge:      true,
	models.HOTS:                 true,
}

// IsObjective reports whether t is graded deterministically by Grade.
func IsObjective(t models.QuestionType) bool {
	return objective[models.QuestionType(strings.ToUpper(string(t)))]
}

// IsAIGraded reports whether t must go through the async AI grading queue.
func IsAIGraded(t models.QuestionType) bool {
	return aiGraded[models.QuestionType(strings.ToUpper(string(t)))]
}

// answerKeyFields are top-level payload keys that reveal the answer and must be
// removed before a payload is sent to the client.
var answerKeyFields = []string{
	"explanation", "hint", "correctOptionId", "correct_reason", "correct_prediction",
	"correct_justify", "correct_key", "correct_order", "correct_sentence_id",
	"error_id", "misconception_label", "example_answer", "rubric_points", "key_concepts",
	"key_points", "recall_guide", "verdict",
}

// Sanitize returns a client-safe copy of a question payload: every answer key,
// per-option correctness flag, and misconception tag is stripped, and shapes that
// embed the answer in their structure (match pairs, sequence order, classify
// categories, cloze blanks) are transformed into an answerable-but-unsolved form.
func Sanitize(t models.QuestionType, payload json.RawMessage) (json.RawMessage, error) {
	t = models.QuestionType(strings.ToUpper(string(t)))
	if len(payload) == 0 {
		return payload, nil
	}
	var m map[string]any
	if err := json.Unmarshal(payload, &m); err != nil {
		return nil, err
	}
	for _, k := range answerKeyFields {
		delete(m, k)
	}
	stripOptionKeys(m["options"])
	stripOptionKeys(m["reason_options"])
	stripOptionKeys(m["justify_options"])
	stripOptionKeys(m["sentence_options"])

	switch t {
	case models.Classify:
		for _, it := range asSlice(m["items"]) {
			if im, ok := it.(map[string]any); ok {
				delete(im, "correct_category")
			}
		}
	case models.Match:
		lefts, rights := splitPairs(m)
		delete(m, "pairs")
		delete(m, "distractor_rights")
		m["lefts"] = lefts
		m["rights"] = rights
	case models.Sequence:
		// items_scrambled is already the answerable form; drop the answer only.
		delete(m, "correct_order")
	case models.Cloze:
		for _, b := range asSlice(m["blanks"]) {
			if bm, ok := b.(map[string]any); ok {
				delete(bm, "answer")
			}
		}
	case models.MCQCluster:
		for _, sq := range asSlice(m["sub_questions"]) {
			if sm, ok := sq.(map[string]any); ok {
				delete(sm, "correctOptionId")
				stripOptionKeys(sm["options"])
			}
		}
	}
	return json.Marshal(m)
}

// Grade deterministically grades a student's answer for an objective type. It
// returns whether the answer is correct and the misconception tag(s) triggered by
// the wrong choice(s) — the signal that compounds in student_weak_concepts. ok is
// false for non-objective types (the caller routes those to AI/self-rating).
func Grade(t models.QuestionType, payload, answer json.RawMessage) (correct bool, tags []string, ok bool) {
	t = models.QuestionType(strings.ToUpper(string(t)))
	if !objective[t] {
		return false, nil, false
	}
	var p map[string]any
	if err := json.Unmarshal(payload, &p); err != nil {
		return false, nil, true
	}
	var a map[string]any
	if len(answer) > 0 {
		_ = json.Unmarshal(answer, &a)
	}

	switch t {
	case models.MCQ, models.StoryMCQ, models.HOTSMCQ, models.ContextClue,
		models.AssertionReason, models.ConclusionDraw:
		return gradeSingleOption(p, "options", str(a, "optionId"))
	case models.SpotIt:
		return gradeSpotIt(p, a)
	case models.TrueFalseWhy:
		return gradeTrueFalseWhy(p, a)
	case models.PredictJustify:
		return gradePredictJustify(p, a)
	case models.EvidenceHunt:
		correct, _, _ = gradeExactID(p, "sentence_options", "correct_sentence_id", str(a, "sentenceId"))
		return correct, nil, true
	case models.Classify:
		return gradeClassify(p, a)
	case models.Match:
		return gradeMatch(p, a)
	case models.Sequence:
		return gradeSequence(p, a)
	case models.Cloze:
		return gradeCloze(p, a)
	case models.MCQCluster:
		return gradeCluster(p, a)
	}
	return false, nil, true
}

// ── option-family grading ────────────────────────────────────────────────────

func gradeSingleOption(p map[string]any, field, chosen string) (bool, []string, bool) {
	var correctID string
	tagByID := map[string]string{}
	for _, o := range asSlice(p[field]) {
		om, _ := o.(map[string]any)
		id := str(om, "id")
		if b, _ := om["correct"].(bool); b {
			correctID = id
		}
		if tg := optionTag(om); tg != "" {
			tagByID[id] = tg
		}
	}
	if chosen == correctID && chosen != "" {
		return true, nil, true
	}
	if tg := tagByID[chosen]; tg != "" {
		return false, []string{tg}, true
	}
	return false, nil, true
}

func gradeExactID(p map[string]any, field, correctKey, chosen string) (bool, []string, bool) {
	want, _ := p[correctKey].(string)
	return chosen != "" && chosen == want, nil, true
}

func gradeSpotIt(p, a map[string]any) (bool, []string, bool) {
	want := num(p["error_id"])
	got := num(a["statementId"])
	correct := want == got && a["statementId"] != nil
	var tags []string
	if !correct {
		if lbl, _ := p["misconception_label"].(string); lbl != "" {
			tags = []string{lbl}
		}
	}
	return correct, tags, true
}

func gradeTrueFalseWhy(p, a map[string]any) (bool, []string, bool) {
	verdictOK := strings.EqualFold(str(p, "verdict"), str(a, "verdict"))
	correct, tags, _ := gradeSingleOption(p, "reason_options", str(a, "reasonId"))
	// Two-step AND: both the verdict and the reason must be right.
	return verdictOK && correct, tags, true
}

func gradePredictJustify(p, a map[string]any) (bool, []string, bool) {
	predOK := strings.EqualFold(strings.TrimSpace(str(p, "correct_prediction")),
		strings.TrimSpace(str(a, "prediction")))
	correct, tags, _ := gradeSingleOption(p, "justify_options", str(a, "justifyId"))
	return predOK && correct, tags, true
}

// ── construction grading ─────────────────────────────────────────────────────

func gradeClassify(p, a map[string]any) (bool, []string, bool) {
	assign, _ := a["assignments"].(map[string]any)
	allCorrect := true
	for _, it := range asSlice(p["items"]) {
		im, _ := it.(map[string]any)
		text := str(im, "text")
		want := str(im, "correct_category")
		if str(assign, text) != want {
			allCorrect = false
		}
	}
	return allCorrect && len(assign) > 0, nil, true
}

func gradeMatch(p, a map[string]any) (bool, []string, bool) {
	chosen, _ := a["pairs"].(map[string]any)
	allCorrect := true
	n := 0
	for _, pr := range asSlice(p["pairs"]) {
		pm, _ := pr.(map[string]any)
		left := str(pm, "left")
		want := str(pm, "right")
		n++
		if str(chosen, left) != want {
			allCorrect = false
		}
	}
	return allCorrect && len(chosen) == n && n > 0, nil, true
}

func gradeSequence(p, a map[string]any) (bool, []string, bool) {
	want := asStrings(p["correct_order"])
	got := asStrings(a["order"])
	if len(want) == 0 || len(want) != len(got) {
		return false, nil, true
	}
	for i := range want {
		if want[i] != got[i] {
			return false, nil, true
		}
	}
	return true, nil, true
}

func gradeCloze(p, a map[string]any) (bool, []string, bool) {
	filled, _ := a["blanks"].(map[string]any)
	allCorrect := true
	n := 0
	for _, b := range asSlice(p["blanks"]) {
		bm, _ := b.(map[string]any)
		id := numKey(bm["id"])
		want := strings.ToLower(strings.TrimSpace(str(bm, "answer")))
		got := strings.ToLower(strings.TrimSpace(str(filled, id)))
		n++
		if got != want {
			allCorrect = false
		}
	}
	return allCorrect && len(filled) == n && n > 0, nil, true
}

func gradeCluster(p, a map[string]any) (bool, []string, bool) {
	answers, _ := a["answers"].(map[string]any)
	allCorrect := true
	var tags []string
	n := 0
	for _, sq := range asSlice(p["sub_questions"]) {
		sm, _ := sq.(map[string]any)
		id := str(sm, "id")
		n++
		ok, subTags, _ := gradeSingleOption(sm, "options", str(answers, id))
		if !ok {
			allCorrect = false
			tags = append(tags, subTags...)
		}
	}
	return allCorrect && n > 0, dedupe(tags), true
}

// ── helpers ──────────────────────────────────────────────────────────────────

func stripOptionKeys(v any) {
	for _, o := range asSlice(v) {
		if om, ok := o.(map[string]any); ok {
			delete(om, "correct")
			delete(om, "tag")
			delete(om, "misconception_tags")
		}
	}
}

func splitPairs(m map[string]any) (lefts []string, rights []string) {
	for _, pr := range asSlice(m["pairs"]) {
		if pm, ok := pr.(map[string]any); ok {
			lefts = append(lefts, str(pm, "left"))
			rights = append(rights, str(pm, "right"))
		}
	}
	rights = append(rights, asStrings(m["distractor_rights"])...)
	sort.Strings(rights) // stable, deterministic order (client shuffles for display)
	return lefts, rights
}

func optionTag(om map[string]any) string {
	if tg, ok := om["tag"].(string); ok && tg != "" {
		return tg
	}
	if ts := asStrings(om["misconception_tags"]); len(ts) > 0 {
		return ts[0]
	}
	return ""
}

func asSlice(v any) []any {
	s, _ := v.([]any)
	return s
}

func asStrings(v any) []string {
	out := []string{}
	for _, e := range asSlice(v) {
		if s, ok := e.(string); ok {
			out = append(out, s)
		}
	}
	return out
}

func str(m map[string]any, k string) string {
	if m == nil {
		return ""
	}
	s, _ := m[k].(string)
	return s
}

// num coerces a JSON number/int to int (JSON numbers decode as float64).
func num(v any) int {
	switch n := v.(type) {
	case float64:
		return int(n)
	case int:
		return n
	}
	return 0
}

// numKey renders a blank id (float64 or string) as its map-key string form.
func numKey(v any) string {
	switch n := v.(type) {
	case float64:
		return strings.TrimSuffix(strings.TrimRight(trimFloat(n), "."), ".")
	case string:
		return n
	}
	return ""
}

func trimFloat(f float64) string {
	if f == float64(int(f)) {
		return itoa(int(f))
	}
	b, _ := json.Marshal(f)
	return string(b)
}

func itoa(i int) string {
	b, _ := json.Marshal(i)
	return string(b)
}

func dedupe(in []string) []string {
	if len(in) == 0 {
		return nil
	}
	seen := map[string]bool{}
	out := []string{}
	for _, s := range in {
		if !seen[s] {
			seen[s] = true
			out = append(out, s)
		}
	}
	return out
}
