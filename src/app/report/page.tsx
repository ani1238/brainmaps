'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GridBackground } from '@/components/GridBackground';
import { LeftRail } from '@/components/LeftRail';
import { COLORS } from '@/lib/tokens';
import {
  getReportStatus,
  setParentPin,
  fetchParentReport,
  type ParentReport,
} from '@/lib/api';

type Phase = 'loading' | 'create-pin' | 'enter-pin' | 'report';

export default function ParentReportPage() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<ParentReport | null>(null);
  const triedAuto = useRef(false);

  const loadReport = useCallback(async (p: string) => {
    setBusy(true);
    setError('');
    try {
      const r = await fetchParentReport(p);
      setReport(r);
      setPhase('report');
    } catch {
      setError('Incorrect PIN. Please try again.');
    } finally {
      setBusy(false);
    }
  }, []);

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
                    <input type="password" inputMode="numeric" placeholder="New PIN" value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="px-4 py-3 rounded-xl text-base font-semibold outline-none"
                      style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.12)', color: '#1c1917' }} />
                    <input type="password" inputMode="numeric" placeholder="Confirm PIN" value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="px-4 py-3 rounded-xl text-base font-semibold outline-none"
                      style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.12)', color: '#1c1917' }} />
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
                    <input type="password" inputMode="numeric" placeholder="PIN" value={pin} autoFocus
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="px-4 py-3 rounded-xl text-base font-semibold outline-none"
                      style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,0.12)', color: '#1c1917' }} />
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
          <ReportView report={report} onLock={() => { setPin(''); setReport(null); setPhase('enter-pin'); }} />
        )}
      </main>
    </div>
  );
}

function ReportView({ report, onLock }: { report: ParentReport; onLock: () => void }) {
  const hours = Math.floor(report.effort.minutes / 60);
  const mins = report.effort.minutes % 60;
  const timeLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold tracking-widest" style={{ color: '#78716c' }}>PARENT REPORT</div>
          <h1 className="text-2xl lg:text-3xl font-extrabold" style={{ color: '#1c1917' }}>{report.studentName}</h1>
          <div className="text-xs mt-0.5" style={{ color: '#a8a29e' }}>{report.weekStart} → {report.weekEnd}</div>
        </div>
        <button onClick={onLock} className="text-[11px] font-semibold flex items-center gap-1" style={{ color: '#4F46E5' }}>🔒 Lock</button>
      </div>

      {/* AI narrative */}
      <section className="rounded-2xl p-5" style={{ background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.2)' }}>
        <div className="text-xs font-bold mb-2" style={{ color: COLORS.indigo }}>This week ✨</div>
        <p className="text-base leading-relaxed" style={{ color: '#1c1917' }}>{report.narrative}</p>
      </section>

      {/* Effort stats */}
      <section className="grid grid-cols-3 gap-3">
        {[
          { label: 'Sessions', value: report.effort.sessions, icon: '📝' },
          { label: 'Active days', value: report.effort.activeDays, icon: '📅' },
          { label: 'Streak', value: `${report.effort.streak} 🔥`, icon: '' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="text-2xl font-extrabold" style={{ color: '#1c1917' }}>{s.value}</div>
            <div className="text-[11px] mt-0.5" style={{ color: '#78716c' }}>{s.label}</div>
          </div>
        ))}
        <div className="col-span-3 text-center text-xs" style={{ color: '#a8a29e' }}>≈ {timeLabel} of focused practice this week</div>
      </section>

      {/* Getting stronger */}
      {report.improving.length > 0 && (
        <section className="rounded-2xl p-5" style={{ background: 'rgba(225,245,238,0.7)', border: '1px solid rgba(29,158,117,0.25)' }}>
          <div className="text-xs font-bold mb-3" style={{ color: COLORS.strong }}>Getting stronger 📈</div>
          <div className="flex flex-wrap gap-2">
            {report.improving.map((im) => (
              <span key={im.name} className="px-3 py-1.5 rounded-full text-sm font-semibold" style={{ background: 'rgba(34,197,94,0.12)', color: '#16a34a' }}>{im.name}</span>
            ))}
          </div>
        </section>
      )}

      {/* Focus areas */}
      {report.focusAreas.length > 0 && (
        <section className="rounded-2xl p-5" style={{ background: 'rgba(255,247,237,0.85)', border: '1px solid rgba(249,115,22,0.3)' }}>
          <div className="text-xs font-bold mb-1" style={{ color: COLORS.weak }}>Focus areas 🎯</div>
          <p className="text-xs mb-3" style={{ color: '#78716c' }}>Concepts your child is still working through. A little encouragement here goes a long way.</p>
          <div className="flex flex-col gap-2.5">
            {report.focusAreas.map((fa) => (
              <div key={fa.concept} className="flex flex-col">
                <span className="text-sm font-bold" style={{ color: '#1c1917' }}>{fa.concept}</span>
                {fa.tags.length > 0 && (
                  <span className="text-[11px]" style={{ color: '#a8a29e' }}>{fa.tags.slice(0, 4).join(' · ')}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Suggestion */}
      <section className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.08)' }}>
        <div className="text-xs font-bold mb-2" style={{ color: '#78716c' }}>What you can do 💡</div>
        <p className="text-base leading-relaxed font-semibold" style={{ color: '#1c1917' }}>{report.suggestion}</p>
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
