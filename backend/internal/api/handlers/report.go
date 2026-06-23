package handlers

import (
	"encoding/json"
	"net/http"

	authmw "github.com/ani1238/brainmaps-api/internal/api/middleware"
	"github.com/ani1238/brainmaps-api/internal/db"
	"github.com/ani1238/brainmaps-api/internal/report"
)

type setPinReq struct {
	Pin        string `json:"pin"`
	CurrentPin string `json:"currentPin"`
}

type pinReq struct {
	Pin string `json:"pin"`
}

func isValidPin(p string) bool {
	if len(p) < 4 || len(p) > 6 {
		return false
	}
	for _, c := range p {
		if c < '0' || c > '9' {
			return false
		}
	}
	return true
}

// POST /auth/parent-pin
// Sets or changes the parent PIN. If one already exists, currentPin must match.
func SetParentPin(w http.ResponseWriter, r *http.Request) {
	userID, ok := authmw.UserID(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	var req setPinReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}
	if !isValidPin(req.Pin) {
		http.Error(w, "PIN must be 4–6 digits", http.StatusBadRequest)
		return
	}

	var existing *string
	db.Pool.QueryRow(r.Context(), `SELECT parent_pin_hash FROM users WHERE id = $1`, userID).Scan(&existing)
	if existing != nil && *existing != "" {
		// Changing an existing PIN requires the current one.
		if !verifyPassword(req.CurrentPin, *existing) {
			http.Error(w, "current PIN is incorrect", http.StatusUnauthorized)
			return
		}
	}

	hash, err := hashPassword(req.Pin)
	if err != nil {
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}
	if _, err := db.Pool.Exec(r.Context(), `UPDATE users SET parent_pin_hash = $1, updated_at = now() WHERE id = $2`, hash, userID); err != nil {
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// GET /report/status
// Reports whether a parent PIN has been set (so the client shows create vs enter).
func ReportStatus(w http.ResponseWriter, r *http.Request) {
	userID, ok := authmw.UserID(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	var existing *string
	db.Pool.QueryRow(r.Context(), `SELECT parent_pin_hash FROM users WHERE id = $1`, userID).Scan(&existing)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"pinSet": existing != nil && *existing != ""})
}

// POST /report
// Verifies the parent PIN, then returns today's cached report (generating it on
// the first request of the day).
func GetParentReport(w http.ResponseWriter, r *http.Request) {
	userID, ok := authmw.UserID(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	var req pinReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	var pinHash *string
	db.Pool.QueryRow(r.Context(), `SELECT parent_pin_hash FROM users WHERE id = $1`, userID).Scan(&pinHash)
	if pinHash == nil || *pinHash == "" {
		http.Error(w, "parent PIN not set", http.StatusBadRequest)
		return
	}
	if !verifyPassword(req.Pin, *pinHash) {
		http.Error(w, "incorrect PIN", http.StatusUnauthorized)
		return
	}

	studentID, ok := authmw.StudentForUser(r.Context())
	if !ok {
		http.Error(w, "no learner profile", http.StatusNotFound)
		return
	}

	// Serve today's cached report if present.
	var cached []byte
	err := db.Pool.QueryRow(r.Context(), `
		SELECT payload FROM parent_reports WHERE student_id = $1 AND report_date = current_date
	`, studentID).Scan(&cached)
	if err == nil && len(cached) > 0 {
		w.Header().Set("Content-Type", "application/json")
		w.Write(cached)
		return
	}

	rep, err := report.Generate(r.Context(), studentID)
	if err != nil {
		http.Error(w, "could not generate report", http.StatusInternalServerError)
		return
	}
	payload, _ := json.Marshal(rep)
	db.Pool.Exec(r.Context(), `
		INSERT INTO parent_reports (student_id, report_date, payload)
		VALUES ($1, current_date, $2)
		ON CONFLICT (student_id, report_date) DO UPDATE SET payload = EXCLUDED.payload, generated_at = now()
	`, studentID, payload)

	w.Header().Set("Content-Type", "application/json")
	w.Write(payload)
}

