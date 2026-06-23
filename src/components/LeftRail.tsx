'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { fetchToday, fetchDashboard, logoutUser } from '@/lib/api';
import { clearProfile, clearAuthToken, useProfile } from '@/lib/storage';

interface LeftRailProps {
  studentName?: string;
  studentClass?: number;
  board?: string;
  // Optional overrides; when omitted, LeftRail fetches real counts itself.
  streak?: number;
  sharpenCount?: number;
  recallCount?: number;
}

const NAV = [
  { href: '/dashboard', label: 'Today',        icon: '🏠' },
  { href: '/brain-map', label: 'Map',          icon: '🧠' },
  { href: '/progress',  label: 'My Progress',  icon: '📈' },
];

export function LeftRail({
  studentName,
  studentClass,
  board,
  streak: streakProp,
  sharpenCount: sharpenProp,
  recallCount: recallProp,
}: LeftRailProps) {
  const pathname = usePathname();
  const router = useRouter();
  const profile = useProfile();
  const displayName = studentName ?? profile?.name ?? 'Student';
  const displayClass = studentClass ?? profile?.class ?? 6;
  const displayBoard = board ?? profile?.board ?? 'CBSE';

  // Live counts — fetched once so the sidebar is correct on every page.
  const [live, setLive] = useState<{ fix: number; revise: number; streak: number } | null>(null);
  useEffect(() => {
    Promise.all([fetchToday(), fetchDashboard()])
      .then(([t, d]) => setLive({ fix: t.fixQueue.length, revise: t.reviseQueue.length, streak: d.streak.days }))
      .catch(() => {});
  }, []);

  const sharpenCount = sharpenProp ?? live?.fix ?? 0;
  const recallCount = recallProp ?? live?.revise ?? 0;
  const streak = streakProp ?? live?.streak ?? 0;

  return (
    <aside
      className="flex flex-col h-full border-r"
      style={{
        width: 240,
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgba(79,70,229,0.15)',
        padding: '24px 18px',
        gap: 20,
      }}
    >
      {/* Logo + brand */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <svg width="36" height="36" viewBox="0 0 36 36">
            <defs>
              <radialGradient id="brain-grad" cx="40%" cy="35%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#4F46E5" />
              </radialGradient>
            </defs>
            <circle cx="18" cy="18" r="16" fill="url(#brain-grad)" opacity="0.12" />
            <circle cx="18" cy="18" r="16" fill="none" stroke="#4F46E5" strokeWidth="1.5" />
            <circle cx="18" cy="18" r="7"  fill="none" stroke="#4F46E5" strokeWidth="1" />
          </svg>
        </div>
        <div>
          <div className="font-extrabold text-lg leading-none" style={{ color: '#1c1917' }}>BrainMaps</div>
          <div className="font-mono text-[10px] tracking-wider mt-0.5" style={{ color: '#78716c' }}>
            PREMIUM · CLASSES 3–7
          </div>
        </div>
      </div>

      {/* Student info */}
      <div
        className="px-3 py-2.5 rounded-xl text-sm"
        style={{ background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.12)' }}
      >
        <div className="text-[10px] font-bold tracking-widest mb-1" style={{ color: '#78716c' }}>STUDENT</div>
        <div className="font-bold text-base" style={{ color: '#1c1917' }}>{displayName}</div>
        <div className="text-[11px] font-mono" style={{ color: '#78716c' }}>
          Class {displayClass} · {displayBoard}
        </div>
        <button
          type="button"
          onClick={async () => {
            try { await logoutUser(); } catch { /* revoke best-effort */ }
            clearAuthToken();
            clearProfile();
            router.push('/');
          }}
          className="mt-2 text-[11px] font-semibold"
          style={{ color: '#4F46E5' }}
        >
          Log out
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {NAV.map(n => {
          const active = pathname === n.href || pathname.startsWith(n.href + '/');
          return (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                color: active ? '#4F46E5' : '#44403c',
                background: active ? 'rgba(79,70,229,0.1)' : 'transparent',
                border: active ? '1px solid rgba(79,70,229,0.2)' : '1px solid transparent',
              }}
            >
              <span className="text-base">{n.icon}</span>
              {n.label}
            </Link>
          );
        })}
      </nav>

      {/* Today's queue card */}
      <div
        className="mt-auto rounded-2xl p-4"
        style={{
          background: 'rgba(255,255,255,0.8)',
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        }}
      >
        <div className="text-xs font-bold mb-3" style={{ color: '#78716c' }}>Today&apos;s plan</div>

        <div className="flex items-center gap-2.5 mb-2">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: '#f97316' }}
          />
          <span className="text-sm" style={{ color: '#44403c' }}>
            <strong>{sharpenCount}</strong> to fix
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: '#22c55e' }}
          />
          <span className="text-sm" style={{ color: '#44403c' }}>
            <strong>{recallCount}</strong> to revise
          </span>
        </div>

        <div
          className="mt-3 pt-3 flex items-center justify-between"
          style={{ borderTop: '1px dashed #a8a29e' }}
        >
          <span className="text-xs font-bold" style={{ color: '#78716c' }}>Streak</span>
          <span className="font-extrabold text-xl">{streak} 🔥</span>
        </div>
      </div>
    </aside>
  );
}
