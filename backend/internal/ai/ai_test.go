package ai

import "testing"

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
