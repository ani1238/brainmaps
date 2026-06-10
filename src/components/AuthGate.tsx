'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getProfile } from '@/lib/storage';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(pathname === '/');

  useEffect(() => {
    if (pathname === '/') {
      setReady(true);
      return;
    }
    if (!getProfile()) {
      setReady(false);
      router.replace('/');
      return;
    }
    setReady(true);
  }, [pathname, router]);

  if (!ready) return null;
  return children;
}
