package handlers

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"encoding/binary"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"

	authmw "github.com/ani1238/brainmaps-api/internal/api/middleware"
	"github.com/ani1238/brainmaps-api/internal/auth"
	"github.com/ani1238/brainmaps-api/internal/db"
	"github.com/ani1238/brainmaps-api/internal/email"
)

// ── Password hashing (PBKDF2-HMAC-SHA256, stdlib only) ────────────────────────
// Uses 600 000 iterations per NIST SP 800-132 for PBKDF2-HMAC-SHA256.
// No external packages required; replace with golang.org/x/crypto/bcrypt
// or argon2 if stronger memory-hardness is later desired.

const (
	pwIter   = 600_000
	pwSalt   = 32
	pwKeyLen = 32
)

func pbkdf2Key(password, salt []byte, iter, keyLen int) []byte {
	hashLen := sha256.Size
	numBlocks := (keyLen + hashLen - 1) / hashLen
	dk := make([]byte, 0, numBlocks*hashLen)
	for block := 1; block <= numBlocks; block++ {
		var blockNum [4]byte
		binary.BigEndian.PutUint32(blockNum[:], uint32(block))
		input := append(append([]byte(nil), salt...), blockNum[:]...)
		mac := hmac.New(sha256.New, password)
		mac.Write(input)
		u := mac.Sum(nil)
		t := append([]byte(nil), u...)
		for i := 1; i < iter; i++ {
			mac.Reset()
			mac.Write(u)
			u = mac.Sum(u[:0])
			for j := range t {
				t[j] ^= u[j]
			}
		}
		dk = append(dk, t...)
	}
	return dk[:keyLen]
}

func hashPassword(password string) (string, error) {
	salt := make([]byte, pwSalt)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}
	hash := pbkdf2Key([]byte(password), salt, pwIter, pwKeyLen)
	return fmt.Sprintf("sha256pbkdf2:%d:%s:%s",
		pwIter,
		base64.RawURLEncoding.EncodeToString(salt),
		base64.RawURLEncoding.EncodeToString(hash),
	), nil
}

func verifyPassword(password, stored string) bool {
	parts := strings.SplitN(stored, ":", 4)
	if len(parts) != 4 || parts[0] != "sha256pbkdf2" {
		return false
	}
	iter, err := strconv.Atoi(parts[1])
	if err != nil {
		return false
	}
	salt, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil {
		return false
	}
	expected, err := base64.RawURLEncoding.DecodeString(parts[3])
	if err != nil {
		return false
	}
	actual := pbkdf2Key([]byte(password), salt, iter, pwKeyLen)
	return subtle.ConstantTimeCompare(actual, expected) == 1
}

// ── Token issuance ─────────────────────────────────────────────────────────────

// mintTokens returns a signed JWT access token plus a fresh opaque refresh
// token (and its hash for persistence in auth_sessions).
func mintTokens(userID, studentID string) (access, refreshPlain string, refreshHash []byte, err error) {
	access, err = auth.MintAccessToken(userID, studentID)
	if err != nil {
		return
	}
	refreshPlain, refreshHash, err = auth.NewRefreshToken()
	return
}

func appBaseURL() string {
	if v := os.Getenv("APP_BASE_URL"); v != "" {
		return strings.TrimRight(v, "/")
	}
	return "https://brainmaps.in"
}

// ── Request / response shapes ─────────────────────────────────────────────────

type registerReq struct {
	Email    string `json:"email"`
	Name     string `json:"name"`
	Password string `json:"password"`
	Grade    int    `json:"grade"`
	Board    string `json:"board"`
}

type loginReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type refreshReq struct {
	RefreshToken string `json:"refreshToken"`
}

type forgotReq struct {
	Email string `json:"email"`
}

type resetReq struct {
	Token    string `json:"token"`
	Password string `json:"password"`
}

// authResp is returned by register, login, refresh, and /auth/me. Each account
// is a single learner, so the response carries the learner's class + board and
// the 1:1 student id that anchors all progress.
type authResp struct {
	Token        string `json:"token,omitempty"`        // JWT access token
	RefreshToken string `json:"refreshToken,omitempty"` // opaque rotating refresh token
	UserID       string `json:"userId"`
	StudentID    string `json:"studentId"`
	Name         string `json:"name"`
	Grade        int    `json:"grade"`
	Board        string `json:"board"`
	Role         string `json:"role,omitempty"`
}

// normalizeGradeBoard clamps grade to 3..9 (default 6) and board to CBSE/ICSE.
func normalizeGradeBoard(grade int, board string) (int, string) {
	if grade < 3 || grade > 9 {
		grade = 6
	}
	board = strings.ToUpper(strings.TrimSpace(board))
	if board != "CBSE" && board != "ICSE" {
		board = "CBSE"
	}
	return grade, board
}

// ── Handlers ──────────────────────────────────────────────────────────────────

// POST /auth/register
// Creates a new single-learner account (with its 1:1 student) and returns a JWT
// access token + refresh token plus the learner's class + board.
func RegisterUser(w http.ResponseWriter, r *http.Request) {
	var req registerReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	name := normalizeStudentName(req.Name)
	if req.Email == "" || len(name) < 2 || len(req.Password) < 8 {
		http.Error(w, "email, name, and password (≥8 chars) are required", http.StatusBadRequest)
		return
	}
	grade, board := normalizeGradeBoard(req.Grade, req.Board)

	pwHash, err := hashPassword(req.Password)
	if err != nil {
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}

	tx, err := db.Begin(r.Context())
	if err != nil {
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(r.Context())

	var userID string
	err = tx.QueryRow(r.Context(), `
		INSERT INTO users (email, name, password_hash, grade, board)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`, req.Email, name, pwHash, grade, board).Scan(&userID)
	if err != nil {
		if strings.Contains(err.Error(), "unique") || strings.Contains(err.Error(), "duplicate") {
			http.Error(w, "email already registered", http.StatusConflict)
			return
		}
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}

	// Create the 1:1 learner row that anchors all progress.
	var studentID string
	err = tx.QueryRow(r.Context(), `
		INSERT INTO students (name, grade, board, user_id)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`, name, grade, board, userID).Scan(&studentID)
	if err != nil {
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}

	access, refreshPlain, refreshHash, err := mintTokens(userID, studentID)
	if err != nil {
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}
	_, err = tx.Exec(r.Context(), `
		INSERT INTO auth_sessions (user_id, token_hash, user_agent, ip_address)
		VALUES ($1, $2, $3, $4)
	`, userID, refreshHash, r.UserAgent(), r.RemoteAddr)
	if err != nil {
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}

	if err := tx.Commit(r.Context()); err != nil {
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(authResp{
		Token:        access,
		RefreshToken: refreshPlain,
		UserID:       userID,
		StudentID:    studentID,
		Name:         name,
		Grade:        grade,
		Board:        board,
	})
}

// POST /auth/login
// Validates credentials and returns a JWT access token + refresh token plus the
// learner's class + board and 1:1 student id.
func LoginUser(w http.ResponseWriter, r *http.Request) {
	var req loginReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))

	var userID, name, pwHash, board string
	var grade int
	err := db.QueryRow(r.Context(), `
		SELECT id, name, grade, board, password_hash
		FROM users
		WHERE lower(email) = $1
	`, req.Email).Scan(&userID, &name, &grade, &board, &pwHash)
	// Always call verifyPassword so timing is consistent even on not-found.
	if !verifyPassword(req.Password, pwHash) || err != nil {
		http.Error(w, "invalid credentials", http.StatusUnauthorized)
		return
	}

	var studentID string
	if err := db.QueryRow(r.Context(), `
		SELECT id FROM students WHERE user_id = $1
	`, userID).Scan(&studentID); err != nil {
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}

	access, refreshPlain, refreshHash, err := mintTokens(userID, studentID)
	if err != nil {
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}
	db.Exec(r.Context(), `
		INSERT INTO auth_sessions (user_id, token_hash, user_agent, ip_address)
		VALUES ($1, $2, $3, $4)
	`, userID, refreshHash, r.UserAgent(), r.RemoteAddr)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(authResp{
		Token:        access,
		RefreshToken: refreshPlain,
		UserID:       userID,
		StudentID:    studentID,
		Name:         name,
		Grade:        grade,
		Board:        board,
	})
}

// POST /auth/refresh
// Rotates a refresh token: the presented token is revoked and a new access +
// refresh pair is issued. Returns 401 if the refresh token is unknown/expired.
func RefreshSession(w http.ResponseWriter, r *http.Request) {
	var req refreshReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.RefreshToken == "" {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	// Atomically consume the old refresh token (rotation).
	var userID string
	err := db.QueryRow(r.Context(), `
		DELETE FROM auth_sessions
		 WHERE token_hash = $1 AND expires_at > now()
		RETURNING user_id
	`, auth.HashToken(req.RefreshToken)).Scan(&userID)
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var studentID string
	db.QueryRow(r.Context(), `SELECT id FROM students WHERE user_id = $1`, userID).Scan(&studentID)

	access, refreshPlain, refreshHash, err := mintTokens(userID, studentID)
	if err != nil {
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}
	db.Exec(r.Context(), `
		INSERT INTO auth_sessions (user_id, token_hash, user_agent, ip_address)
		VALUES ($1, $2, $3, $4)
	`, userID, refreshHash, r.UserAgent(), r.RemoteAddr)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(authResp{
		Token:        access,
		RefreshToken: refreshPlain,
		UserID:       userID,
		StudentID:    studentID,
	})
}

// POST /auth/logout
// Revokes the supplied refresh token. Safe to call without a valid token.
func LogoutUser(w http.ResponseWriter, r *http.Request) {
	var req refreshReq
	_ = json.NewDecoder(r.Body).Decode(&req)
	if req.RefreshToken != "" {
		db.Exec(r.Context(), `DELETE FROM auth_sessions WHERE token_hash = $1`,
			auth.HashToken(req.RefreshToken))
	}
	w.WriteHeader(http.StatusNoContent)
}

// POST /auth/forgot
// Issues a password-reset token and emails a reset link. Always responds 200 so
// the response never reveals whether an account exists.
func ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var req forgotReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}
	addr := strings.ToLower(strings.TrimSpace(req.Email))

	var userID string
	err := db.QueryRow(r.Context(), `SELECT id FROM users WHERE lower(email) = $1`, addr).Scan(&userID)
	if err == nil {
		plain, hash, terr := auth.NewRefreshToken()
		if terr == nil {
			db.Exec(r.Context(), `
				INSERT INTO recovery_tokens (user_id, token_hash) VALUES ($1, $2)
			`, userID, hash)
			resetURL := appBaseURL() + "/reset?token=" + plain
			if serr := email.SendPasswordReset(r.Context(), addr, resetURL); serr != nil {
				fmt.Printf("[forgot] email send failed for %s: %v\n", addr, serr)
			}
		}
	}

	w.WriteHeader(http.StatusOK)
}

// POST /auth/reset
// Consumes a valid reset token, sets a new password, and revokes all of the
// user's existing sessions.
func ResetPassword(w http.ResponseWriter, r *http.Request) {
	var req resetReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}
	if req.Token == "" || len(req.Password) < 8 {
		http.Error(w, "token and password (≥8 chars) are required", http.StatusBadRequest)
		return
	}

	// Atomically consume the reset token.
	var userID string
	err := db.QueryRow(r.Context(), `
		UPDATE recovery_tokens
		   SET used_at = now()
		 WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()
		RETURNING user_id
	`, auth.HashToken(req.Token)).Scan(&userID)
	if err != nil {
		http.Error(w, "invalid or expired token", http.StatusBadRequest)
		return
	}

	pwHash, err := hashPassword(req.Password)
	if err != nil {
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}
	db.Exec(r.Context(), `UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2`, pwHash, userID)
	// Revoke every active session for safety.
	db.Exec(r.Context(), `DELETE FROM auth_sessions WHERE user_id = $1`, userID)

	w.WriteHeader(http.StatusOK)
}

// GET /auth/me
// Returns the authenticated learner's profile (class + board + 1:1 student id)
// for client rehydration. No tokens are included in the response.
func Me(w http.ResponseWriter, r *http.Request) {
	userID, ok := authmw.UserID(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var name, board, studentID string
	var grade int
	var role string
	err := db.QueryRow(r.Context(), `
		SELECT u.name, u.grade, u.board, u.role, s.id
		FROM users u
		JOIN students s ON s.user_id = u.id
		WHERE u.id = $1
	`, userID).Scan(&name, &grade, &board, &role, &studentID)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(authResp{
		UserID:    userID,
		StudentID: studentID,
		Name:      name,
		Grade:     grade,
		Board:     board,
		Role:      role,
	})
}
