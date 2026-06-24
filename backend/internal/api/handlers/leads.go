package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/ani1238/brainmaps-api/internal/db"
)

type leadReq struct {
	Phone  string `json:"phone"`
	Name   string `json:"name"`
	Note   string `json:"note"`
	Source string `json:"source"`
}

type leadResp struct {
	ID string `json:"id"`
	OK bool   `json:"ok"`
}

// POST /leads
// Captures an enrollment "request a call" lead from the public login/enroll
// form. Unauthenticated by design.
func CreateLead(w http.ResponseWriter, r *http.Request) {
	var req leadReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	phone := strings.TrimSpace(req.Phone)
	// Keep only the digits to gauge validity; store the original formatting.
	digits := strings.Map(func(r rune) rune {
		if r >= '0' && r <= '9' {
			return r
		}
		return -1
	}, phone)
	if len(digits) < 7 {
		http.Error(w, "a valid phone number is required", http.StatusBadRequest)
		return
	}

	source := strings.TrimSpace(req.Source)
	if source == "" {
		source = "login_enroll"
	}
	name := strings.TrimSpace(req.Name)
	note := strings.TrimSpace(req.Note)

	var id string
	err := db.QueryRow(r.Context(), `
		INSERT INTO leads (phone, name, note, source, user_agent, ip_address)
		VALUES ($1, NULLIF($2,''), NULLIF($3,''), $4, $5, $6)
		RETURNING id
	`, phone, name, note, source, r.UserAgent(), r.RemoteAddr).Scan(&id)
	if err != nil {
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(leadResp{ID: id, OK: true})
}
