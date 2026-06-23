package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/ani1238/brainmaps-api/internal/auth"
	"github.com/ani1238/brainmaps-api/internal/db"
)

type contextKey string

const (
	userIDKey    contextKey = "userID"
	studentIDKey contextKey = "studentID"
)

// RequireAuth validates the Bearer JWT access token in the Authorization
// header and injects the user id (and 1:1 student id) into the request
// context. Verification is stateless — no database round-trip. Returns 401
// when the token is missing, malformed, mis-signed, or expired.
func RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := bearerToken(r)
		if token == "" {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		claims, err := auth.VerifyAccessToken(token)
		if err != nil {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		ctx := context.WithValue(r.Context(), userIDKey, claims.Sub)
		ctx = context.WithValue(ctx, studentIDKey, claims.Sid)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// UserID extracts the authenticated user ID from the context.
// Returns ("", false) if RequireAuth has not run or failed.
func UserID(ctx context.Context) (string, bool) {
	id, ok := ctx.Value(userIDKey).(string)
	return id, ok && id != ""
}

// StudentForUser returns the 1:1 student id carried in the access token claims,
// falling back to a DB lookup if the claim is absent. Returns ("", false) when
// unauthenticated or when no student exists.
func StudentForUser(ctx context.Context) (string, bool) {
	if id, ok := ctx.Value(studentIDKey).(string); ok && id != "" {
		return id, true
	}
	userID, ok := UserID(ctx)
	if !ok {
		return "", false
	}
	var studentID string
	if err := db.Pool.QueryRow(ctx, `
		SELECT id FROM students WHERE user_id = $1
	`, userID).Scan(&studentID); err != nil {
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
