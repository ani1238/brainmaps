'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GridBackground } from '@/components/GridBackground';
import { requestPasswordReset } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSubmit = email.includes('@') && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      await requestPasswordReset(email.trim().toLowerCase());
    } finally {
      // Always show the same confirmation — never reveal whether the email exists.
      setSent(true);
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

      <header className="relative flex items-center gap-3 px-6 sm:px-10 pt-8">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="rgba(79,70,229,0.1)" />
          <circle cx="20" cy="20" r="18" fill="none" stroke="#4F46E5" strokeWidth="1.5" />
          <circle cx="20" cy="20" r="8"  fill="none" stroke="#4F46E5" strokeWidth="1.2" />
        </svg>
        <div className="font-extrabold text-2xl leading-none" style={{ color: '#1c1917' }}>BrainMaps</div>
      </header>

      <main className="relative flex-1 flex items-center justify-center px-4 py-12">
        <div
          className="w-full max-w-md rounded-3xl p-6 sm:p-10"
          style={{
            background: 'rgba(255,255,255,0.78)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: '0 40px 100px rgba(79,70,229,0.12), 0 8px 24px rgba(0,0,0,0.06)',
          }}
        >
          <h1 className="text-3xl font-extrabold mb-2" style={{ color: '#1c1917' }}>
            Reset password
          </h1>

          {sent ? (
            <>
              <p className="text-sm leading-relaxed mb-8" style={{ color: '#78716c' }}>
                If an account exists for <strong>{email.trim().toLowerCase()}</strong>, we&apos;ve
                sent a link to reset your password. The link expires in 1 hour.
              </p>
              <Link href="/" className="text-[13px] font-semibold" style={{ color: '#4F46E5' }}>
                ← Back to login
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm leading-relaxed mb-8" style={{ color: '#78716c' }}>
                Enter your email and we&apos;ll send you a link to set a new password.
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

                <div className="flex justify-between items-center pt-2">
                  <Link href="/" className="text-[11px] font-mono hover:underline" style={{ color: '#78716c' }}>
                    ← Back to login
                  </Link>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
                    style={{
                      background: canSubmit ? 'linear-gradient(135deg, #4F46E5, #6366f1)' : '#9ca3af',
                      boxShadow: canSubmit ? '0 4px 20px rgba(79,70,229,0.35)' : 'none',
                    }}
                  >
                    {loading ? 'Sending…' : 'Send reset link →'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
