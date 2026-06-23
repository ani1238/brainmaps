package middleware

import (
	"context"
	"crypto/sha256"
	"net/http"
	"strings"

	"github.com/ani1238/brainmaps-api/internal/db"
)

type contextKey string

const userIDKey contextKey = "userID"

// RequireAuth validates the Bearer token in the Authorization header and
// injects the user ID into the request context. Returns 401 when the
// token is missing, unknown, or expired.
func RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := bearerToken(r)
		if token == "" {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		hash := sha256.Sum256([]byte(token))
		var userID string
		err := db.Pool.QueryRow(r.Context(), `
			UPDATE auth_sessions
			   SET last_used_at = now()
			 WHERE token_hash = $1
			   AND expires_at  > now()
			RETURNING user_id
		`, hash[:]).Scan(&userID)
		if err != nil {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), userIDKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// UserID extracts the authenticated user ID from the context.
// Returns ("", false) if RequireAuth has not run or failed.
func UserID(ctx context.Context) (string, bool) {
	id, ok := ctx.Value(userIDKey).(string)
	return id, ok && id != ""
}

// StudentForUser returns the single student row paired with the authenticated
// user (the learner anchor). Returns ("", false) when unauthenticated or when
// the 1:1 student is missing.
func StudentForUser(ctx context.Context) (string, bool) {
	userID, ok := UserID(ctx)
	if !ok {
		return "", false
	}
	var studentID string
	err := db.Pool.QueryRow(ctx, `
		SELECT id FROM students WHERE user_id = $1
	`, userID).Scan(&studentID)
	if err != nil {
		return "", false
	}
	return studentID, true
}

// AuthorizeStudent returns true iff studentID belongs to the authenticated
// user. Must be called after RequireAuth has injected the user ID.
func AuthorizeStudent(r *http.Request, studentID string) bool {
	userID, ok := UserID(r.Context())
	if !ok || studentID == "" {
		return false
	}
	var exists bool
	db.Pool.QueryRow(r.Context(), `
		SELECT EXISTS(
			SELECT 1 FROM students
			WHERE id = $1 AND user_id = $2
		)
	`, studentID, userID).Scan(&exists)
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
