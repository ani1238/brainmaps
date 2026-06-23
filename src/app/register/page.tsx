'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GridBackground } from '@/components/GridBackground';
import { registerUser } from '@/lib/api';
import { saveAuthToken, saveProfileFromLearner } from '@/lib/storage';

const GRADES = [3, 4, 5, 6, 7] as const;
const BOARDS = ['CBSE', 'ICSE'] as const;

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [grade, setGrade] = useState<number>(6);
  const [board, setBoard] = useState<'CBSE' | 'ICSE'>('CBSE');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit =
    email.includes('@') &&
    name.trim().length >= 2 &&
    password.length >= 8 &&
    !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      const auth = await registerUser(
        email.trim().toLowerCase(),
        name.trim(),
        password,
        grade,
        board,
      );
      saveAuthToken(auth.token);
      saveProfileFromLearner(auth);
      router.push('/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      setError(msg.includes('already') ? 'That email is already registered.' : msg);
    } finally {
      setLoading(false);
    }
  }

  const fieldStyle = (valid: boolean) => ({
    background: '#fff',
    border: `1.5px solid ${valid ? '#4F46E5' : 'rgba(0,0,0,0.12)'}`,
    color: '#1c1917',
    fontFamily: 'inherit',
    boxShadow: valid ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none',
  });

  return (
    <div className="relative min-h-screen flex flex-col" style={{ background: '#F4EFE5' }}>
      <GridBackground />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full opacity-20 blur-[140px]"
          style={{ width: 700, height: 700, background: '#4F46E5', left: '20%', top: '-15%' }} />
        <div className="absolute rounded-full opacity-15 blur-[120px]"
          style={{ width: 500, height: 500, background: '#0d9488', right: '10%', bottom: '-10%' }} />
      </div>

      <header className="relative flex items-center gap-3 px-10 pt-8">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="rgba(79,70,229,0.1)" />
          <circle cx="20" cy="20" r="18" fill="none" stroke="#4F46E5" strokeWidth="1.5" />
          <circle cx="20" cy="20" r="8"  fill="none" stroke="#4F46E5" strokeWidth="1.2" />
        </svg>
        <div>
          <div className="font-extrabold text-2xl leading-none" style={{ color: '#1c1917' }}>BrainMaps</div>
          <div className="text-[11px] font-mono tracking-wider mt-0.5" style={{ color: '#78716c' }}>
            premium learning · classes 3–7
          </div>
        </div>
      </header>

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
            CREATE ACCOUNT
          </div>
          <h1 className="text-3xl font-extrabold mb-2" style={{ color: '#1c1917' }}>
            Start learning.
          </h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: '#78716c' }}>
            Tell us your class and board — you&apos;ll go straight into your curriculum.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-[10px] font-bold tracking-widest mb-2" style={{ color: '#78716c' }}>
                FULL NAME
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                autoComplete="name"
                className="w-full px-4 py-3.5 rounded-xl text-base font-semibold outline-none transition-all"
                style={fieldStyle(name.trim().length >= 2)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest mb-2" style={{ color: '#78716c' }}>
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full px-4 py-3.5 rounded-xl text-base font-semibold outline-none transition-all"
                style={fieldStyle(email.includes('@'))}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-[10px] font-bold tracking-widest mb-2" style={{ color: '#78716c' }}>
                  CLASS
                </label>
                <select
                  value={grade}
                  onChange={e => setGrade(Number(e.target.value))}
                  className="w-full px-4 py-3.5 rounded-xl text-base font-semibold outline-none transition-all appearance-none cursor-pointer"
                  style={fieldStyle(true)}
                >
                  {GRADES.map(g => (
                    <option key={g} value={g}>Class {g}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold tracking-widest mb-2" style={{ color: '#78716c' }}>
                  BOARD
                </label>
                <select
                  value={board}
                  onChange={e => setBoard(e.target.value as 'CBSE' | 'ICSE')}
                  className="w-full px-4 py-3.5 rounded-xl text-base font-semibold outline-none transition-all appearance-none cursor-pointer"
                  style={fieldStyle(true)}
                >
                  {BOARDS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest mb-2" style={{ color: '#78716c' }}>
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="at least 8 characters"
                autoComplete="new-password"
                className="w-full px-4 py-3.5 rounded-xl text-base font-semibold outline-none transition-all"
                style={fieldStyle(password.length >= 8)}
              />
            </div>

            {error && <p className="text-sm font-semibold" style={{ color: '#dc2626' }}>{error}</p>}

            <div className="flex justify-between items-center pt-2">
              <Link href="/" className="text-[11px] font-mono hover:underline" style={{ color: '#78716c' }}>
                ← Back to login
              </Link>
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
                {loading ? 'Creating…' : 'Create account →'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="relative flex justify-center pb-8">
        <div className="text-[11px] font-mono" style={{ color: '#a8a29e' }}>
          BrainMaps · Assessment engine for CBSE & ICSE
        </div>
      </footer>
    </div>
  );
}
