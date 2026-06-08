package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/ani1238/brainmaps-api/internal/db"
)

type ChapterResp struct {
	ID           string `json:"id"`
	SubjectKey   string `json:"subjectKey"`
	Name         string `json:"name"`
	Number       int    `json:"number"`
	OrderIdx     int    `json:"orderIdx"`
	ConceptCount int    `json:"conceptCount"`
}

// GET /api/v1/chapters?subject=<key>
// Returns all chapters for a subject, ordered by order_idx, with concept counts.
func GetChapters(w http.ResponseWriter, r *http.Request) {
	subjectKey := r.URL.Query().Get("subject")
	if subjectKey == "" {
		http.Error(w, "subject is required", http.StatusBadRequest)
		return
	}

	rows, err := db.Pool.Query(r.Context(), `
		SELECT ch.id, ch.subject_key, ch.name, ch.number, ch.order_idx,
		       COUNT(c.id) AS concept_count
		FROM chapters ch
		LEFT JOIN concepts c ON c.chapter_id = ch.id
		WHERE ch.subject_key = $1
		GROUP BY ch.id, ch.subject_key, ch.name, ch.number, ch.order_idx
		ORDER BY ch.order_idx ASC
	`, subjectKey)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	chapters := make([]ChapterResp, 0)
	for rows.Next() {
		var ch ChapterResp
		if err := rows.Scan(&ch.ID, &ch.SubjectKey, &ch.Name, &ch.Number, &ch.OrderIdx, &ch.ConceptCount); err != nil {
			continue
		}
		chapters = append(chapters, ch)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(chapters)
}
