package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/ani1238/brainmaps-api/internal/db"
	"github.com/ani1238/brainmaps-api/internal/models"
)

// GET /today?student=<uuid>
// Returns the student's Fix queue and Revise queue for the day.
func GetToday(w http.ResponseWriter, r *http.Request) {
	studentID := r.URL.Query().Get("student")
	if studentID == "" {
		http.Error(w, "student is required", http.StatusBadRequest)
		return
	}

	// Fix queue: VERY_WEAK or WEAK concepts, no session in the last 24h
	fixRows, err := db.Pool.Query(r.Context(), `
		SELECT c.id, c.subject_key, c.chapter_id, c.name, c.order_idx,
		       cp.ema_score, cp.state, cp.l1_done, cp.l2_done, cp.l3_done,
		       cp.strengthen_done, cp.total_attempts, cp.last_session_at
		FROM concept_progress cp
		JOIN concepts c ON c.id = cp.concept_id
		WHERE cp.student_id = $1
		  AND cp.state IN ('VERY_WEAK', 'WEAK')
		  AND (cp.last_session_at IS NULL OR cp.last_session_at < now() - INTERVAL '23 hours')
		ORDER BY cp.ema_score ASC
		LIMIT 8
	`, studentID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer fixRows.Close()

	fixQueue := scanConceptProgress(fixRows, studentID)

	// Revise queue: concepts due for spaced repetition today
	revRows, err := db.Pool.Query(r.Context(), `
		SELECT c.id, c.subject_key, c.chapter_id, c.name, c.order_idx,
		       cp.ema_score, cp.state, cp.l1_done, cp.l2_done, cp.l3_done,
		       cp.strengthen_done, cp.total_attempts, cp.last_session_at,
		       rs.interval_days, rs.next_due_at
		FROM revise_schedule rs
		JOIN concepts c ON c.id = rs.concept_id
		LEFT JOIN concept_progress cp
		       ON cp.concept_id = rs.concept_id AND cp.student_id = rs.student_id
		WHERE rs.student_id = $1 AND rs.next_due_at <= now()
		ORDER BY rs.next_due_at ASC
		LIMIT 5
	`, studentID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer revRows.Close()

	reviseQueue := scanConceptProgress(revRows, studentID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(models.TodayResp{
		FixQueue:    fixQueue,
		ReviseQueue: reviseQueue,
	})
}

func scanConceptProgress(rows interface {
	Next() bool
	Scan(...any) error
}, studentID string) []models.ConceptWithProgress {
	var result []models.ConceptWithProgress
	for rows.Next() {
		var cwp models.ConceptWithProgress
		var (
			ema      float64
			state    models.MasteryState
			l1, l2, l3, s bool
			attempts int
			lastAt   *interface{}
			// optional revise columns (may not be present in all queries)
			intervalDays *int
			nextDue      *interface{}
		)

		// Try scanning with revise columns first, fall back if not present
		err := rows.Scan(
			&cwp.ID, &cwp.SubjectKey, &cwp.ChapterID, &cwp.Name, &cwp.OrderIdx,
			&ema, &state, &l1, &l2, &l3, &s, &attempts, &lastAt,
			&intervalDays, &nextDue,
		)
		if err != nil {
			// Try without revise columns
			rows.Scan(
				&cwp.ID, &cwp.SubjectKey, &cwp.ChapterID, &cwp.Name, &cwp.OrderIdx,
				&ema, &state, &l1, &l2, &l3, &s, &attempts, &lastAt,
			)
		}

		cwp.Progress = &models.ConceptProgress{
			StudentID:      studentID,
			ConceptID:      cwp.ID,
			EMAScore:       ema,
			State:          state,
			L1Done:         l1,
			L2Done:         l2,
			L3Done:         l3,
			StrengthenDone: s,
			TotalAttempts:  attempts,
		}
		result = append(result, cwp)
	}
	return result
}
