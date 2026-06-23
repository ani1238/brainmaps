'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useProfile, getAuthToken, saveProfileFromLearner, clearAuthToken } from '@/lib/storage';
import { fetchMe } from '@/lib/api';

// Public routes that never require auth.
const PUBLIC_PATHS = new Set(['/', '/register']);

function subscribeHydration() {
  return () => {};
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const profile = useProfile();
  const hydrated = useSyncExternalStore(subscribeHydration, () => true, () => false);
  const rehydrating = useRef(false);

  const isPublic = PUBLIC_PATHS.has(pathname);

  useEffect(() => {
    if (!hydrated || isPublic) return;

    const token = getAuthToken();
    if (!token) {
      router.replace('/');
      return;
    }

    // Token but no local profile (e.g. a fresh device): rehydrate from the API.
    if (profile === null && !rehydrating.current) {
      rehydrating.current = true;
      fetchMe()
        .then(learner => saveProfileFromLearner(learner))
        .catch(() => {
          clearAuthToken();
          router.replace('/');
        })
        .finally(() => {
          rehydrating.current = false;
        });
    }
  }, [hydrated, isPublic, profile, router]);

  if (isPublic) return <>{children}</>;
  if (!hydrated) return null;

  const token = getAuthToken();
  if (!token) return null;
  if (profile === null) return null; // waiting on rehydration

  return <>{children}</>;
}
