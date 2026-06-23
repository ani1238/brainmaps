package grade

import (
	"reflect"
	"testing"

	"github.com/ani1238/brainmaps-api/internal/models"
)

func TestTagStatPassed(t *testing.T) {
	tests := []struct {
		stat tagStat
		want bool
	}{
		{tagStat{Total: 2, Correct: 1}, true},  // exactly 50% passes
		{tagStat{Total: 3, Correct: 1}, false}, // below 50%
		{tagStat{Total: 0, Correct: 0}, false}, // untested never passes
		{tagStat{Total: 4, Correct: 4}, true},
	}
	for _, tt := range tests {
		if got := tt.stat.passed(); got != tt.want {
			t.Errorf("tagStat%+v.passed() = %t, want %t", tt.stat, got, tt.want)
		}
	}
}

func TestDecideTagLifecycle(t *testing.T) {
	tests := []struct {
		name         string
		sessionWeak  map[string]bool
		tested       map[string]tagStat
		wantWrong    []string
		wantProgress []string
	}{
		{
			name:        "weak-only tag is wrong",
			sessionWeak: map[string]bool{"fractions": true},
			tested:      map[string]tagStat{},
			wantWrong:   []string{"fractions"},
		},
		{
			name:         "tested clean tag earns progress",
			sessionWeak:  map[string]bool{},
			tested:       map[string]tagStat{"decimals": {Total: 2, Correct: 2}},
			wantProgress: []string{"decimals"},
		},
		{
			name:        "weakness wins over a clean test",
			sessionWeak: map[string]bool{"fractions": true},
			tested:      map[string]tagStat{"fractions": {Total: 2, Correct: 2}},
			wantWrong:   []string{"fractions"},
		},
		{
			name:        "tested but failed and not flagged weak is neither",
			sessionWeak: map[string]bool{},
			tested:      map[string]tagStat{"geometry": {Total: 3, Correct: 1}},
		},
		{
			name:         "outputs are sorted",
			sessionWeak:  map[string]bool{"zebra": true, "apple": true},
			tested:       map[string]tagStat{"mango": {Total: 1, Correct: 1}, "banana": {Total: 2, Correct: 2}},
			wantWrong:    []string{"apple", "zebra"},
			wantProgress: []string{"banana", "mango"},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			wrong, progress := decideTagLifecycle(tt.sessionWeak, tt.tested)
			if !reflect.DeepEqual(wrong, tt.wantWrong) {
				t.Errorf("wrong = %v, want %v", wrong, tt.wantWrong)
			}
			if !reflect.DeepEqual(progress, tt.wantProgress) {
				t.Errorf("progress = %v, want %v", progress, tt.wantProgress)
			}
		})
	}
}

func TestLevelPassGate(t *testing.T) {
	tests := []struct {
		name  string
		score float64
		want  bool
	}{
		{"score below threshold fails", 0.55, false},
		{"score exactly at threshold passes", 0.60, true},
		{"score above threshold passes", 0.70, true},
		{"retry at passing score still passes (no tag-gate)", 0.65, true},
		{"perfect score passes", 1.0, true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := levelPassGate(tt.score); got != tt.want {
				t.Errorf("levelPassGate(%v) = %t, want %t", tt.score, got, tt.want)
			}
		})
	}
}

func TestNextRecallInterval(t *testing.T) {
	tests := []struct {
		current int
		passed  bool
		want    int
	}{
		{0, true, 1},
		{1, true, 3},
		{3, true, 7},
		{7, true, 21},
		{21, true, 60},
		{60, true, 60},
		{21, false, 1},
	}
	for _, tt := range tests {
		if got := nextRecallInterval(tt.current, tt.passed); got != tt.want {
			t.Errorf("nextRecallInterval(%d, %t) = %d, want %d", tt.current, tt.passed, got, tt.want)
		}
	}
}

func TestNextStationKey(t *testing.T) {
	tests := []struct {
		station models.StationKey
		want    models.StationKey
	}{
		{models.StationLevel1, models.StationLevel2},
		{models.StationLevel2, models.StationLevel3},
		{models.StationLevel3, models.StationStrengthen},
		{models.StationStrengthen, ""},
		{models.StationRevise, ""},
	}

	for _, tt := range tests {
		if got := nextStationKey(tt.station); got != tt.want {
			t.Fatalf("nextStationKey(%q) = %q, want %q", tt.station, got, tt.want)
		}
	}
}
