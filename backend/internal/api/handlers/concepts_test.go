package handlers

import (
	"reflect"
	"testing"

	"github.com/ani1238/brainmaps-api/internal/models"
)

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
			name: "matches case insensitively and caps at six diverse questions",
			all:  questions,
			weak: []string{" Fractions "},
			want: []string{"q1", "q3", "q5", "q6", "q4", "q7"},
		},
		{
			name: "pads a weakness match with diverse remaining questions",
			all:  questions[:6],
			weak: []string{"decimals"},
			want: []string{"q2", "q3", "q4", "q5", "q6", "q1"},
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
