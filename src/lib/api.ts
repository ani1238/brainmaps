/**
 * BrainMaps API client
 *
 * Browser calls use the same-origin Next.js proxy by default, avoiding a
 * cross-origin dependency on the Go backend's CORS configuration.
 * The live curriculum is served by the Go API. A small local dataset remains
 * available only for legacy demo concepts.
 */

import type { Concept, Question, QuestionLevel } from '@/types';
import {
  getProfile,
  getAuthToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
  clearProfile,
} from '@/lib/storage';

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

// ─── Silent access-token refresh ──────────────────────────────────────────────
// Access tokens are short-lived (~15 min). authedFetch transparently rotates the
// refresh token and retries once on a 401, so users aren't logged out mid-session.

let refreshInFlight: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  // De-duplicate concurrent refreshes.
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) {
          clearTokens();
          return false;
        }
        const data = await res.json();
        saveTokens(data.token, data.refreshToken);
        return true;
      } catch {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

const PUBLIC_PATHS = new Set(['/', '/register', '/forgot', '/reset']);

/**
 * Clears the session and bounces to login when a protected call is
 * irrecoverably unauthorized (e.g. an expired/invalid token with no working
 * refresh). Prevents the app from silently rendering empty/zero data.
 */
function forceLogout(): void {
  clearProfile(); // clears profile, progress, and both tokens
  if (typeof window !== 'undefined' && !PUBLIC_PATHS.has(window.location.pathname)) {
    window.location.replace('/');
  }
}

/**
 * fetch wrapper for protected endpoints: injects the bearer token and, on a 401,
 * attempts a single silent refresh + retry before giving up. If still
 * unauthorized, the session is reset and the user is sent to login.
 */
async function authedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const run = () =>
    fetch(input, { ...init, headers: { ...(init.headers ?? {}), ...authHeaders() } });

  let res = await run();
  if (res.status === 401) {
    const ok = getRefreshToken() ? await refreshTokens() : false;
    if (ok) {
      res = await run();
    }
    if (res.status === 401) {
      forceLogout();
    }
  }
  return res;
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
  refreshToken: string;
  userId: string;
  studentId: string;
  name: string;
  grade: number;
  board: 'CBSE' | 'ICSE';
}

export interface LearnerProfile {
  userId: string;
  studentId: string;
  name: string;
  grade: number;
  board: 'CBSE' | 'ICSE';
}

export async function registerUser(
  email: string,
  name: string,
  password: string,
  grade: number,
  board: 'CBSE' | 'ICSE',
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, password, grade, board }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function loginUser(
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

export async function logoutUser(): Promise<void> {
  const refreshToken = getRefreshToken();
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
  } finally {
    clearTokens();
  }
}

/** Requests a password-reset email. Always resolves (never reveals existence). */
export async function requestPasswordReset(email: string): Promise<void> {
  await fetch(`${API_BASE}/auth/forgot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

/** Consumes a reset token and sets a new password. */
export async function resetPassword(token: string, password: string): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });
  if (!res.ok) throw new Error(await res.text());
}

/** Rehydrates the authenticated learner's profile (class + board + student id). */
export async function fetchMe(): Promise<LearnerProfile> {
  const res = await authedFetch(`${API_BASE}/auth/me`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ─── Parent report (PIN-gated) ────────────────────────────────────────────────

export interface ParentReport {
  studentName: string;
  weekStart: string;
  weekEnd: string;
  weekNumber?: number;
  focusSubject?: string;
  headline?: string;
  narrative: string;
  suggestion: string;
  win?: { concept: string; allLevels?: boolean; detail: string };
  gap?: { concept: string; explanation: string };
  voice?: { question: string; answer: string; note: string };
  askTonight?: { question: string; hint: string };
  trend?: { recallPct: number; applyPct: number; caption: string };
  careless?: { conceptGapPct: number; verdict: string };
  effort: { sessions: number; activeDays: number; streak: number; minutes: number };
  mastery: { strong: number; developing: number; weak: number; total: number };
  improving: { name: string; delta: number }[];
  focusAreas: { concept: string; tags: string[] }[];
}

/** Whether a parent PIN has been set (controls create-vs-enter UI). */
export async function getReportStatus(): Promise<{ pinSet: boolean }> {
  const res = await authedFetch(`${API_BASE}/report/status`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/** Sets or changes the parent PIN (currentPin required when changing). */
export async function setParentPin(pin: string, currentPin?: string): Promise<void> {
  const res = await authedFetch(`${API_BASE}/auth/parent-pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin, currentPin: currentPin ?? '' }),
  });
  if (!res.ok) throw new Error(await res.text());
}

/** Verifies the PIN and returns today's (cached) parent report. */
export interface ReportHistoryItem {
  id: string;
  generatedAt: string;
}

export interface ReportBundle {
  report: ParentReport | null;
  reportId: string;
  history: ReportHistoryItem[];
  weeklyCount: number;
}

/** Verifies the PIN and returns the latest report + history + this week's usage. */
export async function unlockReports(pin: string): Promise<ReportBundle> {
  const res = await authedFetch(`${API_BASE}/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/** Generates a fresh report on demand, stores it, and returns the updated bundle. */
export async function generateReport(pin: string): Promise<ReportBundle> {
  const res = await authedFetch(`${API_BASE}/report/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/** Opens one of the parent's past reports by id. */
export async function fetchReportItem(pin: string, id: string): Promise<ParentReport> {
  const res = await authedFetch(`${API_BASE}/report/item`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin, id }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}


// ─── Lead capture (enroll callback request from the login screen) ─────────────

export interface CallbackRequestResult {
  ok: boolean;
}

/**
 * Submits a "request a call" lead from the login/enroll form.
 *
 * The backend `/leads` endpoint is added in Phase 2. Until it ships, a 404/501
 * is treated as a soft success so the MVP enroll form still confirms to the
 * parent (the optimistic UX in the design mock). Network errors still reject.
 */
export async function requestCallback(
  phone: string,
): Promise<CallbackRequestResult> {
  const res = await fetch(`${API_BASE}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, source: 'login_enroll' }),
  });
  if (res.ok) return { ok: true };
  // Endpoint not yet deployed — don't block the parent on a missing route.
  if (res.status === 404 || res.status === 501) return { ok: true };
  throw new Error(await res.text());
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
  mastered: number;
  inProgress: number;
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
  payload?: import('@/types').QuestionPayload;
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
    payload: q.payload,
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
  const res = await authedFetch(
    `${API_BASE}/concepts/${conceptId}?student=${studentId()}`,
  );
  if (!res.ok) throw new Error(`fetchConcept ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function fetchChapters(subjectKey: string): Promise<ApiChapter[]> {
  const res = await authedFetch(`${API_BASE}/chapters?subject=${subjectKey}`);
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
  const res = await authedFetch(`${API_BASE}/dashboard?student=${studentId()}`, {
    cache: 'no-store',
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

export interface ApiRecentSession {
  conceptId: string;
  conceptName: string;
  subjectKey: string;
  station: string;
  score: number;
  passed: boolean;
  completedAt: string;
}

export interface ApiToday {
  fixQueue: ApiTodayItem[];
  reviseQueue: ApiTodayItem[];
  upcomingReviseQueue: ApiTodayItem[];
  recentSessions: ApiRecentSession[];
}

export async function fetchToday(): Promise<ApiToday> {
  const res = await authedFetch(`${API_BASE}/today?student=${studentId()}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`fetchToday ${res.status}: ${await res.text()}`);
  const d = await res.json();
  // The API returns null (not []) for empty queues — coerce so callers can
  // safely read .length / .map without crashing.
  return {
    fixQueue: d.fixQueue ?? [],
    reviseQueue: d.reviseQueue ?? [],
    upcomingReviseQueue: d.upcomingReviseQueue ?? [],
    recentSessions: d.recentSessions ?? [],
  };
}

export async function fetchConcepts(chapterId: string): Promise<Concept[]> {
  const res = await authedFetch(
    `${API_BASE}/concepts?chapter=${chapterId}&student=${studentId()}`,
    { next: { revalidate: 0 } } as RequestInit // always fresh
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
  const res = await authedFetch(`${API_BASE}/concepts/${conceptId}/questions?${params}`);
  if (!res.ok) throw new Error(`fetchQuestions ${res.status}: ${await res.text()}`);
  const data: ApiQuestion[] = await res.json();
  return data.map(mapQuestion);
}

export interface SubmitAnswer {
  questionId: string;
  questionType: string;
  chosenOption?: string;
  studentText?: string;
  answerPayload?: unknown;
  elapsedMs?: number;
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
  const res = await authedFetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId: studentId(), conceptId, station }),
  });
  if (!res.ok) throw new Error(`startSession ${res.status}`);
  return res.json();
}

export async function completeSession(
  session: ActiveSession,
  answers: SubmitAnswer[]
): Promise<SessionResult> {
  const res = await authedFetch(`${API_BASE}/sessions/${session.sessionId}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Token': session.sessionToken,
    },
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) throw new Error(`completeSession ${res.status}`);
  return res.json();
}

export async function getSession(session: ActiveSession): Promise<SessionResult> {
  const res = await authedFetch(`${API_BASE}/sessions/${session.sessionId}`, {
    headers: { 'X-Session-Token': session.sessionToken },
  });
  if (!res.ok) throw new Error(`getSession ${res.status}`);
  return res.json();
}

export async function getSessionReview(session: ActiveSession): Promise<SessionReview> {
  const res = await authedFetch(`${API_BASE}/sessions/${session.sessionId}/review`, {
    headers: { 'X-Session-Token': session.sessionToken },
  });
  if (!res.ok) throw new Error(`getSessionReview ${res.status}`);
  return res.json();
}

// A previously completed attempt at a concept (newest first in the history list).
export interface PastSession {
  sessionId: string;
  station: QuestionLevel;
  score: number;
  completedAt: string;
}

// List the learner's completed attempts for a concept, optionally for one level.
export async function listConceptSessions(
  conceptId: string,
  level?: QuestionLevel,
): Promise<PastSession[]> {
  const qs = level ? `?level=${encodeURIComponent(level)}` : '';
  const res = await authedFetch(`${API_BASE}/concepts/${conceptId}/sessions${qs}`);
  if (!res.ok) throw new Error(`listConceptSessions ${res.status}`);
  return res.json();
}

// Review any of the learner's own past sessions by id (student-authenticated,
// no per-session token needed — used to reopen previous reports).
export async function getSessionReportById(sessionId: string): Promise<SessionReview> {
  const res = await authedFetch(`${API_BASE}/sessions/${sessionId}/report`);
  if (!res.ok) throw new Error(`getSessionReportById ${res.status}`);
  return res.json();
}

// ─── Student Planner / Calendar ───────────────────────────────────────────────

export interface PlanSettings {
  startDate: string;
  timezone: string;
  studyDays: number[];
  newConceptsPerDay: number;
  reviseCapPerDay: number;
  fixCapPerDay: number;
  subjectsPerWeek: number;
}

export interface PlanState {
  hasPlan: boolean;
  settings: PlanSettings;
}

export interface AgendaLearn { conceptId: string; conceptName: string; subjectKey: string; plannedDate: string; overdue: boolean; }
export interface AgendaFix { conceptId: string; conceptName: string; subjectKey: string; level: string; }
export interface AgendaRevise { conceptId: string; conceptName: string; subjectKey: string; dueDate: string; }

export interface Agenda {
  date: string;
  learn: AgendaLearn[];
  fix: AgendaFix[];
  revise: AgendaRevise[];
  learnTotal: number;
  reviseTotal: number;
  fixTotal: number;
  estMinutes: number;
  status: string;
  positiveNote: string;
  onLeave: boolean;
}

export interface PlanItem {
  id: number;
  conceptId: string;
  conceptName: string;
  subjectKey: string;
  plannedDate: string;
  orderIdx: number;
  status: string;
  source: string;
}

export interface PlanLeave { id: number; startDate: string; endDate: string; reason: string; }

export async function fetchPlan(): Promise<PlanState> {
  const res = await authedFetch(`${API_BASE}/plan`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchPlan ${res.status}`);
  return res.json();
}

export async function generatePlan(settings?: Partial<PlanSettings>): Promise<PlanState> {
  const res = await authedFetch(`${API_BASE}/plan/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings ?? {}),
  });
  if (!res.ok) throw new Error(`generatePlan ${res.status}`);
  return res.json();
}

export async function savePlanSettings(settings: Partial<PlanSettings>): Promise<PlanState> {
  const res = await authedFetch(`${API_BASE}/plan/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error(`savePlanSettings ${res.status}`);
  return res.json();
}

export async function fetchAgenda(date?: string): Promise<Agenda> {
  const qs = date ? `?date=${date}` : '';
  const res = await authedFetch(`${API_BASE}/plan/agenda${qs}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchAgenda ${res.status}`);
  return res.json();
}

export async function fetchPlanItems(from: string, to: string): Promise<PlanItem[]> {
  const res = await authedFetch(`${API_BASE}/plan/items?from=${from}&to=${to}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchPlanItems ${res.status}`);
  const d = await res.json();
  return d.items ?? [];
}

export async function movePlanItem(id: number, date: string): Promise<void> {
  const res = await authedFetch(`${API_BASE}/plan/item/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, date }),
  });
  if (!res.ok) throw new Error(`movePlanItem ${res.status}`);
}

export async function skipPlanItem(id: number): Promise<void> {
  const res = await authedFetch(`${API_BASE}/plan/item/skip`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error(`skipPlanItem ${res.status}`);
}

export async function reflowPlan(): Promise<void> {
  const res = await authedFetch(`${API_BASE}/plan/reflow`, { method: 'POST' });
  if (!res.ok) throw new Error(`reflowPlan ${res.status}`);
}

export async function fetchLeaves(): Promise<PlanLeave[]> {
  const res = await authedFetch(`${API_BASE}/plan/leaves`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchLeaves ${res.status}`);
  const d = await res.json();
  return d.leaves ?? [];
}

export async function addLeave(start: string, end: string, reason: string): Promise<void> {
  const res = await authedFetch(`${API_BASE}/plan/leave`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ start, end, reason }),
  });
  if (!res.ok) throw new Error(`addLeave ${res.status}`);
}

export async function removeLeave(id: number): Promise<void> {
  const res = await authedFetch(`${API_BASE}/plan/leave/remove`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error(`removeLeave ${res.status}`);
}

export interface CalEntry {
  date: string;
  kind: 'learn' | 'revise';
  itemId: number;
  conceptId: string;
  conceptName: string;
  subjectKey: string;
  status: string;
}

export async function fetchCalendar(from: string, to: string): Promise<CalEntry[]> {
  const res = await authedFetch(`${API_BASE}/plan/calendar?from=${from}&to=${to}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchCalendar ${res.status}`);
  const d = await res.json();
  return d.entries ?? [];
}
