'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GridBackground } from '@/components/GridBackground';
import { LeftRail } from '@/components/LeftRail';
import { ReviewCarousel } from '@/components/ReviewCarousel';
import { COLORS, STATION_LABELS } from '@/lib/tokens';
import type { QuestionLevel } from '@/types';
import {
  fetchConcept, listConceptSessions, getSessionReportById,
  type PastSession, type SessionReview, type ApiConceptDetail,
} from '@/lib/api';

const LEVEL_LABEL: Record<string, string> = {
  level1: STATION_LABELS.learn_it,
  level2: STATION_LABELS.get_it,
  level3: STATION_LABELS.master_it,
  strengthen: STATION_LABELS.strengthen,
  revise: STATION_LABELS.keep_it_fresh,
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Attempt';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ReportsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const conceptId = params.get('conceptId');
  const level = (params.get('level') as QuestionLevel | null) ?? null;
  const returnTo = params.get('returnTo') || (conceptId ? `/brain-map?conceptId=${conceptId}` : '/brain-map');

  const [concept, setConcept] = useState<ApiConceptDetail | null>(null);
  const [sessions, setSessions] = useState<PastSession[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [review, setReview] = useState<SessionReview | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    if (!conceptId) return;
    fetchConcept(conceptId).then(setConcept).catch(() => {});
    listConceptSessions(conceptId, level ?? undefined)
      .then(setSessions)
      .catch(() => setSessions([]));
  }, [conceptId, level]);

  async function toggle(sessionId: string) {
    if (openId === sessionId) {
      setOpenId(null);
      return;
    }
    setOpenId(sessionId);
    setReview(null);
    setReviewError('');
    setReviewLoading(true);
    try {
      setReview(await getSessionReportById(sessionId));
    } catch {
      setReviewError('Report could not be loaded. Please try again.');
    } finally {
      setReviewLoading(false);
    }
  }

  const levelLabel = level ? LEVEL_LABEL[level] ?? level : null;

  return (
    <div className="relative flex flex-col lg:flex-row min-h-[100dvh] lg:h-screen lg:overflow-hidden" style={{ background: '#F4EFE5' }}>
      <GridBackground />
      <LeftRail />
      <main className="flex-1 lg:overflow-y-auto flex items-start justify-center py-6 lg:py-10 pb-24 lg:pb-10">
        <div className="w-full max-w-xl px-4 lg:px-6">
          <button
            onClick={() => router.push(returnTo)}
            className="text-sm font-bold mb-4"
            style={{ color: '#78716c' }}
          >
            ← Back
          </button>

          <div className="mb-1 text-xs font-bold tracking-widest" style={{ color: COLORS.indigo }}>📄 PREVIOUS REPORTS</div>
          <h1 className="text-2xl font-extrabold" style={{ color: '#1c1917' }}>
            {concept?.name ?? 'This concept'}
          </h1>
          <p className="text-sm mt-1 mb-5" style={{ color: '#78716c' }}>
            {levelLabel ? <>Every attempt at <strong>{levelLabel}</strong>, newest first. Tap one to see the full answer review.</>
              : 'Every attempt, newest first. Tap one to see the full answer review.'}
          </p>

          {sessions === null && (
            <p className="text-sm" style={{ color: '#a8a29e' }}>Loading your attempts…</p>
          )}
          {sessions?.length === 0 && (
            <p className="text-sm" style={{ color: '#a8a29e' }}>No attempts recorded yet.</p>
          )}

          <div className="flex flex-col gap-3">
            {sessions?.map((s, i) => {
              const open = openId === s.sessionId;
              const pct = Math.round(s.score * 100);
              return (
                <div
                  key={s.sessionId}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(0,0,0,0.08)' }}
                >
                  <button
                    onClick={() => toggle(s.sessionId)}
                    className="w-full flex items-center justify-between px-4 py-3 font-bold text-sm"
                    style={{ color: '#44403c' }}
                  >
                    <span>
                      {formatDate(s.completedAt)}
                      {i === 0 && <span style={{ color: COLORS.indigo }}> · Latest</span>}
                    </span>
                    <span className="flex items-center gap-2">
                      <span style={{ color: pct >= 60 ? '#16a34a' : '#f97316' }}>{pct}%</span>
                      <span style={{ color: '#a8a29e' }}>{open ? '▲' : '▾'}</span>
                    </span>
                  </button>
                  {open && (
                    <div className="px-3 pb-3">
                      {reviewLoading && (
                        <p className="text-sm px-1 py-2" style={{ color: '#78716c' }}>Loading answers…</p>
                      )}
                      {reviewError && (
                        <p className="text-sm px-1 py-2" style={{ color: '#ef4444' }}>{reviewError}</p>
                      )}
                      {!reviewLoading && !reviewError && review && <ReviewCarousel review={review} />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={null}>
      <ReportsContent />
    </Suspense>
  );
}
