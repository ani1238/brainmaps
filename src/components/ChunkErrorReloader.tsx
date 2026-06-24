'use client';

import { useEffect } from 'react';

// After a deploy the hashed JS chunk filenames change. A browser that already
// loaded the page HTML (which references the OLD chunk hashes) can then fail to
// fetch those chunks — the page renders its server HTML but never hydrates, so
// nothing is clickable until the caches settle. This catches that specific
// failure (a chunk / dynamic-import load error) and does a single, guarded hard
// reload to pull the fresh build. It does nothing for any other kind of error.
const CHUNK_ERROR = /(ChunkLoadError|Loading chunk [\w-]+ failed|Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed)/i;

// Don't reload more than once in this window, so a persistently-failing chunk
// can never trap the user in a reload loop.
const RELOAD_COOLDOWN_MS = 20_000;
const STORAGE_KEY = 'bm:lastChunkReloadAt';

function looksLikeChunkError(value: unknown): boolean {
  if (!value) return false;
  if (value instanceof Error) {
    return value.name === 'ChunkLoadError' || CHUNK_ERROR.test(value.message);
  }
  return CHUNK_ERROR.test(String(value));
}

function recoverOnce() {
  try {
    const last = Number(sessionStorage.getItem(STORAGE_KEY) ?? 0);
    if (Date.now() - last < RELOAD_COOLDOWN_MS) return; // already tried recently — avoid a loop
    sessionStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    // sessionStorage unavailable (private mode quota etc.) — reload at most once anyway
  }
  window.location.reload();
}

export function ChunkErrorReloader() {
  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      if (looksLikeChunkError(e.error) || looksLikeChunkError(e.message)) recoverOnce();
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      if (looksLikeChunkError(e.reason)) recoverOnce();
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  return null;
}
