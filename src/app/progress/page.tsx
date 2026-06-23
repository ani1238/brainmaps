'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GridBackground } from '@/components/GridBackground';
import { LeftRail } from '@/components/LeftRail';
import { COLORS, SUBJECT_MAP } from '@/lib/tokens';
import { fetchDashboard, type ApiDashboard } from '@/lib/api';

function heatColor(n: number) {
  if (n === 0) return '#ece5d3';
  if (n <= 1) return '#e0e7ff';
  if (n <= 3) return '#a5b4fc';
  if (n <= 5) return '#6366f1';
  return '#4F46E5';
}

function subjectMeta(key: string) {
  return SUBJECT_MAP[key] ?? { label: key, letter: '?', color: COLORS.science, icon: '📘' };
}

export default function ProgressPage() {
  const [dash, setDash] = useState<ApiDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard().then(setDash).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const streak = dash?.streak;
  const activity = dash?.activity ?? [];

  return (
    <div className="relative flex flex-col lg:flex-row min-h-[100dvh] lg:h-screen lg:overflow-hidden" style={{ background: '#F4EFE5' }}>
      <GridBackground />
      <LeftRail />

      <main className="relative flex-1 lg:overflow-y-auto px-4 lg:px-8 py-4 lg:py-6 pb-24 lg:pb-6 flex flex-col gap-5">
        <div>
          <h1 className="text-3xl font-extrabold" style={{ color: '#1c1917' }}>My Progress 📈</h1>
          <p className="text-sm mt-1" style={{ color: '#78716c' }}>Everything you&apos;ve been building, in one place.</p>
        </div>

        {/* ── Parent report entry (PIN-gated) ── */}
        <Link
          href="/report"
          className="rounded-2xl p-5 flex items-center justify-between gap-4 transition-all hover:opacity-90"
          style={{ background: 'rgba(79,70,229,0.07)', border: '1px solid rgba(79,70,229,0.25)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl">🔒</span>
            <div className="min-w-0">
              <div className="font-bold text-base" style={{ color: '#1c1917' }}>Parent Report</div>
              <div className="text-xs" style={{ color: '#78716c' }}>An AI summary of effort, progress &amp; what to focus on — PIN-protected for you.</div>
            </div>
          </div>
          <span className="text-lg font-extrabold flex-shrink-0" style={{ color: COLORS.indigo }}>→</span>
        </Link>

        {/* ── Streak card ── */}
        <section
          className="rounded-2xl p-5 lg:p-6 flex flex-wrap items-center gap-4 lg:gap-5"
          style={{ background: 'rgba(255,248,245,0.9)', border: '1px solid rgba(255,107,53,0.3)', backdropFilter: 'blur(12px)' }}
        >
          <div className="text-5xl lg:text-6xl">🔥</div>
          <div>
            <div className="text-4xl font-extrabold" style={{ color: '#FF6B35' }}>{streak?.days ?? 0} days</div>
            <div className="text-sm" style={{ color: '#78716c' }}>{(streak?.days ?? 0) > 0 ? 'in a row!' : 'Start a session today to begin a streak.'}</div>
            <div className="text-xs mt-0.5" style={{ color: '#a8a29e' }}>Best: {streak?.best ?? 0} days</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-lg font-extrabold" style={{ color: '#44403c' }}>{streak?.activeDays ?? 0} / 30</div>
            <div className="text-xs" style={{ color: '#a8a29e' }}>active days this month</div>
          </div>
        </section>

        {/* ── Last 30 days heatmap ── */}
        <section className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(0,0,0,0.08)', backdropFilter: 'blur(12px)' }}>
          <div className="text-sm font-bold mb-3" style={{ color: '#1c1917' }}>Last 30 days</div>
          <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(15, 1fr)' }}>
            {activity.map((a, i) => (
              <div
                key={i}
                title={`${a.date}: ${a.sessions} session${a.sessions === 1 ? '' : 's'}`}
                className="aspect-square rounded"
                style={{ background: heatColor(a.sessions), border: '1px solid rgba(0,0,0,0.08)' }}
              />
            ))}
          </div>
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs" style={{ color: '#78716c' }}>{streak?.activeDays ?? 0} of 30 days 💪</span>
            <div className="flex items-center gap-1">
              <span className="text-xs" style={{ color: '#78716c' }}>less</span>
              {[0, 1, 3, 5, 6].map(v => (
                <div key={v} className="w-3 h-3 rounded" style={{ background: heatColor(v), border: '1px solid rgba(0,0,0,0.08)' }} />
              ))}
              <span className="text-xs" style={{ color: '#78716c' }}>more</span>
            </div>
          </div>
        </section>

        {/* ── By subject ── */}
        <section className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(0,0,0,0.08)', backdropFilter: 'blur(12px)' }}>
          <div className="text-sm font-bold mb-3" style={{ color: '#1c1917' }}>By subject</div>
          <div className="flex flex-col gap-3">
            {(dash?.subjects ?? []).map(s => {
              const meta = subjectMeta(s.key);
              return (
                <div key={s.key} className="flex items-center gap-3">
                  <div className="text-lg w-7 text-center flex-shrink-0">{meta.icon}</div>
                  <div className="text-sm font-semibold w-20 lg:w-32 flex-shrink-0 truncate" style={{ color: '#1c1917' }}>{meta.label}</div>
                  <div className="flex-1 min-w-0 h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
                    <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: meta.color }} />
                  </div>
                  <div className="text-[11px] lg:text-xs font-bold w-16 lg:w-24 text-right flex-shrink-0" style={{ color: '#78716c' }}>
                    {s.strong}/{s.total} · {s.pct}%
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── This week: improving / needs attention ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
          <section className="rounded-2xl p-5" style={{ background: 'rgba(225,245,238,0.7)', border: '1px solid rgba(29,158,117,0.25)' }}>
            <div className="text-xs font-bold mb-3" style={{ color: COLORS.strong }}>Improving 📈</div>
            {(dash?.improving.length ?? 0) === 0 ? (
              <p className="text-sm italic" style={{ color: '#a8a29e' }}>Keep practising — improvements will show up here.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {dash!.improving.map(c => (
                  <div key={c.conceptId} className="flex items-center gap-2">
                    <span style={{ color: COLORS.strong }}>●</span>
                    <span className="flex-1 text-sm font-semibold truncate" style={{ color: '#1c1917' }}>{c.name}</span>
                    <span className="text-[11px] font-mono font-bold" style={{ color: COLORS.strong }}>+{c.delta.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl p-5" style={{ background: 'rgba(250,238,218,0.7)', border: '1px solid rgba(239,159,39,0.3)' }}>
            <div className="text-xs font-bold mb-3" style={{ color: COLORS.developing }}>Needs attention ⚠️</div>
            {(dash?.needsAttention.length ?? 0) === 0 ? (
              <p className="text-sm italic" style={{ color: '#a8a29e' }}>Nothing flagged — nice work!</p>
            ) : (
              <div className="flex flex-col gap-2">
                {dash!.needsAttention.map(c => (
                  <Link
                    key={c.conceptId}
                    href={`/brain-map?conceptId=${encodeURIComponent(c.conceptId)}`}
                    className="flex flex-col hover:opacity-80"
                  >
                    <span className="text-sm font-semibold truncate" style={{ color: '#1c1917' }}>{c.name}</span>
                    <span className="text-[11px]" style={{ color: '#a8a29e' }}>{c.note}</span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {loading && <div className="text-center text-sm" style={{ color: '#a8a29e' }}>Loading your progress…</div>}
      </main>
    </div>
  );
}
