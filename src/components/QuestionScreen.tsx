'use client';

import { useState, useEffect } from 'react';
import type { Question } from '@/types';

export interface AnswerPayload {
  questionId: string;
  questionType: string;
  chosenOption?: string;
  studentText?: string;
}

interface QuestionScreenProps {
  question: Question;
  conceptName: string;
  chapterName: string;
  subjectName: string;
  subjectColor: string;
  current: number;
  total: number;
  onNext: () => void;
  onAnswer?: (correct: boolean) => void;
  onSubmitAnswer?: (payload: AnswerPayload) => void;
  deferAnswerFeedback?: boolean;
}

export function QuestionScreen({
  question,
  conceptName,
  chapterName,
  subjectName,
  subjectColor,
  current,
  total,
  onNext,
  onAnswer,
  onSubmitAnswer,
  deferAnswerFeedback = false,
}: QuestionScreenProps) {
  return (
    <div className="h-full flex flex-col" style={{ background: 'rgba(255,255,255,0.96)' }}>
      {/* Panel header */}
      <div className="flex-shrink-0 px-5 py-3.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="text-[10px] font-bold tracking-widest mb-0.5" style={{ color: subjectColor }}>
          {subjectName.toUpperCase()} · {chapterName}
        </div>
        <div className="font-extrabold text-lg leading-tight" style={{ color: '#1c1917' }}>{conceptName}</div>
      </div>

      {/* Tier badge */}
      {question.tier && <TierBadge tier={question.tier} />}

      {/* Progress */}
      <ProgressBar current={current} total={total} />

      {/* Question body */}
      <div className="flex-1 overflow-y-auto">
        {(() => {
          // Any question that carries answer options is a pick-one question —
          // MCQ, but also Spot it / Context clue. Render + grade by option.
          const hasOptions = (question.options?.length ?? 0) > 0;
          if (hasOptions) {
            return <MCQQuestion key={question.id} question={question} onNext={onNext} onAnswer={onAnswer}
              deferAnswerFeedback={deferAnswerFeedback}
              onSubmitAnswer={onSubmitAnswer} />;
          }
          switch (question.type) {
            case 'DESCRIPTIVE':
              return <DescriptiveQuestion key={question.id} question={question} onNext={onNext} onSubmitAnswer={onSubmitAnswer} />;
            case 'FEYNMAN':
              return <FeynmanQuestion key={question.id} question={question} onNext={onNext} onSubmitAnswer={onSubmitAnswer} />;
            case 'BLURT':
              return <BlurtQuestion key={question.id} question={question} onNext={onNext} onSubmitAnswer={onSubmitAnswer} />;
            case 'ACTIVE_RECALL':
              return <ActiveRecallQuestion key={question.id} question={question} onNext={onNext} onSubmitAnswer={onSubmitAnswer} />;
            default:
              // Free-text open types (Fix it, Produce it, …) — graded by Gemini.
              return <GenericTextQuestion key={question.id} question={question} onNext={onNext} onSubmitAnswer={onSubmitAnswer} />;
          }
        })()}
      </div>
    </div>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 px-5 py-3 flex-shrink-0">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1.5 rounded-full transition-all"
          style={{
            width: i === current ? 24 : 14,
            background: i < current ? '#1c1917'
                      : i === current ? '#4F46E5'
                      : '#e5e7eb',
          }}
        />
      ))}
      <span className="ml-2 text-[10px] font-mono" style={{ color: '#78716c' }}>{current + 1} / {total}</span>
    </div>
  );
}

function TierBadge({ tier }: { tier: 'VERY_WEAK' | 'WEAK' | 'DEVELOPING' }) {
  const map = {
    VERY_WEAK:  { color: '#ef4444', label: "Let's start fresh" },
    WEAK:       { color: '#f97316', label: 'Found the tricky bit' },
    DEVELOPING: { color: '#eab308', label: "You're so close!" },
  };
  const m = map[tier];
  return (
    <div
      className="mx-5 mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
      style={{
        background: `${m.color}15`,
        border: `1.5px solid ${m.color}66`,
        color: m.color,
      }}
    >
      <span className="w-2 h-2 rounded-full" style={{ background: m.color }} />
      {m.label}
    </div>
  );
}

// ── MCQ Question ──────────────────────────────────────────────────────────

function MCQQuestion({ question, onNext, onAnswer, onSubmitAnswer, deferAnswerFeedback = false }: {
  question: Question; onNext: () => void;
  onAnswer?: (correct: boolean) => void;
  onSubmitAnswer?: (p: AnswerPayload) => void;
  deferAnswerFeedback?: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  function handleSelect(id: string) {
    if (revealed) return;
    setSelected(id);
    setRevealed(true);
    if (!deferAnswerFeedback) {
      const correctId = question.options?.find(o => o.correct)?.id;
      onAnswer?.(id === correctId);
    }
    onSubmitAnswer?.({ questionId: question.id, questionType: 'MCQ', chosenOption: id });
  }

  function handleAction() {
    if (revealed) {
      setSelected(null);
      setRevealed(false);
      onNext();
    } else {
      onNext();
    }
  }

  const options = question.options ?? [];

  return (
    <div className="p-5 flex flex-col gap-4">
      <div>
        <div className="text-xs font-bold mb-2" style={{ color: '#78716c' }}>
          Pick the right one
        </div>
        <p className="font-bold text-lg leading-snug" style={{ color: '#1c1917' }}>
          {question.text}
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {options.map(o => {
          const isSelected = selected === o.id;
          const isCorrect = !deferAnswerFeedback && revealed && o.correct;
          const isWrong = !deferAnswerFeedback && revealed && isSelected && !o.correct;

          return (
            <button
              key={o.id}
              onClick={() => handleSelect(o.id)}
              className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-left transition-all"
              style={{
                background: isWrong ? '#fee2e2' : isCorrect ? '#dcfce7' : 'rgba(0,0,0,0.02)',
                border: `1.5px solid ${isWrong ? '#ef4444' : isCorrect ? '#22c55e' : 'rgba(0,0,0,0.1)'}`,
                cursor: revealed ? 'default' : 'pointer',
              }}
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{
                  border: `1.5px solid ${isWrong ? '#ef4444' : isCorrect ? '#22c55e' : 'rgba(0,0,0,0.2)'}`,
                  color: isWrong ? '#ef4444' : isCorrect ? '#22c55e' : '#44403c',
                }}
              >
                {o.id.toUpperCase()}
              </span>
              <span className="font-semibold text-sm flex-1" style={{ color: '#1c1917' }}>{o.text}</span>
              {isCorrect && <span className="text-xl">✓</span>}
              {isWrong && <span className="text-xl">✗</span>}
            </button>
          );
        })}
      </div>

      {deferAnswerFeedback && revealed && (
        <div
          className="p-4 rounded-xl text-sm"
          style={{ background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.2)', color: '#44403c' }}
        >
          Answer saved. You can check it in Review answers after the session.
        </div>
      )}

      {!deferAnswerFeedback && revealed && question.explanation && (
        <div
          className="p-4 rounded-xl"
          style={{ background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.2)' }}
        >
          <div className="text-xs font-bold mb-1.5" style={{ color: '#4F46E5' }}>Why?</div>
          <p className="text-sm leading-relaxed" style={{ color: '#44403c' }}>{question.explanation}</p>
        </div>
      )}

      <button
        onClick={handleAction}
        disabled={!revealed}
        className="py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] mt-2 disabled:opacity-40 disabled:cursor-default"
        style={{ background: '#4F46E5' }}
      >
        {revealed ? '→ Next' : 'Pick an answer'}
      </button>
    </div>
  );
}

// ── Descriptive (WHY / HOW) ───────────────────────────────────────────────

function DescriptiveQuestion({ question, onNext, onSubmitAnswer }: {
  question: Question; onNext: () => void;
  onSubmitAnswer?: (p: AnswerPayload) => void;
}) {
  const [text, setText] = useState('');
  const [hintOpen, setHintOpen] = useState(false);

  function handleSubmit() {
    onSubmitAnswer?.({ questionId: question.id, questionType: 'DESCRIPTIVE', studentText: text });
    onNext();
  }

  return (
    <div className="p-5 flex flex-col gap-4">
      <div>
        <div className="text-xs font-bold mb-2" style={{ color: '#78716c' }}>Explain it in your own words</div>
        <p className="font-bold text-lg leading-snug" style={{ color: '#1c1917' }}>{question.text}</p>
      </div>

      <div className="relative">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write your answer…"
          rows={8}
          className="w-full rounded-xl p-4 text-sm resize-none outline-none transition-all"
          style={{
            background: '#fdfdfb',
            border: '1.5px solid rgba(0,0,0,0.1)',
            color: '#1c1917',
            lineHeight: '1.75',
            fontFamily: 'inherit',
          }}
        />
        <div
          className="absolute bottom-2 right-3 text-[10px] font-mono"
          style={{ color: '#78716c' }}
        >
          {text.split(/\s+/).filter(Boolean).length} / 200 words
        </div>
      </div>

      {question.rubricHint && (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px dashed rgba(79,70,229,0.4)' }}
        >
          <button
            onClick={() => setHintOpen(h => !h)}
            className="w-full flex justify-between items-center px-4 py-2.5 text-xs font-bold"
            style={{ color: '#4F46E5' }}
          >
            <span>Need a hint? Tap to {hintOpen ? 'hide' : 'see'}</span>
            <span>{hintOpen ? '▲' : '▼'}</span>
          </button>
          {hintOpen && (
            <div className="px-4 pb-3 text-sm" style={{ color: '#78716c' }}>
              {question.rubricHint}
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ background: '#4F46E5' }}
      >
        Submit
      </button>
    </div>
  );
}

// ── Generic open-ended (Spot it / Fix it / Produce it / Context clue / …) ──

const OPEN_TYPE_COPY: Record<string, { label: string; placeholder: string }> = {
  SPOT_IT:               { label: 'Spot it',       placeholder: 'Point out what you spotted and why…' },
  FIX_IT:                { label: 'Fix it',        placeholder: 'Find the mistake and write the correction…' },
  PRODUCE_IT:            { label: 'Produce it',    placeholder: 'Write your own example or answer…' },
  GENERATIVE_PRODUCTION: { label: 'Produce it',    placeholder: 'Write your own example or answer…' },
  CONTEXT_CLUE:          { label: 'Use the clues', placeholder: 'Use the clues to work out your answer…' },
};

function GenericTextQuestion({ question, onNext, onSubmitAnswer }: {
  question: Question; onNext: () => void;
  onSubmitAnswer?: (p: AnswerPayload) => void;
}) {
  const [text, setText] = useState('');
  const [hintOpen, setHintOpen] = useState(false);
  const copy = OPEN_TYPE_COPY[question.type] ?? { label: 'Your answer', placeholder: 'Write your answer…' };

  function handleSubmit() {
    onSubmitAnswer?.({ questionId: question.id, questionType: question.type, studentText: text });
    onNext();
  }

  return (
    <div className="p-5 flex flex-col gap-4">
      <div>
        <div className="text-xs font-bold mb-2" style={{ color: '#78716c' }}>{copy.label}</div>
        <p className="font-bold text-lg leading-snug" style={{ color: '#1c1917' }}>{question.text}</p>
      </div>

      <div className="relative">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={copy.placeholder}
          rows={8}
          className="w-full rounded-xl p-4 text-sm resize-none outline-none transition-all"
          style={{
            background: '#fdfdfb',
            border: '1.5px solid rgba(0,0,0,0.1)',
            color: '#1c1917',
            lineHeight: '1.75',
            fontFamily: 'inherit',
          }}
        />
        <div
          className="absolute bottom-2 right-3 text-[10px] font-mono"
          style={{ color: '#78716c' }}
        >
          {text.split(/\s+/).filter(Boolean).length} / 200 words
        </div>
      </div>

      {question.rubricHint && (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px dashed rgba(79,70,229,0.4)' }}
        >
          <button
            onClick={() => setHintOpen(h => !h)}
            className="w-full flex justify-between items-center px-4 py-2.5 text-xs font-bold"
            style={{ color: '#4F46E5' }}
          >
            <span>Need a hint? Tap to {hintOpen ? 'hide' : 'see'}</span>
            <span>{hintOpen ? '▲' : '▼'}</span>
          </button>
          {hintOpen && (
            <div className="px-4 pb-3 text-sm" style={{ color: '#78716c' }}>
              {question.rubricHint}
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ background: '#4F46E5' }}
      >
        Submit
      </button>
    </div>
  );
}

// ── Feynman ───────────────────────────────────────────────────────────────

function FeynmanQuestion({ question, onNext, onSubmitAnswer }: {
  question: Question; onNext: () => void;
  onSubmitAnswer?: (p: AnswerPayload) => void;
}) {
  const [text, setText] = useState('');

  return (
    <div className="p-5 flex flex-col gap-4">
      <div
        className="p-4 rounded-xl"
        style={{ background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.2)' }}
      >
        <div className="text-xs font-bold mb-2" style={{ color: '#4F46E5' }}>Teach a friend</div>
        <p className="font-bold text-base leading-snug italic" style={{ color: '#1c1917' }}>
          {question.text}
        </p>
      </div>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type your answer in plain words…"
        rows={10}
        className="w-full rounded-xl p-4 text-sm resize-none outline-none"
        style={{
          background: '#fdfdfb',
          border: '1.5px solid rgba(0,0,0,0.1)',
          color: '#1c1917',
          lineHeight: '1.75',
          fontFamily: 'inherit',
        }}
      />

      {question.keyConcepts && question.keyConcepts.length > 0 && (
        <div>
          <div className="text-xs font-bold mb-2" style={{ color: '#78716c' }}>Try to use these words ▾</div>
          <div className="flex gap-2 flex-wrap">
            {question.keyConcepts.map(c => (
              <span
                key={c}
                className="px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{
                  border: '1px dashed rgba(0,0,0,0.2)',
                  color: '#44403c',
                  background: 'rgba(0,0,0,0.02)',
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => {
          onSubmitAnswer?.({ questionId: question.id, questionType: 'FEYNMAN', studentText: text });
          onNext();
        }}
        className="py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ background: '#4F46E5' }}
      >
        Submit
      </button>
    </div>
  );
}

// ── Blurt (180s timer) ────────────────────────────────────────────────────

function BlurtQuestion({ question, onNext, onSubmitAnswer }: {
  question: Question; onNext: () => void;
  onSubmitAnswer?: (p: AnswerPayload) => void;
}) {
  const [text, setText] = useState('');
  const [timeLeft, setTimeLeft] = useState(180);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active || timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [active, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0) onNext();
  }, [timeLeft, onNext]);

  const progress = (timeLeft / 180) * 100;
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - progress / 100);
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="p-5 flex flex-col gap-4">
      <div className="text-xs font-bold" style={{ color: '#4F46E5' }}>Brain dump — write everything you remember</div>

      <div className="flex items-center gap-4">
        {/* Timer circle */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="absolute inset-0 -rotate-90" width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="6" />
            <circle
              cx="48" cy="48" r={r}
              fill="none"
              stroke={timeLeft < 30 ? '#ef4444' : '#4F46E5'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.5s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-extrabold text-xl" style={{ color: timeLeft < 30 ? '#ef4444' : '#1c1917' }}>
              {mins}:{secs.toString().padStart(2, '0')}
            </div>
            <div className="text-[9px] font-mono" style={{ color: '#78716c' }}>left</div>
          </div>
        </div>

        <div>
          <p className="text-sm leading-relaxed" style={{ color: '#44403c' }}>
            No hints. No prompts. Just write everything you remember about{' '}
            <strong>{question.text}</strong>.
          </p>
          {!active && (
            <button
              onClick={() => setActive(true)}
              className="mt-2 px-4 py-1.5 rounded-lg text-sm font-bold text-white"
              style={{ background: '#4F46E5' }}
            >
              Start timer
            </button>
          )}
        </div>
      </div>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Write everything you remember…"
        rows={10}
        className="w-full rounded-xl p-4 text-sm resize-none outline-none"
        style={{
          background: '#fdfdfb',
          border: '1.5px solid rgba(0,0,0,0.1)',
          color: '#1c1917',
          lineHeight: '1.75',
          fontFamily: 'inherit',
        }}
      />

      <button
        onClick={() => {
          onSubmitAnswer?.({ questionId: question.id, questionType: 'BLURT', studentText: text });
          onNext();
        }}
        className="py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ background: '#4F46E5' }}
      >
        I&apos;m done
      </button>
    </div>
  );
}

// ── Active Recall (Step 2 transfer) ──────────────────────────────────────

function ActiveRecallQuestion({ question, onNext, onSubmitAnswer }: {
  question: Question; onNext: () => void;
  onSubmitAnswer?: (p: AnswerPayload) => void;
}) {
  const [text, setText] = useState('');

  return (
    <div className="p-5 flex flex-col gap-4">
      {/* Step badges */}
      <div className="flex gap-2">
        <span
          className="px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ border: '1px solid rgba(0,0,0,0.15)', color: '#78716c' }}
        >
          Step 1 · Learned ✓
        </span>
        <span
          className="px-2.5 py-1 rounded-full text-xs font-bold"
          style={{
            background: 'rgba(34,197,94,0.1)',
            border: '1.5px solid #22c55e',
            color: '#16a34a',
          }}
        >
          ● Step 2 · Use it!
        </span>
      </div>

      {/* Transfer scenario */}
      <div
        className="p-4 rounded-xl"
        style={{ background: '#f0fdf4', border: '1.5px solid #22c55e44' }}
      >
        <div className="text-xs font-bold mb-2" style={{ color: '#22c55e' }}>Real-world test — use what you know!</div>
        <p className="font-bold text-base leading-snug" style={{ color: '#1c1917' }}>{question.text}</p>
      </div>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Write your response…"
        rows={9}
        className="w-full rounded-xl p-4 text-sm resize-none outline-none"
        style={{
          background: '#fdfdfb',
          border: '1.5px solid rgba(0,0,0,0.1)',
          color: '#1c1917',
          lineHeight: '1.75',
          fontFamily: 'inherit',
        }}
      />

      <div className="text-xs text-center" style={{ color: '#78716c' }}>
        Get this right and you won&apos;t see it again for 3 weeks ✨
      </div>

      <button
        onClick={() => {
          onSubmitAnswer?.({ questionId: question.id, questionType: 'ACTIVE_RECALL', studentText: text });
          onNext();
        }}
        className="py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ background: '#22c55e' }}
      >
        Submit
      </button>
    </div>
  );
}
