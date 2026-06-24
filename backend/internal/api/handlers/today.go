package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	authmw "github.com/ani1238/brainmaps-api/internal/api/middleware"
	"github.com/ani1238/brainmaps-api/internal/cache"
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
	if !authmw.AuthorizeStudent(r, studentID) {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	// Cache-aside (short TTL bounds staleness after a session changes the queues).
	cacheKey := "today:" + studentID
	if cache.Enabled() {
		var cached models.TodayResp
		if cache.GetJSON(r.Context(), cacheKey, &cached) {
			w.Header().Set("Content-Type", "application/json")
			w.Header().Set("X-Cache", "HIT")
			json.NewEncoder(w).Encode(cached)
			return
		}
	}

	// Fix queue: every concept with a station that still needs fixing. A failed
	// level should appear immediately and remain here until the student passes it.
	fixRows, err := db.Pool.Query(r.Context(), `
		SELECT c.id, c.subject_key, c.chapter_id, c.name, c.order_idx,
		       cp.ema_score, cp.state,
		       cp.l1_state, cp.l2_state, cp.l3_state,
		       cp.strengthen_state, cp.revise_state, cp.revise_unlocked,
		       cp.total_attempts, cp.last_session_at
		FROM concept_progress cp
		JOIN concepts c ON c.id = cp.concept_id
		WHERE cp.student_id = $1
		  AND (
		        cp.l1_state = 'needs_fixing'
		     OR cp.l2_state = 'needs_fixing'
		     OR cp.l3_state = 'needs_fixing'
		     OR cp.strengthen_state = 'needs_fixing'
		     OR cp.revise_state = 'needs_fixing'
		  )
		ORDER BY cp.ema_score ASC
		LIMIT 8
	`, studentID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer fixRows.Close()

	fixQueue := scanProgressRows(fixRows, studentID, false)

	// Revise queue: concepts due for spaced repetition today
	revRows, err := db.Pool.Query(r.Context(), `
		SELECT c.id, c.subject_key, c.chapter_id, c.name, c.order_idx,
		       cp.ema_score, cp.state,
		       cp.l1_state, cp.l2_state, cp.l3_state,
		       cp.strengthen_state, cp.revise_state, cp.revise_unlocked,
		       cp.total_attempts, cp.last_session_at,
		       rs.interval_days, rs.next_due_at
		FROM revise_schedule rs
		JOIN concepts c ON c.id = rs.concept_id
		JOIN concept_progress cp
		       ON cp.concept_id = rs.concept_id AND cp.student_id = rs.student_id
		WHERE rs.student_id = $1
		  AND rs.next_due_at <= now()
		  AND cp.revise_unlocked
		  AND cp.revise_state <> 'needs_fixing'
		ORDER BY rs.next_due_at ASC
		LIMIT 5
	`, studentID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer revRows.Close()

	reviseQueue := scanProgressRows(revRows, studentID, true)

	upcomingRows, err := db.Pool.Query(r.Context(), `
		SELECT c.id, c.subject_key, c.chapter_id, c.name, c.order_idx,
		       cp.ema_score, cp.state,
		       cp.l1_state, cp.l2_state, cp.l3_state,
		       cp.strengthen_state, cp.revise_state, cp.revise_unlocked,
		       cp.total_attempts, cp.last_session_at,
		       rs.interval_days, rs.next_due_at, rs.last_done_at
		FROM revise_schedule rs
		JOIN concepts c ON c.id = rs.concept_id
		JOIN concept_progress cp
		       ON cp.concept_id = rs.concept_id AND cp.student_id = rs.student_id
		WHERE rs.student_id = $1
		  AND rs.next_due_at > now()
		  AND cp.revise_unlocked
		  AND cp.revise_state <> 'needs_fixing'
		ORDER BY rs.next_due_at ASC
		LIMIT 50
	`, studentID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer upcomingRows.Close()

	upcomingReviseQueue := scanProgressRowsWithLastDone(upcomingRows, studentID)

	resp := models.TodayResp{
		FixQueue:            fixQueue,
		ReviseQueue:         reviseQueue,
		UpcomingReviseQueue: upcomingReviseQueue,
	}
	// Today's Fix/Revise queues are action-sensitive (a just-passed level should
	// drop out quickly), so keep this TTL short.
	cache.SetJSON(r.Context(), cacheKey, resp, 60*time.Second)
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Cache", "MISS")
	json.NewEncoder(w).Encode(resp)
}

// scanProgressRows scans concept+progress rows.
// withRevise=true expects two extra columns: interval_days, next_due_at.
func scanProgressRows(rows interface {
	Next() bool
	Scan(...any) error
}, studentID string, withRevise bool) []models.ConceptWithProgress {
	result := []models.ConceptWithProgress{} // non-nil so JSON encodes [] not null
	for rows.Next() {
		var cwp models.ConceptWithProgress
		var (
			ema                       float64
			state                     models.MasteryState
			l1s, l2s, l3s, strS, revS string
			revUnlocked               bool
			attempts                  int
			lastAt                    interface{}
		)

		var err error
		if withRevise {
			var intervalDays *int
			var nextDue *time.Time
			err = rows.Scan(
				&cwp.ID, &cwp.SubjectKey, &cwp.ChapterID, &cwp.Name, &cwp.OrderIdx,
				&ema, &state,
				&l1s, &l2s, &l3s, &strS, &revS, &revUnlocked,
				&attempts, &lastAt,
				&intervalDays, &nextDue,
			)
			if err == nil && intervalDays != nil && nextDue != nil {
				cwp.ReviseSchedule = &models.ReviseSchedule{
					StudentID:    studentID,
					ConceptID:    cwp.ID,
					IntervalDays: *intervalDays,
					NextDueAt:    *nextDue,
				}
			}
		} else {
			err = rows.Scan(
				&cwp.ID, &cwp.SubjectKey, &cwp.ChapterID, &cwp.Name, &cwp.OrderIdx,
				&ema, &state,
				&l1s, &l2s, &l3s, &strS, &revS, &revUnlocked,
				&attempts, &lastAt,
			)
		}
		if err != nil {
			continue
		}

		cwp.Progress = &models.ConceptProgress{
			StudentID:       studentID,
			ConceptID:       cwp.ID,
			EMAScore:        ema,
			State:           state,
			L1State:         models.StationState(l1s),
			L2State:         models.StationState(l2s),
			L3State:         models.StationState(l3s),
			StrengthenState: models.StationState(strS),
			ReviseState:     models.StationState(revS),
			ReviseUnlocked:  revUnlocked,
			TotalAttempts:   attempts,
		}
		result = append(result, cwp)
	}
	return result
}

func scanProgressRowsWithLastDone(rows interface {
	Next() bool
	Scan(...any) error
}, studentID string) []models.ConceptWithProgress {
	result := []models.ConceptWithProgress{}
	for rows.Next() {
		var cwp models.ConceptWithProgress
		var (
			ema                       float64
			state                     models.MasteryState
			l1s, l2s, l3s, strS, revS string
			revUnlocked               bool
			attempts                  int
			lastAt                    interface{}
			intervalDays              int
			nextDue                   time.Time
			lastDone                  *time.Time
		)
		if err := rows.Scan(
			&cwp.ID, &cwp.SubjectKey, &cwp.ChapterID, &cwp.Name, &cwp.OrderIdx,
			&ema, &state,
			&l1s, &l2s, &l3s, &strS, &revS, &revUnlocked,
			&attempts, &lastAt,
			&intervalDays, &nextDue, &lastDone,
		); err != nil {
			continue
		}
		cwp.Progress = &models.ConceptProgress{
			StudentID:       studentID,
			ConceptID:       cwp.ID,
			EMAScore:        ema,
			State:           state,
			L1State:         models.StationState(l1s),
			L2State:         models.StationState(l2s),
			L3State:         models.StationState(l3s),
			StrengthenState: models.StationState(strS),
			ReviseState:     models.StationState(revS),
			ReviseUnlocked:  revUnlocked,
			TotalAttempts:   attempts,
		}
		cwp.ReviseSchedule = &models.ReviseSchedule{
			StudentID:    studentID,
			ConceptID:    cwp.ID,
			IntervalDays: intervalDays,
			NextDueAt:    nextDue,
			LastDoneAt:   lastDone,
		}
		result = append(result, cwp)
	}
	return result
}
