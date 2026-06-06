import type { Question } from '@/types';
import {
  QUESTIONS_s101, QUESTIONS_s102, QUESTIONS_s103, QUESTIONS_s104,
  QUESTIONS_s105, QUESTIONS_s106, QUESTIONS_s107, QUESTIONS_s108,
  QUESTIONS_s201, QUESTIONS_s202, QUESTIONS_s203, QUESTIONS_s204,
  QUESTIONS_s205, QUESTIONS_s206, QUESTIONS_s207,
  QUESTIONS_s301, QUESTIONS_s302, QUESTIONS_s303, QUESTIONS_s304,
  QUESTIONS_s305, QUESTIONS_s306,
  QUESTIONS_s401, QUESTIONS_s402, QUESTIONS_s403, QUESTIONS_s404,
  QUESTIONS_s405, QUESTIONS_s406, QUESTIONS_s407, QUESTIONS_s408,
  QUESTIONS_s501, QUESTIONS_s502, QUESTIONS_s503, QUESTIONS_s504,
  QUESTIONS_s505, QUESTIONS_s506,
} from './questions';

// ─── Station question split ───────────────────────────────────────────────────
// Each of Level 1/2/3 holds a MIX of MCQ + descriptive + feynman at escalating
// difficulty. Questions are grouped by their `level` field.
//
// Strengthen is built dynamically: round-robin interleave all L1+L2+L3
// questions (forces retrieval without the difficulty-level cue), then append
// any explicit BLURT questions as the final brain-dump.
//
// Fallback for concepts not yet tagged with `level`: split by type
// (MCQ→L1, DESCRIPTIVE→L2, FEYNMAN→L3) so older demo data still renders.

export interface StationQuestions {
  level1: Question[];
  level2: Question[];
  level3: Question[];
  strengthen: Question[];
  revise: Question[];
}

// Offset-rotated interleave: each pool starts at a different index so
// consecutive questions differ in both difficulty AND type.
// e.g. for 3 pools of [MCQ,DESC,FEYN] each:
//   pool0 offset=0: MCQ,DESC,FEYN
//   pool1 offset=1: DESC,FEYN,MCQ
//   pool2 offset=2: FEYN,MCQ,DESC
// interleaved → MCQ(L1) DESC(L2) FEYN(L3) | DESC(L1) FEYN(L2) MCQ(L3) | ...
function interleave(pools: Question[][]): Question[] {
  const result: Question[] = [];
  const maxLen = Math.max(...pools.map(p => p.length), 0);
  for (let i = 0; i < maxLen; i++) {
    for (let pi = 0; pi < pools.length; pi++) {
      const pool = pools[pi];
      const idx = (i + pi) % pool.length;
      if (result.findIndex(q => q === pool[idx]) === -1) {
        result.push(pool[idx]);
      }
    }
  }
  // Safety: append any missed questions (shouldn't happen for equal-length pools)
  for (const pool of pools) {
    for (const q of pool) {
      if (!result.includes(q)) result.push(q);
    }
  }
  return result;
}

export function splitStations(qs: Question[]): StationQuestions {
  const hasLevels = qs.some(q => q.level);

  if (hasLevels) {
    const level1     = qs.filter(q => q.level === 'level1');
    const level2     = qs.filter(q => q.level === 'level2');
    const level3     = qs.filter(q => q.level === 'level3');
    const blurts     = qs.filter(q => q.level === 'strengthen'); // BLURT brain-dump(s)
    const revise     = qs.filter(q => q.level === 'revise');

    // Strengthen = interleaved L1+L2+L3 (student can't rely on level cue) + BLURT at end
    const strengthen = [...interleave([level1, level2, level3]), ...blurts];

    return { level1, level2, level3, strengthen, revise };
  }

  // Legacy fallback — concepts whose questions aren't tagged with a level yet
  return {
    level1:     qs.filter(q => q.type === 'MCQ'),
    level2:     qs.filter(q => q.type === 'DESCRIPTIVE'),
    level3:     qs.filter(q => q.type === 'FEYNMAN'),
    strengthen: [...qs.filter(q => q.type !== 'BLURT' && q.type !== 'ACTIVE_RECALL'), ...qs.filter(q => q.type === 'BLURT')],
    revise:     qs.filter(q => q.type === 'ACTIVE_RECALL'),
  };
}

// ─── Concept definition ───────────────────────────────────────────────────────

export interface SocietyConcept {
  id: string;       // e.g. 'soc_a_s101'
  name: string;
  questions: Question[];
}

export interface SocietyTheme {
  id: string;       // e.g. 'soc_a'
  name: string;
  letter: string;
  concepts: SocietyConcept[];
}

// ─── Society manifest ─────────────────────────────────────────────────────────

export const SOCIETY_THEMES: SocietyTheme[] = [
  {
    id: 'soc_a',
    name: 'Land & People',
    letter: 'A',
    concepts: [
      { id: 'soc_a_s101', name: 'Maps & the Globe',         questions: QUESTIONS_s101 },
      { id: 'soc_a_s102', name: 'Latitude & Longitude',     questions: QUESTIONS_s102 },
      { id: 'soc_a_s103', name: 'Hemispheres & Time Zones', questions: QUESTIONS_s103 },
      { id: 'soc_a_s104', name: 'Continents of the World',  questions: QUESTIONS_s104 },
      { id: 'soc_a_s105', name: 'Oceans & Water Bodies',    questions: QUESTIONS_s105 },
      { id: 'soc_a_s106', name: 'India — Location & Size',  questions: QUESTIONS_s106 },
      { id: 'soc_a_s107', name: 'Physical Features of India', questions: QUESTIONS_s107 },
      { id: 'soc_a_s108', name: 'Climate & Natural Regions', questions: QUESTIONS_s108 },
    ],
  },
  {
    id: 'soc_b',
    name: 'Tapestry of the Past',
    letter: 'B',
    concepts: [
      { id: 'soc_b_s201', name: 'Reading Time: BCE & CE',   questions: QUESTIONS_s201 },
      { id: 'soc_b_s202', name: 'How We Know History',      questions: QUESTIONS_s202 },
      { id: 'soc_b_s203', name: 'What is Bharat?',          questions: QUESTIONS_s203 },
      { id: 'soc_b_s204', name: 'Ancient Texts of India',   questions: QUESTIONS_s204 },
      { id: 'soc_b_s205', name: 'Yoga, Ayurveda & Ancient Science', questions: QUESTIONS_s205 },
      { id: 'soc_b_s206', name: 'Trade & Crafts in Ancient India',  questions: QUESTIONS_s206 },
      { id: 'soc_b_s207', name: 'Early Kingdoms & Republics',       questions: QUESTIONS_s207 },
    ],
  },
  {
    id: 'soc_c',
    name: 'Heritage & Knowledge',
    letter: 'C',
    concepts: [
      { id: 'soc_c_s301', name: 'Family — Where It Begins',       questions: QUESTIONS_s301 },
      { id: 'soc_c_s302', name: 'Community — Bigger than Family', questions: QUESTIONS_s302 },
      { id: 'soc_c_s303', name: 'Language & Literature',          questions: QUESTIONS_s303 },
      { id: 'soc_c_s304', name: 'Art, Music & Dance',             questions: QUESTIONS_s304 },
      { id: 'soc_c_s305', name: 'Festivals & Traditions',         questions: QUESTIONS_s305 },
      { id: 'soc_c_s306', name: 'Food, Clothing & Shelter',       questions: QUESTIONS_s306 },
    ],
  },
  {
    id: 'soc_d',
    name: 'Governance & Democracy',
    letter: 'D',
    concepts: [
      { id: 'soc_d_s401', name: 'What is Government?',           questions: QUESTIONS_s401 },
      { id: 'soc_d_s402', name: 'Types of Government',           questions: QUESTIONS_s402 },
      { id: 'soc_d_s403', name: 'Our Constitution',              questions: QUESTIONS_s403 },
      { id: 'soc_d_s404', name: 'Fundamental Rights',            questions: QUESTIONS_s404 },
      { id: 'soc_d_s405', name: 'Fundamental Duties',            questions: QUESTIONS_s405 },
      { id: 'soc_d_s406', name: 'Local Self-Government',         questions: QUESTIONS_s406 },
      { id: 'soc_d_s407', name: 'Elections & Voting',            questions: QUESTIONS_s407 },
      { id: 'soc_d_s408', name: 'Judiciary & Rule of Law',       questions: QUESTIONS_s408 },
    ],
  },
  {
    id: 'soc_e',
    name: 'Economic Life',
    letter: 'E',
    concepts: [
      { id: 'soc_e_s501', name: 'Needs, Wants & Resources',   questions: QUESTIONS_s501 },
      { id: 'soc_e_s502', name: 'Production & Occupation',    questions: QUESTIONS_s502 },
      { id: 'soc_e_s503', name: 'Markets & Trade',            questions: QUESTIONS_s503 },
      { id: 'soc_e_s504', name: 'Money & Banking',            questions: QUESTIONS_s504 },
      { id: 'soc_e_s505', name: 'Transport & Communication',  questions: QUESTIONS_s505 },
      { id: 'soc_e_s506', name: 'Sustainable Development',    questions: QUESTIONS_s506 },
    ],
  },
];

// ─── Lookup helpers ───────────────────────────────────────────────────────────

const _conceptMap = new Map<string, SocietyConcept>();
const _themeMap = new Map<string, SocietyTheme>();

for (const theme of SOCIETY_THEMES) {
  _themeMap.set(theme.id, theme);
  for (const concept of theme.concepts) {
    _conceptMap.set(concept.id, concept);
  }
}

export function getConcept(id: string): SocietyConcept | undefined {
  return _conceptMap.get(id);
}

export function getTheme(id: string): SocietyTheme | undefined {
  return _themeMap.get(id);
}

export function getThemeForConcept(conceptId: string): SocietyTheme | undefined {
  return SOCIETY_THEMES.find(t => t.concepts.some(c => c.id === conceptId));
}

export const ALL_CONCEPT_IDS = [..._conceptMap.keys()];
