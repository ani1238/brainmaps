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
		{ID: "q1", KeyConcepts: []string{"fractions"}},
		{ID: "q2", KeyConcepts: []string{"decimals"}},
		{ID: "q3", KeyConcepts: []string{" FRACTIONS "}},
		{ID: "q4", KeyConcepts: []string{"geometry"}},
		{ID: "q5", KeyConcepts: []string{"fractions"}},
		{ID: "q6", KeyConcepts: []string{"fractions"}},
		{ID: "q7", KeyConcepts: []string{"fractions"}},
		{ID: "q8", KeyConcepts: []string{"fractions"}},
	}

	tests := []struct {
		name string
		all  []models.Question
		weak []string
		want []string
	}{
		{
			name: "matches case insensitively and caps at target",
			all:  questions,
			weak: []string{" Fractions "},
			want: []string{"q1", "q3", "q5", "q6", "q7"},
		},
		{
			name: "pads matches with remaining questions",
			all:  questions[:6],
			weak: []string{"decimals"},
			want: []string{"q2", "q1", "q3", "q4", "q5"},
		},
		{
			name: "returns full level when no tags overlap",
			all:  questions[:4],
			weak: []string{"algebra"},
			want: []string{"q1", "q2", "q3", "q4"},
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
			got := selectRetryQuestions(tt.all, tt.weak)
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
