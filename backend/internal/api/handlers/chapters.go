package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	authmw "github.com/ani1238/brainmaps-api/internal/api/middleware"
	"github.com/ani1238/brainmaps-api/internal/cache"
	"github.com/ani1238/brainmaps-api/internal/db"
)

type ChapterResp struct {
	ID           string `json:"id"`
	SubjectKey   string `json:"subjectKey"`
	Name         string `json:"name"`
	Number       int    `json:"number"`
	OrderIdx     int    `json:"orderIdx"`
	ConceptCount int    `json:"conceptCount"`
	Mastered     int    `json:"mastered"`   // concepts STRONG / recall-due
	InProgress   int    `json:"inProgress"` // concepts started but not yet mastered
}

// GET /api/v1/chapters?subject=<key>
// Returns the chapters for a subject scoped to the authenticated learner's own
// board + class, ordered by order_idx, with concept counts and the student's
// per-chapter progress (mastered + in-progress) for the brain-map markers.
func GetChapters(w http.ResponseWriter, r *http.Request) {
	subjectKey := r.URL.Query().Get("subject")
	if subjectKey == "" {
		http.Error(w, "subject is required", http.StatusBadRequest)
		return
	}

	userID, ok := authmw.UserID(r.Context())
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}
	studentID, _ := authmw.StudentForUser(r.Context())

	// Cache-aside per student + subject (chapter mastery markers change slowly).
	cacheKey := "chapters:" + studentID + ":" + subjectKey
	if cache.Enabled() {
		var cached []ChapterResp
		if cache.GetJSON(r.Context(), cacheKey, &cached) {
			w.Header().Set("Content-Type", "application/json")
			w.Header().Set("X-Cache", "HIT")
			json.NewEncoder(w).Encode(cached)
			return
		}
	}

	var board string
	var grade int
	if err := db.QueryRow(r.Context(), `
		SELECT board, grade FROM users WHERE id = $1
	`, userID).Scan(&board, &grade); err != nil {
		http.Error(w, "server error", http.StatusInternalServerError)
		return
	}

	rows, err := db.Query(r.Context(), `
		SELECT ch.id, ch.subject_key, ch.name, ch.number, ch.order_idx,
		       COUNT(c.id) AS concept_count,
		       COUNT(c.id) FILTER (WHERE cp.state IN ('STRONG','RECALL_DUE')) AS mastered,
		       COUNT(c.id) FILTER (WHERE cp.state IN ('VERY_WEAK','WEAK','DEVELOPING')) AS in_progress
		FROM chapters ch
		LEFT JOIN concepts c ON c.chapter_id = ch.id
		LEFT JOIN concept_progress cp
		       ON cp.concept_id = c.id AND cp.student_id = $4
		WHERE ch.subject_key = $1 AND ch.board = $2 AND ch.grade = $3
		GROUP BY ch.id, ch.subject_key, ch.name, ch.number, ch.order_idx
		ORDER BY ch.order_idx ASC
	`, subjectKey, board, grade, studentID)
	if err != nil {
		serverErr(w, err)
		return
	}
	defer rows.Close()

	chapters := make([]ChapterResp, 0)
	for rows.Next() {
		var ch ChapterResp
		if err := rows.Scan(&ch.ID, &ch.SubjectKey, &ch.Name, &ch.Number, &ch.OrderIdx, &ch.ConceptCount, &ch.Mastered, &ch.InProgress); err != nil {
			continue
		}
		chapters = append(chapters, ch)
	}

	// Brain-map chapter markers change only when a concept becomes fully
	// mastered (rare), so they can be cached well beyond a single session.
	cache.SetJSON(r.Context(), cacheKey, chapters, 10*time.Minute)
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Cache", "MISS")
	json.NewEncoder(w).Encode(chapters)
}
