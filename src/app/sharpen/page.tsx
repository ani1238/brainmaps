'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GridBackground } from '@/components/GridBackground';
import { LeftRail } from '@/components/LeftRail';
import { QuestionScreen } from '@/components/QuestionScreen';
import type { AnswerPayload } from '@/components/QuestionScreen';
import { COLORS, subjectDisplay, MASTERY_MAP } from '@/lib/tokens';
import { CHAPTER_DATA, CONCEPT_BY_ID, CONCEPT_DETAILS, DEFAULT_CONCEPT_DETAIL } from '@/data/dummy';
import { CONCEPT_QUESTIONS } from '@/data/questions';
import { splitStations } from '@/data/society';
import { STATION_LABELS } from '@/lib/tokens';
import type { QuestionLevel } from '@/types';
import {
  fetchConcept, fetchQuestions, startSession, completeSession, getSession, getSessionReview, fetchToday,
  type ActiveSession, type SubmitAnswer, type SessionResult, type SessionReview,
  type SessionReviewAnswer, type ApiConceptDetail, type ApiTodayItem,
} from '@/lib/api';
import type { Question } from '@/types';
import { assessmentHref, assessmentReturn, failedStation } from '@/lib/navigation';

// ── Completed-session answer review ──────────────────────────────────────────

const Q_TYPE_LABEL: Record<string, string> = {
  MCQ:                   'Multiple choice',
  FEYNMAN:               'Explain it simply',
  BLURT:                 'Brain dump',
  ACTIVE_RECALL:         'Apply it',
  DESCRIPTIVE:           'Short answer',
  SPOT_IT:               'Spot it',
  FIX_IT:                'Fix it',
  PRODUCE_IT:            'Produce it',
  GENERATIVE_PRODUCTION: 'Produce it',
  CONTEXT_CLUE:          'Use the clues',
};

function ReviewCard({ item }: { item: SessionReviewAnswer }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const score = item.score ?? (item.isCorrect ? 1 : 0);
  const scoreColor = score >= 0.75 ? '#22c55e' : score >= 0.45 ? '#f97316' : '#ef4444';
  const scoreLabel = item.isCorrect != null
    ? item.isCorrect ? 'Correct' : 'Needs another look'
    : `${Math.round(score * 100)}%`;
  const icon = score >= 0.75 ? '✓' : score >= 0.45 ? '•' : '×';
  const hasAnswer = Boolean(item.correctAnswer || item.answerGuide || item.explanation);

  return (
    <div
      className="rounded-2xl overflow-hidden text-left"
      style={{ border: `1.5px solid ${scoreColor}30`, background: 'rgba(255,255,255,0.7)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5"
        style={{ background: `${scoreColor}10`, borderBottom: `1px solid ${scoreColor}20` }}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-black" style={{ color: scoreColor }}>{icon}</span>
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
              &ldquo;{item.studentAnswer.length > 300
                ? item.studentAnswer.slice(0, 297) + '…'
                : item.studentAnswer}&rdquo;
            </p>
          </div>
        )}

        {item.feedback && <div>
          <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#a8a29e' }}>
            Feedback
          </div>
          <p className="text-xs leading-relaxed" style={{ color: '#1c1917' }}>
            {item.feedback}
          </p>
        </div>}

        {hasAnswer && (
          <button
            onClick={() => setShowAnswer(show => !show)}
            className="w-full rounded-lg px-3 py-2 text-xs font-bold text-left"
            style={{ background: 'rgba(79,70,229,0.07)', color: COLORS.indigo }}
          >
            {showAnswer ? 'Hide answer' : 'Show answer'}
          </button>
        )}

        {showAnswer && hasAnswer && (
          <div className="rounded-lg px-3 py-3 space-y-2"
            style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}>
            {item.correctAnswer && (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#16a34a' }}>
                  Correct answer
                </div>
                <p className="text-xs font-semibold" style={{ color: '#1c1917' }}>{item.correctAnswer}</p>
              </div>
            )}
            {item.answerGuide && (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#16a34a' }}>
                  Strong answer guide
                </div>
                <p className="text-xs leading-relaxed" style={{ color: '#1c1917' }}>{item.answerGuide}</p>
              </div>
            )}
            {item.explanation && (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#16a34a' }}>
                  Why
                </div>
                <p className="text-xs leading-relaxed" style={{ color: '#1c1917' }}>{item.explanation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewList({ review }: { review: SessionReview }) {
  return (
    <div className="w-full text-left mb-5 space-y-3 max-h-[28rem] overflow-y-auto pr-1">
      {review.answers.map(item => <ReviewCard key={item.questionId} item={item} />)}
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
  const conceptId = searchParams.get('conceptId'); // null when none supplied
  const level = (searchParams.get('level') as QuestionLevel | null) ?? null;
  const returnTarget = assessmentReturn(
    searchParams.get('returnTo'),
    conceptId ? `/brain-map?conceptId=${conceptId}` : '/brain-map',
  );

  // Local dummy concept — only the old demo concepts (c1xx, s2xx) live here.
  const localConcept = conceptId ? CONCEPT_BY_ID[conceptId] : undefined;
  const localDetail = (conceptId && CONCEPT_DETAILS[conceptId]) || DEFAULT_CONCEPT_DETAIL;

  // Real concept details fetched from the DB (name, subject, chapter, recap).
  const [apiConcept, setApiConcept] = useState<ApiConceptDetail | null>(null);

  // ── Display fields: prefer the live DB concept, then local demo data ──────
  const conceptName  = apiConcept?.name ?? localConcept?.name ?? '';
  const subjectKey   = apiConcept?.subjectKey ?? localConcept?.subjectKey ?? 'science';
  const subject      = subjectDisplay(subjectKey);
  const chapterName  = apiConcept?.chapterName
    ?? CHAPTER_DATA[localConcept?.subjectKey ?? '']?.find(ch => ch.id === localConcept?.chapterId)?.name
    ?? 'Chapter';
  const recap        = apiConcept?.recap || localDetail.recap;
  const masteryState = (apiConcept?.progress?.state ?? localConcept?.state ?? 'WEAK') as keyof typeof MASTERY_MAP;

  function returnFromSession(passed: boolean) {
    if (passed && level === 'revise' && conceptId && returnTarget.href === '/recall') {
      sessionStorage.setItem('brainmaps:revise-completed', JSON.stringify({
        conceptId,
        conceptName,
        completedAt: new Date().toISOString(),
      }));
    }
    router.push(returnTarget.href);
  }

  const stationLabel = level ? LEVEL_TO_STATION_LABEL[level] : null;

  // Local fallback questions. ONLY the old demo concepts have local questions;
  // real DB concepts always load from the API. The photosynthesis demo set is
  // never used as a fallback, so it can no longer leak into a real concept.
  function localFallbackQuestions(): Question[] {
    if (!conceptId) return [];
    const local = CONCEPT_QUESTIONS[conceptId];
    if (local) return level ? (splitStations(local)[level] ?? []) : local;
    return [];
  }

  const [questions, setQuestions] = useState<Question[]>(localFallbackQuestions);
  // questionsFromApi = true means question IDs exist in the DB and we can call the API session
  const [questionsFromApi, setQuestionsFromApi] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(Boolean(level && conceptId));

  // ── Question tracking ───────────────────────────────────────────────────
  const [currentIdx, setCurrentIdx] = useState(0);
  const [finished, setFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [mcqCount, setMcqCount] = useState(0);
  const collectedAnswers = useRef<SubmitAnswer[]>([]);

  // ── API session (only when we have real DB-backed question IDs) ─────────
  const sessionRef = useRef<ActiveSession | null>(null);
  const [apiResult, setApiResult] = useState<SessionResult | null>(null);
  const [review, setReview] = useState<SessionReview | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch the real concept's details (name, subject, chapter, recap) from the DB.
  useEffect(() => {
    if (!conceptId) return;
    let cancelled = false;
    fetchConcept(conceptId)
      .then(c => { if (!cancelled) setApiConcept(c); })
      .catch(() => {}); // not a DB concept — keep local/demo display
    return () => { cancelled = true; };
  }, [conceptId]);

  // The keyed parent remounts this component for every concept/level.
  useEffect(() => {
    collectedAnswers.current = [];
    sessionRef.current = null;
    if (pollRef.current) clearInterval(pollRef.current);

    if (!level || !conceptId) return;

    // Always try the DB first. If it has questions, use them and start a
    //    graded session. Otherwise keep whatever local fallback we have.
    fetchQuestions(conceptId, level)
      .then(apiQs => {
        if (apiQs.length > 0) {
          setQuestions(apiQs);
          setQuestionsFromApi(true);
          return startSession(conceptId, level);
        }
        return null;
      })
      .then(session => { if (session) sessionRef.current = session; })
      .catch(() => {})
      .finally(() => setLoadingQuestions(false));
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
    if (questionsFromApi && sessionRef.current) {
      try {
        const result = await completeSession(sessionRef.current, collectedAnswers.current);
        setApiResult(result);

        // If AI is still grading, poll every 3s until done (max ~30s).
        if (result.aiGrading) {
          let attempts = 0;
          pollRef.current = setInterval(async () => {
            attempts++;
            try {
              const updated = await getSession(sessionRef.current!);
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

  async function handleRetry() {
    const previousQuestions = questions;
    const excludeQuestionIds = previousQuestions.map(q => q.id);

    setCurrentIdx(0);
    setFinished(false);
    setCorrectCount(0);
    setMcqCount(0);
    collectedAnswers.current = [];
    setApiResult(null);
    setReview(null);
    setReviewOpen(false);
    setReviewError('');
    if (pollRef.current) clearInterval(pollRef.current);

    // Fetch a fresh adaptive set and explicitly exclude every question the
    // student just saw. The backend only reuses one when alternatives run out.
    if (questionsFromApi && level && conceptId) {
      setLoadingQuestions(true);
      setQuestions([]);
      try {
        const nextQuestions = await fetchQuestions(conceptId, level, excludeQuestionIds);
        setQuestions(nextQuestions.length > 0 ? nextQuestions : previousQuestions);
        sessionRef.current = await startSession(conceptId, level);
      } catch {
        setQuestions(previousQuestions);
        startSession(conceptId, level)
          .then(session => { sessionRef.current = session; })
          .catch(() => {});
      } finally {
        setLoadingQuestions(false);
      }
    }
  }

  async function handleReviewAnswers() {
    if (reviewOpen) {
      setReviewOpen(false);
      return;
    }
    setReviewOpen(true);
    if (review || !sessionRef.current) return;

    setReviewLoading(true);
    setReviewError('');
    try {
      setReview(await getSessionReview(sessionRef.current));
    } catch {
      setReviewError('Review could not be loaded. Please try again.');
    } finally {
      setReviewLoading(false);
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
      <div className="relative flex flex-col lg:flex-row min-h-[100dvh] lg:h-screen lg:overflow-hidden" style={{ background: '#F4EFE5' }}>
        <GridBackground />
        <LeftRail />
        <main className="flex-1 lg:overflow-y-auto flex items-start justify-center py-6 lg:py-8 pb-24 lg:pb-8 px-4 lg:px-0">
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
                  AI is reading your explanation. Your score will update automatically.
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
                  {conceptName} · {apiResult ? (apiResult.aiGrading ? 'provisional score' : 'overall score') : 'score'}: {pct}%
                </p>
              </>
            )}

            {!aiStillGrading && reviewOpen && reviewLoading && (
              <p className="text-sm mb-5" style={{ color: '#78716c' }}>Loading your answers…</p>
            )}
            {!aiStillGrading && reviewOpen && reviewError && (
              <p className="text-sm mb-5" style={{ color: '#ef4444' }}>{reviewError}</p>
            )}
            {!aiStillGrading && reviewOpen && review && <ReviewList review={review} />}

            <div className="flex flex-col gap-3">
              {!aiStillGrading && apiResult?.reviewAvailable && (
                <button
                  onClick={handleReviewAnswers}
                  className="px-6 py-3 rounded-xl font-bold text-sm"
                  style={{ background: 'rgba(79,70,229,0.08)', color: COLORS.indigo }}
                >
                  {reviewOpen ? 'Hide answer review' : 'Review answers'}
                </button>
              )}
              {/* Passed + next level exists → go to next station */}
              {!aiStillGrading && passed && nextLevel && (
                <button
                  onClick={() => router.push(assessmentHref('/sharpen', {
                    conceptId: conceptId ?? undefined,
                    level: nextLevel,
                  }, returnTarget.href))}
                  className="px-6 py-3 rounded-xl font-bold text-sm text-white"
                  style={{ background: COLORS.strong }}
                >
                  → Continue to {nextLabel}
                </button>
              )}
              {/* Passed + no next level → all stations done, back to map */}
              {!aiStillGrading && passed && !nextLevel && (
                <button
                  onClick={() => returnFromSession(true)}
                  className="px-6 py-3 rounded-xl font-bold text-sm text-white"
                  style={{ background: COLORS.strong }}
                >
                  🎉 Concept complete — Back to {returnTarget.label}
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
                onClick={() => returnFromSession(passed && !aiStillGrading)}
                className="px-6 py-3 rounded-xl font-bold text-sm"
                style={{ background: 'rgba(0,0,0,0.05)', color: '#78716c' }}
              >
                ← Back to {returnTarget.label}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const masteryInfo = MASTERY_MAP[masteryState] ?? MASTERY_MAP.WEAK;

  // While the DB questions are loading (or none exist yet), don't render a
  // question — this is what used to flash the demo photosynthesis set.
  if (questions.length === 0) {
    return (
      <div className="relative flex flex-col lg:flex-row min-h-[100dvh] lg:h-screen lg:overflow-hidden" style={{ background: '#F4EFE5' }}>
        <GridBackground />
        <LeftRail />
        <main className="flex-1 flex items-center justify-center pb-24 lg:pb-0 px-4">
          <div className="text-center">
            {loadingQuestions ? (
              <>
                <div className="flex justify-center mb-3">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2.5 h-2.5 rounded-full animate-bounce"
                        style={{ background: COLORS.indigo, animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
                <p className="text-sm font-semibold" style={{ color: '#78716c' }}>
                  Loading {conceptName}…
                </p>
              </>
            ) : (
              <>
                <div className="text-4xl mb-3">{conceptId ? '📭' : '🧠'}</div>
                <p className="text-sm font-semibold mb-4" style={{ color: '#78716c' }}>
                  {conceptId
                    ? `No questions yet for ${stationLabel ? `${stationLabel} of ` : ''}${conceptName}.`
                    : 'Pick a concept from your Brain Map to start practising.'}
                </p>
                <button
                  onClick={() => router.push(returnTarget.href)}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm"
                  style={{ background: 'rgba(0,0,0,0.05)', color: '#78716c' }}
                >
                  ← Back to {returnTarget.label}
                </button>
              </>
            )}
          </div>
        </main>
      </div>
    );
  }

  const question = questions[currentIdx];

  return (
    <div className="relative flex flex-col lg:flex-row min-h-[100dvh] lg:h-screen lg:overflow-hidden" style={{ background: '#F4EFE5' }}>
      <GridBackground />
      <LeftRail />
      <main className="flex-1 flex pb-20 lg:pb-0">
        {/* Left: concept context (desktop only) */}
        <div
          className="hidden lg:flex flex-col justify-between p-8"
          style={{
            width: 320,
            background: 'rgba(255,255,255,0.4)',
            backdropFilter: 'blur(12px)',
            borderRight: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <div>
            <button
              onClick={() => router.push(returnTarget.href)}
              className="flex items-center gap-1.5 mb-5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:bg-white/80"
              style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.1)', color: '#44403c' }}
            >
              ← Back to {returnTarget.label}
            </button>

            <div className="text-[10px] font-bold tracking-widest mb-1" style={{ color: subject.color }}>
              {subject.label.toUpperCase()} · {chapterName}
            </div>
            <h2 className="text-xl font-extrabold mb-2" style={{ color: '#1c1917' }}>{conceptName}</h2>

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
              {recap.split('. ').slice(0, 2).join('. ')}.
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
        <div className="flex-1 flex items-stretch min-w-0">
          <div
            className="w-full max-w-xl mx-auto my-4 lg:my-6 px-3 lg:px-0 rounded-2xl lg:rounded-2xl overflow-hidden lg:shadow-xl flex flex-col"
            style={{ border: '1px solid rgba(0,0,0,0.08)' }}
          >
            <QuestionScreen
              question={question}
              conceptName={conceptName}
              chapterName={chapterName}
              subjectName={subject.label}
              subjectColor={subject.color}
              current={currentIdx}
              total={questions.length}
              onNext={handleNext}
              onAnswer={handleAnswer}
              onSubmitAnswer={handleSubmitAnswer}
              deferAnswerFeedback={questionsFromApi}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Today's Fix report ────────────────────────────────────────────────────────
// Shown when /sharpen is opened with no conceptId — lists the concepts whose
// levels need a retry, and links straight into the flagged level.

function TodaysFixReport() {
  const router = useRouter();
  const [items, setItems] = useState<ApiTodayItem[] | null>(null);

  useEffect(() => {
    fetchToday().then(t => setItems(t.fixQueue)).catch(() => setItems([]));
  }, []);

  function start(item: ApiTodayItem) {
    const st = failedStation(item.progress);
    router.push(assessmentHref('/sharpen', {
      conceptId: item.id,
      level: st.level,
    }, '/sharpen'));
  }

  return (
    <div className="relative flex flex-col lg:flex-row min-h-[100dvh] lg:h-screen lg:overflow-hidden" style={{ background: '#F4EFE5' }}>
      <GridBackground />
      <LeftRail />
      <main className="flex-1 lg:overflow-y-auto flex items-start justify-center py-6 lg:py-10 pb-24 lg:pb-10">
        <div className="w-full max-w-xl px-4 lg:px-6">
          <div className="mb-1 text-xs font-bold tracking-widest" style={{ color: COLORS.weak }}>🔧 TODAY&apos;S FIX</div>
          <h1 className="text-3xl font-extrabold" style={{ color: '#1c1917' }}>
            {items === null ? 'Loading your fixes…'
              : items.length === 0 ? 'Nothing to fix right now 🎉'
              : `${items.length} ${items.length === 1 ? 'thing' : 'things'} to fix`}
          </h1>
          <p className="text-sm mt-1 mb-5" style={{ color: '#78716c' }}>
            {items && items.length > 0
              ? 'These levels scored below the mark — give them another go.'
              : items?.length === 0 ? 'Great work — no levels are flagged. Keep practising in the Brain Map.' : ''}
          </p>

          {items && items.length > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.08)' }}>
              {items.map((item, i) => {
                const st = failedStation(item.progress);
                const subj = subjectDisplay(item.subjectKey.startsWith('english') ? 'english' : item.subjectKey);
                return (
                  <button
                    key={item.id}
                    onClick={() => start(item)}
                    className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-black/[0.03]"
                    style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(0,0,0,0.06)' }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS.weak }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm" style={{ color: '#1c1917' }}>{item.name}</div>
                      <div className="text-xs" style={{ color: '#78716c' }}>{subj.label}</div>
                      <div className="text-xs font-semibold mt-0.5" style={{ color: COLORS.weak }}>
                        {st.label} needs a retry
                      </div>
                    </div>
                    <div className="text-lg flex-shrink-0" style={{ color: '#a8a29e' }}>›</div>
                  </button>
                );
              })}
            </div>
          )}

          {items && items.length > 0 && (
            <button
              onClick={() => start(items[0])}
              className="w-full mt-4 py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: COLORS.weak, boxShadow: '0 4px 16px rgba(249,115,22,0.3)' }}
            >
              Start fixing →
            </button>
          )}

          <button
            onClick={() => router.push('/brain-map')}
            className="w-full mt-3 py-3 rounded-xl font-bold text-sm"
            style={{ background: 'rgba(0,0,0,0.05)', color: '#78716c' }}
          >
            ← Back to Brain Map
          </button>
        </div>
      </main>
    </div>
  );
}

// Reads the URL params and passes a key to SharpenContent so it fully
// remounts whenever the concept or level changes — no stale state bleeds
// between stations. With no conceptId, shows the Today's Fix report instead.
function SharpenKeyBridge() {
  const params = useSearchParams();
  const conceptId = params.get('conceptId');
  if (!conceptId) return <TodaysFixReport />;
  const key = `${conceptId}_${params.get('level') ?? 'none'}`;
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
