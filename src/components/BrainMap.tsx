'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SUBJECTS, COLORS, MASTERY_MAP, subjectDisplay, type MasteryState } from '@/lib/tokens';
import { GridBackground } from './GridBackground';
import { RightPanel } from './RightPanel';
import type { Concept } from '@/types';
import { CONCEPT_DATA, CONCEPT_BY_ID, ENGLISH_TRACKS } from '@/data/dummy';
import { fetchChapters, fetchConcept, fetchConcepts, type ApiChapter, type ApiConceptDetail } from '@/lib/api';
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
  };
}

// ── Main BrainMap component ───────────────────────────────────────────────

export function BrainMap({ width = 1200, height = 900 }: { width?: number; height?: number }) {
  const router = useRouter();
  const [level, setLevel] = useState<MapLevel>('subject');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbEntry[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [chapters, setChapters] = useState<ApiChapter[]>([]);

  // "center" of the orbit area (exclude left rail 240px)
  const cx = width / 2;
  const cy = height / 2 - 20;

  const panelW = showPanel ? 420 : 0;
  const orbitCx = (width - panelW) / 2;

  function zoomToSubject(subjectKey: string, subjectLabel: string) {
    if (subjectKey === 'english') {
      setLevel('english');
      setSelectedSubject('english');
      setBreadcrumb([{ level: 'subject', label: 'English', key: 'english' }]);
      setAnimKey(k => k + 1);
    } else {
      setChapters([]); // clear while loading
      setLevel('chapter');
      setSelectedSubject(subjectKey);
      setBreadcrumb([{ level: 'subject', label: subjectLabel, key: subjectKey }]);
      setAnimKey(k => k + 1);
      fetchChapters(subjectKey)
        .then(data => setChapters(data))
        .catch(() => setChapters([]));
    }
  }

  // English track (Vocabulary, Grammar, …) → its chapters. Each track is its
  // own DB subject_key (english_vocab, english_grammar, …).
  function zoomToEnglishTrack(trackSubjectKey: string, trackLabel: string) {
    setChapters([]); // clear while loading
    setLevel('chapter');
    setSelectedSubject(trackSubjectKey);
    setBreadcrumb([
      { level: 'subject', label: 'English', key: 'english' },
      { level: 'chapter', label: trackLabel, key: trackSubjectKey },
    ]);
    setAnimKey(k => k + 1);
    fetchChapters(trackSubjectKey)
      .then(data => setChapters(data))
      .catch(() => setChapters([]));
  }

  function zoomToChapter(chapterId: string, chapterName: string) {
    setLevel('concept');
    setSelectedChapter(chapterId);
    setBreadcrumb(bc => [...bc, { level: 'chapter', label: chapterName, key: chapterId }]);
    setAnimKey(k => k + 1);
  }

  function goBack() {
    if (level === 'concept') {
      setLevel('chapter');
      setSelectedChapter(null);
      setBreadcrumb(bc => bc.slice(0, -1));
    } else if (level === 'chapter' && selectedSubject?.startsWith('english_')) {
      // English track's chapter view → back to the English track list
      setLevel('english');
      setSelectedSubject('english');
      setBreadcrumb([{ level: 'subject', label: 'English', key: 'english' }]);
    } else {
      setLevel('subject');
      setSelectedSubject(null);
      setBreadcrumb([]);
    }
    setAnimKey(k => k + 1);
    setShowPanel(false);
    setSelectedConcept(null);
  }

  function openConcept(concept: Concept) {
    setSelectedConcept(concept);
    setShowPanel(true);
  }

  // Restore the subject → chapter → concept path when arriving with ?conceptId=
  // (e.g. returning from a question session). Runs once on mount.
  const searchParams = useSearchParams();
  useEffect(() => {
    const conceptId = searchParams.get('conceptId');
    if (!conceptId) return;

    function restore(subjectKey: string, chapterId: string, chapterLabel: string, concept: Concept) {
      const subjectMeta = SUBJECTS.find(s => s.key === subjectKey);
      setSelectedSubject(subjectKey);
      setSelectedChapter(chapterId);
      setLevel('concept');
      setBreadcrumb([
        { level: 'subject', label: subjectMeta?.label ?? subjectKey, key: subjectKey },
        { level: 'chapter', label: chapterLabel, key: chapterId },
      ]);
      setSelectedConcept(concept);
      setShowPanel(true);
      setAnimKey(k => k + 1);
    }

    // 1. Dummy demo concept — restore directly from local data
    const loc = CONCEPT_BY_ID[conceptId];
    if (loc) {
      restore(loc.subjectKey, loc.chapterId, loc.chapterId, loc);
      return;
    }

    // 2. Real DB concept — fetch its details so we land on the right chapter
    let cancelled = false;
    fetchConcept(conceptId)
      .then(c => {
        if (cancelled) return;
        // Load the chapter's siblings so the orbit renders, then open the panel
        fetchChapters(c.subjectKey).then(chs => { if (!cancelled) setChapters(chs); }).catch(() => {});
        restore(c.subjectKey, c.chapterId, c.chapterName, apiDetailToConcept(c));
      })
      .catch(() => {}); // unknown concept — stay on the subject view
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: 'transparent' }}>
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
          <div className="text-xs font-semibold" style={{ color: '#78716c' }}>
            Brain {breadcrumb.map(b => `› ${b.label}`).join(' ')}
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
            6 subjects · 3 due to check
          </div>
        </div>
      )}

      {/* SVG layer — connection lines + orbit rings */}
      <svg
        key={`svg-${animKey}`}
        className="absolute inset-0 pointer-events-none animate-fade-in"
        width="100%" height="100%"
        style={{ overflow: 'visible' }}
      >
        {level === 'subject' && (
          <>
            {/* orbit rings */}
            <circle cx={orbitCx} cy={cy} r={240} fill="none" stroke="rgba(168,162,158,0.3)" strokeWidth={1} strokeDasharray="4 6" />
            {/* connection lines */}
            {SUBJECTS.map((s, i) => {
              const pos = polarPos(orbitCx, cy, 240, i, SUBJECTS.length);
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
            <circle cx={orbitCx} cy={cy} r={260} fill="none" stroke="rgba(168,162,158,0.3)" strokeWidth={1} strokeDasharray="4 6" />
            {chapters.map((ch, i) => {
              const pos = polarPos(orbitCx, cy, 260, i, chapters.length);
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
            <circle cx={orbitCx} cy={cy} r={270} fill="none" stroke="rgba(168,162,158,0.3)" strokeWidth={1} strokeDasharray="4 6" />
            {(CONCEPT_DATA[selectedChapter] ?? []).map((c, i) => {
              const total = (CONCEPT_DATA[selectedChapter] ?? []).length;
              const pos = polarPos(orbitCx, cy, 270, i, total);
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
            <circle cx={orbitCx} cy={cy} r={220} fill="none" stroke={COLORS.english + '44'} strokeWidth={1.5} strokeDasharray="8 5" />
            {ENGLISH_TRACKS.map((t, i) => {
              const pos = polarPos(orbitCx, cy, 220, i, ENGLISH_TRACKS.length);
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
        key={`center-${animKey}`}
        level={level}
        cx={orbitCx}
        cy={cy}
        selectedSubject={selectedSubject}
      />

      {/* Orbital nodes */}
      {level === 'subject' && (
        <SubjectNodes
          key={`subj-${animKey}`}
          cx={orbitCx} cy={cy} r={240}
          onSelect={zoomToSubject}
        />
      )}

      {level === 'chapter' && selectedSubject && (
        <ChapterNodes
          key={`chap-${animKey}`}
          cx={orbitCx} cy={cy} r={260}
          chapters={chapters}
          subjectColor={subjectDisplay(selectedSubject).color}
          onSelect={zoomToChapter}
        />
      )}

      {level === 'concept' && selectedChapter && (
        <ConceptNodes
          key={`conc-${animKey}`}
          cx={orbitCx} cy={cy} r={270}
          chapterId={selectedChapter}
          onSelect={openConcept}
        />
      )}

      {level === 'english' && (
        <EnglishTracks
          key={`eng-${animKey}`}
          cx={orbitCx} cy={cy} r={220}
          onSelect={zoomToEnglishTrack}
        />
      )}

      {/* Bottom CTAs */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
        <button
          onClick={() => router.push('/sharpen')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: '#f97316', boxShadow: '0 4px 20px rgba(249,115,22,0.35)' }}
        >
          ✨ Fix 5 tricky bits
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
          🎯 Test myself · 3
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
            onClose={() => { setShowPanel(false); setSelectedConcept(null); }}
            onStartSharpen={() => router.push(assessmentHref(
              '/sharpen',
              { conceptId: selectedConcept.id },
              `/brain-map?conceptId=${selectedConcept.id}`,
            ))}
            onStartRecall={() => router.push(assessmentHref(
              '/recall',
              { conceptId: selectedConcept.id },
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

function SubjectNodes({ cx, cy, r, onSelect }: {
  cx: number; cy: number; r: number;
  onSelect: (key: string, label: string) => void;
}) {
  return (
    <>
      {SUBJECTS.map((s, i) => {
        const { x, y } = polarPos(cx, cy, r, i, SUBJECTS.length);
        const hasDue = false;
        const subtitle = s.key === 'english' ? '5 tracks' : 'tap to explore';
        return (
          <div
            key={s.key}
            className="absolute flex flex-col items-center cursor-pointer group"
            style={{
              left: x - 48, top: y - 48,
              animationDelay: `${i * 80}ms`,
              animation: 'node-pop-direct 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
            }}
            onClick={() => onSelect(s.key, s.label)}
          >
            <div className="relative w-24 h-24">
              {/* glass disc */}
              <div className="w-24 h-24 rounded-full transition-all group-hover:scale-110 group-active:scale-95"
                style={{
                  background: 'rgba(255,255,255,0.75)',
                  backdropFilter: 'blur(8px)',
                  border: '2px solid rgba(255,255,255,0.9)',
                  boxShadow: `0 8px 32px rgba(0,0,0,0.1), 0 0 0 4px ${s.color}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                <div className="flex flex-col items-center">
                  <span style={{ fontSize: 28 }}>{s.icon}</span>
                  <span className="text-xs font-bold mt-0.5" style={{ color: s.color }}>{s.letter}</span>
                </div>
              </div>
              {/* inner colored ring */}
              <div className="absolute inset-3 rounded-full opacity-30"
                style={{ border: `2.5px solid ${s.color}` }} />
              {/* dueForRecall badge */}
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

function ChapterNodes({ cx, cy, r, chapters, subjectColor, onSelect }: {
  cx: number; cy: number; r: number;
  chapters: ApiChapter[]; subjectColor: string;
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
        return (
          <div
            key={ch.id}
            className="absolute flex flex-col items-center cursor-pointer group"
            style={{
              left: x - 56, top: y - 56,
              animationDelay: `${i * 60}ms`,
              animation: 'node-pop-direct 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
            }}
            onClick={() => onSelect(ch.id, ch.name)}
          >
            <div className="relative w-20 h-20">
              {/* orbit ring (empty — no mastery data yet) */}
              <svg className="absolute inset-0 -rotate-90" width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="4" />
              </svg>
              {/* chapter disc */}
              <div className="absolute inset-2 rounded-full flex flex-col items-center justify-center transition-all group-hover:scale-105"
                style={{
                  background: `${subjectColor}15`,
                  border: `1.5px solid ${subjectColor}44`,
                }}>
                <div className="text-[11px] font-bold" style={{ color: subjectColor }}>{ch.conceptCount}</div>
                <div className="text-[9px] font-mono" style={{ color: subjectColor + 'aa' }}>concepts</div>
              </div>
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

function ConceptNodes({ cx, cy, r, chapterId, onSelect }: {
  cx: number; cy: number; r: number;
  chapterId: string;
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
              animationDelay: `${i * 50}ms`,
              animation: 'node-pop-direct 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
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

function EnglishTracks({ cx, cy, r, onSelect }: {
  cx: number; cy: number; r: number;
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
              animationDelay: `${i * 60}ms`,
              animation: 'node-pop-direct 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
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
