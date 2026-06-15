'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useProfile, getAuthToken } from '@/lib/storage';

// Public routes that never require auth.
const PUBLIC_PATHS = new Set(['/', '/register']);

// Routes that need a valid household token but no specific student yet.
const TOKEN_ONLY_PATHS = new Set(['/students']);

function subscribeHydration() {
  return () => {};
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const profile = useProfile();
  const hydrated = useSyncExternalStore(subscribeHydration, () => true, () => false);

  const isPublic = PUBLIC_PATHS.has(pathname);
  const isTokenOnly = TOKEN_ONLY_PATHS.has(pathname);

  useEffect(() => {
    if (!hydrated || isPublic) return;

    const token = getAuthToken();
    if (!token) {
      router.replace('/');
      return;
    }

    // Protected data pages also require an active student profile.
    if (!isTokenOnly && profile === null) {
      router.replace('/students');
    }
  }, [hydrated, isPublic, isTokenOnly, profile, router]);

  if (isPublic) return <>{children}</>;
  if (!hydrated) return null;

  const token = getAuthToken();
  if (!token) return null;
  if (!isTokenOnly && profile === null) return null;

  return <>{children}</>;
}
