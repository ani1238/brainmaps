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
	failing := map[string]tagStat{"fractions": {Total: 3, Correct: 1}}
	passing := map[string]tagStat{
		"fractions": {Total: 3, Correct: 2},
		"decimals":  {Total: 2, Correct: 1},
	}

	tests := []struct {
		name     string
		score    float64
		isRetry  bool
		targeted map[string]tagStat
		want     bool
	}{
		{"score below threshold always fails", 0.55, true, nil, false},
		{"first attempt ignores targeted tags", 0.70, false, failing, true},
		{"retry with a failing targeted tag fails", 0.70, true, failing, false},
		{"retry with all targeted tags demonstrated passes", 0.70, true, passing, true},
		{"retry with no targeted tags passes on score", 0.70, true, map[string]tagStat{}, true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := levelPassGate(tt.score, tt.isRetry, tt.targeted); got != tt.want {
				t.Errorf("levelPassGate(%v, %t, %v) = %t, want %t", tt.score, tt.isRetry, tt.targeted, got, tt.want)
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

func TestConfiguredModel(t *testing.T) {
	t.Run("uses stable default", func(t *testing.T) {
		t.Setenv("TEST_MODEL", "")
		if got := configuredModel("TEST_MODEL", "stable-model"); got != "stable-model" {
			t.Fatalf("configuredModel() = %q, want stable-model", got)
		}
	})

	t.Run("uses trimmed override", func(t *testing.T) {
		t.Setenv("TEST_MODEL", "  replacement-model  ")
		if got := configuredModel("TEST_MODEL", "stable-model"); got != "replacement-model" {
			t.Fatalf("configuredModel() = %q, want replacement-model", got)
		}
	})
}
