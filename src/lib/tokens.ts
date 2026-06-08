import type { StationKey, MasteryState, SubjectKey } from '@/types';

// Re-export so old components that import MasteryState from here still compile
export type { MasteryState };

// ─── Colors ───────────────────────────────────────────────────────────────────

export const COLORS = {
  // Brand
  indigo: '#4F46E5',
  indigoSoft: '#e0e7ff',
  indigoDeep: '#3730a3',

  // Backgrounds
  bgCream: '#F4EFE5',
  bgCream2: '#ece5d3',

  // Ink
  ink: '#1c1917',
  ink2: '#44403c',
  ink3: '#78716c',
  ghost: '#a8a29e',

  // Subject
  science:       '#0d9488',
  socialScience: '#7c3aed',
  english:       '#e11d48',
  // Legacy (kept for dummy data / dashboard)
  history: '#d97706',
  geo: '#059669',
  civics: '#4f46e5',
  society: '#9333ea',

  // Mastery states
  notStarted: '#9ca3af',
  veryWeak: '#ef4444',
  weak: '#f97316',
  developing: '#eab308',
  strong: '#22c55e',
  recallDue: '#f97316', // same amber ring as weak, distinct outer glow
} as const;

// ─── Subjects ─────────────────────────────────────────────────────────────────

// Live subjects — keys match the DB subject_key column
export const SUBJECTS: {
  key: string;
  label: string;
  letter: string;
  color: string;
  icon: string;
}[] = [
  { key: 'science',        label: 'Science',        letter: 'S',  color: COLORS.science,       icon: '🔬' },
  { key: 'social_science', label: 'Social Science',  letter: 'SS', color: COLORS.socialScience, icon: '🌍' },
  { key: 'english',        label: 'English',         letter: 'E',  color: COLORS.english,       icon: '📖' },
];

export const SUBJECT_MAP = Object.fromEntries(
  SUBJECTS.map(s => [s.key, s])
) as Record<string, typeof SUBJECTS[number]>;

// ─── Mastery state display ────────────────────────────────────────────────────

export const MASTERY_MAP: Record<
  MasteryState,
  { color: string; label: string; glyph: string; fillOpacity: number; dashed: boolean }
> = {
  NOT_STARTED: { color: COLORS.notStarted, label: 'New',           glyph: '?', fillOpacity: 0,   dashed: true  },
  VERY_WEAK:   { color: COLORS.veryWeak,   label: 'To fix',        glyph: '!', fillOpacity: 0.2, dashed: false },
  WEAK:        { color: COLORS.weak,        label: 'To fix',        glyph: '◐', fillOpacity: 0.2, dashed: false },
  DEVELOPING:  { color: COLORS.developing,  label: 'Getting there', glyph: '↗', fillOpacity: 0.2, dashed: false },
  STRONG:      { color: COLORS.strong,      label: 'Got it!',       glyph: '✓', fillOpacity: 0.2, dashed: false },
  RECALL_DUE:  { color: COLORS.strong,      label: 'Revise due',    glyph: '✓', fillOpacity: 0.2, dashed: false },
};

// ─── Stations ─────────────────────────────────────────────────────────────────

// Display order (left → right on the station path)
export const STATION_ORDER: StationKey[] = [
  'learn_it',
  'get_it',
  'master_it',
  'strengthen',
  'keep_it_fresh',
];

// v7 display labels — JSON keys stay as v6 for backward compat
export const STATION_LABELS: Record<StationKey, string> = {
  learn_it:      'Level 1',
  get_it:        'Level 2',
  master_it:     'Level 3',
  strengthen:    'Strengthen',
  keep_it_fresh: 'Revise',
};

export const STATION_NUMBERS: Record<StationKey, number> = {
  learn_it:      1,
  get_it:        2,
  master_it:     3,
  strengthen:    4,
  keep_it_fresh: 5,
};

// ─── Spaced repetition intervals (days) ──────────────────────────────────────

export const SRS_INTERVALS = [1, 3, 7, 21, 60] as const;

// ─── Scoring ──────────────────────────────────────────────────────────────────

// EMA weights — index 0 = most recent session
export const EMA_WEIGHTS = [0.35, 0.25, 0.20, 0.12, 0.08] as const;

export const MASTERY_THRESHOLDS = {
  STRONG:     0.80,
  DEVELOPING: 0.45,
  WEAK:       0.25,
  // < 0.25 → VERY_WEAK
} as const;

// Forgiving unlock: fix attempt only needs to clear this bar
export const FIX_UNLOCK_THRESHOLD = 0.60;
