package qtypes

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/ani1238/brainmaps-api/internal/models"
)

// loadConcept reads the generated Thermometer concept and indexes every item by
// its id, so tests grade against the real authored payloads (not fixtures).
func loadConcept(t *testing.T) map[string]json.RawMessage {
	t.Helper()
	path := filepath.Join("..", "..", "content", "concept_c67_sci_thermometer_measuring_temperature.json")
	raw, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("read concept: %v", err)
	}
	var cf struct {
		Stations map[string]struct {
			Items []json.RawMessage `json:"items"`
		} `json:"stations"`
	}
	if err := json.Unmarshal(raw, &cf); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	byID := map[string]json.RawMessage{}
	for _, st := range cf.Stations {
		for _, it := range st.Items {
			var head struct {
				ID string `json:"id"`
			}
			_ = json.Unmarshal(it, &head)
			byID[head.ID] = it
		}
	}
	return byID
}

func mustJSON(t *testing.T, v any) json.RawMessage {
	t.Helper()
	b, err := json.Marshal(v)
	if err != nil {
		t.Fatal(err)
	}
	return b
}

func TestGrade(t *testing.T) {
	items := loadConcept(t)

	cases := []struct {
		id       string
		qtype    models.QuestionType
		answer   any
		want     bool
		wantTags []string
	}{
		// single-option
		{"L1_MCQ_01", models.MCQ, map[string]any{"optionId": "a"}, true, nil},
		{"L1_MCQ_01", models.MCQ, map[string]any{"optionId": "b"}, false, []string{"confuses_heat_with_temperature"}},
		{"L2_AR_01", models.AssertionReason, map[string]any{"optionId": "a"}, true, nil},
		{"L2_AR_01", models.AssertionReason, map[string]any{"optionId": "c"}, false, []string{"clinical_measures_anything"}},
		{"L3_CD_01", models.ConclusionDraw, map[string]any{"optionId": "a"}, true, nil},
		{"L3_CD_01", models.ConclusionDraw, map[string]any{"optionId": "b"}, false, []string{"clinical_measures_anything"}},
		// spot-it
		{"L2_SPOT_01", models.SpotIt, map[string]any{"statementId": 2}, true, nil},
		{"L2_SPOT_01", models.SpotIt, map[string]any{"statementId": 1}, false, []string{"reads_before_contact"}},
		// two-step: true/false-why
		{"L1_TFW_01", models.TrueFalseWhy, map[string]any{"verdict": "False", "reasonId": "b"}, true, nil},
		{"L1_TFW_01", models.TrueFalseWhy, map[string]any{"verdict": "True", "reasonId": "b"}, false, nil},           // right reason, wrong verdict
		{"L1_TFW_01", models.TrueFalseWhy, map[string]any{"verdict": "False", "reasonId": "a"}, false, []string{"touch_measures_temperature"}}, // wrong reason
		// two-step: predict-justify
		{"L2_PJ_01", models.PredictJustify, map[string]any{"prediction": "Start falling back down as it cools", "justifyId": "a"}, true, nil},
		{"L2_PJ_01", models.PredictJustify, map[string]any{"prediction": "Start falling back down as it cools", "justifyId": "b"}, false, []string{"mercury_never_falls"}},
		// classify
		{"L1_CLS_01", models.Classify, map[string]any{"assignments": map[string]any{
			"Check a child's fever":                        "Clinical thermometer",
			"Measure the temperature of boiling milk":      "Laboratory thermometer",
			"Take a patient's body temperature":            "Clinical thermometer",
			"Measure how cold ice-cold water is":           "Laboratory thermometer",
			"Measure the temperature of warm water in a beaker": "Laboratory thermometer",
		}}, true, nil},
		{"L1_CLS_01", models.Classify, map[string]any{"assignments": map[string]any{
			"Check a child's fever": "Laboratory thermometer",
		}}, false, nil},
		// match
		{"L1_MATCH_01", models.Match, map[string]any{"pairs": map[string]any{
			"Kink (constriction)":      "Stops mercury slipping back so the reading holds",
			"Clinical range 35-42 C":   "Made to fit human body temperature",
			"Celsius scale":            "Water freezes at 0 and boils at 100",
		}}, true, nil},
		{"L1_MATCH_01", models.Match, map[string]any{"pairs": map[string]any{
			"Kink (constriction)":    "Made to fit human body temperature",
			"Clinical range 35-42 C": "Stops mercury slipping back so the reading holds",
			"Celsius scale":          "Water freezes at 0 and boils at 100",
		}}, false, nil},
		// sequence
		{"L1_SEQ_01", models.Sequence, map[string]any{"order": []string{
			"Wash the thermometer and shake it so the mercury falls below 35 C",
			"Place the bulb under the tongue (or in the armpit)",
			"Wait until the mercury stops rising",
			"Read the scale with your eye level with the top of the mercury thread",
		}}, true, nil},
		{"L1_SEQ_01", models.Sequence, map[string]any{"order": []string{
			"Place the bulb under the tongue (or in the armpit)",
			"Wash the thermometer and shake it so the mercury falls below 35 C",
			"Wait until the mercury stops rising",
			"Read the scale with your eye level with the top of the mercury thread",
		}}, false, nil},
		// cloze
		{"L2_CLOZE_01", models.Cloze, map[string]any{"blanks": map[string]any{
			"1": "hotness", "2": "Celsius", "3": "clinical", "4": "kink", "5": "laboratory",
		}}, true, nil},
		{"L2_CLOZE_01", models.Cloze, map[string]any{"blanks": map[string]any{
			"1": "HOTNESS", "2": "celsius", "3": "clinical", "4": "kink", "5": "laboratory",
		}}, true, nil}, // case-insensitive
		{"L2_CLOZE_01", models.Cloze, map[string]any{"blanks": map[string]any{
			"1": "weight", "2": "Celsius", "3": "clinical", "4": "kink", "5": "laboratory",
		}}, false, nil},
		// mcq_cluster — all sub-questions must be right
		{"L3_CLUSTER_01", models.MCQCluster, map[string]any{"answers": map[string]any{
			"L3_CLUSTER_01_s1": "a", "L3_CLUSTER_01_s2": "a", "L3_CLUSTER_01_s3": "a",
		}}, true, nil},
		{"L3_CLUSTER_01", models.MCQCluster, map[string]any{"answers": map[string]any{
			"L3_CLUSTER_01_s1": "b", "L3_CLUSTER_01_s2": "a", "L3_CLUSTER_01_s3": "a",
		}}, false, []string{"lab_thermometer_for_body"}},
	}

	for _, c := range cases {
		payload, ok := items[c.id]
		if !ok {
			t.Fatalf("item %s not found in concept", c.id)
		}
		correct, tags, graded := Grade(c.qtype, payload, mustJSON(t, c.answer))
		if !graded {
			t.Errorf("%s: expected objective grading", c.id)
			continue
		}
		if correct != c.want {
			t.Errorf("%s: correct = %v, want %v", c.id, correct, c.want)
		}
		if strings.Join(tags, ",") != strings.Join(c.wantTags, ",") {
			t.Errorf("%s: tags = %v, want %v", c.id, tags, c.wantTags)
		}
	}
}

// TestSanitizeStripsAnswers ensures no answer key, correctness flag, or
// misconception tag ever survives into the client-facing payload.
func TestSanitizeStripsAnswers(t *testing.T) {
	items := loadConcept(t)
	leaks := []string{
		"\"correct\"", "\"tag\"", "\"correctOptionId\"", "\"correct_reason\"",
		"\"correct_prediction\"", "\"correct_justify\"", "\"correct_key\"",
		"\"correct_order\"", "\"correct_category\"", "\"correct_sentence_id\"",
		"\"error_id\"", "\"misconception_label\"", "\"misconception_tags\"",
		"\"example_answer\"", "\"rubric_points\"", "\"answer\"", "\"explanation\"",
		"\"verdict\"",
	}
	for id, payload := range items {
		var head struct {
			Type string `json:"type"`
		}
		_ = json.Unmarshal(payload, &head)
		qtype := models.QuestionType(strings.ToUpper(head.Type))
		clean, err := Sanitize(qtype, payload)
		if err != nil {
			t.Fatalf("%s: sanitize: %v", id, err)
		}
		s := string(clean)
		for _, leak := range leaks {
			if strings.Contains(s, leak) {
				t.Errorf("%s (%s): sanitized payload leaks %s\n%s", id, qtype, leak, s)
			}
		}
	}
}

// TestSanitizeMatchIsAnswerable checks the match transform still gives the client
// something to answer with (lefts + a combined pool of rights).
func TestSanitizeMatchIsAnswerable(t *testing.T) {
	items := loadConcept(t)
	clean, err := Sanitize(models.Match, items["L1_MATCH_01"])
	if err != nil {
		t.Fatal(err)
	}
	var m map[string]any
	_ = json.Unmarshal(clean, &m)
	if len(asStrings(m["lefts"])) != 3 {
		t.Errorf("expected 3 lefts, got %v", m["lefts"])
	}
	// 3 correct rights + 1 distractor = 4 in the pool.
	if len(asStrings(m["rights"])) != 4 {
		t.Errorf("expected 4 rights in pool, got %v", m["rights"])
	}
	if _, ok := m["pairs"]; ok {
		t.Errorf("pairs (the answer) must not survive sanitize")
	}
}

func TestClassificationOfTypes(t *testing.T) {
	if !IsObjective(models.Classify) || !IsObjective(models.TrueFalseWhy) {
		t.Error("expected classify/true_false_why to be objective")
	}
	if IsObjective(models.DesignChallenge) || IsObjective(models.Descriptive) {
		t.Error("design_challenge/descriptive must not be objective")
	}
	if !IsAIGraded(models.DesignChallenge) || !IsAIGraded(models.Feynman) {
		t.Error("expected design_challenge/feynman to be AI-graded")
	}
}
