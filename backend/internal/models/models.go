package models

import (
	"encoding/json"
	"time"
)

// ── Curriculum ────────────────────────────────────────────────────────────────

type Concept struct {
	ID         string `json:"id"`
	SubjectKey string `json:"subjectKey"`
	ChapterID  string `json:"chapterId"`
	Name       string `json:"name"`
	OrderIdx   int    `json:"orderIdx"`
}

type QuestionType string

const (
	MCQ                  QuestionType = "MCQ"
	StoryMCQ             QuestionType = "STORY_MCQ"
	HOTS                 QuestionType = "HOTS"
	HOTSMCQ              QuestionType = "HOTS_MCQ"
	AssertionReason      QuestionType = "ASSERTION_REASON"
	Descriptive          QuestionType = "DESCRIPTIVE"
	Feynman              QuestionType = "FEYNMAN"
	Blurt                QuestionType = "BLURT"
	ActiveRecall         QuestionType = "ACTIVE_RECALL"
	SpotIt               QuestionType = "SPOT_IT"
	FixIt                QuestionType = "FIX_IT"
	ProduceIt            QuestionType = "PRODUCE_IT"
	ContextClue          QuestionType = "CONTEXT_CLUE"
	GenerativeProduction QuestionType = "GENERATIVE_PRODUCTION"

	// v12 payload-driven types (see migration 021 / internal/qtypes).
	Classify        QuestionType = "CLASSIFY"
	Match           QuestionType = "MATCH"
	Sequence        QuestionType = "SEQUENCE"
	Cloze           QuestionType = "CLOZE"
	TrueFalseWhy    QuestionType = "TRUE_FALSE_WHY"
	PredictJustify  QuestionType = "PREDICT_JUSTIFY"
	ConclusionDraw  QuestionType = "CONCLUSION_DRAW"
	EvidenceHunt    QuestionType = "EVIDENCE_HUNT"
	MCQCluster      QuestionType = "MCQ_CLUSTER"
	DesignChallenge QuestionType = "DESIGN_CHALLENGE"
)

type QuestionLevel string

const (
	Level1     QuestionLevel = "level1"
	Level2     QuestionLevel = "level2"
	Level3     QuestionLevel = "level3"
	Strengthen QuestionLevel = "strengthen"
	Revise     QuestionLevel = "revise"
)

type Question struct {
	ID           string        `json:"id"`
	ConceptID    string        `json:"conceptId"`
	Type         QuestionType  `json:"type"`
	Level        QuestionLevel `json:"level"`
	Text         string        `json:"text"`
	Explanation  *string       `json:"-"`
	RubricHint   *string       `json:"-"`
	RubricPoints []string      `json:"-"`
	KeyPoints    []string      `json:"-"`
	RecallGuide  *string       `json:"-"`
	Preamble     *string       `json:"-"`
	KeyConcepts  []string      `json:"-"`
	Options      []MCQOption   `json:"options,omitempty"`
	// Payload carries the full v12 type-specific structure (categories, pairs,
	// blanks, sub_questions, rubric, answer keys, tags). It is server-side only
	// and must be sanitized (see internal/qtypes.Sanitize) before serving.
	Payload json.RawMessage `json:"-"`
}

type MCQOption struct {
	Key       string `json:"key"`
	Text      string `json:"text"`
	IsCorrect bool   `json:"-"`
}

// ActiveQuestion is safe to send before a session is completed. Answer keys,
// explanations, rubrics, and grading tags remain server-side.
type ActiveQuestion struct {
	ID          string            `json:"id"`
	ConceptID   string            `json:"conceptId"`
	Type        QuestionType      `json:"type"`
	Level       QuestionLevel     `json:"level"`
	Text        string            `json:"text"`
	RecallGuide *string           `json:"recallGuide,omitempty"`
	Preamble    *string           `json:"preamble,omitempty"`
	Options     []ActiveMCQOption `json:"options,omitempty"`
	// Payload is the answer-key-stripped v12 structure safe to send to the client
	// (see internal/qtypes.Sanitize). Present for non-legacy-MCQ types.
	Payload json.RawMessage `json:"payload,omitempty"`
}

type ActiveMCQOption struct {
	Key  string `json:"key"`
	Text string `json:"text"`
}

// ── User ──────────────────────────────────────────────────────────────────────
// A user account is a single learner: it carries its own class (grade) and
// board, and is paired 1:1 with a Student row that anchors all progress.

type User struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	Grade     int       `json:"grade"`
	Board     string    `json:"board"`
	CreatedAt time.Time `json:"createdAt"`
}

// ── Student ───────────────────────────────────────────────────────────────────

type Student struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Grade     int       `json:"grade"`
	Board     string    `json:"board"`
	CreatedAt time.Time `json:"createdAt"`
}

// ── Progress ──────────────────────────────────────────────────────────────────

type MasteryState string

const (
	NotStarted MasteryState = "NOT_STARTED"
	VeryWeak   MasteryState = "VERY_WEAK"
	Weak       MasteryState = "WEAK"
	Developing MasteryState = "DEVELOPING"
	Strong     MasteryState = "STRONG"
	RecallDue  MasteryState = "RECALL_DUE"
)

// StationState is the per-station progress value stored in concept_progress.
type StationState string

const (
	StationLocked      StationState = "locked"
	StationCurrent     StationState = "current"
	StationDone        StationState = "done"
	StationNeedsFixing StationState = "needs_fixing"
)

type ConceptProgress struct {
	StudentID       string       `json:"studentId"`
	ConceptID       string       `json:"conceptId"`
	EMAScore        float64      `json:"emaScore"`
	State           MasteryState `json:"state"`
	L1State         StationState `json:"l1State"`
	L2State         StationState `json:"l2State"`
	L3State         StationState `json:"l3State"`
	StrengthenState StationState `json:"strengthenState"`
	ReviseState     StationState `json:"reviseState"`
	ReviseUnlocked  bool         `json:"reviseUnlocked"`
	TotalAttempts   int          `json:"totalAttempts"`
	LastSessionAt   *time.Time   `json:"lastSessionAt,omitempty"`
}

type ReviseSchedule struct {
	StudentID    string     `json:"studentId"`
	ConceptID    string     `json:"conceptId"`
	IntervalDays int        `json:"intervalDays"`
	NextDueAt    time.Time  `json:"nextDueAt"`
	LastDoneAt   *time.Time `json:"lastDoneAt,omitempty"`
}

// ── Sessions ──────────────────────────────────────────────────────────────────

type StationKey string

const (
	StationLevel1     StationKey = "level1"
	StationLevel2     StationKey = "level2"
	StationLevel3     StationKey = "level3"
	StationStrengthen StationKey = "strengthen"
	StationRevise     StationKey = "revise"
)

type Session struct {
	ID          string     `json:"id"`
	StudentID   string     `json:"studentId"`
	ConceptID   string     `json:"conceptId"`
	Station     StationKey `json:"station"`
	Score       *float64   `json:"score,omitempty"`
	MCQCorrect  int        `json:"mcqCorrect"`
	MCQTotal    int        `json:"mcqTotal"`
	StartedAt   time.Time  `json:"startedAt"`
	CompletedAt *time.Time `json:"completedAt,omitempty"`
}

type SessionAnswer struct {
	ID           string       `json:"id"`
	SessionID    string       `json:"sessionId"`
	QuestionID   string       `json:"questionId"`
	QuestionType QuestionType `json:"questionType"`
	// MCQ
	ChosenOption *string `json:"chosenOption,omitempty"`
	IsCorrect    *bool   `json:"isCorrect,omitempty"`
	// Open-ended
	StudentText *string  `json:"studentText,omitempty"`
	AIScore     *float64 `json:"aiScore,omitempty"`
	AIFeedback  *string  `json:"aiFeedback,omitempty"`
}

// ── API request / response shapes ─────────────────────────────────────────────

type StartSessionReq struct {
	StudentID string     `json:"studentId"`
	ConceptID string     `json:"conceptId"`
	Station   StationKey `json:"station"`
}

type StartSessionResp struct {
	SessionID    string `json:"sessionId"`
	SessionToken string `json:"sessionToken"`
}

type SubmitAnswerReq struct {
	QuestionID   string       `json:"questionId"`
	QuestionType QuestionType `json:"questionType"`
	ChosenOption *string      `json:"chosenOption,omitempty"` // MCQ
	StudentText  *string      `json:"studentText,omitempty"`  // open-ended
	// AnswerPayload carries structured answers for v12 types that aren't a single
	// option or free text: classify buckets, match pairs, sequence order, cloze
	// blank fills, mcq_cluster sub-answers, or a two-step {verdict, reason}.
	AnswerPayload json.RawMessage `json:"answerPayload,omitempty"`
	ElapsedMs     *int            `json:"elapsedMs,omitempty"` // time-on-task (ms)
}

type CompleteSessionReq struct {
	Answers []SubmitAnswerReq `json:"answers"`
}

type CompleteSessionResp struct {
	SessionID       string       `json:"sessionId"`
	Score           float64      `json:"score"`  // immediate MCQ-only score; updates after AI grading
	Passed          bool         `json:"passed"` // score >= 0.60 AND station cleared (tag gate can demote, never promote)
	NewState        MasteryState `json:"newState"`
	AIGrading       bool         `json:"aiGrading"`       // true = an AI provider is still working
	ReviewAvailable bool         `json:"reviewAvailable"` // true once grading is final
}

type SessionReview struct {
	SessionID   string                `json:"sessionId"`
	ConceptID   string                `json:"conceptId"`
	ConceptName string                `json:"conceptName"`
	Station     StationKey            `json:"station"`
	Score       float64               `json:"score"`
	Answers     []SessionReviewAnswer `json:"answers"`
}

type SessionReviewAnswer struct {
	QuestionID    string       `json:"questionId"`
	QuestionType  QuestionType `json:"questionType"`
	QuestionText  string       `json:"questionText"`
	StudentAnswer string       `json:"studentAnswer"`
	IsCorrect     *bool        `json:"isCorrect,omitempty"`
	Score         *float64     `json:"score,omitempty"`
	Feedback      string       `json:"feedback,omitempty"`
	CorrectAnswer string       `json:"correctAnswer,omitempty"`
	Explanation   string       `json:"explanation,omitempty"`
	AnswerGuide   string       `json:"answerGuide,omitempty"`
}

// ConceptWithProgress is returned by the Brain Map endpoint
type ConceptWithProgress struct {
	Concept
	Progress       *ConceptProgress `json:"progress,omitempty"`
	ReviseSchedule *ReviseSchedule  `json:"reviseSchedule,omitempty"`
}

type TodayResp struct {
	FixQueue            []ConceptWithProgress `json:"fixQueue"`
	ReviseQueue         []ConceptWithProgress `json:"reviseQueue"`
	UpcomingReviseQueue []ConceptWithProgress `json:"upcomingReviseQueue"`
	RecentSessions      []RecentSession       `json:"recentSessions"`
}

// RecentSession is a lightweight summary of a just-completed level/station,
// used for the "Recently done" feed on the Today view.
type RecentSession struct {
	ConceptID   string    `json:"conceptId"`
	ConceptName string    `json:"conceptName"`
	SubjectKey  string    `json:"subjectKey"`
	Station     string    `json:"station"`
	Score       float64   `json:"score"`
	Passed      bool      `json:"passed"`
	CompletedAt time.Time `json:"completedAt"`
}
