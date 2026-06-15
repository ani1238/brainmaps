import type { QuestionLevel } from '@/types';

export function assessmentHref(
  pathname: '/sharpen' | '/recall',
  params: Record<string, string | undefined>,
  returnTo: string,
): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  search.set('returnTo', returnTo);
  return `${pathname}?${search.toString()}`;
}

export function assessmentReturn(
  rawReturnTo: string | null,
  fallback: string,
): { href: string; label: string } {
  const href = rawReturnTo?.startsWith('/') && !rawReturnTo.startsWith('//')
    ? rawReturnTo
    : fallback;
  const pathname = href.split('?')[0];
  const label = pathname === '/sharpen'
    ? "Today's Fix"
    : pathname === '/recall'
      ? 'Revise'
      : pathname === '/dashboard'
        ? 'Home'
        : pathname === '/progress'
          ? 'My Progress'
          : 'Brain Map';
  return { href, label };
}

type FixableProgress = {
  l1State?: string;
  l2State?: string;
  l3State?: string;
  strengthenState?: string;
  reviseState?: string;
};

export type FixStation = {
  level: QuestionLevel;
  label: string;
};

export function failedStation(progress?: FixableProgress | null): FixStation {
  if (progress?.l2State === 'needs_fixing') return { level: 'level2', label: 'Level 2' };
  if (progress?.l3State === 'needs_fixing') return { level: 'level3', label: 'Level 3' };
  if (progress?.strengthenState === 'needs_fixing') return { level: 'strengthen', label: 'Strengthen' };
  if (progress?.reviseState === 'needs_fixing') return { level: 'revise', label: 'Revise' };
  return { level: 'level1', label: 'Level 1' };
}
