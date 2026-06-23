'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { loginHousehold, requestCallback } from '@/lib/api';
import { saveAuthToken } from '@/lib/storage';

// ─── Marketing hook slides (left panel) ───────────────────────────────────────

interface Hook {
  label: string;
  nav: string;
  headline: ReactNode;
  sub: string;
}

const HOOKS: Hook[] = [
  {
    label: 'The reality',
    nav: 'Reality',
    headline: (
      <>
        School. Tuition. Homework.
        <br />
        But what actually landed?
      </>
    ),
    sub: 'You invest in three layers of education every day. But nobody checks whether any of it actually stuck in your child\u2019s head.',
  },
  {
    label: 'The myth',
    nav: 'Myth',
    headline: <>Reading the chapter again feels productive. It isn\u2019t.</>,
    sub: 'Re-reading creates the illusion of knowing. Real retention only happens when your child retrieves from memory, not when they stare at a page.',
  },
  {
    label: 'The test',
    nav: 'Test',
    headline: (
      <>They say they understood it. Can they explain it in their own words?</>
    ),
    sub: 'That hesitation when you ask them to explain without the book open? That is the gap between recognition and real understanding.',
  },
  {
    label: 'The difference',
    nav: 'Difference',
    headline: <>Ticking the right option is not the same as understanding it.</>,
    sub: 'Most apps test which answer your child can recognise. We test what they can produce, explain, and apply. That\u2019s where the truth is.',
  },
];

const SLIDE_MS = 5000;

export default function LoginPage() {
  const router = useRouter();

  // ── Carousel state ──────────────────────────────────────────────────────────
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % HOOKS.length);
    }, SLIDE_MS);
  }, []);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const goTo = useCallback(
    (index: number) => {
      setCurrent(((index % HOOKS.length) + HOOKS.length) % HOOKS.length);
      startTimer();
    },
    [startTimer],
  );

  // ── Login form state ────────────────────────────────────────────────────────
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const id = identifier.trim();
    if (!id || !password) {
      setLoginError('Please enter your credentials.');
      return;
    }
    if (!id.includes('@')) {
      // Phone login arrives with OTP. For now the password path is email-only.
      setLoginError('Phone sign-in is coming soon \u2014 please use your email for now.');
      return;
    }
    setLoggingIn(true);
    setLoginError('');
    try {
      const auth = await loginHousehold(id.toLowerCase(), password);
      saveAuthToken(auth.token);
      router.push('/students');
    } catch (err) {
      setLoginError(
        err instanceof Error && err.message ? err.message : 'Invalid email or password.',
      );
    } finally {
      setLoggingIn(false);
    }
  }

  // ── Enroll / callback form state ────────────────────────────────────────────
  const [phone, setPhone] = useState('');
  const [enrollDone, setEnrollDone] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState('');

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    const p = phone.trim();
    if (!p) {
      setEnrollError('Please enter your phone number.');
      return;
    }
    setEnrolling(true);
    setEnrollError('');
    try {
      await requestCallback(p);
      setEnrollDone(true);
    } catch {
      setEnrollError('Something went wrong. Please try again.');
    } finally {
      setEnrolling(false);
    }
  }

  return (
    <div className="bm-login">
      <style>{CSS}</style>

      <div className="split">
        {/* ─── LEFT: marketing hooks ─── */}
        <div className="left">
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />

          <div className="logo">
            <span className="logo-icon">🧠</span>
            <span className="logo-text">BrainMaps</span>
          </div>

          <div className="step-counter">
            <span className="step-current">{current + 1}</span> / {HOOKS.length}
          </div>

          <div className="hooks-container">
            {HOOKS.map((hook, i) => (
              <div key={i} className={`hook-slide${i === current ? ' active' : ''}`}>
                <div className="hook-label">{hook.label}</div>
                <h1 className="hook-headline">{hook.headline}</h1>
                <p className="hook-sub">{hook.sub}</p>
              </div>
            ))}
          </div>

          <div className="hook-nav">
            <div className="hook-segments">
              {HOOKS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  className={`hook-segment${i < current ? ' done' : ''}${i === current ? ' active' : ''}`}
                  onClick={() => goTo(i)}
                >
                  {/* key forces a remount so the fill animation restarts each slide */}
                  <div key={i === current ? current : 'static'} className="hook-segment-fill" />
                </button>
              ))}
            </div>

            <div className="hook-bottom-row">
              <div className="hook-label-row">
                {HOOKS.map((hook, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`hook-label-btn${i === current ? ' active' : ''}`}
                    onClick={() => goTo(i)}
                  >
                    {hook.nav}
                  </button>
                ))}
              </div>
              <button type="button" className="hook-next-btn" onClick={() => goTo(current + 1)}>
                Next <span className="hook-next-arrow">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── RIGHT: login + enroll ─── */}
        <div className="right">
          <div className="login-card">
            <h2 className="login-title">Log in</h2>
            <p className="login-subtitle">Welcome back to BrainMaps.</p>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label" htmlFor="login-id">
                  Phone number or Email
                </label>
                <input
                  className="form-input"
                  type="text"
                  id="login-id"
                  placeholder="Enter your phone or email"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="login-pass">
                  Password
                </label>
                <input
                  className="form-input"
                  type="password"
                  id="login-pass"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {loginError && <p className="form-error">{loginError}</p>}
              <button className="btn-login" type="submit" disabled={loggingIn}>
                {loggingIn ? 'Logging in…' : 'Log in'}
              </button>
              <a href="#" className="forgot" onClick={(e) => e.preventDefault()}>
                Forgot password?
              </a>
            </form>
          </div>

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">New here?</span>
            <div className="divider-line" />
          </div>

          <div className="enroll-card">
            <h3 className="enroll-title">Want to enroll your child?</h3>
            <p className="enroll-sub">
              Leave your number and we&apos;ll reach out to walk you through how it works.
            </p>
            <form onSubmit={handleEnroll}>
              <div className="enroll-row">
                <input
                  className="form-input"
                  type="tel"
                  placeholder="Your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={enrollDone}
                  required
                />
                <button
                  className="btn-callback"
                  type="submit"
                  disabled={enrolling || enrollDone}
                  style={
                    enrollDone
                      ? { background: '#10b981', borderColor: '#10b981', color: '#fff' }
                      : undefined
                  }
                >
                  {enrollDone ? '✓ We\u2019ll call you!' : enrolling ? 'Sending…' : 'Request a call'}
                </button>
              </div>
              {enrollError && <p className="form-error">{enrollError}</p>}
            </form>
            <p className="enroll-note">No spam. We&apos;ll call once at a time that works for you.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Scoped styles (ported from the design mock) ──────────────────────────────
// Scoped under `.bm-login` so the generic class names don't leak to other routes.

const CSS = `
.bm-login, .bm-login *, .bm-login *::before, .bm-login *::after {
  margin: 0; padding: 0; box-sizing: border-box;
}
.bm-login {
  font-family: var(--font-inter), 'Inter', -apple-system, sans-serif;
  min-height: 100vh;
  background: #fffcf5;
}
.bm-login .split {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  min-height: 100vh;
}

/* ─── LEFT ─── */
.bm-login .left {
  position: relative;
  background: linear-gradient(165deg, #fffcf5 0%, #fff3e0 40%, #ffe0b2 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 72px;
  overflow-x: hidden;
  overflow-y: auto;
}
.bm-login .left::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}
.bm-login .left::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 30% 50%, rgba(255,152,0,0.1) 0%, transparent 70%);
  pointer-events: none;
}

.bm-login .dot {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,152,0,0.3);
  animation: bm-float 12s ease-in-out infinite;
}
.bm-login .dot:nth-child(1) { width: 6px; height: 6px; top: 15%; left: 20%; animation-delay: 0s; }
.bm-login .dot:nth-child(2) { width: 4px; height: 4px; top: 35%; left: 75%; animation-delay: -3s; }
.bm-login .dot:nth-child(3) { width: 5px; height: 5px; top: 70%; left: 40%; animation-delay: -6s; }
.bm-login .dot:nth-child(4) { width: 3px; height: 3px; top: 85%; left: 80%; animation-delay: -9s; }
.bm-login .dot:nth-child(5) { width: 4px; height: 4px; top: 55%; left: 15%; animation-delay: -4s; }

@keyframes bm-float {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
  50% { transform: translateY(-20px) scale(1.4); opacity: 0.7; }
}

.bm-login .logo {
  position: absolute;
  top: 40px;
  left: 72px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 10;
}
.bm-login .logo-icon { font-size: 22px; filter: drop-shadow(0 0 8px rgba(255,152,0,0.4)); }
.bm-login .logo-text {
  font-size: 18px;
  font-weight: 700;
  color: rgba(0,0,0,0.7);
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.bm-login .step-counter {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 2px;
  color: rgba(230,81,0,0.5);
  margin-bottom: 16px;
  z-index: 5;
}
.bm-login .step-counter .step-current { color: rgba(230,81,0,1); font-size: 16px; }

.bm-login .hooks-container {
  position: relative;
  z-index: 5;
  min-height: 260px;
}
.bm-login .hook-slide {
  position: absolute;
  top: 0; left: 0; width: 100%;
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
  pointer-events: none;
}
.bm-login .hook-slide.active {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}
.bm-login .hook-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(230,81,0,0.8);
  margin-bottom: 24px;
}
.bm-login .hook-headline {
  font-family: var(--font-playfair), 'Playfair Display', Georgia, serif;
  font-size: 40px;
  font-weight: 700;
  line-height: 1.25;
  color: #1a1a2e;
  margin-bottom: 20px;
  max-width: 520px;
}
.bm-login .hook-sub {
  font-size: 16px;
  font-weight: 400;
  line-height: 1.65;
  color: rgba(26,26,46,0.65);
  max-width: 440px;
}

.bm-login .hook-nav { z-index: 10; margin-top: 48px; }
.bm-login .hook-segments { display: flex; gap: 6px; margin-bottom: 20px; }
.bm-login .hook-segment {
  flex: 1;
  height: 3px;
  border-radius: 3px;
  background: rgba(0,0,0,0.08);
  overflow: hidden;
  cursor: pointer;
  border: none;
  padding: 0;
}
.bm-login .hook-segment-fill {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, rgba(255,152,0,0.8), rgba(230,81,0,1));
  border-radius: 3px;
}
.bm-login .hook-segment.done .hook-segment-fill { width: 100%; }
.bm-login .hook-segment.active .hook-segment-fill { animation: bm-segment-fill 5s linear forwards; }

@keyframes bm-segment-fill { from { width: 0%; } to { width: 100%; } }

.bm-login .hook-bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.bm-login .hook-label-row { display: flex; gap: 24px; }
.bm-login .hook-label-btn {
  font-size: 12px;
  font-weight: 600;
  color: rgba(26,26,46,0.3);
  cursor: pointer;
  border: none;
  background: none;
  padding: 4px 0;
  transition: color 0.3s;
  letter-spacing: 0.3px;
  font-family: inherit;
}
.bm-login .hook-label-btn.active { color: rgba(26,26,46,0.9); }
.bm-login .hook-label-btn:hover { color: rgba(26,26,46,0.6); }

.bm-login .hook-next-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(230,81,0,0.4);
  background: rgba(230,81,0,0.1);
  color: rgba(230,81,0,0.9);
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s;
  animation: bm-gentle-pulse 2.5s ease-in-out infinite;
}
.bm-login .hook-next-btn:hover {
  background: rgba(230,81,0,0.2);
  border-color: rgba(230,81,0,0.8);
  color: #E65100;
}
.bm-login .hook-next-arrow { transition: transform 0.3s; }
.bm-login .hook-next-btn:hover .hook-next-arrow { transform: translateX(3px); }

@keyframes bm-gentle-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(230,81,0,0); }
  50% { box-shadow: 0 0 12px 2px rgba(230,81,0,0.2); }
}

/* ─── RIGHT ─── */
.bm-login .right {
  background: #faf9f6;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px 56px;
  position: relative;
  overflow-y: auto;
}
.bm-login .right::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 1px; height: 100%;
  background: linear-gradient(to bottom, transparent, rgba(99,102,241,0.15), transparent);
}

.bm-login .login-card { width: 100%; max-width: 380px; }
.bm-login .login-title { font-size: 28px; font-weight: 700; color: #1a1a2e; margin-bottom: 8px; }
.bm-login .login-subtitle { font-size: 14px; color: #8b8b9e; margin-bottom: 36px; }

.bm-login .form-group { margin-bottom: 20px; }
.bm-login .form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #4a4a5e;
  margin-bottom: 8px;
  letter-spacing: 0.3px;
}
.bm-login .form-input {
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid #e2e0db;
  border-radius: 10px;
  font-size: 15px;
  font-family: inherit;
  background: #ffffff;
  color: #1a1a2e;
  transition: border-color 0.3s, box-shadow 0.3s;
  outline: none;
}
.bm-login .form-input::placeholder { color: #b8b8c8; }
.bm-login .form-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.08); }
.bm-login .form-input:disabled { background: #f3f2ef; color: #8b8b9e; }

.bm-login .form-error { font-size: 13px; color: #dc2626; font-weight: 500; margin-bottom: 16px; }

.bm-login .btn-login {
  width: 100%;
  padding: 15px;
  background: #1a1a2e;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.3s, transform 0.15s;
  letter-spacing: 0.3px;
  margin-top: 8px;
}
.bm-login .btn-login:hover { background: #2d2d4a; }
.bm-login .btn-login:active { transform: scale(0.985); }
.bm-login .btn-login:disabled { opacity: 0.6; cursor: default; }

.bm-login .forgot {
  display: block;
  text-align: right;
  font-size: 13px;
  color: #6366f1;
  text-decoration: none;
  margin-top: 12px;
  font-weight: 500;
}
.bm-login .forgot:hover { text-decoration: underline; }

.bm-login .divider {
  width: 100%;
  max-width: 380px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 40px 0 32px;
}
.bm-login .divider-line { flex: 1; height: 1px; background: #e2e0db; }
.bm-login .divider-text {
  font-size: 12px;
  font-weight: 600;
  color: #b8b8c8;
  letter-spacing: 1px;
  text-transform: uppercase;
  white-space: nowrap;
}

.bm-login .enroll-card { width: 100%; max-width: 380px; }
.bm-login .enroll-title { font-size: 16px; font-weight: 600; color: #1a1a2e; margin-bottom: 6px; }
.bm-login .enroll-sub { font-size: 13px; color: #8b8b9e; margin-bottom: 20px; line-height: 1.5; }
.bm-login .enroll-row { display: flex; gap: 10px; }
.bm-login .enroll-row .form-input { flex: 1; }
.bm-login .btn-callback {
  padding: 14px 22px;
  background: transparent;
  color: #6366f1;
  border: 1.5px solid #6366f1;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s;
  letter-spacing: 0.2px;
}
.bm-login .btn-callback:hover:not(:disabled) { background: #6366f1; color: #ffffff; }
.bm-login .btn-callback:disabled { cursor: default; }
.bm-login .enroll-note { font-size: 11px; color: #b8b8c8; margin-top: 14px; line-height: 1.5; }

/* Mobile */
@media (max-width: 900px) {
  .bm-login .split { grid-template-columns: 1fr; }
  .bm-login .left { min-height: 70vh; padding: 48px 32px; overflow: visible; }
  .bm-login .logo { left: 32px; top: 32px; }
  .bm-login .hook-headline { font-size: 32px; }
  .bm-login .right { padding: 48px 32px; }
}
`;
