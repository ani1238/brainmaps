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
