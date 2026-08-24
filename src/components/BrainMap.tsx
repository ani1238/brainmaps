'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SUBJECTS, COLORS, MASTERY_MAP, subjectDisplay, type MasteryState } from '@/lib/tokens';
import { GridBackground } from './GridBackground';
import { RightPanel } from './RightPanel';
import type { Concept } from '@/types';
import { CONCEPT_DATA, CONCEPT_BY_ID, ENGLISH_TRACKS } from '@/data/dummy';
import { fetchChapters, fetchConcept, fetchConcepts, fetchToday, fetchDashboard, type ApiChapter, type ApiConceptDetail, type ApiDashboard } from '@/lib/api';
import { assessmentHref } from '@/lib/navigation';

type MapLevel = 'subject' | 'chapter' | 'concept' | 'english';

interface BreadcrumbEntry { level: MapLevel; label: string; key: string; }

// ── Orbital math helpers ──────────────────────────────────────────────────

function polarPos(cx: number, cy: number, r: number, i: number, total: number, offsetAngle = -Math.PI / 2) {
  const a = (i / total) * Math.PI * 2 + offsetAngle;
  return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, angle: a };
}

// ── Mastery state color ───────────────────────────────────────────────────

function masteryColor(state: MasteryState) {
  return MASTERY_MAP[state].color;
}

// Colour for one station segment in the concept-node level bar. `active` marks
// the station currently being worked on (it pulses).
function segColor(state?: string): { bg: string; active: boolean } {
  switch (state) {
    case 'done':         return { bg: COLORS.strong, active: false };
    case 'needs_fixing': return { bg: COLORS.weak, active: true };
    case 'current':      return { bg: COLORS.indigo, active: true };
    default:             return { bg: 'rgba(0,0,0,0.12)', active: false };
  }
}

// Build a panel-ready Concept from a single-concept API payload.
function apiDetailToConcept(c: ApiConceptDetail): Concept {
  return {
    id: c.id,
    name: c.name,
    state: (c.progress?.state ?? 'NOT_STARTED') as Concept['state'],
    score: c.progress?.emaScore,
    attempts: c.progress?.totalAttempts,
    l1State: c.progress?.l1State,
    l2State: c.progress?.l2State,
    l3State: c.progress?.l3State,
    strengthenState: c.progress?.strengthenState,
    reviseState: c.progress?.reviseState,
    reviseUnlocked: c.progress?.reviseUnlocked,
    reviseSchedule: c.reviseSchedule,
  };
}

// ── Main BrainMap component ───────────────────────────────────────────────

export function BrainMap({ width = 1200, height = 900 }: { width?: number; height?: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── The URL is the single source of truth for the current layer ──────────
  // subject / chapter / conceptId query params fully describe which layer is
  // shown, so the in-app back arrow, the native/phone back+forward buttons, and
  // refresh all behave correctly (every layer is a real history entry).
  const subjectParam = searchParams.get('subject');
  const chapterParam = searchParams.get('chapter');
  const conceptParam = searchParams.get('conceptId');

  const selectedSubject = subjectParam;
  const selectedChapter = chapterParam;
  const showPanel = Boolean(conceptParam);
  const level: MapLevel =
    !subjectParam ? 'subject'
      : subjectParam === 'english' && !chapterParam ? 'english'
        : !chapterParam ? 'chapter'
          : 'concept';

  // Data loaded from the URL params.
  const [chapters, setChapters] = useState<ApiChapter[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);

  // Layer key — also used to re-trigger the orbit zoom animation on each change.
  const navKey = `${subjectParam ?? ''}|${chapterParam ?? ''}`;

  // Breadcrumb trail derived from the current subject/chapter.
  const breadcrumb = useMemo<BreadcrumbEntry[]>(() => {
    const crumbs: BreadcrumbEntry[] = [];
    if (!selectedSubject) return crumbs;
    if (selectedSubject === 'english') {
      crumbs.push({ level: 'subject', label: 'English', key: 'english' });
    } else if (selectedSubject.startsWith('english_')) {
      crumbs.push({ level: 'subject', label: 'English', key: 'english' });
      const track = ENGLISH_TRACKS.find(t => ENGLISH_TRACK_SUBJECT[t.key] === selectedSubject);
      crumbs.push({ level: 'chapter', label: track?.label ?? subjectDisplay(selectedSubject).label, key: selectedSubject });
    } else {
      crumbs.push({ level: 'subject', label: subjectDisplay(selectedSubject).label, key: selectedSubject });
    }
    if (selectedChapter) {
      const name = chapters.find(c => c.id === selectedChapter)?.name ?? 'Chapter';
      crumbs.push({ level: 'chapter', label: name, key: selectedChapter });
    }
    return crumbs;
  }, [selectedSubject, selectedChapter, chapters]);

  // Live Today's-Fix / Revise queue counts for the bottom CTAs.
  const [queueCounts, setQueueCounts] = useState<{ fix: number; revise: number }>({ fix: 0, revise: 0 });
  useEffect(() => {
    fetchToday()
      .then(t => setQueueCounts({ fix: t.fixQueue.length, revise: t.reviseQueue.length }))
      .catch(() => {});
  }, []);

  // Per-subject progress (for the subject-bubble markers). English aggregates
  // its tracks (english_vocab, english_grammar, …) into one node.
  const [subjects, setSubjects] = useState<ApiDashboard['subjects']>([]);
  useEffect(() => {
    fetchDashboard().then(d => setSubjects(d.subjects)).catch(() => {});
  }, []);
  function subjectProgress(key: string): { pct: number; mastered: number; total: number; inProgress: number } {
    const rows = key === 'english'
      ? subjects.filter(s => s.key.startsWith('english'))
      : subjects.filter(s => s.key === key);
    const total = rows.reduce((a, s) => a + s.total, 0);
    const mastered = rows.reduce((a, s) => a + s.strong, 0);
    const attempted = rows.reduce((a, s) => a + s.attempted, 0);
    return {
      total,
      mastered,
      inProgress: Math.max(0, attempted - mastered),
      pct: total > 0 ? Math.round((mastered / total) * 100) : 0,
    };
  }
  // Once the dashboard responds, only show subjects available for this
  // learner's grade and board. Keep the full list during the initial load.
  const visibleSubjects = subjects.length > 0
    ? SUBJECTS.filter(s => subjectProgress(s.key).total > 0)
    : SUBJECTS;

  // Measure the actual container so the orbit centers and scales to any screen
  // (the component is also given sensible defaults for SSR / first paint).
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState<{ w: number; h: number }>({ w: width, h: height });
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setDims({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cy = dims.h / 2 - 20;

  // The concept side panel is a 420px sidebar on desktop, but a full-screen
  // bottom sheet on mobile (so it doesn't squeeze the orbit off-screen).
  const isNarrow = dims.w < 640;
  const panelW = showPanel && !isNarrow ? 420 : 0;
  const orbitCx = (dims.w - panelW) / 2;

  // Scale the orbit radius so all nodes fit inside the measured container
  // (phones are far smaller than the 1200×900 desktop design).
  const orbitScale = Math.max(0.5, Math.min(1, Math.min(dims.w - panelW, dims.h) / 760));
  const rSubject = 240 * orbitScale;
  const rChapter = 260 * orbitScale;
  const rConcept = 270 * orbitScale;
  const rEnglish = 220 * orbitScale;

  // On phones the orbit radius shrinks but node sizes are fixed, so they
  // overlap. Scale the nodes down on narrow screens to restore spacing.
  const nodeScale = isNarrow ? 0.6 : 1;

  // ── Navigation: every drill-down pushes a URL ───────────────────────────
  function buildMapUrl(subject?: string | null, chapter?: string | null, conceptId?: string | null) {
    const sp = new URLSearchParams();
    if (subject) sp.set('subject', subject);
    if (chapter) sp.set('chapter', chapter);
    if (conceptId) sp.set('conceptId', conceptId);
    const qs = sp.toString();
    return qs ? `/brain-map?${qs}` : '/brain-map';
  }

  function zoomToSubject(subjectKey: string) {
    router.push(buildMapUrl(subjectKey));
  }
  // English track (Vocabulary, Grammar, …) → its chapters. Each track is its
  // own DB subject_key (english_vocab, english_grammar, …).
  function zoomToEnglishTrack(trackSubjectKey: string) {
    router.push(buildMapUrl(trackSubjectKey));
  }
  function zoomToChapter(chapterId: string) {
    router.push(buildMapUrl(selectedSubject, chapterId));
  }
  function openConcept(concept: Concept) {
    router.push(buildMapUrl(selectedSubject, selectedChapter, concept.id));
  }
  // In-app back mirrors the native/phone back button.
  function goBack() {
    router.back();
  }
  // URL for a breadcrumb crumb, so users can jump straight to a level.
  function crumbUrl(b: BreadcrumbEntry): string {
    if (b.level === 'subject') return buildMapUrl(b.key);
    if (b.key.startsWith('english_')) return buildMapUrl(b.key); // a track is its own subject
    return buildMapUrl(selectedSubject, b.key);
  }

  // Load the subject's chapters whenever the subject changes. English itself has
  // no chapters (it shows its track picker), but each english_<track> does.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!selectedSubject || selectedSubject === 'english') {
        if (!cancelled) setChapters([]);
        return;
      }
      if (!cancelled) setChapters([]);
      try {
        const data = await fetchChapters(selectedSubject);
        if (!cancelled) setChapters(data);
      } catch {
        if (!cancelled) setChapters([]);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedSubject]);

  // Resolve the concept object for the open panel from its id in the URL.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!conceptParam) { if (!cancelled) setSelectedConcept(null); return; }
      const loc = CONCEPT_BY_ID[conceptParam];
      if (loc) { if (!cancelled) setSelectedConcept(loc); return; }
      try {
        const c = await fetchConcept(conceptParam);
        if (!cancelled) setSelectedConcept(apiDetailToConcept(c));
      } catch {
        // unknown concept — leave the panel without details
      }
    })();
    return () => { cancelled = true; };
  }, [conceptParam]);

  // A bare ?conceptId= deep-link (e.g. returning from a session) carries no
  // subject/chapter. Canonicalise the URL so the concept orbit beneath the panel
  // renders and back/forward behave. router.replace keeps it out of history.
  useEffect(() => {
    if (!conceptParam || (subjectParam && chapterParam)) return;
    const loc = CONCEPT_BY_ID[conceptParam];
    if (loc) {
      router.replace(buildMapUrl(loc.subjectKey, loc.chapterId, conceptParam));
      return;
    }
    let cancelled = false;
    fetchConcept(conceptParam)
      .then(c => { if (!cancelled) router.replace(buildMapUrl(c.subjectKey, c.chapterId, conceptParam)); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [conceptParam, subjectParam, chapterParam, router]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden" style={{ background: 'transparent' }}>
      <GridBackground />

      {/* ambient glow blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full opacity-20 blur-[120px]"
          style={{ width: 600, height: 600, background: '#4F46E5', left: orbitCx - 300, top: cy - 300 }} />
        <div className="absolute rounded-full opacity-10 blur-[100px]"
          style={{ width: 400, height: 400, background: '#0d9488', left: orbitCx + 100, top: cy - 150 }} />
      </div>

      {/* Breadcrumb + back */}
      {level !== 'subject' && (
        <div className="absolute left-6 top-5 flex items-center gap-3 z-10">
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:bg-white/80"
            style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.1)', color: '#44403c' }}
          >
            ← back
          </button>
          <div className="text-xs font-semibold flex items-center flex-wrap gap-x-1" style={{ color: '#78716c' }}>
            <button onClick={() => router.push('/brain-map')} className="hover:underline">Brain</button>
            {breadcrumb.map((b, i) => {
              const isLast = i === breadcrumb.length - 1;
              return (
                <span key={`${b.key}-${i}`} className="flex items-center gap-x-1">
                  <span>›</span>
                  {isLast
                    ? <span style={{ color: '#44403c' }}>{b.label}</span>
                    : <button onClick={() => router.push(crumbUrl(b))} className="hover:underline">{b.label}</button>}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Header (subject level) */}
      {level === 'subject' && (
        <div className="absolute left-6 top-5 right-6 flex justify-between items-start z-10">
          <div>
            <div className="text-xs font-bold mb-1" style={{ color: '#4F46E5' }}>Your Brain Map 🧠</div>
            <h1 className="text-2xl font-extrabold" style={{ color: '#1c1917' }}>Pick a subject to explore!</h1>
          </div>
          <div className="text-xs" style={{ color: '#78716c' }}>
            {visibleSubjects.length} {visibleSubjects.length === 1 ? 'subject' : 'subjects'} · {queueCounts.revise} due to check
          </div>
        </div>
      )}

      {/* SVG layer — connection lines + orbit rings */}
      <svg
        key={`svg-${navKey}`}
        className="absolute inset-0 pointer-events-none animate-fade-in"
        width="100%" height="100%"
        style={{ overflow: 'visible' }}
      >
        {level === 'subject' && (
          <>
            {/* orbit rings */}
            <circle cx={orbitCx} cy={cy} r={rSubject} fill="none" stroke="rgba(168,162,158,0.3)" strokeWidth={1} strokeDasharray="4 6" />
            {/* connection lines */}
            {visibleSubjects.map((s, i) => {
              const pos = polarPos(orbitCx, cy, rSubject, i, visibleSubjects.length);
              return (
                <line key={s.key}
                  x1={orbitCx} y1={cy} x2={pos.x} y2={pos.y}
                  stroke="rgba(79,70,229,0.2)" strokeWidth={1}
                  strokeDasharray="4 4"
                />
              );
            })}
          </>
        )}

        {level === 'chapter' && selectedSubject && (
          <>
            <circle cx={orbitCx} cy={cy} r={rChapter} fill="none" stroke="rgba(168,162,158,0.3)" strokeWidth={1} strokeDasharray="4 6" />
            {chapters.map((ch, i) => {
              const pos = polarPos(orbitCx, cy, rChapter, i, chapters.length);
              return (
                <line key={ch.id}
                  x1={orbitCx} y1={cy} x2={pos.x} y2={pos.y}
                  stroke="rgba(79,70,229,0.2)" strokeWidth={1}
                  strokeDasharray="4 4"
                />
              );
            })}
          </>
        )}

        {level === 'concept' && selectedChapter && (
          <>
            <circle cx={orbitCx} cy={cy} r={rConcept} fill="none" stroke="rgba(168,162,158,0.3)" strokeWidth={1} strokeDasharray="4 6" />
            {(CONCEPT_DATA[selectedChapter] ?? []).map((c, i) => {
              const total = (CONCEPT_DATA[selectedChapter] ?? []).length;
              const pos = polarPos(orbitCx, cy, rConcept, i, total);
              const col = masteryColor(c.state);
              return (
                <line key={c.id}
                  x1={orbitCx} y1={cy} x2={pos.x} y2={pos.y}
                  stroke={col} strokeWidth={0.8} strokeOpacity={0.3}
                />
              );
            })}
          </>
        )}

        {level === 'english' && (
          <>
            <circle cx={orbitCx} cy={cy} r={rEnglish} fill="none" stroke={COLORS.english + '44'} strokeWidth={1.5} strokeDasharray="8 5" />
            {ENGLISH_TRACKS.map((t, i) => {
              const pos = polarPos(orbitCx, cy, rEnglish, i, ENGLISH_TRACKS.length);
              return (
                <line key={t.key}
                  x1={orbitCx} y1={cy} x2={pos.x} y2={pos.y}
                  stroke={COLORS.english} strokeWidth={1.2} strokeOpacity={0.5}
                />
              );
            })}
          </>
        )}
      </svg>

      {/* Center node */}
      <CenterNode
        key={`center-${navKey}`}
        level={level}
        cx={orbitCx}
        cy={cy}
        selectedSubject={selectedSubject}
      />

      {/* Orbital nodes */}
      {level === 'subject' && (
        <SubjectNodes
          key={`subj-${navKey}`}
          cx={orbitCx} cy={cy} r={rSubject} scale={nodeScale}
          subjects={visibleSubjects}
          progressFor={subjectProgress}
          onSelect={zoomToSubject}
        />
      )}

      {level === 'chapter' && selectedSubject && (
        <ChapterNodes
          key={`chap-${navKey}`}
          cx={orbitCx} cy={cy} r={rChapter} scale={nodeScale}
          chapters={chapters}
          subjectColor={subjectDisplay(selectedSubject).color}
          onSelect={zoomToChapter}
        />
      )}

      {level === 'concept' && selectedChapter && (
        <ConceptNodes
          key={`conc-${navKey}`}
          cx={orbitCx} cy={cy} r={rConcept} scale={nodeScale}
          chapterId={selectedChapter}
          onSelect={openConcept}
        />
      )}

      {level === 'english' && (
        <EnglishTracks
          key={`eng-${navKey}`}
          cx={orbitCx} cy={cy} r={rEnglish} scale={nodeScale}
          onSelect={zoomToEnglishTrack}
        />
      )}

      {/* Bottom CTAs (raised above the mobile bottom nav) */}
      <div className="absolute bottom-20 lg:bottom-6 left-0 right-0 flex flex-wrap justify-center gap-3 lg:gap-4 px-3">
        <button
          onClick={() => router.push('/sharpen')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: '#f97316', boxShadow: '0 4px 20px rgba(249,115,22,0.35)' }}
        >
          🔧 Today&apos;s Fix · {queueCounts.fix}
        </button>
        <button
          onClick={() => router.push('/recall')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all hover:bg-white/80"
          style={{
            background: 'rgba(255,255,255,0.65)',
            border: '1.5px solid #22c55e',
            color: '#16a34a',
            backdropFilter: 'blur(8px)',
          }}
        >
          🔄 Revise · {queueCounts.revise}
        </button>
      </div>

      {/* Right Panel */}
      {showPanel && selectedConcept && (() => {
        // Last chapter-level crumb is the real chapter (an English track also
        // sits at chapter level, so take the last match, not the first).
        const chapterName = [...breadcrumb].reverse().find(b => b.level === 'chapter')?.label ?? 'Chapter';
        const sd = subjectDisplay(selectedSubject);
        return (
          <RightPanel
            key={selectedConcept.id}
            concept={selectedConcept}
            chapterName={chapterName}
            subjectName={sd.label}
            subjectColor={sd.color}
            onClose={() => router.push(buildMapUrl(selectedSubject, selectedChapter))}
            onStartSharpen={() => router.push(assessmentHref(
              '/sharpen',
              { conceptId: selectedConcept.id },
              `/brain-map?conceptId=${selectedConcept.id}`,
            ))}
            onStartRecall={() => router.push(assessmentHref(
              '/sharpen',
              { conceptId: selectedConcept.id, level: 'revise' },
              `/brain-map?conceptId=${selectedConcept.id}`,
            ))}
          />
        );
      })()}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function CenterNode({
  level, cx, cy, selectedSubject,
}: {
  level: MapLevel; cx: number; cy: number; selectedSubject: string | null;
}) {
  const subj = SUBJECTS.find(s => s.key === selectedSubject);

  if (level === 'subject') {
    return (
      <div className="absolute pointer-events-none animate-brain-pulse"
        style={{ left: cx - 56, top: cy - 56, width: 112, height: 112 }}>
        <div className="w-full h-full rounded-full flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle at 35% 35%, #6366f1, #4F46E5)',
            boxShadow: '0 0 40px rgba(79,70,229,0.4), 0 0 0 8px rgba(79,70,229,0.1)',
          }}>
          <span style={{ fontSize: 48 }}>🧠</span>
        </div>
      </div>
    );
  }

  if (level === 'english') {
    return (
      <div className="absolute flex flex-col items-center pointer-events-none"
        style={{ left: cx - 64, top: cy - 64 }}>
        <div className="w-32 h-32 rounded-full flex items-center justify-center"
          style={{
            background: `${COLORS.english}22`,
            border: `3px solid ${COLORS.english}`,
            boxShadow: `0 0 30px ${COLORS.english}33`,
          }}>
          <div className="text-center">
            <div className="text-2xl font-extrabold" style={{ color: COLORS.english }}>English</div>
            <div className="text-xs font-mono mt-1" style={{ color: COLORS.english + 'aa' }}>5 TRACKS</div>
          </div>
        </div>
      </div>
    );
  }

  // English track chapter view — selectedSubject is an english_* sub-subject
  if (selectedSubject && selectedSubject.startsWith('english')) {
    const sd = subjectDisplay(selectedSubject);
    const trackLabel = sd.label.replace('English · ', '');
    return (
      <div className="absolute flex flex-col items-center pointer-events-none"
        style={{ left: cx - 64, top: cy - 64 }}>
        <div className="w-32 h-32 rounded-full flex items-center justify-center"
          style={{
            background: `${COLORS.english}1a`,
            border: `3px solid ${COLORS.english}`,
            boxShadow: `0 0 30px ${COLORS.english}33`,
          }}>
          <div className="text-center px-2">
            <div className="text-base font-extrabold" style={{ color: COLORS.english }}>English</div>
            <div className="text-xs font-bold mt-0.5" style={{ color: COLORS.english }}>{trackLabel}</div>
          </div>
        </div>
      </div>
    );
  }

  if (subj) {
    return (
      <div className="absolute flex flex-col items-center pointer-events-none"
        style={{ left: cx - 64, top: cy - 64 }}>
        <div className="w-32 h-32 rounded-full flex items-center justify-center"
          style={{
            background: `${subj.color}1a`,
            border: `3px solid ${subj.color}`,
            boxShadow: `0 0 30px ${subj.color}33`,
          }}>
          <div className="text-center">
            <div className="text-3xl mb-0.5">{subj.icon}</div>
            <div className="text-sm font-bold" style={{ color: subj.color }}>{subj.label}</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function SubjectNodes({ cx, cy, r, scale = 1, subjects, progressFor, onSelect }: {
  cx: number; cy: number; r: number; scale?: number;
  subjects: typeof SUBJECTS;
  progressFor: (key: string) => { pct: number; mastered: number; total: number; inProgress: number };
  onSelect: (key: string, label: string) => void;
}) {
  return (
    <>
      {subjects.map((s, i) => {
        const { x, y } = polarPos(cx, cy, r, i, subjects.length);
        const prog = progressFor(s.key);
        const hasDue = prog.inProgress > 0;
        const subtitle = prog.total > 0
          ? `${prog.mastered}/${prog.total} mastered`
          : (s.key === 'english' ? '5 tracks' : 'tap to explore');
        // progress arc geometry (r=44 within a 96px box)
        const circ = 2 * Math.PI * 44;
        return (
          <div
            key={s.key}
            className="absolute flex flex-col items-center cursor-pointer group"
            style={{
              left: x - 48, top: y - 48,
              transform: `scale(${scale})`, transformOrigin: '50% 48px',
              animationDelay: `${i * 80}ms`,
              animation: 'fade-in 0.4s ease-out both',
            }}
            onClick={() => onSelect(s.key, s.label)}
          >
            <div className="relative w-24 h-24">
              {/* mastery progress ring */}
              <svg className="absolute inset-0 -rotate-90" width="96" height="96" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="44" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="4" />
                {prog.pct > 0 && (
                  <circle
                    cx="48" cy="48" r="44" fill="none" stroke={COLORS.strong} strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${(prog.pct / 100) * circ} ${circ}`}
                  />
                )}
              </svg>
              {/* glass disc */}
              <div className="absolute inset-1 rounded-full transition-all group-hover:scale-105 group-active:scale-95"
                style={{
                  background: 'rgba(255,255,255,0.75)',
                  backdropFilter: 'blur(8px)',
                  border: '2px solid rgba(255,255,255,0.9)',
                  boxShadow: `0 8px 32px rgba(0,0,0,0.1), 0 0 0 4px ${s.color}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                <div className="flex flex-col items-center">
                  <span style={{ fontSize: 26 }}>{s.icon}</span>
                  <span className="text-xs font-bold mt-0.5" style={{ color: s.color }}>{s.letter}</span>
                </div>
              </div>
              {/* "work in progress here" badge */}
              {hasDue && (
                <div
                  className="absolute top-0.5 right-1 w-3.5 h-3.5 rounded-full animate-recall-pulse"
                  style={{ background: '#f97316', border: '2px solid white' }}
                />
              )}
            </div>
            <div className="mt-2 text-center">
              <div className="text-sm font-bold" style={{ color: '#1c1917' }}>{s.label}</div>
              <div className="text-[10px] font-mono" style={{ color: '#78716c' }}>
                {subtitle}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

function ChapterNodes({ cx, cy, r, chapters, subjectColor, scale = 1, onSelect }: {
  cx: number; cy: number; r: number;
  chapters: ApiChapter[]; subjectColor: string; scale?: number;
  onSelect: (id: string, name: string) => void;
}) {
  if (chapters.length === 0) {
    return (
      <div
        className="absolute text-sm font-semibold animate-pulse"
        style={{ left: cx - 60, top: cy + 80, color: '#78716c' }}
      >
        Loading chapters…
      </div>
    );
  }

  return (
    <>
      {chapters.map((ch, i) => {
        const { x, y } = polarPos(cx, cy, r, i, chapters.length);
        const pct = ch.conceptCount > 0 ? ch.mastered / ch.conceptCount : 0;
        const circ = 2 * Math.PI * 36;
        const fullyDone = ch.conceptCount > 0 && ch.mastered === ch.conceptCount;
        return (
          <div
            key={ch.id}
            className="absolute flex flex-col items-center cursor-pointer group"
            style={{
              left: x - 56, top: y - 56,
              transform: `scale(${scale})`, transformOrigin: '50% 40px',
              animationDelay: `${i * 60}ms`,
              animation: 'fade-in 0.35s ease-out both',
            }}
            onClick={() => onSelect(ch.id, ch.name)}
          >
            <div className="relative w-20 h-20">
              {/* mastery progress ring */}
              <svg className="absolute inset-0 -rotate-90" width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="4" />
                {pct > 0 && (
                  <circle cx="40" cy="40" r="36" fill="none" stroke={COLORS.strong} strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${pct * circ} ${circ}`} />
                )}
              </svg>
              {/* chapter disc */}
              <div className="absolute inset-2 rounded-full flex flex-col items-center justify-center transition-all group-hover:scale-105"
                style={{
                  background: `${subjectColor}15`,
                  border: `1.5px solid ${subjectColor}44`,
                }}>
                {ch.mastered > 0 || ch.inProgress > 0 ? (
                  <>
                    <div className="text-[12px] font-extrabold" style={{ color: subjectColor }}>{ch.mastered}/{ch.conceptCount}</div>
                    <div className="text-[8px] font-mono" style={{ color: subjectColor + 'aa' }}>mastered</div>
                  </>
                ) : (
                  <>
                    <div className="text-[11px] font-bold" style={{ color: subjectColor }}>{ch.conceptCount}</div>
                    <div className="text-[9px] font-mono" style={{ color: subjectColor + 'aa' }}>concepts</div>
                  </>
                )}
              </div>
              {/* fully-mastered tick */}
              {fullyDone && (
                <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                  style={{ background: COLORS.strong, border: '2px solid white' }}>✓</div>
              )}
              {/* "work in progress here" badge */}
              {!fullyDone && ch.inProgress > 0 && (
                <div className="absolute top-0 right-0.5 w-3 h-3 rounded-full animate-recall-pulse"
                  style={{ background: '#f97316', border: '2px solid white' }} />
              )}
            </div>
            <div className="mt-2 text-center" style={{ maxWidth: 120 }}>
              <div className="text-xs font-semibold leading-snug" style={{ color: '#1c1917' }}>{ch.name}</div>
              <div className="text-[10px] font-mono mt-0.5" style={{ color: '#a8a29e' }}>Ch {ch.number}</div>
            </div>
          </div>
        );
      })}
    </>
  );
}

function ConceptNodes({ cx, cy, r, chapterId, scale = 1, onSelect }: {
  cx: number; cy: number; r: number;
  chapterId: string; scale?: number;
  onSelect: (concept: Concept) => void;
}) {
  const [concepts, setConcepts] = useState<Concept[]>(CONCEPT_DATA[chapterId] ?? []);

  useEffect(() => {
    fetchConcepts(chapterId)
      .then(data => {
        // Use API data if the chapter exists in the DB; otherwise keep dummy
        if (data.length > 0) setConcepts(data);
      })
      .catch(() => {}); // dummy data stays on error
  }, [chapterId]);

  return (
    <>
      {concepts.map((c, i) => {
        const { x, y } = polarPos(cx, cy, r, i, concepts.length);
        const col = masteryColor(c.state);
        const m = MASTERY_MAP[c.state];

        return (
          <div
            key={c.id}
            className="absolute flex flex-col items-center cursor-pointer group"
            style={{
              left: x - 44, top: y - 44,
              transform: `scale(${scale})`, transformOrigin: '50% 28px',
              animationDelay: `${i * 50}ms`,
              animation: 'fade-in 0.35s ease-out both',
            }}
            onClick={() => onSelect(c)}
          >
            <div className="relative w-14 h-14 transition-all group-hover:scale-110">
              {/* glow ring for mastered states */}
              {(c.state === 'STRONG' || c.state === 'VERY_WEAK') && (
                <div className="absolute -inset-1 rounded-full opacity-30"
                  style={{ background: col, filter: 'blur(6px)' }} />
              )}
              {/* node body */}
              <div className="relative w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: `${col}22`,
                  border: `2.5px ${m.dashed ? 'dashed' : 'solid'} ${col}`,
                }}>
                <span className="font-bold text-lg" style={{ color: col }}>{m.glyph}</span>
              </div>
              {/* dueForRecall dot */}
              {c.dueForRecall && (
                <div
                  className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full animate-recall-pulse"
                  style={{ background: '#f97316', border: '2px solid white' }}
                />
              )}
            </div>
            {/* level progress: L1 · L2 · L3 · Strengthen · Revise.
                green = cleared, indigo = current (being worked on now),
                orange = needs fixing, faint = locked. */}
            {(c.l1State || c.l2State || c.l3State || c.strengthenState || c.reviseState) && (
              <div className="flex gap-0.5 mt-1.5">
                {[c.l1State, c.l2State, c.l3State, c.strengthenState, c.reviseState].map((st, si) => {
                  const sc = segColor(st);
                  return (
                    <span
                      key={si}
                      className={`rounded-full ${sc.active ? 'animate-pulse' : ''}`}
                      style={{ width: 7, height: 4, background: sc.bg }}
                    />
                  );
                })}
              </div>
            )}
            <div className="mt-1.5 text-center" style={{ maxWidth: 100 }}>
              <div className="text-[11px] font-semibold leading-snug" style={{ color: '#44403c' }}>{c.name}</div>
            </div>
          </div>
        );
      })}
    </>
  );
}

// Maps each dummy English track key to its real DB subject_key.
const ENGLISH_TRACK_SUBJECT: Record<string, string> = {
  voc: 'english_vocab',
  grm: 'english_grammar',
  rc:  'english_rc',
  lit: 'english_lit',
  wri: 'english_writing',
};

function EnglishTracks({ cx, cy, r, scale = 1, onSelect }: {
  cx: number; cy: number; r: number; scale?: number;
  onSelect: (subjectKey: string, label: string) => void;
}) {
  return (
    <>
      {ENGLISH_TRACKS.map((t, i) => {
        const { x, y } = polarPos(cx, cy, r, i, ENGLISH_TRACKS.length);
        return (
          <div
            key={t.key}
            className="absolute flex flex-col items-center cursor-pointer group"
            style={{
              left: x - 72, top: y - 28,
              transform: `scale(${scale})`, transformOrigin: '50% 28px',
              animationDelay: `${i * 60}ms`,
              animation: 'fade-in 0.4s ease-out both',
            }}
            onClick={() => onSelect(ENGLISH_TRACK_SUBJECT[t.key] ?? 'english', t.label)}
          >
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full transition-all group-hover:scale-105 group-hover:shadow-lg"
              style={{
                background: 'rgba(255,255,255,0.85)',
                border: `2px solid ${COLORS.english}`,
                backdropFilter: 'blur(8px)',
                boxShadow: `0 4px 16px ${COLORS.english}22`,
              }}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: COLORS.english }}
              >
                {t.icon}
              </span>
              <span className="font-bold text-sm" style={{ color: COLORS.english }}>{t.label}</span>
            </div>
            <div className="text-[10px] font-mono mt-1" style={{ color: '#78716c' }}>{t.note}</div>
          </div>
        );
      })}
    </>
  );
}
