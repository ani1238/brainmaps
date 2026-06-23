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

// SessionReviewList renders every answer of a completed session with its
// grading feedback. Shared by the sharpen results screen and the reports page.
export function SessionReviewList({ review }: { review: SessionReview }) {
  return (
    <div className="w-full text-left space-y-3">
      {review.answers.map(item => <ReviewCard key={item.questionId} item={item} />)}
    </div>
  );
}
