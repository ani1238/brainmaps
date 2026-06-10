/**
 * BrainMaps API client
 *
 * All calls go to the Go backend on Fly.io (or NEXT_PUBLIC_API_URL if set).
 * Only Tapestry of the Past (soc_chB) concepts are live; all other chapters
 * still use the static dummy data in src/data/dummy.ts.
 */

import type { Concept, Question, QuestionLevel } from '@/types';
import { getProfile } from '@/lib/storage';

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://brainmaps-api.fly.dev/api/v1';

function studentId(): string {
  const id = getProfile()?.id;
  if (!id) throw new Error('No active student');
  return id;
}

// Concept IDs that live in the real backend (soc_chB — Tapestry of the Past)
export const LIVE_CONCEPT_IDS = new Set([
  's201', 's202', 's203', 's204', 's205', 's206', 's207',
]);

export function isLiveConcept(conceptId: string): boolean {
  return LIVE_CONCEPT_IDS.has(conceptId);
}

export interface ApiStudent {
  id: string;
  name: string;
  grade: number;
  board: 'CBSE' | 'ICSE';
  createdAt: string;
}

export async function loginStudent(name: string): Promise<ApiStudent> {
  const res = await fetch(`${API_BASE}/students/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ─── Backend response shapes ──────────────────────────────────────────────────

export interface ApiChapter {
  id: string;
  subjectKey: string;
  name: string;
  number: number;
  orderIdx: number;
  conceptCount: number;
}

interface ApiProgress {
  emaScore: number;
  state: string;
  l1State: string;
  l2State: string;
  l3State: string;
  strengthenState: string;
  reviseState: string;
  reviseUnlocked: boolean;
  totalAttempts: number;
}

interface ApiConcept {
  id: string;
  subjectKey: string;
  chapterId: string;
  name: string;
  orderIdx: number;
  progress?: ApiProgress | null;
  reviseSchedule?: {
    intervalDays: number;
    nextDueAt: string;
    lastDoneAt?: string;
  } | null;
}

interface ApiOption {
  key: string;
  text: string;
  isCorrect: boolean;
}

interface ApiQuestion {
  id: string;
  conceptId: string;
  type: string;
  level: string;
  text: string;
  explanation?: string;
  rubricHint?: string;
  keyConcepts?: string[];
  options?: ApiOption[];
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapConcept(c: ApiConcept): Concept {
  const state = (c.progress?.state ?? 'NOT_STARTED') as Concept['state'];
  const dueForRecall =
    c.reviseSchedule != null &&
    new Date(c.reviseSchedule.nextDueAt) <= new Date();

  return {
    id: c.id,
    name: c.name,
    state,
    score: c.progress?.emaScore,
    attempts: c.progress?.totalAttempts,
    dueForRecall,
    // Per-station states from the API ('locked'|'current'|'done'|'needs_fixing')
    l1State: c.progress?.l1State,
    l2State: c.progress?.l2State,
    l3State: c.progress?.l3State,
    strengthenState: c.progress?.strengthenState,
    reviseState: c.progress?.reviseState,
    reviseUnlocked: c.progress?.reviseUnlocked,
    reviseSchedule: c.reviseSchedule,
  };
}

function mapQuestion(q: ApiQuestion): Question {
  return {
    id: q.id,
    type: q.type as Question['type'],
    text: q.text,
    level: q.level as QuestionLevel,
    explanation: q.explanation,
    rubricHint: q.rubricHint,
    keyConcepts: q.keyConcepts,
    options: q.options?.map(o => ({
      id: o.key,
      text: o.text,
      correct: o.isCorrect,
    })),
  };
}

// ─── API calls ────────────────────────────────────────────────────────────────

export interface ApiConceptDetail {
  id: string;
  subjectKey: string;
  chapterId: string;
  chapterName: string;
  chapterNumber: number;
  name: string;
  recap: string;
  progress?: ApiProgress | null;
  reviseSchedule?: ApiTodayItem['reviseSchedule'];
}

export async function fetchConcept(conceptId: string): Promise<ApiConceptDetail> {
  const res = await fetch(
    `${API_BASE}/concepts/${conceptId}?student=${studentId()}`
  );
  if (!res.ok) throw new Error(`fetchConcept ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function fetchChapters(subjectKey: string): Promise<ApiChapter[]> {
  const res = await fetch(`${API_BASE}/chapters?subject=${subjectKey}`);
  if (!res.ok) throw new Error(`fetchChapters ${res.status}: ${await res.text()}`);
  return res.json();
}

// ─── Dashboard / progress summary ─────────────────────────────────────────────

export interface ApiDashboard {
  streak: { days: number; best: number; activeDays: number };
  mastery: {
    strong: number; developing: number; weak: number;
    veryWeak: number; notStarted: number; total: number;
  };
  subjects: { key: string; total: number; attempted: number; strong: number; pct: number }[];
  activity: { date: string; sessions: number }[];
  improving: { conceptId: string; name: string; delta: number }[];
  needsAttention: { conceptId: string; name: string; note: string }[];
}

export async function fetchDashboard(): Promise<ApiDashboard> {
  const res = await fetch(`${API_BASE}/dashboard?student=${studentId()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchDashboard ${res.status}: ${await res.text()}`);
  return res.json();
}

// ─── Today's plan (Fix queue + Revise queue) ──────────────────────────────────

export interface ApiTodayItem {
  id: string;
  subjectKey: string;
  chapterId: string;
  name: string;
  progress?: ApiProgress | null;
  reviseSchedule?: {
    intervalDays: number;
    nextDueAt: string;
    lastDoneAt?: string;
  } | null;
}

export interface ApiToday {
  fixQueue: ApiTodayItem[];
  reviseQueue: ApiTodayItem[];
  upcomingReviseQueue: ApiTodayItem[];
}

export async function fetchToday(): Promise<ApiToday> {
  const res = await fetch(`${API_BASE}/today?student=${studentId()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchToday ${res.status}: ${await res.text()}`);
  const d = await res.json();
  // The API returns null (not []) for empty queues — coerce so callers can
  // safely read .length / .map without crashing.
  return {
    fixQueue: d.fixQueue ?? [],
    reviseQueue: d.reviseQueue ?? [],
    upcomingReviseQueue: d.upcomingReviseQueue ?? [],
  };
}

export async function fetchConcepts(chapterId: string): Promise<Concept[]> {
  const res = await fetch(
    `${API_BASE}/concepts?chapter=${chapterId}&student=${studentId()}`,
    { next: { revalidate: 0 } } // always fresh
  );
  if (!res.ok) throw new Error(`fetchConcepts ${res.status}: ${await res.text()}`);
  const data: ApiConcept[] = await res.json();
  return data.map(mapConcept);
}

export async function fetchQuestions(
  conceptId: string,
  level: QuestionLevel,
  excludeQuestionIds: string[] = []
): Promise<Question[]> {
  // Pass the student so the backend can serve an adaptive set on a retry
  // (a level the student previously failed) — targeting their weak concepts.
  const params = new URLSearchParams({ level, student: studentId() });
  excludeQuestionIds.forEach(id => params.append('exclude', id));
  const res = await fetch(`${API_BASE}/concepts/${conceptId}/questions?${params}`);
  if (!res.ok) throw new Error(`fetchQuestions ${res.status}: ${await res.text()}`);
  const data: ApiQuestion[] = await res.json();
  return data.map(mapQuestion);
}

export interface SubmitAnswer {
  questionId: string;
  questionType: string;
  chosenOption?: string;
  studentText?: string;
}

export interface AnswerFeedback {
  questionType: string;   // MCQ | DESCRIPTIVE | FEYNMAN | BLURT | ACTIVE_RECALL
  questionText: string;
  studentAnswer: string;  // what the student actually wrote / chose
  feedback: string;       // AI analysis — 3 sentences covering right, wrong, improve
  score: number;          // 0 = wrong MCQ; 0–1 for open answers
}

export interface SessionResult {
  sessionId: string;
  score: number;                  // 0–1 (MCQ-only until AI grading finishes)
  passed: boolean;
  newState: string;
  aiGrading: boolean;             // true = Gemini still working in background
  feedback: AnswerFeedback[];     // per-answer commentary; grows as AI finishes
}

export async function startSession(
  conceptId: string,
  station: QuestionLevel
): Promise<string> {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId: studentId(), conceptId, station }),
  });
  if (!res.ok) throw new Error(`startSession ${res.status}`);
  const { sessionId } = await res.json();
  return sessionId;
}

export async function completeSession(
  sessionId: string,
  answers: SubmitAnswer[]
): Promise<SessionResult> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) throw new Error(`completeSession ${res.status}`);
  return res.json();
}

export async function getSession(sessionId: string): Promise<SessionResult> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}`);
  if (!res.ok) throw new Error(`getSession ${res.status}`);
  return res.json();
}
