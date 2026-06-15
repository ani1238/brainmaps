package handlers

import "testing"

func TestActiveStreakDays(t *testing.T) {
	tests := []struct {
		name              string
		storedDays        int
		daysSinceActivity int
		want              int
	}{
		{name: "active today", storedDays: 9, daysSinceActivity: 0, want: 9},
		{name: "can continue from yesterday", storedDays: 9, daysSinceActivity: 1, want: 9},
		{name: "expired after missed day", storedDays: 9, daysSinceActivity: 2, want: 0},
		{name: "expired after longer gap", storedDays: 9, daysSinceActivity: 5, want: 0},
		{name: "missing activity date", storedDays: 9, daysSinceActivity: 2147483647, want: 0},
		{name: "future activity date", storedDays: 9, daysSinceActivity: -1, want: 0},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := activeStreakDays(tt.storedDays, tt.daysSinceActivity); got != tt.want {
				t.Fatalf("activeStreakDays(%d, %d) = %d, want %d",
					tt.storedDays, tt.daysSinceActivity, got, tt.want)
			}
		})
	}
}
