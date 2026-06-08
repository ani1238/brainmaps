'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GridBackground } from '@/components/GridBackground';
import { LeftRail } from '@/components/LeftRail';
import { QuestionScreen } from '@/components/QuestionScreen';
import { COLORS, SUBJECTS } from '@/lib/tokens';
import { RECALL_QUESTIONS, RECALL_CONCEPT_INFO as QUEUE_INFO, CONCEPT_BY_ID, CONCEPT_RECALL_IDX, CHAPTER_DATA } from '@/data/dummy';
import { fetchConcept, fetchQuestions, type ApiConceptDetail } from '@/lib/api';
import type { Question } from '@/types';

// Generic active recall question for concepts that don't have a specific one
function makeGenericRecall(conceptName: string): Question {
  return {
    id: `ar_${conceptName}`,
    type: 'ACTIVE_RECALL',
    text: `Your teacher asks: "Give me a real-world situation where ${conceptName} would explain something you can see or experience."\n\nDescribe the situation and use what you know to explain it — don't just define the term.`,
  };
}

function RecallContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conceptId = searchParams.get('conceptId');

  // ── Single-concept mode (from sharpen completion) ──────────────────────────
  if (conceptId) {
    return <SingleConceptRecall conceptId={conceptId} />;
  }

  // ── Full queue mode (from dashboard / brain map bottom CTA) ───────────────
  return <QueueRecall />;
}

function SingleConceptRecall({ conceptId }: { conceptId: string }) {
  const router = useRouter();
  const [finished, setFinished] = useState(false);

  // Local demo concept (only the old c1xx/s2xx IDs live here)
  const localConcept = CONCEPT_BY_ID[conceptId];

  // Real concept + revise question fetched from the DB
  const [apiConcept, setApiConcept] = useState<ApiConceptDetail | null>(null);
  const [apiQuestion, setApiQuestion] = useState<Question | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchConcept(conceptId)
      .then(c => { if (!cancelled) setApiConcept(c); })
      .catch(() => {});
    fetchQuestions(conceptId, 'revise')
      .then(qs => { if (!cancelled && qs.length > 0) setApiQuestion(qs[0]); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [conceptId]);

  // ── Display fields: prefer the live DB concept, then local demo data ──────
  const conceptName = apiConcept?.name ?? localConcept?.name ?? 'this concept';
  const subjectKey  = apiConcept?.subjectKey ?? localConcept?.subjectKey ?? 'science';
  const subject     = SUBJECTS.find(s => s.key === subjectKey);
  const chapterName = apiConcept?.chapterName
    ?? CHAPTER_DATA[localConcept?.subjectKey ?? '']?.find(ch => ch.id === localConcept?.chapterId)?.name
    ?? 'Chapter';

  const recallIdx = CONCEPT_RECALL_IDX[conceptId];
  const question: Question = apiQuestion
    ?? (recallIdx !== undefined ? RECALL_QUESTIONS[recallIdx] : makeGenericRecall(conceptName));

  if (finished) {
    return (
      <div className="relative flex h-screen overflow-hidden" style={{ background: '#F4EFE5' }}>
        <GridBackground />
        <LeftRail />
        <main className="flex-1 flex items-center justify-center">
          <div
            className="text-center p-10 rounded-3xl max-w-md"
            style={{
              background: 'rgba(255,255,255,0.75)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.8)',
            }}
          >
            <div className="text-5xl mb-4">⚡</div>
            <h2 className="text-2xl font-extrabold mb-2" style={{ color: '#1c1917' }}>Nailed it! ⚡</h2>
            <p className="text-sm mb-2" style={{ color: '#78716c' }}>
              <strong style={{ color: '#1c1917' }}>{conceptName}</strong>
            </p>
            <p className="text-sm mb-6" style={{ color: '#78716c' }}>
              Great work! You won't see this one again for 3 weeks ✨
            </p>
            <button
              onClick={() => router.push('/brain-map')}
              className="px-6 py-3 rounded-xl font-bold text-sm text-white"
              style={{ background: COLORS.strong }}
            >
              ← Back to Brain Map
            </button>
          </div>
        </main>
      </div>
    );
  }

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
            <div className="text-xs font-bold mb-1" style={{ color: subject?.color ?? COLORS.science }}>
              {subject?.label ?? 'Science'} · Test yourself 🎯
            </div>
            <h2 className="text-xl font-extrabold mb-3" style={{ color: '#1c1917' }}>{conceptName}</h2>

            <div
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold mb-5"
              style={{
                background: `${COLORS.strong}15`,
                border: `1.5px solid ${COLORS.strong}55`,
                color: '#16a34a',
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: COLORS.strong }} />
              Got it! · Time to check
            </div>

            <div className="text-xs font-bold mb-2" style={{ color: '#78716c' }}>What you'll do</div>
            <p className="text-sm leading-relaxed" style={{ color: '#44403c' }}>
              Use what you know in a brand-new situation. Nail this and you won't see it again for 3 weeks ✨
            </p>
          </div>

          <div>
            <div className="text-xs font-bold mb-2" style={{ color: '#78716c' }}>Chapter</div>
            <div className="text-sm font-semibold" style={{ color: '#44403c' }}>{chapterName}</div>
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
              conceptName={conceptName}
              chapterName="Active Recall · Step 2"
              subjectName={subject?.label ?? 'Science'}
              subjectColor={subject?.color ?? COLORS.science}
              current={0}
              total={1}
              onNext={() => setFinished(true)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function QueueRecall() {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [finished, setFinished] = useState(false);

  function handleNext() {
    if (currentIdx < RECALL_QUESTIONS.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      setFinished(true);
    }
  }

  const info = QUEUE_INFO[currentIdx];

  if (finished) {
    return (
      <div className="relative flex h-screen overflow-hidden" style={{ background: '#F4EFE5' }}>
        <GridBackground />
        <LeftRail />
        <main className="flex-1 flex items-center justify-center">
          <div
            className="text-center p-10 rounded-3xl max-w-md"
            style={{
              background: 'rgba(255,255,255,0.75)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.8)',
            }}
          >
            <div className="text-5xl mb-4">⚡</div>
            <h2 className="text-2xl font-extrabold mb-2" style={{ color: '#1c1917' }}>All done! ⚡</h2>
            <p className="text-sm mb-6" style={{ color: '#78716c' }}>
              You checked 3 things you already learned. Way to keep your brain sharp! 🧠✨
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 rounded-xl font-bold text-sm text-white"
              style={{ background: COLORS.strong }}
            >
              Back to Home
            </button>
          </div>
        </main>
      </div>
    );
  }

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
            <div className="text-xs font-bold mb-1" style={{ color: info.color }}>
              {info.subject} · Test yourself 🎯
            </div>
            <h2 className="text-xl font-extrabold mb-3" style={{ color: '#1c1917' }}>{info.name}</h2>

            <div
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold mb-5"
              style={{
                background: `${COLORS.strong}15`,
                border: `1.5px solid ${COLORS.strong}55`,
                color: '#16a34a',
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: COLORS.strong }} />
              Got it! · Time to check
            </div>

            <div className="text-xs font-bold mb-2" style={{ color: '#78716c' }}>What you'll do</div>
            <p className="text-sm leading-relaxed" style={{ color: '#44403c' }}>
              Use what you know in a brand-new situation. Nail this and you won't see it again for 3 weeks ✨
            </p>
          </div>

          <div>
            <div className="text-xs font-bold mb-2" style={{ color: '#78716c' }}>Today's checks</div>
            <div className="flex flex-col gap-2">
              {QUEUE_INFO.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: i === currentIdx ? `${COLORS.indigo}10` : 'transparent',
                    border: `1px solid ${i === currentIdx ? COLORS.indigo + '44' : 'transparent'}`,
                  }}
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                    style={{ background: c.color }}
                  >
                    {i + 1}
                  </span>
                  <span className={`font-semibold ${i < currentIdx ? 'line-through opacity-50' : ''}`} style={{ color: '#1c1917' }}>
                    {c.name}
                  </span>
                  {i < currentIdx && <span className="ml-auto text-xs" style={{ color: COLORS.strong }}>✓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: question panel */}
        <div className="flex-1 flex items-stretch">
          <div
            className="w-full max-w-xl mx-auto my-6 rounded-2xl overflow-hidden shadow-xl"
            style={{ border: '1px solid rgba(0,0,0,0.08)' }}
          >
            <QuestionScreen
              question={RECALL_QUESTIONS[currentIdx]}
              conceptName={info.name}
              chapterName="Active Recall · Step 2"
              subjectName={info.subject}
              subjectColor={info.color}
              current={currentIdx}
              total={RECALL_QUESTIONS.length}
              onNext={handleNext}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function RecallPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center" style={{ background: '#F4EFE5' }}>
        <div className="text-sm" style={{ color: '#78716c' }}>Loading…</div>
      </div>
    }>
      <RecallContent />
    </Suspense>
  );
}
