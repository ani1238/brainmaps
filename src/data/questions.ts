import type { Question } from '@/types';

// ═══════════════════════════════════════════════════════════════════════════
// SCIENCE — Class 6 CBSE
// ═══════════════════════════════════════════════════════════════════════════

// ─── sci_ch1: Life Processes in Plants ─────────────────────────────────────

export const QUESTIONS_c101: Question[] = [
  {
    id: 'c101_q1',
    type: 'MCQ',
    text: 'In a sealed glass jar with a healthy potted plant and a mouse, what condition would let both survive longest?',
    options: [
      { id: 'a', text: 'Keep the jar in total darkness so the plant rests', correct: false },
      { id: 'b', text: 'Place it in bright light so the plant can photosynthesise', correct: true },
      { id: 'c', text: 'Cool the jar to slow the mouse\'s breathing', correct: false },
      { id: 'd', text: 'Add extra carbon dioxide by blowing into the jar', correct: false },
    ],
    explanation: 'Only with light can the plant photosynthesise, producing O₂ for the mouse and using the mouse\'s CO₂ — completing the cycle.',
  },
  {
    id: 'c101_q2',
    type: 'DESCRIPTIVE',
    text: 'How is photosynthesis essentially the reverse of respiration?',
    rubricHint: 'Mention: (1) inputs and outputs of each process, (2) whether energy is stored or released, (3) where each happens in the cell.',
  },
  {
    id: 'c101_q3',
    type: 'FEYNMAN',
    text: 'A friend says: "Plants eat food from the soil, just like we eat food from a plate."\n\nExplain why this is wrong in plain words a younger student would understand.',
    keyConcepts: ['plants make their own food', 'sunlight + CO₂ + water', 'glucose is the food', 'soil only gives water and minerals'],
  },
  {
    id: 'c101_q4',
    type: 'BLURT',
    text: 'Photosynthesis overview',
  },
  {
    id: 'c101_q5',
    type: 'ACTIVE_RECALL',
    text: 'A city plans to plant 10,000 trees along a busy polluted highway to "freshen the air."\n\nUsing photosynthesis, explain two reasons why this helps — and one reason it won\'t completely fix the pollution.',
  },
];

export const QUESTIONS_c102: Question[] = [
  {
    id: 'c102_q1',
    type: 'MCQ',
    text: 'Why do most leaves look green to our eyes?',
    options: [
      { id: 'a', text: 'Chlorophyll absorbs green light strongly', correct: false },
      { id: 'b', text: 'Chlorophyll absorbs red and blue light and reflects green', correct: true },
      { id: 'c', text: 'Leaves have green dye produced in the soil', correct: false },
      { id: 'd', text: 'All living things appear green under sunlight', correct: false },
    ],
    explanation: 'Chlorophyll absorbs red and blue wavelengths for photosynthesis but reflects green — which is what reaches our eyes.',
  },
  {
    id: 'c102_q2',
    type: 'DESCRIPTIVE',
    text: 'Why do leaves change colour in autumn, even though chlorophyll was making them green all summer?',
    rubricHint: 'Mention: (1) chlorophyll breaks down in autumn, (2) other pigments like carotenoids were always there but hidden, (3) less sunlight signals the change.',
  },
  {
    id: 'c102_q3',
    type: 'FEYNMAN',
    text: 'A younger cousin asks: "If chlorophyll is green, why is grass green and not chlorophyll-coloured?"\n\nExplain to them what they\'re missing.',
    keyConcepts: ['chlorophyll IS the green pigment', 'reflected vs absorbed light', 'we see reflected light', 'red and blue are absorbed'],
  },
  {
    id: 'c102_q4',
    type: 'BLURT',
    text: 'Why leaves are green',
  },
  {
    id: 'c102_q5',
    type: 'ACTIVE_RECALL',
    text: 'A scientist breeds a tomato plant with purple leaves instead of green.\n\nUsing what you know about why leaves are green, predict how this plant might grow compared to a normal one — and explain your reasoning.',
  },
];

export const QUESTIONS_c103: Question[] = [
  {
    id: 'c103_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Why are most stomata found on the lower surface of a leaf rather than the upper?',
    options: [
      { id: 'a', text: 'The lower surface gets more sunlight', correct: false },
      { id: 'b', text: 'It reduces water loss since the underside is cooler and shaded', correct: true },
      { id: 'c', text: 'Stomata only work on rough surfaces', correct: false },
      { id: 'd', text: 'Gravity pulls gases downward', correct: false },
    ],
    explanation: 'The cooler, shaded underside loses less water through evaporation, so placing stomata there reduces transpiration loss.',
  },
  {
    id: 'c103_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'What happens to guard cells when stomata open?',
    options: [
      { id: 'a', text: 'They shrink and become flat', correct: false },
      { id: 'b', text: 'They absorb water and become curved, pulling the pore open', correct: true },
      { id: 'c', text: 'They dissolve completely', correct: false },
      { id: 'd', text: 'They turn brown and harden', correct: false },
    ],
    explanation: 'When guard cells take in water, they swell and curve outward, opening the stoma between them.',
  },
  {
    id: 'c103_q3',
    type: 'DESCRIPTIVE',
    text: 'How do stomata help a plant balance two competing needs: getting CO₂ in and keeping water inside?',
    rubricHint: 'Mention: (1) stomata open for CO₂ in daylight, (2) water vapour escapes when they\'re open, (3) they close at night or when dry.',
  },
  {
    id: 'c103_q4',
    type: 'FEYNMAN',
    text: 'Your friend thinks stomata are like windows that stay open all the time.\n\nExplain why that\'s wrong and what stomata actually do.',
    keyConcepts: ['guard cells', 'open and close', 'gas exchange', 'water loss control', 'response to light and water'],
  },
  {
    id: 'c103_q5',
    type: 'BLURT',
    text: 'Stomata & gas exchange',
  },
  {
    id: 'c103_q6',
    type: 'ACTIVE_RECALL',
    text: 'A potted plant left in the sun on a hot, dry day starts wilting even though its soil is still moist.\n\nUsing what you know about stomata, explain what might be happening and what the plant is "deciding" to do.',
  },
];

export const QUESTIONS_c104: Question[] = [
  {
    id: 'c104_q1',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'Which colours of light does chlorophyll absorb most strongly?',
    options: [
      { id: 'a', text: 'Green and yellow', correct: false },
      { id: 'b', text: 'Red and blue', correct: true },
      { id: 'c', text: 'Only white light', correct: false },
      { id: 'd', text: 'Ultraviolet only', correct: false },
    ],
    explanation: 'Chlorophyll mainly absorbs the red and blue parts of sunlight; green is mostly reflected, which is why leaves look green.',
  },
  {
    id: 'c104_q2',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'Where in the plant cell is chlorophyll found?',
    options: [
      { id: 'a', text: 'Mitochondria', correct: false },
      { id: 'b', text: 'Chloroplasts', correct: true },
      { id: 'c', text: 'Nucleus', correct: false },
      { id: 'd', text: 'Vacuole', correct: false },
    ],
    explanation: 'Chlorophyll molecules sit inside chloroplasts — the green organelles where photosynthesis happens.',
  },
  {
    id: 'c104_q3',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'Why would a plant grown under only green light grow very poorly?',
    rubricHint: 'Mention: (1) chlorophyll reflects green, (2) it cannot absorb green for energy, (3) so photosynthesis is starved of light.',
  },
  {
    id: 'c104_q4',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'How does chlorophyll help convert light energy into food energy?',
    rubricHint: 'Mention: (1) chlorophyll absorbs light, (2) energy splits water and powers reactions, (3) glucose is the stored chemical energy.',
  },
  {
    id: 'c104_q5',
    type: 'FEYNMAN',
    text: 'Last time you mixed up chlorophyll and stomata.\n\nExplain to a younger student: what does chlorophyll do, and how is it different from stomata?',
    keyConcepts: ['chlorophyll = pigment', 'absorbs light', 'stomata = pores', 'gas exchange', 'completely different jobs'],
  },
  {
    id: 'c104_q6',
    type: 'BLURT',
    text: 'Chlorophyll & light',
  },
];

export const QUESTIONS_c105: Question[] = [
  {
    id: 'c105_q1',
    type: 'MCQ',
    text: 'Why do root hairs make root absorption much more efficient?',
    options: [
      { id: 'a', text: 'They store water inside themselves like sponges', correct: false },
      { id: 'b', text: 'They greatly increase the surface area in contact with soil', correct: true },
      { id: 'c', text: 'They produce digestive juices that break down soil', correct: false },
      { id: 'd', text: 'They reach deeper than other roots into groundwater', correct: false },
    ],
    explanation: 'Thousands of tiny root hairs hugely expand the area of root in contact with soil water and minerals, speeding up absorption.',
  },
  {
    id: 'c105_q2',
    type: 'DESCRIPTIVE',
    text: 'How do water and minerals get into a root cell, and why are the two processes different?',
    rubricHint: 'Mention: (1) water enters by osmosis (passive), (2) minerals enter by active transport (uses energy), (3) the difference is concentration direction.',
  },
  {
    id: 'c105_q3',
    type: 'FEYNMAN',
    text: 'A classmate says: "Roots eat food from the soil and pass it up to the leaves."\n\nExplain what\'s really happening — what do roots actually absorb?',
    keyConcepts: ['water and minerals only', 'no glucose from soil', 'leaves make food', 'osmosis', 'transport upward'],
  },
  {
    id: 'c105_q4',
    type: 'BLURT',
    text: 'Root absorption',
  },
  {
    id: 'c105_q5',
    type: 'ACTIVE_RECALL',
    text: 'A farmer over-waters her field so much that the soil stays flooded for a week. The plants start dying even though they have plenty of water.\n\nUsing root absorption, explain why too much water can actually kill plants.',
  },
];

export const QUESTIONS_c106: Question[] = [
  {
    id: 'c106_q1',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'Which tissue carries water from roots up to the leaves?',
    options: [
      { id: 'a', text: 'Phloem', correct: false },
      { id: 'b', text: 'Xylem', correct: true },
      { id: 'c', text: 'Epidermis', correct: false },
      { id: 'd', text: 'Cambium', correct: false },
    ],
    explanation: 'Xylem is the plant\'s "water pipe" — it carries water and dissolved minerals upward only.',
  },
  {
    id: 'c106_q2',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'What does phloem transport?',
    options: [
      { id: 'a', text: 'Only water', correct: false },
      { id: 'b', text: 'Only oxygen', correct: false },
      { id: 'c', text: 'Sugars (food) made in the leaves', correct: true },
      { id: 'd', text: 'Minerals from soil', correct: false },
    ],
    explanation: 'Phloem carries dissolved sugars from leaves to wherever the plant needs energy — roots, fruits, growing tips.',
  },
  {
    id: 'c106_q3',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'What\'s a key difference between xylem and phloem cells?',
    options: [
      { id: 'a', text: 'Xylem cells are dead at maturity; phloem cells are alive', correct: true },
      { id: 'b', text: 'Both are dead', correct: false },
      { id: 'c', text: 'Both are alive', correct: false },
      { id: 'd', text: 'Phloem cells are dead; xylem cells are alive', correct: false },
    ],
    explanation: 'Mature xylem cells are hollow dead tubes (just walls), while phloem cells stay alive to actively move sugars.',
  },
  {
    id: 'c106_q4',
    type: 'DESCRIPTIVE',
    tier: 'VERY_WEAK',
    text: 'Why does the plant need TWO separate transport tissues instead of one?',
    rubricHint: 'Mention: (1) different cargo (water vs sugars), (2) different directions, (3) different cell structures.',
  },
  {
    id: 'c106_q5',
    type: 'DESCRIPTIVE',
    tier: 'VERY_WEAK',
    text: 'How does water actually move upward through the xylem in a tall tree?',
    rubricHint: 'Mention: (1) transpiration pulls water up, (2) cohesion of water molecules, (3) continuous column from root to leaf.',
  },
  {
    id: 'c106_q6',
    type: 'FEYNMAN',
    text: 'Your friend says xylem and phloem are "basically the same thing — both tubes."\n\nExplain why they\'re really very different, in simple words.',
    keyConcepts: ['xylem = water up only', 'phloem = sugars all directions', 'xylem dead cells', 'phloem living cells'],
  },
];

export const QUESTIONS_c107: Question[] = [
  {
    id: 'c107_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Why do plants convert glucose into starch for storage?',
    options: [
      { id: 'a', text: 'Starch tastes better than glucose', correct: false },
      { id: 'b', text: 'Starch is insoluble, so it doesn\'t affect water balance in cells', correct: true },
      { id: 'c', text: 'Glucose is too small to store', correct: false },
      { id: 'd', text: 'Starch produces more energy than glucose', correct: false },
    ],
    explanation: 'Storing energy as insoluble starch keeps the cell\'s water balance steady; lots of dissolved glucose would mess with osmosis.',
  },
  {
    id: 'c107_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'How can you test whether a leaf has been photosynthesising?',
    options: [
      { id: 'a', text: 'Smell it for sugar', correct: false },
      { id: 'b', text: 'Dip it in iodine — starch turns blue-black', correct: true },
      { id: 'c', text: 'Crush it and look for green colour', correct: false },
      { id: 'd', text: 'Place it in oil', correct: false },
    ],
    explanation: 'Iodine turns blue-black in the presence of starch, the storage form of glucose made during photosynthesis.',
  },
  {
    id: 'c107_q3',
    type: 'DESCRIPTIVE',
    text: 'Why do potatoes and rice grains store so much starch?',
    rubricHint: 'Mention: (1) plants store excess glucose as starch, (2) starch is compact food reserve, (3) used during growth or by new plants.',
  },
  {
    id: 'c107_q4',
    type: 'FEYNMAN',
    text: 'A classmate eats a banana and says "I just ate plant glucose."\n\nExplain whether they\'re right or not, using what you know about how plants store food.',
    keyConcepts: ['glucose → starch storage', 'starch in fruits, tubers, seeds', 'we digest starch back to glucose', 'energy reserve'],
  },
  {
    id: 'c107_q5',
    type: 'BLURT',
    text: 'Glucose & starch storage',
  },
  {
    id: 'c107_q6',
    type: 'ACTIVE_RECALL',
    text: 'A gardener notices that potato plants grown in shade produce much smaller potatoes than those in full sun.\n\nUsing what you know about glucose and starch storage, explain why.',
  },
];

export const QUESTIONS_c108: Question[] = [
  {
    id: 'c108_q1',
    type: 'MCQ',
    text: 'What is transpiration?',
    options: [
      { id: 'a', text: 'The breathing in of CO₂ by plants', correct: false },
      { id: 'b', text: 'The loss of water vapour from a plant, mainly through the leaves', correct: true },
      { id: 'c', text: 'The making of glucose in the leaves', correct: false },
      { id: 'd', text: 'The movement of minerals down the stem', correct: false },
    ],
    explanation: 'Transpiration is water escaping as vapour through the leaves, mostly via the stomata.',
  },
  {
    id: 'c108_q2',
    type: 'MCQ',
    text: 'Through which part of the leaf does most water escape?',
    options: [
      { id: 'a', text: 'The waxy cuticle', correct: false },
      { id: 'b', text: 'The stomata', correct: true },
      { id: 'c', text: 'The veins', correct: false },
      { id: 'd', text: 'The leaf stalk', correct: false },
    ],
    explanation: 'Stomata are tiny pores that open for gas exchange, and most transpiration happens through them.',
  },
  {
    id: 'c108_q3',
    type: 'MCQ',
    text: 'Which condition speeds up transpiration?',
    options: [
      { id: 'a', text: 'Cold, still, humid air', correct: false },
      { id: 'b', text: 'Hot, dry, windy air', correct: true },
      { id: 'c', text: 'Total darkness', correct: false },
      { id: 'd', text: 'Heavy rain', correct: false },
    ],
    explanation: 'Heat, dry air and wind all increase evaporation, so transpiration is fastest in those conditions.',
  },
  {
    id: 'c108_q4',
    type: 'DESCRIPTIVE',
    text: 'Why is transpiration sometimes called a "necessary evil" for plants?',
    rubricHint: 'Mention: (1) it loses precious water, (2) but it pulls water up from roots, (3) and helps cool the plant.',
  },
  {
    id: 'c108_q5',
    type: 'DESCRIPTIVE',
    text: 'How does transpiration help water travel from the roots all the way to the top of a tall tree?',
    rubricHint: 'Mention: (1) evaporation at leaves, (2) suction pull through xylem, (3) continuous water column due to cohesion.',
  },
  {
    id: 'c108_q6',
    type: 'FEYNMAN',
    text: 'A friend says: "Plants sweat like we do."\n\nExplain how transpiration is similar to and different from human sweating.',
    keyConcepts: ['both lose water as vapour', 'both can cool', 'plants don\'t control transpiration the same way', 'transpiration also pulls water up'],
  },
];

// ─── sci_ch2: Photosynthesis — Deep Dive ───────────────────────────────────

export const QUESTIONS_c201: Question[] = [
  {
    id: 'c201_q1',
    type: 'MCQ',
    text: 'What is split during the light-dependent reactions of photosynthesis?',
    options: [
      { id: 'a', text: 'Glucose', correct: false },
      { id: 'b', text: 'Water (H₂O)', correct: true },
      { id: 'c', text: 'Carbon dioxide', correct: false },
      { id: 'd', text: 'Chlorophyll', correct: false },
    ],
    explanation: 'Light energy splits water molecules into hydrogen and oxygen — the oxygen is released as a by-product.',
  },
  {
    id: 'c201_q2',
    type: 'DESCRIPTIVE',
    text: 'Why are the light reactions called "light-dependent," and what would happen if you covered the plant?',
    rubricHint: 'Mention: (1) they need sunlight directly, (2) no light = no water-splitting, (3) downstream reactions also stop.',
  },
  {
    id: 'c201_q3',
    type: 'FEYNMAN',
    text: 'A friend thinks photosynthesis is "just one big reaction in the leaf."\n\nExplain that there are actually two stages — light-dependent and light-independent — and what the first stage does.',
    keyConcepts: ['two stages', 'light reactions need sunlight', 'splits water', 'makes ATP and NADPH', 'releases O₂'],
  },
  {
    id: 'c201_q4',
    type: 'BLURT',
    text: 'Light-dependent reactions',
  },
  {
    id: 'c201_q5',
    type: 'ACTIVE_RECALL',
    text: 'A researcher grows algae in a tank and bubbles inert nitrogen through it, removing all CO₂. She shines bright light.\n\nWhich stage of photosynthesis would still happen, and which would stop? Explain why.',
  },
];

export const QUESTIONS_c202: Question[] = [
  {
    id: 'c202_q1',
    type: 'MCQ',
    text: 'Inside a chloroplast, what are the stacked disc-like structures called?',
    options: [
      { id: 'a', text: 'Cristae', correct: false },
      { id: 'b', text: 'Thylakoids (stacked into grana)', correct: true },
      { id: 'c', text: 'Ribosomes', correct: false },
      { id: 'd', text: 'Vacuoles', correct: false },
    ],
    explanation: 'Thylakoids are flat discs stacked into grana; their membranes hold chlorophyll and run the light reactions.',
  },
  {
    id: 'c202_q2',
    type: 'DESCRIPTIVE',
    text: 'How does the structure of the chloroplast suit its function?',
    rubricHint: 'Mention: (1) double membrane, (2) thylakoid stacks maximise surface area for light reactions, (3) stroma holds the dark reactions.',
  },
  {
    id: 'c202_q3',
    type: 'FEYNMAN',
    text: 'A classmate calls the chloroplast "just a green ball."\n\nExplain how it actually has organised parts that each do a job.',
    keyConcepts: ['chloroplast = factory', 'thylakoids = light reactions', 'stroma = dark reactions', 'double membrane'],
  },
  {
    id: 'c202_q4',
    type: 'BLURT',
    text: 'Chloroplast structure',
  },
  {
    id: 'c202_q5',
    type: 'ACTIVE_RECALL',
    text: 'A drug damages only the thylakoid membranes of plant cells but leaves the rest of the chloroplast intact.\n\nWhich part of photosynthesis would stop, and which (if any) might keep going for a short time? Explain.',
  },
];

export const QUESTIONS_c203: Question[] = [
  {
    id: 'c203_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'In photosynthesis, ATP and NADPH are best described as:',
    options: [
      { id: 'a', text: 'The final food product of the plant', correct: false },
      { id: 'b', text: 'Energy carriers that fuel the Calvin cycle', correct: true },
      { id: 'c', text: 'Waste products released into the air', correct: false },
      { id: 'd', text: 'Pigments that absorb light', correct: false },
    ],
    explanation: 'ATP and NADPH carry the energy and electrons from the light reactions to the Calvin cycle, where glucose is built.',
  },
  {
    id: 'c203_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Which reactions produce ATP and NADPH?',
    options: [
      { id: 'a', text: 'The Calvin cycle (dark reactions)', correct: false },
      { id: 'b', text: 'Respiration in mitochondria only', correct: false },
      { id: 'c', text: 'The light-dependent reactions in the thylakoids', correct: true },
      { id: 'd', text: 'Transpiration', correct: false },
    ],
    explanation: 'ATP and NADPH are products of the light reactions — they are then used in the Calvin cycle to make glucose.',
  },
  {
    id: 'c203_q3',
    type: 'DESCRIPTIVE',
    text: 'Why can\'t the Calvin cycle run without ATP and NADPH from the light reactions?',
    rubricHint: 'Mention: (1) Calvin cycle needs energy, (2) ATP supplies energy, (3) NADPH supplies electrons to reduce CO₂ to sugar.',
  },
  {
    id: 'c203_q4',
    type: 'FEYNMAN',
    text: 'Your friend thinks ATP and NADPH are "fancy names for food."\n\nExplain that they\'re not food — they\'re more like rechargeable batteries.',
    keyConcepts: ['energy carriers, not food', 'recharged by light', 'spent in Calvin cycle', 'glucose is the actual food'],
  },
  {
    id: 'c203_q5',
    type: 'BLURT',
    text: 'ATP & NADPH production',
  },
  {
    id: 'c203_q6',
    type: 'ACTIVE_RECALL',
    text: 'A scientist puts a leaf in a sealed box with bright light but NO CO₂.\n\nWill the leaf produce ATP and NADPH? Will it produce glucose? Explain.',
  },
];

export const QUESTIONS_c204: Question[] = [
  {
    id: 'c204_q1',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'What is "fixed" during the Calvin cycle?',
    options: [
      { id: 'a', text: 'Water', correct: false },
      { id: 'b', text: 'Carbon dioxide', correct: true },
      { id: 'c', text: 'Oxygen', correct: false },
      { id: 'd', text: 'Sunlight', correct: false },
    ],
    explanation: 'Carbon fixation means CO₂ from the air is attached onto a larger molecule, starting the chain that builds glucose.',
  },
  {
    id: 'c204_q2',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'Why is the Calvin cycle called the "dark" reaction?',
    options: [
      { id: 'a', text: 'It can only happen at night', correct: false },
      { id: 'b', text: 'It doesn\'t directly need light (though it usually runs in daytime)', correct: true },
      { id: 'c', text: 'It happens in dark green leaves only', correct: false },
      { id: 'd', text: 'It only works in the chloroplast at night', correct: false },
    ],
    explanation: 'It doesn\'t use light directly — but it does need ATP and NADPH from the light reactions, so it usually runs in daylight too.',
  },
  {
    id: 'c204_q3',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'How are the light reactions and the Calvin cycle connected?',
    rubricHint: 'Mention: (1) light reactions produce ATP and NADPH, (2) Calvin cycle uses them, (3) Calvin cycle uses CO₂ to make glucose.',
  },
  {
    id: 'c204_q4',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'Why does the Calvin cycle stop quickly if you turn off the light, even though it doesn\'t use light directly?',
    rubricHint: 'Mention: (1) it depends on ATP and NADPH, (2) those run out without light, (3) cycle stalls.',
  },
  {
    id: 'c204_q5',
    type: 'FEYNMAN',
    text: 'A friend says: "The Calvin cycle happens at night."\n\nExplain why this is a common misconception.',
    keyConcepts: ['"dark" doesn\'t mean nighttime', 'needs ATP and NADPH', 'usually runs in daylight', 'name is misleading'],
  },
  {
    id: 'c204_q6',
    type: 'BLURT',
    text: 'Calvin cycle (dark reactions)',
  },
];

export const QUESTIONS_c205: Question[] = [
  {
    id: 'c205_q1',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'Which of the following is a limiting factor of photosynthesis?',
    options: [
      { id: 'a', text: 'Oxygen levels', correct: false },
      { id: 'b', text: 'Light intensity', correct: true },
      { id: 'c', text: 'Number of leaves', correct: false },
      { id: 'd', text: 'Time of day only', correct: false },
    ],
    explanation: 'Light, CO₂, and temperature are the three main limiting factors — at low light, photosynthesis slows even if everything else is plenty.',
  },
  {
    id: 'c205_q2',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'A plant has plenty of light and water but very little CO₂ in the air. What happens to photosynthesis?',
    options: [
      { id: 'a', text: 'It speeds up to compensate', correct: false },
      { id: 'b', text: 'CO₂ becomes the limiting factor and photosynthesis slows', correct: true },
      { id: 'c', text: 'It stops because of too much light', correct: false },
      { id: 'd', text: 'Nothing changes', correct: false },
    ],
    explanation: 'Whichever needed ingredient is in shortest supply limits the rate — here, CO₂ is the bottleneck.',
  },
  {
    id: 'c205_q3',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'At very high temperatures, photosynthesis can decrease. Why?',
    options: [
      { id: 'a', text: 'Plants prefer cold', correct: false },
      { id: 'b', text: 'Enzymes that run photosynthesis get damaged (denature)', correct: true },
      { id: 'c', text: 'Light cannot pass through hot air', correct: false },
      { id: 'd', text: 'Plants close at high temperatures only', correct: false },
    ],
    explanation: 'Photosynthesis depends on enzymes, which lose shape and stop working when too hot.',
  },
  {
    id: 'c205_q4',
    type: 'DESCRIPTIVE',
    tier: 'VERY_WEAK',
    text: 'Why does the rate of photosynthesis stop increasing even when light keeps getting brighter?',
    rubricHint: 'Mention: (1) light boosts the rate up to a point, (2) some other factor (CO₂ or temperature) becomes limiting, (3) light is no longer the bottleneck.',
  },
  {
    id: 'c205_q5',
    type: 'DESCRIPTIVE',
    tier: 'VERY_WEAK',
    text: 'A greenhouse farmer pumps extra CO₂ into the greenhouse. Why might this boost crop growth?',
    rubricHint: 'Mention: (1) CO₂ is often the limiting factor, (2) more CO₂ speeds photosynthesis, (3) more glucose = more growth.',
  },
  {
    id: 'c205_q6',
    type: 'FEYNMAN',
    text: 'A friend says: "Plants grow faster the more light you give them, no matter what."\n\nExplain why this is only partly true, using limiting factors.',
    keyConcepts: ['limiting factor', 'light, CO₂, temperature', 'plateau effect', 'bottleneck shifts'],
  },
];

export const QUESTIONS_c206: Question[] = [
  {
    id: 'c206_q1',
    type: 'MCQ',
    text: 'What is a C3 plant?',
    options: [
      { id: 'a', text: 'A plant that grows in 3 climate zones', correct: false },
      { id: 'b', text: 'A plant whose first fixed carbon product is a 3-carbon molecule', correct: true },
      { id: 'c', text: 'A plant with 3 chlorophyll types', correct: false },
      { id: 'd', text: 'A plant that flowers 3 times a year', correct: false },
    ],
    explanation: 'C3 plants make a 3-carbon compound as the first step of fixing CO₂. Rice and wheat are common C3 plants.',
  },
  {
    id: 'c206_q2',
    type: 'MCQ',
    text: 'Why do C4 plants like maize and sugarcane do well in hot, dry climates?',
    options: [
      { id: 'a', text: 'They don\'t need water', correct: false },
      { id: 'b', text: 'They fix CO₂ more efficiently and lose less water', correct: true },
      { id: 'c', text: 'They grow underground', correct: false },
      { id: 'd', text: 'They are smaller than C3 plants', correct: false },
    ],
    explanation: 'C4 plants concentrate CO₂ around the enzymes, so they keep photosynthesising efficiently even when stomata partly close to save water.',
  },
  {
    id: 'c206_q3',
    type: 'MCQ',
    text: 'Which of these is a C4 plant?',
    options: [
      { id: 'a', text: 'Rice', correct: false },
      { id: 'b', text: 'Wheat', correct: false },
      { id: 'c', text: 'Sugarcane', correct: true },
      { id: 'd', text: 'Mustard', correct: false },
    ],
    explanation: 'Sugarcane is a classic C4 plant — adapted to hot, sunny climates.',
  },
  {
    id: 'c206_q4',
    type: 'DESCRIPTIVE',
    text: 'Why might C4 plants gain an advantage if Earth gets hotter and drier?',
    rubricHint: 'Mention: (1) C4 plants conserve water better, (2) they\'re more efficient at high temperatures, (3) C3 plants struggle in heat.',
  },
  {
    id: 'c206_q5',
    type: 'DESCRIPTIVE',
    text: 'How are C3 and C4 plants different in how they handle CO₂?',
    rubricHint: 'Mention: (1) C3 fixes CO₂ directly into a 3-carbon molecule, (2) C4 first makes a 4-carbon helper, (3) C4 concentrates CO₂ where it\'s needed.',
  },
  {
    id: 'c206_q6',
    type: 'FEYNMAN',
    text: 'A friend asks: "Why don\'t all plants just become C4 if it\'s better?"\n\nExplain in plain words.',
    keyConcepts: ['C4 needs more energy', 'C3 wins in cool/moist climates', 'evolution depends on environment', 'trade-offs'],
  },
];

// ─── sci_ch3: Animal Kingdom ───────────────────────────────────────────────

export const QUESTIONS_c301: Question[] = [
  {
    id: 'c301_q1',
    type: 'MCQ',
    text: 'What is the single defining feature that separates vertebrates from invertebrates?',
    options: [
      { id: 'a', text: 'Vertebrates can fly; invertebrates cannot', correct: false },
      { id: 'b', text: 'Vertebrates have a backbone (vertebral column); invertebrates do not', correct: true },
      { id: 'c', text: 'Vertebrates lay eggs; invertebrates give birth', correct: false },
      { id: 'd', text: 'Vertebrates are larger than invertebrates', correct: false },
    ],
    explanation: 'The presence of a backbone made of vertebrae is the defining feature of vertebrates.',
  },
  {
    id: 'c301_q2',
    type: 'DESCRIPTIVE',
    text: 'Roughly how do invertebrates compare to vertebrates in number of species, and why might that be?',
    rubricHint: 'Mention: (1) invertebrates make up ~97% of animal species, (2) huge diversity (insects alone are massive), (3) simpler bodies adapt to many niches.',
  },
  {
    id: 'c301_q3',
    type: 'FEYNMAN',
    text: 'A friend says: "Jellyfish must be vertebrates because they\'re big sea animals."\n\nExplain in simple words why that\'s wrong.',
    keyConcepts: ['size doesn\'t matter', 'backbone is the key', 'jellyfish have no bones', 'invertebrate group'],
  },
  {
    id: 'c301_q4',
    type: 'BLURT',
    text: 'Vertebrates vs invertebrates',
  },
  {
    id: 'c301_q5',
    type: 'ACTIVE_RECALL',
    text: 'You\'re sorting a box of mystery sea creatures. One feels squishy with no hard middle. Another has a clear ridge running down its back.\n\nUsing only this info, classify each as vertebrate or invertebrate and explain why.',
  },
];

export const QUESTIONS_c302: Question[] = [
  {
    id: 'c302_q1',
    type: 'MCQ',
    text: 'Which of these is NOT a defining feature of mammals?',
    options: [
      { id: 'a', text: 'Hair or fur on the body', correct: false },
      { id: 'b', text: 'Mammary glands that produce milk', correct: false },
      { id: 'c', text: 'Laying hard-shelled eggs (in most mammals)', correct: true },
      { id: 'd', text: 'Warm-blooded body temperature', correct: false },
    ],
    explanation: 'Most mammals give live birth and do not lay eggs — though a few (platypus, echidna) are exceptions. Hair, milk glands, and warm blood are universal features.',
  },
  {
    id: 'c302_q2',
    type: 'DESCRIPTIVE',
    text: 'Why are the platypus and echidna considered "unusual" mammals?',
    rubricHint: 'Mention: (1) they are mammals but lay eggs, (2) they still feed milk to their young, (3) called monotremes — a rare group.',
  },
  {
    id: 'c302_q3',
    type: 'FEYNMAN',
    text: 'A classmate says: "Whales are fish because they live in the sea."\n\nExplain why whales are actually mammals.',
    keyConcepts: ['breathes air with lungs', 'gives birth to live young', 'feeds milk', 'warm-blooded'],
  },
  {
    id: 'c302_q4',
    type: 'BLURT',
    text: 'Mammal characteristics',
  },
  {
    id: 'c302_q5',
    type: 'ACTIVE_RECALL',
    text: 'A new animal is discovered. It lives underwater, breathes through gills, lays eggs, and has scales.\n\nWould you classify it as a mammal? Explain using mammal characteristics.',
  },
];

export const QUESTIONS_c303: Question[] = [
  {
    id: 'c303_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Which of these features is shared by ALL birds?',
    options: [
      { id: 'a', text: 'The ability to fly', correct: false },
      { id: 'b', text: 'Feathers', correct: true },
      { id: 'c', text: 'Living in trees', correct: false },
      { id: 'd', text: 'Eating only seeds', correct: false },
    ],
    explanation: 'Feathers are unique to birds. Not all birds fly (penguins, ostriches), so flight isn\'t a universal feature.',
  },
  {
    id: 'c303_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Why are birds\' bones often hollow?',
    options: [
      { id: 'a', text: 'To store extra food', correct: false },
      { id: 'b', text: 'To make their bodies lighter for flight', correct: true },
      { id: 'c', text: 'To carry water inside', correct: false },
      { id: 'd', text: 'Because they are weak', correct: false },
    ],
    explanation: 'Hollow bones reduce weight without losing too much strength, which helps flying birds get airborne.',
  },
  {
    id: 'c303_q3',
    type: 'DESCRIPTIVE',
    text: 'How are penguins still classified as birds even though they cannot fly?',
    rubricHint: 'Mention: (1) they have feathers, (2) they lay eggs, (3) flight is not required to be a bird.',
  },
  {
    id: 'c303_q4',
    type: 'FEYNMAN',
    text: 'A friend insists "bats are birds because they fly."\n\nExplain in plain words why bats are actually mammals.',
    keyConcepts: ['bats have fur not feathers', 'give birth, feed milk', 'birds have feathers', 'flight is not the deciding feature'],
  },
  {
    id: 'c303_q5',
    type: 'BLURT',
    text: 'Bird classification',
  },
  {
    id: 'c303_q6',
    type: 'ACTIVE_RECALL',
    text: 'You see a creature with leathery wings, fur, sharp teeth, and it gives birth to live young.\n\nIs it a bird? Use the features of birds to explain your answer.',
  },
];

export const QUESTIONS_c304: Question[] = [
  {
    id: 'c304_q1',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'Which is true of most reptiles but NOT of most amphibians?',
    options: [
      { id: 'a', text: 'Lays eggs in water', correct: false },
      { id: 'b', text: 'Has dry, scaly skin', correct: true },
      { id: 'c', text: 'Has a tadpole stage', correct: false },
      { id: 'd', text: 'Breathes through moist skin', correct: false },
    ],
    explanation: 'Reptiles have dry, scaly skin and can live in dry places. Amphibians need moist skin and often start as aquatic tadpoles.',
  },
  {
    id: 'c304_q2',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'Why must most amphibians stay near water?',
    options: [
      { id: 'a', text: 'They can\'t see in dry places', correct: false },
      { id: 'b', text: 'Their eggs and young need water and their skin must stay moist', correct: true },
      { id: 'c', text: 'They drink water through their feet', correct: false },
      { id: 'd', text: 'They eat only water plants', correct: false },
    ],
    explanation: 'Amphibian eggs lack shells and dry out; their thin skin must stay moist for gas exchange.',
  },
  {
    id: 'c304_q3',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'How are reptile eggs different from amphibian eggs, and why is that important?',
    rubricHint: 'Mention: (1) reptile eggs have leathery shells, (2) amphibian eggs are jelly-like and need water, (3) shells let reptiles lay eggs on land.',
  },
  {
    id: 'c304_q4',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'Why are frogs considered "in-between" animals between water and land life?',
    rubricHint: 'Mention: (1) tadpole = aquatic, (2) adult = land + water, (3) skin and reproduction still tie them to water.',
  },
  {
    id: 'c304_q5',
    type: 'FEYNMAN',
    text: 'A classmate thinks lizards and frogs are basically the same.\n\nExplain three big differences between reptiles and amphibians.',
    keyConcepts: ['dry vs moist skin', 'eggs with shells vs jelly eggs', 'tadpole stage', 'where they live'],
  },
  {
    id: 'c304_q6',
    type: 'BLURT',
    text: 'Reptiles & amphibians',
  },
];

export const QUESTIONS_c305: Question[] = [
  {
    id: 'c305_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Fish are best adapted to underwater life because they:',
    options: [
      { id: 'a', text: 'Breathe through lungs at the surface', correct: false },
      { id: 'b', text: 'Have gills to take dissolved oxygen from water', correct: true },
      { id: 'c', text: 'Hold their breath for hours', correct: false },
      { id: 'd', text: 'Don\'t need oxygen', correct: false },
    ],
    explanation: 'Gills let fish extract dissolved O₂ directly from the water as it flows over them.',
  },
  {
    id: 'c305_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Why do most fish have a streamlined body shape?',
    options: [
      { id: 'a', text: 'It looks attractive to other fish', correct: false },
      { id: 'b', text: 'It reduces resistance and lets them move through water easily', correct: true },
      { id: 'c', text: 'It helps them stay warm', correct: false },
      { id: 'd', text: 'It hides them from light', correct: false },
    ],
    explanation: 'A streamlined shape cuts through water with less drag, saving energy as they swim.',
  },
  {
    id: 'c305_q3',
    type: 'DESCRIPTIVE',
    text: 'How does a fish use its gills to "breathe" underwater?',
    rubricHint: 'Mention: (1) water flows in through mouth, (2) over gill filaments, (3) O₂ diffuses into blood, (4) water exits through gill covers.',
  },
  {
    id: 'c305_q4',
    type: 'FEYNMAN',
    text: 'Your friend thinks dolphins and sharks are basically the same because both live in the sea.\n\nExplain how they\'re very different animals.',
    keyConcepts: ['dolphin = mammal', 'shark = fish', 'gills vs lungs', 'live birth vs eggs'],
  },
  {
    id: 'c305_q5',
    type: 'BLURT',
    text: 'Fish & aquatic life',
  },
  {
    id: 'c305_q6',
    type: 'ACTIVE_RECALL',
    text: 'A polluted lake has very low dissolved oxygen.\n\nUsing what you know about fish, explain what might happen to the fish there and why.',
  },
];

export const QUESTIONS_c306: Question[] = [
  {
    id: 'c306_q1',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'How many legs does an insect have?',
    options: [
      { id: 'a', text: 'Four', correct: false },
      { id: 'b', text: 'Six', correct: true },
      { id: 'c', text: 'Eight', correct: false },
      { id: 'd', text: 'Ten', correct: false },
    ],
    explanation: 'All insects have exactly 6 legs, attached to the middle body section (thorax).',
  },
  {
    id: 'c306_q2',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'How many legs does a spider (arachnid) have?',
    options: [
      { id: 'a', text: 'Six', correct: false },
      { id: 'b', text: 'Eight', correct: true },
      { id: 'c', text: 'Ten', correct: false },
      { id: 'd', text: 'Twelve', correct: false },
    ],
    explanation: 'Arachnids — spiders, scorpions, ticks — all have 8 legs. This is a key way to tell them from insects.',
  },
  {
    id: 'c306_q3',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'How many body sections does an insect have?',
    options: [
      { id: 'a', text: 'One', correct: false },
      { id: 'b', text: 'Two', correct: false },
      { id: 'c', text: 'Three (head, thorax, abdomen)', correct: true },
      { id: 'd', text: 'Four', correct: false },
    ],
    explanation: 'Insects have three clear body sections: head, thorax, abdomen. Arachnids only have two.',
  },
  {
    id: 'c306_q4',
    type: 'DESCRIPTIVE',
    tier: 'VERY_WEAK',
    text: 'Why are spiders NOT insects, even though many people think they are?',
    rubricHint: 'Mention: (1) spiders have 8 legs, insects have 6, (2) spiders have 2 body parts, insects have 3, (3) spiders are arachnids.',
  },
  {
    id: 'c306_q5',
    type: 'DESCRIPTIVE',
    tier: 'VERY_WEAK',
    text: 'How would you quickly tell a small bug is an insect rather than a spider just by looking?',
    rubricHint: 'Mention: (1) count legs (6 vs 8), (2) check body sections (3 vs 2), (3) look for antennae and wings (insects have these).',
  },
  {
    id: 'c306_q6',
    type: 'FEYNMAN',
    text: 'A friend points to a scorpion and says: "Look — a big insect!"\n\nExplain in simple words why a scorpion isn\'t an insect.',
    keyConcepts: ['8 legs', '2 body parts', 'arachnid family', 'related to spiders'],
  },
];

export const QUESTIONS_c307: Question[] = [
  {
    id: 'c307_q1',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'In a food chain "grass → grasshopper → frog → snake," what is the grass called?',
    options: [
      { id: 'a', text: 'Consumer', correct: false },
      { id: 'b', text: 'Producer', correct: true },
      { id: 'c', text: 'Decomposer', correct: false },
      { id: 'd', text: 'Predator', correct: false },
    ],
    explanation: 'Plants make their own food using sunlight (photosynthesis), so they\'re producers and the base of every food chain.',
  },
  {
    id: 'c307_q2',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'What\'s the difference between a food chain and a food web?',
    options: [
      { id: 'a', text: 'A food chain shows energy flow; a food web is the actual food', correct: false },
      { id: 'b', text: 'A food chain is one simple path; a food web shows many interconnected chains', correct: true },
      { id: 'c', text: 'A food chain happens in forests, a web in oceans', correct: false },
      { id: 'd', text: 'They\'re the same thing', correct: false },
    ],
    explanation: 'A web shows that organisms eat (and are eaten by) many others — chains are just simplified single paths in the web.',
  },
  {
    id: 'c307_q3',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'Why is the Sun the ultimate source of energy for almost every food chain on Earth?',
    rubricHint: 'Mention: (1) plants capture sunlight, (2) animals eat plants or other animals, (3) all energy traces back to the sun.',
  },
  {
    id: 'c307_q4',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'What might happen to a food web if all the frogs disappear?',
    rubricHint: 'Mention: (1) insects (frog food) increase, (2) snakes (frog predators) decline, (3) chain effects ripple out.',
  },
  {
    id: 'c307_q5',
    type: 'FEYNMAN',
    text: 'A friend thinks predators are "bad" and shouldn\'t exist.\n\nExplain why removing predators can actually harm an ecosystem.',
    keyConcepts: ['balance', 'overpopulation of prey', 'damage to plants', 'food web stability'],
  },
  {
    id: 'c307_q6',
    type: 'BLURT',
    text: 'Food chains & webs',
  },
];

export const QUESTIONS_c308: Question[] = [
  {
    id: 'c308_q1',
    type: 'MCQ',
    text: 'What is "adaptation" in biology?',
    options: [
      { id: 'a', text: 'A skill an animal learns in its lifetime', correct: false },
      { id: 'b', text: 'A feature that helps an organism survive in its environment', correct: true },
      { id: 'c', text: 'Moving to a different country', correct: false },
      { id: 'd', text: 'Changing colour at will', correct: false },
    ],
    explanation: 'An adaptation is a body part, behaviour, or trait that\'s evolved over generations to help survival in a specific environment.',
  },
  {
    id: 'c308_q2',
    type: 'MCQ',
    text: 'Why do camels have wide, flat feet?',
    options: [
      { id: 'a', text: 'To run faster', correct: false },
      { id: 'b', text: 'To spread weight on soft desert sand without sinking', correct: true },
      { id: 'c', text: 'To swim better', correct: false },
      { id: 'd', text: 'For digging holes', correct: false },
    ],
    explanation: 'Wide feet spread weight over a bigger area so camels don\'t sink in loose desert sand.',
  },
  {
    id: 'c308_q3',
    type: 'MCQ',
    text: 'A polar bear has thick white fur. This is an adaptation for:',
    options: [
      { id: 'a', text: 'Staying warm and blending into snow', correct: true },
      { id: 'b', text: 'Catching fish in deep water', correct: false },
      { id: 'c', text: 'Climbing tall trees', correct: false },
      { id: 'd', text: 'Eating only plants', correct: false },
    ],
    explanation: 'Thick fur insulates against cold; white colour camouflages the bear in snowy environments.',
  },
  {
    id: 'c308_q4',
    type: 'DESCRIPTIVE',
    text: 'How are a fish\'s body parts adapted for living in water?',
    rubricHint: 'Mention: (1) streamlined body shape, (2) gills for breathing in water, (3) fins for swimming, (4) scales for protection.',
  },
  {
    id: 'c308_q5',
    type: 'DESCRIPTIVE',
    text: 'Why do desert plants like cactus have spines instead of broad leaves?',
    rubricHint: 'Mention: (1) reduces water loss, (2) protects from animals, (3) photosynthesis shifted to stem.',
  },
  {
    id: 'c308_q6',
    type: 'FEYNMAN',
    text: 'A friend thinks an animal can "decide" to adapt in its own lifetime.\n\nExplain in plain words how adaptation really works across generations.',
    keyConcepts: ['traits passed by parents', 'better-adapted animals survive', 'over many generations', 'not chosen by the animal'],
  },
];

export const QUESTIONS_c309: Question[] = [
  {
    id: 'c309_q1',
    type: 'MCQ',
    text: 'What is camouflage?',
    options: [
      { id: 'a', text: 'When animals change shape every season', correct: false },
      { id: 'b', text: 'When animals blend into their surroundings to avoid being seen', correct: true },
      { id: 'c', text: 'When animals make loud sounds to scare enemies', correct: false },
      { id: 'd', text: 'When animals share food', correct: false },
    ],
    explanation: 'Camouflage is colouration or patterning that helps an animal blend into its background — useful for hiding from predators or sneaking up on prey.',
  },
  {
    id: 'c309_q2',
    type: 'MCQ',
    text: 'What is mimicry?',
    options: [
      { id: 'a', text: 'Copying the look or sound of another species for protection or advantage', correct: true },
      { id: 'b', text: 'Hibernating in winter', correct: false },
      { id: 'c', text: 'Migrating in summer', correct: false },
      { id: 'd', text: 'Changing skin colour with mood', correct: false },
    ],
    explanation: 'Mimicry is when one species evolves to look or sound like another — e.g., a harmless fly looking like a wasp.',
  },
  {
    id: 'c309_q3',
    type: 'MCQ',
    text: 'A chameleon changing colour to match a leaf is an example of:',
    options: [
      { id: 'a', text: 'Mimicry', correct: false },
      { id: 'b', text: 'Camouflage', correct: true },
      { id: 'c', text: 'Migration', correct: false },
      { id: 'd', text: 'Hibernation', correct: false },
    ],
    explanation: 'Blending with surroundings = camouflage. Mimicry is copying another species, not just the background.',
  },
  {
    id: 'c309_q4',
    type: 'DESCRIPTIVE',
    text: 'How is camouflage different from mimicry?',
    rubricHint: 'Mention: (1) camouflage = blending into background, (2) mimicry = looking like another organism, (3) both help survival but in different ways.',
  },
  {
    id: 'c309_q5',
    type: 'DESCRIPTIVE',
    text: 'Why might a harmless snake evolve colours similar to a venomous one?',
    rubricHint: 'Mention: (1) predators avoid the venomous pattern, (2) mimicry tricks predators into avoiding it too, (3) survival advantage.',
  },
  {
    id: 'c309_q6',
    type: 'FEYNMAN',
    text: 'Your friend thinks a stick insect "pretends" to be a stick on purpose.\n\nExplain how this is actually camouflage from evolution, not a choice.',
    keyConcepts: ['evolved body shape', 'not a choice', 'predator avoidance', 'survival of camouflaged ancestors'],
  },
];

export const QUESTIONS_c310: Question[] = [
  {
    id: 'c310_q1',
    type: 'MCQ',
    text: 'Why do many birds migrate?',
    options: [
      { id: 'a', text: 'They get bored of one place', correct: false },
      { id: 'b', text: 'To find food and better weather when seasons change', correct: true },
      { id: 'c', text: 'To exercise', correct: false },
      { id: 'd', text: 'To visit other bird families', correct: false },
    ],
    explanation: 'Migration helps birds escape harsh winters and find seasonal food, breeding grounds, or warmer climates.',
  },
  {
    id: 'c310_q2',
    type: 'MCQ',
    text: 'What happens to a bear\'s body during hibernation?',
    options: [
      { id: 'a', text: 'It grows new fur', correct: false },
      { id: 'b', text: 'Its heartbeat, breathing, and body temperature drop sharply to save energy', correct: true },
      { id: 'c', text: 'It travels long distances in its sleep', correct: false },
      { id: 'd', text: 'It eats continuously in its sleep', correct: false },
    ],
    explanation: 'Hibernation slows the body down so the animal needs very little energy through the food-scarce winter.',
  },
  {
    id: 'c310_q3',
    type: 'MCQ',
    text: 'Migration and hibernation both help animals deal with:',
    options: [
      { id: 'a', text: 'Predators only', correct: false },
      { id: 'b', text: 'Seasonal changes in food and climate', correct: true },
      { id: 'c', text: 'Their growth', correct: false },
      { id: 'd', text: 'Sleep cycles', correct: false },
    ],
    explanation: 'Both are survival strategies for surviving tough seasons — animals either move away or slow down.',
  },
  {
    id: 'c310_q4',
    type: 'DESCRIPTIVE',
    text: 'Why don\'t all animals just hibernate instead of migrating?',
    rubricHint: 'Mention: (1) some animals can\'t lower body temp, (2) hibernation works for some species, (3) others need food year-round.',
  },
  {
    id: 'c310_q5',
    type: 'DESCRIPTIVE',
    text: 'How do migrating birds find their way over thousands of kilometres?',
    rubricHint: 'Mention: (1) sun and stars as cues, (2) Earth\'s magnetic field, (3) landmarks, (4) inherited routes.',
  },
  {
    id: 'c310_q6',
    type: 'FEYNMAN',
    text: 'A friend says: "Hibernation is just a really long nap."\n\nExplain how it\'s much more than that.',
    keyConcepts: ['body temp drops drastically', 'heartbeat slows', 'no eating or drinking', 'survival adaptation'],
  },
];

// ─── sci_ch4: Human Body Systems ───────────────────────────────────────────

export const QUESTIONS_c401: Question[] = [
  {
    id: 'c401_q1',
    type: 'MCQ',
    text: 'Approximately how many bones does an adult human skeleton have?',
    options: [
      { id: 'a', text: '120', correct: false },
      { id: 'b', text: '206', correct: true },
      { id: 'c', text: '300', correct: false },
      { id: 'd', text: '500', correct: false },
    ],
    explanation: 'Adults have around 206 bones. Babies are born with more (~300), and some fuse as they grow.',
  },
  {
    id: 'c401_q2',
    type: 'DESCRIPTIVE',
    text: 'How does the skeleton do more than just "hold us up"?',
    rubricHint: 'Mention: (1) support and shape, (2) protects organs (skull, ribs), (3) helps movement with muscles, (4) makes blood cells.',
  },
  {
    id: 'c401_q3',
    type: 'FEYNMAN',
    text: 'A younger cousin thinks bones are dry, dead sticks inside the body.\n\nExplain that bones are actually living tissue.',
    keyConcepts: ['bones are living', 'blood supply', 'can grow and heal', 'make red blood cells'],
  },
  {
    id: 'c401_q4',
    type: 'BLURT',
    text: 'Skeletal system',
  },
  {
    id: 'c401_q5',
    type: 'ACTIVE_RECALL',
    text: 'An astronaut returns from 6 months in space and finds her bones have weakened.\n\nUsing what you know about how bones stay healthy, explain why this happens in low gravity.',
  },
];

export const QUESTIONS_c402: Question[] = [
  {
    id: 'c402_q1',
    type: 'MCQ',
    text: 'Muscles produce movement by:',
    options: [
      { id: 'a', text: 'Pushing bones', correct: false },
      { id: 'b', text: 'Contracting (shortening) to pull bones', correct: true },
      { id: 'c', text: 'Expanding to push joints apart', correct: false },
      { id: 'd', text: 'Releasing air into joints', correct: false },
    ],
    explanation: 'Muscles can only pull, not push — they contract to pull bones at joints, producing movement.',
  },
  {
    id: 'c402_q2',
    type: 'DESCRIPTIVE',
    text: 'Why do muscles work in pairs (like biceps and triceps)?',
    rubricHint: 'Mention: (1) muscles can only pull, not push, (2) one bends the joint, (3) the other straightens it.',
  },
  {
    id: 'c402_q3',
    type: 'FEYNMAN',
    text: 'A friend says muscles "push" the arm up to lift weights.\n\nExplain why muscles actually pull, not push, in plain words.',
    keyConcepts: ['muscles only contract', 'pull bones', 'paired muscles', 'antagonist pairs'],
  },
  {
    id: 'c402_q4',
    type: 'BLURT',
    text: 'Muscular system',
  },
  {
    id: 'c402_q5',
    type: 'ACTIVE_RECALL',
    text: 'Your arm gets stuck in a cast for 6 weeks. When the cast comes off, your arm muscles look smaller.\n\nUsing what you know about muscles, explain why.',
  },
];

export const QUESTIONS_c403: Question[] = [
  {
    id: 'c403_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Where does most chemical digestion of food happen?',
    options: [
      { id: 'a', text: 'Mouth', correct: false },
      { id: 'b', text: 'Stomach and small intestine', correct: true },
      { id: 'c', text: 'Large intestine', correct: false },
      { id: 'd', text: 'Liver', correct: false },
    ],
    explanation: 'The stomach and especially the small intestine break down food chemically using enzymes and bile.',
  },
  {
    id: 'c403_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'What\'s the small intestine\'s main job?',
    options: [
      { id: 'a', text: 'Storing food for later', correct: false },
      { id: 'b', text: 'Absorbing nutrients into the blood', correct: true },
      { id: 'c', text: 'Producing red blood cells', correct: false },
      { id: 'd', text: 'Pumping blood', correct: false },
    ],
    explanation: 'After digestion, the small intestine\'s long folded lining absorbs nutrients into the bloodstream.',
  },
  {
    id: 'c403_q3',
    type: 'DESCRIPTIVE',
    text: 'How do villi in the small intestine help absorb nutrients quickly?',
    rubricHint: 'Mention: (1) tiny finger-like projections, (2) huge surface area, (3) thin walls and blood supply for fast absorption.',
  },
  {
    id: 'c403_q4',
    type: 'FEYNMAN',
    text: 'A friend thinks the stomach is "where all the food is digested."\n\nExplain why the small intestine actually does most of the work.',
    keyConcepts: ['stomach starts digestion', 'enzymes', 'small intestine = main digestion + absorption', 'villi'],
  },
  {
    id: 'c403_q5',
    type: 'BLURT',
    text: 'Digestive system',
  },
  {
    id: 'c403_q6',
    type: 'ACTIVE_RECALL',
    text: 'A patient has part of his small intestine removed due to illness.\n\nUsing what you know about digestion, explain one likely problem he might face afterwards.',
  },
];

export const QUESTIONS_c404: Question[] = [
  {
    id: 'c404_q1',
    type: 'MCQ',
    text: 'Which chamber of the heart pumps oxygenated blood to the whole body?',
    options: [
      { id: 'a', text: 'Right atrium', correct: false },
      { id: 'b', text: 'Right ventricle', correct: false },
      { id: 'c', text: 'Left ventricle', correct: true },
      { id: 'd', text: 'Left atrium', correct: false },
    ],
    explanation: 'The left ventricle has the thickest muscle and pumps blood through the body — that\'s why blood pressure is high.',
  },
  {
    id: 'c404_q2',
    type: 'DESCRIPTIVE',
    text: 'Why is the human heart called a "double pump"?',
    rubricHint: 'Mention: (1) right side pumps blood to lungs, (2) left side pumps to the body, (3) two separate loops happen at the same time.',
  },
  {
    id: 'c404_q3',
    type: 'FEYNMAN',
    text: 'A friend thinks veins carry "dirty" blood and arteries carry "clean" blood — always.\n\nExplain why this is mostly true but has one important exception.',
    keyConcepts: ['arteries usually carry oxygenated', 'veins usually carry deoxygenated', 'pulmonary artery and vein are reversed', 'direction matters more than oxygen content'],
  },
  {
    id: 'c404_q4',
    type: 'BLURT',
    text: 'Circulatory system',
  },
  {
    id: 'c404_q5',
    type: 'ACTIVE_RECALL',
    text: 'A runner\'s heart rate jumps from 70 to 160 beats/min during a sprint.\n\nUsing what you know about the circulatory system, explain why the body needs this and what it does.',
  },
];

export const QUESTIONS_c405: Question[] = [
  {
    id: 'c405_q1',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'Where does gas exchange actually happen in the lungs?',
    options: [
      { id: 'a', text: 'In the trachea', correct: false },
      { id: 'b', text: 'In the alveoli (tiny air sacs)', correct: true },
      { id: 'c', text: 'In the bronchi', correct: false },
      { id: 'd', text: 'In the diaphragm', correct: false },
    ],
    explanation: 'Alveoli are millions of tiny air sacs surrounded by blood vessels — that\'s where O₂ enters blood and CO₂ leaves.',
  },
  {
    id: 'c405_q2',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'What does the diaphragm do when you breathe in?',
    options: [
      { id: 'a', text: 'It relaxes and rises upward', correct: false },
      { id: 'b', text: 'It contracts and flattens, expanding chest space', correct: true },
      { id: 'c', text: 'It pumps blood', correct: false },
      { id: 'd', text: 'It traps food', correct: false },
    ],
    explanation: 'Contraction flattens the diaphragm, making more chest space, which pulls air into the lungs.',
  },
  {
    id: 'c405_q3',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'Why are alveoli shaped like tiny sacs with very thin walls?',
    rubricHint: 'Mention: (1) huge surface area, (2) thin walls = fast diffusion, (3) close contact with blood vessels.',
  },
  {
    id: 'c405_q4',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'How does air get from your nose all the way to the alveoli?',
    rubricHint: 'Mention: (1) nose → trachea, (2) splits into bronchi, (3) branches into bronchioles, (4) ends in alveoli.',
  },
  {
    id: 'c405_q5',
    type: 'FEYNMAN',
    text: 'A friend says: "Lungs suck in air like a vacuum cleaner."\n\nExplain in plain words how breathing actually works — using diaphragm movement, not suction.',
    keyConcepts: ['diaphragm contracts', 'chest expands', 'air pressure drops inside', 'air flows in from higher pressure outside'],
  },
  {
    id: 'c405_q6',
    type: 'BLURT',
    text: 'Respiratory system',
  },
];

export const QUESTIONS_c406: Question[] = [
  {
    id: 'c406_q1',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'What are the two main parts of the central nervous system?',
    options: [
      { id: 'a', text: 'Heart and lungs', correct: false },
      { id: 'b', text: 'Brain and spinal cord', correct: true },
      { id: 'c', text: 'Eyes and ears', correct: false },
      { id: 'd', text: 'Stomach and intestines', correct: false },
    ],
    explanation: 'The central nervous system (CNS) is the brain and the spinal cord — the command centre of the body.',
  },
  {
    id: 'c406_q2',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'What is a neuron?',
    options: [
      { id: 'a', text: 'A muscle cell', correct: false },
      { id: 'b', text: 'A nerve cell that carries signals', correct: true },
      { id: 'c', text: 'A type of bone', correct: false },
      { id: 'd', text: 'A blood cell', correct: false },
    ],
    explanation: 'Neurons are specialised cells that send fast electrical signals — they\'re the building blocks of the nervous system.',
  },
  {
    id: 'c406_q3',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'When you touch a hot pan and pull your hand away instantly, this is called:',
    options: [
      { id: 'a', text: 'A thought', correct: false },
      { id: 'b', text: 'A reflex action', correct: true },
      { id: 'c', text: 'A muscle cramp', correct: false },
      { id: 'd', text: 'A heart beat', correct: false },
    ],
    explanation: 'A reflex is a super-fast automatic response handled by the spinal cord — it doesn\'t wait for the brain.',
  },
  {
    id: 'c406_q4',
    type: 'DESCRIPTIVE',
    tier: 'VERY_WEAK',
    text: 'How is a reflex action different from a normal voluntary action?',
    rubricHint: 'Mention: (1) reflex is automatic, (2) doesn\'t need brain thinking, (3) much faster, (4) usually protective.',
  },
  {
    id: 'c406_q5',
    type: 'DESCRIPTIVE',
    tier: 'VERY_WEAK',
    text: 'What is the job of the brain in the nervous system?',
    rubricHint: 'Mention: (1) controls thinking, memory, senses, (2) processes signals from the body, (3) sends commands to muscles and organs.',
  },
  {
    id: 'c406_q6',
    type: 'FEYNMAN',
    text: 'A friend thinks every action — even pulling your hand off a hot stove — goes through the brain first.\n\nExplain reflex arcs in plain words.',
    keyConcepts: ['reflex skips brain', 'spinal cord handles it', 'speed saves you', 'brain gets the message later'],
  },
];

export const QUESTIONS_c407: Question[] = [
  {
    id: 'c407_q1',
    type: 'MCQ',
    text: 'Which organ filters waste from the blood and makes urine?',
    options: [
      { id: 'a', text: 'Liver', correct: false },
      { id: 'b', text: 'Kidneys', correct: true },
      { id: 'c', text: 'Lungs', correct: false },
      { id: 'd', text: 'Stomach', correct: false },
    ],
    explanation: 'Kidneys filter blood, removing waste and excess water — what\'s left is urine, stored in the bladder.',
  },
  {
    id: 'c407_q2',
    type: 'MCQ',
    text: 'Why is excretion important for the body?',
    options: [
      { id: 'a', text: 'It helps you grow taller', correct: false },
      { id: 'b', text: 'It removes toxic waste that would harm cells', correct: true },
      { id: 'c', text: 'It produces energy', correct: false },
      { id: 'd', text: 'It cools the body', correct: false },
    ],
    explanation: 'Cells produce waste (like urea); if not removed, it builds up and becomes toxic.',
  },
  {
    id: 'c407_q3',
    type: 'MCQ',
    text: 'Urine is stored in which organ before being released?',
    options: [
      { id: 'a', text: 'Kidneys', correct: false },
      { id: 'b', text: 'Bladder', correct: true },
      { id: 'c', text: 'Stomach', correct: false },
      { id: 'd', text: 'Liver', correct: false },
    ],
    explanation: 'The bladder is a stretchy bag that stores urine until it\'s passed out of the body.',
  },
  {
    id: 'c407_q4',
    type: 'DESCRIPTIVE',
    text: 'Why are humans said to have two kidneys when usually one is enough to survive?',
    rubricHint: 'Mention: (1) backup if one fails, (2) shares load and works more efficiently, (3) evolution kept a pair.',
  },
  {
    id: 'c407_q5',
    type: 'DESCRIPTIVE',
    text: 'How is sweating a form of excretion?',
    rubricHint: 'Mention: (1) sweat contains water, salts, urea, (2) skin acts as excretory organ, (3) also helps cool body.',
  },
  {
    id: 'c407_q6',
    type: 'FEYNMAN',
    text: 'A younger cousin thinks "excretion" is just going to the bathroom.\n\nExplain how excretion is a broader process the body does in several ways.',
    keyConcepts: ['kidneys + urine', 'lungs (CO₂)', 'skin (sweat)', 'getting rid of waste, not just water'],
  },
];

export const QUESTIONS_c408: Question[] = [
  {
    id: 'c408_q1',
    type: 'MCQ',
    text: 'What does the endocrine system use to send signals?',
    options: [
      { id: 'a', text: 'Electrical impulses', correct: false },
      { id: 'b', text: 'Hormones in the blood', correct: true },
      { id: 'c', text: 'Sound waves', correct: false },
      { id: 'd', text: 'Air pressure', correct: false },
    ],
    explanation: 'Endocrine glands release hormones into the bloodstream, where they reach distant organs.',
  },
  {
    id: 'c408_q2',
    type: 'MCQ',
    text: 'Which gland is often called the "master gland"?',
    options: [
      { id: 'a', text: 'Thyroid', correct: false },
      { id: 'b', text: 'Pituitary', correct: true },
      { id: 'c', text: 'Adrenal', correct: false },
      { id: 'd', text: 'Pancreas', correct: false },
    ],
    explanation: 'The pituitary, sitting under the brain, controls many other glands — hence "master gland."',
  },
  {
    id: 'c408_q3',
    type: 'MCQ',
    text: 'Which hormone controls blood sugar levels?',
    options: [
      { id: 'a', text: 'Insulin', correct: true },
      { id: 'b', text: 'Adrenaline', correct: false },
      { id: 'c', text: 'Oestrogen', correct: false },
      { id: 'd', text: 'Thyroxine', correct: false },
    ],
    explanation: 'Insulin, made by the pancreas, helps body cells absorb sugar from the blood for energy.',
  },
  {
    id: 'c408_q4',
    type: 'DESCRIPTIVE',
    text: 'How is the endocrine system different from the nervous system in how it sends messages?',
    rubricHint: 'Mention: (1) nervous = fast, electrical, short, (2) endocrine = slower, chemical, longer-lasting, (3) carried by blood.',
  },
  {
    id: 'c408_q5',
    type: 'DESCRIPTIVE',
    text: 'What happens when adrenaline is released during fear or excitement?',
    rubricHint: 'Mention: (1) heart beats faster, (2) breathing speeds up, (3) prepares body for "fight or flight."',
  },
  {
    id: 'c408_q6',
    type: 'FEYNMAN',
    text: 'A friend thinks the nervous system controls everything in the body.\n\nExplain why the endocrine system is also needed.',
    keyConcepts: ['hormones for long-term control', 'growth, sugar, mood', 'works with nerves', 'slower but powerful'],
  },
];

export const QUESTIONS_c409: Question[] = [
  {
    id: 'c409_q1',
    type: 'MCQ',
    text: 'What is the main job of the immune system?',
    options: [
      { id: 'a', text: 'Digest food', correct: false },
      { id: 'b', text: 'Defend the body against germs and infections', correct: true },
      { id: 'c', text: 'Help us see in the dark', correct: false },
      { id: 'd', text: 'Make bones grow', correct: false },
    ],
    explanation: 'The immune system identifies and destroys harmful invaders like bacteria, viruses, and parasites.',
  },
  {
    id: 'c409_q2',
    type: 'MCQ',
    text: 'Which cells in your blood help fight infection?',
    options: [
      { id: 'a', text: 'Red blood cells', correct: false },
      { id: 'b', text: 'White blood cells', correct: true },
      { id: 'c', text: 'Platelets', correct: false },
      { id: 'd', text: 'Nerve cells', correct: false },
    ],
    explanation: 'White blood cells are the body\'s soldiers — they attack germs and remember past infections.',
  },
  {
    id: 'c409_q3',
    type: 'MCQ',
    text: 'How do vaccines help us?',
    options: [
      { id: 'a', text: 'They cure all diseases instantly', correct: false },
      { id: 'b', text: 'They train the immune system to recognise a disease before exposure', correct: true },
      { id: 'c', text: 'They strengthen muscles', correct: false },
      { id: 'd', text: 'They replace blood cells', correct: false },
    ],
    explanation: 'Vaccines show the immune system a harmless version of a germ so it makes "memory" cells ready for the real thing.',
  },
  {
    id: 'c409_q4',
    type: 'DESCRIPTIVE',
    text: 'Why don\'t we usually catch the same illness twice (like chickenpox)?',
    rubricHint: 'Mention: (1) immune system remembers, (2) memory cells respond fast next time, (3) we\'re immune.',
  },
  {
    id: 'c409_q5',
    type: 'DESCRIPTIVE',
    text: 'How does fever actually help fight infection?',
    rubricHint: 'Mention: (1) higher body temperature, (2) slows down germ growth, (3) speeds up immune cells.',
  },
  {
    id: 'c409_q6',
    type: 'FEYNMAN',
    text: 'A friend thinks taking antibiotics will fight any illness, including a cold.\n\nExplain why this is wrong.',
    keyConcepts: ['antibiotics kill bacteria only', 'cold is a virus', 'wrong tool', 'overuse causes resistance'],
  },
];

export const QUESTIONS_c410: Question[] = [
  {
    id: 'c410_q1',
    type: 'MCQ',
    text: 'What fluid flows through the lymphatic system?',
    options: [
      { id: 'a', text: 'Blood', correct: false },
      { id: 'b', text: 'Lymph (a clear fluid with white blood cells)', correct: true },
      { id: 'c', text: 'Urine', correct: false },
      { id: 'd', text: 'Bile', correct: false },
    ],
    explanation: 'Lymph is a clear fluid that carries white blood cells and drains excess fluid from tissues back into the bloodstream.',
  },
  {
    id: 'c410_q2',
    type: 'MCQ',
    text: 'What are lymph nodes?',
    options: [
      { id: 'a', text: 'Tiny brains in your body', correct: false },
      { id: 'b', text: 'Small bean-shaped filters where white blood cells fight germs', correct: true },
      { id: 'c', text: 'Pumps for blood', correct: false },
      { id: 'd', text: 'Sweat glands', correct: false },
    ],
    explanation: 'Lymph nodes filter lymph fluid and house immune cells. They swell when fighting infection — that\'s when you "feel a lump in the neck."',
  },
  {
    id: 'c410_q3',
    type: 'MCQ',
    text: 'How is the lymphatic system different from the circulatory system?',
    options: [
      { id: 'a', text: 'It carries oxygen instead of blood', correct: false },
      { id: 'b', text: 'It has no central pump — muscle movement pushes lymph along', correct: true },
      { id: 'c', text: 'It is faster than blood', correct: false },
      { id: 'd', text: 'It only works at night', correct: false },
    ],
    explanation: 'Unlike blood (pumped by the heart), lymph moves slowly using body muscle movement and one-way valves.',
  },
  {
    id: 'c410_q4',
    type: 'DESCRIPTIVE',
    text: 'Why do lymph nodes swell when you have an infection?',
    rubricHint: 'Mention: (1) white blood cells multiply, (2) nodes fight germs there, (3) swelling = active immune response.',
  },
  {
    id: 'c410_q5',
    type: 'DESCRIPTIVE',
    text: 'How does the lymphatic system help the immune system?',
    rubricHint: 'Mention: (1) carries white blood cells around, (2) nodes filter germs, (3) drains tissue fluid for inspection.',
  },
  {
    id: 'c410_q6',
    type: 'FEYNMAN',
    text: 'A friend has never heard of "lymph" before and asks: "Is it like another kind of blood?"\n\nExplain in plain words what lymph is and why it matters.',
    keyConcepts: ['clear body fluid', 'white blood cells inside', 'drains tissues', 'fights infection', 'no pump — uses muscle movement'],
  },
];

export const QUESTIONS_c411: Question[] = [
  {
    id: 'c411_q1',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'How many senses do humans traditionally have?',
    options: [
      { id: 'a', text: 'Three', correct: false },
      { id: 'b', text: 'Five', correct: true },
      { id: 'c', text: 'Eight', correct: false },
      { id: 'd', text: 'Ten', correct: false },
    ],
    explanation: 'The five classical senses are sight, hearing, smell, taste, and touch — though scientists today recognise more (like balance).',
  },
  {
    id: 'c411_q2',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'Which part of the eye lets light in?',
    options: [
      { id: 'a', text: 'Retina', correct: false },
      { id: 'b', text: 'Pupil', correct: true },
      { id: 'c', text: 'Iris', correct: false },
      { id: 'd', text: 'Eyelid', correct: false },
    ],
    explanation: 'The pupil is the dark hole in the centre of the eye — its size changes to control how much light enters.',
  },
  {
    id: 'c411_q3',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'Which part of the ear actually senses sound?',
    options: [
      { id: 'a', text: 'Ear drum', correct: false },
      { id: 'b', text: 'Cochlea (inner ear)', correct: true },
      { id: 'c', text: 'Outer ear', correct: false },
      { id: 'd', text: 'Ear canal', correct: false },
    ],
    explanation: 'The cochlea, a snail-shaped part deep in the ear, turns sound vibrations into nerve signals for the brain.',
  },
  {
    id: 'c411_q4',
    type: 'DESCRIPTIVE',
    tier: 'VERY_WEAK',
    text: 'Why is taste closely connected to smell?',
    rubricHint: 'Mention: (1) flavour comes from both tongue and nose, (2) blocked nose dulls taste, (3) tongue alone senses only basic tastes.',
  },
  {
    id: 'c411_q5',
    type: 'DESCRIPTIVE',
    tier: 'VERY_WEAK',
    text: 'How does the skin help us sense the world?',
    rubricHint: 'Mention: (1) touch receptors, (2) feels pressure, temperature, pain, (3) protective signals.',
  },
  {
    id: 'c411_q6',
    type: 'FEYNMAN',
    text: 'A friend asks: "When you have a cold, why does food taste so boring?"\n\nExplain using what you know about senses.',
    keyConcepts: ['smell + taste = flavour', 'blocked nose = no smell', 'tongue alone gives basic tastes', 'brain combines them'],
  },
];

export const QUESTIONS_c412: Question[] = [
  {
    id: 'c412_q1',
    type: 'MCQ',
    text: 'The job of the reproductive system is to:',
    options: [
      { id: 'a', text: 'Pump blood', correct: false },
      { id: 'b', text: 'Make new life and continue the species', correct: true },
      { id: 'c', text: 'Digest food', correct: false },
      { id: 'd', text: 'Send nerve signals', correct: false },
    ],
    explanation: 'Reproduction produces new individuals so the species continues from generation to generation.',
  },
  {
    id: 'c412_q2',
    type: 'MCQ',
    text: 'What is the female reproductive cell called?',
    options: [
      { id: 'a', text: 'Sperm', correct: false },
      { id: 'b', text: 'Egg (ovum)', correct: true },
      { id: 'c', text: 'Neuron', correct: false },
      { id: 'd', text: 'Hormone', correct: false },
    ],
    explanation: 'The female reproductive cell is the egg, or ovum, produced in the ovaries.',
  },
  {
    id: 'c412_q3',
    type: 'MCQ',
    text: 'Where does a baby grow before birth?',
    options: [
      { id: 'a', text: 'Stomach', correct: false },
      { id: 'b', text: 'Uterus (womb)', correct: true },
      { id: 'c', text: 'Kidney', correct: false },
      { id: 'd', text: 'Heart', correct: false },
    ],
    explanation: 'A developing baby grows in the uterus, a muscular organ designed to protect and nourish it.',
  },
  {
    id: 'c412_q4',
    type: 'DESCRIPTIVE',
    text: 'Why is reproduction important for any living species, even if individuals can live a long time?',
    rubricHint: 'Mention: (1) individuals eventually die, (2) without reproduction species would go extinct, (3) allows traits to pass on.',
  },
  {
    id: 'c412_q5',
    type: 'DESCRIPTIVE',
    text: 'How are body changes during puberty linked to the reproductive system?',
    rubricHint: 'Mention: (1) hormones trigger changes, (2) reproductive organs mature, (3) body prepares for future reproduction.',
  },
  {
    id: 'c412_q6',
    type: 'FEYNMAN',
    text: 'A younger cousin asks where babies come from.\n\nExplain in simple, factual words using the basics of the reproductive system.',
    keyConcepts: ['egg + sperm', 'fertilisation', 'grows in uterus', 'about 9 months'],
  },
];

// ─── sci_ch5: Forces & Motion ──────────────────────────────────────────────

export const QUESTIONS_c501: Question[] = [
  {
    id: 'c501_q1',
    type: 'MCQ',
    text: 'A ball rolls along a smooth, level table at constant speed. According to Newton\'s 1st Law:',
    options: [
      { id: 'a', text: 'The ball must slow down naturally', correct: false },
      { id: 'b', text: 'The ball will keep rolling at the same speed unless a force acts on it', correct: true },
      { id: 'c', text: 'The ball needs constant force to keep moving', correct: false },
      { id: 'd', text: 'The ball will speed up over time', correct: false },
    ],
    explanation: 'Newton\'s 1st Law: an object in motion stays in motion at constant velocity unless an unbalanced force acts on it.',
  },
  {
    id: 'c501_q2',
    type: 'DESCRIPTIVE',
    text: 'Why does Newton\'s 1st Law often seem wrong in everyday life?',
    rubricHint: 'Mention: (1) friction and air resistance always act, (2) they slow moving things, (3) law is exact in absence of forces.',
  },
  {
    id: 'c501_q3',
    type: 'FEYNMAN',
    text: 'A friend says: "Things only keep moving if you keep pushing them."\n\nExplain why Newton would disagree.',
    keyConcepts: ['inertia', 'no force needed to maintain motion', 'friction stops things, not nature', 'space example'],
  },
  {
    id: 'c501_q4',
    type: 'BLURT',
    text: 'Newton\'s 1st Law',
  },
  {
    id: 'c501_q5',
    type: 'ACTIVE_RECALL',
    text: 'A bus suddenly brakes and passengers lurch forward.\n\nUsing Newton\'s 1st Law, explain exactly why this happens.',
  },
];

export const QUESTIONS_c502: Question[] = [
  {
    id: 'c502_q1',
    type: 'MCQ',
    text: 'Newton\'s 2nd Law (F = ma) tells us that:',
    options: [
      { id: 'a', text: 'Heavier objects always fall faster', correct: false },
      { id: 'b', text: 'For the same force, lighter objects accelerate more than heavier ones', correct: true },
      { id: 'c', text: 'Force and motion have no relationship', correct: false },
      { id: 'd', text: 'Acceleration only happens when objects move', correct: false },
    ],
    explanation: 'Acceleration = force ÷ mass. Same push on a lighter object gives more acceleration.',
  },
  {
    id: 'c502_q2',
    type: 'DESCRIPTIVE',
    text: 'Why is it harder to push a fully loaded shopping cart than an empty one?',
    rubricHint: 'Mention: (1) more mass, (2) needs more force for same acceleration, (3) F = ma.',
  },
  {
    id: 'c502_q3',
    type: 'FEYNMAN',
    text: 'A friend thinks acceleration is the same as speed.\n\nExplain how Newton\'s 2nd Law makes the difference clear.',
    keyConcepts: ['acceleration = change in speed', 'caused by force', 'depends on mass', 'F = ma'],
  },
  {
    id: 'c502_q4',
    type: 'BLURT',
    text: 'Newton\'s 2nd Law',
  },
  {
    id: 'c502_q5',
    type: 'ACTIVE_RECALL',
    text: 'A toy car and a real car are pushed with the same force.\n\nUsing Newton\'s 2nd Law, predict which speeds up faster and explain why.',
  },
];

export const QUESTIONS_c503: Question[] = [
  {
    id: 'c503_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Newton\'s 3rd Law is best summed up as:',
    options: [
      { id: 'a', text: 'Bigger objects always win', correct: false },
      { id: 'b', text: 'For every action, there is an equal and opposite reaction', correct: true },
      { id: 'c', text: 'Forces only act on moving objects', correct: false },
      { id: 'd', text: 'Heavier objects fall faster', correct: false },
    ],
    explanation: 'Whenever object A pushes object B, B pushes A back equally hard in the opposite direction.',
  },
  {
    id: 'c503_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'When you jump, you push the Earth down. Why doesn\'t Earth visibly move?',
    options: [
      { id: 'a', text: 'Earth ignores small forces', correct: false },
      { id: 'b', text: 'Earth is so massive that the resulting acceleration is tiny', correct: true },
      { id: 'c', text: 'Reaction only applies to humans', correct: false },
      { id: 'd', text: 'There is no reaction', correct: false },
    ],
    explanation: 'The force on Earth is equal, but its acceleration = force ÷ mass — and Earth\'s mass is enormous.',
  },
  {
    id: 'c503_q3',
    type: 'DESCRIPTIVE',
    text: 'How does a rocket launch use Newton\'s 3rd Law?',
    rubricHint: 'Mention: (1) hot gases pushed downward, (2) equal opposite reaction pushes rocket up, (3) thrust.',
  },
  {
    id: 'c503_q4',
    type: 'FEYNMAN',
    text: 'A friend says: "If forces are equal and opposite, they should cancel out and nothing should move."\n\nExplain why this is wrong.',
    keyConcepts: ['act on different objects', 'cancel only on same object', 'reaction pair', 'both objects move'],
  },
  {
    id: 'c503_q5',
    type: 'BLURT',
    text: 'Newton\'s 3rd Law',
  },
  {
    id: 'c503_q6',
    type: 'ACTIVE_RECALL',
    text: 'An ice skater pushes against a wall and glides backward.\n\nUsing Newton\'s 3rd Law, explain what really pushed the skater.',
  },
];

export const QUESTIONS_c504: Question[] = [
  {
    id: 'c504_q1',
    type: 'MCQ',
    text: 'Friction is best described as a force that:',
    options: [
      { id: 'a', text: 'Helps objects move faster', correct: false },
      { id: 'b', text: 'Opposes the motion between two surfaces in contact', correct: true },
      { id: 'c', text: 'Pulls things downward', correct: false },
      { id: 'd', text: 'Has no direction', correct: false },
    ],
    explanation: 'Friction always acts in the direction opposite to the relative motion of two touching surfaces.',
  },
  {
    id: 'c504_q2',
    type: 'DESCRIPTIVE',
    text: 'Why does friction generate heat?',
    rubricHint: 'Mention: (1) tiny bumps on surfaces rub, (2) movement against friction does work, (3) energy turns into heat.',
  },
  {
    id: 'c504_q3',
    type: 'FEYNMAN',
    text: 'A friend complains: "Friction is the worst — it slows things down."\n\nExplain why friction is also essential.',
    keyConcepts: ['walking needs friction', 'brakes need friction', 'no friction = slipping everywhere', 'trade-off'],
  },
  {
    id: 'c504_q4',
    type: 'BLURT',
    text: 'Friction',
  },
  {
    id: 'c504_q5',
    type: 'ACTIVE_RECALL',
    text: 'A frozen pond is so slippery that someone falls just trying to walk on it.\n\nUsing what you know about friction, explain why walking is so hard there.',
  },
];

export const QUESTIONS_c505: Question[] = [
  {
    id: 'c505_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'What\'s the difference between mass and weight?',
    options: [
      { id: 'a', text: 'They\'re the same thing', correct: false },
      { id: 'b', text: 'Mass is the amount of matter; weight is the force of gravity on it', correct: true },
      { id: 'c', text: 'Weight is in grams; mass is in newtons', correct: false },
      { id: 'd', text: 'Mass changes with gravity, weight doesn\'t', correct: false },
    ],
    explanation: 'Mass stays the same anywhere. Weight = mass × gravity, so weight changes on the Moon, Earth, or Mars.',
  },
  {
    id: 'c505_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Why do you weigh less on the Moon than on Earth?',
    options: [
      { id: 'a', text: 'Your mass shrinks', correct: false },
      { id: 'b', text: 'The Moon\'s gravity is weaker', correct: true },
      { id: 'c', text: 'Gravity doesn\'t exist on the Moon', correct: false },
      { id: 'd', text: 'You float in space', correct: false },
    ],
    explanation: 'Mass stays the same — but gravity on the Moon is ~1/6 of Earth\'s, so weight (= mg) is much less.',
  },
  {
    id: 'c505_q3',
    type: 'DESCRIPTIVE',
    text: 'Why do all objects fall at the same rate in a vacuum, regardless of weight?',
    rubricHint: 'Mention: (1) gravity gives same acceleration, (2) air resistance removed in vacuum, (3) feather and hammer fall together.',
  },
  {
    id: 'c505_q4',
    type: 'FEYNMAN',
    text: 'A friend says: "Of course a brick falls faster than a feather — it\'s heavier."\n\nExplain when this is true and when it isn\'t.',
    keyConcepts: ['air resistance is the real difference', 'in vacuum both fall same', 'weight ≠ falling speed in vacuum', 'gravity gives same acceleration'],
  },
  {
    id: 'c505_q5',
    type: 'BLURT',
    text: 'Gravity & weight',
  },
  {
    id: 'c505_q6',
    type: 'ACTIVE_RECALL',
    text: 'An astronaut on Mars notices objects feel lighter but seem to fall at the same rate as before.\n\nExplain using gravity and mass.',
  },
];

export const QUESTIONS_c506: Question[] = [
  {
    id: 'c506_q1',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'In physics, "work" is done when:',
    options: [
      { id: 'a', text: 'You think hard about something', correct: false },
      { id: 'b', text: 'A force moves an object through a distance', correct: true },
      { id: 'c', text: 'You sit and study', correct: false },
      { id: 'd', text: 'A force is applied without movement', correct: false },
    ],
    explanation: 'Work = force × distance moved in the direction of the force. Holding something still = no work done in physics.',
  },
  {
    id: 'c506_q2',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'Power measures:',
    options: [
      { id: 'a', text: 'Total work done', correct: false },
      { id: 'b', text: 'How fast work is done (work per second)', correct: true },
      { id: 'c', text: 'How heavy an object is', correct: false },
      { id: 'd', text: 'How tall something is', correct: false },
    ],
    explanation: 'Power = work ÷ time. A more powerful machine does the same work in less time.',
  },
  {
    id: 'c506_q3',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'Why is holding a heavy bag still NOT considered "work" in physics?',
    rubricHint: 'Mention: (1) force is applied, (2) no movement / distance, (3) work = force × distance = 0.',
  },
  {
    id: 'c506_q4',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'How are work, energy, and power connected?',
    rubricHint: 'Mention: (1) energy = ability to do work, (2) work transfers energy, (3) power = rate of energy transfer.',
  },
  {
    id: 'c506_q5',
    type: 'FEYNMAN',
    text: 'A friend says: "I did so much work today studying."\n\nExplain how this differs from "work" in physics.',
    keyConcepts: ['work = force × distance', 'no distance, no work', 'effort ≠ physics work', 'everyday language is different'],
  },
  {
    id: 'c506_q6',
    type: 'BLURT',
    text: 'Work, energy & power',
  },
];

export const QUESTIONS_c507: Question[] = [
  {
    id: 'c507_q1',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'What is a simple machine?',
    options: [
      { id: 'a', text: 'A complicated electronic device', correct: false },
      { id: 'b', text: 'A basic device that makes work easier (like a lever or pulley)', correct: true },
      { id: 'c', text: 'A robot', correct: false },
      { id: 'd', text: 'A car engine', correct: false },
    ],
    explanation: 'Simple machines are basic tools like levers, pulleys, wheels, inclined planes — they change the size or direction of force.',
  },
  {
    id: 'c507_q2',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'A see-saw is an example of which simple machine?',
    options: [
      { id: 'a', text: 'Pulley', correct: false },
      { id: 'b', text: 'Lever', correct: true },
      { id: 'c', text: 'Wedge', correct: false },
      { id: 'd', text: 'Screw', correct: false },
    ],
    explanation: 'A see-saw is a lever — a rigid bar that turns around a fixed pivot (fulcrum).',
  },
  {
    id: 'c507_q3',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'Climbing a ramp instead of stairs makes work easier because:',
    options: [
      { id: 'a', text: 'You do less total work', correct: false },
      { id: 'b', text: 'You use less force over a longer distance', correct: true },
      { id: 'c', text: 'There\'s no friction', correct: false },
      { id: 'd', text: 'Gravity disappears', correct: false },
    ],
    explanation: 'A ramp (inclined plane) trades force for distance — same total work, but easier per step.',
  },
  {
    id: 'c507_q4',
    type: 'DESCRIPTIVE',
    tier: 'VERY_WEAK',
    text: 'Why do simple machines NOT save total work, but still make life easier?',
    rubricHint: 'Mention: (1) total work stays same, (2) but force needed is less, (3) trade-off with distance or direction.',
  },
  {
    id: 'c507_q5',
    type: 'DESCRIPTIVE',
    tier: 'VERY_WEAK',
    text: 'How does a pulley help lift a heavy load?',
    rubricHint: 'Mention: (1) changes direction of force, (2) with multiple pulleys reduces force needed, (3) longer rope distance.',
  },
  {
    id: 'c507_q6',
    type: 'FEYNMAN',
    text: 'A friend thinks simple machines "magically reduce work."\n\nExplain in plain words how they really work.',
    keyConcepts: ['no magic', 'trade force for distance', 'total work unchanged', 'easier on the user'],
  },
];

// ─── sci_ch6: Matter & Materials ───────────────────────────────────────────

export const QUESTIONS_c601: Question[] = [
  {
    id: 'c601_q1',
    type: 'MCQ',
    text: 'What are the three common states of matter?',
    options: [
      { id: 'a', text: 'Hot, cold, warm', correct: false },
      { id: 'b', text: 'Solid, liquid, gas', correct: true },
      { id: 'c', text: 'Heavy, light, medium', correct: false },
      { id: 'd', text: 'Big, small, tiny', correct: false },
    ],
    explanation: 'Matter is commonly found as solid, liquid, or gas. Plasma is a fourth state, but rarer in everyday life.',
  },
  {
    id: 'c601_q2',
    type: 'MCQ',
    text: 'In which state are particles arranged most tightly and orderly?',
    options: [
      { id: 'a', text: 'Solid', correct: true },
      { id: 'b', text: 'Liquid', correct: false },
      { id: 'c', text: 'Gas', correct: false },
      { id: 'd', text: 'All the same', correct: false },
    ],
    explanation: 'In solids, particles are packed tightly in fixed positions and only vibrate — that\'s why solids hold their shape.',
  },
  {
    id: 'c601_q3',
    type: 'MCQ',
    text: 'What happens to a liquid when it gains lots of heat?',
    options: [
      { id: 'a', text: 'It freezes', correct: false },
      { id: 'b', text: 'It evaporates into a gas', correct: true },
      { id: 'c', text: 'It becomes a solid', correct: false },
      { id: 'd', text: 'Nothing changes', correct: false },
    ],
    explanation: 'Heating gives particles enough energy to escape the liquid and spread out as a gas — this is evaporation/boiling.',
  },
  {
    id: 'c601_q4',
    type: 'DESCRIPTIVE',
    text: 'Why does a gas spread to fill any container, but a solid keeps its shape?',
    rubricHint: 'Mention: (1) gas particles are far apart and move freely, (2) solid particles are tightly packed in fixed positions, (3) energy differences.',
  },
  {
    id: 'c601_q5',
    type: 'DESCRIPTIVE',
    text: 'How can water exist as solid, liquid, AND gas all in the same kitchen?',
    rubricHint: 'Mention: (1) ice in freezer = solid, (2) water in glass = liquid, (3) steam from kettle = gas.',
  },
  {
    id: 'c601_q6',
    type: 'FEYNMAN',
    text: 'A younger student wonders: "If steam is invisible water, where does it go?"\n\nExplain in plain words how it stays as matter even when you can\'t see it.',
    keyConcepts: ['gas particles spread out', 'still there, just invisible', 'condenses back into water', 'matter is conserved'],
  },
];

export const QUESTIONS_c602: Question[] = [
  {
    id: 'c602_q1',
    type: 'MCQ',
    text: 'A physical property is one that:',
    options: [
      { id: 'a', text: 'Changes the substance into a new one', correct: false },
      { id: 'b', text: 'Can be observed or measured without changing what the substance is', correct: true },
      { id: 'c', text: 'Only describes living things', correct: false },
      { id: 'd', text: 'Requires fire to test', correct: false },
    ],
    explanation: 'Physical properties (colour, density, melting point) describe the substance as it is — testing them doesn\'t turn it into something new.',
  },
  {
    id: 'c602_q2',
    type: 'MCQ',
    text: 'Which of these is a physical property of iron?',
    options: [
      { id: 'a', text: 'It rusts in moist air', correct: false },
      { id: 'b', text: 'It is shiny and conducts electricity', correct: true },
      { id: 'c', text: 'It burns in pure oxygen', correct: false },
      { id: 'd', text: 'It reacts with acid', correct: false },
    ],
    explanation: 'Shininess and electrical conductivity are physical properties — they don\'t change iron into anything else. Rusting and burning are chemical changes.',
  },
  {
    id: 'c602_q3',
    type: 'MCQ',
    text: 'Density is best described as:',
    options: [
      { id: 'a', text: 'How sticky something is', correct: false },
      { id: 'b', text: 'How much mass is packed into a given volume', correct: true },
      { id: 'c', text: 'How tall something is', correct: false },
      { id: 'd', text: 'How hot something is', correct: false },
    ],
    explanation: 'Density = mass ÷ volume. A small dense object can weigh more than a much larger but less dense one.',
  },
  {
    id: 'c602_q4',
    type: 'DESCRIPTIVE',
    text: 'Why does ice float on water even though they\'re the same substance?',
    rubricHint: 'Mention: (1) ice is less dense than water, (2) less dense = floats, (3) unusual property of water.',
  },
  {
    id: 'c602_q5',
    type: 'DESCRIPTIVE',
    text: 'How would you use physical properties to identify an unknown shiny metal?',
    rubricHint: 'Mention: (1) measure density, (2) check conductivity, (3) check melting point, (4) compare with known metals.',
  },
  {
    id: 'c602_q6',
    type: 'FEYNMAN',
    text: 'A friend thinks measuring something with a ruler "changes it."\n\nExplain why ruler measurements test physical properties without changing the object.',
    keyConcepts: ['physical = no new substance', 'observation only', 'length, mass, density', 'object stays the same'],
  },
];

export const QUESTIONS_c603: Question[] = [
  {
    id: 'c603_q1',
    type: 'MCQ',
    text: 'A chemical property describes how a substance:',
    options: [
      { id: 'a', text: 'Looks and feels', correct: false },
      { id: 'b', text: 'Reacts to form new substances', correct: true },
      { id: 'c', text: 'Weighs and measures', correct: false },
      { id: 'd', text: 'Moves through air', correct: false },
    ],
    explanation: 'Chemical properties describe what new substances form during a reaction — like rusting, burning, or reacting with acid.',
  },
  {
    id: 'c603_q2',
    type: 'MCQ',
    text: 'Which of these is a chemical property?',
    options: [
      { id: 'a', text: 'Iron is shiny', correct: false },
      { id: 'b', text: 'Wood burns to form ash and gases', correct: true },
      { id: 'c', text: 'Water boils at 100°C', correct: false },
      { id: 'd', text: 'Gold is yellow', correct: false },
    ],
    explanation: 'Burning wood makes entirely new substances (ash, CO₂, water vapour). This is a chemical change, so flammability is a chemical property.',
  },
  {
    id: 'c603_q3',
    type: 'MCQ',
    text: 'A clear sign that a chemical change has happened is:',
    options: [
      { id: 'a', text: 'A new colour, gas, or smell appears', correct: true },
      { id: 'b', text: 'The substance only changes shape', correct: false },
      { id: 'c', text: 'It gets bigger', correct: false },
      { id: 'd', text: 'It becomes warmer (always)', correct: false },
    ],
    explanation: 'New colours, gases, smells, or precipitates are clues that something new has formed — a chemical change.',
  },
  {
    id: 'c603_q4',
    type: 'DESCRIPTIVE',
    text: 'How can you tell a chemical change apart from a physical change?',
    rubricHint: 'Mention: (1) chemical makes new substances, (2) physical doesn\'t, (3) clues — colour, gas, heat, irreversible.',
  },
  {
    id: 'c603_q5',
    type: 'DESCRIPTIVE',
    text: 'Why is rusting called a chemical change rather than a physical one?',
    rubricHint: 'Mention: (1) iron + oxygen + water → rust, (2) new substance formed, (3) can\'t easily reverse.',
  },
  {
    id: 'c603_q6',
    type: 'FEYNMAN',
    text: 'A friend says cutting paper is a chemical change "because it changes the paper."\n\nExplain why it\'s actually a physical change.',
    keyConcepts: ['no new substance', 'still paper', 'physical change', 'no chemical reaction'],
  },
];

export const QUESTIONS_c604: Question[] = [
  {
    id: 'c604_q1',
    type: 'MCQ',
    text: 'A mixture is:',
    options: [
      { id: 'a', text: 'Always a new chemical substance', correct: false },
      { id: 'b', text: 'Two or more substances mixed but not chemically combined', correct: true },
      { id: 'c', text: 'A single pure substance', correct: false },
      { id: 'd', text: 'Always a liquid', correct: false },
    ],
    explanation: 'Mixtures keep the original substances\' properties — they\'re physically combined, not chemically bonded.',
  },
  {
    id: 'c604_q2',
    type: 'MCQ',
    text: 'A solution is:',
    options: [
      { id: 'a', text: 'A homogeneous (uniform) mixture where one substance dissolves in another', correct: true },
      { id: 'b', text: 'A mixture you can see all the parts of', correct: false },
      { id: 'c', text: 'Only a mixture of two liquids', correct: false },
      { id: 'd', text: 'A pure substance', correct: false },
    ],
    explanation: 'In a solution, the solute fully dissolves into the solvent and you can\'t see separate parts — like salt in water.',
  },
  {
    id: 'c604_q3',
    type: 'MCQ',
    text: 'How can you separate salt from salt water?',
    options: [
      { id: 'a', text: 'Filter it through paper', correct: false },
      { id: 'b', text: 'Evaporate the water away', correct: true },
      { id: 'c', text: 'Use a magnet', correct: false },
      { id: 'd', text: 'Freeze it', correct: false },
    ],
    explanation: 'Salt is dissolved (not solid pieces), so filters can\'t catch it. Evaporating the water leaves salt behind.',
  },
  {
    id: 'c604_q4',
    type: 'DESCRIPTIVE',
    text: 'Why can you separate the parts of a mixture by physical methods, but not those of a compound?',
    rubricHint: 'Mention: (1) mixtures are just physically together, (2) compounds are chemically bonded, (3) different separation needs.',
  },
  {
    id: 'c604_q5',
    type: 'DESCRIPTIVE',
    text: 'How would you separate sand and salt from a sand-salt mixture?',
    rubricHint: 'Mention: (1) dissolve salt in water, (2) filter out sand, (3) evaporate water to recover salt.',
  },
  {
    id: 'c604_q6',
    type: 'FEYNMAN',
    text: 'A friend mixes sugar in tea and asks: "Did sugar disappear?"\n\nExplain what really happens to sugar in a solution.',
    keyConcepts: ['sugar still there', 'broken into tiny particles', 'spread evenly', 'can taste it, evaporate to recover'],
  },
];

export const QUESTIONS_c605: Question[] = [
  {
    id: 'c605_q1',
    type: 'MCQ',
    text: 'An element is:',
    options: [
      { id: 'a', text: 'Any pure substance', correct: false },
      { id: 'b', text: 'A substance made of only one kind of atom', correct: true },
      { id: 'c', text: 'A mixture of liquids', correct: false },
      { id: 'd', text: 'A compound', correct: false },
    ],
    explanation: 'Elements are pure substances of one atom type — like oxygen (O), iron (Fe), or gold (Au). They\'re building blocks.',
  },
  {
    id: 'c605_q2',
    type: 'MCQ',
    text: 'A compound is:',
    options: [
      { id: 'a', text: 'A single element', correct: false },
      { id: 'b', text: 'A pure substance made of two or more elements chemically combined', correct: true },
      { id: 'c', text: 'Just a mixture', correct: false },
      { id: 'd', text: 'Any liquid', correct: false },
    ],
    explanation: 'In a compound (like water H₂O or salt NaCl), elements are bonded chemically in fixed proportions.',
  },
  {
    id: 'c605_q3',
    type: 'MCQ',
    text: 'Which is a compound?',
    options: [
      { id: 'a', text: 'Oxygen (O₂)', correct: false },
      { id: 'b', text: 'Water (H₂O)', correct: true },
      { id: 'c', text: 'Gold (Au)', correct: false },
      { id: 'd', text: 'Iron (Fe)', correct: false },
    ],
    explanation: 'Water is two hydrogen atoms bonded to one oxygen atom — a compound. The others are elements.',
  },
  {
    id: 'c605_q4',
    type: 'DESCRIPTIVE',
    text: 'How is a compound different from a mixture, even when both have more than one substance?',
    rubricHint: 'Mention: (1) compound = chemically bonded, fixed ratio, (2) mixture = just mixed, any ratio, (3) compounds need chemistry to break apart.',
  },
  {
    id: 'c605_q5',
    type: 'DESCRIPTIVE',
    text: 'How do hydrogen and oxygen (two gases) form water (a liquid)?',
    rubricHint: 'Mention: (1) chemical reaction, (2) new bonds form, (3) new compound has new properties.',
  },
  {
    id: 'c605_q6',
    type: 'FEYNMAN',
    text: 'A friend wonders: "If water is H and O, why isn\'t it explosive like hydrogen or a flame like oxygen?"\n\nExplain using elements vs compounds.',
    keyConcepts: ['compound properties ≠ element properties', 'new chemical bonds', 'water is a new substance', 'H₂O is not H + O separately'],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// HISTORY — Class 6 CBSE
// ═══════════════════════════════════════════════════════════════════════════

// ─── hist_ch1: Ancient Civilisations ───────────────────────────────────────

export const QUESTIONS_h101: Question[] = [
  {
    id: 'h101_q1',
    type: 'MCQ',
    text: 'Mesopotamia was located mainly between which two rivers?',
    options: [
      { id: 'a', text: 'Nile and Ganges', correct: false },
      { id: 'b', text: 'Tigris and Euphrates', correct: true },
      { id: 'c', text: 'Yellow and Yangtze', correct: false },
      { id: 'd', text: 'Indus and Saraswati', correct: false },
    ],
    explanation: 'Mesopotamia means "land between the rivers" — the Tigris and Euphrates in modern-day Iraq.',
  },
  {
    id: 'h101_q2',
    type: 'DESCRIPTIVE',
    text: 'Why is Mesopotamia often called the "cradle of civilisation"?',
    rubricHint: 'Mention: (1) one of the earliest known civilisations, (2) invented writing (cuneiform), (3) early cities, laws, agriculture.',
  },
  {
    id: 'h101_q3',
    type: 'FEYNMAN',
    text: 'A friend thinks all ancient civilisations started in Egypt.\n\nExplain why Mesopotamia is just as important as a starting point.',
    keyConcepts: ['between Tigris and Euphrates', 'cuneiform writing', 'first cities', 'law codes (Hammurabi)'],
  },
  {
    id: 'h101_q4',
    type: 'BLURT',
    text: 'Mesopotamia',
  },
  {
    id: 'h101_q5',
    type: 'ACTIVE_RECALL',
    text: 'A historian finds a clay tablet covered in wedge-shaped marks in a dig in modern Iraq.\n\nWhich civilisation does this likely come from, and how do you know?',
  },
];

export const QUESTIONS_h102: Question[] = [
  {
    id: 'h102_q1',
    type: 'MCQ',
    text: 'Which river was the lifeline of ancient Egyptian civilisation?',
    options: [
      { id: 'a', text: 'Tigris', correct: false },
      { id: 'b', text: 'Nile', correct: true },
      { id: 'c', text: 'Euphrates', correct: false },
      { id: 'd', text: 'Indus', correct: false },
    ],
    explanation: 'The Nile\'s yearly floods left fertile black silt, making farming possible in an otherwise desert region.',
  },
  {
    id: 'h102_q2',
    type: 'DESCRIPTIVE',
    text: 'Why were the pyramids of Egypt built, and what do they tell us about Egyptian society?',
    rubricHint: 'Mention: (1) tombs for pharaohs, (2) belief in afterlife, (3) required organised labour, planning, and wealth.',
  },
  {
    id: 'h102_q3',
    type: 'FEYNMAN',
    text: 'A classmate thinks the pyramids were built by aliens because they\'re "too perfect."\n\nExplain how Egyptian engineering, organisation, and labour actually built them.',
    keyConcepts: ['thousands of workers', 'ramps and levers', 'careful planning', 'centuries of practice'],
  },
  {
    id: 'h102_q4',
    type: 'BLURT',
    text: 'Egyptian civilization',
  },
  {
    id: 'h102_q5',
    type: 'ACTIVE_RECALL',
    text: 'Imagine the Nile flood failed for three years in a row.\n\nUsing what you know about Egyptian civilisation, describe two big problems Egypt would have faced.',
  },
];

export const QUESTIONS_h103: Question[] = [
  {
    id: 'h103_q1',
    type: 'MCQ',
    text: 'Which two cities are most famous from the Indus Valley Civilisation?',
    options: [
      { id: 'a', text: 'Athens and Sparta', correct: false },
      { id: 'b', text: 'Harappa and Mohenjo-daro', correct: true },
      { id: 'c', text: 'Babylon and Nineveh', correct: false },
      { id: 'd', text: 'Memphis and Thebes', correct: false },
    ],
    explanation: 'Harappa and Mohenjo-daro are the largest excavated Indus cities, both known for advanced planning and drainage.',
  },
  {
    id: 'h103_q2',
    type: 'DESCRIPTIVE',
    text: 'What made Indus Valley town planning so unusual for its time?',
    rubricHint: 'Mention: (1) grid layout streets, (2) covered drains, (3) standardised brick sizes, (4) public baths.',
  },
  {
    id: 'h103_q3',
    type: 'FEYNMAN',
    text: 'A friend thinks we know everything about the Indus Valley.\n\nExplain why much of it is still mysterious, especially their writing.',
    keyConcepts: ['script undeciphered', 'no bilingual text', '400+ symbols', 'leadership system unclear'],
  },
  {
    id: 'h103_q4',
    type: 'BLURT',
    text: 'Indus Valley',
  },
  {
    id: 'h103_q5',
    type: 'ACTIVE_RECALL',
    text: 'Archaeologists find a small Indus Valley seal in a Mesopotamian city.\n\nWhat does this tell us about the Indus Valley people, and what kinds of activities did they take part in?',
  },
];

export const QUESTIONS_h104: Question[] = [
  {
    id: 'h104_q1',
    type: 'MCQ',
    text: 'Which river valley is associated with the earliest Chinese civilisation?',
    options: [
      { id: 'a', text: 'Nile', correct: false },
      { id: 'b', text: 'Yellow (Huang He) river', correct: true },
      { id: 'c', text: 'Indus', correct: false },
      { id: 'd', text: 'Ganges', correct: false },
    ],
    explanation: 'Early Chinese civilisation grew along the Yellow River, where fertile soil supported farming.',
  },
  {
    id: 'h104_q2',
    type: 'DESCRIPTIVE',
    text: 'How was the Great Wall of China built, and why?',
    rubricHint: 'Mention: (1) built in stages over many dynasties, (2) defence against northern nomads, (3) huge labour and materials.',
  },
  {
    id: 'h104_q3',
    type: 'FEYNMAN',
    text: 'A friend says: "The Chinese only had simple ideas."\n\nExplain how their ancient inventions actually changed the world.',
    keyConcepts: ['paper, printing, gunpowder, compass', 'spread along Silk Road', 'centuries before Europe', 'huge cultural impact'],
  },
  {
    id: 'h104_q4',
    type: 'BLURT',
    text: 'Chinese civilization',
  },
  {
    id: 'h104_q5',
    type: 'ACTIVE_RECALL',
    text: 'A historian finds a Chinese compass on an old shipwreck off India.\n\nWhat does this suggest about trade and technology between ancient civilisations?',
  },
];

export const QUESTIONS_h105: Question[] = [
  {
    id: 'h105_q1',
    type: 'MCQ',
    text: 'What was a Greek city-state (polis) like?',
    options: [
      { id: 'a', text: 'A single huge empire ruled by one king', correct: false },
      { id: 'b', text: 'An independent city with its own government and laws', correct: true },
      { id: 'c', text: 'A small village without rulers', correct: false },
      { id: 'd', text: 'A floating sea fortress', correct: false },
    ],
    explanation: 'Each Greek city-state (like Athens or Sparta) was independent — it had its own laws, army, and identity.',
  },
  {
    id: 'h105_q2',
    type: 'DESCRIPTIVE',
    text: 'How were Athens and Sparta very different city-states?',
    rubricHint: 'Mention: (1) Athens = democracy, arts, learning, (2) Sparta = military, strict discipline, (3) both Greek but opposite priorities.',
  },
  {
    id: 'h105_q3',
    type: 'FEYNMAN',
    text: 'A friend says democracy was "invented in modern times."\n\nExplain why ancient Athens is often credited as a birthplace of democracy.',
    keyConcepts: ['Athenian assembly', 'citizens voted directly', 'limited (only free men)', 'inspired later democracies'],
  },
  {
    id: 'h105_q4',
    type: 'BLURT',
    text: 'Greek city-states',
  },
  {
    id: 'h105_q5',
    type: 'ACTIVE_RECALL',
    text: 'Imagine a citizen of Athens travels to Sparta for a year.\n\nDescribe two ways daily life and government would feel different for him.',
  },
];

export const QUESTIONS_h106: Question[] = [
  {
    id: 'h106_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'The Roman Empire was at first ruled by:',
    options: [
      { id: 'a', text: 'Emperors only', correct: false },
      { id: 'b', text: 'A Republic with elected senators (before later emperors)', correct: true },
      { id: 'c', text: 'A queen', correct: false },
      { id: 'd', text: 'A council of priests', correct: false },
    ],
    explanation: 'Rome began as a republic with a senate; only later (after Julius Caesar) did it become an empire ruled by emperors.',
  },
  {
    id: 'h106_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Why are Roman roads still famous?',
    options: [
      { id: 'a', text: 'They were made of gold', correct: false },
      { id: 'b', text: 'They were carefully engineered and connected far parts of the empire', correct: true },
      { id: 'c', text: 'They were narrow and short', correct: false },
      { id: 'd', text: 'They were underground', correct: false },
    ],
    explanation: 'Roman roads were straight, layered, and built to last — many survive today and helped soldiers, traders, and messengers move fast.',
  },
  {
    id: 'h106_q3',
    type: 'DESCRIPTIVE',
    text: 'Why did the Roman Empire eventually decline?',
    rubricHint: 'Mention: (1) over-expansion, (2) weak emperors and corruption, (3) invasions by outside groups.',
  },
  {
    id: 'h106_q4',
    type: 'FEYNMAN',
    text: 'A friend thinks "the Roman Empire ended overnight."\n\nExplain that it actually declined over centuries and why.',
    keyConcepts: ['gradual decline', 'too big to defend', 'civil wars', 'pressure from outside'],
  },
  {
    id: 'h106_q5',
    type: 'BLURT',
    text: 'Roman Empire',
  },
  {
    id: 'h106_q6',
    type: 'ACTIVE_RECALL',
    text: 'A modern country builds long, straight, multi-layered highways across its territory.\n\nWhich ancient civilisation\'s engineering does this echo, and why was it so useful?',
  },
];

export const QUESTIONS_h107: Question[] = [
  {
    id: 'h107_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Which of these religions is the OLDEST?',
    options: [
      { id: 'a', text: 'Christianity', correct: false },
      { id: 'b', text: 'Hinduism', correct: true },
      { id: 'c', text: 'Islam', correct: false },
      { id: 'd', text: 'Sikhism', correct: false },
    ],
    explanation: 'Hinduism has roots going back thousands of years in ancient India, making it one of the oldest still-practised religions.',
  },
  {
    id: 'h107_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Buddhism was founded by:',
    options: [
      { id: 'a', text: 'Mahavira', correct: false },
      { id: 'b', text: 'Siddhartha Gautama (the Buddha)', correct: true },
      { id: 'c', text: 'Guru Nanak', correct: false },
      { id: 'd', text: 'Confucius', correct: false },
    ],
    explanation: 'Siddhartha Gautama, who became "the Buddha" (the awakened one), founded Buddhism in ancient India.',
  },
  {
    id: 'h107_q3',
    type: 'DESCRIPTIVE',
    text: 'Why did religions like Buddhism and Jainism arise in ancient India?',
    rubricHint: 'Mention: (1) reaction against rigid rituals, (2) emphasis on non-violence and personal practice, (3) appeal to many social groups.',
  },
  {
    id: 'h107_q4',
    type: 'FEYNMAN',
    text: 'A friend asks: "Why are there so many religions in the world?"\n\nUsing examples from ancient times, explain why religions arose differently in different places.',
    keyConcepts: ['different societies, different questions', 'spread along trade routes', 'local culture', 'big thinkers like Buddha'],
  },
  {
    id: 'h107_q5',
    type: 'BLURT',
    text: 'Rise of religions',
  },
  {
    id: 'h107_q6',
    type: 'ACTIVE_RECALL',
    text: 'A new spiritual movement appears today, emphasising kindness and rejecting harmful rituals.\n\nWhich ancient religious movement does this remind you of, and why?',
  },
];

export const QUESTIONS_h108: Question[] = [
  {
    id: 'h108_q1',
    type: 'MCQ',
    text: 'The "Silk Road" was:',
    options: [
      { id: 'a', text: 'A real road made entirely of silk', correct: false },
      { id: 'b', text: 'A network of trade routes connecting China to the Mediterranean', correct: true },
      { id: 'c', text: 'Only used by Roman emperors', correct: false },
      { id: 'd', text: 'A sea route around Africa', correct: false },
    ],
    explanation: 'The Silk Road was a network of land and sea routes carrying silk, spices, ideas, and people between Asia and Europe.',
  },
  {
    id: 'h108_q2',
    type: 'DESCRIPTIVE',
    text: 'Besides goods, what else travelled along ancient trade routes?',
    rubricHint: 'Mention: (1) ideas and religions, (2) technologies (paper, gunpowder), (3) diseases as well.',
  },
  {
    id: 'h108_q3',
    type: 'FEYNMAN',
    text: 'A friend thinks "globalisation" is a modern invention.\n\nExplain how ancient trade routes were a kind of early globalisation.',
    keyConcepts: ['Silk Road', 'goods across continents', 'cultural exchange', 'religions spread'],
  },
  {
    id: 'h108_q4',
    type: 'BLURT',
    text: 'Trade routes of the ancient world',
  },
  {
    id: 'h108_q5',
    type: 'ACTIVE_RECALL',
    text: 'Buddhist statues from India have been found in caves in western China.\n\nUsing what you know about ancient trade routes, explain how they got there.',
  },
];

// ─── hist_ch2: Medieval India ──────────────────────────────────────────────

export const QUESTIONS_h201: Question[] = [
  {
    id: 'h201_q1',
    type: 'MCQ',
    text: 'The Rajputs were known mainly for:',
    options: [
      { id: 'a', text: 'Trade and shipbuilding', correct: false },
      { id: 'b', text: 'Their warrior code and bravery in battle', correct: true },
      { id: 'c', text: 'Painting and sculpture only', correct: false },
      { id: 'd', text: 'Farming only', correct: false },
    ],
    explanation: 'Rajputs were warrior clans known for their bravery, honour code, and fierce defence of their kingdoms.',
  },
  {
    id: 'h201_q2',
    type: 'DESCRIPTIVE',
    text: 'Why are Rajput forts an important part of Indian heritage?',
    rubricHint: 'Mention: (1) defence architecture, (2) cultural symbols, (3) tell stories of valour and history.',
  },
  {
    id: 'h201_q3',
    type: 'FEYNMAN',
    text: 'A friend thinks Rajputs were "just one tribe."\n\nExplain that there were many Rajput clans with different kingdoms.',
    keyConcepts: ['many clans (Chauhans, Sisodias, etc.)', 'different kingdoms', 'shared warrior code', 'all over north and west India'],
  },
  {
    id: 'h201_q4',
    type: 'BLURT',
    text: 'The Rajputs',
  },
  {
    id: 'h201_q5',
    type: 'ACTIVE_RECALL',
    text: 'A new film tells the story of a brave queen who defended her fort to her last breath.\n\nWhich Indian historical group does this likely draw from, and why?',
  },
];

export const QUESTIONS_h202: Question[] = [
  {
    id: 'h202_q1',
    type: 'MCQ',
    text: 'The Delhi Sultanate was a series of Muslim dynasties ruling mainly from:',
    options: [
      { id: 'a', text: '500 BCE to 0 CE', correct: false },
      { id: 'b', text: '13th to early 16th century', correct: true },
      { id: 'c', text: '1750 to 1947', correct: false },
      { id: 'd', text: '6th to 9th century', correct: false },
    ],
    explanation: 'The Delhi Sultanate ran roughly from 1206 (Qutb-ud-din Aibak) to 1526 (when Babur defeated the last Sultan).',
  },
  {
    id: 'h202_q2',
    type: 'DESCRIPTIVE',
    text: 'How did the Delhi Sultanate change the culture of north India?',
    rubricHint: 'Mention: (1) new architecture (Qutub Minar), (2) Persian language and arts, (3) new administrative ideas.',
  },
  {
    id: 'h202_q3',
    type: 'FEYNMAN',
    text: 'A friend thinks the Delhi Sultanate was "one continuous government."\n\nExplain that it was actually several different dynasties.',
    keyConcepts: ['Slave dynasty', 'Khilji', 'Tughlaq', 'Sayyid', 'Lodhi', 'all different families'],
  },
  {
    id: 'h202_q4',
    type: 'BLURT',
    text: 'Delhi Sultanate',
  },
  {
    id: 'h202_q5',
    type: 'ACTIVE_RECALL',
    text: 'A traveller from the 14th century describes a busy north Indian capital with grand mosques, foreign nobles, and Persian-speaking officials.\n\nWhich period of Indian history does this match, and why?',
  },
];

export const QUESTIONS_h203: Question[] = [
  {
    id: 'h203_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'The Bhakti movement focused on:',
    options: [
      { id: 'a', text: 'Conquering new lands', correct: false },
      { id: 'b', text: 'Personal devotion to god and rejection of rigid rituals', correct: true },
      { id: 'c', text: 'Trade with foreign countries', correct: false },
      { id: 'd', text: 'Building forts', correct: false },
    ],
    explanation: 'Bhakti saints taught that personal devotion (bhakti) to god mattered more than caste or complicated rituals.',
  },
  {
    id: 'h203_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'A famous Bhakti saint who wrote songs in praise of Krishna was:',
    options: [
      { id: 'a', text: 'Akbar', correct: false },
      { id: 'b', text: 'Meera Bai', correct: true },
      { id: 'c', text: 'Babur', correct: false },
      { id: 'd', text: 'Tulsidas', correct: false },
    ],
    explanation: 'Meera Bai, a Rajput princess, became a Bhakti saint famous for her devotional songs to Krishna.',
  },
  {
    id: 'h203_q3',
    type: 'DESCRIPTIVE',
    text: 'Why did the Bhakti movement appeal to so many ordinary people?',
    rubricHint: 'Mention: (1) used local languages, (2) rejected caste barriers, (3) emphasised love over ritual.',
  },
  {
    id: 'h203_q4',
    type: 'FEYNMAN',
    text: 'A friend thinks "Bhakti" was just one big movement.\n\nExplain how it was actually many different saints across India, but with shared ideas.',
    keyConcepts: ['Kabir, Mira, Tulsidas, Surdas', 'different regions and languages', 'devotion as common theme', 'reformist energy'],
  },
  {
    id: 'h203_q5',
    type: 'BLURT',
    text: 'Bhakti movement',
  },
  {
    id: 'h203_q6',
    type: 'ACTIVE_RECALL',
    text: 'A poet today writes songs in plain Hindi calling for equality and rejecting rituals.\n\nWhich medieval Indian movement does this echo, and what would Bhakti saints likely think?',
  },
];

export const QUESTIONS_h204: Question[] = [
  {
    id: 'h204_q1',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'The Vijayanagara Empire was located mainly in:',
    options: [
      { id: 'a', text: 'North India', correct: false },
      { id: 'b', text: 'South India', correct: true },
      { id: 'c', text: 'Central India only', correct: false },
      { id: 'd', text: 'East India', correct: false },
    ],
    explanation: 'Vijayanagara was a powerful south Indian empire with its capital at Hampi.',
  },
  {
    id: 'h204_q2',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'Which capital city is most associated with the Vijayanagara Empire?',
    options: [
      { id: 'a', text: 'Madurai', correct: false },
      { id: 'b', text: 'Hampi', correct: true },
      { id: 'c', text: 'Tanjore', correct: false },
      { id: 'd', text: 'Mysuru', correct: false },
    ],
    explanation: 'Hampi was the magnificent capital of the Vijayanagara empire — now a UNESCO World Heritage site.',
  },
  {
    id: 'h204_q3',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'Why was the Vijayanagara Empire so important for south Indian culture?',
    rubricHint: 'Mention: (1) protected south Indian traditions, (2) huge patron of temples and arts, (3) thriving trade and markets.',
  },
  {
    id: 'h204_q4',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'How do the ruins of Hampi help us understand life under Vijayanagara?',
    rubricHint: 'Mention: (1) grand temples and palaces, (2) bazaars and water systems, (3) art and inscriptions.',
  },
  {
    id: 'h204_q5',
    type: 'FEYNMAN',
    text: 'A friend asks why anyone visits Hampi today.\n\nExplain why these ruins are a window into medieval south India.',
    keyConcepts: ['centre of Vijayanagara', 'temples, markets', 'wealthy and busy city', 'ruins tell daily life'],
  },
  {
    id: 'h204_q6',
    type: 'BLURT',
    text: 'Vijayanagara Empire',
  },
];

export const QUESTIONS_h205: Question[] = [
  {
    id: 'h205_q1',
    type: 'MCQ',
    text: 'The Chola dynasty was based mainly in:',
    options: [
      { id: 'a', text: 'Punjab', correct: false },
      { id: 'b', text: 'Tamil Nadu (south India)', correct: true },
      { id: 'c', text: 'Bengal', correct: false },
      { id: 'd', text: 'Gujarat', correct: false },
    ],
    explanation: 'The Cholas ruled large parts of south India, especially Tamil Nadu, and extended their power across the seas.',
  },
  {
    id: 'h205_q2',
    type: 'DESCRIPTIVE',
    text: 'Why are the Cholas famous for both their navy and their bronze art?',
    rubricHint: 'Mention: (1) powerful navy reached Southeast Asia, (2) Chola bronze statues like Nataraja are world-famous, (3) supported temples and art.',
  },
  {
    id: 'h205_q3',
    type: 'FEYNMAN',
    text: 'A friend thinks all Indian empires were land-based.\n\nExplain how the Chola navy was different and far-reaching.',
    keyConcepts: ['strong navy', 'expedition to Southeast Asia', 'trade across Indian Ocean', 'unusual for ancient empires'],
  },
  {
    id: 'h205_q4',
    type: 'BLURT',
    text: 'Chola dynasty',
  },
  {
    id: 'h205_q5',
    type: 'ACTIVE_RECALL',
    text: 'Indian-style temple ruins are found in modern Cambodia and Thailand.\n\nWhich south Indian dynasty\'s influence might this trace back to, and why?',
  },
];

export const QUESTIONS_h206: Question[] = [
  {
    id: 'h206_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'The Sufi movement was part of which religious tradition?',
    options: [
      { id: 'a', text: 'Hinduism', correct: false },
      { id: 'b', text: 'Islam', correct: true },
      { id: 'c', text: 'Buddhism', correct: false },
      { id: 'd', text: 'Jainism', correct: false },
    ],
    explanation: 'Sufism is the mystical, devotional side of Islam, focused on inner experience of god.',
  },
  {
    id: 'h206_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Sufis are best known for their:',
    options: [
      { id: 'a', text: 'Military conquests', correct: false },
      { id: 'b', text: 'Devotional music, poetry, and emphasis on love of god', correct: true },
      { id: 'c', text: 'Strict legal codes', correct: false },
      { id: 'd', text: 'Trade networks', correct: false },
    ],
    explanation: 'Sufis emphasised love and devotion through qawwali, poetry, and dargahs — not military or strict ritual.',
  },
  {
    id: 'h206_q3',
    type: 'DESCRIPTIVE',
    text: 'How were the Bhakti and Sufi movements similar?',
    rubricHint: 'Mention: (1) both stressed devotion over ritual, (2) used local languages and music, (3) crossed social barriers.',
  },
  {
    id: 'h206_q4',
    type: 'FEYNMAN',
    text: 'A friend thinks Sufis were "rebels against Islam."\n\nExplain why this is a misunderstanding.',
    keyConcepts: ['part of Islam, not against it', 'focus on inner experience', 'love of god', 'reform within the tradition'],
  },
  {
    id: 'h206_q5',
    type: 'BLURT',
    text: 'Sufi movement',
  },
  {
    id: 'h206_q6',
    type: 'ACTIVE_RECALL',
    text: 'A peaceful shrine in India still draws people of many religions for qawwali music.\n\nExplain which medieval tradition this comes from and why people of different faiths feel welcome there.',
  },
];

export const QUESTIONS_h207: Question[] = [
  {
    id: 'h207_q1',
    type: 'MCQ',
    text: 'Medieval Indian temples often combined which two skills?',
    options: [
      { id: 'a', text: 'Astronomy and weather forecasting', correct: false },
      { id: 'b', text: 'Architecture and sculpture', correct: true },
      { id: 'c', text: 'Cooking and farming', correct: false },
      { id: 'd', text: 'Shipbuilding and writing', correct: false },
    ],
    explanation: 'Medieval temples are masterpieces of architecture (huge structures) and sculpture (detailed carvings).',
  },
  {
    id: 'h207_q2',
    type: 'DESCRIPTIVE',
    text: 'How did medieval Indian rulers use art and architecture to show power?',
    rubricHint: 'Mention: (1) grand temples and palaces, (2) statues and inscriptions, (3) symbols of wealth and religious patronage.',
  },
  {
    id: 'h207_q3',
    type: 'FEYNMAN',
    text: 'A friend says: "All medieval Indian temples look the same."\n\nExplain how south Indian, north Indian, and other regional styles actually differ.',
    keyConcepts: ['Dravidian (south)', 'Nagara (north)', 'gopurams vs shikharas', 'regional variations'],
  },
  {
    id: 'h207_q4',
    type: 'BLURT',
    text: 'Medieval art & architecture',
  },
  {
    id: 'h207_q5',
    type: 'ACTIVE_RECALL',
    text: 'A tourist sees a temple with a tall, towering southern-style gateway covered in colourful figures.\n\nWhich Indian architectural tradition is this from, and how is it different from a northern temple?',
  },
];

// ─── hist_ch3: The Mughal Empire ───────────────────────────────────────────

export const QUESTIONS_h301: Question[] = [
  {
    id: 'h301_q1',
    type: 'MCQ',
    text: 'Babur defeated which ruler at the First Battle of Panipat (1526)?',
    options: [
      { id: 'a', text: 'Sher Shah Suri', correct: false },
      { id: 'b', text: 'Ibrahim Lodi', correct: true },
      { id: 'c', text: 'Akbar', correct: false },
      { id: 'd', text: 'Rana Sanga', correct: false },
    ],
    explanation: 'Babur defeated Sultan Ibrahim Lodi at Panipat in 1526, founding the Mughal Empire in India.',
  },
  {
    id: 'h301_q2',
    type: 'DESCRIPTIVE',
    text: 'How did Babur win at Panipat despite having a smaller army?',
    rubricHint: 'Mention: (1) used artillery (cannons), (2) effective cavalry tactics, (3) Lodi army was less organised.',
  },
  {
    id: 'h301_q3',
    type: 'FEYNMAN',
    text: 'A friend thinks the Mughal Empire was always huge from day one.\n\nExplain how Babur\'s rule was actually quite small at first.',
    keyConcepts: ['Babur ruled briefly', 'small north Indian base', 'expansion came later', 'Akbar truly built the empire'],
  },
  {
    id: 'h301_q4',
    type: 'BLURT',
    text: 'Babur & the founding of Mughal rule',
  },
  {
    id: 'h301_q5',
    type: 'ACTIVE_RECALL',
    text: 'Imagine a smaller force using new technology defeats a larger traditional army.\n\nWhich historical battle does this remind you of, and why was the new technology so important?',
  },
];

export const QUESTIONS_h302: Question[] = [
  {
    id: 'h302_q1',
    type: 'MCQ',
    text: 'Akbar is often considered the greatest Mughal because:',
    options: [
      { id: 'a', text: 'He conquered all of Asia', correct: false },
      { id: 'b', text: 'He built a strong, well-organised empire and was tolerant of different religions', correct: true },
      { id: 'c', text: 'He invented gunpowder', correct: false },
      { id: 'd', text: 'He ruled for 100 years', correct: false },
    ],
    explanation: 'Akbar expanded the empire, set up an efficient administration, and famously promoted religious tolerance.',
  },
  {
    id: 'h302_q2',
    type: 'DESCRIPTIVE',
    text: 'How did Akbar organise his empire to keep it stable and well-run?',
    rubricHint: 'Mention: (1) Mansabdari system, (2) standardised revenue, (3) appointed capable officials regardless of religion.',
  },
  {
    id: 'h302_q3',
    type: 'FEYNMAN',
    text: 'A friend thinks Akbar succeeded "just because of his army."\n\nExplain how his administration and policies also played a huge role.',
    keyConcepts: ['ranked nobles (mansabdars)', 'fair revenue policy', 'tolerance won loyalty', 'efficient bureaucracy'],
  },
  {
    id: 'h302_q4',
    type: 'BLURT',
    text: 'Akbar reign & administration',
  },
  {
    id: 'h302_q5',
    type: 'ACTIVE_RECALL',
    text: 'A new ruler today wants to govern a very diverse country.\n\nUsing Akbar\'s example, suggest two strategies from his reign that might still help.',
  },
];

export const QUESTIONS_h303: Question[] = [
  {
    id: 'h303_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Din-i-Ilahi, Akbar\'s religious idea, was meant to:',
    options: [
      { id: 'a', text: 'Make Islam the only religion in India', correct: false },
      { id: 'b', text: 'Combine the best ideas from different religions', correct: true },
      { id: 'c', text: 'Ban all religion', correct: false },
      { id: 'd', text: 'Force Hindus to convert', correct: false },
    ],
    explanation: 'Akbar\'s "Religion of God" tried to bring together ideas from Islam, Hinduism, Christianity, and others. It had few followers.',
  },
  {
    id: 'h303_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Why did Akbar set up the Ibadat Khana?',
    options: [
      { id: 'a', text: 'As a battlefield', correct: false },
      { id: 'b', text: 'As a place for scholars of different religions to debate', correct: true },
      { id: 'c', text: 'As a hospital', correct: false },
      { id: 'd', text: 'As a fort', correct: false },
    ],
    explanation: 'The Ibadat Khana ("House of Worship") at Fatehpur Sikri was a meeting place where Akbar hosted discussions among Hindu, Muslim, Christian, Jain, and Zoroastrian thinkers.',
  },
  {
    id: 'h303_q3',
    type: 'DESCRIPTIVE',
    text: 'Why was Akbar\'s religious policy unusual for its time?',
    rubricHint: 'Mention: (1) most rulers favoured one religion, (2) Akbar promoted tolerance and dialogue, (3) helped unify a diverse empire.',
  },
  {
    id: 'h303_q4',
    type: 'FEYNMAN',
    text: 'A friend says Akbar "invented his own religion."\n\nExplain more precisely what Din-i-Ilahi was and how popular it actually was.',
    keyConcepts: ['blend of ideas', 'very few followers', 'not really a new religion', 'reflected Akbar personally'],
  },
  {
    id: 'h303_q5',
    type: 'BLURT',
    text: 'Akbar religious policy (Din-i-Ilahi)',
  },
  {
    id: 'h303_q6',
    type: 'ACTIVE_RECALL',
    text: 'A modern leader invites religious scholars from different faiths to a televised debate to promote understanding.\n\nWhich Mughal practice does this echo, and what is the goal in both cases?',
  },
];

export const QUESTIONS_h304: Question[] = [
  {
    id: 'h304_q1',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'The Mansabdari system was used by the Mughals to:',
    options: [
      { id: 'a', text: 'Tax farmers directly', correct: false },
      { id: 'b', text: 'Rank and pay nobles based on their position and number of soldiers', correct: true },
      { id: 'c', text: 'Train priests', correct: false },
      { id: 'd', text: 'Choose the next emperor', correct: false },
    ],
    explanation: 'Mansabdars were ranked officials. Their rank (mansab) decided their pay and how many soldiers they had to provide.',
  },
  {
    id: 'h304_q2',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'A higher mansab rank meant:',
    options: [
      { id: 'a', text: 'Lower salary', correct: false },
      { id: 'b', text: 'Higher position, more pay, and more soldiers to lead', correct: true },
      { id: 'c', text: 'Only religious duties', correct: false },
      { id: 'd', text: 'Working only in Delhi', correct: false },
    ],
    explanation: 'A higher mansab meant more responsibility — bigger salary, more soldiers, higher status in the imperial court.',
  },
  {
    id: 'h304_q3',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'How did the Mansabdari system help Akbar control his empire?',
    rubricHint: 'Mention: (1) standardised ranks across officials, (2) clear duties and pay, (3) loyalty tied to the emperor, (4) flexible — nobles could be moved.',
  },
  {
    id: 'h304_q4',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'What were possible weaknesses of the Mansabdari system?',
    rubricHint: 'Mention: (1) mansabdars could over-claim soldiers, (2) corruption possible, (3) loyalty depended on regular pay.',
  },
  {
    id: 'h304_q5',
    type: 'FEYNMAN',
    text: 'A friend says: "The Mansabdari system was basically a salary list."\n\nExplain why it was much more than just paying officials.',
    keyConcepts: ['military ranks', 'administrative duties', 'centralised loyalty', 'soldiers attached to mansabdars'],
  },
  {
    id: 'h304_q6',
    type: 'BLURT',
    text: 'Mansabdari system',
  },
];

export const QUESTIONS_h305: Question[] = [
  {
    id: 'h305_q1',
    type: 'MCQ',
    text: 'Which monument is the most famous example of Shah Jahan\'s architecture?',
    options: [
      { id: 'a', text: 'Qutub Minar', correct: false },
      { id: 'b', text: 'Taj Mahal', correct: true },
      { id: 'c', text: 'Charminar', correct: false },
      { id: 'd', text: 'Red Fort of Agra (entirely)', correct: false },
    ],
    explanation: 'Shah Jahan built the Taj Mahal in Agra as a tomb for his wife Mumtaz Mahal — a peak of Mughal architecture.',
  },
  {
    id: 'h305_q2',
    type: 'DESCRIPTIVE',
    text: 'How does the Taj Mahal show the height of Mughal architectural skill?',
    rubricHint: 'Mention: (1) white marble + precious stone inlay, (2) symmetry and gardens, (3) blend of Persian, Indian, Islamic styles.',
  },
  {
    id: 'h305_q3',
    type: 'FEYNMAN',
    text: 'A friend thinks the Taj Mahal is "just a beautiful tomb."\n\nExplain how it also reflects Mughal power, art, and emotion.',
    keyConcepts: ['huge resources', 'craftsmen from many places', 'love and grief', 'symbol of empire\'s wealth'],
  },
  {
    id: 'h305_q4',
    type: 'BLURT',
    text: 'Shah Jahan & Mughal architecture',
  },
  {
    id: 'h305_q5',
    type: 'ACTIVE_RECALL',
    text: 'A new monument is built today using marble, complex geometric inlay, gardens, and symmetric design.\n\nWhich Mughal monument might this echo, and what features make it "Mughal-style"?',
  },
];

export const QUESTIONS_h306: Question[] = [
  {
    id: 'h306_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Aurangzeb\'s reign is often linked with the start of Mughal decline because he:',
    options: [
      { id: 'a', text: 'Ignored his army', correct: false },
      { id: 'b', text: 'Faced long wars and reversed earlier policies of tolerance', correct: true },
      { id: 'c', text: 'Refused to rule', correct: false },
      { id: 'd', text: 'Lost all his land in one battle', correct: false },
    ],
    explanation: 'Aurangzeb expanded the empire but also drained it with long Deccan wars; his harsher religious policies caused unrest.',
  },
  {
    id: 'h306_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'After Aurangzeb, the Mughal Empire:',
    options: [
      { id: 'a', text: 'Grew even stronger', correct: false },
      { id: 'b', text: 'Broke into smaller regional states', correct: true },
      { id: 'c', text: 'Stayed exactly the same for centuries', correct: false },
      { id: 'd', text: 'Was destroyed by a single battle', correct: false },
    ],
    explanation: 'Weak successors plus regional resistance (Marathas, Sikhs, regional rulers) caused the empire to fragment.',
  },
  {
    id: 'h306_q3',
    type: 'DESCRIPTIVE',
    text: 'Why did Aurangzeb\'s wars in the Deccan exhaust the Mughal Empire?',
    rubricHint: 'Mention: (1) wars dragged on for decades, (2) huge cost in men and money, (3) North left under-watched, (4) rebellions grew.',
  },
  {
    id: 'h306_q4',
    type: 'FEYNMAN',
    text: 'A friend says: "Aurangzeb destroyed the Mughal Empire."\n\nExplain how the decline was more complicated than one ruler\'s fault.',
    keyConcepts: ['weak successors', 'regional powers rising', 'over-expansion', 'multiple causes'],
  },
  {
    id: 'h306_q5',
    type: 'BLURT',
    text: 'Aurangzeb & the decline of the Mughals',
  },
  {
    id: 'h306_q6',
    type: 'ACTIVE_RECALL',
    text: 'A modern country expands its borders rapidly but ignores internal problems.\n\nUsing Aurangzeb\'s reign as an example, explain what could go wrong.',
  },
];

export const QUESTIONS_h307: Question[] = [
  {
    id: 'h307_q1',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'Which Mughal art form is famous for tiny, detailed paintings often showing court scenes?',
    options: [
      { id: 'a', text: 'Frescoes', correct: false },
      { id: 'b', text: 'Miniature paintings', correct: true },
      { id: 'c', text: 'Wall murals only', correct: false },
      { id: 'd', text: 'Stained glass', correct: false },
    ],
    explanation: 'Mughal miniature paintings are small, detailed works showing emperors, hunts, battles, and court life.',
  },
  {
    id: 'h307_q2',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'Which Mughal emperor specially encouraged miniature painting?',
    options: [
      { id: 'a', text: 'Babur', correct: false },
      { id: 'b', text: 'Akbar', correct: true },
      { id: 'c', text: 'Aurangzeb', correct: false },
      { id: 'd', text: 'Bahadur Shah Zafar', correct: false },
    ],
    explanation: 'Akbar set up a royal workshop (karkhana) where painters created illustrated books and court scenes.',
  },
  {
    id: 'h307_q3',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'Mughal culture mixed styles from:',
    options: [
      { id: 'a', text: 'Persia and India', correct: true },
      { id: 'b', text: 'Only Persia', correct: false },
      { id: 'c', text: 'Only India', correct: false },
      { id: 'd', text: 'Africa only', correct: false },
    ],
    explanation: 'Mughal art, music, and architecture beautifully combined Persian techniques with Indian themes and skills.',
  },
  {
    id: 'h307_q4',
    type: 'DESCRIPTIVE',
    tier: 'VERY_WEAK',
    text: 'How did Mughal patronage help art and culture flourish in India?',
    rubricHint: 'Mention: (1) emperors funded artists and workshops, (2) brought in foreign experts, (3) created new schools of art.',
  },
  {
    id: 'h307_q5',
    type: 'DESCRIPTIVE',
    tier: 'VERY_WEAK',
    text: 'Why are Mughal miniature paintings important historical sources today?',
    rubricHint: 'Mention: (1) show clothing, weapons, court life, (2) record events visually, (3) reveal artistic skill and taste.',
  },
  {
    id: 'h307_q6',
    type: 'FEYNMAN',
    text: 'A friend thinks Mughal culture was "all about wars and forts."\n\nExplain how Mughal life also revolved around art, poetry, and music.',
    keyConcepts: ['miniature painting', 'Urdu poetry', 'music', 'gardens', 'cuisine'],
  },
];

export const QUESTIONS_h308: Question[] = [
  {
    id: 'h308_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'The main source of Mughal revenue was:',
    options: [
      { id: 'a', text: 'Sea trade only', correct: false },
      { id: 'b', text: 'Land revenue from agriculture', correct: true },
      { id: 'c', text: 'Mining gold', correct: false },
      { id: 'd', text: 'Religious donations', correct: false },
    ],
    explanation: 'Most Mughal income came from tax on agricultural land. Farmers gave a share of produce to the state.',
  },
  {
    id: 'h308_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Akbar\'s minister Todar Mal helped design a revenue system that was:',
    options: [
      { id: 'a', text: 'Random and unfair', correct: false },
      { id: 'b', text: 'Based on careful land measurement and crop type', correct: true },
      { id: 'c', text: 'Identical for every farmer', correct: false },
      { id: 'd', text: 'Paid only by nobles', correct: false },
    ],
    explanation: 'Todar Mal\'s reforms measured land, classed it by fertility, and set fair revenue rates — a big step in good governance.',
  },
  {
    id: 'h308_q3',
    type: 'DESCRIPTIVE',
    text: 'How did a fair revenue system help the Mughal Empire?',
    rubricHint: 'Mention: (1) farmers were less crushed, (2) steady income for state, (3) reduced rebellions.',
  },
  {
    id: 'h308_q4',
    type: 'FEYNMAN',
    text: 'A friend thinks ancient kings just "took whatever they wanted" from farmers.\n\nExplain how the Mughals tried to be more systematic.',
    keyConcepts: ['Todar Mal\'s reforms', 'land measurement', 'fixed rate per land type', 'record-keeping'],
  },
  {
    id: 'h308_q5',
    type: 'BLURT',
    text: 'Revenue system under the Mughals',
  },
  {
    id: 'h308_q6',
    type: 'ACTIVE_RECALL',
    text: 'A modern government wants to raise taxes fairly from farmers.\n\nUsing Akbar\'s revenue system as inspiration, suggest two ideas.',
  },
];

export const QUESTIONS_h309: Question[] = [
  {
    id: 'h309_q1',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'Mughal noble women like Nur Jahan and Mumtaz Mahal:',
    options: [
      { id: 'a', text: 'Had no role outside the harem', correct: false },
      { id: 'b', text: 'Could be influential in court politics, art, and architecture', correct: true },
      { id: 'c', text: 'Always led armies', correct: false },
      { id: 'd', text: 'Were forbidden from learning', correct: false },
    ],
    explanation: 'Nur Jahan effectively co-ruled with Jahangir; Mumtaz Mahal was influential at court. Royal women shaped politics and culture.',
  },
  {
    id: 'h309_q2',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'Which Mughal queen is famously associated with the Taj Mahal?',
    options: [
      { id: 'a', text: 'Nur Jahan', correct: false },
      { id: 'b', text: 'Mumtaz Mahal', correct: true },
      { id: 'c', text: 'Roshanara Begum', correct: false },
      { id: 'd', text: 'Jahanara', correct: false },
    ],
    explanation: 'Shah Jahan built the Taj Mahal as a tomb for his beloved wife Mumtaz Mahal.',
  },
  {
    id: 'h309_q3',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'How did some Mughal women influence politics and culture even though they were not rulers?',
    rubricHint: 'Mention: (1) influence at court (Nur Jahan), (2) sponsored buildings and charity, (3) advised emperors and ran households.',
  },
  {
    id: 'h309_q4',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'Why is it hard to know about ordinary women in Mughal society?',
    rubricHint: 'Mention: (1) few written records about commoners, (2) most sources focus on royals, (3) historians piece together from paintings and letters.',
  },
  {
    id: 'h309_q5',
    type: 'FEYNMAN',
    text: 'A friend thinks Mughal women had "no power at all."\n\nExplain using examples why this is too simple.',
    keyConcepts: ['Nur Jahan ruled in practice', 'Mumtaz influenced Shah Jahan', 'royal women patrons of art', 'still many restrictions'],
  },
  {
    id: 'h309_q6',
    type: 'BLURT',
    text: 'Role of women in Mughal period',
  },
];

// ─── hist_ch4: Independence Movement ───────────────────────────────────────

export const QUESTIONS_h401: Question[] = [
  {
    id: 'h401_q1',
    type: 'MCQ',
    text: 'The Revolt of 1857 is also called:',
    options: [
      { id: 'a', text: 'The Quit India Movement', correct: false },
      { id: 'b', text: 'India\'s First War of Independence', correct: true },
      { id: 'c', text: 'The Partition Revolt', correct: false },
      { id: 'd', text: 'The Civil Disobedience Movement', correct: false },
    ],
    explanation: 'Many Indian historians call 1857 the First War of Independence because it was a large uprising against British rule.',
  },
  {
    id: 'h401_q2',
    type: 'MCQ',
    text: 'The revolt started among:',
    options: [
      { id: 'a', text: 'Indian farmers only', correct: false },
      { id: 'b', text: 'Sepoys (Indian soldiers) in the British army', correct: true },
      { id: 'c', text: 'British soldiers', correct: false },
      { id: 'd', text: 'School teachers', correct: false },
    ],
    explanation: 'The first sparks came from Indian sepoys, especially in Meerut, who refused to use cartridges greased with animal fat.',
  },
  {
    id: 'h401_q3',
    type: 'MCQ',
    text: 'Which queen famously led the revolt in Jhansi?',
    options: [
      { id: 'a', text: 'Razia Sultana', correct: false },
      { id: 'b', text: 'Rani Lakshmibai', correct: true },
      { id: 'c', text: 'Mumtaz Mahal', correct: false },
      { id: 'd', text: 'Nur Jahan', correct: false },
    ],
    explanation: 'Rani Lakshmibai of Jhansi became a symbol of brave resistance during 1857.',
  },
  {
    id: 'h401_q4',
    type: 'DESCRIPTIVE',
    text: 'Why did the Revolt of 1857 ultimately fail to overthrow the British?',
    rubricHint: 'Mention: (1) lacked central leadership, (2) not all regions joined, (3) British had better organisation and weapons.',
  },
  {
    id: 'h401_q5',
    type: 'DESCRIPTIVE',
    text: 'How did the Revolt of 1857 change British rule in India?',
    rubricHint: 'Mention: (1) end of East India Company rule, (2) Crown took direct control, (3) more careful policies after.',
  },
  {
    id: 'h401_q6',
    type: 'FEYNMAN',
    text: 'A friend says 1857 was "just a soldiers\' mutiny."\n\nExplain why many people see it as much bigger.',
    keyConcepts: ['soldiers + civilians', 'multiple regions', 'kings and farmers joined', 'national resentment'],
  },
];

export const QUESTIONS_h402: Question[] = [
  {
    id: 'h402_q1',
    type: 'MCQ',
    text: 'The Indian National Congress (INC) was founded in:',
    options: [
      { id: 'a', text: '1857', correct: false },
      { id: 'b', text: '1885', correct: true },
      { id: 'c', text: '1905', correct: false },
      { id: 'd', text: '1947', correct: false },
    ],
    explanation: 'The INC was founded in 1885 as a platform for educated Indians to discuss political issues with the British government.',
  },
  {
    id: 'h402_q2',
    type: 'MCQ',
    text: 'In its early years, the INC mostly asked the British for:',
    options: [
      { id: 'a', text: 'Immediate independence', correct: false },
      { id: 'b', text: 'Reforms and more Indian participation in government', correct: true },
      { id: 'c', text: 'War against Britain', correct: false },
      { id: 'd', text: 'A separate Hindu nation', correct: false },
    ],
    explanation: 'Early Congress leaders (moderates) wanted reforms — better representation, civil services access — not yet full independence.',
  },
  {
    id: 'h402_q3',
    type: 'MCQ',
    text: 'A.O. Hume, who helped start the INC, was:',
    options: [
      { id: 'a', text: 'An Indian poet', correct: false },
      { id: 'b', text: 'A retired British civil servant', correct: true },
      { id: 'c', text: 'A king', correct: false },
      { id: 'd', text: 'A military general', correct: false },
    ],
    explanation: 'A.O. Hume, a retired Briton sympathetic to Indians, played a key role in setting up the Congress.',
  },
  {
    id: 'h402_q4',
    type: 'DESCRIPTIVE',
    text: 'Why was the formation of the INC an important step for the independence movement?',
    rubricHint: 'Mention: (1) first all-India political platform, (2) educated Indians from many regions, (3) basis for later mass movements.',
  },
  {
    id: 'h402_q5',
    type: 'DESCRIPTIVE',
    text: 'How did Congress\'s demands change from 1885 to the 1920s?',
    rubricHint: 'Mention: (1) early = reforms within British rule, (2) later moderate-extremist split, (3) eventually demanded full independence.',
  },
  {
    id: 'h402_q6',
    type: 'FEYNMAN',
    text: 'A friend thinks the INC was always fighting for full independence.\n\nExplain how its goals changed over time.',
    keyConcepts: ['started moderate', 'reforms first', 'extremists pushed harder', 'Gandhi era = mass movement'],
  },
];

export const QUESTIONS_h403: Question[] = [
  {
    id: 'h403_q1',
    type: 'MCQ',
    text: 'The Partition of Bengal in 1905 was carried out by:',
    options: [
      { id: 'a', text: 'Lord Curzon', correct: true },
      { id: 'b', text: 'Mahatma Gandhi', correct: false },
      { id: 'c', text: 'Subhash Chandra Bose', correct: false },
      { id: 'd', text: 'Queen Victoria', correct: false },
    ],
    explanation: 'Lord Curzon, then British Viceroy, divided Bengal in 1905 — officially for administrative reasons, but widely seen as "divide and rule."',
  },
  {
    id: 'h403_q2',
    type: 'MCQ',
    text: 'The Swadeshi Movement called on Indians to:',
    options: [
      { id: 'a', text: 'Buy British goods', correct: false },
      { id: 'b', text: 'Use Indian-made goods and boycott British ones', correct: true },
      { id: 'c', text: 'Stop working entirely', correct: false },
      { id: 'd', text: 'Move to villages', correct: false },
    ],
    explanation: '"Swadeshi" means "of one\'s own country" — the movement urged people to use Indian goods and boycott British imports to hurt the colonial economy.',
  },
  {
    id: 'h403_q3',
    type: 'MCQ',
    text: 'Indians believed the real reason for Partition of Bengal was to:',
    options: [
      { id: 'a', text: 'Make administration easier', correct: false },
      { id: 'b', text: 'Divide Hindus and Muslims and weaken the nationalist movement', correct: true },
      { id: 'c', text: 'Help farmers', correct: false },
      { id: 'd', text: 'Reward INC leaders', correct: false },
    ],
    explanation: 'Indians saw it as "divide and rule" — separating Hindu-majority west Bengal from Muslim-majority east Bengal to weaken unity.',
  },
  {
    id: 'h403_q4',
    type: 'DESCRIPTIVE',
    text: 'How did the Swadeshi Movement strengthen Indian nationalism?',
    rubricHint: 'Mention: (1) brought masses into protest, (2) economic self-reliance idea, (3) showed power of boycott.',
  },
  {
    id: 'h403_q5',
    type: 'DESCRIPTIVE',
    text: 'Why was the Partition of Bengal eventually reversed in 1911?',
    rubricHint: 'Mention: (1) massive Indian opposition, (2) Swadeshi movement\'s pressure, (3) British wanted calm.',
  },
  {
    id: 'h403_q6',
    type: 'FEYNMAN',
    text: 'A friend thinks "boycotting goods" sounds weak compared to fighting.\n\nExplain why Swadeshi was actually a powerful weapon.',
    keyConcepts: ['hits British economy', 'massive participation', 'builds Indian industry', 'shows unity'],
  },
];

export const QUESTIONS_h404: Question[] = [
  {
    id: 'h404_q1',
    type: 'MCQ',
    text: 'The Non-Cooperation Movement was launched in 1920 by:',
    options: [
      { id: 'a', text: 'Bhagat Singh', correct: false },
      { id: 'b', text: 'Mahatma Gandhi', correct: true },
      { id: 'c', text: 'Jawaharlal Nehru', correct: false },
      { id: 'd', text: 'Subhash Chandra Bose', correct: false },
    ],
    explanation: 'Gandhi launched the Non-Cooperation Movement after the Jallianwala Bagh massacre and Khilafat issue, asking Indians to refuse to cooperate with British rule.',
  },
  {
    id: 'h404_q2',
    type: 'MCQ',
    text: 'What did "non-cooperation" mean in practice?',
    options: [
      { id: 'a', text: 'Attacking British soldiers', correct: false },
      { id: 'b', text: 'Boycotting British schools, courts, and goods peacefully', correct: true },
      { id: 'c', text: 'Setting fire to buildings', correct: false },
      { id: 'd', text: 'Hiding from British officers', correct: false },
    ],
    explanation: 'Non-cooperation meant peacefully refusing to participate in any British institution — schools, courts, councils, titles, and goods.',
  },
  {
    id: 'h404_q3',
    type: 'MCQ',
    text: 'The movement was called off after the violent incident at:',
    options: [
      { id: 'a', text: 'Jallianwala Bagh', correct: false },
      { id: 'b', text: 'Chauri Chaura (1922)', correct: true },
      { id: 'c', text: 'Dandi', correct: false },
      { id: 'd', text: 'Lahore', correct: false },
    ],
    explanation: 'At Chauri Chaura, a mob killed police officers. Gandhi called off the movement because it had turned violent.',
  },
  {
    id: 'h404_q4',
    type: 'DESCRIPTIVE',
    text: 'Why was the Non-Cooperation Movement a turning point in the freedom struggle?',
    rubricHint: 'Mention: (1) first mass movement led by Gandhi, (2) brought ordinary people in, (3) showed power of non-violent protest.',
  },
  {
    id: 'h404_q5',
    type: 'DESCRIPTIVE',
    text: 'Why did Gandhi call off the movement after Chauri Chaura?',
    rubricHint: 'Mention: (1) he insisted on non-violence, (2) violence undermined moral stand, (3) believed movement wasn\'t ready.',
  },
  {
    id: 'h404_q6',
    type: 'FEYNMAN',
    text: 'A friend doesn\'t understand how "doing nothing" could threaten the British.\n\nExplain how non-cooperation actually worked.',
    keyConcepts: ['British depended on Indian cooperation', 'no cooperation = no government', 'mass scale matters', 'moral pressure too'],
  },
];

export const QUESTIONS_h405: Question[] = [
  {
    id: 'h405_q1',
    type: 'MCQ',
    text: 'The Civil Disobedience Movement (1930) is most famously linked with the:',
    options: [
      { id: 'a', text: 'Quit India Resolution', correct: false },
      { id: 'b', text: 'Dandi (Salt) March', correct: true },
      { id: 'c', text: 'Round Table Conference', correct: false },
      { id: 'd', text: 'Cabinet Mission', correct: false },
    ],
    explanation: 'Gandhi started Civil Disobedience by marching to Dandi to make salt — defying the British salt law.',
  },
  {
    id: 'h405_q2',
    type: 'MCQ',
    text: 'Why did Gandhi choose the salt law to break?',
    options: [
      { id: 'a', text: 'Salt was expensive only for the rich', correct: false },
      { id: 'b', text: 'The salt tax affected every Indian, even the poorest, so it united people', correct: true },
      { id: 'c', text: 'British soldiers ate too much salt', correct: false },
      { id: 'd', text: 'It was Gandhi\'s favourite food', correct: false },
    ],
    explanation: 'Salt was used by everyone. Taxing such a basic item was an injustice every Indian could feel — a perfect symbol to challenge.',
  },
  {
    id: 'h405_q3',
    type: 'MCQ',
    text: 'How did the Civil Disobedience Movement spread?',
    options: [
      { id: 'a', text: 'Only through letters', correct: false },
      { id: 'b', text: 'Through nationwide breaking of laws like salt-making, no-tax campaigns, and boycotts', correct: true },
      { id: 'c', text: 'Only through legal court cases', correct: false },
      { id: 'd', text: 'Through prayers alone', correct: false },
    ],
    explanation: 'The movement spread across India as people broke unjust laws — making salt, refusing taxes, boycotting goods — non-violently.',
  },
  {
    id: 'h405_q4',
    type: 'DESCRIPTIVE',
    text: 'How was Civil Disobedience different from Non-Cooperation?',
    rubricHint: 'Mention: (1) Non-coop = refuse to participate, (2) Civil Disobedience = actively break unjust laws, (3) more direct challenge.',
  },
  {
    id: 'h405_q5',
    type: 'DESCRIPTIVE',
    text: 'Why is the Salt March considered such a brilliant act of protest?',
    rubricHint: 'Mention: (1) simple, symbolic, everyone could join, (2) non-violent yet defied law, (3) world attention.',
  },
  {
    id: 'h405_q6',
    type: 'FEYNMAN',
    text: 'A friend thinks "making salt" sounds silly as a protest.\n\nExplain why the Dandi March was actually deeply powerful.',
    keyConcepts: ['salt = basic right', 'tax hit everyone', 'mass participation', 'symbol of unjust rule'],
  },
];

export const QUESTIONS_h406: Question[] = [
  {
    id: 'h406_q1',
    type: 'MCQ',
    text: 'The Quit India Movement was launched in:',
    options: [
      { id: 'a', text: '1920', correct: false },
      { id: 'b', text: '1942', correct: true },
      { id: 'c', text: '1857', correct: false },
      { id: 'd', text: '1947', correct: false },
    ],
    explanation: 'Gandhi launched "Quit India" on 8 August 1942, demanding immediate British withdrawal.',
  },
  {
    id: 'h406_q2',
    type: 'MCQ',
    text: 'Gandhi\'s famous slogan during Quit India was:',
    options: [
      { id: 'a', text: '"Inquilab Zindabad"', correct: false },
      { id: 'b', text: '"Do or Die"', correct: true },
      { id: 'c', text: '"Jai Hind"', correct: false },
      { id: 'd', text: '"Vande Mataram" only', correct: false },
    ],
    explanation: 'Gandhi told the people: "Do or Die" — meaning either free India or die trying.',
  },
  {
    id: 'h406_q3',
    type: 'MCQ',
    text: 'What did the British do almost immediately after Quit India began?',
    options: [
      { id: 'a', text: 'Agreed to leave', correct: false },
      { id: 'b', text: 'Arrested most Congress leaders', correct: true },
      { id: 'c', text: 'Resigned voluntarily', correct: false },
      { id: 'd', text: 'Asked Gandhi to rule', correct: false },
    ],
    explanation: 'Almost all top Congress leaders, including Gandhi, were arrested within hours of the launch.',
  },
  {
    id: 'h406_q4',
    type: 'DESCRIPTIVE',
    text: 'Why was the Quit India Movement so important even though it was suppressed?',
    rubricHint: 'Mention: (1) showed British rule was impossible to sustain, (2) massive mass participation, (3) sped up independence after WW2.',
  },
  {
    id: 'h406_q5',
    type: 'DESCRIPTIVE',
    text: 'How did World War II affect the timing of Quit India?',
    rubricHint: 'Mention: (1) Britain was at war, weakened, (2) demanded Indian soldiers and money, (3) Indians saw the moment to push.',
  },
  {
    id: 'h406_q6',
    type: 'FEYNMAN',
    text: 'A friend thinks Quit India failed because leaders were jailed.\n\nExplain why historians often see it as a turning point anyway.',
    keyConcepts: ['ordinary people kept it going', 'showed unstoppable will', 'British realised rule was over', 'led to 1947'],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// GEOGRAPHY — Class 6 CBSE
// ═══════════════════════════════════════════════════════════════════════════

// ─── geo_ch1: Maps & Globe Skills ──────────────────────────────────────────

export const QUESTIONS_g101: Question[] = [
  {
    id: 'g101_q1',
    type: 'MCQ',
    text: 'The line at 0° latitude is called the:',
    options: [
      { id: 'a', text: 'Prime Meridian', correct: false },
      { id: 'b', text: 'Equator', correct: true },
      { id: 'c', text: 'Tropic of Cancer', correct: false },
      { id: 'd', text: 'Arctic Circle', correct: false },
    ],
    explanation: 'The Equator runs horizontally around the middle of Earth and marks 0° latitude.',
  },
  {
    id: 'g101_q2',
    type: 'DESCRIPTIVE',
    text: 'How do latitude and longitude together let us find any place on Earth?',
    rubricHint: 'Mention: (1) latitude = north-south, (2) longitude = east-west, (3) crossing point pinpoints a location.',
  },
  {
    id: 'g101_q3',
    type: 'FEYNMAN',
    text: 'A friend mixes up latitude and longitude.\n\nExplain a simple memory trick and the difference between them.',
    keyConcepts: ['lat = horizontal lines', 'long = vertical lines', 'lat measures N/S', 'long measures E/W'],
  },
  {
    id: 'g101_q4',
    type: 'BLURT',
    text: 'Latitude & longitude',
  },
  {
    id: 'g101_q5',
    type: 'ACTIVE_RECALL',
    text: 'A ship\'s radio gives its position as 23°N, 72°E.\n\nUsing what you know about latitude and longitude, describe roughly where that is and how the numbers tell you.',
  },
];

export const QUESTIONS_g102: Question[] = [
  {
    id: 'g102_q1',
    type: 'MCQ',
    text: 'On a map, blue usually represents:',
    options: [
      { id: 'a', text: 'Mountains', correct: false },
      { id: 'b', text: 'Water bodies', correct: true },
      { id: 'c', text: 'Roads', correct: false },
      { id: 'd', text: 'Cities', correct: false },
    ],
    explanation: 'Standard map colour conventions use blue for rivers, lakes, and seas.',
  },
  {
    id: 'g102_q2',
    type: 'DESCRIPTIVE',
    text: 'Why do mapmakers use standard symbols instead of writing everything in words?',
    rubricHint: 'Mention: (1) saves space on the map, (2) understood across languages, (3) easier to read at a glance.',
  },
  {
    id: 'g102_q3',
    type: 'FEYNMAN',
    text: 'A friend looks at a map and asks: "What\'s the point of the little symbols?"\n\nExplain how a map\'s legend (key) makes symbols universal.',
    keyConcepts: ['legend explains symbols', 'compact info', 'standard conventions', 'cross-language'],
  },
  {
    id: 'g102_q4',
    type: 'BLURT',
    text: 'Map symbols',
  },
  {
    id: 'g102_q5',
    type: 'ACTIVE_RECALL',
    text: 'You\'re using a hiking map and see a small triangle with a dot in the middle.\n\nWhat do you do to figure out what it means, and why is this approach reliable?',
  },
];

export const QUESTIONS_g103: Question[] = [
  {
    id: 'g103_q1',
    type: 'MCQ',
    text: 'A map scale of 1 cm = 100 km tells you:',
    options: [
      { id: 'a', text: 'The map is 100 km wide', correct: false },
      { id: 'b', text: '1 cm on the map equals 100 km on the ground', correct: true },
      { id: 'c', text: 'The map is at sea level', correct: false },
      { id: 'd', text: 'There are 100 km of roads', correct: false },
    ],
    explanation: 'A scale tells you how distances on the map relate to real distances on the ground.',
  },
  {
    id: 'g103_q2',
    type: 'DESCRIPTIVE',
    text: 'Why do small-scale maps show more area but less detail than large-scale maps?',
    rubricHint: 'Mention: (1) small scale = "zoomed out", (2) huge area squeezed in, (3) details have to be left out.',
  },
  {
    id: 'g103_q3',
    type: 'FEYNMAN',
    text: 'A friend can\'t tell if a map\'s scale is "large" or "small."\n\nExplain a quick way to think about it.',
    keyConcepts: ['large scale = small area, more detail', 'small scale = big area, less detail', 'ratio explanation', 'zoom analogy'],
  },
  {
    id: 'g103_q4',
    type: 'BLURT',
    text: 'Scale & distance',
  },
  {
    id: 'g103_q5',
    type: 'ACTIVE_RECALL',
    text: 'You measure 4.5 cm between two cities on a map with scale 1 cm = 50 km.\n\nCalculate the real distance and explain your steps.',
  },
];

export const QUESTIONS_g104: Question[] = [
  {
    id: 'g104_q1',
    type: 'MCQ',
    text: 'Contour lines on a map show:',
    options: [
      { id: 'a', text: 'Boundaries between countries', correct: false },
      { id: 'b', text: 'Lines of equal elevation (height)', correct: true },
      { id: 'c', text: 'Train tracks', correct: false },
      { id: 'd', text: 'Roads', correct: false },
    ],
    explanation: 'A contour line connects points at the same height above sea level. Closely spaced lines = steep slope.',
  },
  {
    id: 'g104_q2',
    type: 'DESCRIPTIVE',
    text: 'How can you tell if a hillside is steep or gentle just from the contour lines?',
    rubricHint: 'Mention: (1) close lines = steep, (2) far apart = gentle, (3) circles around a peak.',
  },
  {
    id: 'g104_q3',
    type: 'FEYNMAN',
    text: 'A friend looks at a contour map and only sees "weird wavy lines."\n\nExplain how those lines secretly tell you the shape of the land.',
    keyConcepts: ['same height = same line', 'spacing = slope', 'rings = hills', 'V-shapes = valleys'],
  },
  {
    id: 'g104_q4',
    type: 'BLURT',
    text: 'Contour lines',
  },
  {
    id: 'g104_q5',
    type: 'ACTIVE_RECALL',
    text: 'You see a contour map where many lines bunch together on one side and spread out on the other.\n\nWhat does this tell you about the terrain, and which side would be harder to climb?',
  },
];

export const QUESTIONS_g105: Question[] = [
  {
    id: 'g105_q1',
    type: 'MCQ',
    text: 'The four cardinal directions are:',
    options: [
      { id: 'a', text: 'Up, down, left, right', correct: false },
      { id: 'b', text: 'North, South, East, West', correct: true },
      { id: 'c', text: 'Front, back, side, top', correct: false },
      { id: 'd', text: 'Hot, cold, wet, dry', correct: false },
    ],
    explanation: 'Cardinal directions are the four main compass directions: N, S, E, W.',
  },
  {
    id: 'g105_q2',
    type: 'DESCRIPTIVE',
    text: 'How can you use the rising and setting sun to figure out direction without a compass?',
    rubricHint: 'Mention: (1) sun rises in the east, (2) sets in the west, (3) noon shadow points roughly north/south.',
  },
  {
    id: 'g105_q3',
    type: 'FEYNMAN',
    text: 'A friend gets lost in a forest and has no map or phone.\n\nUsing cardinal directions and the sun, explain how they could try to find their way out.',
    keyConcepts: ['sun rises east', 'sun sets west', 'midday shadow', 'pick a steady direction'],
  },
  {
    id: 'g105_q4',
    type: 'BLURT',
    text: 'Cardinal directions',
  },
  {
    id: 'g105_q5',
    type: 'ACTIVE_RECALL',
    text: 'You\'re standing on a beach watching the sun set straight over the sea.\n\nWhich direction are you facing, and how do you know?',
  },
];

export const QUESTIONS_g106: Question[] = [
  {
    id: 'g106_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Time zones are based on lines of:',
    options: [
      { id: 'a', text: 'Latitude', correct: false },
      { id: 'b', text: 'Longitude', correct: true },
      { id: 'c', text: 'Equator', correct: false },
      { id: 'd', text: 'Tropic of Cancer', correct: false },
    ],
    explanation: 'Earth rotates west to east. Each 15° of longitude roughly = 1 hour difference.',
  },
  {
    id: 'g106_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'When it\'s noon in London (Greenwich), what time is it in India (about 5.5 hours ahead)?',
    options: [
      { id: 'a', text: '12:00 noon', correct: false },
      { id: 'b', text: '5:30 PM (17:30)', correct: true },
      { id: 'c', text: '6:30 AM', correct: false },
      { id: 'd', text: '11:30 PM', correct: false },
    ],
    explanation: 'India is GMT +5:30, so when London is at 12:00 noon, India is at 17:30 (5:30 PM).',
  },
  {
    id: 'g106_q3',
    type: 'DESCRIPTIVE',
    text: 'Why does India have a single time zone even though it stretches over many degrees of longitude?',
    rubricHint: 'Mention: (1) keeps things simple, (2) avoids confusion across one country, (3) trade-off with east/west sunlight times.',
  },
  {
    id: 'g106_q4',
    type: 'FEYNMAN',
    text: 'A friend doesn\'t get why time changes when you fly across countries.\n\nExplain using Earth\'s rotation and longitude lines.',
    keyConcepts: ['Earth rotates', 'sun rises at different times', 'longitude divides into 24 zones', '15° ≈ 1 hour'],
  },
  {
    id: 'g106_q5',
    type: 'BLURT',
    text: 'Time zones',
  },
  {
    id: 'g106_q6',
    type: 'ACTIVE_RECALL',
    text: 'You call a cousin in New York at 8 PM India time. They sound sleepy.\n\nUsing time zones, explain why — and roughly what time it is for them.',
  },
];

// ─── geo_ch2: Latitude & Climate ───────────────────────────────────────────

export const QUESTIONS_g201: Question[] = [
  {
    id: 'g201_q1',
    type: 'MCQ',
    text: 'The hottest climate zones on Earth lie around the:',
    options: [
      { id: 'a', text: 'Poles', correct: false },
      { id: 'b', text: 'Equator', correct: true },
      { id: 'c', text: 'Tropic of Capricorn only', correct: false },
      { id: 'd', text: 'Arctic Circle', correct: false },
    ],
    explanation: 'Near the equator, sunlight hits Earth most directly, so this region is warmest.',
  },
  {
    id: 'g201_q2',
    type: 'DESCRIPTIVE',
    text: 'How does latitude affect a place\'s climate?',
    rubricHint: 'Mention: (1) angle of sunlight changes with latitude, (2) near equator = warm, (3) near poles = cold, (4) middle = temperate.',
  },
  {
    id: 'g201_q3',
    type: 'FEYNMAN',
    text: 'A friend asks: "Why isn\'t every place at the same temperature?"\n\nExplain using latitude and the angle of the sun.',
    keyConcepts: ['direct vs slanted sunlight', 'equator = most direct', 'poles = most slanted', 'energy spread out at higher latitudes'],
  },
  {
    id: 'g201_q4',
    type: 'BLURT',
    text: 'Climate zones & latitude',
  },
  {
    id: 'g201_q5',
    type: 'ACTIVE_RECALL',
    text: 'You\'re shown two cities at the same height above sea level. One is at 5°N, the other at 65°N.\n\nUsing latitude and climate, predict the temperature difference and explain.',
  },
];

export const QUESTIONS_g202: Question[] = [
  {
    id: 'g202_q1',
    type: 'MCQ',
    text: 'The Indian monsoon mainly brings rain to India from:',
    options: [
      { id: 'a', text: 'November to January', correct: false },
      { id: 'b', text: 'June to September (southwest monsoon)', correct: true },
      { id: 'c', text: 'February to May', correct: false },
      { id: 'd', text: 'All year evenly', correct: false },
    ],
    explanation: 'The southwest monsoon, between June and September, brings most of India\'s annual rainfall.',
  },
  {
    id: 'g202_q2',
    type: 'DESCRIPTIVE',
    text: 'Why is the monsoon so important for India\'s farming?',
    rubricHint: 'Mention: (1) most agriculture depends on rain, (2) timing affects crops, (3) good monsoon = good harvest.',
  },
  {
    id: 'g202_q3',
    type: 'FEYNMAN',
    text: 'A friend wonders why India has such heavy rains in summer.\n\nExplain monsoons in plain words.',
    keyConcepts: ['land heats faster than sea', 'wind blows from sea to land', 'carries moisture', 'rains over land'],
  },
  {
    id: 'g202_q4',
    type: 'BLURT',
    text: 'Monsoon patterns',
  },
  {
    id: 'g202_q5',
    type: 'ACTIVE_RECALL',
    text: 'A weather forecaster predicts a weak monsoon this year.\n\nUsing what you know, explain two consequences this could have for India.',
  },
];

export const QUESTIONS_g203: Question[] = [
  {
    id: 'g203_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Tropical rainforests are found mostly near the:',
    options: [
      { id: 'a', text: 'Polar regions', correct: false },
      { id: 'b', text: 'Equator', correct: true },
      { id: 'c', text: 'High mountains only', correct: false },
      { id: 'd', text: 'Deserts', correct: false },
    ],
    explanation: 'Heavy rain and warm temperatures near the equator make tropical rainforests possible.',
  },
  {
    id: 'g203_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Why are tropical rainforests so rich in biodiversity?',
    options: [
      { id: 'a', text: 'They\'re cold and dry', correct: false },
      { id: 'b', text: 'Constant warmth, rain, and sunlight all year support many species', correct: true },
      { id: 'c', text: 'They have no insects', correct: false },
      { id: 'd', text: 'They\'re very small', correct: false },
    ],
    explanation: 'Year-round warmth, rain, and sunlight create ideal conditions for an enormous variety of plants and animals.',
  },
  {
    id: 'g203_q3',
    type: 'DESCRIPTIVE',
    text: 'How is the structure of a rainforest like a multi-storey building?',
    rubricHint: 'Mention: (1) emergent giants on top, (2) canopy middle, (3) understorey, (4) forest floor — each home to different life.',
  },
  {
    id: 'g203_q4',
    type: 'FEYNMAN',
    text: 'A friend asks why rainforests are called the "lungs of the Earth."\n\nExplain in plain words.',
    keyConcepts: ['huge oxygen producers', 'absorb CO₂', 'enormous plant biomass', 'climate impact'],
  },
  {
    id: 'g203_q5',
    type: 'BLURT',
    text: 'Tropical rainforests',
  },
  {
    id: 'g203_q6',
    type: 'ACTIVE_RECALL',
    text: 'A scientist warns that cutting down rainforests harms the whole planet, not just local people.\n\nUsing what you know, explain why this is true.',
  },
];

export const QUESTIONS_g204: Question[] = [
  {
    id: 'g204_q1',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'Temperate grasslands are best described as:',
    options: [
      { id: 'a', text: 'Dense rainforests', correct: false },
      { id: 'b', text: 'Open flat lands dominated by grasses with few trees', correct: true },
      { id: 'c', text: 'Hot deserts', correct: false },
      { id: 'd', text: 'Frozen tundra', correct: false },
    ],
    explanation: 'Temperate grasslands (prairies, steppes, pampas) are wide flat areas of grasses, with too little rain for many trees.',
  },
  {
    id: 'g204_q2',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'The North American grasslands are called:',
    options: [
      { id: 'a', text: 'Steppes', correct: false },
      { id: 'b', text: 'Prairies', correct: true },
      { id: 'c', text: 'Pampas', correct: false },
      { id: 'd', text: 'Veld', correct: false },
    ],
    explanation: 'The North American grassland region is called the prairies; steppes are in Eurasia, pampas in South America.',
  },
  {
    id: 'g204_q3',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'Why are temperate grasslands ideal for growing wheat and grazing cattle?',
    rubricHint: 'Mention: (1) flat land, (2) fertile soil from grass roots, (3) moderate rainfall, (4) open space for herds.',
  },
  {
    id: 'g204_q4',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'How do temperate grasslands differ from tropical grasslands (savannas)?',
    rubricHint: 'Mention: (1) temperate = cooler, more even climate, (2) savannas = warmer, more trees, (3) different animals.',
  },
  {
    id: 'g204_q5',
    type: 'FEYNMAN',
    text: 'A friend thinks "grasslands" are just empty flat fields.\n\nExplain why they\'re actually vital ecosystems.',
    keyConcepts: ['rich soil', 'huge animal herds', 'breadbasket of the world', 'support food chains'],
  },
  {
    id: 'g204_q6',
    type: 'BLURT',
    text: 'Temperate grasslands',
  },
];

export const QUESTIONS_g205: Question[] = [
  {
    id: 'g205_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Desert climates are mainly characterised by:',
    options: [
      { id: 'a', text: 'Heavy rainfall', correct: false },
      { id: 'b', text: 'Very low rainfall', correct: true },
      { id: 'c', text: 'Constant snow', correct: false },
      { id: 'd', text: 'Tropical humidity', correct: false },
    ],
    explanation: 'Deserts are defined by little rainfall (usually less than 25 cm/year), not by being hot — some deserts are cold.',
  },
  {
    id: 'g205_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Are all deserts hot?',
    options: [
      { id: 'a', text: 'Yes, deserts are always hot', correct: false },
      { id: 'b', text: 'No, some deserts (like the Gobi or Antarctica) are cold', correct: true },
      { id: 'c', text: 'Only at night', correct: false },
      { id: 'd', text: 'Only in summer', correct: false },
    ],
    explanation: 'A desert is defined by low rainfall. Antarctica is technically a cold desert; the Gobi has bitterly cold winters.',
  },
  {
    id: 'g205_q3',
    type: 'DESCRIPTIVE',
    text: 'How do desert plants and animals survive with so little water?',
    rubricHint: 'Mention: (1) special adaptations (deep roots, water storage), (2) active at night, (3) thick skins, water-saving habits.',
  },
  {
    id: 'g205_q4',
    type: 'FEYNMAN',
    text: 'A friend insists Antarctica can\'t be a desert because it\'s freezing.\n\nExplain why scientists actually call it one.',
    keyConcepts: ['desert = low rainfall', 'temperature doesn\'t matter', 'Antarctica very dry', 'cold desert'],
  },
  {
    id: 'g205_q5',
    type: 'BLURT',
    text: 'Desert climates',
  },
  {
    id: 'g205_q6',
    type: 'ACTIVE_RECALL',
    text: 'A traveller describes a place that\'s freezing cold, snow-covered, but receives almost no precipitation each year.\n\nWhat kind of climate is this, and why?',
  },
];

export const QUESTIONS_g206: Question[] = [
  {
    id: 'g206_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'The polar regions are characterised by:',
    options: [
      { id: 'a', text: 'Year-round heavy rain', correct: false },
      { id: 'b', text: 'Extreme cold and ice cover', correct: true },
      { id: 'c', text: 'Dense rainforests', correct: false },
      { id: 'd', text: 'Hot deserts', correct: false },
    ],
    explanation: 'Both poles are extremely cold, with ice sheets covering most of the land/sea.',
  },
  {
    id: 'g206_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Why is the Arctic warming faster than other parts of the Earth?',
    options: [
      { id: 'a', text: 'It receives more sunlight', correct: false },
      { id: 'b', text: 'Melting ice reflects less heat, exposing dark sea that absorbs more', correct: true },
      { id: 'c', text: 'There are too many people there', correct: false },
      { id: 'd', text: 'Wind blows hot air there', correct: false },
    ],
    explanation: 'Ice reflects sunlight; as it melts, dark water absorbs more heat — speeding warming further (a feedback loop).',
  },
  {
    id: 'g206_q3',
    type: 'DESCRIPTIVE',
    text: 'How do animals like polar bears and penguins survive in polar climates?',
    rubricHint: 'Mention: (1) thick fur/blubber for insulation, (2) special diet (fish, seals), (3) behaviour like huddling.',
  },
  {
    id: 'g206_q4',
    type: 'FEYNMAN',
    text: 'A friend asks if polar bears and penguins ever meet in the wild.\n\nExplain why they don\'t.',
    keyConcepts: ['polar bears = Arctic (north)', 'penguins = Antarctic (south)', 'opposite poles', 'never naturally meet'],
  },
  {
    id: 'g206_q5',
    type: 'BLURT',
    text: 'Polar regions',
  },
  {
    id: 'g206_q6',
    type: 'ACTIVE_RECALL',
    text: 'A research team in Antarctica reports unusual numbers of icebergs breaking off.\n\nUsing what you know about polar regions, explain what this might suggest and why it matters.',
  },
];

export const QUESTIONS_g207: Question[] = [
  {
    id: 'g207_q1',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'Which is a major cause of human-driven climate change?',
    options: [
      { id: 'a', text: 'Birds migrating', correct: false },
      { id: 'b', text: 'Burning fossil fuels (coal, oil, gas)', correct: true },
      { id: 'c', text: 'Eating more vegetables', correct: false },
      { id: 'd', text: 'Rain falling', correct: false },
    ],
    explanation: 'Burning coal, oil, and gas releases huge amounts of CO₂, a greenhouse gas that traps heat in the atmosphere.',
  },
  {
    id: 'g207_q2',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'How does cutting down forests worsen climate change?',
    options: [
      { id: 'a', text: 'It makes the soil colder', correct: false },
      { id: 'b', text: 'It removes trees that absorb CO₂', correct: true },
      { id: 'c', text: 'It cools the ground', correct: false },
      { id: 'd', text: 'It makes wind disappear', correct: false },
    ],
    explanation: 'Trees absorb CO₂ through photosynthesis. Fewer trees = more CO₂ stays in air = more warming.',
  },
  {
    id: 'g207_q3',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'How do human activities affect climate, even though weather changes naturally too?',
    rubricHint: 'Mention: (1) burning fuels add CO₂, (2) deforestation removes natural CO₂ absorbers, (3) speed of change is faster than natural cycles.',
  },
  {
    id: 'g207_q4',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'What are some realistic steps a school can take to reduce its climate impact?',
    rubricHint: 'Mention: (1) reduce waste, (2) save electricity, (3) plant trees, (4) walk/cycle/use public transport.',
  },
  {
    id: 'g207_q5',
    type: 'FEYNMAN',
    text: 'A friend says: "Climate has always changed, so why worry now?"\n\nExplain what\'s different about today\'s climate change.',
    keyConcepts: ['speed of change', 'human cause', 'CO₂ rise unmatched in history', 'big impact on people and nature'],
  },
  {
    id: 'g207_q6',
    type: 'BLURT',
    text: 'Human impact on climate',
  },
];

// ─── geo_ch3: India — Physical Features ────────────────────────────────────

export const QUESTIONS_g301: Question[] = [
  {
    id: 'g301_q1',
    type: 'MCQ',
    text: 'The Himalayas were formed by:',
    options: [
      { id: 'a', text: 'A meteor strike', correct: false },
      { id: 'b', text: 'The Indian plate colliding with the Eurasian plate', correct: true },
      { id: 'c', text: 'A volcano', correct: false },
      { id: 'd', text: 'Wind erosion', correct: false },
    ],
    explanation: 'About 50 million years ago, the Indian plate began pushing into the Eurasian plate, crumpling the land upward into the Himalayas — which are still rising slightly today.',
  },
  {
    id: 'g301_q2',
    type: 'DESCRIPTIVE',
    text: 'Why are the Himalayas important for India\'s rivers and climate?',
    rubricHint: 'Mention: (1) source of major rivers (Ganga, Brahmaputra), (2) block cold winds from north, (3) influence monsoon rainfall.',
  },
  {
    id: 'g301_q3',
    type: 'FEYNMAN',
    text: 'A friend asks: "Why is Everest still getting taller?"\n\nExplain using plate tectonics.',
    keyConcepts: ['Indian plate still moves north', 'pushes into Eurasian plate', 'mountains keep rising', 'though slowly'],
  },
  {
    id: 'g301_q4',
    type: 'BLURT',
    text: 'Himalayan mountain system',
  },
  {
    id: 'g301_q5',
    type: 'ACTIVE_RECALL',
    text: 'A geologist says India\'s northern mountains will keep growing for millions of years.\n\nUsing what you know about how the Himalayas formed, explain why she\'s right.',
  },
];

export const QUESTIONS_g302: Question[] = [
  {
    id: 'g302_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'The Northern Plains of India are formed by:',
    options: [
      { id: 'a', text: 'Volcanic eruptions', correct: false },
      { id: 'b', text: 'Sediments deposited by the Ganga, Brahmaputra, and Indus rivers', correct: true },
      { id: 'c', text: 'Glacier movement only', correct: false },
      { id: 'd', text: 'Wind blowing sand', correct: false },
    ],
    explanation: 'Centuries of river sediment (alluvium) built up the fertile flat Northern Plains.',
  },
  {
    id: 'g302_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Why are the Northern Plains India\'s most agriculturally rich region?',
    options: [
      { id: 'a', text: 'They\'re hilly', correct: false },
      { id: 'b', text: 'Fertile alluvial soil, plenty of water, flat land', correct: true },
      { id: 'c', text: 'They\'re mostly desert', correct: false },
      { id: 'd', text: 'They\'re too cold for crops', correct: false },
    ],
    explanation: 'Rich river-deposited soil, year-round water, and flat land = a farmer\'s paradise.',
  },
  {
    id: 'g302_q3',
    type: 'DESCRIPTIVE',
    text: 'How do rivers create such fertile plains over thousands of years?',
    rubricHint: 'Mention: (1) erode rocks upstream, (2) carry tiny soil particles, (3) deposit during floods, (4) build up fertile alluvium.',
  },
  {
    id: 'g302_q4',
    type: 'FEYNMAN',
    text: 'A friend thinks "flat land" is boring.\n\nExplain why the Northern Plains are one of the most important regions of India.',
    keyConcepts: ['feeds millions', 'historical heartland', 'fertile soil', 'major cities and culture'],
  },
  {
    id: 'g302_q5',
    type: 'BLURT',
    text: 'Northern plains',
  },
  {
    id: 'g302_q6',
    type: 'ACTIVE_RECALL',
    text: 'A new dam upstream traps most river sediment before it reaches the plains.\n\nUsing what you know, explain how this might affect farming downstream over time.',
  },
];

export const QUESTIONS_g303: Question[] = [
  {
    id: 'g303_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'The Deccan Plateau is mainly made up of:',
    options: [
      { id: 'a', text: 'Sand dunes', correct: false },
      { id: 'b', text: 'Volcanic rocks (basalt)', correct: true },
      { id: 'c', text: 'Glacier ice', correct: false },
      { id: 'd', text: 'Coral reefs', correct: false },
    ],
    explanation: 'Massive ancient volcanic eruptions covered the Deccan in basalt rock — the famous "Deccan Traps."',
  },
  {
    id: 'g303_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Which two mountain ranges border the Deccan Plateau?',
    options: [
      { id: 'a', text: 'Himalayas and Aravallis', correct: false },
      { id: 'b', text: 'Western Ghats and Eastern Ghats', correct: true },
      { id: 'c', text: 'Karakoram and Pir Panjal', correct: false },
      { id: 'd', text: 'Vindhya and Satpura only', correct: false },
    ],
    explanation: 'The Western and Eastern Ghats form the western and eastern edges of the Deccan Plateau.',
  },
  {
    id: 'g303_q3',
    type: 'DESCRIPTIVE',
    text: 'Why are the soils of the Deccan known to be good for cotton?',
    rubricHint: 'Mention: (1) volcanic origin → black soil, (2) holds moisture well, (3) ideal for cotton, (4) called "regur."',
  },
  {
    id: 'g303_q4',
    type: 'FEYNMAN',
    text: 'A friend thinks plateaus are just "tall flat places."\n\nExplain why the Deccan is special and how it formed.',
    keyConcepts: ['ancient volcanic eruptions', 'basalt rock', 'black soil', 'old, stable landmass'],
  },
  {
    id: 'g303_q5',
    type: 'BLURT',
    text: 'Deccan plateau',
  },
  {
    id: 'g303_q6',
    type: 'ACTIVE_RECALL',
    text: 'A farmer wants to grow cotton in a new state.\n\nUsing what you know about Deccan soils, suggest where in India would be ideal and why.',
  },
];

export const QUESTIONS_g304: Question[] = [
  {
    id: 'g304_q1',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'India has two coastal plains — they lie along the:',
    options: [
      { id: 'a', text: 'Northern borders', correct: false },
      { id: 'b', text: 'Arabian Sea (west) and Bay of Bengal (east)', correct: true },
      { id: 'c', text: 'Both inside the Deccan', correct: false },
      { id: 'd', text: 'Only the Indian Ocean', correct: false },
    ],
    explanation: 'India has the Western Coastal Plain (along the Arabian Sea) and Eastern Coastal Plain (along the Bay of Bengal).',
  },
  {
    id: 'g304_q2',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'Which coastal plain is generally wider?',
    options: [
      { id: 'a', text: 'Western', correct: false },
      { id: 'b', text: 'Eastern', correct: true },
      { id: 'c', text: 'Both are equal', correct: false },
      { id: 'd', text: 'Neither has plains', correct: false },
    ],
    explanation: 'The Eastern Coastal Plain is wider, especially in the deltas of the Mahanadi, Godavari, Krishna, and Kaveri.',
  },
  {
    id: 'g304_q3',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'Why are the coastal plains important for trade and farming?',
    rubricHint: 'Mention: (1) major ports for trade, (2) fertile river deltas for rice, (3) fishing economies.',
  },
  {
    id: 'g304_q4',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'How are the Western and Eastern coastal plains different?',
    rubricHint: 'Mention: (1) west = narrower, mountains close, (2) east = wider, big deltas, (3) different river patterns.',
  },
  {
    id: 'g304_q5',
    type: 'FEYNMAN',
    text: 'A friend thinks all coastlines look the same.\n\nExplain how India\'s east and west coasts feel very different.',
    keyConcepts: ['narrow west coast', 'broad east coast', 'big rivers + deltas in east', 'different climates'],
  },
  {
    id: 'g304_q6',
    type: 'BLURT',
    text: 'Coastal plains',
  },
];

export const QUESTIONS_g305: Question[] = [
  {
    id: 'g305_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'The Thar Desert lies mostly in which Indian state?',
    options: [
      { id: 'a', text: 'Kerala', correct: false },
      { id: 'b', text: 'Rajasthan', correct: true },
      { id: 'c', text: 'Assam', correct: false },
      { id: 'd', text: 'West Bengal', correct: false },
    ],
    explanation: 'The Thar Desert covers most of western Rajasthan and extends into parts of Gujarat, Pakistan.',
  },
  {
    id: 'g305_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'How do people in the Thar adapt to the harsh climate?',
    options: [
      { id: 'a', text: 'They live in underground tunnels', correct: false },
      { id: 'b', text: 'They use camels, store water in tanks, build thick-walled houses', correct: true },
      { id: 'c', text: 'They migrate to Antarctica', correct: false },
      { id: 'd', text: 'They never go outdoors', correct: false },
    ],
    explanation: 'Locals use camels for transport, store monsoon water in tanks (tankas), and build thick-walled houses that stay cool.',
  },
  {
    id: 'g305_q3',
    type: 'DESCRIPTIVE',
    text: 'How is life in a desert region different from life in a coastal region of India?',
    rubricHint: 'Mention: (1) water scarcity, (2) housing styles, (3) food and crops, (4) work and transport differ.',
  },
  {
    id: 'g305_q4',
    type: 'FEYNMAN',
    text: 'A friend assumes the Thar is "lifeless."\n\nExplain how plants, animals, and people thrive there.',
    keyConcepts: ['camels, deer', 'cactus and thorny plants', 'cultural adaptations', 'water harvesting'],
  },
  {
    id: 'g305_q5',
    type: 'BLURT',
    text: 'Indian deserts (Thar)',
  },
  {
    id: 'g305_q6',
    type: 'ACTIVE_RECALL',
    text: 'A city in another desert country wants to learn how to store rainwater.\n\nUsing Thar examples, suggest two ideas they could try.',
  },
];

export const QUESTIONS_g306: Question[] = [
  {
    id: 'g306_q1',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'The Andaman and Nicobar Islands are in which sea/ocean?',
    options: [
      { id: 'a', text: 'Arabian Sea', correct: false },
      { id: 'b', text: 'Bay of Bengal', correct: true },
      { id: 'c', text: 'Atlantic Ocean', correct: false },
      { id: 'd', text: 'Mediterranean Sea', correct: false },
    ],
    explanation: 'The Andaman and Nicobar Islands lie in the Bay of Bengal, east of mainland India.',
  },
  {
    id: 'g306_q2',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'The Lakshadweep Islands are made of:',
    options: [
      { id: 'a', text: 'Volcanic rock', correct: false },
      { id: 'b', text: 'Coral reefs (atolls)', correct: true },
      { id: 'c', text: 'Sand dunes', correct: false },
      { id: 'd', text: 'Granite', correct: false },
    ],
    explanation: 'Lakshadweep is a group of coral atolls in the Arabian Sea — tiny low-lying islands built by coral.',
  },
  {
    id: 'g306_q3',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'Why are India\'s islands important even though they\'re small?',
    rubricHint: 'Mention: (1) strategic for sea routes, (2) rich biodiversity, (3) tourism, (4) extend India\'s sea area.',
  },
  {
    id: 'g306_q4',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'How are Andaman & Nicobar different from Lakshadweep?',
    rubricHint: 'Mention: (1) different seas, (2) volcanic/sedimentary vs coral, (3) larger forests vs tiny atolls, (4) different cultures.',
  },
  {
    id: 'g306_q5',
    type: 'FEYNMAN',
    text: 'A friend thinks all "islands" are basically the same.\n\nExplain why India\'s two island groups are very different.',
    keyConcepts: ['different oceans', 'different origins', 'different sizes', 'different biodiversity'],
  },
  {
    id: 'g306_q6',
    type: 'BLURT',
    text: 'Islands — Andaman & Lakshadweep',
  },
];

export const QUESTIONS_g307: Question[] = [
  {
    id: 'g307_q1',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'Which soil is best for growing cotton in India?',
    options: [
      { id: 'a', text: 'Sandy desert soil', correct: false },
      { id: 'b', text: 'Black (regur) soil of the Deccan', correct: true },
      { id: 'c', text: 'Red soil only', correct: false },
      { id: 'd', text: 'Snow', correct: false },
    ],
    explanation: 'Black soil (regur) of the Deccan retains moisture well — making it ideal for cotton.',
  },
  {
    id: 'g307_q2',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'Alluvial soil is most common in:',
    options: [
      { id: 'a', text: 'Deserts', correct: false },
      { id: 'b', text: 'The Northern Plains', correct: true },
      { id: 'c', text: 'High Himalayas', correct: false },
      { id: 'd', text: 'Coastal deserts only', correct: false },
    ],
    explanation: 'Alluvial soil is deposited by rivers and covers the fertile Northern Plains — perfect for crops like wheat and rice.',
  },
  {
    id: 'g307_q3',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'Why does red soil get its colour?',
    options: [
      { id: 'a', text: 'Painted by farmers', correct: false },
      { id: 'b', text: 'Iron oxides (rust-like) in the soil', correct: true },
      { id: 'c', text: 'Volcanic ash', correct: false },
      { id: 'd', text: 'Coal dust', correct: false },
    ],
    explanation: 'Iron-rich minerals give red soil its rusty colour. It needs fertilisers but can grow many crops with care.',
  },
  {
    id: 'g307_q4',
    type: 'DESCRIPTIVE',
    tier: 'VERY_WEAK',
    text: 'Why does India have so many different types of soil?',
    rubricHint: 'Mention: (1) different rocks underneath, (2) different climates, (3) river vs volcanic vs sandy origins.',
  },
  {
    id: 'g307_q5',
    type: 'DESCRIPTIVE',
    tier: 'VERY_WEAK',
    text: 'How does soil type affect what crops a region can grow?',
    rubricHint: 'Mention: (1) some soils hold water (clay/black), others drain quickly (sandy), (2) nutrients differ, (3) determines crop choice.',
  },
  {
    id: 'g307_q6',
    type: 'FEYNMAN',
    text: 'A friend asks why India can grow such different crops in different states.\n\nExplain using soil and climate differences.',
    keyConcepts: ['alluvial = grains', 'black = cotton', 'red = millets, pulses', 'soil + climate determine crops'],
  },
];

export const QUESTIONS_g308: Question[] = [
  {
    id: 'g308_q1',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'Tropical evergreen forests in India are found mainly in:',
    options: [
      { id: 'a', text: 'Rajasthan', correct: false },
      { id: 'b', text: 'Western Ghats and Northeast India (with heavy rainfall)', correct: true },
      { id: 'c', text: 'Punjab', correct: false },
      { id: 'd', text: 'Ladakh', correct: false },
    ],
    explanation: 'Areas with very heavy rainfall — Western Ghats, Northeast — support dense tropical evergreen forests.',
  },
  {
    id: 'g308_q2',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'Mangrove forests are special because they grow:',
    options: [
      { id: 'a', text: 'On mountain tops', correct: false },
      { id: 'b', text: 'In salty coastal waters and tidal areas', correct: true },
      { id: 'c', text: 'In deserts', correct: false },
      { id: 'd', text: 'Under snow', correct: false },
    ],
    explanation: 'Mangroves tolerate salt water and tides. They protect coasts and shelter many sea creatures.',
  },
  {
    id: 'g308_q3',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'Why does India have such varied natural vegetation across its states?',
    rubricHint: 'Mention: (1) huge range of climates, (2) different rainfall amounts, (3) altitude and soil variations.',
  },
  {
    id: 'g308_q4',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'How do thorny forests in dry regions of India differ from tropical evergreen forests?',
    rubricHint: 'Mention: (1) thorny = water-saving plants, (2) sparse cover, (3) evergreen = dense, tall, year-round leaves.',
  },
  {
    id: 'g308_q5',
    type: 'FEYNMAN',
    text: 'A friend thinks all Indian forests "look the same."\n\nExplain why the type of vegetation depends on the climate.',
    keyConcepts: ['rainfall = main driver', 'temperature too', 'altitude affects forest type', 'soil matters'],
  },
  {
    id: 'g308_q6',
    type: 'BLURT',
    text: 'Natural vegetation zones',
  },
];

// ─── geo_ch4: Rivers & Water Bodies ────────────────────────────────────────

export const QUESTIONS_g401: Question[] = [
  {
    id: 'g401_q1',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'A river delta is formed when:',
    options: [
      { id: 'a', text: 'A river runs dry', correct: false },
      { id: 'b', text: 'A river drops sediment as it enters a sea or lake, forming a fan-shaped land', correct: true },
      { id: 'c', text: 'A volcano erupts under a river', correct: false },
      { id: 'd', text: 'An earthquake stops the river', correct: false },
    ],
    explanation: 'When a river slows down and meets a sea/lake, it drops its sediment, building up a triangular fan of land called a delta.',
  },
  {
    id: 'g401_q2',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'A waterfall usually forms when:',
    options: [
      { id: 'a', text: 'A river flows over a sudden drop in the land', correct: true },
      { id: 'b', text: 'The river freezes', correct: false },
      { id: 'c', text: 'The wind blows hard', correct: false },
      { id: 'd', text: 'A volcano erupts in the river', correct: false },
    ],
    explanation: 'Waterfalls form where the river\'s bed suddenly drops — usually due to softer rock eroding faster than harder rock above.',
  },
  {
    id: 'g401_q3',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'A meander is:',
    options: [
      { id: 'a', text: 'A straight section of river', correct: false },
      { id: 'b', text: 'A bend or curve in a river\'s course', correct: true },
      { id: 'c', text: 'A waterfall', correct: false },
      { id: 'd', text: 'A frozen river', correct: false },
    ],
    explanation: 'Meanders are S-shaped curves where the river erodes one bank and deposits sediment on the other.',
  },
  {
    id: 'g401_q4',
    type: 'DESCRIPTIVE',
    tier: 'VERY_WEAK',
    text: 'How does a river\'s job change from its source in the mountains to its mouth at the sea?',
    rubricHint: 'Mention: (1) upper = erosion (cutting valleys), (2) middle = transport (meanders), (3) lower = deposition (deltas).',
  },
  {
    id: 'g401_q5',
    type: 'DESCRIPTIVE',
    tier: 'VERY_WEAK',
    text: 'Why are deltas usually very fertile?',
    rubricHint: 'Mention: (1) river drops rich sediment, (2) flat land easy to farm, (3) plenty of water nearby.',
  },
  {
    id: 'g401_q6',
    type: 'FEYNMAN',
    text: 'A friend looks at a meandering river and asks why it isn\'t straight.\n\nExplain how erosion and deposition naturally make rivers curve.',
    keyConcepts: ['erosion on outside of bend', 'deposition on inside', 'curves grow over time', 'sometimes cut off to form ox-bow lakes'],
  },
];

export const QUESTIONS_g402: Question[] = [
  {
    id: 'g402_q1',
    type: 'MCQ',
    text: 'Which is a major Himalayan river?',
    options: [
      { id: 'a', text: 'Godavari', correct: false },
      { id: 'b', text: 'Ganga', correct: true },
      { id: 'c', text: 'Krishna', correct: false },
      { id: 'd', text: 'Kaveri', correct: false },
    ],
    explanation: 'The Ganga is one of India\'s most important Himalayan rivers — others include the Brahmaputra and Indus.',
  },
  {
    id: 'g402_q2',
    type: 'MCQ',
    text: 'Himalayan rivers usually flow year-round because they\'re fed by:',
    options: [
      { id: 'a', text: 'Only rainfall', correct: false },
      { id: 'b', text: 'Melting snow and glaciers as well as rain', correct: true },
      { id: 'c', text: 'Underground oil', correct: false },
      { id: 'd', text: 'Sea water', correct: false },
    ],
    explanation: 'Even when there\'s no rain, Himalayan rivers keep flowing because snow and glaciers melt steadily.',
  },
  {
    id: 'g402_q3',
    type: 'MCQ',
    text: 'Where does the Ganga originate?',
    options: [
      { id: 'a', text: 'Western Ghats', correct: false },
      { id: 'b', text: 'Gangotri glacier in the Himalayas', correct: true },
      { id: 'c', text: 'Lakshadweep', correct: false },
      { id: 'd', text: 'Thar desert', correct: false },
    ],
    explanation: 'The Ganga starts from the Gangotri glacier in the Indian Himalayas as the Bhagirathi.',
  },
  {
    id: 'g402_q4',
    type: 'DESCRIPTIVE',
    text: 'Why are Himalayan rivers so important to India?',
    rubricHint: 'Mention: (1) water all year, (2) created fertile plains, (3) drinking, irrigation, hydropower, transport.',
  },
  {
    id: 'g402_q5',
    type: 'DESCRIPTIVE',
    text: 'How might climate change affect Himalayan rivers in the long run?',
    rubricHint: 'Mention: (1) glaciers shrink, (2) more melt at first then less water, (3) flooding risk, (4) farming and drinking water threatened.',
  },
  {
    id: 'g402_q6',
    type: 'FEYNMAN',
    text: 'A friend thinks rivers only flow because it rains.\n\nExplain how Himalayan rivers can flow even in dry seasons.',
    keyConcepts: ['glacier melt', 'snowmelt', 'natural reservoirs', 'year-round water'],
  },
];

export const QUESTIONS_g403: Question[] = [
  {
    id: 'g403_q1',
    type: 'MCQ',
    text: 'Peninsular rivers are mainly fed by:',
    options: [
      { id: 'a', text: 'Melting glaciers', correct: false },
      { id: 'b', text: 'Monsoon rainfall', correct: true },
      { id: 'c', text: 'Underground springs only', correct: false },
      { id: 'd', text: 'Sea water', correct: false },
    ],
    explanation: 'Peninsular rivers (Godavari, Krishna, etc.) depend on the monsoon — many shrink or run dry in summer.',
  },
  {
    id: 'g403_q2',
    type: 'MCQ',
    text: 'Which is the LONGEST peninsular river of India?',
    options: [
      { id: 'a', text: 'Krishna', correct: false },
      { id: 'b', text: 'Godavari', correct: true },
      { id: 'c', text: 'Kaveri', correct: false },
      { id: 'd', text: 'Narmada', correct: false },
    ],
    explanation: 'The Godavari, often called "Dakshin Ganga," is the longest river of peninsular India.',
  },
  {
    id: 'g403_q3',
    type: 'MCQ',
    text: 'Most peninsular rivers flow:',
    options: [
      { id: 'a', text: 'Towards the Himalayas', correct: false },
      { id: 'b', text: 'Eastward into the Bay of Bengal', correct: true },
      { id: 'c', text: 'Northward', correct: false },
      { id: 'd', text: 'Into the Arabian Sea only', correct: false },
    ],
    explanation: 'Most peninsular rivers (Godavari, Krishna, Kaveri, Mahanadi) flow east into the Bay of Bengal. Narmada and Tapi are exceptions.',
  },
  {
    id: 'g403_q4',
    type: 'DESCRIPTIVE',
    text: 'How are peninsular rivers different from Himalayan rivers?',
    rubricHint: 'Mention: (1) rain-fed vs glacier-fed, (2) seasonal vs year-round, (3) shorter, less sediment, fewer floods.',
  },
  {
    id: 'g403_q5',
    type: 'DESCRIPTIVE',
    text: 'Why do peninsular rivers often shrink in summer?',
    rubricHint: 'Mention: (1) no glacier source, (2) rely on monsoon rain, (3) summer = no rain, water level drops.',
  },
  {
    id: 'g403_q6',
    type: 'FEYNMAN',
    text: 'A friend thinks all Indian rivers are the same.\n\nExplain why peninsular rivers behave very differently from northern ones.',
    keyConcepts: ['rain-fed only', 'seasonal flow', 'flow east mainly', 'short, less powerful'],
  },
];

export const QUESTIONS_g404: Question[] = [
  {
    id: 'g404_q1',
    type: 'MCQ',
    text: 'Dal Lake is famously located in:',
    options: [
      { id: 'a', text: 'Tamil Nadu', correct: false },
      { id: 'b', text: 'Srinagar (Jammu & Kashmir)', correct: true },
      { id: 'c', text: 'Goa', correct: false },
      { id: 'd', text: 'Kerala', correct: false },
    ],
    explanation: 'Dal Lake in Srinagar is famous for its houseboats, shikaras, and beautiful surroundings.',
  },
  {
    id: 'g404_q2',
    type: 'MCQ',
    text: 'Which is a major freshwater lake in India?',
    options: [
      { id: 'a', text: 'Wular Lake', correct: true },
      { id: 'b', text: 'Sambhar Lake (it\'s saline)', correct: false },
      { id: 'c', text: 'Chilika Lake (mostly brackish)', correct: false },
      { id: 'd', text: 'Pulicat Lake (brackish)', correct: false },
    ],
    explanation: 'Wular Lake in Kashmir is one of India\'s largest freshwater lakes.',
  },
  {
    id: 'g404_q3',
    type: 'MCQ',
    text: 'A "brackish" lake has water that is:',
    options: [
      { id: 'a', text: 'Frozen all year', correct: false },
      { id: 'b', text: 'A mix of fresh and salty water', correct: true },
      { id: 'c', text: 'Only rainwater', correct: false },
      { id: 'd', text: 'Boiling hot', correct: false },
    ],
    explanation: 'Brackish lakes (like Chilika) have more salt than rivers but less than the sea — usually where freshwater meets the sea.',
  },
  {
    id: 'g404_q4',
    type: 'DESCRIPTIVE',
    text: 'Why are lakes important for both nature and people?',
    rubricHint: 'Mention: (1) drinking water, (2) fishing and tourism, (3) habitat for birds and aquatic life, (4) help climate.',
  },
  {
    id: 'g404_q5',
    type: 'DESCRIPTIVE',
    text: 'How can lakes be damaged by human activity?',
    rubricHint: 'Mention: (1) pollution from cities and farms, (2) encroachment, (3) draining for land, (4) reduced biodiversity.',
  },
  {
    id: 'g404_q6',
    type: 'FEYNMAN',
    text: 'A friend asks: "If lakes look full, why do they need protection?"\n\nExplain how lakes can be damaged in ways we can\'t see at first glance.',
    keyConcepts: ['pollution invisible at first', 'fish dying', 'algae blooms', 'slow decline', 'restoration is hard'],
  },
];

export const QUESTIONS_g405: Question[] = [
  {
    id: 'g405_q1',
    type: 'MCQ',
    text: 'The water cycle is powered by:',
    options: [
      { id: 'a', text: 'Wind alone', correct: false },
      { id: 'b', text: 'The sun\'s energy', correct: true },
      { id: 'c', text: 'Magnetic fields', correct: false },
      { id: 'd', text: 'Electric current', correct: false },
    ],
    explanation: 'The sun heats water, causing evaporation — the engine of the entire water cycle.',
  },
  {
    id: 'g405_q2',
    type: 'MCQ',
    text: 'What happens during condensation?',
    options: [
      { id: 'a', text: 'Liquid water turns to vapour', correct: false },
      { id: 'b', text: 'Water vapour cools and turns back into liquid droplets (clouds)', correct: true },
      { id: 'c', text: 'Water freezes into rocks', correct: false },
      { id: 'd', text: 'Rain becomes snow', correct: false },
    ],
    explanation: 'When warm vapour rises and cools, it condenses into tiny droplets that form clouds — a key step in the water cycle.',
  },
  {
    id: 'g405_q3',
    type: 'MCQ',
    text: 'Water returns to the land/sea as:',
    options: [
      { id: 'a', text: 'Magma', correct: false },
      { id: 'b', text: 'Precipitation (rain, snow, hail)', correct: true },
      { id: 'c', text: 'Wind', correct: false },
      { id: 'd', text: 'Heat', correct: false },
    ],
    explanation: 'Once cloud droplets are heavy enough, they fall as rain, snow, sleet, or hail.',
  },
  {
    id: 'g405_q4',
    type: 'DESCRIPTIVE',
    text: 'Trace one drop of water from the sea, through the water cycle, and back to the sea.',
    rubricHint: 'Mention: (1) evaporates from sea, (2) condenses into cloud, (3) precipitates as rain, (4) flows via river back to sea.',
  },
  {
    id: 'g405_q5',
    type: 'DESCRIPTIVE',
    text: 'How does the water cycle connect rivers, oceans, and the air?',
    rubricHint: 'Mention: (1) oceans evaporate, (2) clouds drift over land, (3) rivers carry rain back, (4) continuous loop.',
  },
  {
    id: 'g405_q6',
    type: 'FEYNMAN',
    text: 'A friend asks if Earth ever "runs out of water."\n\nExplain using the water cycle.',
    keyConcepts: ['water is recycled', 'cycle never stops', 'amount stays the same', 'but distribution shifts'],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// CIVICS — Class 6 CBSE
// ═══════════════════════════════════════════════════════════════════════════

// ─── civ_ch1: Our Constitution ─────────────────────────────────────────────

export const QUESTIONS_v101: Question[] = [
  {
    id: 'v101_q1',
    type: 'MCQ',
    text: 'The Preamble of the Indian Constitution declares India to be a:',
    options: [
      { id: 'a', text: 'Monarchy', correct: false },
      { id: 'b', text: 'Sovereign Socialist Secular Democratic Republic', correct: true },
      { id: 'c', text: 'Military state', correct: false },
      { id: 'd', text: 'Theocracy', correct: false },
    ],
    explanation: 'The opening words of the Preamble describe India as a Sovereign, Socialist, Secular, Democratic Republic.',
  },
  {
    id: 'v101_q2',
    type: 'DESCRIPTIVE',
    text: 'What do "Justice, Liberty, Equality, Fraternity" in the Preamble actually mean for citizens?',
    rubricHint: 'Mention: (1) justice = fair treatment, (2) liberty = freedom of thought/speech, (3) equality = equal opportunity, (4) fraternity = brotherhood, unity.',
  },
  {
    id: 'v101_q3',
    type: 'FEYNMAN',
    text: 'A friend says the Preamble is "just words at the start of a book."\n\nExplain why it actually matters and guides the whole Constitution.',
    keyConcepts: ['statement of values', 'guides interpretation', 'reflects spirit of Constitution', 'used in court decisions'],
  },
  {
    id: 'v101_q4',
    type: 'BLURT',
    text: 'The Preamble',
  },
  {
    id: 'v101_q5',
    type: 'ACTIVE_RECALL',
    text: 'A new student joins your school and asks: "What does it mean that India is a republic?"\n\nUsing the Preamble, explain in your own words.',
  },
];

export const QUESTIONS_v102: Question[] = [
  {
    id: 'v102_q1',
    type: 'MCQ',
    text: 'How many Fundamental Rights does the Indian Constitution guarantee?',
    options: [
      { id: 'a', text: 'Three', correct: false },
      { id: 'b', text: 'Six', correct: true },
      { id: 'c', text: 'Ten', correct: false },
      { id: 'd', text: 'Twelve', correct: false },
    ],
    explanation: 'There are 6 Fundamental Rights: Equality, Freedom, Against Exploitation, Religion, Cultural & Educational, and Constitutional Remedies.',
  },
  {
    id: 'v102_q2',
    type: 'DESCRIPTIVE',
    text: 'Why are Fundamental Rights called "fundamental"?',
    rubricHint: 'Mention: (1) basic to human dignity, (2) guaranteed by the Constitution, (3) enforceable by courts.',
  },
  {
    id: 'v102_q3',
    type: 'FEYNMAN',
    text: 'A friend thinks Fundamental Rights are "things the government gives us."\n\nExplain why they\'re actually limits ON the government.',
    keyConcepts: ['protect citizens FROM the state', 'court enforceable', 'can\'t be easily taken away', 'reserved for individuals'],
  },
  {
    id: 'v102_q4',
    type: 'BLURT',
    text: 'Fundamental rights overview',
  },
  {
    id: 'v102_q5',
    type: 'ACTIVE_RECALL',
    text: 'A new law tries to ban people of a certain religion from voting.\n\nUsing Fundamental Rights, explain why this law would be unconstitutional.',
  },
];

export const QUESTIONS_v104: Question[] = [
  {
    id: 'v104_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Fundamental Duties of Indian citizens were added by the:',
    options: [
      { id: 'a', text: 'Original Constitution of 1950', correct: false },
      { id: 'b', text: '42nd Amendment in 1976', correct: true },
      { id: 'c', text: 'Government of India Act 1935', correct: false },
      { id: 'd', text: '73rd Amendment', correct: false },
    ],
    explanation: 'The 42nd Amendment (1976) added 10 Fundamental Duties (later 11) to balance the rights with duties.',
  },
  {
    id: 'v104_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Which of these is a Fundamental Duty?',
    options: [
      { id: 'a', text: 'To pay all taxes only on weekends', correct: false },
      { id: 'b', text: 'To protect the natural environment', correct: true },
      { id: 'c', text: 'To memorise the Constitution', correct: false },
      { id: 'd', text: 'To vote in every election by law', correct: false },
    ],
    explanation: 'Protecting forests, lakes, wildlife and the environment is one of the listed Fundamental Duties.',
  },
  {
    id: 'v104_q3',
    type: 'DESCRIPTIVE',
    text: 'Why does the Constitution have both rights AND duties?',
    rubricHint: 'Mention: (1) balance, (2) rights without responsibility = chaos, (3) duties remind citizens of their part in democracy.',
  },
  {
    id: 'v104_q4',
    type: 'FEYNMAN',
    text: 'A friend thinks Fundamental Duties are "punishable like laws."\n\nExplain how they\'re different.',
    keyConcepts: ['moral obligations', 'not directly enforceable', 'guide behaviour', 'support democracy'],
  },
  {
    id: 'v104_q5',
    type: 'BLURT',
    text: 'Fundamental duties',
  },
  {
    id: 'v104_q6',
    type: 'ACTIVE_RECALL',
    text: 'A student\'s school organises a tree planting drive.\n\nUsing Fundamental Duties, explain why this fits with what the Constitution expects of citizens.',
  },
];

export const QUESTIONS_v105: Question[] = [
  {
    id: 'v105_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'A Constitutional Amendment is:',
    options: [
      { id: 'a', text: 'A new law made by Parliament every day', correct: false },
      { id: 'b', text: 'A formal change to the Constitution itself', correct: true },
      { id: 'c', text: 'A court order', correct: false },
      { id: 'd', text: 'A press release', correct: false },
    ],
    explanation: 'An amendment changes the actual Constitution. It needs special procedures, not just a simple majority.',
  },
  {
    id: 'v105_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'The 42nd Amendment is often called the "Mini Constitution" because it:',
    options: [
      { id: 'a', text: 'Was very short', correct: false },
      { id: 'b', text: 'Made many big changes at once', correct: true },
      { id: 'c', text: 'Was rejected', correct: false },
      { id: 'd', text: 'Was only about cricket', correct: false },
    ],
    explanation: 'The 42nd Amendment (1976) altered many parts of the Constitution at once — adding duties, changing the preamble, etc.',
  },
  {
    id: 'v105_q3',
    type: 'DESCRIPTIVE',
    text: 'Why is it harder to amend the Constitution than to pass a normal law?',
    rubricHint: 'Mention: (1) protects basic values, (2) needs special majority, (3) some parts need state approval too.',
  },
  {
    id: 'v105_q4',
    type: 'FEYNMAN',
    text: 'A friend asks: "If the Constitution is so important, can it ever be changed?"\n\nExplain how amendments work.',
    keyConcepts: ['Constitution is changeable', 'process is harder than law-making', 'special majority needed', 'protects basic structure'],
  },
  {
    id: 'v105_q5',
    type: 'BLURT',
    text: 'Constitutional amendments',
  },
  {
    id: 'v105_q6',
    type: 'ACTIVE_RECALL',
    text: 'Parliament wants to change a part of the Constitution related to voter age.\n\nUsing what you know about amendments, explain why this isn\'t as easy as just passing a regular law.',
  },
];

export const QUESTIONS_v106: Question[] = [
  {
    id: 'v106_q1',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'Who can declare a National Emergency in India?',
    options: [
      { id: 'a', text: 'The Prime Minister alone', correct: false },
      { id: 'b', text: 'The President, on advice of the Cabinet', correct: true },
      { id: 'c', text: 'The Supreme Court', correct: false },
      { id: 'd', text: 'Any state Governor', correct: false },
    ],
    explanation: 'The President declares emergencies but only on the written advice of the Union Cabinet — and Parliament must approve.',
  },
  {
    id: 'v106_q2',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'When was the most famous and controversial National Emergency declared in India?',
    options: [
      { id: 'a', text: '1947', correct: false },
      { id: 'b', text: '1975', correct: true },
      { id: 'c', text: '1991', correct: false },
      { id: 'd', text: '2001', correct: false },
    ],
    explanation: 'The Emergency of 1975–1977 under PM Indira Gandhi is the most discussed — civil liberties were suspended.',
  },
  {
    id: 'v106_q3',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'Why does the Constitution provide for emergency provisions at all?',
    rubricHint: 'Mention: (1) handle wars, natural disasters, breakdowns, (2) extra government powers in crisis, (3) safeguard the nation.',
  },
  {
    id: 'v106_q4',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'Why is the misuse of Emergency powers a serious threat to democracy?',
    rubricHint: 'Mention: (1) rights can be suspended, (2) checks on government weakened, (3) leaders can hold on to power unfairly.',
  },
  {
    id: 'v106_q5',
    type: 'FEYNMAN',
    text: 'A friend asks: "Why give the government extra powers in emergencies — isn\'t that dangerous?"\n\nExplain the balance the Constitution tries to strike.',
    keyConcepts: ['needed for genuine crises', 'limits and time bounds', 'parliamentary approval', 'safeguards against abuse'],
  },
  {
    id: 'v106_q6',
    type: 'BLURT',
    text: 'Emergency provisions',
  },
];

// ─── civ_ch2: Fundamental Rights ───────────────────────────────────────────

export const QUESTIONS_v201: Question[] = [
  {
    id: 'v201_q1',
    type: 'MCQ',
    text: 'The Right to Equality means:',
    options: [
      { id: 'a', text: 'Everyone earns the same money', correct: false },
      { id: 'b', text: 'No one can be discriminated against based on caste, religion, sex, etc.', correct: true },
      { id: 'c', text: 'Everyone lives in the same house', correct: false },
      { id: 'd', text: 'Only adults are equal', correct: false },
    ],
    explanation: 'Right to Equality means equal treatment before law and no discrimination — not that everyone is identical or has the same income.',
  },
  {
    id: 'v201_q2',
    type: 'DESCRIPTIVE',
    text: 'Why does the Right to Equality allow special help for some groups (like reservation) without contradicting itself?',
    rubricHint: 'Mention: (1) some groups historically disadvantaged, (2) equality of opportunity, not just treatment, (3) levelling the playing field.',
  },
  {
    id: 'v201_q3',
    type: 'FEYNMAN',
    text: 'A friend says "Equality means everyone is the same."\n\nExplain why equality in the Constitution actually means equal opportunity and dignity.',
    keyConcepts: ['equal in law', 'no discrimination', 'equality of opportunity', 'recognises real differences'],
  },
  {
    id: 'v201_q4',
    type: 'BLURT',
    text: 'Right to equality',
  },
  {
    id: 'v201_q5',
    type: 'ACTIVE_RECALL',
    text: 'A restaurant refuses to serve a person because of their religion.\n\nUsing the Right to Equality, explain why this is illegal.',
  },
];

export const QUESTIONS_v202: Question[] = [
  {
    id: 'v202_q1',
    type: 'MCQ',
    text: 'Which is part of the Right to Freedom?',
    options: [
      { id: 'a', text: 'Freedom to break any law', correct: false },
      { id: 'b', text: 'Freedom of speech and expression', correct: true },
      { id: 'c', text: 'Freedom to never pay tax', correct: false },
      { id: 'd', text: 'Freedom to invade another country', correct: false },
    ],
    explanation: 'Right to Freedom includes free speech, assembly, movement, residence, and profession — within reasonable limits.',
  },
  {
    id: 'v202_q2',
    type: 'DESCRIPTIVE',
    text: 'Why does free speech have "reasonable restrictions"?',
    rubricHint: 'Mention: (1) protect others\' rights, (2) public order and safety, (3) decency, defamation laws, national security.',
  },
  {
    id: 'v202_q3',
    type: 'FEYNMAN',
    text: 'A friend says: "Free speech means I can say ANYTHING."\n\nExplain why there are some limits even in a democracy.',
    keyConcepts: ['free speech is broad but not absolute', 'can\'t incite violence or hate', 'protects safety of others', 'balanced freedom'],
  },
  {
    id: 'v202_q4',
    type: 'BLURT',
    text: 'Right to freedom',
  },
  {
    id: 'v202_q5',
    type: 'ACTIVE_RECALL',
    text: 'A newspaper criticises a government decision.\n\nUsing the Right to Freedom, explain why the government cannot shut it down for that.',
  },
];

export const QUESTIONS_v203: Question[] = [
  {
    id: 'v203_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'The Right Against Exploitation prohibits:',
    options: [
      { id: 'a', text: 'Studying hard', correct: false },
      { id: 'b', text: 'Trafficking, forced labour, and child labour in hazardous work', correct: true },
      { id: 'c', text: 'Working in an office', correct: false },
      { id: 'd', text: 'Going to school', correct: false },
    ],
    explanation: 'This right forbids exploitation of humans — like trafficking and forced labour — and bans child labour in dangerous jobs.',
  },
  {
    id: 'v203_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'What is "bonded labour"?',
    options: [
      { id: 'a', text: 'A type of paid job', correct: false },
      { id: 'b', text: 'When someone is forced to work to pay off a debt, often endlessly', correct: true },
      { id: 'c', text: 'Sports practice', correct: false },
      { id: 'd', text: 'A kind of internship', correct: false },
    ],
    explanation: 'Bonded labour traps people in forced work to "pay off" loans they can rarely escape — banned by the Constitution.',
  },
  {
    id: 'v203_q3',
    type: 'DESCRIPTIVE',
    text: 'Why does India specifically ban child labour in hazardous jobs?',
    rubricHint: 'Mention: (1) protects health and safety, (2) lets children study, (3) breaks cycle of poverty.',
  },
  {
    id: 'v203_q4',
    type: 'FEYNMAN',
    text: 'A friend thinks "exploitation is just a strong word for hard work."\n\nExplain the real meaning and why it\'s banned.',
    keyConcepts: ['forced labour', 'unsafe child work', 'trafficking', 'violation of dignity'],
  },
  {
    id: 'v203_q5',
    type: 'BLURT',
    text: 'Right against exploitation',
  },
  {
    id: 'v203_q6',
    type: 'ACTIVE_RECALL',
    text: 'A factory owner makes children work in dangerous machinery to pay off their parents\' debts.\n\nUsing the Right Against Exploitation, list two specific violations here.',
  },
];

export const QUESTIONS_v204: Question[] = [
  {
    id: 'v204_q1',
    type: 'MCQ',
    text: 'India\'s Right to Freedom of Religion means:',
    options: [
      { id: 'a', text: 'Everyone must follow one religion', correct: false },
      { id: 'b', text: 'Every citizen can freely practise, profess and propagate any religion', correct: true },
      { id: 'c', text: 'Only Hinduism is allowed', correct: false },
      { id: 'd', text: 'Religion is illegal', correct: false },
    ],
    explanation: 'Indians are free to choose, practise, and share their religion — and not to follow any. This is part of being secular.',
  },
  {
    id: 'v204_q2',
    type: 'DESCRIPTIVE',
    text: 'Why is India called a "secular" state, and how does that relate to religious freedom?',
    rubricHint: 'Mention: (1) state has no official religion, (2) all religions treated equally, (3) people free to choose.',
  },
  {
    id: 'v204_q3',
    type: 'FEYNMAN',
    text: 'A friend asks: "If India is secular, why are there religious holidays for different faiths?"\n\nExplain how secularism and religious diversity work together.',
    keyConcepts: ['state respects all', 'doesn\'t favour one religion', 'recognises traditions', 'celebrates plurality'],
  },
  {
    id: 'v204_q4',
    type: 'BLURT',
    text: 'Right to freedom of religion',
  },
  {
    id: 'v204_q5',
    type: 'ACTIVE_RECALL',
    text: 'A government office tries to ban an employee from wearing a religious symbol like a cross or hijab.\n\nUsing the Right to Freedom of Religion, explain whether this is constitutional.',
  },
];

export const QUESTIONS_v205: Question[] = [
  {
    id: 'v205_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Cultural and Educational Rights protect:',
    options: [
      { id: 'a', text: 'Only the majority community', correct: false },
      { id: 'b', text: 'Minority communities\' right to preserve language, script, and culture, and set up schools', correct: true },
      { id: 'c', text: 'Only government schools', correct: false },
      { id: 'd', text: 'Only sports', correct: false },
    ],
    explanation: 'These rights ensure minorities can keep their language and culture, and run their own educational institutions.',
  },
  {
    id: 'v205_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'A minority community can set up its own school. The state cannot:',
    options: [
      { id: 'a', text: 'Help them at all', correct: false },
      { id: 'b', text: 'Refuse aid just because the school is run by a minority', correct: true },
      { id: 'c', text: 'Force them to teach', correct: false },
      { id: 'd', text: 'Set inspections', correct: false },
    ],
    explanation: 'The Constitution forbids discrimination in granting aid just because an institution is run by a minority.',
  },
  {
    id: 'v205_q3',
    type: 'DESCRIPTIVE',
    text: 'Why is protecting minority culture important for a diverse democracy like India?',
    rubricHint: 'Mention: (1) India has many languages and religions, (2) majorities can sideline minorities, (3) constitutional protection ensures fairness.',
  },
  {
    id: 'v205_q4',
    type: 'FEYNMAN',
    text: 'A friend asks: "Why do minorities need special protection — isn\'t equality enough?"\n\nExplain how cultural rights complement equality.',
    keyConcepts: ['equality + cultural identity', 'preserve languages', 'prevent dominant culture from erasing others', 'real diversity'],
  },
  {
    id: 'v205_q5',
    type: 'BLURT',
    text: 'Cultural & educational rights',
  },
  {
    id: 'v205_q6',
    type: 'ACTIVE_RECALL',
    text: 'A small community wants to start a school that teaches in their native language.\n\nUsing Cultural and Educational Rights, explain whether they can do this.',
  },
];

export const QUESTIONS_v206: Question[] = [
  {
    id: 'v206_q1',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'The Right to Constitutional Remedies allows citizens to:',
    options: [
      { id: 'a', text: 'Make their own constitution', correct: false },
      { id: 'b', text: 'Approach courts when their Fundamental Rights are violated', correct: true },
      { id: 'c', text: 'Vote twice in elections', correct: false },
      { id: 'd', text: 'Become President', correct: false },
    ],
    explanation: 'If your Fundamental Rights are violated, you can directly move the Supreme Court or High Court for protection.',
  },
  {
    id: 'v206_q2',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'Dr. Ambedkar called the Right to Constitutional Remedies:',
    options: [
      { id: 'a', text: '"A useless feature"', correct: false },
      { id: 'b', text: '"The heart and soul of the Constitution"', correct: true },
      { id: 'c', text: '"A repeated idea"', correct: false },
      { id: 'd', text: '"Optional"', correct: false },
    ],
    explanation: 'Ambedkar believed it was the most important right — without it, all the others would be meaningless on paper.',
  },
  {
    id: 'v206_q3',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'A court order to release a person who is wrongfully detained is called a:',
    options: [
      { id: 'a', text: 'Mandamus', correct: false },
      { id: 'b', text: 'Habeas Corpus', correct: true },
      { id: 'c', text: 'Quo Warranto', correct: false },
      { id: 'd', text: 'Certiorari', correct: false },
    ],
    explanation: 'Habeas Corpus literally means "produce the body" — the court asks the detainer to bring the person and justify the detention.',
  },
  {
    id: 'v206_q4',
    type: 'DESCRIPTIVE',
    tier: 'VERY_WEAK',
    text: 'Why is the Right to Constitutional Remedies often called the most important Fundamental Right?',
    rubricHint: 'Mention: (1) makes other rights real, (2) lets citizens hold government accountable, (3) gives access to courts.',
  },
  {
    id: 'v206_q5',
    type: 'DESCRIPTIVE',
    tier: 'VERY_WEAK',
    text: 'How does a "writ" help protect Fundamental Rights?',
    rubricHint: 'Mention: (1) court orders to government or officials, (2) different types for different problems, (3) enforced like law.',
  },
  {
    id: 'v206_q6',
    type: 'FEYNMAN',
    text: 'A friend says: "Rights are just words — what good are they?"\n\nExplain how the Right to Constitutional Remedies makes rights real.',
    keyConcepts: ['courts can be approached', 'writs enforce rights', 'government can be ordered to act', 'rights become enforceable'],
  },
];

export const QUESTIONS_v207: Question[] = [
  {
    id: 'v207_q1',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'Which court has the power to issue writs to enforce Fundamental Rights?',
    options: [
      { id: 'a', text: 'Only district courts', correct: false },
      { id: 'b', text: 'Supreme Court and High Courts', correct: true },
      { id: 'c', text: 'Family courts only', correct: false },
      { id: 'd', text: 'Village panchayats', correct: false },
    ],
    explanation: 'Only the Supreme Court (Article 32) and High Courts (Article 226) can issue writs.',
  },
  {
    id: 'v207_q2',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'A writ ordering a public official to do their legal duty is called:',
    options: [
      { id: 'a', text: 'Habeas Corpus', correct: false },
      { id: 'b', text: 'Mandamus', correct: true },
      { id: 'c', text: 'Certiorari', correct: false },
      { id: 'd', text: 'Quo Warranto', correct: false },
    ],
    explanation: 'Mandamus ("we command") orders an official to do their lawful duty when they refuse.',
  },
  {
    id: 'v207_q3',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'Why is the writ jurisdiction of higher courts important for democracy?',
    rubricHint: 'Mention: (1) checks government, (2) protects citizens, (3) ensures rule of law.',
  },
  {
    id: 'v207_q4',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'What\'s the difference between Habeas Corpus and Mandamus?',
    rubricHint: 'Mention: (1) Habeas Corpus = release unlawfully detained person, (2) Mandamus = compel official to act, (3) both correct different wrongs.',
  },
  {
    id: 'v207_q5',
    type: 'FEYNMAN',
    text: 'A friend doesn\'t see why courts should be able to "boss around" the government.\n\nExplain why this power protects ordinary people.',
    keyConcepts: ['checks executive power', 'protects rights', 'rule of law', 'no one above the Constitution'],
  },
  {
    id: 'v207_q6',
    type: 'BLURT',
    text: 'Writ jurisdiction of courts',
  },
];

// ─── civ_ch3: Government Structure ─────────────────────────────────────────

export const QUESTIONS_v301: Question[] = [
  {
    id: 'v301_q1',
    type: 'MCQ',
    text: 'The Lok Sabha is also called:',
    options: [
      { id: 'a', text: 'House of the Elders', correct: false },
      { id: 'b', text: 'House of the People', correct: true },
      { id: 'c', text: 'House of the President', correct: false },
      { id: 'd', text: 'House of Ministers', correct: false },
    ],
    explanation: 'Lok Sabha = "House of the People." Members are directly elected by Indian citizens.',
  },
  {
    id: 'v301_q2',
    type: 'DESCRIPTIVE',
    text: 'Why is Lok Sabha considered the more powerful house in matters of money bills?',
    rubricHint: 'Mention: (1) money bills can only start in Lok Sabha, (2) directly elected, (3) closer to the public will.',
  },
  {
    id: 'v301_q3',
    type: 'FEYNMAN',
    text: 'A friend thinks "Parliament" is just one big room.\n\nExplain that there are two houses, and what each does.',
    keyConcepts: ['Lok Sabha = elected by people', 'Rajya Sabha = represents states', 'both make laws', 'different roles'],
  },
  {
    id: 'v301_q4',
    type: 'BLURT',
    text: 'Parliament — Lok Sabha',
  },
  {
    id: 'v301_q5',
    type: 'ACTIVE_RECALL',
    text: 'A new tax law is proposed.\n\nUsing what you know about Lok Sabha, explain where this bill must start and why.',
  },
];

export const QUESTIONS_v302: Question[] = [
  {
    id: 'v302_q1',
    type: 'MCQ',
    text: 'The Rajya Sabha represents:',
    options: [
      { id: 'a', text: 'Citizens directly', correct: false },
      { id: 'b', text: 'The states of India', correct: true },
      { id: 'c', text: 'Foreign countries', correct: false },
      { id: 'd', text: 'Local panchayats', correct: false },
    ],
    explanation: 'Rajya Sabha members are elected by state legislatures — they represent state interests in the Centre.',
  },
  {
    id: 'v302_q2',
    type: 'DESCRIPTIVE',
    text: 'How does the Rajya Sabha protect the interests of smaller states?',
    rubricHint: 'Mention: (1) states get fixed representation, (2) discusses how laws affect states, (3) balances Lok Sabha\'s population-based seats.',
  },
  {
    id: 'v302_q3',
    type: 'FEYNMAN',
    text: 'A friend asks: "Why do we need TWO houses of Parliament? Isn\'t one enough?"\n\nExplain why the second house matters.',
    keyConcepts: ['checks the Lok Sabha', 'represents states', 'experienced reviewers', 'second look at laws'],
  },
  {
    id: 'v302_q4',
    type: 'BLURT',
    text: 'Parliament — Rajya Sabha',
  },
  {
    id: 'v302_q5',
    type: 'ACTIVE_RECALL',
    text: 'A new law strongly affects northeastern states.\n\nUsing what you know about Rajya Sabha, explain how their voices reach Parliament.',
  },
];

export const QUESTIONS_v303: Question[] = [
  {
    id: 'v303_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'The Supreme Court is the:',
    options: [
      { id: 'a', text: 'Lowest court in India', correct: false },
      { id: 'b', text: 'Highest court in India whose decisions bind everyone', correct: true },
      { id: 'c', text: 'Only court that hears divorces', correct: false },
      { id: 'd', text: 'A type of police station', correct: false },
    ],
    explanation: 'The Supreme Court is the highest in India — its rulings are final and binding on all lower courts and the government.',
  },
  {
    id: 'v303_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Who appoints judges of the Supreme Court?',
    options: [
      { id: 'a', text: 'The Prime Minister alone', correct: false },
      { id: 'b', text: 'The President of India (with consultation)', correct: true },
      { id: 'c', text: 'Citizens voting', correct: false },
      { id: 'd', text: 'The Speaker', correct: false },
    ],
    explanation: 'The President appoints Supreme Court judges, after consultation with senior judges and the Chief Justice.',
  },
  {
    id: 'v303_q3',
    type: 'DESCRIPTIVE',
    text: 'Why is an independent judiciary important for democracy?',
    rubricHint: 'Mention: (1) protects rights, (2) checks government, (3) ensures laws are applied fairly.',
  },
  {
    id: 'v303_q4',
    type: 'FEYNMAN',
    text: 'A friend says: "Judges should just do what the government wants."\n\nExplain why an independent judiciary is essential.',
    keyConcepts: ['checks and balances', 'protects citizens', 'no one above the law', 'fair justice'],
  },
  {
    id: 'v303_q5',
    type: 'BLURT',
    text: 'The judiciary — Supreme Court',
  },
  {
    id: 'v303_q6',
    type: 'ACTIVE_RECALL',
    text: 'A new law passed by Parliament seems to violate Fundamental Rights.\n\nUsing the role of the Supreme Court, explain what can happen next.',
  },
];

export const QUESTIONS_v304: Question[] = [
  {
    id: 'v304_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'The President of India is the:',
    options: [
      { id: 'a', text: 'Head of the Lok Sabha', correct: false },
      { id: 'b', text: 'Constitutional head of the country (ceremonial in most matters)', correct: true },
      { id: 'c', text: 'Head of the military only', correct: false },
      { id: 'd', text: 'Mayor of Delhi', correct: false },
    ],
    explanation: 'The President is the constitutional head of India, performing ceremonial and certain executive duties — but real power lies with the PM and Cabinet.',
  },
  {
    id: 'v304_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Who actually runs the day-to-day government in India?',
    options: [
      { id: 'a', text: 'The President', correct: false },
      { id: 'b', text: 'The Prime Minister and the Council of Ministers', correct: true },
      { id: 'c', text: 'The Chief Justice', correct: false },
      { id: 'd', text: 'The Speaker', correct: false },
    ],
    explanation: 'The PM and Cabinet hold real executive power; the President acts on their advice in most matters.',
  },
  {
    id: 'v304_q3',
    type: 'DESCRIPTIVE',
    text: 'Why does India have a President even though the PM holds real power?',
    rubricHint: 'Mention: (1) ceremonial unity, (2) constitutional checks (return bills, emergency), (3) symbol of the nation.',
  },
  {
    id: 'v304_q4',
    type: 'FEYNMAN',
    text: 'A friend says: "The President is just for show."\n\nExplain why this is too simple.',
    keyConcepts: ['signs laws', 'commander-in-chief', 'can return bills', 'crucial in emergencies', 'represents the nation'],
  },
  {
    id: 'v304_q5',
    type: 'BLURT',
    text: 'President role',
  },
  {
    id: 'v304_q6',
    type: 'ACTIVE_RECALL',
    text: 'Parliament passes a controversial bill.\n\nUsing what you know about the President\'s role, list two options available to them before it becomes law.',
  },
];

export const QUESTIONS_v305: Question[] = [
  {
    id: 'v305_q1',
    type: 'MCQ',
    text: 'The Prime Minister of India is:',
    options: [
      { id: 'a', text: 'Elected directly by citizens', correct: false },
      { id: 'b', text: 'The leader of the party (or coalition) with majority in Lok Sabha', correct: true },
      { id: 'c', text: 'Always the President', correct: false },
      { id: 'd', text: 'Chosen by the Supreme Court', correct: false },
    ],
    explanation: 'The PM is appointed by the President but must be the leader of the majority party/coalition in the Lok Sabha.',
  },
  {
    id: 'v305_q2',
    type: 'DESCRIPTIVE',
    text: 'How does the Cabinet help the PM run the country?',
    rubricHint: 'Mention: (1) each minister handles a department, (2) collective decisions, (3) PM coordinates them.',
  },
  {
    id: 'v305_q3',
    type: 'FEYNMAN',
    text: 'A friend assumes the PM "decides everything alone."\n\nExplain how Cabinet government really works.',
    keyConcepts: ['collective decisions', 'each minister has a department', 'PM is first among equals', 'collective responsibility'],
  },
  {
    id: 'v305_q4',
    type: 'BLURT',
    text: 'Prime Minister & Cabinet',
  },
  {
    id: 'v305_q5',
    type: 'ACTIVE_RECALL',
    text: 'A health crisis hits the country.\n\nUsing what you know about the PM and Cabinet, explain how decisions would typically be made.',
  },
];

export const QUESTIONS_v306: Question[] = [
  {
    id: 'v306_q1',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'India follows which kind of system between the Centre and states?',
    options: [
      { id: 'a', text: 'Unitary (only Centre)', correct: false },
      { id: 'b', text: 'Federal (powers shared between Centre and states)', correct: true },
      { id: 'c', text: 'Monarchical', correct: false },
      { id: 'd', text: 'Military', correct: false },
    ],
    explanation: 'India is federal — both the Centre and states have powers, defined by the Constitution.',
  },
  {
    id: 'v306_q2',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'Subjects like Defence and Foreign Affairs fall under:',
    options: [
      { id: 'a', text: 'State List', correct: false },
      { id: 'b', text: 'Union (Centre) List', correct: true },
      { id: 'c', text: 'Local body list', correct: false },
      { id: 'd', text: 'Court list', correct: false },
    ],
    explanation: 'Defence, foreign affairs, currency, etc. are on the Union List — handled by the central government for the whole country.',
  },
  {
    id: 'v306_q3',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'Why does India divide powers between the Centre and the states?',
    rubricHint: 'Mention: (1) huge diverse country, (2) local issues better handled locally, (3) Centre handles national matters.',
  },
  {
    id: 'v306_q4',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'What might happen if all power were given only to the Centre?',
    rubricHint: 'Mention: (1) local needs ignored, (2) distant decisions, (3) loss of regional autonomy and identity.',
  },
  {
    id: 'v306_q5',
    type: 'FEYNMAN',
    text: 'A friend asks: "Why can\'t one government rule everything in India?"\n\nExplain federalism.',
    keyConcepts: ['too big and diverse', 'local issues need local control', 'shared powers', 'balance between Centre and states'],
  },
  {
    id: 'v306_q6',
    type: 'BLURT',
    text: 'State government vs Centre',
  },
];

export const QUESTIONS_v307: Question[] = [
  {
    id: 'v307_q1',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'In India, voting age is currently:',
    options: [
      { id: 'a', text: '16 years', correct: false },
      { id: 'b', text: '18 years', correct: true },
      { id: 'c', text: '21 years', correct: false },
      { id: 'd', text: '25 years', correct: false },
    ],
    explanation: 'In 1989, India lowered the voting age from 21 to 18, giving young adults a voice.',
  },
  {
    id: 'v307_q2',
    type: 'MCQ',
    tier: 'WEAK',
    text: '"Universal adult franchise" means:',
    options: [
      { id: 'a', text: 'Only rich adults can vote', correct: false },
      { id: 'b', text: 'Every adult citizen can vote without discrimination', correct: true },
      { id: 'c', text: 'Only men can vote', correct: false },
      { id: 'd', text: 'Only landowners vote', correct: false },
    ],
    explanation: 'Every adult citizen of India (currently 18+) can vote, regardless of caste, religion, gender, education, or income.',
  },
  {
    id: 'v307_q3',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'Why is universal adult franchise such a big achievement for India?',
    rubricHint: 'Mention: (1) all adults included from start (1950), (2) many democracies didn\'t allow this initially, (3) ensures truly representative government.',
  },
  {
    id: 'v307_q4',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'How does an election help ordinary citizens influence the government?',
    rubricHint: 'Mention: (1) choose leaders, (2) hold them accountable, (3) change government if dissatisfied.',
  },
  {
    id: 'v307_q5',
    type: 'FEYNMAN',
    text: 'A friend says: "My one vote doesn\'t matter."\n\nExplain why voting still matters in a democracy.',
    keyConcepts: ['every vote counts in close races', 'shows your view', 'changes governments collectively', 'duty in democracy'],
  },
  {
    id: 'v307_q6',
    type: 'BLURT',
    text: 'Election process in India',
  },
];

export const QUESTIONS_v308: Question[] = [
  {
    id: 'v308_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'The Election Commission of India is mainly responsible for:',
    options: [
      { id: 'a', text: 'Setting tax rates', correct: false },
      { id: 'b', text: 'Conducting free and fair elections', correct: true },
      { id: 'c', text: 'Running schools', correct: false },
      { id: 'd', text: 'Building highways', correct: false },
    ],
    explanation: 'The ECI is an independent body that organises elections to Parliament, state legislatures, and the offices of President and Vice-President.',
  },
  {
    id: 'v308_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'The Election Commission is meant to be:',
    options: [
      { id: 'a', text: 'Controlled by the ruling party', correct: false },
      { id: 'b', text: 'Independent from government control', correct: true },
      { id: 'c', text: 'Part of the Supreme Court', correct: false },
      { id: 'd', text: 'Part of the Cabinet', correct: false },
    ],
    explanation: 'Independence is vital so the ECI can act fairly, even against the ruling government if needed.',
  },
  {
    id: 'v308_q3',
    type: 'DESCRIPTIVE',
    tier: 'DEVELOPING',
    text: 'Why must the Election Commission be independent of the government in power?',
    rubricHint: 'Mention: (1) avoid bias for ruling party, (2) ensure fair elections, (3) trust of citizens, (4) democracy depends on it.',
  },
  {
    id: 'v308_q4',
    type: 'FEYNMAN',
    text: 'A friend asks why someone has to "organise" elections — "Why can\'t parties just count their own votes?"\n\nExplain the role of the ECI.',
    keyConcepts: ['independent body', 'sets rules, counts votes', 'punishes violations', 'protects fairness'],
  },
  {
    id: 'v308_q5',
    type: 'BLURT',
    text: 'Role of the Election Commission',
  },
  {
    id: 'v308_q6',
    type: 'ACTIVE_RECALL',
    text: 'A ruling party tries to ban an opposition leader from contesting.\n\nUsing the ECI\'s role, explain how this could be challenged.',
  },
];

// ─── civ_ch4: Local Government ─────────────────────────────────────────────

export const QUESTIONS_v401: Question[] = [
  {
    id: 'v401_q1',
    type: 'MCQ',
    text: 'A Gram Panchayat is the local government of a:',
    options: [
      { id: 'a', text: 'City', correct: false },
      { id: 'b', text: 'Village (or group of villages)', correct: true },
      { id: 'c', text: 'State', correct: false },
      { id: 'd', text: 'Country', correct: false },
    ],
    explanation: 'The Gram Panchayat governs a village or cluster of villages — the lowest level of elected government in India.',
  },
  {
    id: 'v401_q2',
    type: 'MCQ',
    text: 'The head of a Gram Panchayat is usually called the:',
    options: [
      { id: 'a', text: 'Mayor', correct: false },
      { id: 'b', text: 'Sarpanch (or Pradhan)', correct: true },
      { id: 'c', text: 'Chief Minister', correct: false },
      { id: 'd', text: 'Governor', correct: false },
    ],
    explanation: 'The Sarpanch (called Pradhan in some states) is the elected head of the Gram Panchayat.',
  },
  {
    id: 'v401_q3',
    type: 'MCQ',
    text: 'The Gram Sabha is:',
    options: [
      { id: 'a', text: 'A national assembly', correct: false },
      { id: 'b', text: 'A meeting of all adult voters of the village', correct: true },
      { id: 'c', text: 'A district court', correct: false },
      { id: 'd', text: 'A police station', correct: false },
    ],
    explanation: 'The Gram Sabha is the village-wide meeting of all adult citizens who together oversee the Gram Panchayat.',
  },
  {
    id: 'v401_q4',
    type: 'DESCRIPTIVE',
    text: 'Why is a Gram Panchayat important for villagers\' daily life?',
    rubricHint: 'Mention: (1) handles roads, water, schools, sanitation, (2) closer than higher government, (3) directly addresses local needs.',
  },
  {
    id: 'v401_q5',
    type: 'DESCRIPTIVE',
    text: 'How does the Gram Sabha keep the Panchayat accountable?',
    rubricHint: 'Mention: (1) reviews work, (2) approves budgets and plans, (3) raises issues directly.',
  },
  {
    id: 'v401_q6',
    type: 'FEYNMAN',
    text: 'A friend thinks decisions are "all made in Delhi."\n\nExplain how Gram Panchayats put power closer to ordinary villagers.',
    keyConcepts: ['local control', 'understands local needs', 'directly elected by villagers', 'lowest level of democracy'],
  },
];

export const QUESTIONS_v402: Question[] = [
  {
    id: 'v402_q1',
    type: 'MCQ',
    text: 'Panchayati Raj has how many levels?',
    options: [
      { id: 'a', text: 'One', correct: false },
      { id: 'b', text: 'Three (village, block, district)', correct: true },
      { id: 'c', text: 'Five', correct: false },
      { id: 'd', text: 'Ten', correct: false },
    ],
    explanation: 'The 73rd Amendment established a 3-tier Panchayati Raj — Gram Panchayat (village), Panchayat Samiti (block), Zila Parishad (district).',
  },
  {
    id: 'v402_q2',
    type: 'MCQ',
    text: 'The Panchayati Raj system was given constitutional status by the:',
    options: [
      { id: 'a', text: '42nd Amendment', correct: false },
      { id: 'b', text: '73rd Amendment (1992)', correct: true },
      { id: 'c', text: 'First Amendment', correct: false },
      { id: 'd', text: '86th Amendment', correct: false },
    ],
    explanation: 'The 73rd Constitutional Amendment in 1992 made Panchayati Raj a constitutional requirement for all states.',
  },
  {
    id: 'v402_q3',
    type: 'MCQ',
    text: 'In Panchayati Raj, a certain share of seats is reserved for:',
    options: [
      { id: 'a', text: 'Foreign experts', correct: false },
      { id: 'b', text: 'Women, SCs, and STs', correct: true },
      { id: 'c', text: 'Only rich landowners', correct: false },
      { id: 'd', text: 'Only government officers', correct: false },
    ],
    explanation: 'Seats are reserved for women (often 1/3 or more), Scheduled Castes, and Scheduled Tribes to ensure inclusive participation.',
  },
  {
    id: 'v402_q4',
    type: 'DESCRIPTIVE',
    text: 'Why is having women\'s reservation in Panchayats important?',
    rubricHint: 'Mention: (1) ensures women\'s voice in local decisions, (2) addresses historical exclusion, (3) builds female leaders.',
  },
  {
    id: 'v402_q5',
    type: 'DESCRIPTIVE',
    text: 'How does Panchayati Raj make democracy "from the bottom up"?',
    rubricHint: 'Mention: (1) starts at village level, (2) rises through block and district, (3) people choose nearest representatives.',
  },
  {
    id: 'v402_q6',
    type: 'FEYNMAN',
    text: 'A friend assumes "village politics" is unimportant.\n\nExplain why Panchayati Raj is a big deal for Indian democracy.',
    keyConcepts: ['3 levels of self-government', 'real local power', 'inclusion of marginalised groups', 'foundation of democracy'],
  },
];

export const QUESTIONS_v403: Question[] = [
  {
    id: 'v403_q1',
    type: 'MCQ',
    text: 'A Municipal Corporation is set up in:',
    options: [
      { id: 'a', text: 'Small villages', correct: false },
      { id: 'b', text: 'Large cities', correct: true },
      { id: 'c', text: 'Forests', correct: false },
      { id: 'd', text: 'Schools', correct: false },
    ],
    explanation: 'Municipal Corporations govern large cities (usually with population over a certain limit, like 10 lakh).',
  },
  {
    id: 'v403_q2',
    type: 'MCQ',
    text: 'The head of a Municipal Corporation is the:',
    options: [
      { id: 'a', text: 'Sarpanch', correct: false },
      { id: 'b', text: 'Mayor', correct: true },
      { id: 'c', text: 'Governor', correct: false },
      { id: 'd', text: 'Chief Minister', correct: false },
    ],
    explanation: 'The Mayor is the elected head of a Municipal Corporation (largely ceremonial in many cities, with real administrative power held by Commissioners).',
  },
  {
    id: 'v403_q3',
    type: 'MCQ',
    text: 'A Municipal Corporation\'s jobs typically include:',
    options: [
      { id: 'a', text: 'Foreign relations', correct: false },
      { id: 'b', text: 'Water supply, garbage, streetlights, city roads', correct: true },
      { id: 'c', text: 'Defence of the country', correct: false },
      { id: 'd', text: 'Currency printing', correct: false },
    ],
    explanation: 'Municipal Corporations handle the daily services that keep cities running — water, sanitation, roads, drains, schools.',
  },
  {
    id: 'v403_q4',
    type: 'DESCRIPTIVE',
    text: 'Why do big cities need a Municipal Corporation instead of just a village panchayat?',
    rubricHint: 'Mention: (1) more people, complex needs, (2) bigger budgets, (3) traffic, sanitation at scale.',
  },
  {
    id: 'v403_q5',
    type: 'DESCRIPTIVE',
    text: 'How are councillors in a Municipal Corporation chosen?',
    rubricHint: 'Mention: (1) elected by residents of city wards, (2) one per ward, (3) form the corporation council.',
  },
  {
    id: 'v403_q6',
    type: 'FEYNMAN',
    text: 'A friend asks: "Who decides if my street gets a new streetlight?"\n\nExplain using local government.',
    keyConcepts: ['Municipal Corporation', 'ward councillor', 'budgets and complaints', 'local works decided locally'],
  },
];

export const QUESTIONS_v404: Question[] = [
  {
    id: 'v404_q1',
    type: 'MCQ',
    text: 'Smaller towns (not big cities) are usually governed by:',
    options: [
      { id: 'a', text: 'Municipal Corporation', correct: false },
      { id: 'b', text: 'Municipal Council or Nagar Palika', correct: true },
      { id: 'c', text: 'Gram Panchayat', correct: false },
      { id: 'd', text: 'Zila Parishad', correct: false },
    ],
    explanation: 'Smaller towns are run by Municipal Councils (Nagar Palika). Very large cities have Municipal Corporations.',
  },
  {
    id: 'v404_q2',
    type: 'MCQ',
    text: 'The 74th Amendment (1992) gave constitutional status to:',
    options: [
      { id: 'a', text: 'Village panchayats only', correct: false },
      { id: 'b', text: 'Urban local bodies', correct: true },
      { id: 'c', text: 'The Supreme Court', correct: false },
      { id: 'd', text: 'The Lok Sabha', correct: false },
    ],
    explanation: 'The 74th Amendment ensured every city/town has elected local government — like the 73rd did for villages.',
  },
  {
    id: 'v404_q3',
    type: 'MCQ',
    text: 'A "ward councillor" represents:',
    options: [
      { id: 'a', text: 'A whole state', correct: false },
      { id: 'b', text: 'A specific neighbourhood (ward) in the town/city', correct: true },
      { id: 'c', text: 'A country', correct: false },
      { id: 'd', text: 'A union territory only', correct: false },
    ],
    explanation: 'A city is divided into wards. Each ward elects one councillor to represent its residents in the local body.',
  },
  {
    id: 'v404_q4',
    type: 'DESCRIPTIVE',
    text: 'Why are urban local bodies needed even when there\'s a state government?',
    rubricHint: 'Mention: (1) state can\'t manage daily city issues, (2) local needs differ, (3) democracy reaches every neighbourhood.',
  },
  {
    id: 'v404_q5',
    type: 'DESCRIPTIVE',
    text: 'What kinds of services do urban local bodies typically provide?',
    rubricHint: 'Mention: (1) water and sewage, (2) waste management, (3) local roads and parks, (4) schools, health.',
  },
  {
    id: 'v404_q6',
    type: 'FEYNMAN',
    text: 'A friend thinks all city decisions come from the state government.\n\nExplain how urban local bodies actually run most daily services.',
    keyConcepts: ['Municipal Councils/Corporations', 'ward representation', 'local taxes', 'on-ground services'],
  },
];

export const QUESTIONS_v405: Question[] = [
  {
    id: 'v405_q1',
    type: 'MCQ',
    text: 'A key function of local government is to:',
    options: [
      { id: 'a', text: 'Sign treaties with other countries', correct: false },
      { id: 'b', text: 'Manage local infrastructure and services like water, roads, sanitation', correct: true },
      { id: 'c', text: 'Run national defence', correct: false },
      { id: 'd', text: 'Print currency', correct: false },
    ],
    explanation: 'Local governments handle day-to-day services that affect ordinary life — not foreign or national matters.',
  },
  {
    id: 'v405_q2',
    type: 'MCQ',
    text: 'Local governments raise money mainly through:',
    options: [
      { id: 'a', text: 'Foreign loans', correct: false },
      { id: 'b', text: 'Local taxes (property, water, etc.) and grants from state/central governments', correct: true },
      { id: 'c', text: 'Selling weapons', correct: false },
      { id: 'd', text: 'Border tolls', correct: false },
    ],
    explanation: 'They collect property tax, water charges, professional tax, etc., and get grants from higher levels of government.',
  },
  {
    id: 'v405_q3',
    type: 'MCQ',
    text: 'Why is paying local taxes important?',
    options: [
      { id: 'a', text: 'To make the rich richer', correct: false },
      { id: 'b', text: 'They fund local services everyone uses', correct: true },
      { id: 'c', text: 'To send money abroad', correct: false },
      { id: 'd', text: 'They are not needed', correct: false },
    ],
    explanation: 'Local taxes pay for the water, roads, garbage collection, and schools that citizens use every day.',
  },
  {
    id: 'v405_q4',
    type: 'DESCRIPTIVE',
    text: 'How does effective local government improve everyday life?',
    rubricHint: 'Mention: (1) clean water and roads, (2) safe sanitation, (3) responsive complaints, (4) accountability close to people.',
  },
  {
    id: 'v405_q5',
    type: 'DESCRIPTIVE',
    text: 'How can citizens hold their local government accountable?',
    rubricHint: 'Mention: (1) attend Gram Sabha or ward meetings, (2) vote in elections, (3) RTI requests, (4) raise issues with councillors.',
  },
  {
    id: 'v405_q6',
    type: 'FEYNMAN',
    text: 'A friend says: "I only care about the PM and CM, not my councillor."\n\nExplain why the local councillor often affects daily life more.',
    keyConcepts: ['water, roads, garbage', 'closest official', 'easy to approach', 'directly responsible for local issues'],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// CONCEPT → QUESTIONS LOOKUP MAP
// ═══════════════════════════════════════════════════════════════════════════

export const CONCEPT_QUESTIONS: Record<string, Question[]> = {
  // Science
  c101: QUESTIONS_c101, c102: QUESTIONS_c102, c103: QUESTIONS_c103, c104: QUESTIONS_c104,
  c105: QUESTIONS_c105, c106: QUESTIONS_c106, c107: QUESTIONS_c107, c108: QUESTIONS_c108,
  c201: QUESTIONS_c201, c202: QUESTIONS_c202, c203: QUESTIONS_c203, c204: QUESTIONS_c204,
  c205: QUESTIONS_c205, c206: QUESTIONS_c206,
  c301: QUESTIONS_c301, c302: QUESTIONS_c302, c303: QUESTIONS_c303, c304: QUESTIONS_c304,
  c305: QUESTIONS_c305, c306: QUESTIONS_c306, c307: QUESTIONS_c307, c308: QUESTIONS_c308,
  c309: QUESTIONS_c309, c310: QUESTIONS_c310,
  c401: QUESTIONS_c401, c402: QUESTIONS_c402, c403: QUESTIONS_c403, c404: QUESTIONS_c404,
  c405: QUESTIONS_c405, c406: QUESTIONS_c406, c407: QUESTIONS_c407, c408: QUESTIONS_c408,
  c409: QUESTIONS_c409, c410: QUESTIONS_c410, c411: QUESTIONS_c411, c412: QUESTIONS_c412,
  c501: QUESTIONS_c501, c502: QUESTIONS_c502, c503: QUESTIONS_c503, c504: QUESTIONS_c504,
  c505: QUESTIONS_c505, c506: QUESTIONS_c506, c507: QUESTIONS_c507,
  c601: QUESTIONS_c601, c602: QUESTIONS_c602, c603: QUESTIONS_c603, c604: QUESTIONS_c604,
  c605: QUESTIONS_c605,

  // History
  h101: QUESTIONS_h101, h102: QUESTIONS_h102, h103: QUESTIONS_h103, h104: QUESTIONS_h104,
  h105: QUESTIONS_h105, h106: QUESTIONS_h106, h107: QUESTIONS_h107, h108: QUESTIONS_h108,
  h201: QUESTIONS_h201, h202: QUESTIONS_h202, h203: QUESTIONS_h203, h204: QUESTIONS_h204,
  h205: QUESTIONS_h205, h206: QUESTIONS_h206, h207: QUESTIONS_h207,
  h301: QUESTIONS_h301, h302: QUESTIONS_h302, h303: QUESTIONS_h303, h304: QUESTIONS_h304,
  h305: QUESTIONS_h305, h306: QUESTIONS_h306, h307: QUESTIONS_h307, h308: QUESTIONS_h308,
  h309: QUESTIONS_h309,
  h401: QUESTIONS_h401, h402: QUESTIONS_h402, h403: QUESTIONS_h403, h404: QUESTIONS_h404,
  h405: QUESTIONS_h405, h406: QUESTIONS_h406,

  // Geography
  g101: QUESTIONS_g101, g102: QUESTIONS_g102, g103: QUESTIONS_g103, g104: QUESTIONS_g104,
  g105: QUESTIONS_g105, g106: QUESTIONS_g106,
  g201: QUESTIONS_g201, g202: QUESTIONS_g202, g203: QUESTIONS_g203, g204: QUESTIONS_g204,
  g205: QUESTIONS_g205, g206: QUESTIONS_g206, g207: QUESTIONS_g207,
  g301: QUESTIONS_g301, g302: QUESTIONS_g302, g303: QUESTIONS_g303, g304: QUESTIONS_g304,
  g305: QUESTIONS_g305, g306: QUESTIONS_g306, g307: QUESTIONS_g307, g308: QUESTIONS_g308,
  g401: QUESTIONS_g401, g402: QUESTIONS_g402, g403: QUESTIONS_g403, g404: QUESTIONS_g404,
  g405: QUESTIONS_g405,

  // Civics
  v101: QUESTIONS_v101, v102: QUESTIONS_v102, v104: QUESTIONS_v104, v105: QUESTIONS_v105,
  v106: QUESTIONS_v106,
  v201: QUESTIONS_v201, v202: QUESTIONS_v202, v203: QUESTIONS_v203, v204: QUESTIONS_v204,
  v205: QUESTIONS_v205, v206: QUESTIONS_v206, v207: QUESTIONS_v207,
  v301: QUESTIONS_v301, v302: QUESTIONS_v302, v303: QUESTIONS_v303, v304: QUESTIONS_v304,
  v305: QUESTIONS_v305, v306: QUESTIONS_v306, v307: QUESTIONS_v307, v308: QUESTIONS_v308,
  v401: QUESTIONS_v401, v402: QUESTIONS_v402, v403: QUESTIONS_v403, v404: QUESTIONS_v404,
  v405: QUESTIONS_v405,
};

// ═══════════════════════════════════════════════════════════════════════════
// SOCIETY — Class 6 (NEP "Exploring Society: India and Beyond")
// ═══════════════════════════════════════════════════════════════════════════

// ─── Theme A: Land & People ──────────────────────────────────────────────

export const QUESTIONS_s101: Question[] = [
  {
    id: 's101_q1',
    type: 'MCQ',
    text: 'Why might a hiker carry a map instead of a globe?',
    options: [
      { id: 'a', text: 'Globes are illegal outdoors', correct: false },
      { id: 'b', text: 'A map is flat and portable, and zooms into one area in detail', correct: true },
      { id: 'c', text: 'Maps are always more accurate than globes', correct: false },
      { id: 'd', text: 'Globes show only oceans', correct: false },
    ],
    explanation: 'A globe shows the whole Earth but cannot fit in your pocket. A map flattens out a small area so you can see roads, hills, and rivers up close.',
  },
  {
    id: 's101_q2',
    type: 'DESCRIPTIVE',
    text: 'How do the four parts of a good map — title, scale, symbols, and direction — work together to tell a story?',
    rubricHint: 'Mention: (1) title says what the map shows, (2) scale shows real distance, (3) symbols stand for places, (4) direction tells you which way is north.',
  },
  {
    id: 's101_q3',
    type: 'FEYNMAN',
    text: "Your 5-year-old cousin asks: 'How does a tiny piece of paper know where my house is?'\n\nExplain in plain words how a map works.",
    keyConcepts: ['scale', 'symbols', 'real places', 'direction', 'legend'],
  },
  {
    id: 's101_q4',
    type: 'BLURT',
    text: 'Maps & Globe basics',
  },
  {
    id: 's101_q5',
    type: 'ACTIVE_RECALL',
    text: 'You design a treasure hunt map for your school grounds.\n\nList 4 features your map MUST have so a friend can actually follow it, and explain why each one matters.',
  },
];

export const QUESTIONS_s102: Question[] = [
  {
    id: 's102_q1',
    type: 'MCQ',
    text: 'Latitude lines run in which direction on the globe?',
    options: [
      { id: 'a', text: 'Up and down (north–south)', correct: false },
      { id: 'b', text: 'Horizontally (east–west), like ladder rungs', correct: true },
      { id: 'c', text: 'Diagonally', correct: false },
      { id: 'd', text: 'Only around India', correct: false },
    ],
    explanation: 'Latitude lines circle the Earth horizontally, measuring how far north or south you are from the equator.',
  },
  {
    id: 's102_q2',
    type: 'DESCRIPTIVE',
    text: 'How can knowing just two numbers (latitude and longitude) pinpoint ANY place on Earth?',
    rubricHint: 'Mention: (1) lat gives N/S position, (2) longitude gives E/W position, (3) the grid crossing point = a unique address.',
  },
  {
    id: 's102_q3',
    type: 'FEYNMAN',
    text: 'A friend asks why it is always hot near the equator and freezing near the poles.\n\nExplain using latitude and the angle of sunlight.',
    keyConcepts: ['equator = direct sunlight', 'poles = slanted sunlight', 'energy spreads thin', 'latitude controls climate'],
  },
  {
    id: 's102_q4',
    type: 'BLURT',
    text: 'Latitude & Longitude',
  },
  {
    id: 's102_q5',
    type: 'ACTIVE_RECALL',
    text: 'A pilot reads her location as 28° N, 77° E.\n\nWithout looking at a map, what hemisphere is she in, and roughly what climate would you expect at that latitude?',
  },
];

export const QUESTIONS_s103: Question[] = [
  {
    id: 's103_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'The equator divides Earth into which two hemispheres?',
    options: [
      { id: 'a', text: 'Eastern and Western', correct: false },
      { id: 'b', text: 'Northern and Southern', correct: true },
      { id: 'c', text: 'Land and Water', correct: false },
      { id: 'd', text: 'Hot and Cold', correct: false },
    ],
    explanation: 'The equator (0° latitude) runs east–west, splitting Earth into Northern and Southern hemispheres.',
  },
  {
    id: 's103_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'When it is 12 noon in London, what time is it in India (roughly 5.5 hours ahead)?',
    options: [
      { id: 'a', text: '6:30 AM same day', correct: false },
      { id: 'b', text: '5:30 PM same day', correct: true },
      { id: 'c', text: 'Also 12 noon', correct: false },
      { id: 'd', text: '11:30 PM same day', correct: false },
    ],
    explanation: 'India is 5.5 hours ahead of Greenwich (London), so 12 noon there = 5:30 PM in India.',
  },
  {
    id: 's103_q3',
    type: 'DESCRIPTIVE',
    text: 'Why does India follow just one time zone (IST) even though the country stretches across many degrees of longitude?',
    rubricHint: 'Mention: (1) avoids confusion across the country, (2) easier for trains, schools, offices, (3) trade-off: east and west see sunrise at different real times.',
  },
  {
    id: 's103_q4',
    type: 'FEYNMAN',
    text: "A friend complains: 'It's noon here, so it must be noon EVERYWHERE!'\n\nExplain using Earth's rotation and longitude why that's wrong.",
    keyConcepts: ['Earth rotates west to east', 'sun rises at different places at different times', '15° = 1 hour', 'time zones follow longitude'],
  },
  {
    id: 's103_q5',
    type: 'BLURT',
    text: 'Hemispheres & Time Zones',
  },
  {
    id: 's103_q6',
    type: 'ACTIVE_RECALL',
    text: 'A cousin in New York wants to video-call you in Delhi at her bedtime (9 PM her time, 10.5 hours behind India).\n\nWhat time will it be for you, and is that a good time?',
  },
];

export const QUESTIONS_s104: Question[] = [
  {
    id: 's104_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'How many continents are there on Earth?',
    options: [
      { id: 'a', text: '5', correct: false },
      { id: 'b', text: '7', correct: true },
      { id: 'c', text: '10', correct: false },
      { id: 'd', text: '4', correct: false },
    ],
    explanation: 'The seven continents are Asia, Africa, North America, South America, Antarctica, Europe, and Australia.',
  },
  {
    id: 's104_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Which continent does India belong to?',
    options: [
      { id: 'a', text: 'Africa', correct: false },
      { id: 'b', text: 'Asia', correct: true },
      { id: 'c', text: 'Europe', correct: false },
      { id: 'd', text: 'Australia', correct: false },
    ],
    explanation: 'India is in Asia, the largest continent. It contains over 60% of the world\'s people.',
  },
  {
    id: 's104_q3',
    type: 'DESCRIPTIVE',
    text: 'Why is Antarctica considered a continent even though almost no one lives there permanently?',
    rubricHint: 'Mention: (1) it is a huge landmass, (2) defined by geography not population, (3) covered in ice but is land underneath.',
  },
  {
    id: 's104_q4',
    type: 'FEYNMAN',
    text: 'A friend points to Greenland on a map and says, "Look, it\'s bigger than Africa!"\n\nExplain how flat maps trick us, and how a globe shows the truth.',
    keyConcepts: ['flat maps stretch poles', 'Greenland looks huge but isn\'t', 'Africa is actually 14x bigger', 'use a globe for true size'],
  },
  {
    id: 's104_q5',
    type: 'BLURT',
    text: 'Continents of the World',
  },
  {
    id: 's104_q6',
    type: 'ACTIVE_RECALL',
    text: 'A new student joins your class from a country called Brazil.\n\nUsing what you know about continents, where on Earth is Brazil and what climate might it have?',
  },
];

export const QUESTIONS_s105: Question[] = [
  {
    id: 's105_q1',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'Which is the LARGEST ocean on Earth?',
    options: [
      { id: 'a', text: 'Atlantic Ocean', correct: false },
      { id: 'b', text: 'Pacific Ocean', correct: true },
      { id: 'c', text: 'Indian Ocean', correct: false },
      { id: 'd', text: 'Arctic Ocean', correct: false },
    ],
    explanation: 'The Pacific Ocean is the largest, covering nearly one-third of Earth\'s surface — bigger than all the land combined.',
  },
  {
    id: 's105_q2',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'India is bordered by which ocean to its south?',
    options: [
      { id: 'a', text: 'Atlantic', correct: false },
      { id: 'b', text: 'Indian Ocean', correct: true },
      { id: 'c', text: 'Pacific', correct: false },
      { id: 'd', text: 'Arctic', correct: false },
    ],
    explanation: 'India sits on the Indian Ocean. The Bay of Bengal is to the east, the Arabian Sea to the west — both parts of the Indian Ocean.',
  },
  {
    id: 's105_q3',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'Why have most great cities throughout history been built near oceans or rivers?',
    rubricHint: 'Mention: (1) water for drinking and farming, (2) easy travel and trade, (3) fishing as food source, (4) defence in some cases.',
  },
  {
    id: 's105_q4',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: "How is a sea different from an ocean?",
    rubricHint: 'Mention: (1) seas are smaller, (2) seas are usually surrounded by land or partially enclosed, (3) seas are often part of an ocean.',
  },
  {
    id: 's105_q5',
    type: 'FEYNMAN',
    text: 'A friend thinks oceans are just "lots of water in one place."\n\nExplain why oceans actually shape civilisation — using a real example like India\'s coast or the Silk Road.',
    keyConcepts: ['oceans connect places', 'trade routes', 'food and resources', 'climate effects', 'civilisations grow near water'],
  },
  {
    id: 's105_q6',
    type: 'BLURT',
    text: 'Oceans & Water Bodies',
  },
];

export const QUESTIONS_s106: Question[] = [
  {
    id: 's106_q1',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'A plateau is best described as:',
    options: [
      { id: 'a', text: 'A flat plain at sea level', correct: false },
      { id: 'b', text: 'A flat-topped land area raised above its surroundings', correct: true },
      { id: 'c', text: 'A very tall narrow peak', correct: false },
      { id: 'd', text: 'A deep sea valley', correct: false },
    ],
    explanation: 'A plateau is "high flat land" — like the Deccan Plateau in India, where flat tops sit hundreds of metres above the plains below.',
  },
  {
    id: 's106_q2',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'Why is the Indo-Gangetic plain so important for India?',
    options: [
      { id: 'a', text: 'It has the tallest mountains', correct: false },
      { id: 'b', text: 'Its fertile soil and rivers feed most of India\'s population', correct: true },
      { id: 'c', text: 'It is full of deserts', correct: false },
      { id: 'd', text: 'No one lives there', correct: false },
    ],
    explanation: 'The Indo-Gangetic plain has fertile soil from river deposits and flat land — ideal for farming. It feeds hundreds of millions of people.',
  },
  {
    id: 's106_q3',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'The Himalayas were formed by:',
    options: [
      { id: 'a', text: 'A meteor strike', correct: false },
      { id: 'b', text: 'Two continental plates pushing against each other', correct: true },
      { id: 'c', text: 'A volcano', correct: false },
      { id: 'd', text: 'Wind erosion', correct: false },
    ],
    explanation: 'The Indian plate pushed into the Eurasian plate ~50 million years ago, crumpling the land upward into the Himalayas — which are still rising today.',
  },
  {
    id: 's106_q4',
    type: 'DESCRIPTIVE',
    tier: 'VERY_WEAK',
    text: 'How does the shape of the land (mountains, plains, plateaus) affect how people live there?',
    rubricHint: 'Mention: (1) mountains = harder farming, fewer roads, (2) plains = farming and big cities, (3) plateaus = mining or grazing, (4) climate differences.',
  },
  {
    id: 's106_q5',
    type: 'DESCRIPTIVE',
    tier: 'VERY_WEAK',
    text: 'Why do most ancient civilisations grow on river plains, not on plateaus or mountains?',
    rubricHint: 'Mention: (1) fertile soil from rivers, (2) flat land easy to farm, (3) water year-round, (4) easy transport.',
  },
  {
    id: 's106_q6',
    type: 'FEYNMAN',
    text: 'Your cousin moves from Mumbai (coastal plain) to Shimla (mountain).\n\nExplain three big changes she\'ll notice in daily life — and why the landform causes them.',
    keyConcepts: ['climate (cooler)', 'farming (terraces)', 'travel (winding roads)', 'food and house style'],
  },
];

export const QUESTIONS_s107: Question[] = [
  {
    id: 's107_q1',
    type: 'MCQ',
    text: 'Why does Kerala grow lots of coconut and rice, while Rajasthan grows millets and lentils?',
    options: [
      { id: 'a', text: 'People in Rajasthan don\'t like rice', correct: false },
      { id: 'b', text: 'Their climates are very different — Kerala is wet, Rajasthan is dry', correct: true },
      { id: 'c', text: 'It is a government rule', correct: false },
      { id: 'd', text: 'Both grow the same crops', correct: false },
    ],
    explanation: 'Climate decides which crops thrive. Kerala\'s heavy rain suits rice and coconut; Rajasthan\'s dry climate suits hardy millets.',
  },
  {
    id: 's107_q2',
    type: 'MCQ',
    text: 'Climate is best described as:',
    options: [
      { id: 'a', text: 'Today\'s weather', correct: false },
      { id: 'b', text: 'The average weather pattern of a place over many years', correct: true },
      { id: 'c', text: 'Only the temperature outside', correct: false },
      { id: 'd', text: 'How cloudy it looks right now', correct: false },
    ],
    explanation: 'Weather changes day to day. Climate is the long-term pattern — what to expect on average across years.',
  },
  {
    id: 's107_q3',
    type: 'DESCRIPTIVE',
    text: 'How does climate affect the food, clothes, and houses people use in different parts of India?',
    rubricHint: 'Mention: (1) cold = warm clothes, sloped roofs, (2) hot = light cotton, flat roofs, (3) wet = rice, (4) dry = millet, water storage.',
  },
  {
    id: 's107_q4',
    type: 'FEYNMAN',
    text: "A friend says: 'I'll just wear shorts in Ladakh.'\n\nExplain why climate matters and how it should shape his packing list.",
    keyConcepts: ['Ladakh = cold high desert', 'thin air', 'sub-zero nights', 'layered clothing'],
  },
];

export const QUESTIONS_s108: Question[] = [
  {
    id: 's108_q1',
    type: 'MCQ',
    text: 'In the Thar desert, people store rainwater in tanks called tankas. This is an example of:',
    options: [
      { id: 'a', text: 'Wasting water', correct: false },
      { id: 'b', text: 'Adapting to the dry climate', correct: true },
      { id: 'c', text: 'A modern invention', correct: false },
      { id: 'd', text: 'A government rule', correct: false },
    ],
    explanation: 'When water is scarce, people invent ways to store it. Tankas are an old, smart adaptation to desert life.',
  },
  {
    id: 's108_q2',
    type: 'MCQ',
    text: 'Why are houses in Rajasthan often built with thick walls and small windows?',
    options: [
      { id: 'a', text: 'It looks pretty', correct: false },
      { id: 'b', text: 'Thick walls keep the inside cool in hot weather', correct: true },
      { id: 'c', text: 'There is no glass available', correct: false },
      { id: 'd', text: 'For privacy only', correct: false },
    ],
    explanation: 'Thick mud or stone walls block out the heat of the day, keeping the house cool — a clever adaptation to the harsh sun.',
  },
  {
    id: 's108_q3',
    type: 'DESCRIPTIVE',
    text: 'How do people in mountains (like Himachal) adapt their houses, clothes, and food to the cold?',
    rubricHint: 'Mention: (1) sloped roofs for snow, (2) warm woollen clothes, (3) hearty food (dal, roti, ghee), (4) stone/wood houses.',
  },
  {
    id: 's108_q4',
    type: 'FEYNMAN',
    text: "A friend says: 'Why don't people just move to nice climates?'\n\nExplain why families stay rooted to a place and what 'adaptation' actually means.",
    keyConcepts: ['land = identity, family, livelihood', 'humans invent solutions instead of moving', 'culture grows from adaptation', 'food, clothing, housing all reflect this'],
  },
];


// ─── Theme B: Tapestry of the Past ───────────────────────────────────────

export const QUESTIONS_s201: Question[] = [
  // ═══ LEVEL 1 · EASY ══════════════════════════════════════════════════════
  {
    id: 's201_l1_mcq',
    type: 'MCQ',
    level: 'level1',
    text: 'Gautama Buddha lived around 563–483 BCE. "BCE" stands for:',
    options: [
      { id: 'a', text: 'Before Common Era', correct: true },
      { id: 'b', text: 'British Calendar Era', correct: false },
      { id: 'c', text: 'Before Calendar Existed', correct: false },
      { id: 'd', text: 'Bharat\'s Calendar Era', correct: false },
    ],
    explanation: 'BCE = Before Common Era. It replaced the older notation BC (Before Christ). CE replaces AD. Both mean the same dates.',
  },
  {
    id: 's201_l1_desc',
    type: 'DESCRIPTIVE',
    level: 'level1',
    text: 'Two events: one at 600 BCE and one at 200 BCE. Which is older? Explain why in one sentence.',
    rubricHint: '600 BCE is older. BCE years count backwards — the larger the number, the further back in time it is (closer to the origin of time, further from the present).',
  },
  {
    id: 's201_l1_feyn',
    type: 'FEYNMAN',
    level: 'level1',
    text: 'Your cousin says: "I don\'t get it — if BCE counts backwards, what comes after 1 BCE?"\n\nExplain the BCE/CE dividing point in plain words.',
    keyConcepts: ['BCE counts backward toward zero', 'CE counts forward from one', 'no year zero — it goes 1 BCE then 1 CE', 'the dividing point is a fixed reference, not a special event'],
  },

  // ═══ LEVEL 2 · MODERATE ══════════════════════════════════════════════════
  {
    id: 's201_l2_mcq',
    type: 'MCQ',
    level: 'level2',
    text: 'Ashoka ruled around 268 BCE. Roughly how many years ago did he rule? (assume today ≈ 2000 CE)',
    options: [
      { id: 'a', text: '268 years ago', correct: false },
      { id: 'b', text: 'About 2,268 years ago', correct: true },
      { id: 'c', text: 'About 1,732 years ago', correct: false },
      { id: 'd', text: 'About 268,000 years ago', correct: false },
    ],
    explanation: 'To convert a BCE date to "years ago": add the BCE number to the current CE year. 268 + 2000 ≈ 2,268 years ago.',
  },
  {
    id: 's201_l2_desc',
    type: 'DESCRIPTIVE',
    level: 'level2',
    text: 'A historian writes "about 2,500 years ago" instead of "500 BCE." Why might she prefer approximate language?',
    rubricHint: 'Ancient dates are rarely pinpoint exact — historians usually have a range, not a single year; "about X years ago" is honest about that uncertainty; also more intuitive for a general reader than a BCE number.',
  },
  {
    id: 's201_l2_feyn',
    type: 'FEYNMAN',
    level: 'level2',
    text: 'A friend asks: "Why can\'t we just write the number 500 — why add BCE or CE after it?"\n\nExplain why the label is essential.',
    keyConcepts: ['500 CE and 500 BCE are 1,000 years apart — completely different eras', 'the label tells you which side of the reference point', 'without it, the date is dangerously ambiguous'],
  },

  // ═══ LEVEL 3 · STRONG ════════════════════════════════════════════════════
  {
    id: 's201_l3_mcq',
    type: 'MCQ',
    level: 'level3',
    text: 'A coin is dated 184 BCE. An inscription nearby is dated 84 CE. How many years apart are they?',
    options: [
      { id: 'a', text: '100 years', correct: false },
      { id: 'b', text: '268 years', correct: true },
      { id: 'c', text: '184 years', correct: false },
      { id: 'd', text: '84 years', correct: false },
    ],
    explanation: '184 BCE to 1 CE = 184 years, plus 1 CE to 84 CE = 84 years. Total = 268 years. (There is no year zero.)',
  },
  {
    id: 's201_l3_desc',
    type: 'DESCRIPTIVE',
    level: 'level3',
    text: 'The Rigveda was composed around 1500–1200 BCE; the Mahabharata around 400 BCE–400 CE. Use BCE/CE reasoning to explain which is older and by roughly how much.',
    rubricHint: 'The Rigveda is older — its earliest part (c. 1500 BCE) predates the Mahabharata\'s start (c. 400 BCE) by roughly 1,100 years. Subtract the smaller BCE number from the larger to find the gap (1500 – 400 = 1,100 years).',
  },
  {
    id: 's201_l3_feyn',
    type: 'FEYNMAN',
    level: 'level3',
    text: 'A friend says: "BCE/CE is universal — everyone in the world uses it."\n\nExplain why this is only partly true.',
    keyConcepts: ['BCE/CE is one of many calendar systems in use', 'India has the Hindu Panchang, Islam uses the Hijri calendar, China has its own', 'BCE/CE is convenient for international historical comparison — not a global daily standard', 'the reference point was set by a medieval European monk and is only approximate even for its original purpose'],
  },

  // ═══ STRENGTHEN · BLURT ══════════════════════════════════════════════════
  {
    id: 's201_str_blurt',
    type: 'BLURT',
    level: 'strengthen',
    text: 'the BCE and CE timeline system — what the terms mean, which direction each counts, how to calculate "years ago" from a BCE date, and why historians need fixed labels instead of "X years ago"',
  },

  // ═══ REVISE · ACTIVE_RECALL ══════════════════════════════════════════════
  {
    id: 's201_rev_recall',
    type: 'ACTIVE_RECALL',
    level: 'revise',
    text: 'An archaeologist finds two ancient sites near Patna. Site A has coins stamped with the number "152" (no era label). Site B has an inscription saying "built 300 years after the great king Ashoka died." Ashoka died around 232 BCE.\n\n(1) Using BCE/CE reasoning, when was Site B\'s building constructed? (2) Why can\'t the historian be sure whether Site A\'s coins are 152 BCE or 152 CE? (3) What evidence would help her decide?',
  },
];

export const QUESTIONS_s202: Question[] = [
  // ═══ LEVEL 1 · EASY ══════════════════════════════════════════════════════
  {
    id: 's202_l1_mcq',
    type: 'MCQ',
    level: 'level1',
    text: 'A "manuscript" is best described as:',
    options: [
      { id: 'a', text: 'A handwritten text from the past, often on palm leaves or bark', correct: true },
      { id: 'b', text: 'A stone carving made by a sculptor', correct: false },
      { id: 'c', text: 'An old metal coin', correct: false },
      { id: 'd', text: 'A modern printed book about history', correct: false },
    ],
    explanation: 'Manuscripts are handwritten texts — on palm leaves, birch bark, or parchment. They are one of India\'s richest historical sources.',
  },
  {
    id: 's202_l1_desc',
    type: 'DESCRIPTIVE',
    level: 'level1',
    text: 'Name three different types of sources historians use to learn about the past, and give one example of each.',
    rubricHint: 'Any three of: manuscripts (palm-leaf texts), inscriptions (Ashokan edicts on rock/pillar), coins (Gupta gold coins), buildings/ruins (Ajanta caves), tools/pottery (Harappan pots), oral traditions (folk songs and stories).',
  },
  {
    id: 's202_l1_feyn',
    type: 'FEYNMAN',
    level: 'level1',
    text: 'Your friend says: "Archaeology is just digging in the dirt."\n\nExplain what an archaeologist actually does and why it matters.',
    keyConcepts: ['carefully excavates layers of soil', 'studies objects people left behind (pottery, bones, coins)', 'uses evidence to reconstruct how people lived', 'small objects can reveal big facts about a civilisation'],
  },

  // ═══ LEVEL 2 · MODERATE ══════════════════════════════════════════════════
  {
    id: 's202_l2_mcq',
    type: 'MCQ',
    level: 'level2',
    text: 'A stone pillar inscription carved by King Ashoka himself is a:',
    options: [
      { id: 'a', text: 'Secondary source — someone wrote about Ashoka later', correct: false },
      { id: 'b', text: 'Primary source — it comes directly from Ashoka\'s own time', correct: true },
      { id: 'c', text: 'An oral tradition', correct: false },
      { id: 'd', text: 'A manuscript', correct: false },
    ],
    explanation: 'Primary sources come directly from the period being studied — inscriptions, coins, tools. A textbook summarising Ashoka would be secondary.',
  },
  {
    id: 's202_l2_desc',
    type: 'DESCRIPTIVE',
    level: 'level2',
    text: 'A king\'s inscription boasts that he won a great battle and the enemy was completely destroyed. Why might a historian be cautious about trusting this?',
    rubricHint: 'Kings commissioned inscriptions to glorify themselves — they would exaggerate victories, hide defeats, and omit inconvenient facts. One-sided sources can mislead; historians cross-check with other sources (enemy records, coins, archaeology).',
  },
  {
    id: 's202_l2_feyn',
    type: 'FEYNMAN',
    level: 'level2',
    text: 'A friend says: "If we have one old text that says X happened, then X definitely happened."\n\nExplain why historians are not satisfied with just one source.',
    keyConcepts: ['every source has a point of view or bias', 'single sources can be wrong, exaggerated, or incomplete', 'historians cross-check multiple sources', 'only when several independent sources agree can historians feel confident'],
  },

  // ═══ LEVEL 3 · STRONG ════════════════════════════════════════════════════
  {
    id: 's202_l3_mcq',
    type: 'MCQ',
    level: 'level3',
    text: 'Historians find no written records of a particular ancient tribe. This most likely means:',
    options: [
      { id: 'a', text: 'The tribe never existed', correct: false },
      { id: 'b', text: 'The tribe was not important', correct: false },
      { id: 'c', text: 'Records were lost, destroyed, or never made — absence of evidence is not proof of absence', correct: true },
      { id: 'd', text: 'Historians are not skilled enough to find them', correct: false },
    ],
    explanation: 'Absence of written records often means ordinary people\'s lives were not recorded (rulers wrote history), or records decayed, or they simply haven\'t been found yet.',
  },
  {
    id: 's202_l3_desc',
    type: 'DESCRIPTIVE',
    level: 'level3',
    text: 'If historians only had a single manuscript describing Ashoka as a bad king, and all other evidence (inscriptions, coins, Buddhist texts) described him as a great reformer — what should a historian do? Explain your reasoning.',
    rubricHint: 'The single conflicting source should be treated with skepticism but not dismissed — check who wrote it and why; weigh it against the many consistent sources; if the single source is clearly from a rival or enemy, discount it; good historians assess quality and motive, not just quantity.',
  },
  {
    id: 's202_l3_feyn',
    type: 'FEYNMAN',
    level: 'level3',
    text: 'A friend says: "The further back in history we go, the more we know — because there are more years of records."\n\nExplain why the opposite is actually true.',
    keyConcepts: ['older records are rarer — most have been lost to time, fire, floods, decay', 'ancient societies had less writing to begin with', 'more recent history has more surviving sources and more people who could write', 'deep history relies heavily on archaeology (physical objects), not just text'],
  },

  // ═══ STRENGTHEN · BLURT ══════════════════════════════════════════════════
  {
    id: 's202_str_blurt',
    type: 'BLURT',
    level: 'strengthen',
    text: 'how historians find out about the past — sources (manuscripts, inscriptions, coins, buildings, oral traditions), what primary vs secondary means, why sources can be biased, and why multiple sources matter',
  },

  // ═══ REVISE · ACTIVE_RECALL ══════════════════════════════════════════════
  {
    id: 's202_rev_recall',
    type: 'ACTIVE_RECALL',
    level: 'revise',
    text: 'Workers digging a new road in Tamil Nadu uncover a sealed clay pot containing 200 old Roman gold coins.\n\nAs a historian, list at least three questions you must answer before you can say what this discovery tells us about ancient India. For each question, explain why it matters.',
  },
];

export const QUESTIONS_s203: Question[] = [
  // ═══ LEVEL 1 · EASY · the basics — a mix of all 3 types ═══════════════════
  {
    id: 's203_l1_mcq',
    type: 'MCQ',
    level: 'level1',
    text: 'In the Ṛig Veda, India\'s most ancient text, the northwest region of the Subcontinent is called "Sapta Sindhava". What does this name mean?',
    options: [
      { id: 'a', text: 'The land of the seven rivers', correct: true },
      { id: 'b', text: 'The land of the seven mountains', correct: false },
      { id: 'c', text: 'The country of the Bharatas', correct: false },
      { id: 'd', text: 'The island of the jamun tree', correct: false },
    ],
    explanation: '"Sapta Sindhava" means "the land of the seven rivers". The word "Sindhava" comes from "Sindhu", the Indus River.',
  },
  {
    id: 's203_l1_desc',
    type: 'DESCRIPTIVE',
    level: 'level1',
    text: 'Name any two ancient names that Indians themselves used for India, and say which old text each one comes from.',
    rubricHint: 'Any two of: (1) "Sapta Sindhava" — Ṛig Veda; (2) "Bhāratavarṣha" — Mahābhārata; (3) "Jambudvīpa" — Mahābhārata / Aśhoka\'s inscription; (4) "Bhārata" — Viṣhṇu Purāṇa.',
  },
  {
    id: 's203_l1_feyn',
    type: 'FEYNMAN',
    level: 'level1',
    text: 'Your 6-year-old cousin asks: "What does the name Bharat mean?"\n\nExplain it in plain, simple words.',
    keyConcepts: ['Bhārata = country of the Bharatas', 'Bharata was an old group of people in the Ṛig Veda', 'it is a very old name for India', 'still used today in Indian languages'],
  },

  // ═══ LEVEL 2 · MODERATE · understanding it — a mix of all 3 types ═════════
  {
    id: 's203_l2_mcq',
    type: 'MCQ',
    level: 'level2',
    text: 'Foreign names for India such as "Hind" (Persian), "Indoi" (Greek) and "Yindu" (Chinese) were all adapted from which original word?',
    options: [
      { id: 'a', text: 'Bharata', correct: false },
      { id: 'b', text: 'Jambudvīpa', correct: false },
      { id: 'c', text: 'Sindhu (the Indus River)', correct: true },
      { id: 'd', text: 'Hindustān', correct: false },
    ],
    explanation: 'All these foreign names trace back to "Sindhu". Persians said "Hindu", Greeks dropped the "h" to get "Indoi", and the Chinese said "Yindu" — all from Sindhu.',
  },
  {
    id: 's203_l2_desc',
    type: 'DESCRIPTIVE',
    level: 'level2',
    text: 'Explain how the names Indians gave their land differ from the names that foreigners gave it.',
    rubricHint: 'Mention: (1) Indian names came from texts (Ṛig Veda, Mahābhārata) — Jambudvīpa, Bhārata; (2) foreign names came from visitors/invaders and were mostly derived from the Sindhu/Indus River — Hind, Indoi, Yindu; (3) "Bhārata" became the widespread name in Indian languages.',
  },
  {
    id: 's203_l2_feyn',
    type: 'FEYNMAN',
    level: 'level2',
    text: 'A friend says: "The names India and Hindustan must have come from totally different places."\n\nExplain how the words Sindhu, Hindu, India and Hindustan are actually all connected.',
    keyConcepts: ['all trace back to Sindhu (Indus River)', 'Persians changed Sindhu → Hindu', 'Greeks dropped the h → Indoi → India', 'Hindustān is the Persian "Hindu" + "stān" (land)'],
  },

  // ═══ LEVEL 3 · STRONG · using it in new situations — a mix of all 3 types ══
  {
    id: 's203_l3_mcq',
    type: 'MCQ',
    level: 'level3',
    text: 'In ancient Persian, the word "Hindu" originally referred to a geographical region — NOT a religion. Which fact best supports this?',
    options: [
      { id: 'a', text: 'The Persians used "Hindu" for the land around the Sindhu (Indus) River', correct: true },
      { id: 'b', text: 'The Persians worshipped Indian gods', correct: false },
      { id: 'c', text: 'The word "Hindu" first appears in the Ṛig Veda', correct: false },
      { id: 'd', text: 'Greeks invented the word "Hindu"', correct: false },
    ],
    explanation: 'The Persians, after gaining control of the Indus region in the 6th century BCE, used "Hind/Hindu" simply for that land. It was a place-name borrowed from "Sindhu", not a religious label.',
  },
  {
    id: 's203_l3_desc',
    type: 'DESCRIPTIVE',
    level: 'level3',
    text: 'The Viṣhṇu Purāṇa describes Bhārata as "the country that lies north of the ocean and south of the snowy mountains". How does this ancient description match the India we know on a map today?',
    rubricHint: 'Mention: (1) "snowy mountains" = the Himalayas in the north; (2) "the ocean" = the Indian Ocean / seas to the south; (3) it shows ancient Indians already understood the subcontinent\'s natural boundaries.',
  },
  {
    id: 's203_l3_feyn',
    type: 'FEYNMAN',
    level: 'level3',
    text: 'Your cousin asks: "Why does the Constitution say \'India, that is Bharat\' — why not just pick one name?"\n\nExplain in plain words why the country carries both names.',
    keyConcepts: ['Bhārata is the ancient name from Indian texts, thousands of years old', 'India comes from Sindhu, used by the wider world', 'both honour different parts of the country\'s story', 'the Constitution recognises both as official'],
  },

  // ═══ STRENGTHEN · BLURT (brain-dump everything you remember) ══════════════
  {
    id: 's203_str_blurt',
    type: 'BLURT',
    level: 'strengthen',
    text: 'all the names of India (Bharat, Sapta Sindhava, Jambudvīpa, Hindustan, India) — what each one means, where it came from, and who used it',
  },

  // ═══ REVISE · ACTIVE_RECALL · transfer to a new situation ═════════════════
  {
    id: 's203_rev_recall',
    type: 'ACTIVE_RECALL',
    level: 'revise',
    text: 'A travel blogger writes: "Ancient Indians had no idea how big their land was — it took foreigners to map it out."\n\nUsing at least two pieces of evidence from what you learned (think of ancient texts and the Tamil poem), explain why this statement is wrong.',
  },
];

export const QUESTIONS_s204: Question[] = [
  // ═══ LEVEL 1 · EASY ══════════════════════════════════════════════════════
  {
    id: 's204_l1_mcq',
    type: 'MCQ',
    level: 'level1',
    text: 'How many Vedas are there, and what is the oldest one called?',
    options: [
      { id: 'a', text: 'Three Vedas; the oldest is Samaveda', correct: false },
      { id: 'b', text: 'Four Vedas; the oldest is the Rigveda', correct: true },
      { id: 'c', text: 'Two Vedas; the oldest is Atharvaveda', correct: false },
      { id: 'd', text: 'Seven Vedas; the oldest is Yajurveda', correct: false },
    ],
    explanation: 'There are four Vedas: Rigveda, Samaveda, Yajurveda, Atharvaveda. The Rigveda is the oldest — composed around 1500–1200 BCE.',
  },
  {
    id: 's204_l1_desc',
    type: 'DESCRIPTIVE',
    level: 'level1',
    text: 'What are the Vedas? In 2–3 sentences, describe what kind of texts they are and what they contain.',
    rubricHint: 'Vedas are the oldest sacred texts of India; they are a collection of hymns, prayers, and knowledge about rituals; they were composed in Sanskrit and transmitted orally before being written down; Rigveda contains over 1,000 hymns praising nature and the gods.',
  },
  {
    id: 's204_l1_feyn',
    type: 'FEYNMAN',
    level: 'level1',
    text: 'Your friend asks: "Why did ancient Indians memorise the Vedas instead of writing them down right away?"\n\nExplain two possible reasons in simple words.',
    keyConcepts: ['writing was rare and expensive — palm leaves and bark were hard to prepare in large numbers', 'oral tradition was trusted — trained reciters memorised word for word using special chanting patterns', 'the sacred sound of the words was considered essential — reading was seen as less reliable', 'this was the culture before printing existed'],
  },

  // ═══ LEVEL 2 · MODERATE ══════════════════════════════════════════════════
  {
    id: 's204_l2_mcq',
    type: 'MCQ',
    level: 'level2',
    text: 'The Mahabharata and Ramayana are called "epics." What makes a text an epic?',
    options: [
      { id: 'a', text: 'It was written in a foreign language', correct: false },
      { id: 'b', text: 'It is a very long poem/narrative with heroic characters, battles, and moral lessons', correct: true },
      { id: 'c', text: 'It is a scientific textbook from ancient times', correct: false },
      { id: 'd', text: 'It is a short story about a king', correct: false },
    ],
    explanation: 'An epic is a long narrative poem featuring heroes, wars, journeys, and moral dilemmas. The Mahabharata has 100,000 verses — the world\'s longest epic.',
  },
  {
    id: 's204_l2_desc',
    type: 'DESCRIPTIVE',
    level: 'level2',
    text: 'What is the difference between the Vedas and the Epics (Mahabharata, Ramayana)? Give at least two differences.',
    rubricHint: 'Vedas are older (1500 BCE+) vs epics are more recent (400 BCE–400 CE); Vedas are hymns and rituals vs epics are stories of heroes and battles; Vedas are considered sacred/revealed texts vs epics are narrative literature; Vedas were memorised by priests vs epics were told widely to all people.',
  },
  {
    id: 's204_l2_feyn',
    type: 'FEYNMAN',
    level: 'level2',
    text: 'A friend says: "The Puranas are just made-up stories, so they\'re not useful for historians."\n\nExplain why Puranas ARE useful as historical sources even if they mix mythology with history.',
    keyConcepts: ['Puranas contain king lists and genealogies that help historians trace dynasties', 'they preserve cultural traditions, values, and social practices of their time', 'myths often carry historical memory in symbolic form', 'even "stories" reflect the world of the people who told them'],
  },

  // ═══ LEVEL 3 · STRONG ════════════════════════════════════════════════════
  {
    id: 's204_l3_mcq',
    type: 'MCQ',
    level: 'level3',
    text: 'The Upanishads are philosophical texts that ask: "What is the nature of reality? What is the self?" This makes them most similar to:',
    options: [
      { id: 'a', text: 'A recipe book', correct: false },
      { id: 'b', text: 'Philosophy — deep questions about existence and knowledge', correct: true },
      { id: 'c', text: 'A war chronicle', correct: false },
      { id: 'd', text: 'A trade manual', correct: false },
    ],
    explanation: 'The Upanishads (c. 800–200 BCE) are philosophical dialogues exploring Brahman (ultimate reality) and Atman (the self). They form the basis of Indian philosophical traditions.',
  },
  {
    id: 's204_l3_desc',
    type: 'DESCRIPTIVE',
    level: 'level3',
    text: 'The Rigveda has been transmitted accurately for over 3,000 years — mostly through memory. How did ancient Indians manage this without printing or writing?',
    rubricHint: 'Special chanting techniques (patha) where reciters learned words forward, backward, and in complex patterns to detect errors; training began in childhood and took years; cross-checked across families and regions; mistakes were considered religiously unacceptable — creating strong motivation for accuracy.',
  },
  {
    id: 's204_l3_feyn',
    type: 'FEYNMAN',
    level: 'level3',
    text: 'Your friend says: "India has so many ancient texts — that\'s a bit much. Why did they write so much?"\n\nExplain two real reasons why ancient India produced so many texts.',
    keyConcepts: ['India had a long uninterrupted tradition of scholarship — each generation added to the existing body of knowledge', 'oral culture valued comprehensive documentation of ideas, rituals, and stories', 'Sanskrit was a highly developed language suitable for complex thought', 'many different schools of thought (Vedic, Buddhist, Jain) each produced their own texts'],
  },

  // ═══ STRENGTHEN · BLURT ══════════════════════════════════════════════════
  {
    id: 's204_str_blurt',
    type: 'BLURT',
    level: 'strengthen',
    text: 'the ancient texts of India — the four Vedas, the Upanishads, the epics (Mahabharata and Ramayana), the Puranas — what each type is, roughly when it was composed, and what it contains',
  },

  // ═══ REVISE · ACTIVE_RECALL ══════════════════════════════════════════════
  {
    id: 's204_rev_recall',
    type: 'ACTIVE_RECALL',
    level: 'revise',
    text: 'A researcher discovers an ancient palm-leaf manuscript in a Kerala library. The text contains hymns praising the sun and fire, written in very old Sanskrit. The librarian says it might be part of the Rigveda.\n\nUsing what you know about the Vedas: (1) What would confirm whether this is actually a Vedic text? (2) Why is it significant that it survived on palm leaves when the Vedas were supposed to be oral? (3) What can this manuscript tell a historian about ancient India?',
  },
];

export const QUESTIONS_s205: Question[] = [
  // ═══ LEVEL 1 · EASY ══════════════════════════════════════════════════════
  {
    id: 's205_l1_mcq',
    type: 'MCQ',
    level: 'level1',
    text: 'The word "Ayurveda" comes from Sanskrit and means:',
    options: [
      { id: 'a', text: 'Science of the stars', correct: false },
      { id: 'b', text: 'Knowledge of life / science of life', correct: true },
      { id: 'c', text: 'Art of breathing', correct: false },
      { id: 'd', text: 'Study of plants', correct: false },
    ],
    explanation: '"Ayus" = life, "Veda" = knowledge. Ayurveda is India\'s ancient system of medicine, covering diet, herbs, surgery, and lifestyle.',
  },
  {
    id: 's205_l1_desc',
    type: 'DESCRIPTIVE',
    level: 'level1',
    text: 'What is Yoga, and where does the word come from? Describe it in 2–3 sentences.',
    rubricHint: 'Yoga comes from Sanskrit "yuj" meaning to join or unite; it is a practice that combines physical postures, breathing, and meditation; the goal is to unite the body and mind; Patanjali wrote the Yoga Sutras (c. 400 CE), the foundational text of classical yoga.',
  },
  {
    id: 's205_l1_feyn',
    type: 'FEYNMAN',
    level: 'level1',
    text: 'Your cousin says: "Aryabhata was just an ancient mathematician — what did he discover that we don\'t already know?"\n\nName two things Aryabhata figured out and explain why they mattered.',
    keyConcepts: ['Aryabhata (476–550 CE) calculated the value of pi accurately to 4 decimal places', 'He said the Earth rotates on its axis — centuries before Europeans accepted this', 'He worked on algebra and trigonometry', 'His decimal and zero system influenced the numerals the whole world uses today'],
  },

  // ═══ LEVEL 2 · MODERATE ══════════════════════════════════════════════════
  {
    id: 's205_l2_mcq',
    type: 'MCQ',
    level: 'level2',
    text: 'Sushruta, the ancient Indian physician, is especially famous for:',
    options: [
      { id: 'a', text: 'Inventing the zero', correct: false },
      { id: 'b', text: 'Performing plastic surgery and detailed surgical procedures over 2,500 years ago', correct: true },
      { id: 'c', text: 'Writing the Yoga Sutras', correct: false },
      { id: 'd', text: 'Building the Iron Pillar at Delhi', correct: false },
    ],
    explanation: 'Sushruta\'s Sushruta Samhita (c. 600 BCE) describes over 300 surgical procedures, 120 surgical instruments, and techniques including plastic surgery and cataract removal.',
  },
  {
    id: 's205_l2_desc',
    type: 'DESCRIPTIVE',
    level: 'level2',
    text: 'The Iron Pillar at Delhi has stood for over 1,600 years without rusting significantly. Why is this remarkable, and what does it tell us about ancient Indian knowledge?',
    rubricHint: 'Modern iron rusts quickly when exposed to air and moisture; the pillar (built c. 400 CE under Chandragupta II) contains a special phosphorus-rich composition that forms a protective layer; this shows ancient Indian metallurgists had sophisticated knowledge of iron alloys far ahead of the rest of the world.',
  },
  {
    id: 's205_l2_feyn',
    type: 'FEYNMAN',
    level: 'level2',
    text: 'A friend says: "The invention of zero — it\'s just a placeholder. What\'s the big deal?"\n\nExplain why zero is one of the most important inventions in human history.',
    keyConcepts: ['without zero, you can\'t write large numbers efficiently', 'zero enables the decimal place-value system — the foundation of all modern arithmetic and computing', 'without zero, algebra, calculus, and all of modern mathematics would be impossible', 'before India invented it, Europeans used Roman numerals (no zero) — far harder to compute with'],
  },

  // ═══ LEVEL 3 · STRONG ════════════════════════════════════════════════════
  {
    id: 's205_l3_mcq',
    type: 'MCQ',
    level: 'level3',
    text: 'The Iron Pillar was built in approximately 400 CE. Modern engineers have studied it. What is the most significant finding?',
    options: [
      { id: 'a', text: 'It is made of pure gold covered in iron paint', correct: false },
      { id: 'b', text: 'Ancient Indian metallurgists achieved a rust-resistant iron composition that modern science only recently understood', correct: true },
      { id: 'c', text: 'It was brought to India from China', correct: false },
      { id: 'd', text: 'It rusts on the inside but looks clean outside', correct: false },
    ],
    explanation: 'The pillar\'s high phosphorus content creates a thin protective iron hydrogen phosphate layer (misawite). This process was only understood by modern metallurgists in the 1990s — yet ancient Indians achieved it empirically.',
  },
  {
    id: 's205_l3_desc',
    type: 'DESCRIPTIVE',
    level: 'level3',
    text: 'In what two ways has ancient Indian science directly shaped the modern world? Give specific examples.',
    rubricHint: 'The decimal number system with zero (invented in India, transmitted via Arabs to Europe as "Arabic numerals") is the foundation of all modern mathematics and computing; Yoga is now a global wellness practice; Ayurvedic principles (herbal medicine, mind-body connection) have influenced modern integrative medicine; Indian astronomy (Aryabhata\'s work) advanced the understanding of planetary motion.',
  },
  {
    id: 's205_l3_feyn',
    type: 'FEYNMAN',
    level: 'level3',
    text: 'Aryabhata lived in 476 CE and claimed that the Earth rotates on its axis causing day and night — not the Sun moving around the Earth.\n\nExplain why this claim was remarkable for his time, and why most people probably didn\'t believe him.',
    keyConcepts: ['to the naked eye it looks like the Sun moves across the sky — the intuitive assumption is Earth is still', 'most ancient civilisations (Greek, Roman, Egyptian) believed in a geocentric (Earth-centred) universe', 'without telescopes, Aryabhata reached this conclusion through mathematical reasoning alone', 'he was right — but it took Europe 1,000 more years to reach the same conclusion (Copernicus, 1543 CE)'],
  },

  // ═══ STRENGTHEN · BLURT ══════════════════════════════════════════════════
  {
    id: 's205_str_blurt',
    type: 'BLURT',
    level: 'strengthen',
    text: 'ancient Indian science and knowledge systems — Yoga (Patanjali), Ayurveda (Charaka, Sushruta), mathematics (Aryabhata, zero, decimal system), astronomy, and metallurgy (Iron Pillar) — what each achievement was and why it mattered',
  },

  // ═══ REVISE · ACTIVE_RECALL ══════════════════════════════════════════════
  {
    id: 's205_rev_recall',
    type: 'ACTIVE_RECALL',
    level: 'revise',
    text: 'A doctor at a wellness clinic is combining modern medicine with Ayurvedic herbal remedies and yoga for her patients. A colleague argues: "This is pseudoscience — ancient practices have no place in modern medicine."\n\nUsing what you know about Ayurveda and Yoga, give two arguments for why the doctor\'s approach might be reasonable, and one fair limitation she should keep in mind.',
  },
];

export const QUESTIONS_s206: Question[] = [
  // ═══ LEVEL 1 · EASY ══════════════════════════════════════════════════════
  {
    id: 's206_l1_mcq',
    type: 'MCQ',
    level: 'level1',
    text: 'Ancient India was famous for exporting which goods to foreign lands?',
    options: [
      { id: 'a', text: 'Oil, cars, and computers', correct: false },
      { id: 'b', text: 'Spices, cotton cloth, gems, and iron goods', correct: true },
      { id: 'c', text: 'Potatoes and chillies', correct: false },
      { id: 'd', text: 'Wheat and dairy only', correct: false },
    ],
    explanation: 'Ancient India exported spices (pepper, cardamom), fine cotton textiles, precious stones, and iron goods. These were highly prized in Rome, Arabia, and China.',
  },
  {
    id: 's206_l1_desc',
    type: 'DESCRIPTIVE',
    level: 'level1',
    text: 'What was a "shreni" (guild) in ancient India, and what role did it play?',
    rubricHint: 'A shreni was an organised group of craftsmen or traders of the same occupation (weavers, potters, metalworkers); they set quality standards, fixed prices, trained apprentices, and helped members in need; somewhat like a modern trade union or professional association.',
  },
  {
    id: 's206_l1_feyn',
    type: 'FEYNMAN',
    level: 'level1',
    text: 'Your cousin asks: "Why were spices so valuable in ancient times? Can\'t you just grow them?"\n\nExplain in simple words why spices were almost like gold for foreign traders.',
    keyConcepts: ['spices only grew in specific climates (tropical India, Southeast Asia)', 'they were essential for preserving food before refrigeration', 'they were highly desired in Europe and the Middle East where they couldn\'t be grown', 'the rarity + demand made them extremely expensive — a sack of pepper was worth its weight in gold in Rome'],
  },

  // ═══ LEVEL 2 · MODERATE ══════════════════════════════════════════════════
  {
    id: 's206_l2_mcq',
    type: 'MCQ',
    level: 'level2',
    text: 'How did seasonal monsoon winds help ancient Indian sea traders?',
    options: [
      { id: 'a', text: 'The winds blew ships back to port if they got lost', correct: false },
      { id: 'b', text: 'The summer monsoon blew ships toward Arabia/Africa; the winter monsoon blew them back — creating a reliable annual trade cycle', correct: true },
      { id: 'c', text: 'Monsoon winds were avoided — traders only sailed in calm weather', correct: false },
      { id: 'd', text: 'Winds were used to power waterwheels in harbours', correct: false },
    ],
    explanation: 'Sailors called Hippalus "discovered" (for Europeans) that monsoon winds blow northeast in summer and southwest in winter — allowing predictable round trips between India and the Red Sea/East Africa.',
  },
  {
    id: 's206_l2_desc',
    type: 'DESCRIPTIVE',
    level: 'level2',
    text: 'Roman gold coins have been found in large numbers at ancient sites in South India (like Arikamedu in Tamil Nadu). What does this tell a historian about ancient trade?',
    rubricHint: 'It proves direct trade between Rome and India; India must have been exporting enough goods that Romans paid in gold coins; South Indian ports like Arikamedu were active trading hubs; the trade was large-scale and well-established, not occasional.',
  },
  {
    id: 's206_l2_feyn',
    type: 'FEYNMAN',
    level: 'level2',
    text: 'A friend says: "Trade was just about buying and selling things. Why do historians say trade routes also spread ideas and culture?"\n\nExplain using at least two examples from ancient history.',
    keyConcepts: ['Buddhism spread from India to China, Sri Lanka and Southeast Asia along trade routes', 'Indian numerals (including zero) reached the Arab world and then Europe through trade contacts', 'Spices reached Europe, changing European cuisine and motivating voyages of "discovery"', 'traders carried stories, religions, languages, and art alongside their goods'],
  },

  // ═══ LEVEL 3 · STRONG ════════════════════════════════════════════════════
  {
    id: 's206_l3_mcq',
    type: 'MCQ',
    level: 'level3',
    text: 'The Roman writer Pliny the Elder (c. 75 CE) complained that Rome was losing huge amounts of gold to India every year in trade. What does this reveal?',
    options: [
      { id: 'a', text: 'Rome was richer than India', correct: false },
      { id: 'b', text: 'Indian goods were so desirable that Rome bought far more from India than India bought from Rome, creating a trade deficit', correct: true },
      { id: 'c', text: 'India conquered Rome', correct: false },
      { id: 'd', text: 'Gold was mined in India', correct: false },
    ],
    explanation: 'Pliny complained that Indian spices, gems, and textiles were draining Roman gold. This is an early documented trade deficit — and confirms that Indian goods were in massive demand in the ancient world.',
  },
  {
    id: 's206_l3_desc',
    type: 'DESCRIPTIVE',
    level: 'level3',
    text: 'Why were merchants (vaishyas) respected and wealthy in ancient Indian society, even though the traditional varna order placed them below brahmins and kshatriyas?',
    rubricHint: 'Merchants financed wars, built temples, and funded scholars; wealthy traders were patrons of Buddhist monasteries; guilds gave merchants political influence; long-distance trade brought in foreign currency and goods that rulers valued; in practice, wealthy traders had enormous social power despite theoretical rank.',
  },
  {
    id: 's206_l3_feyn',
    type: 'FEYNMAN',
    level: 'level3',
    text: 'A friend says: "Globalisation — where the world is connected economically — is a modern invention from the last 100 years."\n\nUsing ancient Indian trade as your example, explain why this is wrong.',
    keyConcepts: ['India traded with Rome, Arabia, East Africa, and China 2,000 years ago', 'Indian goods (pepper, cotton) were essential to Roman and Chinese markets', 'trade routes carried ideas, religions, and technology across continents', 'the only difference from today is speed and scale — the interconnection itself is ancient'],
  },

  // ═══ STRENGTHEN · BLURT ══════════════════════════════════════════════════
  {
    id: 's206_str_blurt',
    type: 'BLURT',
    level: 'strengthen',
    text: 'ancient Indian trade and crafts — what India exported, who it traded with, how monsoon winds helped sea trade, what guilds (shrenis) were, and how trade spread ideas and culture beyond goods',
  },

  // ═══ REVISE · ACTIVE_RECALL ══════════════════════════════════════════════
  {
    id: 's206_rev_recall',
    type: 'ACTIVE_RECALL',
    level: 'revise',
    text: 'Imagine you are a pepper merchant in the port city of Bharuch (Gujarat) around 100 CE. A ship captain from Rome has arrived wanting to buy pepper.\n\n(1) What route did the Roman captain most likely take to reach India? (2) What will you ask in exchange — and why was your pepper so valuable to him? (3) What might the captain bring from Rome to trade back? (4) What is one non-physical thing (idea, religion, technology) that might travel along with this trade?',
  },
];

export const QUESTIONS_s207: Question[] = [
  // ═══ LEVEL 1 · EASY ══════════════════════════════════════════════════════
  {
    id: 's207_l1_mcq',
    type: 'MCQ',
    level: 'level1',
    text: 'A "janapada" in ancient India (around 1000–600 BCE) was:',
    options: [
      { id: 'a', text: 'A type of ancient coin', correct: false },
      { id: 'b', text: 'A settlement or small territory where a tribe settled and farmed', correct: true },
      { id: 'c', text: 'A large army', correct: false },
      { id: 'd', text: 'A religious text', correct: false },
    ],
    explanation: '"Jana" = people/tribe, "pada" = foot/settlement. Janapadas were the first settled kingdoms of ancient India, formed when cattle-herding tribes settled down and farmed.',
  },
  {
    id: 's207_l1_desc',
    type: 'DESCRIPTIVE',
    level: 'level1',
    text: 'What were the Mahajanapadas? Name at least three of them.',
    rubricHint: 'The 16 Mahajanapadas (c. 600 BCE) were the major kingdoms/republics of ancient India. Any 3 of: Magadha, Kosala, Vajji, Kashi, Anga, Avanti, Vatsa, Gandhara, Kamboja, Panchala, etc. They had capital cities, armies, and collected taxes.',
  },
  {
    id: 's207_l1_feyn',
    type: 'FEYNMAN',
    level: 'level1',
    text: 'Your friend asks: "What\'s the difference between a janapada and a mahajanapada? They sound the same."\n\nExplain in simple words.',
    keyConcepts: ['janapada = small tribal settlement, like a village-territory', 'mahajanapada = "maha" means great — a bigger, more powerful kingdom with a capital city, army, and taxes', 'over time, stronger janapadas absorbed weaker ones and grew into mahajanapadas', 'by 600 BCE there were 16 major mahajanapadas across north India'],
  },

  // ═══ LEVEL 2 · MODERATE ══════════════════════════════════════════════════
  {
    id: 's207_l2_mcq',
    type: 'MCQ',
    level: 'level2',
    text: 'The Vajji republic (Licchavi people, capital Vaishali) was different from most ancient kingdoms because:',
    options: [
      { id: 'a', text: 'It was ruled by the richest merchant', correct: false },
      { id: 'b', text: 'It was a gana sangha — a republic with an elected assembly of representatives, not a single hereditary king', correct: true },
      { id: 'c', text: 'It was ruled by Buddhist monks', correct: false },
      { id: 'd', text: 'It had no army', correct: false },
    ],
    explanation: 'Vajji was among the earliest republics in the world. The assembly (gana) of representative elders met in large halls to make decisions collectively. Gautama Buddha, born among the Shakyas (another republic), was familiar with this system.',
  },
  {
    id: 's207_l2_desc',
    type: 'DESCRIPTIVE',
    level: 'level2',
    text: 'Why did Magadha (near modern Patna, Bihar) become the most powerful of the 16 Mahajanapadas? Give at least two reasons.',
    rubricHint: 'Fertile land in the Gangetic plains for growing food and paying taxes; rich iron ore deposits in nearby hills (iron tools = better farming and weapons); access to rivers (Ganga, Son) for transport and trade; strong kings like Bimbisara and Ajatashatru who used diplomacy and war strategically; use of war elephants.',
  },
  {
    id: 's207_l2_feyn',
    type: 'FEYNMAN',
    level: 'level2',
    text: 'A friend asks: "How could a republic (where many people decide) work in 500 BCE without phones, email, or printing?"\n\nExplain how Vajji\'s gana sangha might have actually functioned.',
    keyConcepts: ['representatives from different clans or villages gathered physically at a hall', 'decisions were made by discussion and vote among the assembly members', 'messengers carried news and decisions to different parts of the republic', 'it was slower than a king\'s decree but gave many groups a voice — trading efficiency for legitimacy'],
  },

  // ═══ LEVEL 3 · STRONG ════════════════════════════════════════════════════
  {
    id: 's207_l3_mcq',
    type: 'MCQ',
    level: 'level3',
    text: 'Republics like Vajji and the Shakyas existed in 500 BCE. This is significant because:',
    options: [
      { id: 'a', text: 'Democracy was invented in India before ancient Greece', correct: false },
      { id: 'b', text: 'Non-monarchical governance was not unique to ancient Greece — India had functioning republics at the same time, independently', correct: true },
      { id: 'c', text: 'These republics eventually conquered Greece', correct: false },
      { id: 'd', text: 'Republics in India had no influence on later governments', correct: false },
    ],
    explanation: 'Greek city-states (like Athens) and Indian gana sanghas (like Vajji) both developed forms of representative government around 500 BCE independently. This challenges the idea that democracy is solely a Greek invention.',
  },
  {
    id: 's207_l3_desc',
    type: 'DESCRIPTIVE',
    level: 'level3',
    text: 'Magadha eventually became so powerful it formed the base for the Maurya Empire (under Chandragupta Maurya, c. 321 BCE). Trace the logic: why would a kingdom that was already the strongest Mahajanapada be well-positioned to create an empire?',
    rubricHint: 'Already had the largest army (iron weapons, elephants); controlled the richest agricultural land and river trade routes; had experience absorbing smaller kingdoms; had a strong administrative tradition (tax collection, record-keeping) dating from Bimbisara; this gave Chandragupta the military, economic, and administrative foundation to expand into an empire.',
  },
  {
    id: 's207_l3_feyn',
    type: 'FEYNMAN',
    level: 'level3',
    text: 'Your friend says: "Indian democracy came from the British — we had no democratic tradition before that."\n\nUsing the gana sanghas (republics of 500 BCE), explain why this is historically inaccurate.',
    keyConcepts: ['Vajji and Shakya gana sanghas were functioning republics with assemblies ~2,500 years ago', 'decisions were made collectively, not by a single king', 'B.R. Ambedkar explicitly cited Vajji\'s Licchavi assembly as an ancient Indian democratic precedent', 'colonialism disrupted these traditions, but they existed long before British rule'],
  },

  // ═══ STRENGTHEN · BLURT ══════════════════════════════════════════════════
  {
    id: 's207_str_blurt',
    type: 'BLURT',
    level: 'strengthen',
    text: 'the early kingdoms and republics of ancient India — what janapadas and mahajanapadas were, which were the major ones, what a gana sangha (republic) was and how Vajji worked, and why Magadha became the most powerful',
  },

  // ═══ REVISE · ACTIVE_RECALL ══════════════════════════════════════════════
  {
    id: 's207_rev_recall',
    type: 'ACTIVE_RECALL',
    level: 'revise',
    text: 'It is 450 BCE. You are an advisor to the king of Vatsa (one of the 16 Mahajanapadas, centred at Kaushambi). Your king wants to expand his territory.\n\n(1) Which neighbouring mahajanapada is the most dangerous threat, and why? (2) What resources would your kingdom need to compete with Magadha specifically? (3) Would you recommend forming an alliance with Vajji (a republic) — and what challenge would negotiating with a republic (vs a king) involve?',
  },
];


// ─── Theme C: Heritage & Knowledge ───────────────────────────────────────

export const QUESTIONS_s301: Question[] = [
  {
    id: 's301_q1',
    type: 'MCQ',
    text: 'The Vedas are unusual because they were:',
    options: [
      { id: 'a', text: 'Written down right away on paper', correct: false },
      { id: 'b', text: 'Memorised and chanted for centuries before being written', correct: true },
      { id: 'c', text: 'Found in a cave with no author', correct: false },
      { id: 'd', text: 'Written by a single person', correct: false },
    ],
    explanation: 'The Vedas were transmitted orally — students memorised them from teachers, syllable by syllable — long before being written down.',
  },
  {
    id: 's301_q2',
    type: 'DESCRIPTIVE',
    text: 'Why is it amazing that the Rigveda has survived word-for-word for 3,000+ years through memory alone?',
    rubricHint: 'Mention: (1) special chanting techniques, (2) trained reciters, (3) cross-checked across families, (4) shows the power of disciplined memory.',
  },
  {
    id: 's301_q3',
    type: 'FEYNMAN',
    text: "A friend says: 'A book is the only way to keep knowledge safe.'\n\nExplain how ancient India proved that oral tradition can work just as well.",
    keyConcepts: ['oral memorisation', 'guru-shishya', 'pada-patha cross-check', 'survived 3000+ years', 'no printing needed'],
  },
  {
    id: 's301_q4',
    type: 'BLURT',
    text: 'Ancient Texts of India',
  },
  {
    id: 's301_q5',
    type: 'ACTIVE_RECALL',
    text: 'A teacher asks her class to memorise a poem perfectly, with no help.\n\nDescribe 2 techniques inspired by ancient Indian oral tradition that could help them.',
  },
];

export const QUESTIONS_s302: Question[] = [
  {
    id: 's302_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Yoga is best described as:',
    options: [
      { id: 'a', text: 'Only a kind of exercise', correct: false },
      { id: 'b', text: 'A system to train body, breath, and mind together — from ancient India', correct: true },
      { id: 'c', text: 'A modern fitness trend', correct: false },
      { id: 'd', text: 'A sport', correct: false },
    ],
    explanation: 'Yoga is much more than exercise — it\'s an ancient Indian system to bring together body, breath, and mind. It is over 2,000 years old.',
  },
  {
    id: 's302_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'Ayurveda is:',
    options: [
      { id: 'a', text: 'A modern Indian phone brand', correct: false },
      { id: 'b', text: 'An ancient Indian system of medicine using plants, diet, and lifestyle', correct: true },
      { id: 'c', text: 'A Sanskrit poem', correct: false },
      { id: 'd', text: 'A type of cooking only', correct: false },
    ],
    explanation: 'Ayurveda ("knowledge of life") uses plants, diet, sleep, and exercise to maintain health and treat illness. Used in India for 3,000+ years.',
  },
  {
    id: 's302_q3',
    type: 'DESCRIPTIVE',
    text: 'How did ancient Indians make discoveries in math and astronomy (like zero, decimals, and planet calculations)?',
    rubricHint: 'Mention: (1) careful observation of sky, (2) need for calendars, (3) shared knowledge in texts, (4) curious thinkers like Aryabhata, Brahmagupta.',
  },
  {
    id: 's302_q4',
    type: 'FEYNMAN',
    text: "A friend says: 'Yoga is just stretching.'\n\nExplain why it is much more than that, in plain words.",
    keyConcepts: ['body + breath + mind', 'meditation', 'discipline', 'whole-self practice', 'ancient wisdom system'],
  },
  {
    id: 's302_q5',
    type: 'BLURT',
    text: 'Yoga, Ayurveda & Ancient Science',
  },
  {
    id: 's302_q6',
    type: 'ACTIVE_RECALL',
    text: 'Your school doctor prescribes turmeric milk for a cold.\n\nUsing what you know about Ayurveda, explain why this is more than just "folk medicine."',
  },
];

export const QUESTIONS_s303: Question[] = [
  {
    id: 's303_q1',
    type: 'MCQ',
    text: 'Indian classical music is rooted in:',
    options: [
      { id: 'a', text: 'Modern pop', correct: false },
      { id: 'b', text: 'Raagas and taals from ancient India', correct: true },
      { id: 'c', text: 'Only film songs', correct: false },
      { id: 'd', text: 'Only Western notes', correct: false },
    ],
    explanation: 'Indian classical music uses raagas (melodic frameworks) and taals (rhythm cycles), with roots going back thousands of years.',
  },
  {
    id: 's303_q2',
    type: 'MCQ',
    text: 'Storytelling traditions like grandmother\'s tales and Panchatantra were used to:',
    options: [
      { id: 'a', text: 'Sell things', correct: false },
      { id: 'b', text: 'Teach lessons and pass values to children', correct: true },
      { id: 'c', text: 'Replace school', correct: false },
      { id: 'd', text: 'Bore children to sleep', correct: false },
    ],
    explanation: 'Stories like the Panchatantra used animals and adventures to teach kids about honesty, friendship, courage — without lecturing them.',
  },
  {
    id: 's303_q3',
    type: 'DESCRIPTIVE',
    text: 'How does art (paintings, dance, sculpture) help us understand the past?',
    rubricHint: 'Mention: (1) shows what people wore and looked like, (2) reveals beliefs and stories, (3) preserves history visually, (4) connects emotions across time.',
  },
  {
    id: 's303_q4',
    type: 'FEYNMAN',
    text: 'A friend says: "Old art is boring — give me video games."\n\nExplain why old paintings, music, and stories still matter.',
    keyConcepts: ['emotional connection across time', 'shows how people thought', 'inspires modern art', 'cultural memory'],
  },
];

export const QUESTIONS_s304: Question[] = [
  {
    id: 's304_q1',
    type: 'MCQ',
    text: 'Most Indian festivals are tied to:',
    options: [
      { id: 'a', text: 'Random dates', correct: false },
      { id: 'b', text: 'The seasons, the moon, or important events', correct: true },
      { id: 'c', text: 'Only government holidays', correct: false },
      { id: 'd', text: 'Cricket matches', correct: false },
    ],
    explanation: 'Most festivals follow the lunar calendar or seasons — like Diwali (harvest + new year) or Pongal (sun moving north).',
  },
  {
    id: 's304_q2',
    type: 'MCQ',
    text: 'Why do different parts of India celebrate the same season with different festivals (Pongal, Lohri, Bihu, Makar Sankranti)?',
    options: [
      { id: 'a', text: 'They can\'t agree', correct: false },
      { id: 'b', text: 'Each region developed its own way to celebrate the same event', correct: true },
      { id: 'c', text: 'Only one is the "real" festival', correct: false },
      { id: 'd', text: 'It is random', correct: false },
    ],
    explanation: 'India\'s diversity means the same agricultural event (harvest, new sun cycle) gets celebrated with different food, music, and rituals in each region.',
  },
  {
    id: 's304_q3',
    type: 'DESCRIPTIVE',
    text: 'Why is celebrating festivals across religions and regions important for India?',
    rubricHint: 'Mention: (1) brings people together, (2) respects diversity, (3) preserves traditions, (4) shows unity in diversity.',
  },
  {
    id: 's304_q4',
    type: 'FEYNMAN',
    text: 'A friend says: "All festivals are basically the same — eat sweets, light lamps."\n\nExplain how each Indian festival has its own meaning, even when they share some features.',
    keyConcepts: ['different stories', 'different seasons', 'different rituals', 'common spirit of joy and gratitude'],
  },
];

export const QUESTIONS_s305: Question[] = [
  {
    id: 's305_q1',
    type: 'MCQ',
    text: '"Unity in Diversity" describes India because:',
    options: [
      { id: 'a', text: 'Everyone speaks the same language', correct: false },
      { id: 'b', text: 'People with many languages, religions, and customs live together as one nation', correct: true },
      { id: 'c', text: 'Diversity is forbidden', correct: false },
      { id: 'd', text: 'Everyone wears the same clothes', correct: false },
    ],
    explanation: 'India has 22+ official languages, all major religions, hundreds of cuisines — yet shares a constitution, identity, and history.',
  },
  {
    id: 's305_q2',
    type: 'MCQ',
    text: 'Which best shows "unity in diversity"?',
    options: [
      { id: 'a', text: 'Forcing everyone to speak Hindi', correct: false },
      { id: 'b', text: 'Different communities celebrating each other\'s festivals together', correct: true },
      { id: 'c', text: 'Banning regional foods', correct: false },
      { id: 'd', text: 'Only one religion being recognised', correct: false },
    ],
    explanation: 'Real unity in diversity is people respecting and joining each other\'s traditions — not erasing differences.',
  },
  {
    id: 's305_q3',
    type: 'DESCRIPTIVE',
    text: 'How can a country with so many religions, languages, and customs feel like one country?',
    rubricHint: 'Mention: (1) shared constitution, (2) shared geography, (3) interlinked history, (4) common values like respect and tolerance.',
  },
  {
    id: 's305_q4',
    type: 'FEYNMAN',
    text: 'A friend says: "Diversity makes a country weaker."\n\nExplain why India\'s diversity is actually a strength.',
    keyConcepts: ['rich culture from many sources', 'shared respect', 'no one group dominates', 'inspires creativity'],
  },
];

export const QUESTIONS_s306: Question[] = [
  {
    id: 's306_q1',
    type: 'MCQ',
    text: 'How many languages are listed in the Eighth Schedule of the Indian Constitution?',
    options: [
      { id: 'a', text: '5', correct: false },
      { id: 'b', text: '22', correct: true },
      { id: 'c', text: '50', correct: false },
      { id: 'd', text: '1', correct: false },
    ],
    explanation: 'India\'s Constitution officially recognises 22 scheduled languages — and there are hundreds more spoken across the country.',
  },
  {
    id: 's306_q2',
    type: 'MCQ',
    text: 'Why does India have an "official languages policy" with both Hindi and English?',
    options: [
      { id: 'a', text: 'They are the prettiest', correct: false },
      { id: 'b', text: 'To balance national unity with regional diversity', correct: true },
      { id: 'c', text: 'All Indians speak both', correct: false },
      { id: 'd', text: 'No one wanted Tamil', correct: false },
    ],
    explanation: 'After Independence, India chose Hindi + English for central government work — to be practical without forcing one language on all states.',
  },
  {
    id: 's306_q3',
    type: 'DESCRIPTIVE',
    text: 'How does speaking your mother tongue help you, even if you also learn English and Hindi?',
    rubricHint: 'Mention: (1) connects you to family and culture, (2) thinking is easier in mother tongue, (3) preserves diversity, (4) you can still learn other languages.',
  },
  {
    id: 's306_q4',
    type: 'FEYNMAN',
    text: 'A friend wonders why India doesn\'t just pick one language for everyone.\n\nExplain why having many languages can be a strength, not a problem.',
    keyConcepts: ['identity and pride', 'protects culture', 'no group feels erased', 'people learn multiple languages', 'unity does not need sameness'],
  },
];


// ─── Theme D: Governance & Democracy ─────────────────────────────────────

export const QUESTIONS_s401: Question[] = [
  {
    id: 's401_q1',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'A family is best described as:',
    options: [
      { id: 'a', text: 'Only people who look alike', correct: false },
      { id: 'b', text: 'A group of people who care for and support each other', correct: true },
      { id: 'c', text: 'Only blood relatives, no one else', correct: false },
      { id: 'd', text: 'People who live in the same city', correct: false },
    ],
    explanation: 'Families come in many shapes — by birth, marriage, adoption, or choice. The core is people supporting each other.',
  },
  {
    id: 's401_q2',
    type: 'MCQ',
    tier: 'DEVELOPING',
    text: 'A joint family is different from a nuclear family because:',
    options: [
      { id: 'a', text: 'It has more pets', correct: false },
      { id: 'b', text: 'Several generations live and share resources together', correct: true },
      { id: 'c', text: 'It has no children', correct: false },
      { id: 'd', text: 'It is bigger because of more friends', correct: false },
    ],
    explanation: 'A joint family includes grandparents, parents, kids, uncles, aunts under one roof. A nuclear family is just parents and children.',
  },
  {
    id: 's401_q3',
    type: 'DESCRIPTIVE',
    text: 'How does a family act like a "tiny government" in your daily life?',
    rubricHint: 'Mention: (1) makes rules, (2) shares resources, (3) divides work, (4) protects members.',
  },
  {
    id: 's401_q4',
    type: 'FEYNMAN',
    text: 'A friend thinks family is "just people you live with."\n\nExplain why family is the foundation of society — using everyday examples.',
    keyConcepts: ['first teachers', 'safety and care', 'learning values', 'first community', 'foundation of bigger groups'],
  },
  {
    id: 's401_q5',
    type: 'BLURT',
    text: 'Family — Where it Begins',
  },
  {
    id: 's401_q6',
    type: 'ACTIVE_RECALL',
    text: 'A 7-year-old refuses to share toys, eat dinner together, or follow bedtime.\n\nUsing the idea of "family as foundation," explain why these small habits matter for later life.',
  },
];

export const QUESTIONS_s402: Question[] = [
  {
    id: 's402_q1',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'A "community" is best understood as:',
    options: [
      { id: 'a', text: 'A bigger group than a family — people connected by where they live, what they do, or what they believe', correct: true },
      { id: 'b', text: 'Only people of the same religion', correct: false },
      { id: 'c', text: 'Only those in your school', correct: false },
      { id: 'd', text: 'Only your relatives', correct: false },
    ],
    explanation: 'A community is a group bigger than a family — could be your neighbourhood, your sports team, your religious group, even online groups.',
  },
  {
    id: 's402_q2',
    type: 'MCQ',
    tier: 'WEAK',
    text: 'During a flood, neighbours share food and shelter. This shows:',
    options: [
      { id: 'a', text: 'They are forced to', correct: false },
      { id: 'b', text: 'Communities work because people care for each other', correct: true },
      { id: 'c', text: 'They have nothing else to do', correct: false },
      { id: 'd', text: 'They want fame', correct: false },
    ],
    explanation: 'Communities exist because humans help each other in tough times — that\'s how we survive and thrive.',
  },
  {
    id: 's402_q3',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'Why can one person belong to many communities at the same time?',
    rubricHint: 'Mention: (1) family community, (2) school community, (3) religious community, (4) sports/hobby community, (5) all add to your identity.',
  },
  {
    id: 's402_q4',
    type: 'DESCRIPTIVE',
    tier: 'WEAK',
    text: 'How is a community different from just a group of strangers?',
    rubricHint: 'Mention: (1) shared interest or place, (2) care for each other, (3) some rules and responsibilities, (4) sense of belonging.',
  },
  {
    id: 's402_q5',
    type: 'FEYNMAN',
    text: 'A friend says: "I don\'t need any community — I have my family."\n\nExplain why communities still matter for everyone.',
    keyConcepts: ['family is limited', 'communities give wider support', 'belonging beyond home', 'shared culture and help', 'interdependence'],
  },
  {
    id: 's402_q6',
    type: 'BLURT',
    text: 'Community — Bigger than Family',
  },
];

export const QUESTIONS_s403: Question[] = [
  {
    id: 's403_q1',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'Democracy means:',
    options: [
      { id: 'a', text: 'Rule by one king', correct: false },
      { id: 'b', text: 'Rule by the people', correct: true },
      { id: 'c', text: 'No rules at all', correct: false },
      { id: 'd', text: 'Rule by judges', correct: false },
    ],
    explanation: 'Democracy comes from Greek words "demos" (people) and "kratos" (rule). The people choose their leaders by voting.',
  },
  {
    id: 's403_q2',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'India is the world\'s:',
    options: [
      { id: 'a', text: 'Smallest democracy', correct: false },
      { id: 'b', text: 'Largest democracy', correct: true },
      { id: 'c', text: 'Only democracy', correct: false },
      { id: 'd', text: 'First democracy', correct: false },
    ],
    explanation: 'With over 950 million voters, India is the largest democracy in the world.',
  },
  {
    id: 's403_q3',
    type: 'MCQ',
    tier: 'VERY_WEAK',
    text: 'In a democracy, who has the final say?',
    options: [
      { id: 'a', text: 'The military', correct: false },
      { id: 'b', text: 'The richest person', correct: false },
      { id: 'c', text: 'The people, through elections and the Constitution', correct: true },
      { id: 'd', text: 'The oldest family', correct: false },
    ],
    explanation: 'Democracy puts the people in charge — they elect leaders, and those leaders must follow the Constitution.',
  },
  {
    id: 's403_q4',
    type: 'DESCRIPTIVE',
    tier: 'VERY_WEAK',
    text: 'Why is voting so important in a democracy?',
    rubricHint: 'Mention: (1) gives every person a say, (2) lets us choose leaders, (3) keeps leaders accountable, (4) without it = no real democracy.',
  },
  {
    id: 's403_q5',
    type: 'DESCRIPTIVE',
    tier: 'VERY_WEAK',
    text: 'Why is democracy considered "better" than rule by one person?',
    rubricHint: 'Mention: (1) shared power = less abuse, (2) many voices = better ideas, (3) peaceful change of leaders, (4) protects rights.',
  },
  {
    id: 's403_q6',
    type: 'FEYNMAN',
    text: 'A friend asks: "If democracy is just voting once in 5 years, why is it called rule by the people?"\n\nExplain in plain words.',
    keyConcepts: ['vote chooses leaders', 'leaders must answer to people', 'free speech & protest', 'Constitution = rules everyone agreed to', 'much more than voting day'],
  },
];

export const QUESTIONS_s404: Question[] = [
  {
    id: 's404_q1',
    type: 'MCQ',
    text: '"Grassroots democracy" means:',
    options: [
      { id: 'a', text: 'Government for plants', correct: false },
      { id: 'b', text: 'Democracy that starts at the village or neighbourhood level', correct: true },
      { id: 'c', text: 'Only farmers can vote', correct: false },
      { id: 'd', text: 'A type of grass', correct: false },
    ],
    explanation: 'Grassroots = at the lowest, local level. Grassroots democracy = letting villages, towns, and neighbourhoods run their own affairs.',
  },
  {
    id: 's404_q2',
    type: 'MCQ',
    text: 'India\'s 3-tier Panchayati Raj system covers:',
    options: [
      { id: 'a', text: 'Only the capital', correct: false },
      { id: 'b', text: 'Village (Gram Panchayat) → Block → District (Zila Parishad)', correct: true },
      { id: 'c', text: 'Only big cities', correct: false },
      { id: 'd', text: 'Only national level', correct: false },
    ],
    explanation: 'The 73rd Amendment set up a 3-tier village democracy: village → block → district. Each level handles local needs.',
  },
  {
    id: 's404_q3',
    type: 'DESCRIPTIVE',
    text: 'Why is it important for villages to run their OWN affairs, not have Delhi decide everything?',
    rubricHint: 'Mention: (1) locals know local problems best, (2) faster decisions, (3) people trust their own neighbours, (4) builds responsibility.',
  },
  {
    id: 's404_q4',
    type: 'FEYNMAN',
    text: 'A friend asks: "If India has Parliament, why do we need village governments?"\n\nExplain why grassroots democracy is the foundation, not extra.',
    keyConcepts: ['Parliament is far away', 'local problems need local solutions', 'real participation', 'foundation of democracy'],
  },
];

export const QUESTIONS_s405: Question[] = [
  {
    id: 's405_q1',
    type: 'MCQ',
    text: 'The Gram Panchayat is the:',
    options: [
      { id: 'a', text: 'Highest court of India', correct: false },
      { id: 'b', text: 'Elected local government of a village (or group of villages)', correct: true },
      { id: 'c', text: 'Indian Army base', correct: false },
      { id: 'd', text: 'A school committee', correct: false },
    ],
    explanation: 'The Gram Panchayat is the lowest level of elected government — it runs day-to-day life in a village.',
  },
  {
    id: 's405_q2',
    type: 'MCQ',
    text: 'The head of a Gram Panchayat is called the:',
    options: [
      { id: 'a', text: 'Mayor', correct: false },
      { id: 'b', text: 'Sarpanch (or Pradhan in some states)', correct: true },
      { id: 'c', text: 'CM', correct: false },
      { id: 'd', text: 'Governor', correct: false },
    ],
    explanation: 'The villagers elect a Sarpanch/Pradhan to lead the Gram Panchayat.',
  },
  {
    id: 's405_q3',
    type: 'DESCRIPTIVE',
    text: 'What kinds of jobs does a Gram Panchayat actually do for villagers?',
    rubricHint: 'Mention: (1) roads and drains, (2) clean water and sanitation, (3) school maintenance, (4) record births/deaths, (5) settle small disputes.',
  },
  {
    id: 's405_q4',
    type: 'FEYNMAN',
    text: 'A friend thinks the Gram Panchayat is "just a meeting under a tree."\n\nExplain how it is actually a real government, just at the village level.',
    keyConcepts: ['elected by villagers', 'has budget and powers', 'fixes daily problems', 'first contact with government', 'reserved seats for women, SC/ST'],
  },
];

export const QUESTIONS_s406: Question[] = [
  {
    id: 's406_q1',
    type: 'MCQ',
    text: 'The Gram Sabha is:',
    options: [
      { id: 'a', text: 'A small religious meeting', correct: false },
      { id: 'b', text: 'A meeting of ALL adult voters in the village', correct: true },
      { id: 'c', text: 'Only for the Sarpanch', correct: false },
      { id: 'd', text: 'A type of school', correct: false },
    ],
    explanation: 'The Gram Sabha is the full assembly of every adult villager. It is the village\'s "people\'s parliament."',
  },
  {
    id: 's406_q2',
    type: 'MCQ',
    text: 'The Gram Sabha\'s main power is to:',
    options: [
      { id: 'a', text: 'Run the cricket team', correct: false },
      { id: 'b', text: 'Hold the Gram Panchayat accountable and approve plans', correct: true },
      { id: 'c', text: 'Choose the Prime Minister', correct: false },
      { id: 'd', text: 'Open shops', correct: false },
    ],
    explanation: 'The Gram Sabha reviews the Panchayat\'s work and approves budgets and plans — making sure leaders truly serve the village.',
  },
  {
    id: 's406_q3',
    type: 'DESCRIPTIVE',
    text: 'How is the Gram Sabha different from the Gram Panchayat?',
    rubricHint: 'Mention: (1) Sabha = all villagers, Panchayat = elected members, (2) Sabha = oversight, Panchayat = day-to-day, (3) Sabha is the boss.',
  },
  {
    id: 's406_q4',
    type: 'FEYNMAN',
    text: 'A friend says: "If we elect a Sarpanch, why do we need a separate village meeting?"\n\nExplain why the Gram Sabha is essential.',
    keyConcepts: ['direct democracy', 'check on elected leaders', 'every voice heard', 'transparency', 'prevents corruption'],
  },
];

export const QUESTIONS_s407: Question[] = [
  {
    id: 's407_q1',
    type: 'MCQ',
    text: 'A Municipal Corporation runs:',
    options: [
      { id: 'a', text: 'Only forests', correct: false },
      { id: 'b', text: 'Big cities (usually over 10 lakh people)', correct: true },
      { id: 'c', text: 'Only schools', correct: false },
      { id: 'd', text: 'A small village', correct: false },
    ],
    explanation: 'Municipal Corporations handle big cities like Mumbai, Delhi, or Bengaluru. Smaller towns use Municipal Councils.',
  },
  {
    id: 's407_q2',
    type: 'MCQ',
    text: 'Who is the elected head of a Municipal Corporation?',
    options: [
      { id: 'a', text: 'Sarpanch', correct: false },
      { id: 'b', text: 'Mayor', correct: true },
      { id: 'c', text: 'Chief Minister', correct: false },
      { id: 'd', text: 'Principal', correct: false },
    ],
    explanation: 'The Mayor is the elected ceremonial head of a Municipal Corporation. Day-to-day work is run by a Commissioner.',
  },
  {
    id: 's407_q3',
    type: 'DESCRIPTIVE',
    text: 'What kinds of services do cities need that villages need less of?',
    rubricHint: 'Mention: (1) traffic management, (2) garbage collection at scale, (3) public transport, (4) drainage and water supply, (5) building permissions.',
  },
  {
    id: 's407_q4',
    type: 'FEYNMAN',
    text: 'A friend wonders why a big city needs its OWN government when there\'s already a state government.\n\nExplain why municipalities exist.',
    keyConcepts: ['cities have unique problems', 'state can\'t manage every street', 'local elected councillors', 'closer to citizens'],
  },
];

export const QUESTIONS_s408: Question[] = [
  {
    id: 's408_q1',
    type: 'MCQ',
    text: 'Public services include:',
    options: [
      { id: 'a', text: 'Only private shops', correct: false },
      { id: 'b', text: 'Things like roads, water, sanitation, schools, hospitals that benefit everyone', correct: true },
      { id: 'c', text: 'Only movies', correct: false },
      { id: 'd', text: 'Just police', correct: false },
    ],
    explanation: 'Public services are things society provides for everyone — water, electricity, roads, public schools, parks, garbage collection.',
  },
  {
    id: 's408_q2',
    type: 'MCQ',
    text: 'Where does the money for public services usually come from?',
    options: [
      { id: 'a', text: 'It falls from the sky', correct: false },
      { id: 'b', text: 'Taxes paid by citizens and businesses', correct: true },
      { id: 'c', text: 'Foreign donations only', correct: false },
      { id: 'd', text: 'Lotteries', correct: false },
    ],
    explanation: 'Citizens and businesses pay taxes (property tax, GST, income tax). The government uses these to fund public services.',
  },
  {
    id: 's408_q3',
    type: 'DESCRIPTIVE',
    text: 'Why are public services important even for those who don\'t use them directly every day?',
    rubricHint: 'Mention: (1) clean water helps prevent disease for all, (2) good roads help economy, (3) public schools educate future citizens, (4) safety net for emergencies.',
  },
  {
    id: 's408_q4',
    type: 'FEYNMAN',
    text: 'A friend complains: "Why should I pay tax when I don\'t use the public hospital?"\n\nExplain how public services work for everyone.',
    keyConcepts: ['you may need it later', 'a healthier neighbour = healthier you', 'shared cost = affordable for all', 'fair society needs basics for everyone'],
  },
];


// ─── Theme E: Economic Life ──────────────────────────────────────────────

export const QUESTIONS_s501: Question[] = [
  {
    id: 's501_q1',
    type: 'MCQ',
    text: '"Work" includes:',
    options: [
      { id: 'a', text: 'Only paid office jobs', correct: false },
      { id: 'b', text: 'Anything that takes effort to create value — paid or unpaid', correct: true },
      { id: 'c', text: 'Only what computers do', correct: false },
      { id: 'd', text: 'Only what adults do', correct: false },
    ],
    explanation: 'Work is any effort that creates value — farming, teaching, cooking at home, fixing bikes, even helping a neighbour.',
  },
  {
    id: 's501_q2',
    type: 'MCQ',
    text: 'Why does work matter for society?',
    options: [
      { id: 'a', text: 'It makes people tired', correct: false },
      { id: 'b', text: 'It produces food, goods, and services that everyone needs', correct: true },
      { id: 'c', text: 'It only earns money for one person', correct: false },
      { id: 'd', text: 'It has no real purpose', correct: false },
    ],
    explanation: 'Every kind of work — farming, building, teaching, cleaning — produces something society needs. Without work, nothing exists.',
  },
  {
    id: 's501_q3',
    type: 'DESCRIPTIVE',
    text: 'Why is the work a mother does at home (cooking, cleaning, caring) just as important as a job outside?',
    rubricHint: 'Mention: (1) it takes real time and skill, (2) without it the family cannot function, (3) it has economic value even if unpaid, (4) it deserves respect.',
  },
  {
    id: 's501_q4',
    type: 'FEYNMAN',
    text: 'A friend says: "Only big paid jobs are real work."\n\nExplain why farming, teaching, and caregiving are all real and important work.',
    keyConcepts: ['paid or unpaid', 'creates value', 'society depends on it', 'every job matters'],
  },
];

export const QUESTIONS_s502: Question[] = [
  {
    id: 's502_q1',
    type: 'MCQ',
    text: '"Dignity of labour" means:',
    options: [
      { id: 'a', text: 'Only some jobs deserve respect', correct: false },
      { id: 'b', text: 'Every honest job — big or small — deserves respect', correct: true },
      { id: 'c', text: 'Workers should be paid more than others', correct: false },
      { id: 'd', text: 'Labour is illegal', correct: false },
    ],
    explanation: 'Dignity of labour is the idea that every honest work — from sweeping streets to running companies — deserves respect.',
  },
  {
    id: 's502_q2',
    type: 'MCQ',
    text: 'Mahatma Gandhi believed in dignity of labour because:',
    options: [
      { id: 'a', text: 'He needed money', correct: false },
      { id: 'b', text: 'No job is "low" — all work helps society and builds character', correct: true },
      { id: 'c', text: 'He liked cleaning only', correct: false },
      { id: 'd', text: 'It was a fashion', correct: false },
    ],
    explanation: 'Gandhi famously cleaned toilets and did manual work to teach that no job is "low" — every person and job is equally worthy.',
  },
  {
    id: 's502_q3',
    type: 'DESCRIPTIVE',
    text: 'Why do some people look down on jobs like cleaning or farming, and why is that wrong?',
    rubricHint: 'Mention: (1) old caste/class prejudices, (2) without these jobs society fails, (3) all work is valuable, (4) dignity is about the worker, not the task.',
  },
  {
    id: 's502_q4',
    type: 'FEYNMAN',
    text: 'A friend ranks jobs from "best" to "worst" — doctor at top, sweeper at bottom.\n\nExplain why this kind of ranking misses the point.',
    keyConcepts: ['every job matters', 'doctors need clean hospitals = sweepers', 'no job = no society', 'respect the person, not the title'],
  },
];

export const QUESTIONS_s503: Question[] = [
  {
    id: 's503_q1',
    type: 'MCQ',
    text: 'The 3 main economic activities are:',
    options: [
      { id: 'a', text: 'Eating, sleeping, playing', correct: false },
      { id: 'b', text: 'Production, Distribution, Consumption', correct: true },
      { id: 'c', text: 'Reading, writing, math', correct: false },
      { id: 'd', text: 'Walking, running, jumping', correct: false },
    ],
    explanation: 'Producers make things. Distributors move them to where they\'re needed. Consumers use them. The full cycle is the economy.',
  },
  {
    id: 's503_q2',
    type: 'MCQ',
    text: 'A baker mixing dough, then delivering bread, then a family eating it — these are examples of:',
    options: [
      { id: 'a', text: 'Production → Distribution → Consumption', correct: true },
      { id: 'b', text: 'Only consumption', correct: false },
      { id: 'c', text: 'Only production', correct: false },
      { id: 'd', text: 'No economy', correct: false },
    ],
    explanation: 'Baker makes (production), delivery van moves it (distribution), family eats (consumption). That\'s the cycle.',
  },
  {
    id: 's503_q3',
    type: 'DESCRIPTIVE',
    text: 'Trace a simple item (like a pencil) from raw materials all the way to a student using it.',
    rubricHint: 'Mention: (1) wood from trees, (2) cut and assembled with graphite, (3) shipped to shops, (4) bought, (5) used and consumed.',
  },
  {
    id: 's503_q4',
    type: 'FEYNMAN',
    text: 'A friend thinks "economy" only means money.\n\nExplain that economy is actually the whole cycle of making, sharing, and using things.',
    keyConcepts: ['production = creating', 'distribution = moving', 'consumption = using', 'money is one tool, not the whole thing'],
  },
];

export const QUESTIONS_s504: Question[] = [
  {
    id: 's504_q1',
    type: 'MCQ',
    text: 'A "market" is best described as:',
    options: [
      { id: 'a', text: 'Only a shopping mall', correct: false },
      { id: 'b', text: 'Any place — physical or digital — where people buy and sell things', correct: true },
      { id: 'c', text: 'Only a vegetable seller', correct: false },
      { id: 'd', text: 'A school cafeteria', correct: false },
    ],
    explanation: 'Markets can be a village haat, a city mall, a stock exchange, or even an online app — anywhere buyers and sellers meet.',
  },
  {
    id: 's504_q2',
    type: 'MCQ',
    text: 'Trade exists because:',
    options: [
      { id: 'a', text: 'People love walking around', correct: false },
      { id: 'b', text: 'No one can produce everything they need themselves', correct: true },
      { id: 'c', text: 'Shops make money', correct: false },
      { id: 'd', text: 'Buses need passengers', correct: false },
    ],
    explanation: 'Trade lets people exchange what they have for what they need. A farmer grows wheat, trades for cloth and tools.',
  },
  {
    id: 's504_q3',
    type: 'DESCRIPTIVE',
    text: 'How are markets different in a village (haat) vs a city mall?',
    rubricHint: 'Mention: (1) village haat = weekly, outdoor, local goods, (2) city mall = daily, indoor, branded goods, (3) both serve the same purpose, (4) different scale and style.',
  },
  {
    id: 's504_q4',
    type: 'FEYNMAN',
    text: 'A friend asks: "If trade is just swapping, why does money exist?"\n\nExplain how money makes trade easier.',
    keyConcepts: ['barter is clumsy', 'money is a common measure', 'easier to save and spend', 'enables larger trade'],
  },
];

export const QUESTIONS_s505: Question[] = [
  {
    id: 's505_q1',
    type: 'MCQ',
    text: 'A natural resource is:',
    options: [
      { id: 'a', text: 'Something humans make', correct: false },
      { id: 'b', text: 'Something useful that comes from nature — like water, soil, minerals, sunlight', correct: true },
      { id: 'c', text: 'Only money', correct: false },
      { id: 'd', text: 'Computers and phones', correct: false },
    ],
    explanation: 'Natural resources come from nature — air, water, soil, forests, minerals, sunlight, animals.',
  },
  {
    id: 's505_q2',
    type: 'MCQ',
    text: 'A piece of cotton from a field becomes a shirt only after:',
    options: [
      { id: 'a', text: 'It rains', correct: false },
      { id: 'b', text: 'Many people add work and skill to it', correct: true },
      { id: 'c', text: 'A factory grows it', correct: false },
      { id: 'd', text: 'Nothing — it just appears', correct: false },
    ],
    explanation: 'Raw cotton becomes a shirt through work: picking, ginning, spinning, weaving, sewing. Work + resources = value.',
  },
  {
    id: 's505_q3',
    type: 'DESCRIPTIVE',
    text: 'How does a tree become a wooden chair? Walk through the steps.',
    rubricHint: 'Mention: (1) tree grows (natural), (2) cut by woodcutter, (3) sawmill cuts planks, (4) carpenter shapes and joins, (5) finished chair sold.',
  },
  {
    id: 's505_q4',
    type: 'FEYNMAN',
    text: 'A friend says: "Why do we pay so much for things made from cheap materials?"\n\nExplain why human work and skill add value.',
    keyConcepts: ['raw materials are just one part', 'human effort and skill matter', 'design, transport, packaging cost too', 'value = work + materials'],
  },
];

export const QUESTIONS_s506: Question[] = [
  {
    id: 's506_q1',
    type: 'MCQ',
    text: '"Invisible work" usually means:',
    options: [
      { id: 'a', text: 'Work done by ghosts', correct: false },
      { id: 'b', text: 'Important work that often goes unnoticed or unpaid — like housework, caregiving, volunteering', correct: true },
      { id: 'c', text: 'Online jobs only', correct: false },
      { id: 'd', text: 'Magic shows', correct: false },
    ],
    explanation: 'Invisible work is work that society depends on but doesn\'t always count or pay — cooking, cleaning, caring for kids and elders, volunteer work.',
  },
  {
    id: 's506_q2',
    type: 'MCQ',
    text: 'In many families, the bulk of invisible work is done by:',
    options: [
      { id: 'a', text: 'Robots', correct: false },
      { id: 'b', text: 'Women — though more men are taking part too', correct: true },
      { id: 'c', text: 'Only children', correct: false },
      { id: 'd', text: 'The government', correct: false },
    ],
    explanation: 'Historically, women do most household and care work. Society is slowly recognising this and sharing the load more fairly.',
  },
  {
    id: 's506_q3',
    type: 'DESCRIPTIVE',
    text: 'Why is it important to RECOGNISE invisible work, even if it doesn\'t earn money?',
    rubricHint: 'Mention: (1) it keeps families and society running, (2) it deserves respect and fair sharing, (3) ignoring it is unfair, (4) economy hidden but real.',
  },
  {
    id: 's506_q4',
    type: 'FEYNMAN',
    text: 'A friend says: "Mum doesn\'t work — she just stays home."\n\nExplain why this is wrong, and what kind of work she actually does.',
    keyConcepts: ['cooking, cleaning, childcare', 'managing the household', 'teaching values', 'all real work', 'just unpaid'],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// SOCIETY LOOKUP — replaces hist/geo/civ entries
// ═══════════════════════════════════════════════════════════════════════════

export const CONCEPT_QUESTIONS_SOC: Record<string, Question[]> = {
  s101: QUESTIONS_s101, s102: QUESTIONS_s102, s103: QUESTIONS_s103, s104: QUESTIONS_s104,
  s105: QUESTIONS_s105, s106: QUESTIONS_s106, s107: QUESTIONS_s107, s108: QUESTIONS_s108,
  s201: QUESTIONS_s201, s202: QUESTIONS_s202, s203: QUESTIONS_s203, s204: QUESTIONS_s204,
  s205: QUESTIONS_s205, s206: QUESTIONS_s206, s207: QUESTIONS_s207,
  s301: QUESTIONS_s301, s302: QUESTIONS_s302, s303: QUESTIONS_s303, s304: QUESTIONS_s304,
  s305: QUESTIONS_s305, s306: QUESTIONS_s306,
  s401: QUESTIONS_s401, s402: QUESTIONS_s402, s403: QUESTIONS_s403, s404: QUESTIONS_s404,
  s405: QUESTIONS_s405, s406: QUESTIONS_s406, s407: QUESTIONS_s407, s408: QUESTIONS_s408,
  s501: QUESTIONS_s501, s502: QUESTIONS_s502, s503: QUESTIONS_s503, s504: QUESTIONS_s504,
  s505: QUESTIONS_s505, s506: QUESTIONS_s506,
};

// Register Society concepts into the main lookup so pages reading
// CONCEPT_QUESTIONS resolve them too (the SOC exports are declared after the
// main map literal, so they can't be referenced inside it directly).
Object.assign(CONCEPT_QUESTIONS, CONCEPT_QUESTIONS_SOC);

