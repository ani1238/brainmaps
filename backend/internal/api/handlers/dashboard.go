package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	authmw "github.com/ani1238/brainmaps-api/internal/api/middleware"
	"github.com/ani1238/brainmaps-api/internal/cache"
	"github.com/ani1238/brainmaps-api/internal/db"
)

// ── Response shapes ─────────────────────────────────────────────────────────

type StreakInfo struct {
	Days       int `json:"days"`
	Best       int `json:"best"`
	ActiveDays int `json:"activeDays"` // active days in the last 30
}

type MasteryDist struct {
	Strong     int `json:"strong"`
	Developing int `json:"developing"`
	Weak       int `json:"weak"`
	VeryWeak   int `json:"veryWeak"`
	NotStarted int `json:"notStarted"`
	Total      int `json:"total"`
}

type SubjectRollup struct {
	Key       string `json:"key"`
	Total     int    `json:"total"`
	Attempted int    `json:"attempted"`
	Strong    int    `json:"strong"`
	Pct       int    `json:"pct"`
}

type ActivityDay struct {
	Date     string `json:"date"` // YYYY-MM-DD
	Sessions int    `json:"sessions"`
}

type ConceptDelta struct {
	ConceptID string  `json:"conceptId"`
	Name      string  `json:"name"`
	Delta     float64 `json:"delta"`
}

type ConceptNote struct {
	ConceptID string `json:"conceptId"`
	Name      string `json:"name"`
	Note      string `json:"note"`
}

type DashboardResp struct {
	Streak         StreakInfo      `json:"streak"`
	Mastery        MasteryDist     `json:"mastery"`
	Subjects       []SubjectRollup `json:"subjects"`
	Activity       []ActivityDay   `json:"activity"`
	Improving      []ConceptDelta  `json:"improving"`
	NeedsAttention []ConceptNote   `json:"needsAttention"`
}

func activeStreakDays(storedDays, daysSinceActivity int) int {
	if daysSinceActivity < 0 || daysSinceActivity > 1 {
		return 0
	}
	return storedDays
}

// GET /api/v1/dashboard?student=<uuid>
// Aggregates everything the Today Home + My Progress screens need.
func GetDashboard(w http.ResponseWriter, r *http.Request) {
	studentID := r.URL.Query().Get("student")
	if studentID == "" {
		http.Error(w, "student is required", http.StatusBadRequest)
		return
	}
	if !authmw.AuthorizeStudent(r, studentID) {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}
	ctx := r.Context()

	// Cache-aside: dashboard aggregates are read-heavy and hit Neon (billed per
	// compute-second). Short TTL bounds staleness after a session completes.
	cacheKey := "dash:" + studentID
	if cache.Enabled() {
		var cached DashboardResp
		if cache.GetJSON(ctx, cacheKey, &cached) {
			w.Header().Set("Content-Type", "application/json")
			w.Header().Set("X-Cache", "HIT")
			json.NewEncoder(w).Encode(cached)
			return
		}
	}

	resp := DashboardResp{
		Subjects:       []SubjectRollup{},
		Activity:       []ActivityDay{},
		Improving:      []ConceptDelta{},
		NeedsAttention: []ConceptNote{},
	}

	// ── 1. Per-subject rollup (only the 3 navigable subjects; english_* → english) ──
	rows, err := db.Pool.Query(ctx, `
		SELECT
		  CASE WHEN c.subject_key LIKE 'english%' THEN 'english' ELSE c.subject_key END AS subj,
		  COUNT(*) AS total,
		  COUNT(cp.concept_id) AS attempted,
		  COUNT(*) FILTER (WHERE cp.state IN ('STRONG','RECALL_DUE')) AS strong,
		  COUNT(*) FILTER (WHERE cp.state = 'DEVELOPING') AS developing,
		  COUNT(*) FILTER (WHERE cp.state = 'WEAK') AS weak,
		  COUNT(*) FILTER (WHERE cp.state = 'VERY_WEAK') AS very_weak,
		  COALESCE(SUM(cp.ema_score), 0) AS ema_sum
		FROM concepts c
		LEFT JOIN concept_progress cp ON cp.concept_id = c.id AND cp.student_id = $1
		WHERE c.subject_key IN ('science','social_science') OR c.subject_key LIKE 'english%'
		GROUP BY subj
	`, studentID)
	if err != nil {
		serverErr(w, err)
		return
	}
	tmp := make(map[string]SubjectRollup)
	for rows.Next() {
		var subj string
		var total, attempted, strong, developing, weak, veryWeak int
		var emaSum float64
		if err := rows.Scan(&subj, &total, &attempted, &strong, &developing, &weak, &veryWeak, &emaSum); err != nil {
			continue
		}
		pct := 0
		if total > 0 {
			pct = int(emaSum/float64(total)*100 + 0.5)
		}
		tmp[subj] = SubjectRollup{Key: subj, Total: total, Attempted: attempted, Strong: strong, Pct: pct}

		// Roll into overall mastery distribution
		resp.Mastery.Total += total
		resp.Mastery.Strong += strong
		resp.Mastery.Developing += developing
		resp.Mastery.Weak += weak
		resp.Mastery.VeryWeak += veryWeak
		resp.Mastery.NotStarted += total - attempted
	}
	rows.Close()
	for _, k := range []string{"science", "social_science", "english"} {
		if s, ok := tmp[k]; ok {
			resp.Subjects = append(resp.Subjects, s)
		}
	}

	// ── 2. Streak ────────────────────────────────────────────────────────────
	var storedStreak, daysSinceActivity int
	db.Pool.QueryRow(ctx, `
		SELECT COALESCE(streak_days, 0),
		       COALESCE(streak_best, 0),
		       COALESCE(current_date - streak_last_date, 2147483647)
		FROM students
		WHERE id = $1
	`, studentID).Scan(&storedStreak, &resp.Streak.Best, &daysSinceActivity)
	resp.Streak.Days = activeStreakDays(storedStreak, daysSinceActivity)

	// ── 3. Activity — last 30 days (sessions per day) ──────────────────────────
	counts := map[string]int{}
	actRows, err := db.Pool.Query(ctx, `
		SELECT to_char(completed_at::date, 'YYYY-MM-DD') AS d, COUNT(*) AS n
		FROM sessions
		WHERE student_id = $1 AND completed_at IS NOT NULL
		  AND completed_at >= now() - interval '30 days'
		GROUP BY d
	`, studentID)
	if err == nil {
		for actRows.Next() {
			var d string
			var n int
			if actRows.Scan(&d, &n) == nil {
				counts[d] = n
			}
		}
		actRows.Close()
	}
	today := time.Now().UTC()
	for i := 29; i >= 0; i-- {
		day := today.AddDate(0, 0, -i).Format("2006-01-02")
		n := counts[day]
		if n > 0 {
			resp.Streak.ActiveDays++
		}
		resp.Activity = append(resp.Activity, ActivityDay{Date: day, Sessions: n})
	}

	// ── 4. Improving — biggest positive score change over last 2 sessions ──────
	impRows, err := db.Pool.Query(ctx, `
		WITH ranked AS (
		  SELECT s.concept_id, s.score,
		         ROW_NUMBER() OVER (PARTITION BY s.concept_id ORDER BY s.completed_at DESC) rn
		  FROM sessions s
		  WHERE s.student_id = $1 AND s.completed_at IS NOT NULL
		),
		deltas AS (
		  SELECT concept_id,
		         MAX(score) FILTER (WHERE rn = 1) AS latest,
		         MAX(score) FILTER (WHERE rn = 2) AS prev
		  FROM ranked WHERE rn <= 2 GROUP BY concept_id
		)
		SELECT d.concept_id, c.name, (d.latest - d.prev) AS delta
		FROM deltas d JOIN concepts c ON c.id = d.concept_id
		WHERE d.prev IS NOT NULL AND d.latest > d.prev
		  AND (c.subject_key IN ('science','social_science') OR c.subject_key LIKE 'english%')
		ORDER BY delta DESC LIMIT 3
	`, studentID)
	if err == nil {
		for impRows.Next() {
			var cd ConceptDelta
			if impRows.Scan(&cd.ConceptID, &cd.Name, &cd.Delta) == nil {
				resp.Improving = append(resp.Improving, cd)
			}
		}
		impRows.Close()
	}

	// ── 5. Needs attention — needs_fixing station or weak mastery ──────────────
	naRows, err := db.Pool.Query(ctx, `
		SELECT cp.concept_id, c.name,
		       (cp.l1_state='needs_fixing' OR cp.l2_state='needs_fixing' OR cp.l3_state='needs_fixing'
		        OR cp.strengthen_state='needs_fixing') AS flagged
		FROM concept_progress cp JOIN concepts c ON c.id = cp.concept_id
		WHERE cp.student_id = $1
		  AND (c.subject_key IN ('science','social_science') OR c.subject_key LIKE 'english%')
		  AND (cp.l1_state='needs_fixing' OR cp.l2_state='needs_fixing' OR cp.l3_state='needs_fixing'
		       OR cp.strengthen_state='needs_fixing' OR cp.ema_score < 0.45)
		ORDER BY cp.ema_score ASC LIMIT 3
	`, studentID)
	if err == nil {
		for naRows.Next() {
			var cn ConceptNote
			var flagged bool
			if naRows.Scan(&cn.ConceptID, &cn.Name, &flagged) == nil {
				if flagged {
					cn.Note = "Flagged for Today's Fix"
				} else {
					cn.Note = "Needs more practice"
				}
				resp.NeedsAttention = append(resp.NeedsAttention, cn)
			}
		}
		naRows.Close()
	}

	// Dashboard aggregates change once per session; a few minutes of staleness
	// is fine and keeps Neon load low.
	cache.SetJSON(ctx, cacheKey, resp, 3*time.Minute)
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Cache", "MISS")
	json.NewEncoder(w).Encode(resp)
}
