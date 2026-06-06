'use client';

import Link from 'next/link';
import { GridBackground } from '@/components/GridBackground';
import { LeftRail } from '@/components/LeftRail';
import { COLORS } from '@/lib/tokens';
import { WEATHER, WEATHER_TOTAL, DASH_SUBJECTS as SUBJECTS, YESTERDAY, CURIOSITY_BYTE, HEATMAP_DAYS as DAYS, STUDENT } from '@/data/dummy';

function heatColor(v: number) {
  if (v === 0) return '#ece5d3';
  if (v <= 1) return '#e0e7ff';
  if (v <= 3) return '#a5b4fc';
  if (v <= 5) return '#6366f1';
  return '#4F46E5';
}

export default function DashboardPage() {
  return (
    <div className="relative flex h-screen overflow-hidden" style={{ background: '#F4EFE5' }}>
      <GridBackground />

      <LeftRail />

      {/* Main content */}
      <main className="relative flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-5">

        {/* ── Header: greeting + Brain Weather ── */}
        <section
          className="rounded-2xl p-5"
          style={{
            background: 'rgba(255,255,255,0.65)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.7)',
          }}
        >
          <div className="flex justify-between items-start gap-6 mb-4">
            <div>
              <div className="text-xs font-bold mb-0.5" style={{ color: '#78716c' }}>
                Thursday · 29 May
              </div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <h1 className="text-3xl font-extrabold leading-none" style={{ color: '#1c1917' }}>Hi {STUDENT.name}! 👋</h1>
                <span className="text-sm" style={{ color: '#78716c' }}>About 15 minutes today</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs font-bold mb-0.5" style={{ color: '#78716c' }}>Streak</div>
              <div className="text-4xl font-extrabold">12 🔥</div>
            </div>
          </div>

          {/* Your Brain Today */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="text-xs font-bold" style={{ color: '#78716c' }}>Your brain today</div>
              <div className="text-xs" style={{ color: '#78716c' }}>{WEATHER_TOTAL} things you're learning</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex h-4 rounded-full overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.1)' }}>
                {WEATHER.map(w => (
                  <div
                    key={w.state}
                    title={`${w.state.replace('_', ' ')} · ${w.n}`}
                    style={{ width: `${(w.n / WEATHER_TOTAL) * 100}%`, background: w.c }}
                  />
                ))}
              </div>
              <p className="text-sm mt-1.5" style={{ color: '#44403c' }}>
                <strong style={{ color: COLORS.strong }}>{WEATHER[0].n} got it! 🎉</strong>
                {' · '}
                <strong style={{ color: COLORS.weak }}>{WEATHER[2].n + WEATHER[3].n} to fix ✨</strong>
                {' · '}
                <span style={{ color: '#78716c' }}>{WEATHER[4].n} brand new</span>
              </p>
            </div>
          </div>
        </section>

        {/* ── Subject snapshot strip ── */}
        <section
          className="rounded-2xl px-5 py-4"
          style={{
            background: 'rgba(255,255,255,0.45)',
            border: '1px dashed rgba(0,0,0,0.12)',
          }}
        >
          <div className="flex gap-5 items-center">
            <div className="flex-shrink-0 pr-4" style={{ borderRight: '1px dashed rgba(0,0,0,0.12)' }}>
              <div className="text-xs font-bold" style={{ color: '#78716c' }}>Subjects</div>
              <div className="font-bold text-xl mt-0.5">{SUBJECTS.reduce((a, s) => a + s.n, 0)}</div>
            </div>
            {SUBJECTS.map(s => (
              <Link key={s.key} href="/brain-map" className="flex-1 min-w-0 hover:opacity-80 transition-opacity">
                <div className="flex items-center gap-2 mb-1.5 min-w-0">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                    style={{ background: s.color }}
                  >
                    {s.letter}
                  </div>
                  <span className="font-bold text-sm truncate flex-1 min-w-0" style={{ color: '#1c1917' }}>{s.name}</span>
                  <span className="text-xs font-bold flex-shrink-0" style={{ color: '#78716c' }}>{s.pct}%</span>
                </div>
                <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ width: `${s.pct}%`, background: s.color }}
                  />
                </div>
                <div className="text-xs mt-1" style={{ color: '#78716c' }}>{s.n} things</div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── CTA cards ── */}
        <div className="grid grid-cols-2 gap-4">
          {/* Sharpen */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'rgba(255,247,237,0.9)',
              border: '1.5px solid rgba(249,115,22,0.3)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold mb-1" style={{ color: COLORS.weak }}>✨ Fix the tricky bits</div>
                <h2 className="text-2xl font-extrabold" style={{ color: '#1c1917' }}>5 to fix · about 9 min</h2>
                <p className="text-sm mt-1.5" style={{ color: '#78716c' }}>Up first: <strong>Chlorophyll & light</strong> (Science).</p>
                <div className="flex gap-1.5 mt-3">
                  {['#ef4444', '#f97316', '#f97316', '#eab308', '#eab308'].map((c, i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                  ))}
                </div>
              </div>
              <Link
                href="/sharpen"
                className="flex-shrink-0 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: COLORS.weak, boxShadow: '0 4px 16px rgba(249,115,22,0.3)' }}
              >
                ▸ Start
              </Link>
            </div>
          </div>

          {/* Active Recall */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'rgba(240,253,244,0.9)',
              border: '1.5px solid rgba(34,197,94,0.3)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold mb-1" style={{ color: COLORS.strong }}>🎯 Test yourself</div>
                <h2 className="text-2xl font-extrabold" style={{ color: '#1c1917' }}>3 quick checks · about 5 min</h2>
                <p className="text-sm mt-1.5" style={{ color: '#78716c' }}>Science · Geography · History</p>
                <div className="flex gap-1.5 mt-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.strong }} />
                  ))}
                </div>
              </div>
              <Link
                href="/recall"
                className="flex-shrink-0 px-4 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                style={{
                  background: 'rgba(255,255,255,0.7)',
                  border: `1.5px solid ${COLORS.strong}`,
                  color: '#16a34a',
                }}
              >
                ↻ Start
              </Link>
            </div>
          </div>
        </div>

        {/* ── 3-col hooks: Curiosity Byte | Yesterday | 30-day heatmap ── */}
        <div className="grid grid-cols-3 gap-4 flex-1">

          {/* Curiosity Byte */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'rgba(79,70,229,0.07)',
              border: '1px solid rgba(79,70,229,0.2)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="text-xs font-bold mb-3" style={{ color: '#78716c' }}>Did you know? 🤯</div>
            <p className="font-bold text-lg leading-snug" style={{ color: '#1c1917' }}>
              {CURIOSITY_BYTE.fact}
            </p>
            <p className="text-sm mt-3 italic" style={{ color: COLORS.indigo }}>
              {CURIOSITY_BYTE.question}
            </p>
            <div className="mt-4 flex justify-end">
              <Link
                href="/brain-map"
                className="text-xs font-bold px-3 py-1 rounded-lg transition-colors hover:bg-white/60"
                style={{ color: COLORS.indigo, border: `1px solid ${COLORS.indigo}44` }}
              >
                Open Brain Map →
              </Link>
            </div>
          </div>

          {/* Yesterday: wins + slipped */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'rgba(255,255,255,0.65)',
              border: '1px solid rgba(0,0,0,0.08)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="text-xs font-bold mb-3" style={{ color: '#78716c' }}>Yesterday's wins & oopses</div>

            <div className="mb-4">
              <div className="text-xs font-bold mb-2" style={{ color: COLORS.strong }}>🎉 Got better at · {YESTERDAY.wins.length}</div>
              <div className="flex flex-col gap-2">
                {YESTERDAY.wins.map(({ name, delta }) => (
                  <div key={name} className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: COLORS.strong }}>●</span>
                    <span className="flex-1 text-sm font-semibold truncate" style={{ color: '#1c1917' }}>{name}</span>
                    <span className="text-[11px] font-mono font-bold flex-shrink-0" style={{ color: COLORS.strong }}>{delta}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold mb-2" style={{ color: COLORS.weak }}>😬 A bit rusty · {YESTERDAY.slips.length}</div>
              <div className="flex flex-col gap-2">
                {YESTERDAY.slips.map(({ name, delta }) => (
                  <div key={name} className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: COLORS.weak }}>●</span>
                    <span className="flex-1 text-sm font-semibold truncate" style={{ color: '#1c1917' }}>{name}</span>
                    <span className="text-[11px] font-mono font-bold flex-shrink-0" style={{ color: COLORS.weak }}>{delta}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 30-day heatmap */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'rgba(255,255,255,0.65)',
              border: '1px solid rgba(0,0,0,0.08)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="text-xs font-bold mb-1" style={{ color: '#78716c' }}>Your last month</div>
            <div className="flex justify-between items-baseline mb-4">
              <div className="text-2xl font-extrabold" style={{ color: '#1c1917' }}>26 out of 30 days! 💪</div>
              <div className="text-xs" style={{ color: '#78716c' }}>About 11 min a day</div>
            </div>

            <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
              {DAYS.map((v, i) => (
                <div
                  key={i}
                  title={`Day ${i + 1}: ${v} sessions`}
                  className="aspect-square rounded"
                  style={{
                    background: heatColor(v),
                    border: '1px solid rgba(0,0,0,0.1)',
                    outline: i === 27 ? '2px dashed #4F46E5' : 'none',
                    outlineOffset: 1,
                  }}
                />
              ))}
            </div>

            <div className="flex justify-between items-center mt-3">
              <span className="text-xs" style={{ color: '#78716c' }}>less</span>
              <div className="flex gap-1">
                {[0, 1, 3, 5, 6].map(v => (
                  <div
                    key={v}
                    className="w-3 h-3 rounded"
                    style={{ background: heatColor(v), border: '1px solid rgba(0,0,0,0.1)' }}
                  />
                ))}
              </div>
              <span className="text-xs" style={{ color: '#78716c' }}>more</span>
            </div>
          </div>
        </div>

        {/* Brain map CTA */}
        <Link
          href="/brain-map"
          className="flex justify-between items-center rounded-2xl px-6 py-4 transition-all hover:opacity-90 group"
          style={{
            background: 'rgba(79,70,229,0.05)',
            border: '1.5px dashed rgba(79,70,229,0.25)',
          }}
        >
          <div>
            <div className="text-xs font-bold mb-0.5" style={{ color: '#78716c' }}>Or explore</div>
            <div className="text-lg font-extrabold group-hover:underline" style={{ color: '#1c1917' }}>Open your Brain Map →</div>
            <div className="text-sm mt-0.5" style={{ color: '#78716c' }}>See everything you're learning in one place.</div>
          </div>
          <div className="text-3xl">🧠</div>
        </Link>

      </main>
    </div>
  );
}
