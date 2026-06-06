'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GridBackground } from '@/components/GridBackground';

const CLASSES = [3, 4, 5, 6, 7];
const BOARDS = ['CBSE', 'ICSE'] as const;

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [cls, setCls] = useState<number | null>(null);
  const [board, setBoard] = useState<'CBSE' | 'ICSE' | null>(null);

  const canSubmit = name.trim().length >= 2 && cls !== null && board !== null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    router.push('/dashboard');
  }

  return (
    <div className="relative min-h-screen flex flex-col" style={{ background: '#F4EFE5' }}>
      <GridBackground />

      {/* ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full opacity-20 blur-[140px]"
          style={{ width: 700, height: 700, background: '#4F46E5', left: '20%', top: '-15%' }} />
        <div className="absolute rounded-full opacity-15 blur-[120px]"
          style={{ width: 500, height: 500, background: '#0d9488', right: '10%', bottom: '-10%' }} />
      </div>

      {/* Logo bar */}
      <header className="relative flex items-center gap-3 px-10 pt-8">
        <div className="relative">
          <svg width="40" height="40" viewBox="0 0 40 40">
            <defs>
              <radialGradient id="logo-grad" cx="40%" cy="35%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#4F46E5" />
              </radialGradient>
            </defs>
            <circle cx="20" cy="20" r="18" fill="rgba(79,70,229,0.1)" />
            <circle cx="20" cy="20" r="18" fill="none" stroke="#4F46E5" strokeWidth="1.5" />
            <circle cx="20" cy="20" r="8"  fill="none" stroke="#4F46E5" strokeWidth="1.2" />
          </svg>
        </div>
        <div>
          <div className="font-extrabold text-2xl leading-none" style={{ color: '#1c1917' }}>BrainMaps</div>
          <div className="text-[11px] font-mono tracking-wider mt-0.5" style={{ color: '#78716c' }}>
            premium learning · classes 3–7
          </div>
        </div>
      </header>

      {/* Center glass card */}
      <main className="relative flex-1 flex items-center justify-center px-4 py-12">
        <div
          className="w-full max-w-lg rounded-3xl p-10"
          style={{
            background: 'rgba(255,255,255,0.78)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: '0 40px 100px rgba(79,70,229,0.12), 0 8px 24px rgba(0,0,0,0.06)',
          }}
        >
          <div className="text-[10px] font-bold tracking-widest mb-2" style={{ color: '#78716c' }}>
            STEP 1 · WHO'S LEARNING TODAY
          </div>
          <h1 className="text-3xl font-extrabold mb-2" style={{ color: '#1c1917' }}>
            Welcome to BrainMaps.
          </h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: '#78716c' }}>
            We measure what's stuck and what slipped. No logins, no passwords —
            just your name, class, and board.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Name */}
            <div>
              <label className="block text-[10px] font-bold tracking-widest mb-2" style={{ color: '#78716c' }}>
                YOUR NAME
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Aarav"
                className="w-full px-4 py-3.5 rounded-xl text-base font-semibold outline-none transition-all"
                style={{
                  background: '#fff',
                  border: `1.5px solid ${name.length >= 2 ? '#4F46E5' : 'rgba(0,0,0,0.12)'}`,
                  color: '#1c1917',
                  fontFamily: 'inherit',
                  boxShadow: name.length >= 2 ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none',
                }}
              />
            </div>

            {/* Class + Board */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-bold tracking-widest mb-2" style={{ color: '#78716c' }}>CLASS</label>
                <div className="flex gap-2">
                  {CLASSES.map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCls(n)}
                      className="w-10 h-10 rounded-full font-bold text-base transition-all"
                      style={{
                        border: `1.5px solid ${cls === n ? '#4F46E5' : 'rgba(0,0,0,0.15)'}`,
                        background: cls === n ? 'rgba(79,70,229,0.1)' : '#fff',
                        color: cls === n ? '#4F46E5' : '#44403c',
                        boxShadow: cls === n ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none',
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest mb-2" style={{ color: '#78716c' }}>BOARD</label>
                <div className="flex gap-2.5">
                  {BOARDS.map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBoard(b)}
                      className="px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
                      style={{
                        border: `1.5px solid ${board === b ? '#4F46E5' : 'rgba(0,0,0,0.15)'}`,
                        background: board === b ? 'rgba(79,70,229,0.1)' : '#fff',
                        color: board === b ? '#4F46E5' : '#44403c',
                        boxShadow: board === b ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none',
                      }}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] font-mono" style={{ color: '#78716c' }}>~30 sec · no password</span>
              <button
                type="submit"
                disabled={!canSubmit}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
                style={{
                  background: canSubmit
                    ? 'linear-gradient(135deg, #4F46E5, #6366f1)'
                    : '#9ca3af',
                  boxShadow: canSubmit ? '0 4px 20px rgba(79,70,229,0.35)' : 'none',
                }}
              >
                Open my Brain →
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Premium badge */}
      <footer className="relative flex justify-center pb-8">
        <div className="text-[11px] font-mono" style={{ color: '#a8a29e' }}>
          BrainMaps · v5 · Assessment engine for CBSE & ICSE
        </div>
      </footer>
    </div>
  );
}
