/**
 * BrainMaps API client
 *
 * Browser calls use the same-origin Next.js proxy by default, avoiding a
 * cross-origin dependency on the Go backend's CORS configuration.
 * The live curriculum is served by the Go API. A small local dataset remains
 * available only for legacy demo concepts.
 */

import type { Concept, Question, QuestionLevel } from '@/types';
import { getProfile, getAuthToken } from '@/lib/storage';

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? '/api/v1';

function studentId(): string {
  const id = getProfile()?.id;
  if (!id) throw new Error('No active student');
  return id;
}

/** Returns auth headers for protected API calls. */
function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

// Legacy helper retained for old demo components.
export const LIVE_CONCEPT_IDS = new Set([
  's201', 's202', 's203', 's204', 's205', 's206', 's207',
]);

export function isLiveConcept(conceptId: string): boolean {
  return LIVE_CONCEPT_IDS.has(conceptId);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  householdId: string;
  displayName: string;
}

export interface ApiHouseholdStudent {
  id: string;
  name: string;
  grade: number;
  board: 'CBSE' | 'ICSE';
}

export async function registerHousehold(
  email: string,
  displayName: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, displayName, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function loginHousehold(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function logoutHousehold(): Promise<void> {
  await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: authHeaders(),
  });
}

export async function getHouseholdStudents(): Promise<ApiHouseholdStudent[]> {
  const res = await fetch(`${API_BASE}/households/me/students`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.students ?? [];
}

export async function addStudentToHousehold(
  name: string,
  grade: number,
  board: 'CBSE' | 'ICSE',
): Promise<ApiHouseholdStudent> {
  const res = await fetch(`${API_BASE}/households/me/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ name, grade, board }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ─── Legacy shape (kept for type compatibility) ───────────────────────────────

export interface ApiStudent {
  id: string;
  name: string;
  grade: number;
  board: 'CBSE' | 'ICSE';
  createdAt: string;
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
}

interface ApiQuestion {
  id: string;
  conceptId: string;
  type: string;
  level: string;
  text: string;
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
    options: q.options?.map(o => ({
      id: o.key,
      text: o.text,
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
    `${API_BASE}/concepts/${conceptId}?student=${studentId()}`,
    { headers: authHeaders() },
  );
  if (!res.ok) throw new Error(`fetchConcept ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function fetchChapters(subjectKey: string): Promise<ApiChapter[]> {
  const res = await fetch(`${API_BASE}/chapters?subject=${subjectKey}`, {
    headers: authHeaders(),
  });
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
  const res = await fetch(`${API_BASE}/dashboard?student=${studentId()}`, {
    cache: 'no-store',
    headers: authHeaders(),
  });
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
  const res = await fetch(`${API_BASE}/today?student=${studentId()}`, {
    cache: 'no-store',
    headers: authHeaders(),
  });
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
    { next: { revalidate: 0 }, headers: authHeaders() } // always fresh
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
  const res = await fetch(`${API_BASE}/concepts/${conceptId}/questions?${params}`, {
    headers: authHeaders(),
  });
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

export interface ActiveSession {
  sessionId: string;
  sessionToken: string;
}

export interface SessionReviewAnswer {
  questionId: string;
  questionType: string;
  questionText: string;
  studentAnswer: string;
  isCorrect?: boolean;
  score?: number;
  feedback?: string;
  correctAnswer?: string;
  explanation?: string;
  answerGuide?: string;
}

export interface SessionReview {
  sessionId: string;
  conceptId: string;
  conceptName: string;
  station: QuestionLevel;
  score: number;
  answers: SessionReviewAnswer[];
}

export interface SessionResult {
  sessionId: string;
  score: number;                  // 0–1 (MCQ-only until AI grading finishes)
  passed: boolean;
  newState: string;
  aiGrading: boolean;
  reviewAvailable: boolean;
}

export async function startSession(
  conceptId: string,
  station: QuestionLevel
): Promise<ActiveSession> {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ studentId: studentId(), conceptId, station }),
  });
  if (!res.ok) throw new Error(`startSession ${res.status}`);
  return res.json();
}

export async function completeSession(
  session: ActiveSession,
  answers: SubmitAnswer[]
): Promise<SessionResult> {
  const res = await fetch(`${API_BASE}/sessions/${session.sessionId}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Token': session.sessionToken,
      ...authHeaders(),
    },
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) throw new Error(`completeSession ${res.status}`);
  return res.json();
}

export async function getSession(session: ActiveSession): Promise<SessionResult> {
  const res = await fetch(`${API_BASE}/sessions/${session.sessionId}`, {
    headers: { 'X-Session-Token': session.sessionToken, ...authHeaders() },
  });
  if (!res.ok) throw new Error(`getSession ${res.status}`);
  return res.json();
}

export async function getSessionReview(session: ActiveSession): Promise<SessionReview> {
  const res = await fetch(`${API_BASE}/sessions/${session.sessionId}/review`, {
    headers: { 'X-Session-Token': session.sessionToken, ...authHeaders() },
  });
  if (!res.ok) throw new Error(`getSessionReview ${res.status}`);
  return res.json();
}
