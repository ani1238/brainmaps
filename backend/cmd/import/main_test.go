package main

import "testing"

func TestGloballyUniqueQuestionID(t *testing.T) {
	conceptID := "c5_vocab_antonyms"

	if got := globallyUniqueQuestionID(conceptID, "L1_MCQ_01"); got != "c5_vocab_antonyms__L1_MCQ_01" {
		t.Fatalf("short ID was not namespaced: %q", got)
	}
	if got := globallyUniqueQuestionID(conceptID, "c5_vocab_antonyms_v12_L1_MCQ_01"); got != "c5_vocab_antonyms_v12_L1_MCQ_01" {
		t.Fatalf("already-global ID changed: %q", got)
	}
}

func TestInferEngineType(t *testing.T) {
	tests := map[string]string{
		"evs":             "CONCEPTUAL",
		"english_vocab":   "ENGLISH_VOCAB",
		"english_grammar": "ENGLISH_GRAMMAR",
		"english_lit":     "ENGLISH_LITERATURE",
		"english_writing": "ENGLISH_WRITING",
		"english_rc":      "ENGLISH_COMPREHENSION",
	}
	for subject, want := range tests {
		if got := inferEngineType(subject); got != want {
			t.Fatalf("inferEngineType(%q) = %q, want %q", subject, got, want)
		}
	}
}
