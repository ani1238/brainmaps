// ─── Legacy question type (matches questions.ts data format) ─────────────────

export type QuestionType =
  | 'MCQ'
  | 'STORY_MCQ'
  | 'HOTS'
  | 'HOTS_MCQ'
  | 'ASSERTION_REASON'
  | 'DESCRIPTIVE'
  | 'FEYNMAN'
  | 'BLURT'
  | 'ACTIVE_RECALL'
  | 'SPOT_IT'
  | 'FIX_IT'
  | 'PRODUCE_IT'
  | 'CONTEXT_CLUE'
  | 'GENERATIVE_PRODUCTION';

export interface MCQOption {
  id: string;
  text: string;
  correct?: boolean;
}

// Which station a question belongs to. Levels 1–3 each hold a MIX of
// MCQ + descriptive + feynman at escalating difficulty.
export type QuestionLevel = 'level1' | 'level2' | 'level3' | 'strengthen' | 'revise';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  level?: QuestionLevel;
  options?: MCQOption[];
  explanation?: string;
  rubricHint?: string;
  keyConcepts?: string[];
  tier?: 'VERY_WEAK' | 'WEAK' | 'DEVELOPING';
}

// ─── Legacy types (used by old components until rebuilt) ─────────────────────

export interface Concept {
  id: string;
  name: string;
  state: 'NOT_STARTED' | 'VERY_WEAK' | 'WEAK' | 'DEVELOPING' | 'STRONG' | 'RECALL_DUE';
  dueForRecall?: boolean;
  score?: number;
  attempts?: number;
  // Per-station states from the live API ('locked'|'current'|'done'|'needs_fixing')
  l1State?: string;
  l2State?: string;
  l3State?: string;
  strengthenState?: string;
  reviseState?: string;
  reviseUnlocked?: boolean;
  reviseSchedule?: {
    intervalDays: number;
    nextDueAt: string;
    lastDoneAt?: string;
  } | null;
}

// ─── Primitives ───────────────────────────────────────────────────────────────

export type Board = 'CBSE' | 'ICSE';
export type SubjectKey = 'sci' | 'hist' | 'geo' | 'civ' | 'soc' | 'eng';
export type EngineType = 'CONCEPTUAL' | 'ENGLISH';
export type MasteryState = 'NOT_STARTED' | 'VERY_WEAK' | 'WEAK' | 'DEVELOPING' | 'STRONG' | 'RECALL_DUE';
export type StationStatus = 'locked' | 'current' | 'needsFixing' | 'done';
export type Difficulty = 'EASY' | 'MODERATE' | 'STRONG' | 'MIXED';

// JSON keys are kept as v6 names for backward-compat with demo content files.
// Display layer translates these to v7 labels (see STATION_LABELS in tokens.ts).
export type StationKey = 'learn_it' | 'get_it' | 'master_it' | 'strengthen' | 'keep_it_fresh';

// ─── Student ──────────────────────────────────────────────────────────────────

export interface StudentProfile {
  id: string;
  name: string;
  class: 3 | 4 | 5 | 6 | 7;
  board: Board;
  streak: number;
  lastActiveDate: string; // ISO date 'YYYY-MM-DD'
  enrolledSubjects: SubjectKey[];
  onboardingComplete: boolean;
  currentChapterKey?: string; // e.g. 'cbse_g6_science_ch01'
}

// ─── Questions ────────────────────────────────────────────────────────────────

export interface MCQQuestion {
  id: string;
  type: 'MCQ';
  prompt: string;
  options: MCQOption[];
  correctOptionId: string;
  hint?: string;
  explanation: string;
  target_subtypes: string[];
}

export interface DescriptiveQuestion {
  id: string;
  type: 'DESCRIPTIVE';
  subtype: 'what' | 'why' | 'how' | 'what_if';
  prompt: string;
  rubric_points: string[];
  example_answer: string;
  target_subtypes: string[];
}

export interface FeynmanPrompt {
  scenario: string;
  key_concepts_to_cover: string[];
}

// ─── Concept content schema (v7) ─────────────────────────────────────────────

export interface Misconception {
  id: string;
  wrong_belief: string;
  reality: string;
  why_common: string;
}

export interface CuriosityByte {
  fact: string;
  open_question: string;
}

export interface StationContent {
  difficulty: Difficulty;
  bloom: string;
  mcqs: MCQQuestion[];
  descriptive: DescriptiveQuestion[];
  feynman_prompt?: FeynmanPrompt;
  include_blurt?: boolean;
}

export interface ReviseContent {
  step1: { mcqs: MCQQuestion[]; descriptive: DescriptiveQuestion[] };
  step2_transfer: {
    descriptive: DescriptiveQuestion[];
    feynman_prompt?: FeynmanPrompt;
  };
}

export interface StrengthenContent {
  mcqs: MCQQuestion[];
  descriptive: DescriptiveQuestion[];
  feynman_prompt?: FeynmanPrompt;
}

export interface ConceptContent {
  concept_id: string;
  board: Board;
  class: number;
  subject: string;
  engine: EngineType;
  chapter: { number: number; name: string };
  concept: { name: string; order: number };

  shared: {
    recap_summary: string;
    concept_checklist: string[];
    misconceptions: Misconception[];
    curiosity_bytes: CuriosityByte[];
  };

  sets: {
    learn_it: StationContent;
    get_it: StationContent;
    master_it: StationContent;
  };

  strengthen: StrengthenContent;
  keep_it_fresh: ReviseContent; // JSON key stays keep_it_fresh; displayed as "Revise"
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export interface SessionItem {
  question_id: string;
  student_response: string;
  correct: boolean;
  ai_feedback: string | null;
}

export interface SessionRecord {
  date: string; // ISO date
  station: StationKey;
  score: number; // 0.0–1.0
  items: SessionItem[];
}

export interface WeaknessProfile {
  last_updated: string;
  misconception_ids: string[];
  weak_question_subtypes: string[];
  coverage_gaps: string[];
  last_feynman_raw?: string;
}

export interface ReviseProgress {
  unlocked: boolean;
  interval_tier: number; // 0=Day1 1=Day3 2=Day7 3=Day21 4=Day60
  next_due: string | null; // ISO date
  due_for_recall: boolean;
}

export interface ConceptProgress {
  concept_id: string;
  mastery_score: number; // 0.0–1.0 EMA
  state: MasteryState;
  set_states: Record<StationKey, StationStatus>;
  strengthen_unlocked: boolean;
  revise: ReviseProgress; // was keep_it_fresh in v6 progress files
  weakness_profile: WeaknessProfile;
  session_history: SessionRecord[];
}

export interface StudentProgress {
  student_id: string;
  last_updated: string; // ISO datetime
  concepts: Record<string, ConceptProgress>; // keyed by concept_id
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

export interface SubjectSummary {
  key: SubjectKey;
  label: string;
  letter: string;
  color: string;
  icon: string;
  totalConcepts: number;
  attempted: number;
  strong: number;
  toFix: number;
}

export interface DailyStats {
  strong: number;
  toFix: number;
  brandNew: number;
  total: number;
  streak: number;
  estimatedMinutes: number;
}

export interface ActionQueueItem {
  concept_id: string;
  concept_name: string;
  subject: string;
  chapter: string;
  station: StationKey;
  state: MasteryState;
  daysSinceAttempt?: number;
  recallTier?: number;
}
