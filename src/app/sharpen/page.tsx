'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GridBackground } from '@/components/GridBackground';
import { LeftRail } from '@/components/LeftRail';
import { QuestionScreen } from '@/components/QuestionScreen';
import type { AnswerPayload } from '@/components/QuestionScreen';
import { COLORS, SUBJECTS, MASTERY_MAP } from '@/lib/tokens';
import { SESSION_QUESTIONS, CHAPTER_DATA, CONCEPT_BY_ID, CONCEPT_DETAILS, DEFAULT_CONCEPT_DETAIL } from '@/data/dummy';
import { CONCEPT_QUESTIONS } from '@/data/questions';
import { splitStations } from '@/data/society';
import { STATION_LABELS } from '@/lib/tokens';
import type { QuestionLevel } from '@/types';
import {
  isLiveConcept, fetchQuestions, startSession, completeSession, getSession,
  type SubmitAnswer, type SessionResult, type AnswerFeedback,
} from '@/lib/api';
import type { Question } from '@/types';

// ── Feedback panel ────────────────────────────────────────────────────────────

const Q_TYPE_LABEL: Record<string, string> = {
  MCQ:          'Multiple choice',
  FEYNMAN:      'Explain it simply',
  BLURT:        'Brain dump',
  ACTIVE_RECALL:'Apply it',
  DESCRIPTIVE:  'Short answer',
};

function FeedbackCard({ item }: { item: AnswerFeedback }) {
  const isMCQ = item.questionType === 'MCQ';
  const scoreColor = isMCQ ? '#ef4444'
    : item.score >= 0.75 ? '#22c55e'
    : item.score >= 0.45 ? '#f97316'
    : '#ef4444';
  const scoreLabel = isMCQ ? 'Incorrect' : `${Math.round(item.score * 100)}%`;
  const icon = isMCQ ? '❌' : item.score >= 0.75 ? '✅' : item.score >= 0.45 ? '🟡' : '🔴';

  return (
    <div
      className="rounded-2xl overflow-hidden text-left"
      style={{ border: `1.5px solid ${scoreColor}30`, background: 'rgba(255,255,255,0.7)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5"
        style={{ background: `${scoreColor}10`, borderBottom: `1px solid ${scoreColor}20` }}>
        <div className="flex items-center gap-2">
          <span className="text-sm">{icon}</span>
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: scoreColor }}>
            {Q_TYPE_LABEL[item.questionType] ?? item.questionType}
          </span>
        </div>
        <span className="text-[11px] font-bold" style={{ color: scoreColor }}>{scoreLabel}</span>
      </div>

      <div className="px-4 py-3 space-y-3">
        {/* Question */}
        <p className="text-xs font-semibold leading-snug" style={{ color: '#78716c' }}>
          {item.questionText.length > 120
            ? item.questionText.slice(0, 117) + '…'
            : item.questionText}
        </p>

        {/* Student's answer */}
        {item.studentAnswer && (
          <div className="rounded-lg px-3 py-2" style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.07)' }}>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#a8a29e' }}>
              Your answer
            </div>
            <p className="text-xs leading-relaxed italic" style={{ color: '#44403c' }}>
              "{item.studentAnswer.length > 300
                ? item.studentAnswer.slice(0, 297) + '…'
                : item.studentAnswer}"
            </p>
          </div>
        )}

        {/* AI feedback */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#a8a29e' }}>
            {isMCQ ? 'Why the correct answer is right' : 'AI feedback'}
          </div>
          <p className="text-xs leading-relaxed" style={{ color: '#1c1917' }}>
            {item.feedback}
          </p>
        </div>
      </div>
    </div>
  );
}

function FeedbackList({ feedback }: { feedback: AnswerFeedback[] }) {
  return (
    <div className="w-full text-left mb-5 space-y-3 max-h-[28rem] overflow-y-auto pr-1">
      {feedback.map((item, i) => <FeedbackCard key={i} item={item} />)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const LEVEL_TO_STATION_LABEL: Record<QuestionLevel, string> = {
  level1: STATION_LABELS.learn_it,
  level2: STATION_LABELS.get_it,
  level3: STATION_LABELS.master_it,
  strengthen: STATION_LABELS.strengthen,
  revise: STATION_LABELS.keep_it_fresh,
};

// Station progression order
const NEXT_LEVEL: Partial<Record<QuestionLevel, QuestionLevel>> = {
  level1: 'level2',
  level2: 'level3',
  level3: 'strengthen',
  strengthen: 'revise',
};

function SharpenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conceptId = searchParams.get('conceptId') ?? 'c104';
  const level = (searchParams.get('level') as QuestionLevel | null) ?? null;

  const conceptWithLoc = CONCEPT_BY_ID[conceptId];
  const concept = conceptWithLoc ?? CONCEPT_BY_ID['c104'];
  const subjectKey = concept?.subjectKey ?? 'sci';
  const chapterId = concept?.chapterId ?? 'sci_ch1';
  const subject = SUBJECTS.find(s => s.key === subjectKey);
  const chapter = CHAPTER_DATA[subjectKey]?.find(ch => ch.id === chapterId);
  const detail = CONCEPT_DETAILS[concept?.id ?? ''] ?? DEFAULT_CONCEPT_DETAIL;

  const stationLabel = level ? LEVEL_TO_STATION_LABEL[level] : null;
  const backToMapHref = concept?.id ? `/brain-map?conceptId=${concept.id}` : '/brain-map';

  // ── Questions: try API first, fall back to local dummy ──────────────────
  const localQuestions: Question[] = (() => {
    const all = CONCEPT_QUESTIONS[concept?.id ?? ''] ?? SESSION_QUESTIONS;
    return level ? (splitStations(all)[level] ?? []) : all;
  })();

  const [questions, setQuestions] = useState<Question[]>(localQuestions);
  // questionsFromApi = true means question IDs exist in the DB and we can call the API session
  const [questionsFromApi, setQuestionsFromApi] = useState(false);

  // ── Question tracking ───────────────────────────────────────────────────
  const [currentIdx, setCurrentIdx] = useState(0);
  const [finished, setFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [mcqCount, setMcqCount] = useState(0);
  const collectedAnswers = useRef<SubmitAnswer[]>([]);

  // ── API session (only when we have real DB-backed question IDs) ─────────
  const sessionIdRef = useRef<string | null>(null);
  const [apiResult, setApiResult] = useState<SessionResult | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Re-run whenever the student moves to a different level or concept
  useEffect(() => {
    // 1. Reset all per-session state so the new level starts fresh
    setCurrentIdx(0);
    setFinished(false);
    setCorrectCount(0);
    setMcqCount(0);
    collectedAnswers.current = [];
    setApiResult(null);
    sessionIdRef.current = null;
    if (pollRef.current) clearInterval(pollRef.current);

    // 2. Show local questions immediately as a fallback (prevents blank screen)
    const all = CONCEPT_QUESTIONS[conceptId] ?? SESSION_QUESTIONS;
    setQuestions(level ? (splitStations(all)[level] ?? []) : all);
    setQuestionsFromApi(false);

    if (!isLiveConcept(conceptId) || !level) return;

    // 3. Fetch real DB questions, then start a fresh session
    fetchQuestions(conceptId, level)
      .then(apiQs => {
        if (apiQs.length > 0) {
          setQuestions(apiQs);
          setQuestionsFromApi(true);
          return startSession(conceptId, level);
        }
        return null;
      })
      .then(id => { if (id) sessionIdRef.current = id; })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conceptId, level]);

  // Stop polling on unmount
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  function handleAnswer(correct: boolean) {
    setMcqCount(n => n + 1);
    if (correct) setCorrectCount(n => n + 1);
  }

  function handleSubmitAnswer(payload: AnswerPayload) {
    collectedAnswers.current.push({
      questionId:   payload.questionId,
      questionType: payload.questionType,
      chosenOption: payload.chosenOption,
      studentText:  payload.studentText,
    });
  }

  async function handleNext() {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1);
      return;
    }

    // Last question — submit session to API only if questions came from DB
    setFinished(true);
    if (questionsFromApi && sessionIdRef.current) {
      try {
        const result = await completeSession(sessionIdRef.current, collectedAnswers.current);
        setApiResult(result);

        // If Gemini is still grading, poll every 3s until done (max ~30s)
        if (result.aiGrading) {
          let attempts = 0;
          pollRef.current = setInterval(async () => {
            attempts++;
            try {
              const updated = await getSession(sessionIdRef.current!);
              setApiResult(updated);
              if (!updated.aiGrading || attempts >= 10) {
                clearInterval(pollRef.current!);
              }
            } catch {
              clearInterval(pollRef.current!);
            }
          }, 3000);
        }
      } catch {
        // API failure — fall through to local MCQ score display
      }
    }
  }

  function handleRetry() {
    setCurrentIdx(0);
    setFinished(false);
    setCorrectCount(0);
    setMcqCount(0);
    collectedAnswers.current = [];
    setApiResult(null);
    if (pollRef.current) clearInterval(pollRef.current);
    // Start a fresh session (only if questions are backed by the DB)
    if (questionsFromApi && level) {
      startSession(concept!.id, level)
        .then(id => { sessionIdRef.current = id; })
        .catch(() => {});
    }
  }

  if (finished) {
    // Use API result if available; fall back to local MCQ tally
    const sessionScore = apiResult?.score ?? (mcqCount > 0 ? correctCount / mcqCount : 0);
    const passed = apiResult ? apiResult.passed : sessionScore >= 0.8;
    const pct = Math.round(sessionScore * 100);
    const aiStillGrading = apiResult?.aiGrading ?? false;

    // Next station after the current one (undefined if this was the last)
    const nextLevel = level ? NEXT_LEVEL[level] : undefined;
    const nextLabel = nextLevel ? LEVEL_TO_STATION_LABEL[nextLevel] : null;

    return (
      <div className="relative flex h-screen overflow-hidden" style={{ background: '#F4EFE5' }}>
        <GridBackground />
        <LeftRail />
        <main className="flex-1 flex items-center justify-center">
          <div
            className="text-center p-8 rounded-3xl w-full"
            style={{
              maxWidth: 560,
              background: 'rgba(255,255,255,0.75)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.8)',
            }}
          >
            <div className="text-5xl mb-4">{aiStillGrading ? '⏳' : passed ? '🎉' : '📚'}</div>

            {/* Score ring */}
            <div className="relative w-24 h-24 mx-auto mb-4">
              <svg className="-rotate-90" width="96" height="96" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="7" />
                <circle
                  cx="48" cy="48" r="40"
                  fill="none"
                  stroke={aiStillGrading ? '#a78bfa' : passed ? '#22c55e' : '#f97316'}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={`${sessionScore * 2 * Math.PI * 40} ${2 * Math.PI * 40}`}
                  style={{ transition: 'stroke-dasharray 0.6s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-extrabold text-xl" style={{ color: aiStillGrading ? '#7c3aed' : passed ? '#16a34a' : '#f97316' }}>
                  {pct}%
                </span>
              </div>
            </div>

            {aiStillGrading ? (
              <>
                <h2 className="text-xl font-extrabold mb-1" style={{ color: '#1c1917' }}>
                  Grading your written answers…
                </h2>
                <p className="text-sm mb-4" style={{ color: '#78716c' }}>
                  Gemini AI is reading your explanation. Score will update automatically.
                </p>
                <div className="flex justify-center mb-4">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                        style={{ background: '#7c3aed', animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-extrabold mb-1" style={{ color: '#1c1917' }}>
                  {passed ? 'Great work! 🎉' : 'Here\'s what to focus on'}
                </h2>
                <p className="text-xs mb-4" style={{ color: '#a8a29e' }}>
                  {concept?.name} · {apiResult ? (apiResult.aiGrading ? 'provisional score' : 'AI score') : 'MCQ score'}: {pct}%
                </p>
              </>
            )}

            {/* Feedback items — shown once AI grading is done (or for MCQ-only immediately) */}
            {!aiStillGrading && apiResult && apiResult.feedback && apiResult.feedback.length > 0 && (
              <FeedbackList feedback={apiResult.feedback} />
            )}

            <div className="flex flex-col gap-3">
              {/* Passed + next level exists → go to next station */}
              {!aiStillGrading && passed && nextLevel && (
                <button
                  onClick={() => router.push(`/sharpen?conceptId=${concept?.id}&level=${nextLevel}`)}
                  className="px-6 py-3 rounded-xl font-bold text-sm text-white"
                  style={{ background: COLORS.strong }}
                >
                  → Continue to {nextLabel}
                </button>
              )}
              {/* Passed + no next level → all stations done, back to map */}
              {!aiStillGrading && passed && !nextLevel && (
                <button
                  onClick={() => router.push(backToMapHref)}
                  className="px-6 py-3 rounded-xl font-bold text-sm text-white"
                  style={{ background: COLORS.strong }}
                >
                  🎉 Concept complete — Back to Brain Map
                </button>
              )}
              {/* Failed → retry this level */}
              {!aiStillGrading && !passed && (
                <button
                  onClick={handleRetry}
                  className="px-6 py-3 rounded-xl font-bold text-sm text-white"
                  style={{ background: COLORS.indigo }}
                >
                  🔄 Try again
                </button>
              )}
              <button
                onClick={() => router.push(backToMapHref)}
                className="px-6 py-3 rounded-xl font-bold text-sm"
                style={{ background: 'rgba(0,0,0,0.05)', color: '#78716c' }}
              >
                ← Back to Brain Map
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const question = questions[currentIdx];
  const masteryInfo = MASTERY_MAP[concept?.state ?? 'WEAK'];

  return (
    <div className="relative flex h-screen overflow-hidden" style={{ background: '#F4EFE5' }}>
      <GridBackground />
      <LeftRail />
      <main className="flex-1 flex">
        {/* Left: concept context */}
        <div
          className="flex flex-col justify-between p-8"
          style={{
            width: 320,
            background: 'rgba(255,255,255,0.4)',
            backdropFilter: 'blur(12px)',
            borderRight: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <div>
            <button
              onClick={() => router.push(backToMapHref)}
              className="flex items-center gap-1.5 mb-5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:bg-white/80"
              style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.1)', color: '#44403c' }}
            >
              ← Back to Brain Map
            </button>

            <div className="text-[10px] font-bold tracking-widest mb-1" style={{ color: subject?.color ?? COLORS.science }}>
              {subject?.label.toUpperCase() ?? 'SCIENCE'} · {chapter?.name ?? 'Chapter'}
            </div>
            <h2 className="text-xl font-extrabold mb-2" style={{ color: '#1c1917' }}>{concept?.name}</h2>

            {stationLabel && (
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mb-3"
                style={{ background: `${COLORS.indigo}14`, border: `1.5px solid ${COLORS.indigo}44`, color: COLORS.indigo }}
              >
                {stationLabel}
              </div>
            )}

            <div
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold mb-5"
              style={{
                background: `${masteryInfo.color}15`,
                border: `1.5px solid ${masteryInfo.color}55`,
                color: masteryInfo.color,
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: masteryInfo.color }} />
              {masteryInfo.label}
            </div>

            <div className="text-xs font-bold mb-2" style={{ color: '#78716c' }}>Quick reminder</div>
            <p className="text-sm leading-relaxed" style={{ color: '#44403c' }}>
              {detail.recap.split('. ').slice(0, 2).join('. ')}.
            </p>
          </div>

          <div>
            <div className="text-xs font-bold mb-2" style={{ color: '#78716c' }}>Your progress</div>
            <div className="flex gap-1.5">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className="h-2 flex-1 rounded-full"
                  style={{
                    background: i < currentIdx ? COLORS.indigo
                              : i === currentIdx ? `${COLORS.indigo}88`
                              : 'rgba(0,0,0,0.1)',
                  }}
                />
              ))}
            </div>
            <div className="text-xs mt-1.5" style={{ color: '#78716c' }}>
              Question {currentIdx + 1} of {questions.length}
            </div>
            {mcqCount > 0 && (
              <div className="text-xs font-bold mt-1" style={{ color: COLORS.indigo }}>
                ✓ {correctCount} MCQ right so far
              </div>
            )}
          </div>
        </div>

        {/* Right: question panel */}
        <div className="flex-1 flex items-stretch">
          <div
            className="w-full max-w-xl mx-auto my-6 rounded-2xl overflow-hidden shadow-xl"
            style={{ border: '1px solid rgba(0,0,0,0.08)' }}
          >
            <QuestionScreen
              question={question}
              conceptName={concept?.name ?? 'Concept'}
              chapterName={chapter?.name ?? 'Chapter'}
              subjectName={subject?.label ?? 'Science'}
              subjectColor={subject?.color ?? COLORS.science}
              current={currentIdx}
              total={questions.length}
              onNext={handleNext}
              onSkip={handleNext}
              onAnswer={handleAnswer}
              onSubmitAnswer={handleSubmitAnswer}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

// Reads the URL params and passes a key to SharpenContent so it fully
// remounts whenever the concept or level changes — no stale state bleeds
// between stations.
function SharpenKeyBridge() {
  const params = useSearchParams();
  const key = `${params.get('conceptId') ?? 'c104'}_${params.get('level') ?? 'none'}`;
  return <SharpenContent key={key} />;
}

export default function SharpenPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center" style={{ background: '#F4EFE5' }}>
        <div className="text-sm" style={{ color: '#78716c' }}>Loading…</div>
      </div>
    }>
      <SharpenKeyBridge />
    </Suspense>
  );
}
