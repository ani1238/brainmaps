package handlers

import (
	"strings"
)

// normalizeStudentName collapses internal whitespace and trims a learner's
// display name. Shared by the auth registration handler.
func normalizeStudentName(name string) string {
	return strings.Join(strings.Fields(strings.TrimSpace(name)), " ")
}
