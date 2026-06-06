import { COLORS } from '@/lib/tokens';
import type { Concept, Question } from '@/types';

// ─── Student Profile ──────────────────────────────────────────────────────────

export const STUDENT = {
  name: 'Aarav',
  class: 6,
  board: 'CBSE' as const,
  streak: 12,
  sharpenCount: 5,
  recallCount: 3,
};

// ─── Chapter Data (keyed by subject key) ─────────────────────────────────────

export type ChapterInfo = { id: string; name: string; conceptCount: number; strongPct: number };

export const CHAPTER_DATA: Record<string, ChapterInfo[]> = {
  sci: [
    { id: 'sci_ch1', name: 'Life Processes in Plants',  conceptCount: 8,  strongPct: 37 },
    { id: 'sci_ch2', name: 'Photosynthesis — Deep Dive',conceptCount: 6,  strongPct: 50 },
    { id: 'sci_ch3', name: 'Animal Kingdom',            conceptCount: 10, strongPct: 30 },
    { id: 'sci_ch4', name: 'Human Body Systems',        conceptCount: 12, strongPct: 33 },
    { id: 'sci_ch5', name: 'Forces & Motion',           conceptCount: 7,  strongPct: 57 },
    { id: 'sci_ch6', name: 'Matter & Materials',        conceptCount: 5,  strongPct: 0  },
  ],
  hist: [
    { id: 'hist_ch1', name: 'Ancient Civilisations',    conceptCount: 8, strongPct: 75 },
    { id: 'hist_ch2', name: 'Medieval India',           conceptCount: 7, strongPct: 43 },
    { id: 'hist_ch3', name: 'The Mughal Empire',        conceptCount: 9, strongPct: 22 },
    { id: 'hist_ch4', name: 'Independence Movement',    conceptCount: 6, strongPct: 0  },
  ],
  geo: [
    { id: 'geo_ch1', name: 'Maps & Globe Skills',            conceptCount: 6, strongPct: 83 },
    { id: 'geo_ch2', name: 'Latitude & Climate',             conceptCount: 7, strongPct: 29 },
    { id: 'geo_ch3', name: 'India — Physical Features',      conceptCount: 8, strongPct: 25 },
    { id: 'geo_ch4', name: 'Rivers & Water Bodies',          conceptCount: 5, strongPct: 0  },
  ],
  civ: [
    { id: 'civ_ch1', name: 'Our Constitution',       conceptCount: 6, strongPct: 50 },
    { id: 'civ_ch2', name: 'Fundamental Rights',     conceptCount: 7, strongPct: 43 },
    { id: 'civ_ch3', name: 'Government Structure',   conceptCount: 8, strongPct: 25 },
    { id: 'civ_ch4', name: 'Local Government',       conceptCount: 5, strongPct: 0  },
  ],
  // Society = unified NEP Social Science (5 NCERT themes, not "chapters")
  soc: [
    { id: 'soc_chA', name: 'Land & People',            conceptCount: 8, strongPct: 25 },
    { id: 'soc_chB', name: 'Tapestry of the Past',     conceptCount: 7, strongPct: 14 },
    { id: 'soc_chC', name: 'Heritage & Knowledge',     conceptCount: 6, strongPct: 17 },
    { id: 'soc_chD', name: 'Governance & Democracy',   conceptCount: 8, strongPct: 0  },
    { id: 'soc_chE', name: 'Economic Life',            conceptCount: 6, strongPct: 0  },
  ],
  eng: [],
};

// ─── Concept Data (keyed by chapter id) ──────────────────────────────────────
// All 5 mastery states represented across chapters, with varied dueForRecall cases.

export const CONCEPT_DATA: Record<string, Concept[]> = {

  // ── Science: Life Processes in Plants ──────────────────────────────────────
  // Case mix: STRONG(3) DEVELOPING(2) WEAK(1,dueForRecall) VERY_WEAK(1) NOT_STARTED(1)
  sci_ch1: [
    { id: 'c101', name: 'Photosynthesis overview',  state: 'STRONG',      dueForRecall: false, score: 0.82, attempts: 14 },
    { id: 'c102', name: 'Why leaves are green',     state: 'STRONG',      dueForRecall: true,  score: 0.88, attempts: 12 },
    { id: 'c103', name: 'Stomata & gas exchange',   state: 'DEVELOPING',  dueForRecall: false, score: 0.58, attempts: 9  },
    { id: 'c104', name: 'Chlorophyll & light',      state: 'WEAK',        dueForRecall: true,  score: 0.42, attempts: 7  },
    { id: 'c105', name: 'Root absorption',          state: 'STRONG',      dueForRecall: false, score: 0.79, attempts: 11 },
    { id: 'c106', name: 'Xylem & phloem',           state: 'VERY_WEAK',   dueForRecall: false, score: 0.18, attempts: 6  },
    { id: 'c107', name: 'Glucose & starch storage', state: 'DEVELOPING',  dueForRecall: false, score: 0.61, attempts: 5  },
    { id: 'c108', name: 'Transpiration',            state: 'NOT_STARTED',                                                },
  ],

  // ── Science: Photosynthesis Deep Dive ──────────────────────────────────────
  // Case mix: STRONG(2, one dueForRecall) DEVELOPING(1) WEAK(1) VERY_WEAK(1,dueForRecall) NOT_STARTED(1)
  sci_ch2: [
    { id: 'c201', name: 'Light-dependent reactions', state: 'STRONG',      dueForRecall: false, score: 0.91, attempts: 16 },
    { id: 'c202', name: 'Chloroplast structure',     state: 'STRONG',      dueForRecall: true,  score: 0.85, attempts: 13 },
    { id: 'c203', name: 'ATP & NADPH production',    state: 'DEVELOPING',  dueForRecall: false, score: 0.62, attempts: 8  },
    { id: 'c204', name: 'Calvin cycle (dark rxns)',  state: 'WEAK',        dueForRecall: false, score: 0.38, attempts: 6  },
    { id: 'c205', name: 'Limiting factors of PS',   state: 'VERY_WEAK',   dueForRecall: true,  score: 0.22, attempts: 5  },
    { id: 'c206', name: 'C3 vs C4 plants',          state: 'NOT_STARTED',                                                },
  ],

  // ── Science: Animal Kingdom ─────────────────────────────────────────────────
  // Case mix: STRONG(2) DEVELOPING(2,one dueForRecall) WEAK(2) VERY_WEAK(1) NOT_STARTED(3)
  sci_ch3: [
    { id: 'c301', name: 'Vertebrates vs invertebrates', state: 'STRONG',     dueForRecall: false, score: 0.84, attempts: 10 },
    { id: 'c302', name: 'Mammal characteristics',       state: 'STRONG',     dueForRecall: false, score: 0.88, attempts: 14 },
    { id: 'c303', name: 'Bird classification',          state: 'DEVELOPING', dueForRecall: false, score: 0.55, attempts: 7  },
    { id: 'c304', name: 'Reptiles & amphibians',        state: 'WEAK',       dueForRecall: false, score: 0.41, attempts: 6  },
    { id: 'c305', name: 'Fish & aquatic life',          state: 'DEVELOPING', dueForRecall: true,  score: 0.63, attempts: 9  },
    { id: 'c306', name: 'Insects & arachnids',          state: 'VERY_WEAK',  dueForRecall: false, score: 0.19, attempts: 4  },
    { id: 'c307', name: 'Food chains & webs',           state: 'WEAK',       dueForRecall: false, score: 0.35, attempts: 5  },
    { id: 'c308', name: 'Adaptation to environment',    state: 'NOT_STARTED',                                              },
    { id: 'c309', name: 'Camouflage & mimicry',         state: 'NOT_STARTED',                                              },
    { id: 'c310', name: 'Migration & hibernation',      state: 'NOT_STARTED',                                              },
  ],

  // ── Science: Human Body Systems ────────────────────────────────────────────
  // Case mix: STRONG(3) DEVELOPING(1,dueForRecall) WEAK(1) VERY_WEAK(2,one dueForRecall) NOT_STARTED(5)
  sci_ch4: [
    { id: 'c401', name: 'Skeletal system',       state: 'STRONG',     dueForRecall: false, score: 0.87, attempts: 11 },
    { id: 'c402', name: 'Muscular system',       state: 'STRONG',     dueForRecall: false, score: 0.82, attempts: 9  },
    { id: 'c403', name: 'Digestive system',      state: 'DEVELOPING', dueForRecall: true,  score: 0.65, attempts: 8  },
    { id: 'c404', name: 'Circulatory system',    state: 'STRONG',     dueForRecall: false, score: 0.90, attempts: 15 },
    { id: 'c405', name: 'Respiratory system',    state: 'WEAK',       dueForRecall: false, score: 0.44, attempts: 7  },
    { id: 'c406', name: 'Nervous system',        state: 'VERY_WEAK',  dueForRecall: true,  score: 0.21, attempts: 5  },
    { id: 'c407', name: 'Excretory system',      state: 'NOT_STARTED',                                                },
    { id: 'c408', name: 'Endocrine system',      state: 'NOT_STARTED',                                                },
    { id: 'c409', name: 'Immune system',         state: 'NOT_STARTED',                                                },
    { id: 'c410', name: 'Lymphatic system',      state: 'NOT_STARTED',                                                },
    { id: 'c411', name: 'Sensory organs',        state: 'VERY_WEAK',  dueForRecall: false, score: 0.23, attempts: 4  },
    { id: 'c412', name: 'Reproductive system',   state: 'NOT_STARTED',                                                },
  ],

  // ── Science: Forces & Motion ────────────────────────────────────────────────
  // Case mix: STRONG(3,one dueForRecall) DEVELOPING(2) WEAK(1) VERY_WEAK(1)
  sci_ch5: [
    { id: 'c501', name: "Newton's 1st Law",    state: 'STRONG',     dueForRecall: false, score: 0.93, attempts: 18 },
    { id: 'c502', name: "Newton's 2nd Law",    state: 'STRONG',     dueForRecall: true,  score: 0.86, attempts: 14 },
    { id: 'c503', name: "Newton's 3rd Law",    state: 'DEVELOPING', dueForRecall: false, score: 0.68, attempts: 10 },
    { id: 'c504', name: 'Friction',            state: 'STRONG',     dueForRecall: false, score: 0.89, attempts: 16 },
    { id: 'c505', name: 'Gravity & weight',    state: 'DEVELOPING', dueForRecall: false, score: 0.62, attempts: 8  },
    { id: 'c506', name: 'Work, energy & power',state: 'WEAK',       dueForRecall: false, score: 0.41, attempts: 6  },
    { id: 'c507', name: 'Simple machines',     state: 'VERY_WEAK',  dueForRecall: false, score: 0.28, attempts: 5  },
  ],

  // ── Science: Matter & Materials ─────────────────────────────────────────────
  // Case: All NOT_STARTED (brand-new chapter, never opened)
  sci_ch6: [
    { id: 'c601', name: 'States of matter',       state: 'NOT_STARTED' },
    { id: 'c602', name: 'Physical properties',    state: 'NOT_STARTED' },
    { id: 'c603', name: 'Chemical properties',    state: 'NOT_STARTED' },
    { id: 'c604', name: 'Mixtures & solutions',   state: 'NOT_STARTED' },
    { id: 'c605', name: 'Elements & compounds',   state: 'NOT_STARTED' },
  ],

  // ── History: Ancient Civilisations ─────────────────────────────────────────
  // Case mix: mostly STRONG (75%), 2 DEVELOPING, 0 NOT_STARTED
  hist_ch1: [
    { id: 'h101', name: 'Mesopotamia',           state: 'STRONG',     dueForRecall: false, score: 0.88, attempts: 12 },
    { id: 'h102', name: 'Egyptian civilization', state: 'STRONG',     dueForRecall: false, score: 0.85, attempts: 11 },
    { id: 'h103', name: 'Indus Valley',          state: 'STRONG',     dueForRecall: true,  score: 0.90, attempts: 16 },
    { id: 'h104', name: 'Chinese civilization',  state: 'STRONG',     dueForRecall: false, score: 0.82, attempts: 10 },
    { id: 'h105', name: 'Greek city-states',     state: 'STRONG',     dueForRecall: false, score: 0.79, attempts: 9  },
    { id: 'h106', name: 'Roman Empire',          state: 'DEVELOPING', dueForRecall: false, score: 0.58, attempts: 7  },
    { id: 'h107', name: 'Trade routes of antiquity', state: 'STRONG', dueForRecall: false, score: 0.83, attempts: 11 },
    { id: 'h108', name: 'Ancient religions',     state: 'DEVELOPING', dueForRecall: false, score: 0.54, attempts: 6  },
  ],

  // ── History: Medieval India ─────────────────────────────────────────────────
  // Case mix: STRONG(2) DEVELOPING(2,one dueForRecall) WEAK(1) VERY_WEAK(1) NOT_STARTED(1)
  hist_ch2: [
    { id: 'h201', name: 'Delhi Sultanate',       state: 'STRONG',     dueForRecall: false, score: 0.84, attempts: 10 },
    { id: 'h202', name: 'Vijayanagara Empire',   state: 'STRONG',     dueForRecall: false, score: 0.88, attempts: 13 },
    { id: 'h203', name: 'Bhakti movement',       state: 'DEVELOPING', dueForRecall: true,  score: 0.62, attempts: 8  },
    { id: 'h204', name: 'Sufi movement',         state: 'WEAK',       dueForRecall: false, score: 0.39, attempts: 5  },
    { id: 'h205', name: 'Art & architecture',    state: 'DEVELOPING', dueForRecall: false, score: 0.58, attempts: 7  },
    { id: 'h206', name: 'Land & revenue systems',state: 'VERY_WEAK',  dueForRecall: false, score: 0.24, attempts: 4  },
    { id: 'h207', name: 'Medieval trade routes', state: 'NOT_STARTED',                                                },
  ],

  // ── History: The Mughal Empire ──────────────────────────────────────────────
  // Case mix: STRONG(2) DEVELOPING(2) WEAK(2,one dueForRecall) VERY_WEAK(1) NOT_STARTED(2)
  hist_ch3: [
    { id: 'h301', name: 'Babur & founding',        state: 'STRONG',     dueForRecall: false, score: 0.86, attempts: 12 },
    { id: 'h302', name: "Akbar's administration",  state: 'STRONG',     dueForRecall: false, score: 0.84, attempts: 11 },
    { id: 'h303', name: 'Din-i-Ilahi policy',      state: 'DEVELOPING', dueForRecall: false, score: 0.61, attempts: 7  },
    { id: 'h304', name: 'Mansabdari system',       state: 'WEAK',       dueForRecall: true,  score: 0.37, attempts: 6  },
    { id: 'h305', name: 'Mughal art & architecture',state: 'DEVELOPING',dueForRecall: false, score: 0.59, attempts: 8  },
    { id: 'h306', name: "Aurangzeb's policies",    state: 'WEAK',       dueForRecall: false, score: 0.33, attempts: 5  },
    { id: 'h307', name: 'Decline of Mughals',      state: 'VERY_WEAK',  dueForRecall: false, score: 0.19, attempts: 4  },
    { id: 'h308', name: 'Mughal economy & trade',  state: 'NOT_STARTED',                                               },
    { id: 'h309', name: 'Regional kingdoms',       state: 'NOT_STARTED',                                               },
  ],

  // ── History: Independence Movement ─────────────────────────────────────────
  // Case: All NOT_STARTED (new chapter unlocked but not started)
  hist_ch4: [
    { id: 'h401', name: 'British East India Co.',    state: 'NOT_STARTED' },
    { id: 'h402', name: '1857 Revolt',               state: 'NOT_STARTED' },
    { id: 'h403', name: 'Formation of Congress',     state: 'NOT_STARTED' },
    { id: 'h404', name: 'Non-Cooperation Movement',  state: 'NOT_STARTED' },
    { id: 'h405', name: 'Quit India Movement',       state: 'NOT_STARTED' },
    { id: 'h406', name: 'Partition & Independence',  state: 'NOT_STARTED' },
  ],

  // ── Geography: Maps & Globe Skills ─────────────────────────────────────────
  // Case: Mostly STRONG (83%), 1 DEVELOPING — high mastery chapter
  geo_ch1: [
    { id: 'g101', name: 'Latitude & longitude',  state: 'STRONG',     dueForRecall: true,  score: 0.87, attempts: 14 },
    { id: 'g102', name: 'Map symbols',           state: 'STRONG',     dueForRecall: false, score: 0.91, attempts: 18 },
    { id: 'g103', name: 'Scale & distance',      state: 'STRONG',     dueForRecall: false, score: 0.85, attempts: 12 },
    { id: 'g104', name: 'Contour lines',         state: 'STRONG',     dueForRecall: false, score: 0.89, attempts: 15 },
    { id: 'g105', name: 'Cardinal directions',   state: 'STRONG',     dueForRecall: false, score: 0.93, attempts: 20 },
    { id: 'g106', name: 'Time zones',            state: 'DEVELOPING', dueForRecall: false, score: 0.62, attempts: 8  },
  ],

  // ── Geography: Latitude & Climate ──────────────────────────────────────────
  // Case mix: STRONG(2,one dueForRecall) DEVELOPING(2) WEAK(2) VERY_WEAK(1)
  geo_ch2: [
    { id: 'g201', name: 'Seasons & Earth\'s tilt', state: 'STRONG',     dueForRecall: false, score: 0.88, attempts: 13 },
    { id: 'g202', name: 'Monsoon patterns',         state: 'STRONG',     dueForRecall: true,  score: 0.82, attempts: 11 },
    { id: 'g203', name: 'Tropical climate zones',   state: 'DEVELOPING', dueForRecall: false, score: 0.64, attempts: 9  },
    { id: 'g204', name: 'Polar & temperate zones',  state: 'DEVELOPING', dueForRecall: false, score: 0.58, attempts: 7  },
    { id: 'g205', name: 'Wind patterns & trade winds',state: 'WEAK',     dueForRecall: false, score: 0.42, attempts: 6  },
    { id: 'g206', name: 'Ocean currents',           state: 'WEAK',       dueForRecall: false, score: 0.36, attempts: 5  },
    { id: 'g207', name: 'Greenhouse effect',        state: 'VERY_WEAK',  dueForRecall: false, score: 0.22, attempts: 4  },
  ],

  // ── Geography: India — Physical Features ───────────────────────────────────
  // Case mix: STRONG(2) DEVELOPING(2,one dueForRecall) WEAK(2) VERY_WEAK(1) NOT_STARTED(1)
  geo_ch3: [
    { id: 'g301', name: 'Himalayan ranges',       state: 'STRONG',     dueForRecall: false, score: 0.85, attempts: 12 },
    { id: 'g302', name: 'Northern plains',        state: 'STRONG',     dueForRecall: false, score: 0.83, attempts: 11 },
    { id: 'g303', name: 'Deccan plateau',         state: 'DEVELOPING', dueForRecall: true,  score: 0.61, attempts: 8  },
    { id: 'g304', name: 'Coastal plains',         state: 'DEVELOPING', dueForRecall: false, score: 0.55, attempts: 7  },
    { id: 'g305', name: 'Island groups',          state: 'WEAK',       dueForRecall: false, score: 0.38, attempts: 5  },
    { id: 'g306', name: 'Great Indian Desert',    state: 'WEAK',       dueForRecall: false, score: 0.41, attempts: 6  },
    { id: 'g307', name: 'River systems of India', state: 'VERY_WEAK',  dueForRecall: false, score: 0.24, attempts: 4  },
    { id: 'g308', name: 'Natural vegetation zones',state: 'NOT_STARTED',                                               },
  ],

  // ── Geography: Rivers & Water Bodies ───────────────────────────────────────
  // Case: Mostly weak (0% strong) — early-stage chapter
  geo_ch4: [
    { id: 'g401', name: 'Himalayan rivers',      state: 'DEVELOPING', dueForRecall: false, score: 0.59, attempts: 7 },
    { id: 'g402', name: 'Peninsular rivers',     state: 'WEAK',       dueForRecall: false, score: 0.38, attempts: 5 },
    { id: 'g403', name: 'River landforms',       state: 'VERY_WEAK',  dueForRecall: false, score: 0.21, attempts: 3 },
    { id: 'g404', name: 'Lakes of India',        state: 'NOT_STARTED',                                              },
    { id: 'g405', name: 'Water conservation',    state: 'NOT_STARTED',                                              },
  ],

  // ── Civics: Our Constitution ────────────────────────────────────────────────
  // Case mix: STRONG(3) DEVELOPING(1,dueForRecall) WEAK(1) NOT_STARTED(1)
  civ_ch1: [
    { id: 'v101', name: 'The Preamble',                  state: 'STRONG',     dueForRecall: false, score: 0.92, attempts: 17 },
    { id: 'v102', name: 'Fundamental rights overview',   state: 'STRONG',     dueForRecall: false, score: 0.86, attempts: 12 },
    { id: 'v103', name: 'Directive principles (DPSPs)',  state: 'STRONG',     dueForRecall: false, score: 0.82, attempts: 10 },
    { id: 'v104', name: 'Fundamental duties',            state: 'DEVELOPING', dueForRecall: true,  score: 0.61, attempts: 8  },
    { id: 'v105', name: 'Constitutional amendments',     state: 'WEAK',       dueForRecall: false, score: 0.39, attempts: 6  },
    { id: 'v106', name: 'Emergency provisions',          state: 'NOT_STARTED',                                                },
  ],

  // ── Civics: Fundamental Rights ──────────────────────────────────────────────
  // Case mix: STRONG(3) DEVELOPING(1) WEAK(1) VERY_WEAK(1,dueForRecall) NOT_STARTED(1)
  civ_ch2: [
    { id: 'v201', name: 'Right to equality (Art 14–18)',    state: 'STRONG',     dueForRecall: false, score: 0.88, attempts: 13 },
    { id: 'v202', name: 'Right to freedom (Art 19–22)',     state: 'STRONG',     dueForRecall: false, score: 0.84, attempts: 11 },
    { id: 'v203', name: 'Right against exploitation',       state: 'STRONG',     dueForRecall: false, score: 0.80, attempts: 9  },
    { id: 'v204', name: 'Right to religion (Art 25–28)',    state: 'DEVELOPING', dueForRecall: false, score: 0.63, attempts: 8  },
    { id: 'v205', name: 'Cultural & educational rights',    state: 'WEAK',       dueForRecall: false, score: 0.41, attempts: 6  },
    { id: 'v206', name: 'Right to constitutional remedies', state: 'VERY_WEAK',  dueForRecall: true,  score: 0.22, attempts: 4  },
    { id: 'v207', name: 'Article 21 & right to privacy',   state: 'NOT_STARTED',                                                },
  ],

  // ── Civics: Government Structure ───────────────────────────────────────────
  // Case mix: STRONG(2) DEVELOPING(2,one dueForRecall) WEAK(2) VERY_WEAK(1) NOT_STARTED(1)
  civ_ch3: [
    { id: 'v301', name: 'Parliament — overview',      state: 'STRONG',     dueForRecall: false, score: 0.86, attempts: 11 },
    { id: 'v302', name: 'Lok Sabha — composition',    state: 'STRONG',     dueForRecall: false, score: 0.89, attempts: 14 },
    { id: 'v303', name: 'Rajya Sabha — role',         state: 'DEVELOPING', dueForRecall: false, score: 0.60, attempts: 8  },
    { id: 'v304', name: "President's constitutional role", state: 'DEVELOPING', dueForRecall: true, score: 0.57, attempts: 7 },
    { id: 'v305', name: "Prime Minister's role",      state: 'WEAK',       dueForRecall: false, score: 0.42, attempts: 6  },
    { id: 'v306', name: 'Supreme Court',              state: 'WEAK',       dueForRecall: false, score: 0.38, attempts: 5  },
    { id: 'v307', name: 'High Courts',                state: 'VERY_WEAK',  dueForRecall: false, score: 0.23, attempts: 4  },
    { id: 'v308', name: 'District & lower courts',    state: 'NOT_STARTED',                                                },
  ],

  // ── Civics: Local Government ────────────────────────────────────────────────
  // Case: All NOT_STARTED — chapter just unlocked
  civ_ch4: [
    { id: 'v401', name: 'Panchayati Raj system',  state: 'NOT_STARTED' },
    { id: 'v402', name: 'Municipal corporations', state: 'NOT_STARTED' },
    { id: 'v403', name: 'Ward committees',        state: 'NOT_STARTED' },
    { id: 'v404', name: 'Gram Sabha',             state: 'NOT_STARTED' },
    { id: 'v405', name: 'Urban local bodies',     state: 'NOT_STARTED' },
  ],

  // ═══ SOCIETY (NEP) ════════════════════════════════════════════════════════
  // From NCERT "Exploring Society: India and Beyond" — 5 themes, interconnected
  // concept clusters. Concepts named for cross-disciplinary mental models, not
  // siloed chapters.

  // ── Theme A: Land & People (Geography + Human Interaction) ────────────────
  soc_chA: [
    { id: 's101', name: 'Maps & Globe basics',          state: 'STRONG',     dueForRecall: false, score: 0.83, attempts: 12 },
    { id: 's102', name: 'Latitude & Longitude',          state: 'STRONG',     dueForRecall: true,  score: 0.86, attempts: 14 },
    { id: 's103', name: 'Hemispheres & Time Zones',      state: 'DEVELOPING', dueForRecall: false, score: 0.62, attempts: 8  },
    { id: 's104', name: 'Continents of the World',       state: 'DEVELOPING', dueForRecall: true,  score: 0.68, attempts: 9  },
    { id: 's105', name: 'Oceans & Water Bodies',         state: 'WEAK',       dueForRecall: false, score: 0.42, attempts: 6  },
    { id: 's106', name: 'Mountains, Plains & Plateaus',  state: 'VERY_WEAK',  dueForRecall: false, score: 0.21, attempts: 4  },
    { id: 's107', name: 'Climate Shapes Life',           state: 'NOT_STARTED'                                                  },
    { id: 's108', name: 'Humans Adapt to the Land',      state: 'NOT_STARTED'                                                  },
  ],

  // ── Theme B: Tapestry of the Past (History + Civilisation) ───────────────
  soc_chB: [
    { id: 's201', name: 'Reading Time: BCE & CE',              state: 'STRONG',     dueForRecall: false, score: 0.81, attempts: 11 },
    { id: 's202', name: 'How We Know History',                  state: 'DEVELOPING', dueForRecall: false, score: 0.59, attempts: 7  },
    { id: 's203', name: 'What is Bharat?',                      state: 'WEAK',       dueForRecall: true,  score: 0.39, attempts: 5  },
    { id: 's204', name: 'Ancient Texts of India',               state: 'VERY_WEAK',  dueForRecall: false, score: 0.22, attempts: 3  },
    { id: 's205', name: 'Yoga, Ayurveda & Ancient Science',     state: 'NOT_STARTED'                                                },
    { id: 's206', name: 'Trade & Crafts in Ancient India',      state: 'NOT_STARTED'                                                },
    { id: 's207', name: 'Early Kingdoms & Republics',           state: 'NOT_STARTED'                                                },
  ],

  // ── Theme C: Heritage & Knowledge (Culture + Philosophy) ──────────────────
  soc_chC: [
    { id: 's301', name: 'Ancient Texts of India',           state: 'STRONG',     dueForRecall: true,  score: 0.85, attempts: 10 },
    { id: 's302', name: 'Yoga, Ayurveda & Ancient Science', state: 'DEVELOPING', dueForRecall: false, score: 0.64, attempts: 8  },
    { id: 's303', name: 'Art, Music & Storytelling',        state: 'NOT_STARTED'                                                  },
    { id: 's304', name: 'Festivals Across India',           state: 'NOT_STARTED'                                                  },
    { id: 's305', name: 'Unity in Diversity',               state: 'NOT_STARTED'                                                  },
    { id: 's306', name: 'Many Languages, One Country',      state: 'NOT_STARTED'                                                  },
  ],

  // ── Theme D: Governance & Democracy (Political Science) ──────────────────
  soc_chD: [
    { id: 's401', name: 'Family — Where it Begins',         state: 'DEVELOPING', dueForRecall: true,  score: 0.66, attempts: 7  },
    { id: 's402', name: 'Community — Bigger than Family',   state: 'WEAK',       dueForRecall: false, score: 0.43, attempts: 5  },
    { id: 's403', name: 'What is Democracy?',               state: 'VERY_WEAK',  dueForRecall: true,  score: 0.24, attempts: 4  },
    { id: 's404', name: 'Power Starts at the Grassroots',   state: 'NOT_STARTED'                                                  },
    { id: 's405', name: 'Gram Panchayat',                   state: 'NOT_STARTED'                                                  },
    { id: 's406', name: 'Gram Sabha — Village Meeting',     state: 'NOT_STARTED'                                                  },
    { id: 's407', name: 'Municipalities — Running a City',  state: 'NOT_STARTED'                                                  },
    { id: 's408', name: 'Public Services Around Us',        state: 'NOT_STARTED'                                                  },
  ],

  // ── Theme E: Economic Life (Economics + Productivity) ────────────────────
  soc_chE: [
    { id: 's501', name: 'Why Work Matters',              state: 'NOT_STARTED' },
    { id: 's502', name: 'Dignity of Every Job',          state: 'NOT_STARTED' },
    { id: 's503', name: 'Making, Selling, Buying',       state: 'NOT_STARTED' },
    { id: 's504', name: 'Markets & Trade',               state: 'NOT_STARTED' },
    { id: 's505', name: 'Resources Become Value',        state: 'NOT_STARTED' },
    { id: 's506', name: 'Invisible Work Holds Us Up',    state: 'NOT_STARTED' },
  ],
};

// ─── English Tracks ────────────────────────────────────────────────────────────

export const ENGLISH_TRACKS = [
  { key: 'voc', label: 'Vocabulary',     icon: 'V', note: '15 words · 2 due for recall' },
  { key: 'grm', label: 'Grammar',        icon: 'G', note: '5 rules · 1 weak area'       },
  { key: 'rc',  label: 'Reading Comp.',  icon: 'R', note: '3 passages today'            },
  { key: 'lit', label: 'Literature',     icon: 'L', note: '4 chapters · poem unit'      },
  { key: 'wri', label: 'Writing Skills', icon: 'W', note: '2 drafts pending'            },
];

// ─── Dashboard Data ────────────────────────────────────────────────────────────

// +35 Society concepts: 4 STRONG, 5 DEVELOPING, 3 WEAK, 2 VERY_WEAK, 21 NOT_STARTED
export const WEATHER = [
  { state: 'STRONG',      n: 33, c: COLORS.strong      },
  { state: 'DEVELOPING',  n: 23, c: COLORS.developing  },
  { state: 'WEAK',        n: 17, c: COLORS.weak        },
  { state: 'VERY_WEAK',   n: 11, c: COLORS.veryWeak    },
  { state: 'NOT_STARTED', n: 42, c: COLORS.notStarted  },
];
export const WEATHER_TOTAL = WEATHER.reduce((a, b) => a + b.n, 0);

export const DASH_SUBJECTS = [
  { key: 'sci',  letter: 'S', name: 'Science',   color: COLORS.science, pct: 54, n: 43 },
  { key: 'hist', letter: 'H', name: 'History',   color: COLORS.history, pct: 46, n: 30 },
  { key: 'geo',  letter: 'G', name: 'Geography', color: COLORS.geo,     pct: 38, n: 26 },
  { key: 'civ',  letter: 'C', name: 'Civics',    color: COLORS.civics,  pct: 35, n: 26 },
  { key: 'soc',  letter: 'O', name: 'Society',   color: COLORS.society, pct: 11, n: 35 },
  { key: 'eng',  letter: 'E', name: 'English',   color: COLORS.english, pct: 55, n: 25 },
];

export const YESTERDAY = {
  wins: [
    { name: 'Photosynthesis',          delta: '+0.18', subject: 'Science'   },
    { name: 'Map symbols',             delta: '+0.12', subject: 'Geography' },
    { name: "Newton's 1st Law",        delta: '+0.09', subject: 'Science'   },
    { name: 'Indus Valley',            delta: '+0.07', subject: 'History'   },
  ],
  slips: [
    { name: 'Xylem & phloem',          delta: '−0.08', subject: 'Science'  },
    { name: 'Mansabdari system',       delta: '−0.06', subject: 'History'  },
    { name: 'Greenhouse effect',       delta: '−0.05', subject: 'Geography'},
  ],
};

export const CURIOSITY_BYTE = {
  fact: 'A single strand of DNA from one human cell, uncoiled, would stretch about 2 metres.',
  question: 'If every cell has the same DNA, why do skin cells look nothing like neurons?',
};

// Synthetic 30-day activity heatmap (higher values = more active)
// Some zero days simulate gaps / rest days
export const HEATMAP_DAYS = Array.from({ length: 30 }, (_, i) => {
  const v = Math.floor(((Math.sin(i * 1.7) + Math.cos(i * 0.9)) + 2) * 1.8);
  return [2, 8, 15, 23, 29].includes(i) ? 0 : v; // rest/miss days
});

// ─── Right Panel Concept Details ──────────────────────────────────────────────

export interface ConceptDetail {
  recap: string;
  checklist: Array<{ text: string; checked: boolean }>;
  misconception?: { wrong: string; right: string };
  curiosityByte?: { fact: string; question: string };
  history: Array<{ date: string; type: string; detail: string }>;
}

export const CONCEPT_DETAILS: Record<string, ConceptDetail> = {

  c101: { // Photosynthesis overview — STRONG
    recap: 'Photosynthesis is the process plants use to make food using sunlight, CO₂, and water. Chlorophyll in the chloroplast absorbs light energy. Oxygen is released as a by-product. Glucose is stored as starch. This process only happens in green plant cells.',
    checklist: [
      { checked: true,  text: 'Inputs: CO₂ + H₂O + light' },
      { checked: true,  text: 'Chlorophyll absorbs light' },
      { checked: true,  text: 'Glucose produced & stored as starch' },
      { checked: true,  text: 'Oxygen released as by-product' },
      { checked: false, text: 'Happens in both light & dark reactions' },
    ],
    misconception: {
      wrong: 'Plants get their food from the soil through roots.',
      right: 'Plants make their own food through photosynthesis — roots only absorb water and minerals.',
    },
    curiosityByte: {
      fact: 'Plants produce about 140 billion tonnes of organic matter via photosynthesis each year.',
      question: 'If we could replicate photosynthesis artificially, what energy problems could we solve?',
    },
    history: [
      { date: '12 May', type: 'Module',  detail: '5/6 MCQs · 0.75 score' },
      { date: '18 May', type: 'Sharpen', detail: 'misconception confirmed' },
      { date: '24 May', type: 'Sharpen', detail: 'score lifted to 0.82' },
    ],
  },

  c102: { // Why leaves are green — STRONG, dueForRecall
    recap: 'Leaves look green because chlorophyll absorbs red and blue light but reflects green wavelengths. Chlorophyll is the pigment that powers photosynthesis. Different plants have different concentrations of chlorophyll. In autumn, chlorophyll breaks down revealing yellow and orange pigments. Carotenoids are the secondary pigments.',
    checklist: [
      { checked: true,  text: 'Chlorophyll reflects green light' },
      { checked: true,  text: 'Red & blue light absorbed for PS' },
      { checked: true,  text: 'Carotenoids = yellow/orange pigments' },
      { checked: true,  text: 'Autumn: chlorophyll breaks down' },
      { checked: false, text: 'Some plants have non-green pigments (anthocyanins)' },
    ],
    misconception: {
      wrong: 'All plants are green because they contain green water.',
      right: 'Plants appear green because chlorophyll reflects the green wavelengths of light.',
    },
    curiosityByte: {
      fact: 'Red maple leaves get their colour from anthocyanins — a completely different pigment from chlorophyll.',
      question: 'Could a plant with only red pigment still photosynthesize? Why or why not?',
    },
    history: [
      { date: '14 May', type: 'Module',  detail: '6/6 MCQs · 0.80 score' },
      { date: '20 May', type: 'Sharpen', detail: 'score lifted to 0.88' },
      { date: '26 May', type: 'Recall',  detail: 'interval: 14 days · due today' },
    ],
  },

  c103: { // Stomata & gas exchange — DEVELOPING
    recap: 'Stomata are tiny pores on leaf surfaces that control gas exchange. Guard cells regulate the opening and closing of stomata. CO₂ enters and O₂ exits through open stomata during the day. Water vapour also exits through stomata — this is called transpiration. Most stomata are on the underside of leaves.',
    checklist: [
      { checked: true,  text: 'Stomata = pores on leaf surface' },
      { checked: true,  text: 'Guard cells open/close stomata' },
      { checked: false, text: 'CO₂ in, O₂ out during photosynthesis' },
      { checked: false, text: 'Transpiration = water loss via stomata' },
      { checked: false, text: 'Most stomata on lower leaf surface' },
    ],
    misconception: {
      wrong: 'Stomata are always open to let in sunlight.',
      right: 'Stomata open for gas exchange, not light — they close at night or when the plant is water-stressed.',
    },
    curiosityByte: {
      fact: 'A single oak leaf can have over 50,000 stomata per square centimetre.',
      question: 'What would happen to a plant if its guard cells stopped working?',
    },
    history: [
      { date: '16 May', type: 'Module',  detail: '3/6 MCQs · 0.45 score' },
      { date: '22 May', type: 'Sharpen', detail: 'WHY prompt attempted' },
      { date: '27 May', type: 'Sharpen', detail: 'score lifted to 0.58' },
    ],
  },

  c104: { // Chlorophyll & light — WEAK, dueForRecall
    recap: 'Plants make food using sunlight, water, and CO₂. The green pigment chlorophyll absorbs light. Stomata on leaves let gases in and out. Glucose is made and stored as starch. Roots draw water; xylem carries it upward.',
    checklist: [
      { checked: true,  text: 'Photosynthesis needs light, water, CO₂' },
      { checked: true,  text: 'Chlorophyll absorbs sunlight' },
      { checked: true,  text: 'Stomata = pores on the leaf' },
      { checked: false, text: 'Xylem moves water upward' },
      { checked: false, text: 'Phloem moves food downward' },
    ],
    misconception: {
      wrong: 'Plants breathe in O₂ during the day.',
      right: 'During the day, plants release O₂ and take in CO₂ for photosynthesis.',
    },
    curiosityByte: {
      fact: 'A single leaf can have 100,000+ stomata.',
      question: 'What would happen if they all closed at once?',
    },
    history: [
      { date: '23 May', type: 'Module',  detail: '4/6 MCQs · 0.38 score' },
      { date: '25 May', type: 'Sharpen', detail: 'misconception confirmed' },
      { date: '27 May', type: 'Sharpen', detail: 'score lifted to 0.42' },
    ],
  },

  c105: { // Root absorption — STRONG
    recap: 'Roots absorb water and dissolved minerals from the soil through root hair cells. Osmosis drives water into the root cells due to a concentration gradient. Water then moves up through the xylem by transpiration pull. Roots also anchor the plant in the soil. Active transport absorbs minerals against concentration gradients.',
    checklist: [
      { checked: true,  text: 'Root hairs increase surface area' },
      { checked: true,  text: 'Osmosis drives water into roots' },
      { checked: true,  text: 'Xylem transports water upward' },
      { checked: true,  text: 'Minerals absorbed by active transport' },
      { checked: false, text: 'Transpiration pull creates suction' },
    ],
    misconception: {
      wrong: 'Roots absorb food (glucose) from the soil for the plant.',
      right: 'Roots absorb only water and minerals — the plant makes its own glucose through photosynthesis.',
    },
    curiosityByte: {
      fact: 'A single rye plant can have over 14 billion root hair cells with a total length of 11,000 km.',
      question: 'Why do plants die if waterlogged soil prevents roots from getting oxygen?',
    },
    history: [
      { date: '10 May', type: 'Module',  detail: '5/6 MCQs · 0.72 score' },
      { date: '17 May', type: 'Sharpen', detail: 'score lifted to 0.79' },
      { date: '23 May', type: 'Recall',  detail: 'interval advanced to 21 days' },
    ],
  },

  c106: { // Xylem & phloem — VERY_WEAK
    recap: 'Xylem and phloem are the two vascular tissues in plants. Xylem carries water and minerals upward from roots to leaves. Phloem transports dissolved sugars (glucose) from leaves to all parts of the plant. Together they form vascular bundles visible in stem cross-sections. Xylem cells are dead; phloem cells are living.',
    checklist: [
      { checked: false, text: 'Xylem = water + minerals, moves upward' },
      { checked: false, text: 'Phloem = sugars, moves in all directions' },
      { checked: false, text: 'Xylem cells are dead at maturity' },
      { checked: false, text: 'Phloem cells are living' },
      { checked: false, text: 'Both form vascular bundles' },
    ],
    misconception: {
      wrong: 'Xylem carries both water and food throughout the plant.',
      right: 'Xylem only carries water and minerals upward — phloem carries food (sugars) in all directions.',
    },
    curiosityByte: {
      fact: 'The phloem can transport sugars at up to 1 metre per hour — fast enough to cross a tall tree in a day.',
      question: 'If you ring-barked a tree (removed a strip of bark and phloem), what would happen to the roots?',
    },
    history: [
      { date: '18 May', type: 'Module',  detail: '1/6 MCQs · 0.14 score' },
      { date: '24 May', type: 'Sharpen', detail: 'Feynman attempted — poor score' },
      { date: '28 May', type: 'Sharpen', detail: 'score lifted to 0.18' },
    ],
  },

  h103: { // Indus Valley — STRONG, dueForRecall
    recap: 'The Indus Valley Civilisation (2600–1900 BCE) was one of the world\'s earliest urban cultures. Major cities include Mohenjo-daro and Harappa. They had advanced town planning with grid streets and covered drains. The script remains undeciphered to this day. Trade was conducted with Mesopotamia.',
    checklist: [
      { checked: true,  text: 'Flourished 2600–1900 BCE' },
      { checked: true,  text: 'Major cities: Mohenjo-daro, Harappa' },
      { checked: true,  text: 'Advanced drainage & town planning' },
      { checked: true,  text: 'Script still undeciphered' },
      { checked: false, text: 'Traded with Mesopotamia via sea routes' },
    ],
    misconception: {
      wrong: 'The Indus Valley people were nomads with no fixed settlements.',
      right: 'The Indus Valley Civilisation had highly planned cities with standardised brick sizes and drainage systems.',
    },
    curiosityByte: {
      fact: 'The Indus Valley script has about 400 distinct symbols — but no bilingual text like the Rosetta Stone exists to help decode it.',
      question: 'What might historians discover if the Indus script were ever decoded?',
    },
    history: [
      { date: '15 May', type: 'Module',  detail: '5/5 MCQs · 0.88 score' },
      { date: '22 May', type: 'Sharpen', detail: 'score lifted to 0.90' },
      { date: '28 May', type: 'Recall',  detail: 'interval: 14 days · due today' },
    ],
  },

  g101: { // Latitude & longitude — STRONG, dueForRecall
    recap: 'Latitude measures distance north or south of the equator in degrees (0°–90°). Longitude measures distance east or west of the Prime Meridian (0°–180°). Together they form a grid to locate any point on Earth. The equator is 0° latitude; the poles are 90°N and 90°S. The Prime Meridian passes through Greenwich, London.',
    checklist: [
      { checked: true,  text: 'Latitude: 0° equator to 90° poles' },
      { checked: true,  text: 'Longitude: 0° Prime Meridian to 180°' },
      { checked: true,  text: 'Grid system locates any point on Earth' },
      { checked: true,  text: 'Equator = 0° latitude' },
      { checked: false, text: 'Time zones follow lines of longitude' },
    ],
    misconception: {
      wrong: 'Latitude lines run vertically (up-down) on a map.',
      right: 'Latitude lines run horizontally (east-west) and measure distance from the equator.',
    },
    curiosityByte: {
      fact: 'One degree of latitude equals approximately 111 km on Earth\'s surface.',
      question: 'Why is it warmer near the equator than near the poles? (Think about the angle of sunlight.)',
    },
    history: [
      { date: '11 May', type: 'Module',  detail: '5/5 MCQs · 0.84 score' },
      { date: '19 May', type: 'Sharpen', detail: 'score lifted to 0.87' },
      { date: '28 May', type: 'Recall',  detail: 'interval: 14 days · due today' },
    ],
  },

  v101: { // The Preamble — STRONG
    recap: 'The Preamble is the opening statement of the Indian Constitution. It declares India to be a Sovereign, Socialist, Secular, Democratic Republic. It also commits to Justice, Liberty, Equality, and Fraternity for all citizens. The words "Socialist" and "Secular" were added by the 42nd Amendment in 1976. The Preamble is not enforceable by courts but reflects the spirit of the Constitution.',
    checklist: [
      { checked: true,  text: '"Sovereign Socialist Secular Democratic Republic"' },
      { checked: true,  text: 'Justice, Liberty, Equality, Fraternity' },
      { checked: true,  text: '"Socialist" & "Secular" added in 1976 (42nd Amendment)' },
      { checked: true,  text: 'Not enforceable by courts' },
      { checked: false, text: 'Preamble is an aid to interpret the Constitution' },
    ],
    misconception: {
      wrong: 'The Preamble is the most powerful legal document — courts enforce it directly.',
      right: 'The Preamble guides interpretation of the Constitution but is not directly enforceable by courts.',
    },
    curiosityByte: {
      fact: 'The Indian Preamble was inspired by the Preamble to the US Constitution and Jawaharlal Nehru\'s "Objectives Resolution" of 1946.',
      question: 'If you were drafting a new Preamble today, which value would you add and why?',
    },
    history: [
      { date: '8 May',  type: 'Module',  detail: '6/6 MCQs · 0.88 score' },
      { date: '16 May', type: 'Sharpen', detail: 'score lifted to 0.92' },
      { date: '24 May', type: 'Recall',  detail: 'interval advanced to 30 days' },
    ],
  },

  // ─── Society (NEP) — concepts written as cause-effect chains ────────────
  // The point isn't to memorise definitions — it's to see how one idea
  // unlocks the next.

  s102: { // Latitude & Longitude — STRONG, dueForRecall
    recap: "Latitude lines tell you how far north or south of the equator you are. Longitude lines tell you how far east or west. Together they form a grid — Earth's address system. Here's the magic: latitude controls how directly the sun hits you, which controls climate, which controls what crops grow, which shapes food culture and even how people live. Longitude controls time — every 15° east, the sun arrives one hour earlier.",
    checklist: [
      { checked: true,  text: 'Latitude = horizontal (east-west) lines, measure N/S' },
      { checked: true,  text: 'Longitude = vertical lines, measure E/W from Prime Meridian' },
      { checked: true,  text: 'Equator = 0° latitude, Prime Meridian = 0° longitude' },
      { checked: false, text: 'Lat → sun angle → climate → crops → culture' },
      { checked: false, text: 'Longitude → time zones (15° ≈ 1 hour)' },
    ],
    misconception: {
      wrong: 'Latitude lines run vertically up and down on a globe.',
      right: 'Latitude is horizontal (think "ladder rungs"). It measures distance from the equator. Longitude runs vertically.',
    },
    curiosityByte: {
      fact: 'When it is 12 noon in Greenwich, London, it is already 5:30 PM in India — because India is 5.5 hours of longitude ahead.',
      question: 'If India had used its true geographic longitude for time, the east and west of the country would be over 2 hours apart. Why do you think we picked one time for everyone?',
    },
    history: [
      { date: '15 May', type: 'Module',  detail: '5/5 MCQs · 0.84 score' },
      { date: '23 May', type: 'Sharpen', detail: 'score lifted to 0.86' },
      { date: '28 May', type: 'Recall',  detail: 'interval: 14 days · due today' },
    ],
  },

  s204: { // Ancient Texts of India — VERY_WEAK
    recap: "India's earliest texts — the four Vedas (Rigveda, Samaveda, Yajurveda, Atharvaveda), the philosophical Upanishads, and the great epics (Ramayana and Mahabharata) — were not written down first. They were memorised and chanted, passed from teacher to student for thousands of years before paper existed. The Rigveda alone has over 1,000 hymns and is among the world's oldest surviving texts (c. 1500 BCE). Big idea: oral cultures can preserve knowledge with extraordinary precision — and what a society chooses to remember in its texts reveals what it values most.",
    checklist: [
      { checked: false, text: 'Four Vedas: Rigveda (oldest, c. 1500 BCE), Samaveda, Yajurveda, Atharvaveda' },
      { checked: false, text: 'Upanishads: philosophical discussions on reality and the self' },
      { checked: false, text: 'Mahabharata (world\'s longest epic, 100,000 verses) and Ramayana' },
      { checked: false, text: 'Texts were memorised first — written only centuries later' },
      { checked: false, text: 'Rigveda reciters used forward-backward-pattern chanting to preserve accuracy' },
    ],
    curiosityByte: {
      fact: 'Reciters of the Rigveda use a technique called pada-patha — reciting the same hymn forwards, backwards, in pairs, and in complex patterns — to guarantee not one syllable changes across 3,000 years.',
      question: 'Before printing existed, how would YOU design a system to pass a 10,000-word text from generation to generation perfectly?',
    },
    history: [
      { date: '2 Jun', type: 'Module',  detail: '2/9 right · 0.22 score' },
    ],
  },

  s205: { // Yoga, Ayurveda & Ancient Science — NOT_STARTED (intro recap)
    recap: "Ancient India made remarkable scientific contributions. Aryabhata (476 CE) calculated pi to 4 decimal places and said the Earth rotates on its axis — 1,000 years before Europe accepted this. Indians developed zero and the decimal system — the foundation of all modern computing. Sushruta performed surgical operations including plastic surgery over 2,500 years ago. The Iron Pillar at Delhi has stood rust-free for 1,600 years — a metallurgical achievement modern science only recently understood. Yoga and Ayurveda are body-mind wellness systems still used worldwide today. Big idea: ancient does not mean primitive.",
    checklist: [
      { checked: false, text: 'Aryabhata (476 CE): pi, Earth rotates, algebra, trigonometry' },
      { checked: false, text: 'Zero and decimal system invented in India — spread via Arabs to the world' },
      { checked: false, text: 'Sushruta Samhita: 300+ surgical procedures, plastic surgery, cataract removal' },
      { checked: false, text: 'Iron Pillar at Delhi: 1,600 years old, rust-resistant metallurgy' },
      { checked: false, text: 'Yoga = union of body and mind; Ayurveda = science of life (diet + herbs + surgery)' },
    ],
    curiosityByte: {
      fact: 'The Iron Pillar at Delhi (c. 400 CE) contains a high-phosphorus composition that forms a thin protective layer — a process modern metallurgists only understood in the 1990s. Yet ancient Indian smiths achieved it empirically, 1,600 years ago.',
      question: 'If ancient Indians could figure out rust-resistant iron without modern chemistry, what does that say about how we think about "advanced" and "primitive"?',
    },
    history: [],
  },

  s206: { // Trade & Crafts in Ancient India — NOT_STARTED
    recap: "India was one of the ancient world's greatest trading civilisations. Ships from ports like Bharuch (Gujarat) and Arikamedu (Tamil Nadu) carried spices, cotton, gems, and iron to Rome, Arabia, China, and East Africa. Monsoon winds were seasonal engines — blowing ships outward in summer and bringing them home in winter. Craftsmen organised into guilds (shrenis) to maintain quality and prices. Roman gold coins found at South Indian sites prove India had a trade surplus with Rome. Big idea: trade doesn't just move goods — it moves ideas, religions, languages, and food too.",
    checklist: [
      { checked: false, text: 'India exported: spices, cotton, gems, iron, ivory' },
      { checked: false, text: 'Major ports: Bharuch (Gujarat), Sopara (Maharashtra), Arikamedu (Tamil Nadu)' },
      { checked: false, text: 'Monsoon winds: summer blows ships to Arabia/Africa; winter brings them back' },
      { checked: false, text: 'Shrenis (guilds): organised craftsmen, set standards, trained apprentices' },
      { checked: false, text: 'Roman gold coins found in India = proof of large-scale Rome–India trade' },
    ],
    curiosityByte: {
      fact: 'Roman writer Pliny the Elder (c. 75 CE) complained that India was draining Rome of 550 million sesterces per year in gold — all because Romans couldn\'t get enough Indian pepper, gems, and cotton cloth.',
      question: 'Why do you think people in Rome would pay gold for Indian pepper — when gold is much more valuable than pepper today?',
    },
    history: [],
  },

  s207: { // Early Kingdoms & Republics — NOT_STARTED
    recap: "Around 600 BCE, northern India was divided into 16 major kingdoms called Mahajanapadas. Among them, Magadha (near modern Patna) grew the strongest — thanks to iron-rich soil, war elephants, and control of the Ganga trade route. But not all states were kingdoms. Vajji (capital Vaishali) was a gana sangha — a republic where an elected assembly made decisions collectively. The Shakyas, Gautama Buddha's own people, were also a republic. Magadha eventually absorbed all others, becoming the base for the Maurya Empire. Big idea: democracy is not a modern Western invention — India had functioning republics 2,500 years ago.",
    checklist: [
      { checked: false, text: '16 Mahajanapadas by c. 600 BCE; smaller ones called Janapadas' },
      { checked: false, text: 'Magadha (Bihar) = most powerful: iron tools, elephants, fertile land, Ganga access' },
      { checked: false, text: 'Vajji (Vaishali) = gana sangha: republic with an elected assembly' },
      { checked: false, text: 'Shakyas (Buddha\'s people) were also a republic' },
      { checked: false, text: 'Magadha → eventually became the Maurya Empire under Chandragupta' },
    ],
    curiosityByte: {
      fact: 'The Licchavi republic at Vaishali (c. 600 BCE) held assemblies in a large public hall where representatives voted on decisions. Dr. B.R. Ambedkar, who wrote India\'s Constitution, cited the Licchavis as an ancient Indian democratic precedent.',
      question: 'If you were designing a republic 2,500 years ago — with no phones, email, or printing — how would you make sure all the representatives\' votes actually got counted correctly?',
    },
    history: [],
  },

  s301: { // Ancient Texts of India — STRONG, dueForRecall
    recap: "India's earliest texts — the Vedas, Upanishads, epics like the Ramayana and Mahabharata — weren't first written down. They were memorised and chanted, passed from teacher to student for thousands of years before paper. The Vedas alone are over 3,000 years old. They contain hymns, philosophy, music, mathematics (early ideas of zero and infinity), and astronomy. Big idea: a culture's memory can survive in voices, not just books — and what people choose to remember tells you what they value.",
    checklist: [
      { checked: true,  text: 'Vedas are among the world\'s oldest texts (3,000+ years)' },
      { checked: true,  text: 'Originally passed orally — memorised, not written' },
      { checked: true,  text: 'Cover hymns, philosophy, music, math, astronomy' },
      { checked: true,  text: 'Ramayana & Mahabharata = epics (itihasa)' },
      { checked: false, text: 'Oral tradition shows what a culture chose to remember' },
    ],
    curiosityByte: {
      fact: 'Reciters of the Rigveda use a special technique called pada-patha — they recite the same hymn forwards, backwards, in pairs, and in patterns — to guarantee not one syllable changes across generations.',
      question: 'Before printing or writing, how would you guarantee a long poem survived 3,000 years exactly word-for-word?',
    },
    history: [
      { date: '14 May', type: 'Module',  detail: '6/6 MCQs · 0.82 score' },
      { date: '21 May', type: 'Sharpen', detail: 'score lifted to 0.85' },
      { date: '28 May', type: 'Recall',  detail: 'interval: 14 days · due today' },
    ],
  },

  s403: { // What is Democracy? — VERY_WEAK, dueForRecall
    recap: "Democracy means 'rule by the people'. Instead of a king or a small group deciding, the people choose their leaders by voting. India is the world's largest democracy. But democracy is much more than elections — it's also about everyone having a voice, treating each other as equals, and following rules everyone agreed to (the Constitution). Big idea: power that is shared is less likely to be misused. When power is concentrated in one person or family, it usually goes wrong.",
    checklist: [
      { checked: false, text: 'Democracy = people choose their leaders' },
      { checked: false, text: 'India is the world\'s largest democracy' },
      { checked: false, text: 'Voting, free speech, equal rights are core ideas' },
      { checked: false, text: 'The Constitution is the rulebook everyone agreed to' },
      { checked: false, text: 'Shared power → safer than concentrated power' },
    ],
    misconception: {
      wrong: 'Democracy just means voting once every 5 years.',
      right: 'Voting is just one part. Democracy also means daily things — speaking freely, being treated equally, holding leaders accountable, and following rules everyone helped make.',
    },
    curiosityByte: {
      fact: 'When India held its first general election in 1951–52, it was the largest free vote in history — 173 million voters, most of whom could not read or write. Ballot boxes had party symbols (lotus, hand, etc.) so anyone could vote.',
      question: 'Why do you think Indian ballots still use symbols today, even though more people can read now?',
    },
    history: [
      { date: '18 May', type: 'Module',  detail: '2/6 MCQs · 0.20 score' },
      { date: '25 May', type: 'Sharpen', detail: 'Feynman attempted' },
      { date: '28 May', type: 'Sharpen', detail: 'score lifted to 0.24' },
    ],
  },
};

// Default detail for concepts without a specific entry
export const DEFAULT_CONCEPT_DETAIL: ConceptDetail = {
  recap: 'This concept covers key ideas in this chapter. Review your notes and the textbook passage before attempting a sharpen session. Focus on understanding the why and how, not just the definition.',
  checklist: [
    { checked: false, text: 'Can define the concept in one sentence' },
    { checked: false, text: 'Can explain why it matters' },
    { checked: false, text: 'Can give a real-world example' },
    { checked: false, text: 'Can connect it to related concepts' },
  ],
  curiosityByte: {
    fact: 'The best way to know if you understand something is to try explaining it to someone who knows nothing about it.',
    question: 'Could you teach this concept to a Class 3 student? Give it a try.',
  },
  history: [],
};

// ─── Sharpen Session Questions ─────────────────────────────────────────────────
// Covers: MCQ (2 tiers), DESCRIPTIVE, FEYNMAN, BLURT — all question types

export const SESSION_QUESTIONS: Question[] = [
  {
    id: 'q1',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'Which gas do plants take in during photosynthesis?',
    options: [
      { id: 'a', text: 'Oxygen',         correct: false },
      { id: 'b', text: 'Nitrogen',       correct: false },
      { id: 'c', text: 'Carbon dioxide', correct: true  },
      { id: 'd', text: 'Hydrogen',       correct: false },
    ],
    explanation: 'Plants take in CO₂ and release O₂ during photosynthesis. The opposite happens during respiration.',
  },
  {
    id: 'q2',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'Where is chlorophyll found in a plant cell?',
    options: [
      { id: 'a', text: 'Mitochondria', correct: false },
      { id: 'b', text: 'Chloroplast',  correct: true  },
      { id: 'c', text: 'Nucleus',      correct: false },
      { id: 'd', text: 'Vacuole',      correct: false },
    ],
    explanation: 'Chlorophyll is the green pigment found in chloroplasts. It absorbs red and blue light for photosynthesis.',
  },
  {
    id: 'q3',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'What do guard cells control?',
    options: [
      { id: 'a', text: 'Chlorophyll production', correct: false },
      { id: 'b', text: 'Opening and closing of stomata', correct: true },
      { id: 'c', text: 'Water absorption by roots', correct: false },
      { id: 'd', text: 'Movement of glucose in phloem', correct: false },
    ],
    explanation: 'Guard cells are kidney-shaped cells that surround each stoma and regulate its opening and closing in response to light and water availability.',
  },
  {
    id: 'q4',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'Why do most leaves look green to our eyes?',
    rubricHint: 'Mention: (1) chlorophyll, (2) which wavelengths it absorbs, (3) which it reflects.',
  },
  {
    id: 'q5',
    type: 'FEYNMAN',
    tier: 'WEAK',
    text: 'Last time you confused chlorophyll with stomata.\n\nExplain to your friend who missed class: what does chlorophyll do, and how is it different from stomata?',
    keyConcepts: ['chlorophyll', 'light absorption', 'stomata = pores', 'gas exchange'],
  },
  {
    id: 'q6',
    type: 'DESCRIPTIVE',
    tier: 'DEVELOPING',
    text: 'How does water travel from the roots to the leaves of a tall tree?',
    rubricHint: 'Mention: (1) osmosis in root hairs, (2) xylem tissue, (3) transpiration pull.',
  },
  {
    id: 'q7',
    type: 'BLURT',
    text: 'Chlorophyll & light',
  },
];

// ─── Active Recall Session ────────────────────────────────────────────────────
// Covers ACTIVE_RECALL question type — 3 concepts from different subjects

export const RECALL_QUESTIONS: Question[] = [
  {
    id: 'ar1',
    type: 'ACTIVE_RECALL',
    text: 'A farmer grows tomatoes in a dark shed under a red-only grow lamp. The plants look weak.\n\nUsing what you know about chlorophyll, suggest two reasons why — and what light you\'d add.',
  },
  {
    id: 'ar2',
    type: 'ACTIVE_RECALL',
    text: 'You\'re explaining latitude to a younger student. They ask: "Why is it always cold at the poles and hot at the equator?"\n\nExplain using what you know about latitude and solar angles.',
  },
  {
    id: 'ar3',
    type: 'ACTIVE_RECALL',
    text: 'A friend says the assassination of Archduke Franz Ferdinand was the "real cause" of WW1.\n\nDo you agree? Explain using the long-term causes you have studied.',
  },
];

export const RECALL_CONCEPT_INFO = [
  { name: 'Chlorophyll & light', subject: 'Science',   color: COLORS.science },
  { name: 'Latitude & longitude', subject: 'Geography', color: COLORS.geo     },
  { name: 'Causes of WW1',       subject: 'History',   color: COLORS.history  },
];

// ─── Concept Flat Lookup ──────────────────────────────────────────────────────

export type ConceptWithLocation = Concept & { chapterId: string; subjectKey: string };

export const CONCEPT_BY_ID: Record<string, ConceptWithLocation> = Object.fromEntries(
  Object.entries(CONCEPT_DATA).flatMap(([chapterId, concepts]) =>
    concepts.map(c => [c.id, { ...c, chapterId, subjectKey: chapterId.split('_ch')[0] }])
  )
);

// Concepts that map to a specific RECALL_QUESTIONS entry (by index)
export const CONCEPT_RECALL_IDX: Record<string, number> = {
  c104: 0, // Chlorophyll & light → ar1
  g101: 1, // Latitude & longitude → ar2
};
