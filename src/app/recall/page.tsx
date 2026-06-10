'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GridBackground } from '@/components/GridBackground';
import { LeftRail } from '@/components/LeftRail';
import { COLORS, subjectDisplay } from '@/lib/tokens';
import { fetchToday, type ApiTodayItem } from '@/lib/api';
import { assessmentHref, assessmentReturn } from '@/lib/navigation';

interface ReviseCompletion {
  conceptId: string;
  conceptName: string;
  completedAt: string;
}

function dueLabel(nextDueAt?: string) {
  if (!nextDueAt) return 'Due today';
  const due = new Date(nextDueAt);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const days = Math.max(0, Math.floor((today.getTime() - due.getTime()) / 86_400_000));
  return days === 0 ? 'Due today' : `${days} ${days === 1 ? 'day' : 'days'} overdue`;
}

function futureLabel(nextDueAt: string) {
  const due = new Date(nextDueAt);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const days = Math.max(1, Math.round((due.getTime() - today.getTime()) / 86_400_000));
  return `in ${days} ${days === 1 ? 'day' : 'days'}`;
}

function formatDueDate(nextDueAt: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(nextDueAt));
}

function ReviseQueue() {
  const router = useRouter();
  const [items, setItems] = useState<ApiTodayItem[] | null>(null);
  const [upcoming, setUpcoming] = useState<ApiTodayItem[]>([]);
  const [completion] = useState<ReviseCompletion | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = sessionStorage.getItem('brainmaps:revise-completed');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    sessionStorage.removeItem('brainmaps:revise-completed');

    fetchToday()
      .then(t => {
        setItems(t.reviseQueue);
        setUpcoming(t.upcomingReviseQueue);
      })
      .catch(() => {
        setItems([]);
        setUpcoming([]);
      });
  }, []);

  function start(item: ApiTodayItem) {
    router.push(assessmentHref('/sharpen', {
      conceptId: item.id,
      level: 'revise',
    }, '/recall'));
  }

  const completionItem = completion
    ? upcoming.find(item => item.id === completion.conceptId)
    : undefined;
  const upcomingBySubject = upcoming.reduce<Record<string, ApiTodayItem[]>>((groups, item) => {
    (groups[item.subjectKey] ??= []).push(item);
    return groups;
  }, {});

  return (
    <div className="relative flex h-screen overflow-hidden" style={{ background: '#F4EFE5' }}>
      <GridBackground />
      <LeftRail />
      <main className="flex-1 overflow-y-auto flex items-start justify-center py-10">
        <div className="w-full max-w-xl px-6">
          <div className="mb-1 text-xs font-bold tracking-widest" style={{ color: COLORS.strong }}>
            🔄 REVISE
          </div>
          <h1 className="text-3xl font-extrabold" style={{ color: '#1c1917' }}>
            {items === null
              ? 'Loading your revisions…'
              : items.length === 0
                ? 'All caught up ✨'
                : `${items.length} ${items.length === 1 ? 'concept' : 'concepts'} due`}
          </h1>
          <p className="text-sm mt-1 mb-5" style={{ color: '#78716c' }}>
            {items && items.length > 0
              ? 'Only concepts scheduled for review today appear here.'
              : items?.length === 0
                ? 'Nothing is scheduled for revision today. We will bring concepts back before they fade.'
                : ''}
          </p>

          {completion && (
            <div
              className="rounded-2xl px-5 py-4 mb-5"
              style={{ background: `${COLORS.strong}12`, border: `1px solid ${COLORS.strong}45` }}
            >
              <div className="font-extrabold text-sm" style={{ color: '#166534' }}>
                ✓ {completion.conceptName} revised
              </div>
              <div className="text-xs mt-1" style={{ color: '#4d7c0f' }}>
                {completionItem?.reviseSchedule?.nextDueAt
                  ? `Next review: ${formatDueDate(completionItem.reviseSchedule.nextDueAt)} · ${futureLabel(completionItem.reviseSchedule.nextDueAt)}`
                  : 'Your next review has been scheduled.'}
              </div>
            </div>
          )}

          {items && items.length > 0 && (
            <div className="text-xs font-extrabold tracking-wider mb-2" style={{ color: '#78716c' }}>
              DUE TODAY
            </div>
          )}

          {items && items.length > 0 && (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.08)' }}
            >
              {items.map((item, index) => {
                const subject = subjectDisplay(
                  item.subjectKey.startsWith('english') ? 'english' : item.subjectKey,
                );
                const schedule = item.reviseSchedule;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => start(item)}
                    className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-black/[0.03]"
                    style={{ borderTop: index === 0 ? 'none' : '1px solid rgba(0,0,0,0.06)' }}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ background: subject.color }}
                    >
                      {subject.label.startsWith('Social') ? 'SS' : subject.label.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm" style={{ color: '#1c1917' }}>{item.name}</div>
                      <div className="text-xs" style={{ color: '#78716c' }}>{subject.label}</div>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <span
                          className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                          style={{ color: '#16a34a', background: `${COLORS.strong}16` }}
                        >
                          {schedule ? `Day ${schedule.intervalDays} review` : 'Scheduled review'}
                        </span>
                        <span className="text-[11px] font-semibold" style={{ color: COLORS.weak }}>
                          {dueLabel(schedule?.nextDueAt)}
                        </span>
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
              type="button"
              onClick={() => start(items[0])}
              className="w-full mt-4 py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: COLORS.strong, boxShadow: '0 4px 16px rgba(34,197,94,0.3)' }}
            >
              Start revising →
            </button>
          )}

          {items && upcoming.length > 0 && (
            <section className="mt-8">
              <div className="mb-3">
                <div className="text-xs font-extrabold tracking-wider" style={{ color: '#78716c' }}>
                  COMING UP
                </div>
                <p className="text-xs mt-1" style={{ color: '#a8a29e' }}>
                  Future reviews are grouped by subject. They will move to Due today automatically.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {Object.entries(upcomingBySubject).map(([subjectKey, subjectItems]) => {
                  const subject = subjectDisplay(
                    subjectKey.startsWith('english') ? 'english' : subjectKey,
                  );
                  return (
                    <div
                      key={subjectKey}
                      className="rounded-2xl overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(0,0,0,0.07)' }}
                    >
                      <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: subject.color }} />
                        <span className="text-xs font-extrabold" style={{ color: '#44403c' }}>{subject.label}</span>
                        <span className="text-[11px] ml-auto" style={{ color: '#a8a29e' }}>
                          {subjectItems.length} scheduled
                        </span>
                      </div>
                      {subjectItems.map((item, index) => {
                        const nextDueAt = item.reviseSchedule?.nextDueAt;
                        return (
                          <div
                            key={item.id}
                            className="px-5 py-3.5 flex items-center gap-3"
                            style={{ borderTop: index === 0 ? 'none' : '1px solid rgba(0,0,0,0.05)' }}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-sm truncate" style={{ color: '#1c1917' }}>{item.name}</div>
                              <div className="text-[11px] mt-0.5" style={{ color: '#a8a29e' }}>
                                Day {item.reviseSchedule?.intervalDays ?? '—'} review
                              </div>
                            </div>
                            {nextDueAt && (
                              <div className="text-right flex-shrink-0">
                                <div className="text-xs font-bold" style={{ color: '#44403c' }}>{formatDueDate(nextDueAt)}</div>
                                <div className="text-[11px]" style={{ color: '#78716c' }}>{futureLabel(nextDueAt)}</div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <button
            type="button"
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

function RecallRoute() {
  const router = useRouter();
  const params = useSearchParams();
  const conceptId = params.get('conceptId');
  const returnTarget = assessmentReturn(params.get('returnTo'), '/recall');

  useEffect(() => {
    if (!conceptId) return;
    router.replace(assessmentHref('/sharpen', {
      conceptId,
      level: 'revise',
    }, returnTarget.href));
  }, [conceptId, returnTarget.href, router]);

  if (conceptId) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: '#F4EFE5' }}>
        <div className="text-sm" style={{ color: '#78716c' }}>Opening revision…</div>
      </div>
    );
  }
  return <ReviseQueue />;
}

export default function RecallPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center" style={{ background: '#F4EFE5' }}>
        <div className="text-sm" style={{ color: '#78716c' }}>Loading…</div>
      </div>
    }>
      <RecallRoute />
    </Suspense>
  );
}
