package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	authmw "github.com/ani1238/brainmaps-api/internal/api/middleware"
	"github.com/ani1238/brainmaps-api/internal/db"
	"github.com/ani1238/brainmaps-api/internal/plan"
)

// studentFromReq resolves the authenticated student id (1:1 with the user).
func studentFromReq(r *http.Request) (string, bool) {
	return authmw.StudentForUser(r.Context())
}

func studentGradeBoard(r *http.Request, studentID string) (int, string) {
	var grade int
	var board string
	db.QueryRow(r.Context(), `SELECT grade, board FROM students WHERE id = $1`, studentID).Scan(&grade, &board)
	return grade, board
}

type planResp struct {
	HasPlan  bool          `json:"hasPlan"`
	Settings plan.Settings `json:"settings"`
}

// GET /api/v1/plan — settings + whether a plan has been generated.
func GetPlan(w http.ResponseWriter, r *http.Request) {
	studentID, ok := studentFromReq(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	settings, _, _ := plan.GetSettings(r.Context(), studentID)
	writeJSON(w, planResp{HasPlan: plan.HasPlan(r.Context(), studentID), Settings: settings})
}

// POST /api/v1/plan/generate — (re)generate the year plan. Body: optional Settings.
func GeneratePlan(w http.ResponseWriter, r *http.Request) {
	studentID, ok := studentFromReq(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	settings, _, _ := plan.GetSettings(r.Context(), studentID)
	var body plan.Settings
	if json.NewDecoder(r.Body).Decode(&body) == nil {
		settings = mergeSettings(settings, body)
	}
	grade, board := studentGradeBoard(r, studentID)
	if err := plan.Generate(r.Context(), studentID, grade, board, settings); err != nil {
		serverErr(w, err)
		return
	}
	writeJSON(w, planResp{HasPlan: true, Settings: settings})
}

// POST /api/v1/plan/settings — update pacing without regenerating.
func SavePlanSettings(w http.ResponseWriter, r *http.Request) {
	studentID, ok := studentFromReq(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	current, _, _ := plan.GetSettings(r.Context(), studentID)
	var body plan.Settings
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}
	merged := mergeSettings(current, body)
	if err := plan.SaveSettings(r.Context(), studentID, merged); err != nil {
		serverErr(w, err)
		return
	}
	writeJSON(w, planResp{HasPlan: plan.HasPlan(r.Context(), studentID), Settings: merged})
}

// GET /api/v1/plan/agenda?date=YYYY-MM-DD — the small daily agenda.
func GetAgenda(w http.ResponseWriter, r *http.Request) {
	studentID, ok := studentFromReq(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	date := time.Now()
	if q := r.URL.Query().Get("date"); q != "" {
		if d, err := time.Parse("2006-01-02", q); err == nil {
			date = d
		}
	}
	settings, _, _ := plan.GetSettings(r.Context(), studentID)
	agenda, err := plan.Agenda(r.Context(), studentID, settings, date)
	if err != nil {
		serverErr(w, err)
		return
	}
	writeJSON(w, agenda)
}

// GET /api/v1/plan/items?from=YYYY-MM-DD&to=YYYY-MM-DD — calendar items.
func GetPlanItems(w http.ResponseWriter, r *http.Request) {
	studentID, ok := studentFromReq(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	from := r.URL.Query().Get("from")
	to := r.URL.Query().Get("to")
	if from == "" || to == "" {
		now := time.Now()
		from = now.AddDate(0, 0, -7).Format("2006-01-02")
		to = now.AddDate(0, 0, 35).Format("2006-01-02")
	}
	items, err := plan.Items(r.Context(), studentID, from, to)
	if err != nil {
		serverErr(w, err)
		return
	}
	writeJSON(w, map[string]any{"items": items})
}

// GET /api/v1/plan/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD — learn + revise per day.
func GetCalendar(w http.ResponseWriter, r *http.Request) {
	studentID, ok := studentFromReq(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	from := r.URL.Query().Get("from")
	to := r.URL.Query().Get("to")
	if from == "" || to == "" {
		now := time.Now()
		from = now.AddDate(0, 0, -7).Format("2006-01-02")
		to = now.AddDate(0, 0, 35).Format("2006-01-02")
	}
	entries, err := plan.Calendar(r.Context(), studentID, from, to)
	if err != nil {
		serverErr(w, err)
		return
	}
	writeJSON(w, map[string]any{"entries": entries})
}

type itemMoveReq struct {
	ID   int64  `json:"id"`
	Date string `json:"date"`
}

// POST /api/v1/plan/item/move — reschedule an item.
func MovePlanItem(w http.ResponseWriter, r *http.Request) {
	studentID, ok := studentFromReq(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	var req itemMoveReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.ID == 0 || req.Date == "" {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}
	if _, err := time.Parse("2006-01-02", req.Date); err != nil {
		http.Error(w, "invalid date", http.StatusBadRequest)
		return
	}
	if err := plan.MoveItem(r.Context(), studentID, req.ID, req.Date); err != nil {
		serverErr(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

type itemIDReq struct {
	ID int64 `json:"id"`
}

// POST /api/v1/plan/item/skip — skip an item.
func SkipPlanItem(w http.ResponseWriter, r *http.Request) {
	studentID, ok := studentFromReq(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	var req itemIDReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.ID == 0 {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}
	if err := plan.SkipItem(r.Context(), studentID, req.ID); err != nil {
		serverErr(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// POST /api/v1/plan/reflow — re-spread the overdue revise backlog.
func ReflowPlan(w http.ResponseWriter, r *http.Request) {
	studentID, ok := studentFromReq(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	settings, _, _ := plan.GetSettings(r.Context(), studentID)
	if err := plan.Reflow(r.Context(), studentID, settings); err != nil {
		serverErr(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// GET /api/v1/plan/leaves — list leave ranges.
func GetLeaves(w http.ResponseWriter, r *http.Request) {
	studentID, ok := studentFromReq(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	leaves, err := plan.Leaves(r.Context(), studentID)
	if err != nil {
		serverErr(w, err)
		return
	}
	writeJSON(w, map[string]any{"leaves": leaves})
}

type leaveReq struct {
	Start  string `json:"start"`
	End    string `json:"end"`
	Reason string `json:"reason"`
}

// POST /api/v1/plan/leave — add a leave range and reflow.
func AddLeave(w http.ResponseWriter, r *http.Request) {
	studentID, ok := studentFromReq(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	var req leaveReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}
	start, err1 := time.Parse("2006-01-02", req.Start)
	end, err2 := time.Parse("2006-01-02", req.End)
	if err1 != nil || err2 != nil {
		http.Error(w, "invalid dates", http.StatusBadRequest)
		return
	}
	settings, _, _ := plan.GetSettings(r.Context(), studentID)
	if err := plan.AddLeave(r.Context(), studentID, start, end, req.Reason, settings); err != nil {
		serverErr(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// POST /api/v1/plan/leave/remove — delete a leave range.
func RemoveLeave(w http.ResponseWriter, r *http.Request) {
	studentID, ok := studentFromReq(r)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	var req itemIDReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.ID == 0 {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}
	if err := plan.RemoveLeave(r.Context(), studentID, req.ID); err != nil {
		serverErr(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ── helpers ─────────────────────────────────────────────────────────────────

func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}

// mergeSettings overlays any non-zero fields from `in` onto `base`.
func mergeSettings(base, in plan.Settings) plan.Settings {
	if in.StartDate != "" {
		base.StartDate = in.StartDate
	}
	if in.Timezone != "" {
		base.Timezone = in.Timezone
	}
	if len(in.StudyDays) > 0 {
		base.StudyDays = in.StudyDays
	}
	if in.NewConceptsPerDay > 0 {
		base.NewConceptsPerDay = in.NewConceptsPerDay
	}
	if in.ReviseCapPerDay > 0 {
		base.ReviseCapPerDay = in.ReviseCapPerDay
	}
	if in.FixCapPerDay > 0 {
		base.FixCapPerDay = in.FixCapPerDay
	}
	if in.SubjectsPerWeek > 0 {
		base.SubjectsPerWeek = in.SubjectsPerWeek
	}
	return base
}
