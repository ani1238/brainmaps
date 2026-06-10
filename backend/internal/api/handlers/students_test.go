package handlers

import "testing"

func TestStudentLoginNameNormalization(t *testing.T) {
	input := "  aarav   sharma  "
	got := normalizeStudentName(input)
	want := "aarav sharma"
	if got != want {
		t.Fatalf("normalizeStudentName(%q) = %q, want %q", input, got, want)
	}
}
