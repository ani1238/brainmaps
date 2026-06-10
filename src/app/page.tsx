'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GridBackground } from '@/components/GridBackground';
import { loginStudent } from '@/lib/api';
import { saveProfile } from '@/lib/storage';

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = name.trim().length >= 2 && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      const student = await loginStudent(name);
      saveProfile({
        id: student.id,
        name: student.name,
        class: student.grade as 3 | 4 | 5 | 6 | 7,
        board: student.board,
        streak: 0,
        lastActiveDate: '',
        enrolledSubjects: ['sci', 'soc', 'eng'],
        onboardingComplete: true,
      });
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open this student profile.');
    } finally {
      setLoading(false);
    }
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
            Enter your name to open your student profile. Passwords will be added later.
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

            {error && <p className="text-sm font-semibold" style={{ color: '#dc2626' }}>{error}</p>}
            <p className="text-xs" style={{ color: '#78716c' }}>
              Test profiles: <strong>Aarav</strong>, <strong>Meera</strong>, or <strong>Kabir</strong>.
            </p>

            {/* Submit */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] font-mono" style={{ color: '#78716c' }}>name only · no password</span>
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
                {loading ? 'Opening…' : 'Open my Brain →'}
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
