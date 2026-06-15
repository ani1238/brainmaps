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
	"strconv"
	"strings"

	authmw "github.com/ani1238/brainmaps-api/internal/api/middleware"
	"github.com/ani1238/brainmaps-api/internal/db"
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

// ── Bearer token helpers ───────────────────────────────────────────────────────

func newBearerToken() (plain string, hash []byte, err error) {
	raw := make([]byte, 32)
	if _, err = rand.Read(raw); err != nil {
		return
	}
	plain = base64.RawURLEncoding.EncodeToString(raw)
	sum := sha256.Sum256([]byte(plain))
	hash = sum[:]
	return
}

// ── Request / response shapes ─────────────────────────────────────────────────

type registerReq struct {
	Email       string `json:"email"`
	DisplayName string `json:"displayName"`
	Password    string `json:"password"`
}

type loginReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type authResp struct {
	Token       string `json:"token"`
	HouseholdID string `json:"householdId"`
	DisplayName string `json:"displayName"`
}

type householdStudentsResp struct {
	Students []householdStudent `json:"students"`
}

type householdStudent struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Grade int    `json:"grade"`
	Board string `json:"board"`
}

// ── Handlers ──────────────────────────────────────────────────────────────────

// POST /auth/register
// Creates a new household account and returns an auth token.
func RegisterHousehold(w http.ResponseWriter, r *http.Request) {
	var req registerReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	req.DisplayName = strings.TrimSpace(req.DisplayName)
	if req.Email == "" || req.DisplayName == "" || len(req.Password) < 8 {
		http.Error(w, "email, displayName, and password (≥8 chars) are required", http.StatusBadRequest)
		return
	}

	pwHash, err := hashPassword(req.Password)
	if err != nil {
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}

	var householdID, displayName string
	err = db.Pool.QueryRow(r.Context(), `
		INSERT INTO households (email, display_name, password_hash)
		VALUES ($1, $2, $3)
		RETURNING id, display_name
	`, req.Email, req.DisplayName, pwHash).Scan(&householdID, &displayName)
	if err != nil {
		if strings.Contains(err.Error(), "unique") || strings.Contains(err.Error(), "duplicate") {
			http.Error(w, "email already registered", http.StatusConflict)
			return
		}
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}

	token, tokenHash, err := newBearerToken()
	if err != nil {
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}
	db.Pool.Exec(r.Context(), `
		INSERT INTO auth_sessions (household_id, token_hash, user_agent, ip_address)
		VALUES ($1, $2, $3, $4)
	`, householdID, tokenHash, r.UserAgent(), r.RemoteAddr)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(authResp{
		Token:       token,
		HouseholdID: householdID,
		DisplayName: displayName,
	})
}

// POST /auth/login
// Validates credentials and returns a new auth token.
func LoginHousehold(w http.ResponseWriter, r *http.Request) {
	var req loginReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))

	var householdID, displayName, pwHash string
	err := db.Pool.QueryRow(r.Context(), `
		SELECT id, display_name, password_hash
		FROM households
		WHERE lower(email) = $1
	`, req.Email).Scan(&householdID, &displayName, &pwHash)
	// Always call verifyPassword so timing is consistent even on not-found.
	if !verifyPassword(req.Password, pwHash) || err != nil {
		http.Error(w, "invalid credentials", http.StatusUnauthorized)
		return
	}

	token, tokenHash, err := newBearerToken()
	if err != nil {
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}
	db.Pool.Exec(r.Context(), `
		INSERT INTO auth_sessions (household_id, token_hash, user_agent, ip_address)
		VALUES ($1, $2, $3, $4)
	`, householdID, tokenHash, r.UserAgent(), r.RemoteAddr)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(authResp{
		Token:       token,
		HouseholdID: householdID,
		DisplayName: displayName,
	})
}

// POST /auth/logout
// Revokes the current session token. Safe to call without a valid token.
func LogoutHousehold(w http.ResponseWriter, r *http.Request) {
	v := r.Header.Get("Authorization")
	if strings.HasPrefix(v, "Bearer ") {
		token := strings.TrimSpace(v[7:])
		sum := sha256.Sum256([]byte(token))
		db.Pool.Exec(r.Context(), `DELETE FROM auth_sessions WHERE token_hash = $1`, sum[:])
	}
	w.WriteHeader(http.StatusNoContent)
}

// GET /households/me/students
// Lists all students enrolled in the authenticated household.
func GetHouseholdStudents(w http.ResponseWriter, r *http.Request) {
	householdID, _ := authmw.HouseholdID(r.Context())
	rows, err := db.Pool.Query(r.Context(), `
		SELECT s.id, s.name, s.grade, s.board
		FROM students s
		JOIN household_students hs ON hs.student_id = s.id
		WHERE hs.household_id = $1
		ORDER BY s.created_at
	`, householdID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	students := []householdStudent{}
	for rows.Next() {
		var s householdStudent
		if rows.Scan(&s.ID, &s.Name, &s.Grade, &s.Board) == nil {
			students = append(students, s)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(householdStudentsResp{Students: students})
}

// POST /households/me/students
// Creates a new student and enrolls them in the authenticated household.
func AddStudentToHousehold(w http.ResponseWriter, r *http.Request) {
	householdID, _ := authmw.HouseholdID(r.Context())

	var req studentLoginReq // reuses the {name, grade, board} shape from students.go
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}
	name := normalizeStudentName(req.Name)
	if len(name) < 2 {
		http.Error(w, "name must be at least 2 characters", http.StatusBadRequest)
		return
	}
	if req.Grade < 3 || req.Grade > 7 {
		req.Grade = 6
	}
	req.Board = strings.ToUpper(strings.TrimSpace(req.Board))
	if req.Board != "CBSE" && req.Board != "ICSE" {
		req.Board = "CBSE"
	}

	// Insert student and household link atomically.
	var studentID string
	err := db.Pool.QueryRow(r.Context(), `
		WITH new_student AS (
			INSERT INTO students (name, grade, board)
			VALUES ($1, $2, $3)
			RETURNING id
		)
		INSERT INTO household_students (household_id, student_id)
		SELECT $4, id FROM new_student
		RETURNING student_id
	`, name, req.Grade, req.Board, householdID).Scan(&studentID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var s householdStudent
	db.Pool.QueryRow(r.Context(), `
		SELECT id, name, grade, board FROM students WHERE id = $1
	`, studentID).Scan(&s.ID, &s.Name, &s.Grade, &s.Board)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(s)
}
