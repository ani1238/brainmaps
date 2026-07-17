'use client';

import { useState } from 'react';
import type { Question, QuestionPayload } from '@/types';

export interface AnswerPayload {
  questionId: string;
  questionType: string;
  chosenOption?: string;
  studentText?: string;
  answerPayload?: unknown;
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
          // v12 payload-driven items carry their full structure (options,
          // categories, pairs, blanks, …) in `payload`. Route them to the
          // interaction renderer for their type.
          if (question.payload && Object.keys(question.payload).length > 0) {
            return <V12Question key={question.id} question={question}
              onNext={onNext}
              onSubmitAnswer={onSubmitAnswer} />;
          }

          // Legacy: any question that carries answer options is a pick-one
          // question — MCQ, but also Spot it / Context clue.
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

  // Selecting only highlights the chosen option (changeable). The answer is
  // recorded when the learner taps Next — no right/wrong is shown inline.
  function handleSelect(id: string) {
    setSelected(id);
  }

  function handleAction() {
    if (!selected) return;
    if (!deferAnswerFeedback) {
      const correctId = question.options?.find(o => o.correct)?.id;
      onAnswer?.(selected === correctId);
    }
    onSubmitAnswer?.({ questionId: question.id, questionType: question.type, chosenOption: selected });
    setSelected(null);
    onNext();
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

          return (
            <button
              key={o.id}
              onClick={() => handleSelect(o.id)}
              className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-left transition-all"
              style={{
                background: isSelected ? 'rgba(79,70,229,0.1)' : 'rgba(0,0,0,0.02)',
                border: `1.5px solid ${isSelected ? '#4F46E5' : 'rgba(0,0,0,0.1)'}`,
                cursor: 'pointer',
              }}
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{
                  background: isSelected ? '#4F46E5' : 'transparent',
                  border: `1.5px solid ${isSelected ? '#4F46E5' : 'rgba(0,0,0,0.2)'}`,
                  color: isSelected ? '#ffffff' : '#44403c',
                }}
              >
                {o.id.toUpperCase()}
              </span>
              <span className="font-semibold text-sm flex-1" style={{ color: '#1c1917' }}>{o.text}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={handleAction}
        disabled={!selected}
        className="py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] mt-2 disabled:opacity-40 disabled:cursor-default"
        style={{ background: '#4F46E5' }}
      >
        {selected ? '→ Next' : 'Pick an answer'}
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
  HOTS:                  { label: 'Think deeper',  placeholder: 'Use the concept to reason through the scenario…' },
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

// ── Blurt (free recall) ─────────────────────────────────────────────────────

function BlurtQuestion({ question, onNext, onSubmitAnswer }: {
  question: Question; onNext: () => void;
  onSubmitAnswer?: (p: AnswerPayload) => void;
}) {
  const [text, setText] = useState('');

  return (
    <div className="p-5 flex flex-col gap-4">
      <div>
        <div className="text-xs font-bold mb-2" style={{ color: '#78716c' }}>Brain dump — write everything you remember</div>
        <p className="font-bold text-lg leading-snug" style={{ color: '#1c1917' }}>{question.text}</p>
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

// ═══════════════════════════════════════════════════════════════════════════
// v12 payload-driven question types
// ═══════════════════════════════════════════════════════════════════════════

// Shared indigo submit button used across the v12 interaction components.
function SubmitBtn({ label, disabled, onClick, color = '#4F46E5' }: {
  label: string; disabled?: boolean; onClick: () => void; color?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] mt-2 disabled:opacity-40 disabled:cursor-default"
      style={{ background: color }}
    >
      {label}
    </button>
  );
}

function Prompt({ kicker, text }: { kicker: string; text: string }) {
  return (
    <div>
      <div className="text-xs font-bold mb-2" style={{ color: '#78716c' }}>{kicker}</div>
      <p className="font-bold text-lg leading-snug" style={{ color: '#1c1917' }}>{text}</p>
    </div>
  );
}

// Contextual scene box (scenario / data_context / assertion prose) shown above a prompt.
function ContextBox({ text }: { text: string }) {
  return (
    <div className="p-4 rounded-xl" style={{ background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.2)' }}>
      <p className="text-sm leading-relaxed" style={{ color: '#44403c' }}>{text}</p>
    </div>
  );
}

// V12Question dispatches a payload-carrying question to the right interaction.
function V12Question({ question, onNext, onSubmitAnswer }: {
  question: Question; onNext: () => void;
  onSubmitAnswer?: (p: AnswerPayload) => void;
}) {
  const p = question.payload ?? {};
  switch (question.type) {
    case 'MCQ':
    case 'STORY_MCQ':
    case 'HOTS_MCQ':
    case 'CONTEXT_CLUE':
    case 'ASSERTION_REASON':
    case 'CONCLUSION_DRAW':
      return <PayloadMCQ question={question} payload={p} onNext={onNext} onSubmitAnswer={onSubmitAnswer} />;
    case 'SPOT_IT':
      return <SpotItPayload question={question} payload={p} onNext={onNext} onSubmitAnswer={onSubmitAnswer} />;
    case 'TRUE_FALSE_WHY':
      return <TrueFalseWhyPayload question={question} payload={p} onNext={onNext} onSubmitAnswer={onSubmitAnswer} />;
    case 'PREDICT_JUSTIFY':
      return <PredictJustifyPayload question={question} payload={p} onNext={onNext} onSubmitAnswer={onSubmitAnswer} />;
    case 'CLASSIFY':
      return <ClassifyPayload question={question} payload={p} onNext={onNext} onSubmitAnswer={onSubmitAnswer} />;
    case 'MATCH':
      return <MatchPayload question={question} payload={p} onNext={onNext} onSubmitAnswer={onSubmitAnswer} />;
    case 'SEQUENCE':
      return <SequencePayload question={question} payload={p} onNext={onNext} onSubmitAnswer={onSubmitAnswer} />;
    case 'CLOZE':
      return <ClozePayload question={question} payload={p} onNext={onNext} onSubmitAnswer={onSubmitAnswer} />;
    case 'MCQ_CLUSTER':
      return <McqClusterPayload question={question} payload={p} onNext={onNext} onSubmitAnswer={onSubmitAnswer} />;
    case 'EVIDENCE_HUNT':
      return <EvidenceHuntPayload question={question} payload={p} onNext={onNext} onSubmitAnswer={onSubmitAnswer} />;
    default:
      // Open production (DESIGN_CHALLENGE, DESCRIPTIVE, FEYNMAN, FIX_IT, …) → AI graded.
      return <PayloadTextQuestion question={question} payload={p} onNext={onNext} onSubmitAnswer={onSubmitAnswer} />;
  }
}

// ── Option picker (mcq / assertion_reason / conclusion_draw / context clue) ──

function PayloadMCQ({ question, payload, onNext, onSubmitAnswer }: {
  question: Question; payload: QuestionPayload; onNext: () => void;
  onSubmitAnswer?: (p: AnswerPayload) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const options = payload.options ?? [];
  const context = payload.data_context ?? payload.scenario;

  function submit() {
    if (!selected) return;
    onSubmitAnswer?.({
      questionId: question.id,
      questionType: question.type,
      answerPayload: { optionId: selected },
    });
    setSelected(null);
    onNext();
  }

  return (
    <div className="p-5 flex flex-col gap-4">
      {context && <ContextBox text={context} />}
      {payload.assertion_text && (
        <div className="flex flex-col gap-1.5">
          <div className="text-xs font-bold" style={{ color: '#78716c' }}>Assertion (A)</div>
          <p className="text-sm font-semibold" style={{ color: '#1c1917' }}>{payload.assertion_text}</p>
          {payload.reason_text && (<>
            <div className="text-xs font-bold mt-1" style={{ color: '#78716c' }}>Reason (R)</div>
            <p className="text-sm font-semibold" style={{ color: '#1c1917' }}>{payload.reason_text}</p>
          </>)}
        </div>
      )}
      <Prompt kicker="Pick the right one" text={payload.prompt ?? question.text} />
      <div className="flex flex-col gap-2.5">
        {options.map(o => (
          <OptionButton key={o.id} id={o.id} text={o.text} selected={selected === o.id} onClick={() => setSelected(o.id)} />
        ))}
      </div>
      <SubmitBtn label={selected ? '→ Next' : 'Pick an answer'} disabled={!selected} onClick={submit} />
    </div>
  );
}

// A single lettered choice button, shared by the option-based v12 renderers.
function OptionButton({ id, text, selected, onClick, badge }: {
  id: string; text: string; selected: boolean; onClick: () => void; badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-left transition-all"
      style={{
        background: selected ? 'rgba(79,70,229,0.1)' : 'rgba(0,0,0,0.02)',
        border: `1.5px solid ${selected ? '#4F46E5' : 'rgba(0,0,0,0.1)'}`,
        cursor: 'pointer',
      }}
    >
      <span
        className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
        style={{
          background: selected ? '#4F46E5' : 'transparent',
          border: `1.5px solid ${selected ? '#4F46E5' : 'rgba(0,0,0,0.2)'}`,
          color: selected ? '#ffffff' : '#44403c',
        }}
      >
        {(badge ?? id).toUpperCase()}
      </span>
      <span className="font-semibold text-sm flex-1" style={{ color: '#1c1917' }}>{text}</span>
    </button>
  );
}

// ── Spot it (pick the wrong statement) ──────────────────────────────────────

function SpotItPayload({ question, payload, onNext, onSubmitAnswer }: {
  question: Question; payload: QuestionPayload; onNext: () => void;
  onSubmitAnswer?: (p: AnswerPayload) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const statements = payload.statements ?? [];

  function submit() {
    if (selected == null) return;
    onSubmitAnswer?.({
      questionId: question.id,
      questionType: question.type,
      answerPayload: { statementId: selected },
    });
    setSelected(null);
    onNext();
  }

  return (
    <div className="p-5 flex flex-col gap-4">
      <Prompt kicker="Spot the mistake" text={payload.prompt ?? question.text} />
      <div className="flex flex-col gap-2.5">
        {statements.map(s => (
          <button
            key={s.id}
            onClick={() => setSelected(s.id)}
            className="w-full px-4 py-3.5 rounded-xl text-left transition-all"
            style={{
              background: selected === s.id ? 'rgba(239,68,68,0.08)' : 'rgba(0,0,0,0.02)',
              border: `1.5px solid ${selected === s.id ? '#ef4444' : 'rgba(0,0,0,0.1)'}`,
              cursor: 'pointer',
            }}
          >
            {s.speaker && <div className="text-xs font-bold mb-0.5" style={{ color: '#78716c' }}>{s.speaker}</div>}
            <span className="font-semibold text-sm" style={{ color: '#1c1917' }}>{s.text}</span>
          </button>
        ))}
      </div>
      <SubmitBtn label={selected != null ? '→ Next' : 'Tap the wrong one'} disabled={selected == null} onClick={submit} />
    </div>
  );
}

// ── True / False, then Why (two-step) ───────────────────────────────────────

function TrueFalseWhyPayload({ question, payload, onNext, onSubmitAnswer }: {
  question: Question; payload: QuestionPayload; onNext: () => void;
  onSubmitAnswer?: (p: AnswerPayload) => void;
}) {
  const [verdict, setVerdict] = useState<string | null>(null);
  const [reasonId, setReasonId] = useState<string | null>(null);
  const reasons = payload.reason_options ?? [];

  function submit() {
    if (!verdict || !reasonId) return;
    onSubmitAnswer?.({
      questionId: question.id,
      questionType: question.type,
      answerPayload: { verdict, reasonId },
    });
    onNext();
  }

  return (
    <div className="p-5 flex flex-col gap-4">
      <ContextBox text={payload.statement ?? question.text} />
      <div>
        <div className="text-xs font-bold mb-2" style={{ color: '#78716c' }}>Is it true or false?</div>
        <div className="flex gap-2.5">
          {['True', 'False'].map(v => (
            <button
              key={v}
              onClick={() => setVerdict(v)}
              className="flex-1 py-3 rounded-xl font-bold text-sm transition-all"
              style={{
                background: verdict === v ? 'rgba(79,70,229,0.1)' : 'rgba(0,0,0,0.02)',
                border: `1.5px solid ${verdict === v ? '#4F46E5' : 'rgba(0,0,0,0.1)'}`,
                color: verdict === v ? '#4F46E5' : '#44403c',
                cursor: 'pointer',
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      {verdict && (
        <div className="flex flex-col gap-2.5">
          <div className="text-xs font-bold" style={{ color: '#78716c' }}>…and why?</div>
          {reasons.map(o => (
            <OptionButton key={o.id} id={o.id} text={o.text} selected={reasonId === o.id} onClick={() => setReasonId(o.id)} />
          ))}
        </div>
      )}
      <SubmitBtn label={verdict && reasonId ? '→ Next' : 'Choose true/false and a reason'} disabled={!verdict || !reasonId} onClick={submit} />
    </div>
  );
}

// ── Predict, then Justify (two-step) ────────────────────────────────────────

function PredictJustifyPayload({ question, payload, onNext, onSubmitAnswer }: {
  question: Question; payload: QuestionPayload; onNext: () => void;
  onSubmitAnswer?: (p: AnswerPayload) => void;
}) {
  const [prediction, setPrediction] = useState<string | null>(null);
  const [justifyId, setJustifyId] = useState<string | null>(null);
  const predictions = payload.prediction_options ?? [];
  const justifications = payload.justify_options ?? [];

  function submit() {
    if (!prediction || !justifyId) return;
    onSubmitAnswer?.({
      questionId: question.id,
      questionType: question.type,
      answerPayload: { prediction, justifyId },
    });
    onNext();
  }

  return (
    <div className="p-5 flex flex-col gap-4">
      {payload.scenario && <ContextBox text={payload.scenario} />}
      <Prompt kicker="Predict" text={payload.prediction_question ?? question.text} />
      <div className="flex flex-col gap-2.5">
        {predictions.map((text, i) => (
          <OptionButton key={i} id={String.fromCharCode(97 + i)} badge={String.fromCharCode(97 + i)}
            text={text} selected={prediction === text} onClick={() => setPrediction(text)} />
        ))}
      </div>
      {prediction && (
        <div className="flex flex-col gap-2.5">
          <div className="text-xs font-bold" style={{ color: '#78716c' }}>{payload.justify_question ?? 'Why?'}</div>
          {justifications.map(o => (
            <OptionButton key={o.id} id={o.id} text={o.text} selected={justifyId === o.id} onClick={() => setJustifyId(o.id)} />
          ))}
        </div>
      )}
      <SubmitBtn label={prediction && justifyId ? '→ Next' : 'Predict and justify'} disabled={!prediction || !justifyId} onClick={submit} />
    </div>
  );
}

// ── Classify (assign each item to a category) ───────────────────────────────

function ClassifyPayload({ question, payload, onNext, onSubmitAnswer }: {
  question: Question; payload: QuestionPayload; onNext: () => void;
  onSubmitAnswer?: (p: AnswerPayload) => void;
}) {
  const items = payload.items ?? [];
  const categories = payload.categories ?? [];
  const [assign, setAssign] = useState<Record<string, string>>({});
  const done = items.length > 0 && items.every(it => assign[it.text]);

  function submit() {
    if (!done) return;
    onSubmitAnswer?.({
      questionId: question.id,
      questionType: question.type,
      answerPayload: { assignments: assign },
    });
    onNext();
  }

  return (
    <div className="p-5 flex flex-col gap-4">
      <Prompt kicker="Sort each one" text={payload.prompt ?? question.text} />
      <div className="flex flex-col gap-3">
        {items.map(it => (
          <div key={it.text} className="rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.02)', border: '1.5px solid rgba(0,0,0,0.08)' }}>
            <p className="font-semibold text-sm mb-2" style={{ color: '#1c1917' }}>{it.text}</p>
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setAssign(a => ({ ...a, [it.text]: cat }))}
                  className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                  style={{
                    background: assign[it.text] === cat ? '#4F46E5' : 'transparent',
                    border: `1.5px solid ${assign[it.text] === cat ? '#4F46E5' : 'rgba(0,0,0,0.15)'}`,
                    color: assign[it.text] === cat ? '#fff' : '#44403c',
                    cursor: 'pointer',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <SubmitBtn label={done ? '→ Next' : 'Sort every item'} disabled={!done} onClick={submit} />
    </div>
  );
}

// ── Match (pick the right side for each left) ───────────────────────────────

function MatchPayload({ question, payload, onNext, onSubmitAnswer }: {
  question: Question; payload: QuestionPayload; onNext: () => void;
  onSubmitAnswer?: (p: AnswerPayload) => void;
}) {
  const lefts = payload.lefts ?? [];
  const rights = payload.rights ?? [];
  const [pairs, setPairs] = useState<Record<string, string>>({});
  const done = lefts.length > 0 && lefts.every(l => pairs[l]);

  function submit() {
    if (!done) return;
    onSubmitAnswer?.({
      questionId: question.id,
      questionType: question.type,
      answerPayload: { pairs },
    });
    onNext();
  }

  return (
    <div className="p-5 flex flex-col gap-4">
      <Prompt kicker="Match the pairs" text={payload.prompt ?? question.text} />
      <div className="flex flex-col gap-3">
        {lefts.map(l => (
          <div key={l} className="rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.02)', border: '1.5px solid rgba(0,0,0,0.08)' }}>
            <p className="font-semibold text-sm mb-2" style={{ color: '#1c1917' }}>{l}</p>
            <div className="flex gap-2 flex-wrap">
              {rights.map(r => (
                <button
                  key={r}
                  onClick={() => setPairs(pr => ({ ...pr, [l]: r }))}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all text-left"
                  style={{
                    background: pairs[l] === r ? '#4F46E5' : 'transparent',
                    border: `1.5px solid ${pairs[l] === r ? '#4F46E5' : 'rgba(0,0,0,0.15)'}`,
                    color: pairs[l] === r ? '#fff' : '#44403c',
                    cursor: 'pointer',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <SubmitBtn label={done ? '→ Next' : 'Match every row'} disabled={!done} onClick={submit} />
    </div>
  );
}

// ── Sequence (tap items in order) ───────────────────────────────────────────

function SequencePayload({ question, payload, onNext, onSubmitAnswer }: {
  question: Question; payload: QuestionPayload; onNext: () => void;
  onSubmitAnswer?: (p: AnswerPayload) => void;
}) {
  const scrambled = payload.items_scrambled ?? [];
  const [order, setOrder] = useState<string[]>([]);
  const done = order.length === scrambled.length && scrambled.length > 0;

  function toggle(item: string) {
    setOrder(o => o.includes(item) ? o.filter(x => x !== item) : [...o, item]);
  }

  function submit() {
    if (!done) return;
    onSubmitAnswer?.({
      questionId: question.id,
      questionType: question.type,
      answerPayload: { order },
    });
    onNext();
  }

  return (
    <div className="p-5 flex flex-col gap-4">
      <Prompt kicker="Put them in order" text={payload.prompt ?? question.text} />
      <div className="flex flex-col gap-2.5">
        {scrambled.map(item => {
          const rank = order.indexOf(item);
          const picked = rank >= 0;
          return (
            <button
              key={item}
              onClick={() => toggle(item)}
              className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-left transition-all"
              style={{
                background: picked ? 'rgba(79,70,229,0.1)' : 'rgba(0,0,0,0.02)',
                border: `1.5px solid ${picked ? '#4F46E5' : 'rgba(0,0,0,0.1)'}`,
                cursor: 'pointer',
              }}
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{
                  background: picked ? '#4F46E5' : 'transparent',
                  border: `1.5px solid ${picked ? '#4F46E5' : 'rgba(0,0,0,0.2)'}`,
                  color: picked ? '#fff' : '#44403c',
                }}
              >
                {picked ? rank + 1 : '·'}
              </span>
              <span className="font-semibold text-sm flex-1" style={{ color: '#1c1917' }}>{item}</span>
            </button>
          );
        })}
      </div>
      <div className="text-[11px]" style={{ color: '#78716c' }}>Tap in the correct order. Tap again to undo.</div>
      <SubmitBtn label={done ? '→ Next' : 'Order every step'} disabled={!done} onClick={submit} />
    </div>
  );
}

// ── Cloze (fill blanks from a word bank) ────────────────────────────────────

function ClozePayload({ question, payload, onNext, onSubmitAnswer }: {
  question: Question; payload: QuestionPayload; onNext: () => void;
  onSubmitAnswer?: (p: AnswerPayload) => void;
}) {
  const blanks = payload.blanks ?? [];
  const bank = payload.word_bank ?? [];
  const [fills, setFills] = useState<Record<string, string>>({});
  const [active, setActive] = useState<string | null>(blanks.length ? String(blanks[0].id) : null);
  const done = blanks.length > 0 && blanks.every(b => fills[String(b.id)]);

  function place(word: string) {
    if (!active) return;
    setFills(f => ({ ...f, [active]: word }));
    const remaining = blanks.map(b => String(b.id)).filter(id => id !== active && !fills[id]);
    setActive(remaining[0] ?? null);
  }

  function submit() {
    if (!done) return;
    onSubmitAnswer?.({
      questionId: question.id,
      questionType: question.type,
      answerPayload: { blanks: fills },
    });
    onNext();
  }

  // Render the cloze text, replacing [n] with a tappable blank chip.
  const parts = (payload.text ?? '').split(/(\[\d+\])/g);

  return (
    <div className="p-5 flex flex-col gap-4">
      <Prompt kicker="Fill the blanks" text={payload.prompt ?? question.text} />
      <p className="text-base leading-loose" style={{ color: '#1c1917' }}>
        {parts.map((part, i) => {
          const m = part.match(/^\[(\d+)\]$/);
          if (!m) return <span key={i}>{part}</span>;
          const id = m[1];
          return (
            <button
              key={i}
              onClick={() => setActive(id)}
              className="inline-flex items-center mx-1 px-3 py-0.5 rounded-lg text-sm font-bold align-middle"
              style={{
                minWidth: 64,
                background: fills[id] ? 'rgba(79,70,229,0.1)' : 'transparent',
                border: `1.5px ${active === id ? 'solid' : 'dashed'} ${active === id || fills[id] ? '#4F46E5' : 'rgba(0,0,0,0.3)'}`,
                color: '#4F46E5',
                cursor: 'pointer',
              }}
            >
              {fills[id] ?? '\u00A0'}
            </button>
          );
        })}
      </p>
      <div>
        <div className="text-xs font-bold mb-2" style={{ color: '#78716c' }}>Word bank</div>
        <div className="flex gap-2 flex-wrap">
          {bank.map(word => {
            const used = Object.values(fills).includes(word);
            return (
              <button
                key={word}
                onClick={() => place(word)}
                className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                style={{
                  background: used ? 'rgba(0,0,0,0.04)' : 'transparent',
                  border: '1.5px solid rgba(0,0,0,0.15)',
                  color: used ? '#a8a29e' : '#44403c',
                  cursor: 'pointer',
                }}
              >
                {word}
              </button>
            );
          })}
        </div>
      </div>
      <SubmitBtn label={done ? '→ Next' : 'Fill every blank'} disabled={!done} onClick={submit} />
    </div>
  );
}

// ── MCQ cluster (several linked sub-questions) ──────────────────────────────

function McqClusterPayload({ question, payload, onNext, onSubmitAnswer }: {
  question: Question; payload: QuestionPayload; onNext: () => void;
  onSubmitAnswer?: (p: AnswerPayload) => void;
}) {
  const subs = payload.sub_questions ?? [];
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const done = subs.length > 0 && subs.every(s => answers[s.id]);

  function submit() {
    if (!done) return;
    onSubmitAnswer?.({
      questionId: question.id,
      questionType: question.type,
      answerPayload: { answers },
    });
    onNext();
  }

  return (
    <div className="p-5 flex flex-col gap-4">
      {payload.scenario && <ContextBox text={payload.scenario} />}
      {(payload.prompt || question.text) && payload.prompt !== payload.scenario && (
        <Prompt kicker="Work through each part" text={payload.prompt ?? question.text} />
      )}
      <div className="flex flex-col gap-4">
        {subs.map((s, idx) => (
          <div key={s.id} className="flex flex-col gap-2">
            <p className="font-bold text-sm" style={{ color: '#1c1917' }}>{idx + 1}. {s.prompt}</p>
            <div className="flex flex-col gap-2">
              {s.options.map(o => (
                <OptionButton key={o.id} id={o.id} text={o.text}
                  selected={answers[s.id] === o.id}
                  onClick={() => setAnswers(a => ({ ...a, [s.id]: o.id }))} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <SubmitBtn label={done ? '→ Next' : 'Answer every part'} disabled={!done} onClick={submit} />
    </div>
  );
}

// ── Evidence hunt (pick the sentence that is the evidence) ──────────────────

function EvidenceHuntPayload({ question, payload, onNext, onSubmitAnswer }: {
  question: Question; payload: QuestionPayload; onNext: () => void;
  onSubmitAnswer?: (p: AnswerPayload) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const sentences = payload.sentence_options ?? [];

  function submit() {
    if (!selected) return;
    onSubmitAnswer?.({
      questionId: question.id,
      questionType: question.type,
      answerPayload: { sentenceId: selected },
    });
    setSelected(null);
    onNext();
  }

  return (
    <div className="p-5 flex flex-col gap-4">
      {payload.data_context && <ContextBox text={payload.data_context} />}
      <Prompt kicker="Find the evidence" text={payload.prompt ?? question.text} />
      <div className="flex flex-col gap-2.5">
        {sentences.map(s => (
          <OptionButton key={s.id} id={s.id} text={s.text} selected={selected === s.id} onClick={() => setSelected(s.id)} />
        ))}
      </div>
      <SubmitBtn label={selected ? '→ Next' : 'Pick the evidence'} disabled={!selected} onClick={submit} />
    </div>
  );
}

// ── Open production (design_challenge / descriptive-style) → AI graded ───────

const V12_OPEN_COPY: Record<string, { label: string; placeholder: string }> = {
  DESIGN_CHALLENGE: { label: 'Design it', placeholder: 'Lay out your steps and justify each one…' },
  DESCRIPTIVE:      { label: 'Explain it in your own words', placeholder: 'Write your answer…' },
  FEYNMAN:          { label: 'Teach a friend', placeholder: 'Type your answer in plain words…' },
  FIX_IT:           { label: 'Fix it', placeholder: 'Find the mistake and write the correction…' },
  PRODUCE_IT:       { label: 'Produce it', placeholder: 'Write your own example or answer…' },
  BLURT:            { label: 'Brain dump', placeholder: 'Write everything you remember…' },
  HOTS:             { label: 'Think deeper', placeholder: 'Reason through the scenario…' },
};

function PayloadTextQuestion({ question, payload, onNext, onSubmitAnswer }: {
  question: Question; payload: QuestionPayload; onNext: () => void;
  onSubmitAnswer?: (p: AnswerPayload) => void;
}) {
  const [text, setText] = useState('');
  const copy = V12_OPEN_COPY[question.type] ?? { label: 'Your answer', placeholder: 'Write your answer…' };
  const context = payload.scenario ?? payload.data_context;

  function submit() {
    onSubmitAnswer?.({ questionId: question.id, questionType: question.type, studentText: text });
    onNext();
  }

  return (
    <div className="p-5 flex flex-col gap-4">
      {context && <ContextBox text={context} />}
      <Prompt kicker={copy.label} text={payload.prompt ?? question.text} />
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={copy.placeholder}
        rows={9}
        className="w-full rounded-xl p-4 text-sm resize-none outline-none transition-all"
        style={{ background: '#fdfdfb', border: '1.5px solid rgba(0,0,0,0.1)', color: '#1c1917', lineHeight: '1.75', fontFamily: 'inherit' }}
      />
      <SubmitBtn label="Submit" onClick={submit} />
    </div>
  );
}
