'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GridBackground } from '@/components/GridBackground';
import { LeftRail } from '@/components/LeftRail';
import { COLORS, subjectDisplay } from '@/lib/tokens';
import { fetchToday, type ApiTodayItem } from '@/lib/api';
import { assessmentHref, assessmentReturn } from '@/lib/navigation';

function dueLabel(nextDueAt?: string) {
  if (!nextDueAt) return 'Due today';
  const due = new Date(nextDueAt);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const days = Math.max(0, Math.floor((today.getTime() - due.getTime()) / 86_400_000));
  return days === 0 ? 'Due today' : `${days} ${days === 1 ? 'day' : 'days'} overdue`;
}

function ReviseQueue() {
  const router = useRouter();
  const [items, setItems] = useState<ApiTodayItem[] | null>(null);

  useEffect(() => {
    fetchToday().then(t => setItems(t.reviseQueue)).catch(() => setItems([]));
  }, []);

  function start(item: ApiTodayItem) {
    router.push(assessmentHref('/sharpen', {
      conceptId: item.id,
      level: 'revise',
    }, '/recall'));
  }

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
