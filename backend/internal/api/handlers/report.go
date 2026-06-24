package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

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
// Verifies the parent PIN, then returns the latest report plus the report
// history and this week's generation count. Generates the very first report if
// none exists yet (so a new parent always sees something).
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
	studentID, status, msg := reportStudentForPin(r.Context(), userID, req.Pin)
	if status != 0 {
		http.Error(w, msg, status)
		return
	}

	// Latest stored report, if any.
	var reportID string
	var payload []byte
	err := db.Pool.QueryRow(r.Context(), `
		SELECT id, payload FROM parent_reports
		WHERE student_id = $1 ORDER BY generated_at DESC LIMIT 1
	`, studentID).Scan(&reportID, &payload)
	if err != nil {
		// No report yet — generate the first one.
		reportID, payload, err = generateAndStore(r.Context(), studentID)
		if err != nil {
			http.Error(w, "could not generate report", http.StatusInternalServerError)
			return
		}
	}

	writeReportBundle(r.Context(), w, studentID, reportID, payload)
}

// POST /report/generate
// On-demand: generates a fresh report, stores it as a new history entry, and
// returns the bundle (the new report is the featured one).
func GenerateParentReport(w http.ResponseWriter, r *http.Request) {
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
	studentID, status, msg := reportStudentForPin(r.Context(), userID, req.Pin)
	if status != 0 {
		http.Error(w, msg, status)
		return
	}

	reportID, payload, err := generateAndStore(r.Context(), studentID)
	if err != nil {
		http.Error(w, "could not generate report", http.StatusInternalServerError)
		return
	}
	writeReportBundle(r.Context(), w, studentID, reportID, payload)
}

type reportItemReq struct {
	Pin string `json:"pin"`
	ID  string `json:"id"`
}

// POST /report/item
// Returns the payload of one of the parent's own past reports by id.
func GetParentReportItem(w http.ResponseWriter, r *http.Request) {
	userID, ok := authmw.UserID(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	var req reportItemReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}
	studentID, status, msg := reportStudentForPin(r.Context(), userID, req.Pin)
	if status != 0 {
		http.Error(w, msg, status)
		return
	}

	var payload []byte
	if err := db.Pool.QueryRow(r.Context(), `
		SELECT payload FROM parent_reports WHERE id = $1 AND student_id = $2
	`, req.ID, studentID).Scan(&payload); err != nil || len(payload) == 0 {
		http.Error(w, "report not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(payload)
}

// reportStudentForPin verifies the parent PIN and returns the learner's student
// id. On failure it returns a non-zero HTTP status and message.
func reportStudentForPin(ctx context.Context, userID, pin string) (string, int, string) {
	var pinHash *string
	db.Pool.QueryRow(ctx, `SELECT parent_pin_hash FROM users WHERE id = $1`, userID).Scan(&pinHash)
	if pinHash == nil || *pinHash == "" {
		return "", http.StatusBadRequest, "parent PIN not set"
	}
	if !verifyPassword(pin, *pinHash) {
		return "", http.StatusUnauthorized, "incorrect PIN"
	}
	studentID, ok := authmw.StudentForUser(ctx)
	if !ok {
		return "", http.StatusNotFound, "no learner profile"
	}
	return studentID, 0, ""
}

// generateAndStore builds a fresh report and persists it as a new history row.
func generateAndStore(ctx context.Context, studentID string) (string, []byte, error) {
	rep, err := report.Generate(ctx, studentID)
	if err != nil {
		return "", nil, err
	}
	payload, _ := json.Marshal(rep)
	var id string
	if err := db.Pool.QueryRow(ctx, `
		INSERT INTO parent_reports (student_id, report_date, payload)
		VALUES ($1, current_date, $2)
		RETURNING id
	`, studentID, payload).Scan(&id); err != nil {
		return "", nil, err
	}
	return id, payload, nil
}

type reportHistoryItem struct {
	ID          string    `json:"id"`
	GeneratedAt time.Time `json:"generatedAt"`
}

type reportBundleResp struct {
	Report      json.RawMessage     `json:"report"`
	ReportID    string              `json:"reportId"`
	History     []reportHistoryItem `json:"history"`
	WeeklyCount int                 `json:"weeklyCount"`
}

// writeReportBundle responds with the featured report plus the student's report
// history and this week's generation count.
func writeReportBundle(ctx context.Context, w http.ResponseWriter, studentID, reportID string, payload []byte) {
	history := []reportHistoryItem{}
	rows, err := db.Pool.Query(ctx, `
		SELECT id, generated_at FROM parent_reports
		WHERE student_id = $1 ORDER BY generated_at DESC LIMIT 50
	`, studentID)
	if err == nil {
		for rows.Next() {
			var it reportHistoryItem
			if rows.Scan(&it.ID, &it.GeneratedAt) == nil {
				history = append(history, it)
			}
		}
		rows.Close()
	}

	var weeklyCount int
	db.Pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM parent_reports
		WHERE student_id = $1 AND generated_at >= date_trunc('week', now())
	`, studentID).Scan(&weeklyCount)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(reportBundleResp{
		Report:      json.RawMessage(payload),
		ReportID:    reportID,
		History:     history,
		WeeklyCount: weeklyCount,
	})
}
