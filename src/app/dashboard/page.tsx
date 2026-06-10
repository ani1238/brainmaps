'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GridBackground } from '@/components/GridBackground';
import { LeftRail } from '@/components/LeftRail';
import { COLORS, SUBJECT_MAP } from '@/lib/tokens';
import { fetchDashboard, fetchToday, type ApiDashboard, type ApiToday } from '@/lib/api';
import { getProfile } from '@/lib/storage';
import { assessmentHref } from '@/lib/navigation';

function todayLabel() {
  return new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
}

function subjectMeta(key: string) {
  return SUBJECT_MAP[key] ?? { label: key, letter: '?', color: COLORS.science, icon: '📘' };
}

export default function DashboardPage() {
  const router = useRouter();
  const [dash, setDash] = useState<ApiDashboard | null>(null);
  const [today, setToday] = useState<ApiToday | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateLabel, setDateLabel] = useState(''); // client-only → avoids SSR hydration mismatch
  const [studentName, setStudentName] = useState('Student');

  useEffect(() => {
    setDateLabel(todayLabel());
    setStudentName(getProfile()?.name ?? 'Student');
    Promise.all([fetchDashboard(), fetchToday()])
      .then(([d, t]) => { setDash(d); setToday(t); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const m = dash?.mastery;
  const toFix = (m?.weak ?? 0) + (m?.veryWeak ?? 0);
  const fixCount = today?.fixQueue.length ?? 0;
  const reviseCount = today?.reviseQueue.length ?? 0;
  const estMin = Math.max(5, fixCount * 3 + reviseCount * 2);

  // Mastery bar segments
  const segs = m ? [
    { label: 'strong', n: m.strong, c: COLORS.strong },
    { label: 'developing', n: m.developing, c: COLORS.developing },
    { label: 'weak', n: m.weak + m.veryWeak, c: COLORS.weak },
    { label: 'not started', n: m.notStarted, c: COLORS.notStarted },
  ] : [];
  const total = m?.total ?? 1;

  const fixFirst = today?.fixQueue[0];
  const fixFirstSubject = fixFirst ? subjectMeta(fixFirst.subjectKey.startsWith('english') ? 'english' : fixFirst.subjectKey).label : '';

  return (
    <div className="relative flex h-screen overflow-hidden" style={{ background: '#F4EFE5' }}>
      <GridBackground />
      <LeftRail sharpenCount={fixCount} recallCount={reviseCount} streak={dash?.streak.days ?? 0} />

      <main className="relative flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-5">

        {/* ── Header: greeting + mastery health bar ── */}
        <section
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.7)' }}
        >
          <div className="flex justify-between items-start gap-6 mb-4">
            <div>
              <div className="text-xs font-bold mb-0.5" style={{ color: '#78716c' }}>{dateLabel}</div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <h1 className="text-3xl font-extrabold leading-none" style={{ color: '#1c1917' }}>Hi {studentName}! 👋</h1>
                <span className="text-sm" style={{ color: '#78716c' }}>About {estMin} minutes today</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs font-bold mb-0.5" style={{ color: '#78716c' }}>Streak</div>
              <div className="text-4xl font-extrabold">{dash?.streak.days ?? 0} 🔥</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="text-xs font-bold" style={{ color: '#78716c' }}>Your brain today</div>
              <div className="text-xs" style={{ color: '#78716c' }}>{total} things you're learning</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex h-4 rounded-full overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.1)' }}>
                {segs.map(s => (
                  <div key={s.label} title={`${s.label} · ${s.n}`} style={{ width: `${(s.n / total) * 100}%`, background: s.c }} />
                ))}
              </div>
              <p className="text-sm mt-1.5" style={{ color: '#44403c' }}>
                <strong style={{ color: COLORS.strong }}>{m?.strong ?? 0} got it! 🎉</strong>
                {' · '}
                <strong style={{ color: COLORS.weak }}>{toFix} to fix ✨</strong>
                {' · '}
                <span style={{ color: '#78716c' }}>{m?.notStarted ?? 0} brand new</span>
              </p>
            </div>
          </div>
        </section>

        {/* ── Subject snapshot strip ── */}
        <section className="rounded-2xl px-5 py-4" style={{ background: 'rgba(255,255,255,0.45)', border: '1px dashed rgba(0,0,0,0.12)' }}>
          <div className="flex gap-5 items-center">
            <div className="flex-shrink-0 pr-4" style={{ borderRight: '1px dashed rgba(0,0,0,0.12)' }}>
              <div className="text-xs font-bold" style={{ color: '#78716c' }}>Subjects</div>
              <div className="font-bold text-xl mt-0.5">{dash?.subjects.reduce((a, s) => a + s.total, 0) ?? 0}</div>
            </div>
            {(dash?.subjects ?? []).map(s => {
              const meta = subjectMeta(s.key);
              return (
                <Link key={s.key} href="/brain-map" className="flex-1 min-w-0 hover:opacity-80 transition-opacity">
                  <div className="flex items-center gap-2 mb-1.5 min-w-0">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: meta.color }}>
                      {meta.letter}
                    </div>
                    <span className="font-bold text-sm truncate flex-1 min-w-0" style={{ color: '#1c1917' }}>{meta.label}</span>
                    <span className="text-xs font-bold flex-shrink-0" style={{ color: '#78716c' }}>{s.pct}%</span>
                  </div>
                  <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
                    <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${s.pct}%`, background: meta.color }} />
                  </div>
                  <div className="text-xs mt-1" style={{ color: '#78716c' }}>{s.total} things</div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Today's actions: Fix + Revise ── */}
        <div className="grid grid-cols-2 gap-4">
          {/* Today's Fix */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,247,237,0.9)', border: '1.5px solid rgba(249,115,22,0.3)', backdropFilter: 'blur(12px)' }}>
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold mb-1" style={{ color: COLORS.weak }}>🔧 Today's Fix</div>
                <h2 className="text-2xl font-extrabold" style={{ color: '#1c1917' }}>
                  {fixCount > 0 ? `${fixCount} to fix · about ${fixCount * 3} min` : 'Nothing to fix 🎉'}
                </h2>
                <p className="text-sm mt-1.5" style={{ color: '#78716c' }}>
                  {fixFirst ? <>Up first: <strong>{fixFirst.name}</strong> ({fixFirstSubject}).</> : 'Great — you have no flagged concepts right now.'}
                </p>
                {fixCount > 0 && (
                  <div className="flex gap-1.5 mt-3">
                    {today!.fixQueue.slice(0, 5).map((_, i) => (
                      <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.weak }} />
                    ))}
                  </div>
                )}
              </div>
              {fixFirst && (
                <button
                  onClick={() => router.push(assessmentHref('/sharpen', {
                    conceptId: fixFirst.id,
                    level: 'level1',
                  }, '/dashboard'))}
                  className="flex-shrink-0 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: COLORS.weak, boxShadow: '0 4px 16px rgba(249,115,22,0.3)' }}
                >
                  ▸ Start
                </button>
              )}
            </div>
          </div>

          {/* Revise */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(240,253,244,0.9)', border: '1.5px solid rgba(34,197,94,0.3)', backdropFilter: 'blur(12px)' }}>
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold mb-1" style={{ color: COLORS.strong }}>🔄 Revise</div>
                <h2 className="text-2xl font-extrabold" style={{ color: '#1c1917' }}>
                  {reviseCount > 0 ? `${reviseCount} quick checks · about ${reviseCount * 2} min` : 'All caught up ✨'}
                </h2>
                <p className="text-sm mt-1.5" style={{ color: '#78716c' }}>
                  {reviseCount > 0 ? today!.reviseQueue.slice(0, 3).map(c => c.name).join(' · ') : 'Nothing due for revision today.'}
                </p>
                {reviseCount > 0 && (
                  <div className="flex gap-1.5 mt-3">
                    {today!.reviseQueue.slice(0, 3).map((_, i) => (
                      <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.strong }} />
                    ))}
                  </div>
                )}
              </div>
              {reviseCount > 0 && (
                <button
                  onClick={() => router.push(assessmentHref('/sharpen', {
                    conceptId: today!.reviseQueue[0].id,
                    level: 'revise',
                  }, '/dashboard'))}
                  className="flex-shrink-0 px-4 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                  style={{ background: 'rgba(255,255,255,0.7)', border: `1.5px solid ${COLORS.strong}`, color: '#16a34a' }}
                >
                  ↻ Start
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Curiosity + progress entry ── */}
        <div className="grid grid-cols-2 gap-4 flex-1">
          <div className="rounded-2xl p-5" style={{ background: 'rgba(79,70,229,0.07)', border: '1px solid rgba(79,70,229,0.2)', backdropFilter: 'blur(12px)' }}>
            <div className="text-xs font-bold mb-3" style={{ color: '#78716c' }}>Did you know? 🤯</div>
            <p className="font-bold text-lg leading-snug" style={{ color: '#1c1917' }}>
              A single strand of DNA from one human cell, uncoiled, would stretch about 2 metres.
            </p>
            <p className="text-sm mt-3 italic" style={{ color: COLORS.indigo }}>
              If every cell has the same DNA, why do skin cells look nothing like neurons?
            </p>
            <div className="mt-4 flex justify-end">
              <Link href="/brain-map" className="text-xs font-bold px-3 py-1 rounded-lg transition-colors hover:bg-white/60" style={{ color: COLORS.indigo, border: `1px solid ${COLORS.indigo}44` }}>
                Open Brain Map →
              </Link>
            </div>
          </div>

          {/* My Progress entry */}
          <Link
            href="/progress"
            className="rounded-2xl p-5 flex flex-col justify-between transition-all hover:opacity-90 group"
            style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(0,0,0,0.08)', backdropFilter: 'blur(12px)' }}
          >
            <div>
              <div className="text-xs font-bold mb-3" style={{ color: '#78716c' }}>Your journey 📈</div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold" style={{ color: COLORS.strong }}>{m?.strong ?? 0}</span>
                <span className="text-sm" style={{ color: '#78716c' }}>concepts mastered</span>
              </div>
              <p className="text-sm mt-2" style={{ color: '#44403c' }}>
                {dash?.streak.activeDays ?? 0} active days in the last month · {dash?.streak.best ?? 0}-day best streak.
              </p>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-lg font-extrabold group-hover:underline" style={{ color: '#1c1917' }}>See My Progress →</span>
              <span className="text-2xl">🧠</span>
            </div>
          </Link>
        </div>

        {loading && (
          <div className="text-center text-sm" style={{ color: '#a8a29e' }}>Loading your day…</div>
        )}
      </main>
    </div>
  );
}
