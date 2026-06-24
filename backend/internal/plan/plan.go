// Package plan implements the student study planner: a per-student year plan
// (paced to school), a small daily agenda composed from it, and leave-aware
// reflow so revises never pile up after a break.
package plan

import (
	"context"
	"time"

	"github.com/ani1238/brainmaps-api/internal/db"
)

// ── Settings ────────────────────────────────────────────────────────────────

// Settings is the per-student pacing configuration for the plan.
type Settings struct {
	StartDate         string `json:"startDate"` // YYYY-MM-DD
	Timezone          string `json:"timezone"`
	StudyDays         []int  `json:"studyDays"` // ISO weekdays 1=Mon … 7=Sun
	NewConceptsPerDay int    `json:"newConceptsPerDay"`
	ReviseCapPerDay   int    `json:"reviseCapPerDay"`
	FixCapPerDay      int    `json:"fixCapPerDay"`
	SubjectsPerWeek   int    `json:"subjectsPerWeek"`
}

func defaultSettings() Settings {
	return Settings{
		StartDate:         time.Now().Format("2006-01-02"),
		Timezone:          "Asia/Kolkata",
		StudyDays:         []int{1, 2, 3, 4, 5},
		NewConceptsPerDay: 2,
		ReviseCapPerDay:   5,
		FixCapPerDay:      3,
		SubjectsPerWeek:   3,
	}
}

// GetSettings returns the student's plan settings and whether a plan exists yet.
func GetSettings(ctx context.Context, studentID string) (Settings, bool, error) {
	s := defaultSettings()
	var (
		start time.Time
		days  []int32
	)
	err := db.QueryRow(ctx, `
		SELECT start_date, timezone, study_days,
		       new_concepts_per_day, revise_cap_per_day, fix_cap_per_day, subjects_per_week
		FROM study_plans WHERE student_id = $1
	`, studentID).Scan(
		&start, &s.Timezone, &days,
		&s.NewConceptsPerDay, &s.ReviseCapPerDay, &s.FixCapPerDay, &s.SubjectsPerWeek,
	)
	if err != nil {
		return s, false, nil // no plan yet — return defaults
	}
	s.StartDate = start.Format("2006-01-02")
	s.StudyDays = toIntSlice(days)
	return s, true, nil
}

// SaveSettings upserts the student's plan settings.
func SaveSettings(ctx context.Context, studentID string, s Settings) error {
	s = sanitize(s)
	_, err := db.Exec(ctx, `
		INSERT INTO study_plans
		  (student_id, start_date, timezone, study_days,
		   new_concepts_per_day, revise_cap_per_day, fix_cap_per_day, subjects_per_week, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
		ON CONFLICT (student_id) DO UPDATE SET
		  start_date = EXCLUDED.start_date,
		  timezone = EXCLUDED.timezone,
		  study_days = EXCLUDED.study_days,
		  new_concepts_per_day = EXCLUDED.new_concepts_per_day,
		  revise_cap_per_day = EXCLUDED.revise_cap_per_day,
		  fix_cap_per_day = EXCLUDED.fix_cap_per_day,
		  subjects_per_week = EXCLUDED.subjects_per_week,
		  updated_at = now()
	`, studentID, s.StartDate, s.Timezone, toInt32Slice(s.StudyDays),
		s.NewConceptsPerDay, s.ReviseCapPerDay, s.FixCapPerDay, s.SubjectsPerWeek)
	return err
}

// ── Year-plan generation ────────────────────────────────────────────────────

// Generate (re)builds the full per-concept schedule for a student. It reads the
// grade/board curriculum in (subject, chapter, concept) order, interleaves
// subjects round-robin so they advance in parallel, then packs concepts onto
// study days at the configured daily capacity. Existing items are replaced.
func Generate(ctx context.Context, studentID string, grade int, board string, s Settings) error {
	s = sanitize(s)
	if err := SaveSettings(ctx, studentID, s); err != nil {
		return err
	}

	rows, err := db.Query(ctx, `
		SELECT c.id, c.subject_key
		FROM concepts c
		JOIN subjects sub ON sub.key = c.subject_key
		JOIN chapters ch  ON ch.id = c.chapter_id
		WHERE c.grade = $1 AND c.board = $2
		ORDER BY sub.order_idx, ch.order_idx, c.order_idx
	`, grade, board)
	if err != nil {
		return err
	}
	type concept struct{ id, subject string }
	bySubject := map[string][]concept{}
	subjectOrder := []string{}
	for rows.Next() {
		var c concept
		if err := rows.Scan(&c.id, &c.subject); err != nil {
			rows.Close()
			return err
		}
		if _, seen := bySubject[c.subject]; !seen {
			subjectOrder = append(subjectOrder, c.subject)
		}
		bySubject[c.subject] = append(bySubject[c.subject], c)
	}
	rows.Close()

	// Round-robin across subjects so the daily mix is varied and subjects
	// progress together rather than one-at-a-time.
	sequence := []concept{}
	for {
		progressed := false
		for _, subj := range subjectOrder {
			q := bySubject[subj]
			if len(q) == 0 {
				continue
			}
			sequence = append(sequence, q[0])
			bySubject[subj] = q[1:]
			progressed = true
		}
		if !progressed {
			break
		}
	}
	if len(sequence) == 0 {
		return nil
	}

	start, err := time.Parse("2006-01-02", s.StartDate)
	if err != nil {
		start = time.Now()
	}
	studyDays := daySet(s.StudyDays)
	leaves := loadLeaves(ctx, studentID)

	tx, err := db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	if _, err := tx.Exec(ctx, `DELETE FROM plan_items WHERE student_id = $1`, studentID); err != nil {
		return err
	}

	day := firstOpenDay(start, studyDays, leaves)
	placedToday := 0
	orderIdx := 0
	for _, c := range sequence {
		if placedToday >= s.NewConceptsPerDay {
			day = nextOpenDay(day, studyDays, leaves)
			placedToday = 0
			orderIdx = 0
		}
		if _, err := tx.Exec(ctx, `
			INSERT INTO plan_items (student_id, kind, ref_id, subject_key, planned_date, order_idx, status, source)
			VALUES ($1, 'concept', $2, $3, $4, $5, 'planned', 'auto')
			ON CONFLICT (student_id, ref_id) DO UPDATE
			  SET planned_date = EXCLUDED.planned_date, order_idx = EXCLUDED.order_idx,
			      status = 'planned', source = 'auto', updated_at = now()
		`, studentID, c.id, c.subject, day.Format("2006-01-02"), orderIdx); err != nil {
			return err
		}
		placedToday++
		orderIdx++
	}

	return tx.Commit(ctx)
}

// HasPlan reports whether the student has any plan items yet.
func HasPlan(ctx context.Context, studentID string) bool {
	var exists bool
	db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM plan_items WHERE student_id = $1)`, studentID).Scan(&exists)
	return exists
}

// ── Daily agenda ────────────────────────────────────────────────────────────

type LearnItem struct {
	ConceptID   string `json:"conceptId"`
	ConceptName string `json:"conceptName"`
	SubjectKey  string `json:"subjectKey"`
	PlannedDate string `json:"plannedDate"`
	Overdue     bool   `json:"overdue"`
}

type FixItem struct {
	ConceptID   string `json:"conceptId"`
	ConceptName string `json:"conceptName"`
	SubjectKey  string `json:"subjectKey"`
	Level       string `json:"level"` // station to fix
}

type ReviseItem struct {
	ConceptID   string `json:"conceptId"`
	ConceptName string `json:"conceptName"`
	SubjectKey  string `json:"subjectKey"`
	DueDate     string `json:"dueDate"`
}

type AgendaResp struct {
	Date         string       `json:"date"`
	Learn        []LearnItem  `json:"learn"`
	Fix          []FixItem    `json:"fix"`
	Revise       []ReviseItem `json:"revise"`
	LearnTotal   int          `json:"learnTotal"`  // planned+overdue learn outstanding
	ReviseTotal  int          `json:"reviseTotal"` // total due (uncapped)
	FixTotal     int          `json:"fixTotal"`    // total needs-fixing (uncapped)
	EstMinutes   int          `json:"estMinutes"`
	Status       string       `json:"status"` // ahead | on_track | catching_up | done | on_leave
	PositiveNote string       `json:"positiveNote"`
	OnLeave      bool         `json:"onLeave"`
}

// Agenda composes the small, capped daily plan for the given date.
func Agenda(ctx context.Context, studentID string, s Settings, date time.Time) (AgendaResp, error) {
	s = sanitize(s)
	d := date.Format("2006-01-02")
	out := AgendaResp{Date: d, Learn: []LearnItem{}, Fix: []FixItem{}, Revise: []ReviseItem{}}

	// Learn: today's (and any carried-over) planned concepts, capped.
	lrows, err := db.Query(ctx, `
		SELECT pi.ref_id, c.name, pi.subject_key, pi.planned_date,
		       (pi.planned_date < $2) AS overdue
		FROM plan_items pi
		JOIN concepts c ON c.id = pi.ref_id
		WHERE pi.student_id = $1
		  AND pi.kind = 'concept'
		  AND pi.status IN ('planned','started')
		  AND pi.planned_date <= $2
		ORDER BY pi.planned_date ASC, pi.order_idx ASC
	`, studentID, d)
	if err != nil {
		return out, err
	}
	for lrows.Next() {
		var it LearnItem
		var pd time.Time
		if err := lrows.Scan(&it.ConceptID, &it.ConceptName, &it.SubjectKey, &pd, &it.Overdue); err != nil {
			continue
		}
		it.PlannedDate = pd.Format("2006-01-02")
		out.LearnTotal++
		if len(out.Learn) < s.NewConceptsPerDay {
			out.Learn = append(out.Learn, it)
		}
	}
	lrows.Close()

	// Fix: concepts with a station that needs fixing, capped.
	frows, err := db.Query(ctx, `
		SELECT c.id, c.name, c.subject_key,
		       CASE
		         WHEN cp.l1_state = 'needs_fixing'         THEN 'level1'
		         WHEN cp.l2_state = 'needs_fixing'         THEN 'level2'
		         WHEN cp.l3_state = 'needs_fixing'         THEN 'level3'
		         WHEN cp.strengthen_state = 'needs_fixing' THEN 'strengthen'
		         ELSE 'revise'
		       END AS level
		FROM concept_progress cp
		JOIN concepts c ON c.id = cp.concept_id
		WHERE cp.student_id = $1
		  AND (cp.l1_state = 'needs_fixing' OR cp.l2_state = 'needs_fixing'
		       OR cp.l3_state = 'needs_fixing' OR cp.strengthen_state = 'needs_fixing'
		       OR cp.revise_state = 'needs_fixing')
		ORDER BY cp.ema_score ASC
	`, studentID)
	if err != nil {
		return out, err
	}
	for frows.Next() {
		var it FixItem
		if err := frows.Scan(&it.ConceptID, &it.ConceptName, &it.SubjectKey, &it.Level); err != nil {
			continue
		}
		out.FixTotal++
		if len(out.Fix) < s.FixCapPerDay {
			out.Fix = append(out.Fix, it)
		}
	}
	frows.Close()

	// Revise: concepts due on/before the date, capped, weakest first.
	rrows, err := db.Query(ctx, `
		SELECT c.id, c.name, c.subject_key, rs.next_due_at
		FROM revise_schedule rs
		JOIN concepts c ON c.id = rs.concept_id
		JOIN concept_progress cp ON cp.concept_id = rs.concept_id AND cp.student_id = rs.student_id
		WHERE rs.student_id = $1
		  AND rs.next_due_at::date <= $2
		  AND cp.revise_unlocked
		  AND cp.revise_state <> 'needs_fixing'
		ORDER BY rs.next_due_at ASC, cp.ema_score ASC
	`, studentID, d)
	if err != nil {
		return out, err
	}
	for rrows.Next() {
		var it ReviseItem
		var due time.Time
		if err := rrows.Scan(&it.ConceptID, &it.ConceptName, &it.SubjectKey, &due); err != nil {
			continue
		}
		it.DueDate = due.Format("2006-01-02")
		out.ReviseTotal++
		if len(out.Revise) < s.ReviseCapPerDay {
			out.Revise = append(out.Revise, it)
		}
	}
	rrows.Close()

	out.OnLeave = isOnLeave(ctx, studentID, date)
	out.EstMinutes = len(out.Learn)*6 + len(out.Fix)*3 + len(out.Revise)*2
	out.Status, out.PositiveNote = framing(out)
	return out, nil
}

func framing(a AgendaResp) (string, string) {
	work := len(a.Learn) + len(a.Fix) + len(a.Revise)
	switch {
	case a.OnLeave:
		return "on_leave", "On a break — enjoy! Your plan is paused so nothing piles up. 🌴"
	case work == 0 && a.LearnTotal == 0:
		return "ahead", "All caught up and ahead of schedule — amazing! 🌟"
	case work == 0:
		return "done", "Done for today — nice work! 🎉"
	case a.LearnTotal == 0 && a.FixTotal == 0:
		return "on_track", "Just a couple of quick refreshers today. You've got this! ✨"
	default:
		return "on_track", "A small, doable plan for today. One step at a time! 💪"
	}
}

// ── Calendar items ──────────────────────────────────────────────────────────

type PlanItemDTO struct {
	ID          int64  `json:"id"`
	ConceptID   string `json:"conceptId"`
	ConceptName string `json:"conceptName"`
	SubjectKey  string `json:"subjectKey"`
	PlannedDate string `json:"plannedDate"`
	OrderIdx    int    `json:"orderIdx"`
	Status      string `json:"status"`
	Source      string `json:"source"`
}

// Items returns the student's plan items between two dates (inclusive) for the
// calendar view.
func Items(ctx context.Context, studentID, from, to string) ([]PlanItemDTO, error) {
	rows, err := db.Query(ctx, `
		SELECT pi.id, pi.ref_id, c.name, pi.subject_key, pi.planned_date, pi.order_idx, pi.status, pi.source
		FROM plan_items pi
		JOIN concepts c ON c.id = pi.ref_id
		WHERE pi.student_id = $1 AND pi.planned_date BETWEEN $2 AND $3
		ORDER BY pi.planned_date ASC, pi.order_idx ASC
	`, studentID, from, to)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []PlanItemDTO{}
	for rows.Next() {
		var it PlanItemDTO
		var pd time.Time
		if err := rows.Scan(&it.ID, &it.ConceptID, &it.ConceptName, &it.SubjectKey, &pd, &it.OrderIdx, &it.Status, &it.Source); err != nil {
			continue
		}
		it.PlannedDate = pd.Format("2006-01-02")
		out = append(out, it)
	}
	return out, nil
}

// MoveItem reschedules a single plan item to a new date (marks it manual). If
// the target lands on a non-study day or a leave day, it snaps forward to the
// next open working day so nothing gets scheduled on a break.
func MoveItem(ctx context.Context, studentID string, id int64, newDate string) error {
	s, _, _ := GetSettings(ctx, studentID)
	if t, err := time.Parse("2006-01-02", newDate); err == nil {
		open := firstOpenDay(t, daySet(s.StudyDays), loadLeaves(ctx, studentID))
		newDate = open.Format("2006-01-02")
	}
	_, err := db.Exec(ctx, `
		UPDATE plan_items SET planned_date = $3, source = 'manual', updated_at = now()
		WHERE id = $1 AND student_id = $2
	`, id, studentID, newDate)
	return err
}

// CalEntry is one item on the calendar — either a planned concept to learn or a
// scheduled revision — keyed to a date.
type CalEntry struct {
	Date        string `json:"date"`
	Kind        string `json:"kind"` // learn | revise
	ItemID      int64  `json:"itemId"`
	ConceptID   string `json:"conceptId"`
	ConceptName string `json:"conceptName"`
	SubjectKey  string `json:"subjectKey"`
	Status      string `json:"status"`
}

// Calendar returns both planned learning (plan_items) and scheduled revisions
// (revise_schedule) for each day in the range, so the calendar can show what is
// actually planned per day rather than bare dots.
func Calendar(ctx context.Context, studentID, from, to string) ([]CalEntry, error) {
	out := []CalEntry{}

	lrows, err := db.Query(ctx, `
		SELECT pi.id, pi.ref_id, c.name, pi.subject_key, pi.planned_date, pi.status
		FROM plan_items pi
		JOIN concepts c ON c.id = pi.ref_id
		WHERE pi.student_id = $1 AND pi.kind = 'concept'
		  AND pi.status <> 'skipped'
		  AND pi.planned_date BETWEEN $2 AND $3
		ORDER BY pi.planned_date ASC, pi.order_idx ASC
	`, studentID, from, to)
	if err != nil {
		return nil, err
	}
	for lrows.Next() {
		var e CalEntry
		var d time.Time
		if err := lrows.Scan(&e.ItemID, &e.ConceptID, &e.ConceptName, &e.SubjectKey, &d, &e.Status); err != nil {
			continue
		}
		e.Kind = "learn"
		e.Date = d.Format("2006-01-02")
		out = append(out, e)
	}
	lrows.Close()

	rrows, err := db.Query(ctx, `
		SELECT rs.concept_id, c.name, c.subject_key, rs.next_due_at
		FROM revise_schedule rs
		JOIN concepts c ON c.id = rs.concept_id
		JOIN concept_progress cp ON cp.concept_id = rs.concept_id AND cp.student_id = rs.student_id
		WHERE rs.student_id = $1
		  AND rs.next_due_at::date BETWEEN $2 AND $3
		  AND cp.revise_unlocked AND cp.revise_state <> 'needs_fixing'
		ORDER BY rs.next_due_at ASC
	`, studentID, from, to)
	if err != nil {
		return out, nil // learn data already gathered; revise is best-effort
	}
	for rrows.Next() {
		var e CalEntry
		var d time.Time
		if err := rrows.Scan(&e.ConceptID, &e.ConceptName, &e.SubjectKey, &d); err != nil {
			continue
		}
		e.Kind = "revise"
		e.Date = d.Format("2006-01-02")
		out = append(out, e)
	}
	rrows.Close()

	return out, nil
}

// SkipItem marks a plan item skipped.
func SkipItem(ctx context.Context, studentID string, id int64) error {
	_, err := db.Exec(ctx, `
		UPDATE plan_items SET status = 'skipped', updated_at = now()
		WHERE id = $1 AND student_id = $2
	`, id, studentID)
	return err
}

// ── Leave + reflow (anti-pileup) ────────────────────────────────────────────

type Leave struct {
	ID        int64  `json:"id"`
	StartDate string `json:"startDate"`
	EndDate   string `json:"endDate"`
	Reason    string `json:"reason"`
}

// Leaves lists the student's leave ranges.
func Leaves(ctx context.Context, studentID string) ([]Leave, error) {
	rows, err := db.Query(ctx, `
		SELECT id, start_date, end_date, COALESCE(reason,'')
		FROM plan_leaves WHERE student_id = $1 ORDER BY start_date DESC
	`, studentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []Leave{}
	for rows.Next() {
		var l Leave
		var s, e time.Time
		if err := rows.Scan(&l.ID, &s, &e, &l.Reason); err != nil {
			continue
		}
		l.StartDate = s.Format("2006-01-02")
		l.EndDate = e.Format("2006-01-02")
		out = append(out, l)
	}
	return out, nil
}

// AddLeave records a leave range and reflows the plan so the break doesn't cause
// a pile-up: planned learning slides forward, revises that fall in the window
// are frozen (pushed past the break), and the whole revise backlog is re-spread
// so no day exceeds the cap.
func AddLeave(ctx context.Context, studentID string, start, end time.Time, reason string, s Settings) error {
	if end.Before(start) {
		start, end = end, start
	}
	days := int(end.Sub(start).Hours()/24) + 1
	if days < 1 {
		days = 1
	}

	if _, err := db.Exec(ctx, `
		INSERT INTO plan_leaves (student_id, start_date, end_date, reason)
		VALUES ($1, $2, $3, $4)
	`, studentID, start.Format("2006-01-02"), end.Format("2006-01-02"), reason); err != nil {
		return err
	}

	// Slide planned (not-done) learning that starts on/after the leave forward.
	if _, err := db.Exec(ctx, `
		UPDATE plan_items
		SET planned_date = planned_date + ($3 * interval '1 day'), updated_at = now()
		WHERE student_id = $1 AND status IN ('planned','started') AND planned_date >= $2
	`, studentID, start.Format("2006-01-02"), days); err != nil {
		return err
	}

	// Freeze revises whose due date falls inside the break.
	if _, err := db.Exec(ctx, `
		UPDATE revise_schedule
		SET next_due_at = next_due_at + ($4 * interval '1 day')
		WHERE student_id = $1 AND next_due_at::date BETWEEN $2 AND $3
	`, studentID, start.Format("2006-01-02"), end.Format("2006-01-02"), days); err != nil {
		return err
	}

	return Reflow(ctx, studentID, s)
}

// RemoveLeave deletes a leave range.
func RemoveLeave(ctx context.Context, studentID string, id int64) error {
	_, err := db.Exec(ctx, `DELETE FROM plan_leaves WHERE id = $1 AND student_id = $2`, id, studentID)
	return err
}

// Reflow re-spreads the overdue revise backlog across upcoming study days so no
// single day exceeds the revise cap — draining a pile-up gently instead of
// dumping a wall of overdue items on the student.
func Reflow(ctx context.Context, studentID string, s Settings) error {
	s = sanitize(s)
	rows, err := db.Query(ctx, `
		SELECT rs.concept_id
		FROM revise_schedule rs
		JOIN concept_progress cp ON cp.concept_id = rs.concept_id AND cp.student_id = rs.student_id
		WHERE rs.student_id = $1
		  AND rs.next_due_at::date <= current_date
		  AND cp.revise_unlocked
		  AND cp.revise_state <> 'needs_fixing'
		ORDER BY rs.next_due_at ASC, cp.ema_score ASC
	`, studentID)
	if err != nil {
		return err
	}
	ids := []string{}
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err == nil {
			ids = append(ids, id)
		}
	}
	rows.Close()

	dailyCap := s.ReviseCapPerDay
	if dailyCap < 1 {
		dailyCap = 1
	}
	if len(ids) <= dailyCap {
		return nil // nothing piled up
	}

	studyDays := daySet(s.StudyDays)
	today := time.Now()
	for i, id := range ids {
		offset := i / dailyCap // 0 for the first cap, 1 for the next, …
		due := addStudyDays(today, offset, studyDays)
		if _, err := db.Exec(ctx, `
			UPDATE revise_schedule SET next_due_at = $3::date + time '12:00'
			WHERE student_id = $1 AND concept_id = $2
		`, studentID, id, due.Format("2006-01-02")); err != nil {
			return err
		}
	}
	return nil
}

func isOnLeave(ctx context.Context, studentID string, date time.Time) bool {
	var on bool
	db.QueryRow(ctx, `
		SELECT EXISTS(SELECT 1 FROM plan_leaves WHERE student_id = $1 AND $2 BETWEEN start_date AND end_date)
	`, studentID, date.Format("2006-01-02")).Scan(&on)
	return on
}

// ── helpers ─────────────────────────────────────────────────────────────────

func sanitize(s Settings) Settings {
	if len(s.StudyDays) == 0 {
		s.StudyDays = []int{1, 2, 3, 4, 5}
	}
	s.NewConceptsPerDay = clamp(s.NewConceptsPerDay, 1, 10)
	s.ReviseCapPerDay = clamp(s.ReviseCapPerDay, 1, 20)
	s.FixCapPerDay = clamp(s.FixCapPerDay, 1, 20)
	s.SubjectsPerWeek = clamp(s.SubjectsPerWeek, 1, 11)
	if s.Timezone == "" {
		s.Timezone = "Asia/Kolkata"
	}
	if s.StartDate == "" {
		s.StartDate = time.Now().Format("2006-01-02")
	}
	return s
}

func clamp(v, lo, hi int) int {
	if v < lo {
		return lo
	}
	if v > hi {
		return hi
	}
	return v
}

func daySet(days []int) map[int]bool {
	m := map[int]bool{}
	for _, d := range days {
		m[d] = true
	}
	if len(m) == 0 {
		return map[int]bool{1: true, 2: true, 3: true, 4: true, 5: true}
	}
	return m
}

func isoWeekday(t time.Time) int {
	wd := int(t.Weekday()) // 0=Sun … 6=Sat
	if wd == 0 {
		return 7
	}
	return wd
}

func firstStudyDay(t time.Time, study map[int]bool) time.Time {
	for i := 0; i < 14; i++ {
		if study[isoWeekday(t)] {
			return t
		}
		t = t.AddDate(0, 0, 1)
	}
	return t
}

func nextStudyDay(t time.Time, study map[int]bool) time.Time {
	for i := 0; i < 14; i++ {
		t = t.AddDate(0, 0, 1)
		if study[isoWeekday(t)] {
			return t
		}
	}
	return t
}

// addStudyDays returns the date `offset` study days after the next study day on
// or after `from`.
func addStudyDays(from time.Time, offset int, study map[int]bool) time.Time {
	d := firstStudyDay(from, study)
	for i := 0; i < offset; i++ {
		d = nextStudyDay(d, study)
	}
	return d
}

// ── leave-aware day stepping ─────────────────────────────────────────────────

type leaveRange struct{ start, end string } // YYYY-MM-DD inclusive

func loadLeaves(ctx context.Context, studentID string) []leaveRange {
	out := []leaveRange{}
	rows, err := db.Query(ctx, `SELECT start_date, end_date FROM plan_leaves WHERE student_id = $1`, studentID)
	if err != nil {
		return out
	}
	defer rows.Close()
	for rows.Next() {
		var s, e time.Time
		if rows.Scan(&s, &e) == nil {
			out = append(out, leaveRange{s.Format("2006-01-02"), e.Format("2006-01-02")})
		}
	}
	return out
}

func inLeave(d time.Time, leaves []leaveRange) bool {
	ds := d.Format("2006-01-02")
	for _, l := range leaves {
		if ds >= l.start && ds <= l.end {
			return true
		}
	}
	return false
}

// isOpen reports whether a day is a study day and not within a leave.
func isOpen(d time.Time, study map[int]bool, leaves []leaveRange) bool {
	return study[isoWeekday(d)] && !inLeave(d, leaves)
}

// firstOpenDay returns `t` if it's an open working day, else the next one.
func firstOpenDay(t time.Time, study map[int]bool, leaves []leaveRange) time.Time {
	for i := 0; i < 400; i++ {
		if isOpen(t, study, leaves) {
			return t
		}
		t = t.AddDate(0, 0, 1)
	}
	return t
}

// nextOpenDay returns the next open working day strictly after `t`.
func nextOpenDay(t time.Time, study map[int]bool, leaves []leaveRange) time.Time {
	for i := 0; i < 400; i++ {
		t = t.AddDate(0, 0, 1)
		if isOpen(t, study, leaves) {
			return t
		}
	}
	return t
}

func toIntSlice(in []int32) []int {
	out := make([]int, len(in))
	for i, v := range in {
		out[i] = int(v)
	}
	return out
}

func toInt32Slice(in []int) []int32 {
	out := make([]int32, len(in))
	for i, v := range in {
		out[i] = int32(v)
	}
	return out
}
