package handlers

import (
	"context"
	"strings"

	"github.com/ani1238/brainmaps-api/internal/db"
)

// keyConceptDescriptions loads the concept's curated key-concept map
// (kc_* id -> human-readable description) in a single query, so the review
// loops can translate a question's key_concepts without an N+1 lookup.
func keyConceptDescriptions(ctx context.Context, conceptID string) map[string]string {
	out := map[string]string{}
	rows, err := db.Query(ctx, `
		SELECT key, description
		FROM concept_key_concepts
		WHERE concept_id = $1
	`, conceptID)
	if err != nil {
		return out
	}
	defer rows.Close()
	for rows.Next() {
		var key, desc string
		if err := rows.Scan(&key, &desc); err != nil {
			return out
		}
		out[key] = desc
	}
	return out
}

// buildAnswerGuide produces the student-facing "strong answer guide".
// An authored rubric hint wins; otherwise it expands the question's
// key_concepts into their curated descriptions from the misconception graph.
// Raw kc_* ids are never surfaced: any concept without a description is
// skipped, and an empty result yields an empty guide.
func buildAnswerGuide(rubricHint string, keyConcepts []string, descriptions map[string]string) string {
	if strings.TrimSpace(rubricHint) != "" {
		return rubricHint
	}
	parts := make([]string, 0, len(keyConcepts))
	for _, kc := range keyConcepts {
		if desc := strings.TrimSpace(descriptions[kc]); desc != "" {
			parts = append(parts, desc)
		}
	}
	if len(parts) == 0 {
		return ""
	}
	return "A strong answer includes: " + strings.Join(parts, " ")
}
