'use client';

import { useState } from 'react';
import { COLORS } from '@/lib/tokens';
import type { SessionReview, SessionReviewAnswer } from '@/lib/api';

// ─────────────────────────────────────────────────────────────────────────────
// ReviewCarousel — one question per slide, rendered with the SAME structure
// the student saw while answering (prompt, context box, options / pairs /
// blanks / …), but read-only and graded: the correct choice is always
// outlined green, and the student's pick is outlined red if it was wrong.
// AI feedback (explanation / rubric guide) is a separate reveal, not shown
// by default — matches the rest of the review surface.
// ─────────────────────────────────────────────────────────────────────────────

// Raw (unsanitized) payload shapes. Unlike the live-session QuestionPayload
// (answer keys stripped before serving), this is what the session-review
// endpoint returns — answer keys included, since the session is already over.
interface RawOption { id: string; text: string; correct?: boolean; }
interface RawPayload {
  prompt?: string;
  scenario?: string;
  data_context?: string;
  assertion_text?: string;
  reason_text?: string;
  options?: RawOption[];
  statements?: { id: number; speaker?: string; text: string }[];
  error_id?: number;
  statement?: string;
  reason_options?: RawOption[];
  verdict?: string;
  prediction_question?: string;
  prediction_options?: string[];
  correct_prediction?: string;
  justify_question?: string;
  justify_options?: RawOption[];
  categories?: string[];
  items?: { text: string; correct_category?: string }[];
  pairs?: { left: string; right: string }[];
  items_scrambled?: string[];
  correct_order?: string[];
  text?: string;
  blanks?: { id: number | string; answer?: string }[];
  word_bank?: string[];
  sub_questions?: { id: string; prompt: string; options: RawOption[] }[];
  sentence_options?: { id: string; text: string }[];
  correct_sentence_id?: string;
}

function asRawPayload(p: unknown): RawPayload {
  return (p && typeof p === 'object' ? p : {}) as RawPayload;
}
function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}
function strMap(v: unknown): Record<string, string> {
  return v && typeof v === 'object' ? v as Record<string, string> : {};
}

function scoreColorFor(item: SessionReviewAnswer): string {
  const score = item.score ?? (item.isCorrect ? 1 : 0);
  return score >= 0.75 ? '#22c55e' : score >= 0.45 ? '#f97316' : '#ef4444';
}

// ── Shared read-only building blocks (mirror QuestionScreen's visual style) ──

function Prompt({ kicker, text }: { kicker?: string; text: string }) {
  return (
    <div>
      {kicker && <div className="text-xs font-bold mb-2" style={{ color: '#78716c' }}>{kicker}</div>}
      <p className="font-bold text-lg leading-snug" style={{ color: '#1c1917' }}>{text}</p>
    </div>
  );
}

function ContextBox({ text }: { text: string }) {
  return (
    <div className="p-4 rounded-xl" style={{ background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.2)' }}>
      <p className="text-sm leading-relaxed" style={{ color: '#44403c' }}>{text}</p>
    </div>
  );
}

// A single option, graded: green if it's the correct one, red if it's what
// the student picked and it was wrong, neutral otherwise.
function GradedOption({ id, text, isCorrectOption, isPicked, badge }: {
  id: string; text: string; isCorrectOption: boolean; isPicked: boolean; badge?: string;
}) {
  const wrong = isPicked && !isCorrectOption;
  const border = isCorrectOption ? '#22c55e' : wrong ? '#ef4444' : 'rgba(0,0,0,0.1)';
  const bg = isCorrectOption ? 'rgba(34,197,94,0.08)' : wrong ? 'rgba(239,68,68,0.08)' : 'rgba(0,0,0,0.02)';
  return (
    <div className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-left" style={{ background: bg, border: `1.5px solid ${border}` }}>
      <span
        className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
        style={{
          background: isCorrectOption ? '#22c55e' : wrong ? '#ef4444' : 'transparent',
          border: `1.5px solid ${border}`,
          color: isCorrectOption || wrong ? '#fff' : '#44403c',
        }}
      >
        {(badge ?? id).toUpperCase()}
      </span>
      <span className="font-semibold text-sm flex-1" style={{ color: '#1c1917' }}>{text}</span>
      {isCorrectOption && <span className="text-sm flex-none" style={{ color: '#16a34a' }}>✓</span>}
      {wrong && <span className="text-sm flex-none" style={{ color: '#dc2626' }}>✕</span>}
    </div>
  );
}

// ── Per-type read-only renderers ──────────────────────────────────────────────

function MCQReview({ payload, answerPayload }: { payload: RawPayload; answerPayload: unknown }) {
  const picked = str((answerPayload as { optionId?: unknown } | undefined)?.optionId);
  const options = payload.options ?? [];
  const context = payload.data_context ?? payload.scenario;
  return (
    <div className="flex flex-col gap-4">
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
      <div className="flex flex-col gap-2.5">
        {options.map(o => (
          <GradedOption key={o.id} id={o.id} text={o.text} isCorrectOption={!!o.correct} isPicked={picked === o.id} />
        ))}
      </div>
    </div>
  );
}

function SpotItReview({ payload, answerPayload }: { payload: RawPayload; answerPayload: unknown }) {
  const picked = (answerPayload as { statementId?: unknown } | undefined)?.statementId;
  const pickedNum = typeof picked === 'number' ? picked : undefined;
  const statements = payload.statements ?? [];
  return (
    <div className="flex flex-col gap-2.5">
      {statements.map(s => {
        const isCorrect = s.id === payload.error_id;
        const wrong = pickedNum === s.id && !isCorrect;
        return (
          <div key={s.id} className="w-full px-4 py-3.5 rounded-xl text-left"
            style={{
              background: isCorrect ? 'rgba(34,197,94,0.08)' : wrong ? 'rgba(239,68,68,0.08)' : 'rgba(0,0,0,0.02)',
              border: `1.5px solid ${isCorrect ? '#22c55e' : wrong ? '#ef4444' : 'rgba(0,0,0,0.1)'}`,
            }}>
            {s.speaker && <div className="text-xs font-bold mb-0.5" style={{ color: '#78716c' }}>{s.speaker}</div>}
            <span className="font-semibold text-sm" style={{ color: '#1c1917' }}>{s.text}</span>
            {isCorrect && <span className="ml-2 text-sm" style={{ color: '#16a34a' }}>✓ this was the mistake</span>}
          </div>
        );
      })}
    </div>
  );
}

function TrueFalseWhyReview({ payload, answerPayload }: { payload: RawPayload; answerPayload: unknown }) {
  const ap = answerPayload as { verdict?: unknown; reasonId?: unknown } | undefined;
  const pickedVerdict = str(ap?.verdict);
  const pickedReason = str(ap?.reasonId);
  const reasons = payload.reason_options ?? [];
  return (
    <div className="flex flex-col gap-4">
      <ContextBox text={payload.statement ?? ''} />
      <div>
        <div className="text-xs font-bold mb-2" style={{ color: '#78716c' }}>Is it true or false?</div>
        <div className="flex gap-2.5">
          {['True', 'False'].map(v => {
            const isCorrect = v.toLowerCase() === (payload.verdict ?? '').toLowerCase();
            const wrong = v === pickedVerdict && !isCorrect;
            return (
              <div key={v} className="flex-1 py-3 rounded-xl font-bold text-sm text-center"
                style={{
                  background: isCorrect ? 'rgba(34,197,94,0.08)' : wrong ? 'rgba(239,68,68,0.08)' : 'rgba(0,0,0,0.02)',
                  border: `1.5px solid ${isCorrect ? '#22c55e' : wrong ? '#ef4444' : 'rgba(0,0,0,0.1)'}`,
                  color: isCorrect ? '#16a34a' : wrong ? '#dc2626' : '#44403c',
                }}>
                {v}{isCorrect && ' ✓'}{wrong && ' ✕'}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        <div className="text-xs font-bold" style={{ color: '#78716c' }}>…and why?</div>
        {reasons.map(o => (
          <GradedOption key={o.id} id={o.id} text={o.text} isCorrectOption={!!o.correct} isPicked={pickedReason === o.id} />
        ))}
      </div>
    </div>
  );
}

function PredictJustifyReview({ payload, answerPayload }: { payload: RawPayload; answerPayload: unknown }) {
  const ap = answerPayload as { prediction?: unknown; justifyId?: unknown } | undefined;
  const pickedPrediction = str(ap?.prediction);
  const pickedJustify = str(ap?.justifyId);
  const predictions = payload.prediction_options ?? [];
  const justifications = payload.justify_options ?? [];
  return (
    <div className="flex flex-col gap-4">
      {payload.scenario && <ContextBox text={payload.scenario} />}
      <Prompt kicker="Predict" text={payload.prediction_question ?? ''} />
      <div className="flex flex-col gap-2.5">
        {predictions.map((text, i) => {
          const badge = String.fromCharCode(97 + i);
          const isCorrect = text === payload.correct_prediction;
          return (
            <GradedOption key={i} id={badge} badge={badge} text={text}
              isCorrectOption={isCorrect} isPicked={pickedPrediction === text} />
          );
        })}
      </div>
      <div className="flex flex-col gap-2.5">
        <div className="text-xs font-bold" style={{ color: '#78716c' }}>{payload.justify_question ?? 'Why?'}</div>
        {justifications.map(o => (
          <GradedOption key={o.id} id={o.id} text={o.text} isCorrectOption={!!o.correct} isPicked={pickedJustify === o.id} />
        ))}
      </div>
    </div>
  );
}

function ClassifyReview({ payload, answerPayload }: { payload: RawPayload; answerPayload: unknown }) {
  const assignments = strMap((answerPayload as { assignments?: unknown } | undefined)?.assignments);
  const items = payload.items ?? [];
  return (
    <div className="flex flex-col gap-3">
      {items.map(it => {
        const picked = assignments[it.text];
        const correct = it.correct_category;
        const wrong = picked && picked !== correct;
        return (
          <div key={it.text} className="rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.02)', border: '1.5px solid rgba(0,0,0,0.08)' }}>
            <p className="font-semibold text-sm mb-2" style={{ color: '#1c1917' }}>{it.text}</p>
            <div className="flex gap-2 flex-wrap items-center">
              <span className="px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1.5px solid #22c55e', color: '#16a34a' }}>
                ✓ {correct}
              </span>
              {wrong && (
                <span className="px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1.5px solid #ef4444', color: '#dc2626' }}>
                  ✕ picked: {picked}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MatchReview({ payload, answerPayload }: { payload: RawPayload; answerPayload: unknown }) {
  const pairsPicked = strMap((answerPayload as { pairs?: unknown } | undefined)?.pairs);
  const pairs = payload.pairs ?? [];
  return (
    <div className="flex flex-col gap-3">
      {pairs.map(p => {
        const picked = pairsPicked[p.left];
        const wrong = picked && picked !== p.right;
        return (
          <div key={p.left} className="rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.02)', border: '1.5px solid rgba(0,0,0,0.08)' }}>
            <p className="font-semibold text-sm mb-2" style={{ color: '#1c1917' }}>{p.left}</p>
            <div className="flex gap-2 flex-wrap items-center">
              <span className="px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1.5px solid #22c55e', color: '#16a34a' }}>
                ✓ {p.right}
              </span>
              {wrong && (
                <span className="px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1.5px solid #ef4444', color: '#dc2626' }}>
                  ✕ picked: {picked}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SequenceReview({ payload, answerPayload }: { payload: RawPayload; answerPayload: unknown }) {
  const order = (answerPayload as { order?: unknown } | undefined)?.order;
  const pickedOrder = Array.isArray(order) ? order.filter((x): x is string => typeof x === 'string') : [];
  const correctOrder = payload.correct_order ?? [];
  const shown = pickedOrder.length ? pickedOrder : correctOrder;
  return (
    <div className="flex flex-col gap-2.5">
      {shown.map((item, i) => {
        const isRight = correctOrder[i] === item;
        return (
          <div key={item} className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-left"
            style={{
              background: isRight ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1.5px solid ${isRight ? '#22c55e' : '#ef4444'}`,
            }}>
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: isRight ? '#22c55e' : '#ef4444', color: '#fff' }}>
              {i + 1}
            </span>
            <span className="font-semibold text-sm flex-1" style={{ color: '#1c1917' }}>{item}</span>
          </div>
        );
      })}
      {pickedOrder.length > 0 && pickedOrder.join('|') !== correctOrder.join('|') && (
        <div className="text-xs font-semibold px-1" style={{ color: '#78716c' }}>
          Correct order: {correctOrder.map((s, i) => `${i + 1}. ${s}`).join('  ')}
        </div>
      )}
    </div>
  );
}

function ClozeReview({ payload, answerPayload }: { payload: RawPayload; answerPayload: unknown }) {
  const fills = strMap((answerPayload as { blanks?: unknown } | undefined)?.blanks);
  const blanks = payload.blanks ?? [];
  const parts = (payload.text ?? '').split(/(\[\d+\])/g);
  return (
    <p className="text-base leading-loose" style={{ color: '#1c1917' }}>
      {parts.map((part, i) => {
        const m = part.match(/^\[(\d+)\]$/);
        if (!m) return <span key={i}>{part}</span>;
        const id = m[1];
        const blank = blanks.find(b => String(b.id) === id);
        const picked = fills[id];
        const isRight = blank && picked && blank.answer?.toLowerCase().trim() === picked.toLowerCase().trim();
        return (
          <span key={i}
            className="inline-flex items-center mx-1 px-3 py-0.5 rounded-lg text-sm font-bold align-middle"
            style={{
              minWidth: 64,
              background: isRight ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1.5px solid ${isRight ? '#22c55e' : '#ef4444'}`,
              color: isRight ? '#16a34a' : '#dc2626',
            }}
          >
            {picked ?? ' '}
          </span>
        );
      })}
      {!blanks.every(b => fills[String(b.id)] && b.answer?.toLowerCase().trim() === fills[String(b.id)].toLowerCase().trim()) && (
        <span className="block text-xs font-semibold mt-3" style={{ color: '#78716c' }}>
          Correct: {blanks.map(b => b.answer).filter(Boolean).join(', ')}
        </span>
      )}
    </p>
  );
}

function McqClusterReview({ payload, answerPayload }: { payload: RawPayload; answerPayload: unknown }) {
  const answers = strMap((answerPayload as { answers?: unknown } | undefined)?.answers);
  const subs = payload.sub_questions ?? [];
  return (
    <div className="flex flex-col gap-4">
      {payload.scenario && <ContextBox text={payload.scenario} />}
      {subs.map((s, idx) => (
        <div key={s.id} className="flex flex-col gap-2">
          <p className="font-bold text-sm" style={{ color: '#1c1917' }}>{idx + 1}. {s.prompt}</p>
          <div className="flex flex-col gap-2">
            {s.options.map(o => (
              <GradedOption key={o.id} id={o.id} text={o.text} isCorrectOption={!!o.correct} isPicked={answers[s.id] === o.id} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EvidenceHuntReview({ payload, answerPayload }: { payload: RawPayload; answerPayload: unknown }) {
  const picked = str((answerPayload as { sentenceId?: unknown } | undefined)?.sentenceId);
  const sentences = payload.sentence_options ?? [];
  return (
    <div className="flex flex-col gap-4">
      {payload.data_context && <ContextBox text={payload.data_context} />}
      <div className="flex flex-col gap-2.5">
        {sentences.map(s => (
          <GradedOption key={s.id} id={s.id} text={s.text}
            isCorrectOption={s.id === payload.correct_sentence_id} isPicked={picked === s.id} />
        ))}
      </div>
    </div>
  );
}

const OPTION_TYPES = new Set([
  'MCQ', 'STORY_MCQ', 'HOTS_MCQ', 'CONTEXT_CLUE', 'ASSERTION_REASON', 'CONCLUSION_DRAW',
]);

// QuestionBody dispatches to the right graded renderer when a v12 payload with
// answer keys is available; falls back to the flat text + free-answer card
// (open-production types, or legacy pre-v12 questions) otherwise.
function QuestionBody({ item }: { item: SessionReviewAnswer }) {
  const payload = asRawPayload(item.payload);
  const hasPayload = item.payload && Object.keys(item.payload).length > 0;
  const type = item.questionType;

  if (hasPayload) {
    if (OPTION_TYPES.has(type)) {
      return <><Prompt kicker="Pick the right one" text={payload.prompt ?? item.questionText} /><MCQReview payload={payload} answerPayload={item.answerPayload} /></>;
    }
    switch (type) {
      case 'SPOT_IT':
        return <><Prompt kicker="Spot the mistake" text={payload.prompt ?? item.questionText} /><SpotItReview payload={payload} answerPayload={item.answerPayload} /></>;
      case 'TRUE_FALSE_WHY':
        return <TrueFalseWhyReview payload={payload} answerPayload={item.answerPayload} />;
      case 'PREDICT_JUSTIFY':
        return <PredictJustifyReview payload={payload} answerPayload={item.answerPayload} />;
      case 'CLASSIFY':
        return <><Prompt kicker="Sort each one" text={payload.prompt ?? item.questionText} /><ClassifyReview payload={payload} answerPayload={item.answerPayload} /></>;
      case 'MATCH':
        return <><Prompt kicker="Match the pairs" text={payload.prompt ?? item.questionText} /><MatchReview payload={payload} answerPayload={item.answerPayload} /></>;
      case 'SEQUENCE':
        return <><Prompt kicker="Put them in order" text={payload.prompt ?? item.questionText} /><SequenceReview payload={payload} answerPayload={item.answerPayload} /></>;
      case 'CLOZE':
        return <><Prompt kicker="Fill the blanks" text={payload.prompt ?? item.questionText} /><ClozeReview payload={payload} answerPayload={item.answerPayload} /></>;
      case 'MCQ_CLUSTER':
        return <McqClusterReview payload={payload} answerPayload={item.answerPayload} />;
      case 'EVIDENCE_HUNT':
        return <><Prompt kicker="Find the evidence" text={payload.prompt ?? item.questionText} /><EvidenceHuntReview payload={payload} answerPayload={item.answerPayload} /></>;
      default:
        break; // open-production v12 types fall through to the free-text card below
    }
  }

  // Free-text answer (blurt / descriptive / feynman / fix_it / produce_it / …)
  // or a legacy question with no payload at all.
  return (
    <div className="flex flex-col gap-3">
      <Prompt text={payload.prompt ?? item.questionText} />
      {item.studentAnswer && (
        <div className="rounded-lg px-3 py-2" style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.07)' }}>
          <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#a8a29e' }}>Your answer</div>
          <p className="text-xs leading-relaxed italic whitespace-pre-wrap" style={{ color: '#44403c' }}>
            &ldquo;{item.studentAnswer}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}

// ── AI feedback reveal ────────────────────────────────────────────────────────

function FeedbackReveal({ item }: { item: SessionReviewAnswer }) {
  const [open, setOpen] = useState(false);
  const hasFeedback = Boolean(item.feedback || item.correctAnswer || item.answerGuide || item.explanation);
  if (!hasFeedback) return null;
  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full rounded-lg px-3 py-2.5 text-xs font-bold text-left flex items-center gap-1.5"
        style={{ background: 'rgba(124,58,237,0.08)', color: '#7c3aed' }}
      >
        🤖 {open ? 'Hide AI feedback' : 'Show AI feedback'}
      </button>
      {open && (
        <div className="rounded-lg px-3 py-3 space-y-2" style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.2)' }}>
          {item.feedback && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#7c3aed' }}>Feedback</div>
              <p className="text-xs leading-relaxed" style={{ color: '#1c1917' }}>{item.feedback}</p>
            </div>
          )}
          {item.correctAnswer && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#7c3aed' }}>Correct answer</div>
              <p className="text-xs font-semibold" style={{ color: '#1c1917' }}>{item.correctAnswer}</p>
            </div>
          )}
          {item.answerGuide && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#7c3aed' }}>Strong answer guide</div>
              <p className="text-xs leading-relaxed" style={{ color: '#1c1917' }}>{item.answerGuide}</p>
            </div>
          )}
          {item.explanation && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#7c3aed' }}>Why</div>
              <p className="text-xs leading-relaxed" style={{ color: '#1c1917' }}>{item.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Carousel shell ────────────────────────────────────────────────────────────

function ResultDots({ answers, active, onJump }: { answers: SessionReviewAnswer[]; active: number; onJump: (i: number) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Question results">
      {answers.map((item, i) => {
        const color = scoreColorFor(item);
        const isActive = i === active;
        return (
          <button
            key={item.questionId}
            onClick={() => onJump(i)}
            title={`Question ${i + 1}`}
            aria-label={`Go to question ${i + 1}`}
            aria-current={isActive}
            className="rounded-full text-[9px] font-bold flex items-center justify-center flex-none transition-all"
            style={{
              width: isActive ? 22 : 18,
              height: isActive ? 22 : 18,
              background: isActive ? color : `${color}22`,
              border: `1.5px solid ${color}`,
              color: isActive ? '#fff' : color,
            }}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}

export function ReviewCarousel({ review }: { review: SessionReview }) {
  const [index, setIndex] = useState(0);
  const total = review.answers.length;
  const item = review.answers[index];
  if (!item) return null;
  const scoreColor = scoreColorFor(item);

  return (
    <div className="w-full text-left flex flex-col gap-3">
      {total > 1 && <ResultDots answers={review.answers} active={index} onJump={setIndex} />}

      <div className="rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${scoreColor}30`, background: 'rgba(255,255,255,0.75)' }}>
        <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: `${scoreColor}10`, borderBottom: `1px solid ${scoreColor}20` }}>
          <span className="text-[11px] font-bold" style={{ color: '#a8a29e' }}>Question {index + 1} of {total}</span>
          <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
            style={{ background: scoreColor, color: '#fff' }}>
            {item.isCorrect === false || (item.score ?? 1) < 0.45 ? '✕' : '✓'}
          </span>
        </div>
        <div className="p-4 flex flex-col gap-4">
          <QuestionBody item={item} />
          <FeedbackReveal item={item} />
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setIndex(i => Math.max(0, i - 1))}
          disabled={index === 0}
          className="flex-1 py-2.5 rounded-xl font-bold text-sm disabled:opacity-30"
          style={{ background: 'rgba(0,0,0,0.04)', color: '#44403c' }}
        >
          ← Prev
        </button>
        <button
          onClick={() => setIndex(i => Math.min(total - 1, i + 1))}
          disabled={index === total - 1}
          className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-30"
          style={{ background: COLORS.indigo }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
