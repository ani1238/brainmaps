'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GridBackground } from '@/components/GridBackground';
import { LeftRail } from '@/components/LeftRail';
import { COLORS, SUBJECT_MAP } from '@/lib/tokens';
import { assessmentHref } from '@/lib/navigation';
import { useProfile } from '@/lib/storage';
import {
  fetchPlan, generatePlan, fetchAgenda, fetchPlanItems, fetchLeaves,
  addLeave, removeLeave, reflowPlan,
  type PlanState, type Agenda, type PlanItem, type PlanLeave,
} from '@/lib/api';

function subjectMeta(key: string) {
  const k = key.startsWith('english') ? 'english' : key;
  return SUBJECT_MAP[k] ?? { label: key, letter: '?', color: COLORS.science, icon: '📘' };
}

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function todayYmd() { return ymd(new Date()); }

const STATION_LABEL: Record<string, string> = {
  level1: 'Level 1', level2: 'Level 2', level3: 'Level 3', strengthen: 'Strengthen', revise: 'Revise',
};

export default function PlanPage() {
  const router = useRouter();
  const profile = useProfile();

  const [plan, setPlan] = useState<PlanState | null>(null);
  const [agenda, setAgenda] = useState<Agenda | null>(null);
  const [items, setItems] = useState<PlanItem[]>([]);
  const [leaves, setLeaves] = useState<PlanLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [monthCursor, setMonthCursor] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });

  const monthRange = useMemo(() => {
    const first = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
    const last = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0);
    return { from: ymd(first), to: ymd(last) };
  }, [monthCursor]);

  const refreshActive = useCallback(async () => {
    const [a, it, lv] = await Promise.all([
      fetchAgenda().catch(() => null),
      fetchPlanItems(monthRange.from, monthRange.to).catch(() => [] as PlanItem[]),
      fetchLeaves().catch(() => [] as PlanLeave[]),
    ]);
    if (a) setAgenda(a);
    setItems(it);
    setLeaves(lv);
  }, [monthRange.from, monthRange.to]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await fetchPlan();
        if (cancelled) return;
        setPlan(p);
        if (p.hasPlan) await refreshActive();
      } catch { /* unauthenticated handled by AuthGate */ }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [refreshActive]);

  // Re-fetch calendar items when the visible month changes (after a plan exists).
  useEffect(() => {
    if (!plan?.hasPlan) return;
    fetchPlanItems(monthRange.from, monthRange.to).then(setItems).catch(() => {});
  }, [plan?.hasPlan, monthRange.from, monthRange.to]);

  async function onCreatePlan() {
    setBusy(true);
    try {
      const p = await generatePlan();
      setPlan(p);
      await refreshActive();
    } finally { setBusy(false); }
  }

  return (
    <div className="relative flex flex-col lg:flex-row min-h-[100dvh] lg:h-screen lg:overflow-hidden" style={{ background: '#F4EFE5' }}>
      <GridBackground />
      <LeftRail />
      <main className="relative flex-1 lg:overflow-y-auto overflow-x-hidden lg:min-h-0 px-4 lg:px-8 py-4 lg:py-5 pb-24 lg:pb-6 flex flex-col gap-4">
        <header>
          <div className="text-xs font-bold mb-0.5" style={{ color: '#78716c' }}>🗓️ Your plan</div>
          <h1 className="text-2xl lg:text-3xl font-extrabold" style={{ color: '#1c1917' }}>
            Hi {profile?.name ?? 'there'}! Here&apos;s the plan
          </h1>
        </header>

        {loading && <div className="text-sm" style={{ color: '#a8a29e' }}>Loading your plan…</div>}

        {!loading && plan && !plan.hasPlan && (
          <NoPlan busy={busy} onCreate={onCreatePlan} />
        )}

        {!loading && plan?.hasPlan && (
          <>
            {agenda && <AgendaCard agenda={agenda} onStart={(href) => router.push(href)} />}
            <CalendarCard
              monthCursor={monthCursor}
              setMonthCursor={setMonthCursor}
              items={items}
              leaves={leaves}
            />
            <LeaveCard
              leaves={leaves}
              busy={busy}
              onAdd={async (s, e, reason) => {
                setBusy(true);
                try { await addLeave(s, e, reason); await refreshActive(); } finally { setBusy(false); }
              }}
              onRemove={async (id) => {
                setBusy(true);
                try { await removeLeave(id); await refreshActive(); } finally { setBusy(false); }
              }}
            />
            <ToolsCard
              busy={busy}
              onReflow={async () => { setBusy(true); try { await reflowPlan(); await refreshActive(); } finally { setBusy(false); } }}
              onRegenerate={async () => { setBusy(true); try { const p = await generatePlan(); setPlan(p); await refreshActive(); } finally { setBusy(false); } }}
            />
          </>
        )}
      </main>
    </div>
  );
}

// ── No plan yet ───────────────────────────────────────────────────────────────
function NoPlan({ busy, onCreate }: { busy: boolean; onCreate: () => void }) {
  return (
    <section className="rounded-2xl p-6 flex flex-col items-start gap-3" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.08)' }}>
      <div className="text-3xl">🗺️</div>
      <h2 className="text-xl font-extrabold" style={{ color: '#1c1917' }}>Let&apos;s map out your year</h2>
      <p className="text-sm" style={{ color: '#57534e', maxWidth: 520 }}>
        I&apos;ll lay out your whole syllabus across the calendar — a little each day, paced
        so it never feels like a lot. You can move things around to match your school, and if
        you take a break your revisions won&apos;t pile up. ✨
      </p>
      <button
        onClick={onCreate}
        disabled={busy}
        className="px-5 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-60"
        style={{ background: COLORS.indigo }}
      >
        {busy ? 'Building your plan…' : '✨ Create my plan'}
      </button>
    </section>
  );
}

// ── Daily agenda ────────────────────────────────────────────────────────────
function AgendaCard({ agenda, onStart }: { agenda: Agenda; onStart: (href: string) => void }) {
  return (
    <section className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.08)' }}>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <div>
          <div className="text-xs font-bold" style={{ color: '#78716c' }}>Today&apos;s plan</div>
          <div className="text-lg font-extrabold" style={{ color: '#1c1917' }}>{agenda.positiveNote}</div>
        </div>
        <div className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: COLORS.indigoSoft, color: COLORS.indigoDeep }}>
          ~{agenda.estMinutes} min
        </div>
      </div>

      {agenda.onLeave ? (
        <div className="text-sm" style={{ color: '#78716c' }}>You&apos;re on a break — nothing due. 🌴</div>
      ) : (
        <div className="flex flex-col gap-4">
          <AgendaGroup
            title="📘 Learn" color={COLORS.indigo}
            empty="No new concepts today."
            rows={agenda.learn.map(l => ({
              key: l.conceptId, name: l.conceptName, subject: l.subjectKey,
              meta: l.overdue ? 'carried over' : 'new today',
              href: assessmentHref('/sharpen', { conceptId: l.conceptId, level: 'level1' }, '/plan'),
            }))}
            total={agenda.learnTotal} onStart={onStart}
          />
          <AgendaGroup
            title="🔧 Fix" color={COLORS.weak}
            empty="Nothing to fix — strong work! 💪"
            rows={agenda.fix.map(f => ({
              key: f.conceptId, name: f.conceptName, subject: f.subjectKey,
              meta: STATION_LABEL[f.level] ?? f.level,
              href: assessmentHref('/sharpen', { conceptId: f.conceptId, level: f.level }, '/plan'),
            }))}
            total={agenda.fixTotal} onStart={onStart}
          />
          <AgendaGroup
            title="🔄 Revise" color={COLORS.strong}
            empty="Nothing due for revision."
            rows={agenda.revise.map(rv => ({
              key: rv.conceptId, name: rv.conceptName, subject: rv.subjectKey,
              meta: 'quick check',
              href: assessmentHref('/sharpen', { conceptId: rv.conceptId, level: 'revise' }, '/plan'),
            }))}
            total={agenda.reviseTotal} onStart={onStart}
          />
        </div>
      )}
    </section>
  );
}

function AgendaGroup({ title, color, rows, empty, total, onStart }: {
  title: string; color: string; empty: string; total: number;
  rows: { key: string; name: string; subject: string; meta: string; href: string }[];
  onStart: (href: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className="text-xs font-bold" style={{ color }}>{title}</div>
        {total > rows.length && (
          <div className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.05)', color: '#78716c' }}>
            {rows.length} of {total} shown
          </div>
        )}
      </div>
      {rows.length === 0 ? (
        <div className="text-xs" style={{ color: '#a8a29e' }}>{empty}</div>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {rows.map(r => {
            const meta = subjectMeta(r.subject);
            return (
              <li key={r.key}>
                <button
                  onClick={() => onStart(r.href)}
                  className="w-full flex items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-black/[0.04] active:bg-black/[0.06]"
                >
                  <span className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: `${meta.color}22` }}>{meta.icon}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-bold truncate" style={{ color: '#1c1917' }}>{r.name}</span>
                    <span className="block text-xs" style={{ color: '#a8a29e' }}>{meta.label} · {r.meta}</span>
                  </span>
                  <span className="flex-shrink-0 text-sm font-bold" style={{ color }}>Start ▸</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ── Calendar ──────────────────────────────────────────────────────────────────
function CalendarCard({ monthCursor, setMonthCursor, items, leaves }: {
  monthCursor: Date; setMonthCursor: (d: Date) => void; items: PlanItem[]; leaves: PlanLeave[];
}) {
  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const monthLabel = monthCursor.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = todayYmd();

  const byDate = useMemo(() => {
    const m: Record<string, PlanItem[]> = {};
    for (const it of items) (m[it.plannedDate] ??= []).push(it);
    return m;
  }, [items]);

  function isLeave(dateStr: string) {
    return leaves.some(l => dateStr >= l.startDate && dateStr <= l.endDate);
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <section className="rounded-2xl p-4 lg:p-5" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.08)' }}>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setMonthCursor(new Date(year, month - 1, 1))} className="px-2 py-1 rounded-lg text-sm font-bold hover:bg-black/5" style={{ color: '#57534e' }}>‹</button>
        <div className="text-sm font-extrabold" style={{ color: '#1c1917' }}>{monthLabel}</div>
        <button onClick={() => setMonthCursor(new Date(year, month + 1, 1))} className="px-2 py-1 rounded-lg text-sm font-bold hover:bg-black/5" style={{ color: '#57534e' }}>›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-bold" style={{ color: '#a8a29e' }}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={`e${i}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const dayItems = (byDate[dateStr] ?? []).filter(it => it.status !== 'skipped');
          const leave = isLeave(dateStr);
          const isToday = dateStr === today;
          const subjects = Array.from(new Set(dayItems.map(it => it.subjectKey))).slice(0, 4);
          return (
            <div
              key={dateStr}
              className="aspect-square rounded-lg p-1 flex flex-col items-center justify-start text-[10px]"
              style={{
                background: leave ? 'rgba(168,162,158,0.18)' : dayItems.length ? 'rgba(79,70,229,0.06)' : 'transparent',
                border: isToday ? `1.5px solid ${COLORS.indigo}` : '1px solid rgba(0,0,0,0.05)',
              }}
              title={leave ? 'On leave' : dayItems.map(it => it.conceptName).join(', ')}
            >
              <div className="font-bold" style={{ color: isToday ? COLORS.indigo : '#57534e' }}>{d}</div>
              {leave ? (
                <div className="text-[9px] mt-auto">🌴</div>
              ) : (
                <div className="flex flex-wrap gap-0.5 justify-center mt-0.5">
                  {subjects.map(s => (
                    <span key={s} className="w-1.5 h-1.5 rounded-full" style={{ background: subjectMeta(s).color }} />
                  ))}
                  {dayItems.length > 0 && <span className="w-full text-center text-[8px]" style={{ color: '#a8a29e' }}>{dayItems.length}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-[10px] flex items-center gap-3 flex-wrap" style={{ color: '#a8a29e' }}>
        <span>● planned concepts (colored by subject)</span>
        <span>🌴 leave</span>
      </div>
    </section>
  );
}

// ── Leave ─────────────────────────────────────────────────────────────────────
function LeaveCard({ leaves, busy, onAdd, onRemove }: {
  leaves: PlanLeave[]; busy: boolean;
  onAdd: (start: string, end: string, reason: string) => void;
  onRemove: (id: number) => void;
}) {
  const [start, setStart] = useState(todayYmd());
  const [end, setEnd] = useState(todayYmd());
  const [reason, setReason] = useState('');

  return (
    <section className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.08)' }}>
      <div className="text-sm font-extrabold mb-1" style={{ color: '#1c1917' }}>🌴 Taking a break?</div>
      <p className="text-xs mb-3" style={{ color: '#78716c' }}>
        Mark your off days and I&apos;ll pause the plan — your revisions get spread out gently so nothing piles up when you&apos;re back.
      </p>
      <div className="flex flex-wrap items-end gap-2 mb-3">
        <label className="flex flex-col text-[11px] font-bold" style={{ color: '#78716c' }}>
          From
          <input type="date" value={start} onChange={e => setStart(e.target.value)} className="mt-0.5 px-2 py-1.5 rounded-lg text-sm" style={{ border: '1px solid rgba(0,0,0,0.15)', color: '#1c1917' }} />
        </label>
        <label className="flex flex-col text-[11px] font-bold" style={{ color: '#78716c' }}>
          To
          <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="mt-0.5 px-2 py-1.5 rounded-lg text-sm" style={{ border: '1px solid rgba(0,0,0,0.15)', color: '#1c1917' }} />
        </label>
        <input
          value={reason} onChange={e => setReason(e.target.value)} placeholder="reason (optional)"
          className="flex-1 min-w-[120px] px-2 py-1.5 rounded-lg text-sm" style={{ border: '1px solid rgba(0,0,0,0.15)', color: '#1c1917' }}
        />
        <button
          onClick={() => onAdd(start, end, reason)}
          disabled={busy}
          className="px-4 py-2 rounded-xl font-bold text-sm text-white disabled:opacity-60"
          style={{ background: COLORS.indigo }}
        >
          Add break
        </button>
      </div>
      {leaves.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {leaves.map(l => (
            <li key={l.id} className="flex items-center justify-between gap-2 text-sm px-3 py-2 rounded-xl" style={{ background: 'rgba(0,0,0,0.03)' }}>
              <span style={{ color: '#44403c' }}>{l.startDate} → {l.endDate}{l.reason ? ` · ${l.reason}` : ''}</span>
              <button onClick={() => onRemove(l.id)} disabled={busy} className="text-xs font-bold disabled:opacity-60" style={{ color: COLORS.weak }}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ── Tools ─────────────────────────────────────────────────────────────────────
function ToolsCard({ busy, onReflow, onRegenerate }: { busy: boolean; onReflow: () => void; onRegenerate: () => void }) {
  return (
    <section className="rounded-2xl p-5 flex flex-wrap items-center gap-3" style={{ background: 'rgba(255,255,255,0.55)', border: '1px dashed rgba(0,0,0,0.12)' }}>
      <div className="flex-1 min-w-[160px]">
        <div className="text-sm font-extrabold" style={{ color: '#1c1917' }}>Tidy up</div>
        <div className="text-xs" style={{ color: '#78716c' }}>Spread out a backlog, or rebuild the whole plan from scratch.</div>
      </div>
      <button onClick={onReflow} disabled={busy} className="px-4 py-2 rounded-xl font-bold text-sm disabled:opacity-60" style={{ background: 'rgba(79,70,229,0.1)', color: COLORS.indigoDeep }}>
        🧹 Tidy my revisions
      </button>
      <button onClick={onRegenerate} disabled={busy} className="px-4 py-2 rounded-xl font-bold text-sm disabled:opacity-60" style={{ background: 'rgba(0,0,0,0.05)', color: '#57534e' }}>
        ↻ Rebuild plan
      </button>
    </section>
  );
}
