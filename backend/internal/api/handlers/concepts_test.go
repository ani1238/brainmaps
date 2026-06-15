package handlers

import (
	"encoding/json"
	"reflect"
	"strings"
	"testing"

	"github.com/ani1238/brainmaps-api/internal/models"
)

func TestActiveQuestionsDoNotExposeAnswers(t *testing.T) {
	explanation := "The hidden explanation"
	rubric := "The hidden rubric"
	questions := []models.Question{{
		ID:          "q1",
		ConceptID:   "c1",
		Type:        models.MCQ,
		Level:       models.Level1,
		Text:        "Which option is correct?",
		Explanation: &explanation,
		RubricHint:  &rubric,
		KeyConcepts: []string{"hidden key concept"},
		Options: []models.MCQOption{
			{Key: "a", Text: "First", IsCorrect: false},
			{Key: "b", Text: "Second", IsCorrect: true},
		},
	}}

	raw, err := json.Marshal(activeQuestions(questions))
	if err != nil {
		t.Fatal(err)
	}
	body := string(raw)
	for _, forbidden := range []string{
		"isCorrect",
		"explanation",
		"rubricHint",
		"keyConcepts",
		"hidden explanation",
		"hidden rubric",
		"hidden key concept",
	} {
		if strings.Contains(body, forbidden) {
			t.Fatalf("active question response leaked %q: %s", forbidden, body)
		}
	}
	if !strings.Contains(body, `"key":"b"`) || !strings.Contains(body, `"text":"Second"`) {
		t.Fatalf("active question response lost safe option data: %s", body)
	}
}

func TestLevelStateCol(t *testing.T) {
	tests := map[string]string{
		"level1":     "l1_state",
		"level2":     "l2_state",
		"level3":     "l3_state",
		"strengthen": "strengthen_state",
		"revise":     "revise_state",
		"unknown":    "",
	}

	for level, want := range tests {
		t.Run(level, func(t *testing.T) {
			if got := levelStateCol(level); got != want {
				t.Fatalf("levelStateCol(%q) = %q, want %q", level, got, want)
			}
		})
	}
}

func TestSelectRetryQuestions(t *testing.T) {
	questions := []models.Question{
		{ID: "q1", Type: models.MCQ, KeyConcepts: []string{"fractions"}},
		{ID: "q2", Type: models.MCQ, KeyConcepts: []string{"decimals"}},
		{ID: "q3", Type: models.Descriptive, KeyConcepts: []string{" FRACTIONS "}},
		{ID: "q4", Type: models.Feynman, KeyConcepts: []string{"geometry"}},
		{ID: "q5", Type: models.Blurt, KeyConcepts: []string{"fractions"}},
		{ID: "q6", Type: models.ActiveRecall, KeyConcepts: []string{"fractions"}},
		{ID: "q7", Type: models.MCQ, KeyConcepts: []string{"fractions"}},
		{ID: "q8", Type: models.Descriptive, KeyConcepts: []string{"fractions"}},
	}

	tests := []struct {
		name string
		all  []models.Question
		weak []string
		want []string
	}{
		{
			// Single focus tag: 4 on-tag slots (type-diverse) + 2 general.
			name: "matches case insensitively and fills four tag slots plus two general",
			all:  questions,
			weak: []string{" Fractions "},
			want: []string{"q1", "q3", "q5", "q6", "q2", "q4"},
		},
		{
			name: "pads a weakness match with diverse remaining questions",
			all:  questions[:6],
			weak: []string{"decimals"},
			want: []string{"q2", "q1", "q3", "q4", "q5", "q6"},
		},
		{
			name: "uses a compact diverse set when no tags overlap",
			all:  questions,
			weak: []string{"algebra"},
			want: []string{"q1", "q3", "q4", "q5", "q6", "q2"},
		},
		{
			name: "ignores blank weak concepts and blank tags",
			all: []models.Question{
				{ID: "blank", KeyConcepts: []string{""}},
				{ID: "tagged", KeyConcepts: []string{"fractions"}},
			},
			weak: []string{" "},
			want: []string{"blank", "tagged"},
		},
		{
			name: "returns every question when level is below target",
			all:  questions[:3],
			weak: []string{"fractions"},
			want: []string{"q1", "q3", "q2"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := selectRetryQuestions(tt.all, tt.weak, nil)
			gotIDs := make([]string, len(got))
			for i, q := range got {
				gotIDs[i] = q.ID
			}
			if !reflect.DeepEqual(gotIDs, tt.want) {
				t.Fatalf("selected IDs = %v, want %v", gotIDs, tt.want)
			}
		})
	}
}

func TestSelectRetryQuestionsAvoidsLatestAttempt(t *testing.T) {
	questions := []models.Question{
		{ID: "old-fix", Type: models.QuestionType("FIX_IT"), KeyConcepts: []string{"plural nouns"}},
		{ID: "old-spot", Type: models.QuestionType("SPOT_IT"), KeyConcepts: []string{"plural nouns"}},
		{ID: "old-mcq", Type: models.MCQ, KeyConcepts: []string{"plural nouns"}},
		{ID: "new-fix", Type: models.QuestionType("FIX_IT"), KeyConcepts: []string{"plural nouns"}},
		{ID: "new-spot", Type: models.QuestionType("SPOT_IT"), KeyConcepts: []string{"plural nouns"}},
		{ID: "new-produce", Type: models.QuestionType("PRODUCE_IT"), KeyConcepts: []string{"plural nouns"}},
		{ID: "new-desc", Type: models.Descriptive, KeyConcepts: []string{"plural nouns"}},
		{ID: "new-mcq", Type: models.MCQ, KeyConcepts: []string{"plural nouns"}},
		{ID: "new-fix-2", Type: models.QuestionType("FIX_IT"), KeyConcepts: []string{"plural nouns"}},
	}
	recent := map[string]bool{
		"old-fix":  true,
		"old-spot": true,
		"old-mcq":  true,
	}

	got := selectRetryQuestions(questions, []string{"plural nouns"}, recent)
	gotIDs := make([]string, len(got))
	for i, q := range got {
		gotIDs[i] = q.ID
		if recent[q.ID] {
			t.Fatalf("selected recent question %q despite enough unseen alternatives", q.ID)
		}
	}
	want := []string{"new-fix", "new-spot", "new-produce", "new-desc", "new-mcq", "new-fix-2"}
	if !reflect.DeepEqual(gotIDs, want) {
		t.Fatalf("selected IDs = %v, want %v", gotIDs, want)
	}
}

func TestSelectRetryQuestionsReusesRecentOnlyWhenNeeded(t *testing.T) {
	questions := []models.Question{
		{ID: "old-fix", Type: models.QuestionType("FIX_IT"), KeyConcepts: []string{"plural nouns"}},
		{ID: "old-spot", Type: models.QuestionType("SPOT_IT"), KeyConcepts: []string{"plural nouns"}},
		{ID: "new-fix", Type: models.QuestionType("FIX_IT"), KeyConcepts: []string{"plural nouns"}},
		{ID: "new-mcq", Type: models.MCQ, KeyConcepts: []string{"plural nouns"}},
	}
	recent := map[string]bool{"old-fix": true, "old-spot": true}

	got := selectRetryQuestions(questions, []string{"plural nouns"}, recent)
	gotIDs := make([]string, len(got))
	for i, q := range got {
		gotIDs[i] = q.ID
	}
	want := []string{"new-fix", "new-mcq", "old-fix", "old-spot"}
	if !reflect.DeepEqual(gotIDs, want) {
		t.Fatalf("selected IDs = %v, want %v", gotIDs, want)
	}
}

func TestSelectRetryQuestionsAvoidsRecentWithoutMatchingWeakTags(t *testing.T) {
	questions := []models.Question{
		{ID: "old-fix", Type: models.QuestionType("FIX_IT"), KeyConcepts: []string{"plural nouns"}},
		{ID: "new-fix", Type: models.QuestionType("FIX_IT"), KeyConcepts: []string{"abstract nouns"}},
		{ID: "new-spot", Type: models.QuestionType("SPOT_IT"), KeyConcepts: []string{"abstract nouns"}},
	}
	recent := map[string]bool{"old-fix": true}

	got := selectRetryQuestions(questions, []string{"unmatched tag"}, recent)
	gotIDs := make([]string, len(got))
	for i, q := range got {
		gotIDs[i] = q.ID
	}
	want := []string{"new-fix", "new-spot", "old-fix"}
	if !reflect.DeepEqual(gotIDs, want) {
		t.Fatalf("selected IDs = %v, want %v", gotIDs, want)
	}
}

func TestSelectRetryQuestionsTwoTagSlots(t *testing.T) {
	questions := []models.Question{
		{ID: "d1", Type: models.ActiveRecall, KeyConcepts: []string{"fractions", "decimals"}},
		{ID: "a1", Type: models.MCQ, KeyConcepts: []string{"fractions"}},
		{ID: "a2", Type: models.Descriptive, KeyConcepts: []string{"fractions"}},
		{ID: "b1", Type: models.MCQ, KeyConcepts: []string{"decimals"}},
		{ID: "b2", Type: models.Descriptive, KeyConcepts: []string{"decimals"}},
		{ID: "g1", Type: models.MCQ, KeyConcepts: []string{"geometry"}},
		{ID: "g2", Type: models.QuestionType("SPOT_IT"), KeyConcepts: []string{"geometry"}},
	}

	// Two focus tags: 3 top-tag + 2 second-tag + 1 general. The dual-tagged
	// question is consumed by the top tag only.
	got := selectRetryQuestions(questions, []string{"fractions", "decimals"}, nil)
	gotIDs := make([]string, len(got))
	for i, q := range got {
		gotIDs[i] = q.ID
	}
	want := []string{"d1", "a1", "a2", "b1", "b2", "g1"}
	if !reflect.DeepEqual(gotIDs, want) {
		t.Fatalf("selected IDs = %v, want %v", gotIDs, want)
	}
}

func TestSelectRetryQuestionsCapsAtTwoTags(t *testing.T) {
	questions := []models.Question{
		{ID: "x1", Type: models.MCQ, KeyConcepts: []string{"tag one"}},
		{ID: "x2", Type: models.Descriptive, KeyConcepts: []string{"tag one"}},
		{ID: "x3", Type: models.Blurt, KeyConcepts: []string{"tag one"}},
		{ID: "y1", Type: models.MCQ, KeyConcepts: []string{"tag two"}},
		{ID: "y2", Type: models.Descriptive, KeyConcepts: []string{"tag two"}},
		{ID: "z1", Type: models.MCQ, KeyConcepts: []string{"tag three"}},
		{ID: "z2", Type: models.QuestionType("SPOT_IT"), KeyConcepts: []string{"tag three"}},
	}

	// Tag three gets no dedicated slots, but its questions remain eligible
	// for the single general slot.
	got := selectRetryQuestions(questions, []string{"tag one", "tag two", "tag three"}, nil)
	gotIDs := make([]string, len(got))
	for i, q := range got {
		gotIDs[i] = q.ID
	}
	want := []string{"x1", "x2", "x3", "y1", "y2", "z1"}
	if !reflect.DeepEqual(gotIDs, want) {
		t.Fatalf("selected IDs = %v, want %v", gotIDs, want)
	}
}

func TestSelectRetryQuestionsSkipsUncoveredTag(t *testing.T) {
	questions := []models.Question{
		{ID: "y1", Type: models.MCQ, KeyConcepts: []string{"tag two"}},
		{ID: "y2", Type: models.Descriptive, KeyConcepts: []string{"tag two"}},
		{ID: "z1", Type: models.MCQ, KeyConcepts: []string{"tag three"}},
		{ID: "w1", Type: models.Feynman, KeyConcepts: []string{"general"}},
	}

	// "ghost tag" has no bank coverage, so tags two and three are promoted
	// into the two focus slots.
	got := selectRetryQuestions(questions, []string{"ghost tag", "tag two", "tag three"}, nil)
	gotIDs := make([]string, len(got))
	for i, q := range got {
		gotIDs[i] = q.ID
	}
	want := []string{"y1", "y2", "z1", "w1"}
	if !reflect.DeepEqual(gotIDs, want) {
		t.Fatalf("selected IDs = %v, want %v", gotIDs, want)
	}
}

func TestInjectRecheckQuestions(t *testing.T) {
	selected := []models.Question{
		{ID: "s1", Type: models.MCQ},
		{ID: "s2", Type: models.Descriptive, KeyConcepts: []string{"decimals"}},
		{ID: "s3", Type: models.Feynman},
		{ID: "s4", Type: models.Blurt},
		{ID: "s5", Type: models.ActiveRecall},
		{ID: "s6", Type: models.MCQ},
	}
	candidates := []models.Question{
		{ID: "s2", Type: models.Descriptive, KeyConcepts: []string{"decimals"}}, // already in the set
		{ID: "c3", Type: models.MCQ, KeyConcepts: []string{"fractions"}},        // recent — only as last resort
		{ID: "c1", Type: models.Descriptive, KeyConcepts: []string{"fractions"}},
		{ID: "c2", Type: models.MCQ, KeyConcepts: []string{"decimals"}},
	}
	recent := map[string]bool{"c3": true}

	got := injectRecheckQuestions(selected, candidates, []string{"fractions", "decimals"}, recent)
	gotIDs := make([]string, len(got))
	for i, q := range got {
		gotIDs[i] = q.ID
	}
	// Trailing slots are replaced: fractions prefers the unseen c1 over the
	// recent c3; decimals skips the already-present s2 and takes c2.
	want := []string{"s1", "s2", "s3", "s4", "c2", "c1"}
	if !reflect.DeepEqual(gotIDs, want) {
		t.Fatalf("selected IDs = %v, want %v", gotIDs, want)
	}
}

func TestInjectRecheckQuestionsNoOp(t *testing.T) {
	selected := []models.Question{{ID: "s1"}, {ID: "s2"}}
	candidates := []models.Question{{ID: "c1", KeyConcepts: []string{"fractions"}}}

	if got := injectRecheckQuestions(selected, candidates, nil, nil); len(got) != 2 || got[0].ID != "s1" {
		t.Fatalf("expected no-op on empty cleared tags, got %v", got)
	}
	if got := injectRecheckQuestions(selected, nil, []string{"fractions"}, nil); len(got) != 2 || got[1].ID != "s2" {
		t.Fatalf("expected no-op on empty candidates, got %v", got)
	}
}

func TestEnsureDifferentAttemptUsesAlternateQuestion(t *testing.T) {
	selected := []models.Question{
		{ID: "q1", Type: models.MCQ},
		{ID: "q2", Type: models.Descriptive},
		{ID: "q3", Type: models.QuestionType("FIX_IT")},
	}
	all := append(append([]models.Question(nil), selected...), models.Question{
		ID: "q4", Type: models.QuestionType("SPOT_IT"),
	})

	got := ensureDifferentAttempt(selected, all, []string{"q1", "q2", "q3"})
	gotIDs := []string{got[0].ID, got[1].ID, got[2].ID}
	want := []string{"q1", "q2", "q4"}
	if !reflect.DeepEqual(gotIDs, want) {
		t.Fatalf("selected IDs = %v, want %v", gotIDs, want)
	}
}

func TestEnsureDifferentAttemptRotatesSmallPool(t *testing.T) {
	selected := []models.Question{
		{ID: "q1", Type: models.MCQ},
		{ID: "q2", Type: models.QuestionType("FIX_IT")},
		{ID: "q3", Type: models.QuestionType("SPOT_IT")},
	}

	got := ensureDifferentAttempt(selected, selected, []string{"q1", "q2", "q3"})
	gotIDs := []string{got[0].ID, got[1].ID, got[2].ID}
	want := []string{"q2", "q3", "q1"}
	if !reflect.DeepEqual(gotIDs, want) {
		t.Fatalf("selected IDs = %v, want %v", gotIDs, want)
	}
}

func TestEnsureDifferentAttemptKeepsAlreadyDifferentSelection(t *testing.T) {
	selected := []models.Question{{ID: "q2"}, {ID: "q1"}}
	got := ensureDifferentAttempt(selected, selected, []string{"q1", "q2"})
	gotIDs := []string{got[0].ID, got[1].ID}
	want := []string{"q2", "q1"}
	if !reflect.DeepEqual(gotIDs, want) {
		t.Fatalf("selected IDs = %v, want %v", gotIDs, want)
	}
}

func TestSelectDiverseQuestions(t *testing.T) {
	questions := []models.Question{
		{ID: "mcq1", Type: models.MCQ},
		{ID: "mcq2", Type: models.MCQ},
		{ID: "desc1", Type: models.Descriptive},
		{ID: "desc2", Type: models.Descriptive},
		{ID: "feynman", Type: models.Feynman},
		{ID: "blurt", Type: models.Blurt},
		{ID: "recall", Type: models.ActiveRecall},
		{ID: "mcq3", Type: models.MCQ},
	}

	got := selectDiverseQuestions(questions, nil, 6)
	gotIDs := make([]string, len(got))
	for i, q := range got {
		gotIDs[i] = q.ID
	}
	want := []string{"mcq1", "desc1", "feynman", "blurt", "recall", "mcq2"}
	if !reflect.DeepEqual(gotIDs, want) {
		t.Fatalf("selected IDs = %v, want %v", gotIDs, want)
	}
}
