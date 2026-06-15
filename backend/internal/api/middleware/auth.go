package middleware

import (
	"context"
	"crypto/sha256"
	"net/http"
	"strings"

	"github.com/ani1238/brainmaps-api/internal/db"
)

type contextKey string

const householdIDKey contextKey = "householdID"

// RequireAuth validates the Bearer token in the Authorization header and
// injects the household ID into the request context. Returns 401 when the
// token is missing, unknown, or expired.
func RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := bearerToken(r)
		if token == "" {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		hash := sha256.Sum256([]byte(token))
		var householdID string
		err := db.Pool.QueryRow(r.Context(), `
			UPDATE auth_sessions
			   SET last_used_at = now()
			 WHERE token_hash = $1
			   AND expires_at  > now()
			RETURNING household_id
		`, hash[:]).Scan(&householdID)
		if err != nil {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), householdIDKey, householdID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// HouseholdID extracts the authenticated household ID from the context.
// Returns ("", false) if RequireAuth has not run or failed.
func HouseholdID(ctx context.Context) (string, bool) {
	id, ok := ctx.Value(householdIDKey).(string)
	return id, ok && id != ""
}

// AuthorizeStudent returns true iff studentID belongs to the authenticated
// household. Must be called after RequireAuth has injected the household ID.
func AuthorizeStudent(r *http.Request, studentID string) bool {
	householdID, ok := HouseholdID(r.Context())
	if !ok || studentID == "" {
		return false
	}
	var exists bool
	db.Pool.QueryRow(r.Context(), `
		SELECT EXISTS(
			SELECT 1 FROM household_students
			WHERE household_id = $1 AND student_id = $2
		)
	`, householdID, studentID).Scan(&exists)
	return exists
}

// bearerToken extracts the token from "Authorization: Bearer <token>".
func bearerToken(r *http.Request) string {
	v := r.Header.Get("Authorization")
	if !strings.HasPrefix(v, "Bearer ") {
		return ""
	}
	return strings.TrimSpace(v[7:])
}
