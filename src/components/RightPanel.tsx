'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MasteryChip } from './ConceptNode';
import type { Concept, StationKey, StationStatus, QuestionLevel, Question } from '@/types';
import { COLORS, STATION_ORDER, STATION_LABELS, STATION_NUMBERS } from '@/lib/tokens';
import { CONCEPT_QUESTIONS } from '@/data/questions';
import { splitStations } from '@/data/society';
import { fetchQuestions } from '@/lib/api';
import { assessmentHref } from '@/lib/navigation';

// Maps each station to the question-level it serves
const STATION_TO_LEVEL: Record<StationKey, QuestionLevel> = {
  learn_it:      'level1',
  get_it:        'level2',
  master_it:     'level3',
  strengthen:    'strengthen',
  keep_it_fresh: 'revise',
};

interface RightPanelProps {
  concept: Concept;
  chapterName: string;
  subjectName: string;
  subjectColor: string;
  onClose: () => void;
  onStartSharpen: () => void;
  onStartRecall: () => void;
}

// ─── Derive the 5 station states ─────────────────────────────────────────────
//
// For API concepts (soc_chB), the backend returns per-station state strings
// ('locked'|'current'|'done'|'needs_fixing') — map them directly.
// For dummy-data concepts, fall back to inferring from mastery state.

function apiStateToStatus(s: string | undefined): StationStatus {
  switch (s) {
    case 'done':          return 'done';
    case 'current':       return 'current';
    case 'needs_fixing':  return 'needsFixing';
    default:              return 'locked';
  }
}

function deriveStations(concept: Concept): Record<StationKey, StationStatus> {
  const recall: StationStatus = concept.dueForRecall ? 'current' : 'done';

  // ── API path: station states come directly from the server ───────────────
  if (concept.l1State !== undefined) {
    return {
      learn_it:      apiStateToStatus(concept.l1State),
      get_it:        apiStateToStatus(concept.l2State),
      master_it:     apiStateToStatus(concept.l3State),
      strengthen:    apiStateToStatus(concept.strengthenState),
      keep_it_fresh: concept.reviseState === 'locked'
                       ? 'locked'
                       : concept.dueForRecall ? 'current' : apiStateToStatus(concept.reviseState),
    };
  }

  // ── Fallback: infer from mastery state (dummy data) ──────────────────────
  const score = concept.score ?? 0;
  switch (concept.state) {
    case 'NOT_STARTED':
      return { learn_it: 'current',     get_it: 'locked',     master_it: 'locked', strengthen: 'locked', keep_it_fresh: 'locked' };
    case 'VERY_WEAK':
      return { learn_it: 'needsFixing', get_it: 'locked',     master_it: 'locked', strengthen: 'locked', keep_it_fresh: 'locked' };
    case 'WEAK':
      return { learn_it: 'done',        get_it: 'needsFixing',master_it: 'locked', strengthen: 'locked', keep_it_fresh: 'locked' };
    case 'DEVELOPING':
      return { learn_it: 'done',        get_it: 'done',       master_it: 'current',strengthen: 'locked', keep_it_fresh: 'locked' };
    case 'STRONG':
    case 'RECALL_DUE':
      return { learn_it: 'done', get_it: 'done', master_it: 'done', strengthen: 'current', keep_it_fresh: score >= 0.8 ? recall : 'locked' };
    default:
      return { learn_it: 'current',     get_it: 'locked',     master_it: 'locked', strengthen: 'locked', keep_it_fresh: 'locked' };
  }
}

// ─── Per-station copy ─────────────────────────────────────────────────────────

const STATION_INFO: Record<StationKey, { tagline: string; blurb: string; lockedHint: string }> = {
  learn_it: {
    tagline: 'The basics · easy',
    blurb: 'Your first questions. Get these right to unlock Level 2.',
    lockedHint: '',
  },
  get_it: {
    tagline: 'Understanding it · moderate',
    blurb: 'A bit harder — shows you really understand the idea. Unlocks Level 3.',
    lockedHint: 'Clear Level 1 first to unlock this.',
  },
  master_it: {
    tagline: 'New situations · the toughest',
    blurb: 'Use the idea in new situations. Finishing all three levels unlocks Strengthen & Revise.',
    lockedHint: 'Clear Level 2 first to unlock this.',
  },
  strengthen: {
    tagline: 'Mixed retrieval · interleaved',
    blurb: 'All your Level 1–3 questions shuffled together, so your brain can\'t lean on "I know this is an easy one." Ends with a 3-minute brain-dump.',
    lockedHint: 'Finish all 3 levels first to unlock this.',
  },
  keep_it_fresh: {
    tagline: 'Spaced recall · quick',
    blurb: 'A quick check that comes back on a schedule, so you don’t forget.',
    lockedHint: 'Finish all 3 levels and reach 80% mastery first.',
  },
};

const STATUS_PILL: Record<StationStatus, { label: string; color: string; bg: string }> = {
  current:     { label: 'Do this now', color: COLORS.indigo, bg: `${COLORS.indigo}14` },
  needsFixing: { label: 'Needs fixing', color: COLORS.weak,  bg: `${COLORS.weak}14` },
  done:        { label: 'Done ✓',       color: '#16a34a',     bg: `${COLORS.strong}14` },
  locked:      { label: 'Locked',       color: '#a8a29e',     bg: 'rgba(0,0,0,0.05)' },
};

// ─── Panel ────────────────────────────────────────────────────────────────────

export function RightPanel({
  concept,
  chapterName,
  subjectName,
  subjectColor,
  onClose,
}: RightPanelProps) {
  const router = useRouter();
  const stations = deriveStations(concept);

  // Default to the station the student should act on
  const initialTab: StationKey =
    STATION_ORDER.find(k => stations[k] === 'current' || stations[k] === 'needsFixing') ??
    STATION_ORDER.find(k => stations[k] === 'done') ??
    'learn_it';
  const [activeTab, setActiveTab] = useState<StationKey>(initialTab);

  // ── Questions: try API first, fall back to local if empty or error ────────
  const questionCache = useRef<Map<string, Question[]>>(new Map());
  const [tabQuestions, setTabQuestions] = useState<Question[]>([]);
  const [loadingQ, setLoadingQ] = useState(false);

  useEffect(() => {
    const level = STATION_TO_LEVEL[activeTab];
    const cacheKey = `${concept.id}:${level}`;

    if (questionCache.current.has(cacheKey)) {
      setTabQuestions(questionCache.current.get(cacheKey)!);
      return;
    }

    const localFallback = () => {
      const allQ = CONCEPT_QUESTIONS[concept.id] ?? [];
      const split = splitStations(allQ);
      return split[level] ?? [];
    };

    setLoadingQ(true);
    fetchQuestions(concept.id, level)
      .then(qs => {
        // If DB has no questions for this concept/level, use local data
        const result = qs.length > 0 ? qs : localFallback();
        questionCache.current.set(cacheKey, result);
        setTabQuestions(result);
      })
      .catch(() => {
        const result = localFallback();
        questionCache.current.set(cacheKey, result);
        setTabQuestions(result);
      })
      .finally(() => setLoadingQ(false));
  }, [concept.id, activeTab]);

  function startStation(key: StationKey) {
    const level = STATION_TO_LEVEL[key];
    const returnTo = `/brain-map?conceptId=${concept.id}`;
    if (key === 'keep_it_fresh') {
      router.push(assessmentHref('/sharpen', { conceptId: concept.id, level }, returnTo));
    } else {
      router.push(assessmentHref('/sharpen', { conceptId: concept.id, level }, returnTo));
    }
  }

  // Open the previous-reports page for a station (its past graded attempts).
  function viewReports(key: StationKey) {
    const level = STATION_TO_LEVEL[key];
    const returnTo = `/brain-map?conceptId=${concept.id}`;
    router.push(`/reports?conceptId=${concept.id}&level=${level}&returnTo=${encodeURIComponent(returnTo)}`);
  }

  return (
    <div
      className="absolute right-0 left-0 sm:left-auto top-0 bottom-0 w-full sm:w-[420px] flex flex-col animate-slide-in-right"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(79,70,229,0.2)',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.06)',
        zIndex: 10,
      }}
    >
      {/* Header */}
      <div className="flex-shrink-0 px-5 py-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold tracking-widest truncate" style={{ color: subjectColor }}>
              {subjectName.toUpperCase()} · {chapterName}
            </div>
            <h2 className="text-xl font-extrabold mt-1 leading-tight" style={{ color: '#1c1917' }}>
              {concept.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-black/5"
            style={{ border: '1px solid rgba(0,0,0,0.12)', color: '#78716c', fontSize: 16 }}
          >
            ×
          </button>
        </div>

        <div className="flex items-center gap-3 mt-3">
          <MasteryChip state={concept.state} />
        </div>
      </div>

      {/* Station tabs */}
      <div
        className="flex-shrink-0 flex gap-1 px-3 overflow-x-auto"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}
      >
        {STATION_ORDER.map(key => {
          const isActive = activeTab === key;
          const st = stations[key];
          const dot = STATUS_PILL[st].color;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex items-center gap-1.5 py-2.5 px-2.5 text-xs font-bold whitespace-nowrap transition-colors"
              style={{
                color: isActive ? '#1c1917' : '#78716c',
                borderBottom: isActive ? '2.5px solid #4F46E5' : '2.5px solid transparent',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot }} />
              {STATION_LABELS[key]}
            </button>
          );
        })}
      </div>

      {/* Active station content */}
      <div className="flex-1 overflow-y-auto">
        <StationTab
          stationKey={activeTab}
          status={stations[activeTab]}
          questions={tabQuestions}
          loading={loadingQ}
          reviseSchedule={concept.reviseSchedule}
          onStart={() => startStation(activeTab)}
          onViewReports={() => viewReports(activeTab)}
        />
      </div>
    </div>
  );
}

// ─── A single station's panel ─────────────────────────────────────────────────

function StationTab({ stationKey, status, questions, loading, reviseSchedule, onStart, onViewReports }: {
  stationKey: StationKey;
  status: StationStatus;
  questions: { type: string }[];
  loading?: boolean;
  reviseSchedule?: Concept['reviseSchedule'];
  onStart: () => void;
  onViewReports: () => void;
}) {
  const number = STATION_NUMBERS[stationKey];
  const label = STATION_LABELS[stationKey];
  const info = STATION_INFO[stationKey];
  const pill = STATUS_PILL[status];

  const typeCounts = questions.reduce<Record<string, number>>((acc, q) => {
    acc[q.type] = (acc[q.type] ?? 0) + 1;
    return acc;
  }, {});
  const typeSummary = Object.entries(typeCounts)
    .map(([t, n]) => `${n} ${TYPE_LABELS[t] ?? t.toLowerCase()}`)
    .join(' · ');

  const locked = status === 'locked';
  const isDone = status === 'done';
  const nextDue = reviseSchedule?.nextDueAt ? new Date(reviseSchedule.nextDueAt) : null;
  const lastDone = reviseSchedule?.lastDoneAt ? new Date(reviseSchedule.lastDoneAt) : null;
  const today = new Date();
  const isFutureReview = stationKey === 'keep_it_fresh' && nextDue && nextDue > today;
  const revisedToday = lastDone
    ? lastDone.getFullYear() === today.getFullYear()
      && lastDone.getMonth() === today.getMonth()
      && lastDone.getDate() === today.getDate()
    : false;
  const dueDate = nextDue
    ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(nextDue)
    : null;
  const daysUntilDue = nextDue
    ? Math.max(1, Math.ceil((nextDue.getTime() - today.getTime()) / 86_400_000))
    : null;

  return (
    <div className="p-5 flex flex-col gap-5">
      {/* Station heading */}
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-base font-extrabold"
          style={{
            background: locked ? 'rgba(0,0,0,0.06)' : isDone ? COLORS.strong : COLORS.indigo,
            color: locked ? '#a8a29e' : '#fff',
            border: `2px solid ${locked ? 'rgba(0,0,0,0.12)' : isDone ? COLORS.strong : COLORS.indigo}`,
          }}
        >
          {locked ? '🔒' : isDone ? '✓' : number}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-lg" style={{ color: '#1c1917' }}>{label}</h3>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: pill.bg, color: pill.color }}
            >
              {pill.label}
            </span>
          </div>
          <div className="text-xs mt-0.5" style={{ color: '#a8a29e' }}>{info.tagline}</div>
        </div>
      </div>

      {/* Blurb */}
      <p className="text-sm leading-relaxed" style={{ color: '#44403c' }}>{info.blurb}</p>

      {stationKey === 'keep_it_fresh' && reviseSchedule && (
        <div
          className="rounded-xl p-4"
          style={{ background: `${COLORS.strong}0d`, border: `1px solid ${COLORS.strong}35` }}
        >
          <div className="text-xs font-extrabold" style={{ color: '#166534' }}>
            {revisedToday ? '✓ Revised today' : isFutureReview ? '✓ Review complete' : 'Review due'}
          </div>
          {dueDate && (
            <div className="font-bold text-sm mt-1" style={{ color: '#1c1917' }}>
              Next review: {dueDate}
            </div>
          )}
          {isFutureReview && daysUntilDue && (
            <div className="text-xs mt-0.5" style={{ color: '#78716c' }}>
              in {daysUntilDue} {daysUntilDue === 1 ? 'day' : 'days'} · Day {reviseSchedule.intervalDays} review
            </div>
          )}
        </div>
      )}

      {/* Questions summary */}
      {loading ? (
        <div
          className="rounded-xl p-4 animate-pulse"
          style={{ background: 'rgba(79,70,229,0.04)', border: '1px solid rgba(79,70,229,0.18)' }}
        >
          <div className="h-4 w-24 rounded" style={{ background: 'rgba(79,70,229,0.15)' }} />
          <div className="h-3 w-40 rounded mt-2" style={{ background: 'rgba(79,70,229,0.08)' }} />
        </div>
      ) : questions.length > 0 ? (
        <div
          className="rounded-xl p-4"
          style={{ background: 'rgba(79,70,229,0.04)', border: '1px solid rgba(79,70,229,0.18)' }}
        >
          <div className="font-bold text-base" style={{ color: '#1c1917' }}>
            {questions.length} {questions.length === 1 ? 'question' : 'questions'}
          </div>
          {typeSummary && (
            <div className="text-xs mt-1" style={{ color: '#78716c' }}>{typeSummary}</div>
          )}
        </div>
      ) : (
        <div className="text-sm italic" style={{ color: '#a8a29e' }}>No questions yet for this station.</div>
      )}

      {/* Action */}
      {locked ? (
        <div
          className="rounded-xl p-3 text-sm font-semibold text-center"
          style={{ background: 'rgba(0,0,0,0.03)', color: '#a8a29e', border: '1px dashed rgba(0,0,0,0.12)' }}
        >
          🔒 {info.lockedHint}
        </div>
      ) : isDone && stationKey !== 'keep_it_fresh' ? (
        // Passed level → revise it again or browse previous reports
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onStart}
            className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.98]"
            style={{ background: '#16a34a', boxShadow: `0 4px 16px ${COLORS.strong}40` }}
          >
            🔁 Revise {label}
          </button>
          <button
            onClick={onViewReports}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
            style={{ background: 'rgba(79,70,229,0.08)', color: COLORS.indigo, border: `1px solid ${COLORS.indigo}30` }}
          >
            📄 Previous reports
          </button>
        </div>
      ) : (
        <button
          onClick={onStart}
          className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.98]"
          style={{
            background: status === 'needsFixing' ? COLORS.weak : isDone ? '#16a34a' : COLORS.indigo,
            boxShadow: `0 4px 16px ${status === 'needsFixing' ? COLORS.weak : isDone ? COLORS.strong : COLORS.indigo}40`,
          }}
        >
          {status === 'needsFixing'
            ? `Fix ${label} →`
            : isFutureReview
              ? 'Practise early'
              : isDone
                ? `Review ${label}`
                : `Start ${label} →`}
        </button>
      )}
    </div>
  );
}

const TYPE_LABELS: Record<string, string> = {
  MCQ: 'pick-the-answer',
  STORY_MCQ: 'story choice',
  HOTS: 'think deeper',
  HOTS_MCQ: 'think deeper',
  ASSERTION_REASON: 'assertion-reason',
  DESCRIPTIVE: 'short answer',
  FEYNMAN: 'teach-a-friend',
  BLURT: 'brain-dump',
  ACTIVE_RECALL: 'real-world',
  SPOT_IT: 'spot-it',
  FIX_IT: 'fix-it',
  PRODUCE_IT: 'produce-it',
  GENERATIVE_PRODUCTION: 'produce-it',
  CONTEXT_CLUE: 'context-clue',
};
