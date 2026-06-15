package models

import "time"

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
	MCQ          QuestionType = "MCQ"
	Descriptive  QuestionType = "DESCRIPTIVE"
	Feynman      QuestionType = "FEYNMAN"
	Blurt        QuestionType = "BLURT"
	ActiveRecall QuestionType = "ACTIVE_RECALL"
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
	ID          string        `json:"id"`
	ConceptID   string        `json:"conceptId"`
	Type        QuestionType  `json:"type"`
	Level       QuestionLevel `json:"level"`
	Text        string        `json:"text"`
	Explanation *string       `json:"-"`
	RubricHint  *string       `json:"-"`
	KeyConcepts []string      `json:"-"`
	Options     []MCQOption   `json:"options,omitempty"`
}

type MCQOption struct {
	Key       string `json:"key"`
	Text      string `json:"text"`
	IsCorrect bool   `json:"-"`
}

// ActiveQuestion is safe to send before a session is completed. Answer keys,
// explanations, rubrics, and grading tags remain server-side.
type ActiveQuestion struct {
	ID        string            `json:"id"`
	ConceptID string            `json:"conceptId"`
	Type      QuestionType      `json:"type"`
	Level     QuestionLevel     `json:"level"`
	Text      string            `json:"text"`
	Options   []ActiveMCQOption `json:"options,omitempty"`
}

type ActiveMCQOption struct {
	Key  string `json:"key"`
	Text string `json:"text"`
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
}

type CompleteSessionReq struct {
	Answers []SubmitAnswerReq `json:"answers"`
}

type CompleteSessionResp struct {
	SessionID       string       `json:"sessionId"`
	Score           float64      `json:"score"`  // immediate MCQ-only score; updates after AI grading
	Passed          bool         `json:"passed"` // score >= 0.80 AND station cleared (tag gate can demote, never promote)
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
}
