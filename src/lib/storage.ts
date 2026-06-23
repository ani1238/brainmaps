'use client';

import type {
  StudentProfile,
  StudentProgress,
  ConceptProgress,
  StationKey,
  MasteryState,
  SessionRecord,
} from '@/types';
import { useSyncExternalStore } from 'react';
import {
  EMA_WEIGHTS,
  MASTERY_THRESHOLDS,
  SRS_INTERVALS,
  STATION_ORDER,
} from '@/lib/tokens';

// ─── Storage keys ─────────────────────────────────────────────────────────────

const KEYS = {
  profile:   'bm_profile',
  progress:  'bm_progress',
  authToken: 'bm_auth_token',
  refreshToken: 'bm_refresh_token',
} as const;

// ─── Student profile ──────────────────────────────────────────────────────────

const PROFILE_EVENT = 'brainmaps:profile-change';

export function getProfile(): StudentProfile | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(KEYS.profile);
  if (!raw) return null;
  try { return JSON.parse(raw) as StudentProfile; }
  catch { return null; }
}

export function saveProfile(profile: StudentProfile): void {
  localStorage.setItem(KEYS.profile, JSON.stringify(profile));
  window.dispatchEvent(new Event(PROFILE_EVENT));
}

// Builds and persists a StudentProfile from the authenticated learner response
// (register / login / /auth/me). Each account is a single learner, so the
// learner's class + board come straight from the account.
export function saveProfileFromLearner(learner: {
  studentId: string;
  name: string;
  grade: number;
  board: 'CBSE' | 'ICSE';
}): StudentProfile {
  const existing = getProfile();
  const profile: StudentProfile = {
    id: learner.studentId,
    name: learner.name,
    class: learner.grade as 3 | 4 | 5 | 6 | 7,
    board: learner.board,
    streak: existing?.id === learner.studentId ? existing.streak : 0,
    lastActiveDate: existing?.id === learner.studentId ? existing.lastActiveDate : '',
    enrolledSubjects: ['sci', 'soc', 'eng'],
    onboardingComplete: true,
  };
  saveProfile(profile);
  return profile;
}

// ─── Auth tokens (JWT access + rotating refresh) ──────────────────────────────

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(KEYS.authToken);
}

export function saveAuthToken(token: string): void {
  localStorage.setItem(KEYS.authToken, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(KEYS.authToken);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(KEYS.refreshToken);
}

export function saveRefreshToken(token: string): void {
  if (token) localStorage.setItem(KEYS.refreshToken, token);
}

/** Persists the access + refresh token pair from an auth response. */
export function saveTokens(access: string, refresh?: string): void {
  saveAuthToken(access);
  if (refresh) saveRefreshToken(refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(KEYS.authToken);
  localStorage.removeItem(KEYS.refreshToken);
}

// ─── Clear everything on logout ───────────────────────────────────────────────

export function clearProfile(): void {
  localStorage.removeItem(KEYS.profile);
  localStorage.removeItem(KEYS.progress);
  localStorage.removeItem(KEYS.authToken);
  localStorage.removeItem(KEYS.refreshToken);
  window.dispatchEvent(new Event(PROFILE_EVENT));
}

function subscribeProfile(onStoreChange: () => void): () => void {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener(PROFILE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener(PROFILE_EVENT, onStoreChange);
  };
}

function getProfileSnapshot(): string | null {
  return localStorage.getItem(KEYS.profile);
}

export function useProfile(): StudentProfile | null {
  const raw = useSyncExternalStore(subscribeProfile, getProfileSnapshot, () => null);
  if (!raw) return null;
  try { return JSON.parse(raw) as StudentProfile; }
  catch { return null; }
}

// ─── Student progress ─────────────────────────────────────────────────────────

export function getProgress(): StudentProgress | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(KEYS.progress);
  if (!raw) return null;
  try { return JSON.parse(raw) as StudentProgress; }
  catch { return null; }
}

export function saveProgress(progress: StudentProgress): void {
  localStorage.setItem(KEYS.progress, JSON.stringify(progress));
}

export function getConceptProgress(conceptId: string): ConceptProgress | null {
  const p = getProgress();
  return p?.concepts[conceptId] ?? null;
}

// ─── Default concept progress factory ────────────────────────────────────────

export function defaultConceptProgress(conceptId: string): ConceptProgress {
  return {
    concept_id: conceptId,
    mastery_score: 0,
    state: 'NOT_STARTED',
    set_states: {
      learn_it:      'current',
      get_it:        'locked',
      master_it:     'locked',
      strengthen:    'locked',
      keep_it_fresh: 'locked',
    },
    strengthen_unlocked: false,
    revise: {
      unlocked: false,
      interval_tier: 0,
      next_due: null,
      due_for_recall: false,
    },
    weakness_profile: {
      last_updated: today(),
      misconception_ids: [],
      weak_question_subtypes: [],
      coverage_gaps: [],
    },
    session_history: [],
  };
}

// ─── EMA scoring ─────────────────────────────────────────────────────────────

export function calculateEMA(recentScores: number[]): number {
  // recentScores[0] = most recent. Uses up to 5 values.
  const weights = EMA_WEIGHTS;
  let total = 0;
  let weightSum = 0;
  for (let i = 0; i < Math.min(recentScores.length, weights.length); i++) {
    total += recentScores[i] * weights[i];
    weightSum += weights[i];
  }
  return weightSum > 0 ? Math.min(1, total / weightSum) : 0;
}

export function scoreToMasteryState(
  score: number,
  revise: ConceptProgress['revise'],
): MasteryState {
  if (score === 0) return 'NOT_STARTED';
  if (revise.due_for_recall) return 'RECALL_DUE';
  if (score >= MASTERY_THRESHOLDS.STRONG)     return 'STRONG';
  if (score >= MASTERY_THRESHOLDS.DEVELOPING) return 'DEVELOPING';
  if (score >= MASTERY_THRESHOLDS.WEAK)       return 'WEAK';
  return 'VERY_WEAK';
}

// ─── Station unlock logic ─────────────────────────────────────────────────────

function allThreeSetsComplete(states: ConceptProgress['set_states']): boolean {
  return (
    states.learn_it  === 'done' &&
    states.get_it    === 'done' &&
    states.master_it === 'done'
  );
}

function nextLockedStation(states: ConceptProgress['set_states']): StationKey | null {
  const assessmentOrder: StationKey[] = ['learn_it', 'get_it', 'master_it'];
  for (const key of assessmentOrder) {
    if (states[key] === 'locked') return key;
  }
  return null;
}

// ─── Record a completed session ───────────────────────────────────────────────

export interface SessionResult {
  station: StationKey;
  score: number; // 0.0–1.0 fraction correct
  items: SessionRecord['items'];
  isFix?: boolean; // true if this was a Today's Fix attempt
}

export function recordSession(
  conceptId: string,
  result: SessionResult,
): ConceptProgress {
  const progress = getProgress() ?? {
    student_id: getProfile()?.id ?? 'unknown',
    last_updated: new Date().toISOString(),
    concepts: {},
  };

  const cp: ConceptProgress =
    progress.concepts[conceptId] ?? defaultConceptProgress(conceptId);

  // 1. Append session record
  const record: SessionRecord = {
    date: today(),
    station: result.station,
    score: result.score,
    items: result.items,
  };
  cp.session_history = [record, ...cp.session_history].slice(0, 50);

  // 2. Recalculate EMA from the last 5 assessment-station scores
  const assessmentScores = cp.session_history
    .filter(s => ['learn_it', 'get_it', 'master_it'].includes(s.station))
    .slice(0, 5)
    .map(s => s.score);
  if (assessmentScores.length > 0) {
    cp.mastery_score = calculateEMA(assessmentScores);
  }

  // 3. Update the station state
  const passed = result.score >= 0.6;
  const station = result.station;

  if (result.isFix) {
    // Fix attempt: on pass, mark the failed station done and unlock the next
    if (passed) {
      cp.set_states[station] = 'done';
      const next = nextLockedStation(cp.set_states);
      if (next) cp.set_states[next] = 'current';
    }
    // On fail, station stays needsFixing — nothing changes
  } else {
    if (passed) {
      cp.set_states[station] = 'done';
      // Unlock next in the assessment sequence
      const next = nextLockedStation(cp.set_states);
      if (next) cp.set_states[next] = 'current';
    } else {
      cp.set_states[station] = 'needsFixing';
    }
  }

  // 4. Strengthen and Revise unlock gates
  if (allThreeSetsComplete(cp.set_states)) {
    cp.strengthen_unlocked = true;
    if (cp.set_states.strengthen === 'locked') {
      cp.set_states.strengthen = 'current';
    }
    if (cp.mastery_score >= 0.80) {
      cp.revise.unlocked = true;
      if (cp.set_states.keep_it_fresh === 'locked') {
        cp.set_states.keep_it_fresh = 'current';
        if (!cp.revise.next_due) {
          cp.revise.next_due = addDays(today(), SRS_INTERVALS[0]);
        }
      }
    }
  }

  // 5. Derive new mastery state
  cp.state = scoreToMasteryState(cp.mastery_score, cp.revise);

  // 6. Persist
  progress.concepts[conceptId] = cp;
  progress.last_updated = new Date().toISOString();
  saveProgress(progress);

  return cp;
}

// ─── Revise / recall ──────────────────────────────────────────────────────────

export function recordRevise(conceptId: string, passed: boolean): ConceptProgress {
  const progress = getProgress();
  if (!progress) throw new Error('No progress found');
  const cp = progress.concepts[conceptId];
  if (!cp) throw new Error(`No progress for ${conceptId}`);

  if (passed) {
    const nextTier = Math.min(cp.revise.interval_tier + 1, SRS_INTERVALS.length - 1);
    cp.revise.interval_tier = nextTier;
    cp.revise.next_due = addDays(today(), SRS_INTERVALS[nextTier]);
    cp.revise.due_for_recall = false;
    cp.set_states.keep_it_fresh = 'done';
  } else {
    cp.revise.interval_tier = 0;
    cp.revise.next_due = addDays(today(), SRS_INTERVALS[0]);
    cp.revise.due_for_recall = false;
    // Mastery score drops slightly on recall failure
    cp.mastery_score = Math.max(0, cp.mastery_score - 0.1);
  }

  cp.state = scoreToMasteryState(cp.mastery_score, cp.revise);
  progress.concepts[conceptId] = cp;
  progress.last_updated = new Date().toISOString();
  saveProgress(progress);
  return cp;
}

// ─── Daily queue builders ─────────────────────────────────────────────────────

export function buildTodaysFixQueue(progress: StudentProgress) {
  return Object.values(progress.concepts)
    .filter(cp =>
      STATION_ORDER.some(s => cp.set_states[s] === 'needsFixing')
    )
    .map(cp => ({
      concept_id: cp.concept_id,
      failedStations: STATION_ORDER.filter(s => cp.set_states[s] === 'needsFixing'),
      state: cp.state,
    }));
}

export function buildReviseQueue(progress: StudentProgress) {
  const t = today();
  return Object.values(progress.concepts)
    .filter(cp => cp.revise.unlocked && cp.revise.next_due && cp.revise.next_due <= t)
    .map(cp => ({ concept_id: cp.concept_id, interval_tier: cp.revise.interval_tier }));
}

// ─── Streak helpers ───────────────────────────────────────────────────────────

export function updateStreak(profile: StudentProfile): StudentProfile {
  const t = today();
  if (profile.lastActiveDate === t) return profile;
  const yesterday = addDays(t, -1);
  const newStreak =
    profile.lastActiveDate === yesterday ? profile.streak + 1 : 1;
  return { ...profile, streak: newStreak, lastActiveDate: t };
}

// ─── Date utils ───────────────────────────────────────────────────────────────

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
