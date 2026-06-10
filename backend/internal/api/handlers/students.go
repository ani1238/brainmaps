package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/ani1238/brainmaps-api/internal/db"
	"github.com/ani1238/brainmaps-api/internal/models"
	"github.com/jackc/pgx/v5"
)

type studentLoginReq struct {
	Name  string `json:"name"`
	Grade int    `json:"grade"`
	Board string `json:"board"`
}

func normalizeStudentName(name string) string {
	return strings.Join(strings.Fields(strings.TrimSpace(name)), " ")
}

// POST /students/login
// Passwordless v1: match an existing student by name, or create a new profile.
func LoginStudent(w http.ResponseWriter, r *http.Request) {
	var req studentLoginReq
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

	var student models.Student
	err := db.Pool.QueryRow(r.Context(), `
		SELECT id, name, grade, board, created_at
		FROM students
		WHERE lower(trim(name)) = lower($1)
		ORDER BY created_at
		LIMIT 1
	`, name).Scan(&student.ID, &student.Name, &student.Grade, &student.Board, &student.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		err = db.Pool.QueryRow(r.Context(), `
			INSERT INTO students (name, grade, board)
			VALUES ($1, $2, $3)
			RETURNING id, name, grade, board, created_at
		`, name, req.Grade, req.Board).Scan(
			&student.ID, &student.Name, &student.Grade, &student.Board, &student.CreatedAt,
		)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(student)
}
