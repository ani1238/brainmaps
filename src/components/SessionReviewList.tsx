'use client';

import { useState } from 'react';
import { COLORS } from '@/lib/tokens';
import type { SessionReview, SessionReviewAnswer } from '@/lib/api';

const Q_TYPE_LABEL: Record<string, string> = {
  MCQ:                   'Multiple choice',
  STORY_MCQ:             'Story choice',
  HOTS:                  'Think deeper',
  HOTS_MCQ:              'Think deeper',
  ASSERTION_REASON:      'Assertion reason',
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

function scoreColorFor(item: SessionReviewAnswer): string {
  const score = item.score ?? (item.isCorrect ? 1 : 0);
  return score >= 0.75 ? '#22c55e' : score >= 0.45 ? '#f97316' : '#ef4444';
}

function jumpTo(questionId: string) {
  document.getElementById(`review-${questionId}`)
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// One dot per question — an at-a-glance right/wrong pattern without opening
// any card. Tapping a dot scrolls that card into view.
function ResultStrip({ answers }: { answers: SessionReviewAnswer[] }) {
  if (answers.length < 2) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5 px-1 pb-1" role="list" aria-label="Question results">
      {answers.map((item, i) => {
        const color = scoreColorFor(item);
        return (
          <button
            key={item.questionId}
            onClick={() => jumpTo(item.questionId)}
            title={`Question ${i + 1}`}
            aria-label={`Jump to question ${i + 1}`}
            className="w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center flex-none"
            style={{ background: `${color}22`, border: `1.5px solid ${color}`, color }}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}

function ReviewCard({ item, index, total }: { item: SessionReviewAnswer; index: number; total: number }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const score = item.score ?? (item.isCorrect ? 1 : 0);
  const scoreColor = scoreColorFor(item);
  const scoreLabel = item.isCorrect != null
    ? item.isCorrect ? 'Correct' : 'Needs another look'
    : `${Math.round(score * 100)}%`;
  const icon = score >= 0.75 ? '✓' : score >= 0.45 ? '•' : '×';
  const hasAnswer = Boolean(item.correctAnswer || item.answerGuide || item.explanation);

  return (
    <div
      id={`review-${item.questionId}`}
      className="rounded-2xl overflow-hidden text-left scroll-mt-4"
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
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold" style={{ color: '#a8a29e' }}>{index + 1} / {total}</span>
          <span className="text-[11px] font-bold" style={{ color: scoreColor }}>{scoreLabel}</span>
        </div>
      </div>

      <div className="px-4 py-3 space-y-3">
        {/* Question — shown in full; these are short enough to always read whole */}
        <p className="text-xs font-semibold leading-snug" style={{ color: '#78716c' }}>
          {item.questionText}
        </p>

        {/* Student's answer */}
        {item.studentAnswer && (
          <div className="rounded-lg px-3 py-2" style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.07)' }}>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#a8a29e' }}>
              Your answer
            </div>
            <p className="text-xs leading-relaxed italic whitespace-pre-wrap" style={{ color: '#44403c' }}>
              &ldquo;{item.studentAnswer}&rdquo;
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

// SessionReviewList renders every answer of a completed session with its
// grading feedback. Shared by the sharpen results screen and the reports page.
export function SessionReviewList({ review }: { review: SessionReview }) {
  const total = review.answers.length;
  return (
    <div className="w-full text-left space-y-3">
      <ResultStrip answers={review.answers} />
      {review.answers.map((item, i) => (
        <ReviewCard key={item.questionId} item={item} index={i} total={total} />
      ))}
    </div>
  );
}
