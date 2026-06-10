package grade

import "testing"

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
