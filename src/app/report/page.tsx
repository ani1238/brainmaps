'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GridBackground } from '@/components/GridBackground';
import { LeftRail } from '@/components/LeftRail';
import { COLORS } from '@/lib/tokens';
import {
  getReportStatus,
  setParentPin,
  unlockReports,
  generateReport,
  fetchReportItem,
  type ParentReport,
  type ReportHistoryItem,
} from '@/lib/api';

type Phase = 'loading' | 'create-pin' | 'enter-pin' | 'report';

function formatGeneratedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Report';
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

export default function ParentReportPage() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<ParentReport | null>(null);
  const [history, setHistory] = useState<ReportHistoryItem[]>([]);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [activeId, setActiveId] = useState('');
  const [generating, setGenerating] = useState(false);
  const triedAuto = useRef(false);

  const loadReport = useCallback(async (p: string) => {
    setBusy(true);
    setError('');
    try {
      const b = await unlockReports(p);
      setReport(b.report);
      setHistory(b.history);
      setWeeklyCount(b.weeklyCount);
      setActiveId(b.reportId);
      setPhase('report');
    } catch {
      setError('Incorrect PIN. Please try again.');
    } finally {
      setBusy(false);
    }
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    setError('');
    try {
      const b = await generateReport(pin);
      setReport(b.report);
      setHistory(b.history);
      setWeeklyCount(b.weeklyCount);
      setActiveId(b.reportId);
    } catch {
      setError('Could not generate a new report. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleOpenHistory(id: string) {
    if (id === activeId || generating) return;
    setGenerating(true);
    setError('');
    try {
      const r = await fetchReportItem(pin, id);
      setReport(r);
      setActiveId(id);
    } catch {
      setError('Could not open that report.');
    } finally {
      setGenerating(false);
    }
  }

  useEffect(() => {
    if (triedAuto.current) return;
    triedAuto.current = true;
    getReportStatus()
      .then((s) => {
        if (!s.pinSet) {
          setPhase('create-pin');
          return;
        }
        // Always require the PIN on each visit — never persist unlocked state.
        setPhase('enter-pin');
      })
      .catch(() => setPhase('enter-pin'));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{4,6}$/.test(pin)) {
      setError('PIN must be 4–6 digits.');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await setParentPin(pin);
      await loadReport(pin);
    } catch {
      setError('Could not set the PIN. Please try again.');
      setBusy(false);
    }
  }

  async function handleEnter(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{4,6}$/.test(pin)) {
      setError('Enter your 4–6 digit PIN.');
      return;
    }
    await loadReport(pin);
  }

  return (
    <div className="relative flex flex-col lg:flex-row min-h-[100dvh] lg:h-screen lg:overflow-hidden" style={{ background: '#F4EFE5' }}>
      <GridBackground />
      <LeftRail />
      <main className="relative flex-1 lg:overflow-y-auto px-4 lg:px-8 py-4 lg:py-6 pb-24 lg:pb-6 flex flex-col">
        {(phase === 'create-pin' || phase === 'enter-pin' || phase === 'loading') && (
          <div className="flex-1 flex items-center justify-center">
            <div
              className="w-full max-w-sm rounded-3xl p-8"
              style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 30px 80px rgba(79,70,229,0.12)' }}
            >
              <div className="text-3xl mb-2">🔒</div>
              {phase === 'loading' && <p className="text-sm" style={{ color: '#78716c' }}>Loading…</p>}

              {phase === 'create-pin' && (
                <>
                  <h1 className="text-xl font-extrabold mb-1" style={{ color: '#1c1917' }}>Set a parent PIN</h1>
                  <p className="text-sm mb-6" style={{ color: '#78716c' }}>
                    The report is for you. Choose a 4–6 digit PIN to keep it private from your child.
                  </p>
                  <form onSubmit={handleCreate} className="flex flex-col gap-3">
                    <input type="text" inputMode="numeric" autoComplete="off" name="bm-new-pin" placeholder="New PIN" value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="px-4 py-3 rounded-xl text-base font-semibold outline-none"
                      style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.12)', color: '#1c1917', WebkitTextSecurity: 'disc' } as React.CSSProperties} />
                    <input type="text" inputMode="numeric" autoComplete="off" name="bm-confirm-pin" placeholder="Confirm PIN" value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="px-4 py-3 rounded-xl text-base font-semibold outline-none"
                      style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.12)', color: '#1c1917', WebkitTextSecurity: 'disc' } as React.CSSProperties} />
                    {error && <p className="text-sm font-semibold" style={{ color: '#dc2626' }}>{error}</p>}
                    <button type="submit" disabled={busy}
                      className="py-3 rounded-xl font-bold text-sm text-white disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #4F46E5, #6366f1)' }}>
                      {busy ? 'Setting…' : 'Set PIN & open report'}
                    </button>
                  </form>
                </>
              )}

              {phase === 'enter-pin' && (
                <>
                  <h1 className="text-xl font-extrabold mb-1" style={{ color: '#1c1917' }}>Parent report</h1>
                  <p className="text-sm mb-6" style={{ color: '#78716c' }}>Enter your parent PIN to continue.</p>
                  <form onSubmit={handleEnter} className="flex flex-col gap-3">
                    <input type="text" inputMode="numeric" autoComplete="off" name="bm-pin" placeholder="PIN" value={pin} autoFocus
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="px-4 py-3 rounded-xl text-base font-semibold outline-none"
                      style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.12)', color: '#1c1917', WebkitTextSecurity: 'disc' } as React.CSSProperties} />
                    {error && <p className="text-sm font-semibold" style={{ color: '#dc2626' }}>{error}</p>}
                    <button type="submit" disabled={busy}
                      className="py-3 rounded-xl font-bold text-sm text-white disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #4F46E5, #6366f1)' }}>
                      {busy ? 'Opening…' : 'Open report'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}

        {phase === 'report' && report && (
          <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
            <ReportControls
              weeklyCount={weeklyCount}
              generating={generating}
              history={history}
              activeId={activeId}
              onGenerate={handleGenerate}
              onOpen={handleOpenHistory}
            />
            {error && (
              <div className="text-sm px-1" style={{ color: '#ef4444' }}>{error}</div>
            )}
            <ReportView
              report={report}
              onLock={() => {
                setPin(''); setReport(null); setHistory([]); setActiveId(''); setWeeklyCount(0); setPhase('enter-pin');
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}

function ReportControls({ weeklyCount, generating, history, activeId, onGenerate, onOpen }: {
  weeklyCount: number;
  generating: boolean;
  history: ReportHistoryItem[];
  activeId: string;
  onGenerate: () => void;
  onOpen: (id: string) => void;
}) {
  const [showHistory, setShowHistory] = useState(false);
  return (
    <section className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.08)' }}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-sm font-bold" style={{ color: '#1c1917' }}>Reports</div>
          <div className="text-[11px]" style={{ color: '#a8a29e' }}>
            {weeklyCount} generated this week
          </div>
        </div>
        <button
          onClick={onGenerate}
          disabled={generating}
          className="px-4 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-60"
          style={{ background: COLORS.indigo }}
        >
          {generating ? 'Generating…' : '✨ Generate new report'}
        </button>
      </div>

      {history.length > 0 && (
        <div>
          <button
            onClick={() => setShowHistory(s => !s)}
            className="text-xs font-bold"
            style={{ color: COLORS.indigo }}
          >
            {showHistory ? 'Hide previous reports' : `Previous reports (${history.length})`}
          </button>
          {showHistory && (
            <div className="flex flex-col gap-2 mt-2">
              {history.map((h) => {
                const active = h.id === activeId;
                return (
                  <button
                    key={h.id}
                    onClick={() => onOpen(h.id)}
                    disabled={generating}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold disabled:opacity-60"
                    style={{
                      background: active ? 'rgba(79,70,229,0.1)' : 'rgba(0,0,0,0.03)',
                      color: active ? COLORS.indigo : '#44403c',
                      border: active ? `1px solid ${COLORS.indigo}40` : '1px solid transparent',
                    }}
                  >
                    <span>{formatGeneratedAt(h.generatedAt)}</span>
                    {active && <span className="text-[10px]">Viewing</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function ReportView({ report, onLock }: { report: ParentReport; onLock: () => void }) {
  const hours = Math.floor(report.effort.minutes / 60);
  const mins = report.effort.minutes % 60;
  const timeLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;
  const eyebrow = [report.weekNumber ? `Week ${report.weekNumber}` : '', report.focusSubject]
    .filter(Boolean).join(' · ');

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold tracking-widest" style={{ color: COLORS.strong }}>
            {eyebrow || 'PARENT REPORT'}
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold" style={{ color: '#1c1917' }}>A note about {report.studentName}</h1>
          <div className="text-xs mt-0.5" style={{ color: '#a8a29e' }}>{report.weekStart} → {report.weekEnd}</div>
        </div>
        <button onClick={onLock} className="text-[11px] font-semibold flex items-center gap-1 flex-shrink-0" style={{ color: '#4F46E5' }}>🔒 Lock</button>
      </div>

      {/* Hero headline / narrative */}
      <section className="rounded-2xl p-5" style={{ background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.2)' }}>
        {report.headline && (
          <p className="text-lg lg:text-xl font-extrabold leading-snug mb-2" style={{ color: '#1c1917' }}>{report.headline}</p>
        )}
        <p className="text-base leading-relaxed" style={{ color: '#44403c' }}>{report.narrative}</p>
      </section>

      {/* A real win */}
      {report.win?.detail && (
        <section className="rounded-2xl p-5 flex gap-3" style={{ background: 'rgba(225,245,238,0.7)', border: '1px solid rgba(29,158,117,0.3)' }}>
          <div className="text-xl flex-none">🌱</div>
          <div>
            <div className="text-xs font-bold mb-1" style={{ color: COLORS.strong }}>A real win this week</div>
            <div className="text-base font-bold mb-0.5" style={{ color: '#1c1917' }}>{report.win.concept}</div>
            <p className="text-sm leading-relaxed" style={{ color: '#3f6b57' }}>{report.win.detail}</p>
          </div>
        </section>
      )}

      {/* One thing to look at */}
      {report.gap?.explanation && (
        <section className="rounded-2xl p-5" style={{ background: 'rgba(255,247,237,0.85)', border: '1px solid rgba(249,115,22,0.3)' }}>
          <div className="text-xs font-bold mb-2" style={{ color: COLORS.weak }}>One thing to look at</div>
          <div className="text-base font-bold mb-1" style={{ color: '#1c1917' }}>{report.gap.concept}</div>
          <p className="text-sm leading-relaxed" style={{ color: '#5e5247' }}>{report.gap.explanation}</p>
        </section>
      )}

      {/* In their own words */}
      {report.voice?.answer && (
        <section className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(0,0,0,0.08)' }}>
          <div className="text-xs font-bold mb-2" style={{ color: '#78716c' }}>In {report.studentName.split(' ')[0]}&apos;s own words ✍️</div>
          {report.voice.question && (
            <p className="text-xs mb-2" style={{ color: '#a8a29e' }}>{report.voice.question}</p>
          )}
          <div
            className="rounded-xl p-4 mb-3"
            style={{
              background: '#fcfcf8',
              border: '1px solid #ece9df',
              backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 27px, #eef0ec 27px, #eef0ec 28px)',
            }}
          >
            <p className="text-base italic leading-7" style={{ color: '#3a5559' }}>&ldquo;{report.voice.answer}&rdquo;</p>
          </div>
          {report.voice.note && (
            <div className="flex gap-2 rounded-lg p-3" style={{ background: 'rgba(224,153,46,0.1)' }}>
              <span className="flex-none">✎</span>
              <p className="text-sm leading-relaxed" style={{ color: '#7a5212' }}>{report.voice.note}</p>
            </div>
          )}
        </section>
      )}

      {/* Careless vs concept gauge */}
      {report.careless && (
        <section className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.08)' }}>
          <div className="text-xs font-bold mb-3" style={{ color: COLORS.weak }}>Is it focus, or understanding?</div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-semibold flex-none" style={{ color: '#94a8a3' }}>Just rushing</span>
            <div className="relative flex-1 h-2 rounded-full" style={{ background: 'linear-gradient(90deg, #ebc675, #c2613c)' }}>
              <span
                className="absolute top-1/2 w-4 h-4 rounded-full bg-white"
                style={{
                  left: `${Math.max(0, Math.min(100, report.careless.conceptGapPct))}%`,
                  transform: 'translate(-50%, -50%)',
                  border: '3px solid #c2613c',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                }}
              />
            </div>
            <span className="text-[10px] font-semibold flex-none" style={{ color: '#94a8a3' }}>Concept gap</span>
          </div>
          {report.careless.verdict && (
            <p className="text-sm leading-relaxed mt-3" style={{ color: '#5e5247' }}>{report.careless.verdict}</p>
          )}
        </section>
      )}

      {/* One question to ask tonight */}
      {report.askTonight?.question && (
        <section className="rounded-2xl overflow-hidden" style={{ background: 'rgba(251,241,221,0.9)', border: '1px solid rgba(224,153,46,0.35)' }}>
          <div className="px-5 py-2 text-[11px] font-bold tracking-widest" style={{ background: '#e0992e', color: '#3d2705' }}>
            🌙 ONE QUESTION TO ASK TONIGHT
          </div>
          <div className="p-5">
            <p className="text-lg italic font-semibold leading-snug" style={{ color: '#5a3b0b' }}>&ldquo;{report.askTonight.question}&rdquo;</p>
            {report.askTonight.hint && (
              <p className="text-sm mt-2 leading-relaxed" style={{ color: '#8a6420' }}>{report.askTonight.hint}</p>
            )}
          </div>
        </section>
      )}

      {/* The bigger picture: recall vs apply */}
      {report.trend && (
        <section className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.08)' }}>
          <div className="text-xs font-bold mb-3" style={{ color: COLORS.strong }}>The bigger picture 📈</div>
          {[
            { label: 'Remembering facts', pct: report.trend.recallPct, color: COLORS.strong },
            { label: 'Applying to new situations', pct: report.trend.applyPct, color: COLORS.indigo },
          ].map((row) => (
            <div key={row.label} className="mb-2.5">
              <div className="flex justify-between text-xs mb-1" style={{ color: '#78716c' }}>
                <span>{row.label}</span><span className="font-bold">{row.pct}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
                <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, row.pct))}%`, background: row.color }} />
              </div>
            </div>
          ))}
          {report.trend.caption && (
            <p className="text-sm leading-relaxed mt-2" style={{ color: '#5e5247' }}>{report.trend.caption}</p>
          )}
        </section>
      )}

      {/* What you can do (kept) */}
      <section className="rounded-2xl p-5" style={{ background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.2)' }}>
        <div className="text-xs font-bold mb-2" style={{ color: COLORS.indigo }}>What you can do 💡</div>
        <p className="text-base leading-relaxed font-semibold" style={{ color: '#1c1917' }}>{report.suggestion}</p>
      </section>

      {/* Effort footer */}
      <section className="grid grid-cols-3 gap-3">
        {[
          { label: 'Sessions', value: report.effort.sessions },
          { label: 'Active days', value: report.effort.activeDays },
          { label: 'Streak', value: `${report.effort.streak} 🔥` },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="text-2xl font-extrabold" style={{ color: '#1c1917' }}>{s.value}</div>
            <div className="text-[11px] mt-0.5" style={{ color: '#78716c' }}>{s.label}</div>
          </div>
        ))}
        <div className="col-span-3 text-center text-xs" style={{ color: '#a8a29e' }}>≈ {timeLabel} of focused practice this week</div>
      </section>

      {/* Send stub */}
      <button
        disabled
        className="py-3 rounded-xl font-bold text-sm disabled:opacity-50"
        style={{ background: 'rgba(255,255,255,0.6)', border: '1.5px solid rgba(0,0,0,0.12)', color: '#78716c' }}
        title="Coming soon"
      >
        📩 Send to WhatsApp / email (coming soon)
      </button>
    </div>
  );
}
