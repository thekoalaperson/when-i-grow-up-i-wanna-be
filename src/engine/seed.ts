// Future Map — seed dataset.
//
// Per spec 6.3 this is the single most perishable asset in the product. Every
// stage-3 figure is 2026-indicative and carries a `lastVerified` date + a
// "verify on the official source" posture. In a live deployment these fields are
// re-grounded by the GroundingProvider (see grounding.ts); here they are the
// researched seed from the spec appendix, dated honestly.

import type { DecisionNode } from './types'

const VERIFIED = '2026-02-01' // seed research date (spec appendix, 2026 indicative)

/** Deep-links into a platform's OWN search — never scraped/cached data (spec 4.15). */
export function jobSearchUrl(keywords: string): string {
  const q = encodeURIComponent(keywords.trim())
  return `https://www.naukri.com/${keywords
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')}-jobs?k=${q}`
}
export function courseSearchUrl(keywords: string): string {
  const q = encodeURIComponent(`${keywords} course college India`)
  return `https://www.shiksha.com/search?q=${q}`
}

// ── Tier 1 — after-8th interest signal ──────────────────────────────────────
// Broad "where does your head go" signals. They carry trait deltas and point
// toward streams without hard-parenting them (streams are shared).

export const INTERESTS: DecisionNode[] = [
  {
    id: 'i_build',
    stage: 1,
    label: 'Building & fixing things',
    subtitle: 'machines, structures, how the physical world holds together',
    traitDelta: { analytical: 2, structure: 1 },
    insight:
      'You reach for how things work, not just that they work. That instinct sits under engineering, architecture, and a lot of hands-on science.',
    checklist: [
      'Notice which you prefer: taking things apart, or drawing what they could be',
      'Try one small build this term — a circuit, a model, a repair',
    ],
    opportunities: [
      'Science (PCM) stream',
      'Engineering / Architecture / Design later',
    ],
    challengeQuestion:
      'Liking how things work and spending four years on physics + maths problem sets are different things. Which part is the actual pull for you?',
  },
  {
    id: 'i_life',
    stage: 1,
    label: 'Living things & the body',
    subtitle: 'biology, health, why bodies and ecosystems behave as they do',
    traitDelta: { analytical: 1, people: 1, structure: 1 },
    insight:
      'Curiosity about living systems is the root of medicine, biotech, and health careers — some of which are long roads, some surprisingly short.',
    checklist: [
      'Separate "I want to help people" from "I want to study biology" — they lead different places',
      'Look at one allied-health role, not just MBBS',
    ],
    opportunities: ['Science (PCB) stream', 'Medicine / Biotech / Allied health'],
    challengeQuestion:
      'The headline path here (MBBS) is ~6.5 years before a real paycheck. Is it the medicine you want, or the idea of being a doctor?',
  },
  {
    id: 'i_money',
    stage: 1,
    label: 'Numbers, money & how businesses run',
    subtitle: 'markets, accounts, the machinery behind organisations',
    traitDelta: { analytical: 2, structure: 1 },
    insight:
      'A pull toward how money and organisations move points at commerce — from chartered accountancy to analytics to running things.',
    checklist: [
      'Notice if you like the rules of money (accounting) or the bets (markets)',
      'Follow one real company for a month — what actually makes it money?',
    ],
    opportunities: ['Commerce stream (with or without Maths)', 'CA / Analytics / Management'],
    challengeQuestion:
      'Commerce splits hard on one question: do you want Maths in the mix or not? That single choice closes and opens whole careers. Which way do you lean, and why?',
  },
  {
    id: 'i_people',
    stage: 1,
    label: 'People, words & society',
    subtitle: 'why people do what they do, and how to say it well',
    traitDelta: { people: 2, creative: 1 },
    insight:
      'Interest in people and ideas is the spine of humanities — law, civil services, psychology, media. Often underrated on pay, often undersold at home.',
    checklist: [
      'Write something and show it to someone honest',
      'Notice: are you drawn to understanding people, or to changing systems?',
    ],
    opportunities: ['Humanities stream', 'Law / Civil services / Psychology / Media'],
    challengeQuestion:
      'Humanities gets called "the easy stream" and "no scope" at home. Some of these paths out-earn engineering; some genuinely struggle early. Do you actually know which is which yet?',
  },
  {
    id: 'i_make',
    stage: 1,
    label: 'Making & designing',
    subtitle: 'visuals, products, experiences — things people use and feel',
    traitDelta: { creative: 2, risk: 1 },
    insight:
      'A maker’s instinct crosses streams. Design is a real, well-paid path — but it rewards a portfolio far more than a percentage.',
    checklist: [
      'Start collecting your work somewhere, even if it’s rough',
      'Look up one entrance exam (NID / UCEED) to see what design school actually tests',
    ],
    opportunities: ['Design (from most streams)', 'Architecture / Digital media'],
    challengeQuestion:
      'Design school judges a portfolio, not your board marks. Are you building one, or just hoping you’re "creative"?',
  },
  {
    id: 'i_data',
    stage: 1,
    label: 'Screens, code & data',
    subtitle: 'software, patterns in data, building things that run',
    traitDelta: { analytical: 2, creative: 1, risk: 1 },
    insight:
      'The pull toward code and data runs into engineering (CSE), analytics, and design — some needing PCM, some reachable from commerce.',
    checklist: [
      'Build one tiny thing that runs — a script, a site, a bot',
      'Notice if you like the building or the maths underneath it',
    ],
    opportunities: ['Science (PCM) → CSE', 'Commerce + Maths → Analytics'],
    challengeQuestion:
      'Everyone says "get into tech." The seats at the top are as fought-over as anything in India. What’s your honest read on where you’d actually land?',
  },
]

// ── Tier 2 — after-10th stream ──────────────────────────────────────────────

export const STREAMS: DecisionNode[] = [
  {
    id: 's_pcm',
    stage: 2,
    label: 'Science — PCM',
    subtitle: 'Physics · Chemistry · Maths',
    traitDelta: { analytical: 2, structure: 1 },
    insight:
      'The widest-optionality stream on paper — engineering, architecture, design, pure science, and a pivot into most commerce careers later. It is also the most competitive and the most maths-heavy.',
    checklist: [
      'Be honest about your relationship with maths — this stream lives or dies on it',
      'Decide if you’re taking a JEE-style entrance seriously, or keeping it broad',
    ],
    opportunities: ['Engineering', 'Architecture', 'Design', 'Pure sciences'],
    challengeQuestion:
      'PCM keeps the most doors open — which is also why students pick it by default and burn out. Are you choosing it, or defaulting to it because it "keeps options open"?',
    entrancePrepCost: 'JEE coaching: ₹0 (self-study) to ₹1.5–3L for 2 years of a top institute',
  },
  {
    id: 's_pcb',
    stage: 2,
    label: 'Science — PCB',
    subtitle: 'Physics · Chemistry · Biology',
    traitDelta: { analytical: 1, people: 1, structure: 1 },
    insight:
      'The health-and-life-sciences stream — medicine, biotech, allied health, research. The MBBS route is long and fiercely gated; the allied-health routes are shorter and far less talked about.',
    checklist: [
      'Look past MBBS at one allied-health or biotech route',
      'Know that most bio careers need a master’s to pay well',
    ],
    opportunities: ['Medicine (MBBS)', 'Biotechnology', 'Allied health', 'Research'],
    challengeQuestion:
      'PCB is often taken as "the doctor stream." If MBBS doesn’t happen — and for ~93% of NEET aspirants it doesn’t — are you happy with where PCB otherwise leads?',
    entrancePrepCost: 'NEET coaching: ₹0 (self-study) to ₹1.5–3L for 2 years of a top institute',
  },
  {
    id: 's_com_m',
    stage: 2,
    label: 'Commerce — with Maths',
    subtitle: 'Accountancy · Business · Economics · Maths',
    traitDelta: { analytical: 2, structure: 1 },
    insight:
      'Keeps the quantitative commerce careers open — CA, economics, analytics, finance — and still allows a pivot toward data roles. The Maths is what separates it from plain commerce.',
    checklist: [
      'Confirm you can carry Maths alongside accounts — it’s the whole point of this branch',
      'Look at CA and analytics side by side — very different day-to-day',
    ],
    opportunities: ['CA / CS / CMA', 'Economics', 'B.Com + finance', 'Business analytics'],
    challengeQuestion:
      'Commerce-with-Maths is the "safe smart" pick. But CA has a first-attempt pass rate under 20% at the Final level. Are you picking the stream or underestimating what’s downstream?',
  },
  {
    id: 's_com',
    stage: 2,
    label: 'Commerce — without Maths',
    subtitle: 'Accountancy · Business · Economics',
    traitDelta: { structure: 1, people: 1 },
    insight:
      'A lighter-maths route into B.Com, management, digital marketing, and law. More accessible; but dropping Maths quietly closes CA-track ease, most analytics, and economics honours at strong colleges.',
    checklist: [
      'Understand exactly what dropping Maths closes before you drop it',
      'If management or law is the goal, this works well',
    ],
    opportunities: ['B.Com', 'BBA / Management', 'Law', 'Digital marketing'],
    challengeQuestion:
      'Dropping Maths feels like relief now. It also removes a set of higher-paying quantitative paths later. Do you know exactly which ones, or is this "I just don’t like Maths"?',
  },
  {
    id: 's_hum',
    stage: 2,
    label: 'Humanities',
    subtitle: 'History · Political science · Psychology · Economics · Languages',
    traitDelta: { people: 2, creative: 1 },
    insight:
      'The most misunderstood stream at home and the widest in range — law, civil services, psychology, journalism, design, economics. Some of these out-earn engineering; some are genuinely hard early. The stream doesn’t decide that, the path does.',
    checklist: [
      'Have the "no scope" conversation at home with actual numbers, not vibes',
      'Pick one specific path to anchor — humanities punishes drifting',
    ],
    opportunities: ['Law', 'Civil services', 'Psychology', 'Journalism / media'],
    challengeQuestion:
      'Humanities gives you the most freedom and the least structure. Freedom without a chosen target is how people drift for three years. Do you have a target, or just a stream?',
  },
]

// ── Tier 3 — after-12th career cluster (spec appendix, 2026 indicative) ──────

function n(node: Omit<DecisionNode, 'lastVerified' | 'jobSearchUrl' | 'courseSearchUrl'>): DecisionNode {
  return {
    ...node,
    lastVerified: VERIFIED,
    jobSearchUrl: node.searchKeywords ? jobSearchUrl(node.searchKeywords) : undefined,
    courseSearchUrl: node.searchKeywords ? courseSearchUrl(node.searchKeywords) : undefined,
  }
}

export const CAREERS: DecisionNode[] = [
  // ── Science (PCM) ─────────────────────────────────────────────────────────
  n({
    id: 'c_engineering',
    stage: 3,
    parentId: 's_pcm',
    label: 'Engineering',
    subtitle: 'B.Tech / B.E. across dozens of branches',
    traitDelta: { analytical: 3, structure: 1 },
    insight:
      'The default aspiration for PCM — and the most bimodal outcome on this whole map. The top ~40 institutes place extraordinarily well; the long tail of 3,000+ colleges does not. Which college matters far more than the degree.',
    checklist: [
      'Pick a target exam (JEE Main / Advanced, or state CET) and a realistic institute band',
      'Choose a branch by interest, not by last year’s placement rumour',
      'Build one project outside coursework — it separates you more than marks do',
    ],
    opportunities: [
      'Core (mechanical, civil, electrical) + software roles',
      'CSE / IT — the highest-demand, most-fought-over branch',
      'Public-sector (PSU) and higher study (M.Tech / MS / MBA)',
    ],
    challengeQuestion:
      'Roughly 12–15 lakh students sit JEE each year for a few thousand top seats, and median placements outside the top tier are far below the IIT headline you’re picturing. Is your read still that this fits — and at which institute band?',
    costMin: 8,
    costMax: 25,
    yearsToFirstIncome: 4,
    payDescription:
      '₹4–8L average to start; ₹12–25L+ at IIT/NIT and top CSE — the spread is enormous and college-dependent',
    eligibilityThreshold: {
      metric: 'Class 12 PCM % + JEE/CET rank',
      typicalValue: '75%+ PCM for good private admission; JEE rank drives the top tier',
      note: 'Cutoffs move every year and differ sharply by category and home state.',
    },
    searchKeywords: 'engineering fresher',
    sourceUrls: [{ title: 'JEE Main — NTA (official)', url: 'https://jeemain.nta.nic.in/' }],
    keyDates: [
      { label: 'JEE Main Session 1', window: 'typically Jan–Feb' },
      { label: 'JEE Main Session 2', window: 'typically Apr' },
    ],
  }),
  n({
    id: 'c_architecture',
    stage: 3,
    parentId: 's_pcm',
    label: 'Architecture',
    subtitle: 'B.Arch — 5 years, then licensing',
    traitDelta: { creative: 2, analytical: 1, structure: 1 },
    insight:
      'A genuine blend of art and engineering, and one of the few PCM paths where a portfolio and spatial sense matter as much as marks. Longer than most degrees and slower to pay off, but distinctive and durable.',
    checklist: [
      'Take NATA / JEE Paper 2 seriously — architecture has its own entrance',
      'Start a sketchbook; spatial thinking is testable and trainable',
      'Understand the 5-year + internship timeline before committing',
    ],
    opportunities: [
      'Architecture firms, urban planning, interior & landscape design',
      'Real-estate and construction-side roles',
      'Independent practice after licensing (COA registration)',
    ],
    challengeQuestion:
      'B.Arch is 5 years and starting pay is a modest ₹3–6L that only climbs meaningfully after licensing and experience. That’s a long runway. What makes it worth more to you than a 4-year engineering degree?',
    costMin: 8,
    costMax: 20,
    yearsToFirstIncome: 5,
    payDescription: '₹3–6L to start; rises steadily after licensing and a few years of built work',
    eligibilityThreshold: {
      metric: 'Class 12 PCM % + NATA / JEE Paper 2',
      typicalValue: '50%+ with PCM; NATA score for most schools',
      note: 'Council of Architecture norms and school cutoffs vary — verify per institute.',
    },
    searchKeywords: 'architect',
    sourceUrls: [{ title: 'Council of Architecture (official)', url: 'https://www.coa.gov.in/' }],
  }),
  n({
    id: 'c_pure_sciences',
    stage: 3,
    parentId: 's_pcm',
    label: 'Pure sciences',
    subtitle: 'B.Sc → M.Sc → research / industry',
    traitDelta: { analytical: 3, creative: 1 },
    insight:
      'Physics, chemistry, maths as a career, not just a stepping-stone. Modest pay through a bachelor’s, but the ceiling opens after a master’s or PhD, and the intellectual depth is unmatched. IISER / IIT-BS routes changed this path’s prestige.',
    checklist: [
      'Look at IISERs and IIT integrated BS-MS (via IAT / JEE) — they reset the ceiling',
      'Accept that this is usually a master’s-minimum path to real pay',
      'Find one research area you’d read about unpaid — that’s the tell',
    ],
    opportunities: [
      'Research (labs, IISER/TIFR/CSIR), academia',
      'Data / quant roles that hire strong maths & physics grads',
      'R&D in industry after a master’s',
    ],
    challengeQuestion:
      'A plain B.Sc pays modestly and the real money is 5–7 years out via a master’s or PhD. That’s a long deferral for someone who might just like the subject now. Is the deferral one you actually want, or one you’re not seeing?',
    costMin: 3,
    costMax: 10,
    yearsToFirstIncome: 3,
    payDescription: 'Modest through M.Sc; ₹6–15L+ opens up post-PhD or in quant/data roles',
    eligibilityThreshold: {
      metric: 'Class 12 PCM % (IAT / JEE for top institutes)',
      typicalValue: '60%+ for good universities; IAT for IISERs',
      note: 'Elite research institutes have their own entrances — verify per institute.',
    },
    searchKeywords: 'research scientist',
    sourceUrls: [{ title: 'IISER admissions (official)', url: 'https://www.iiseradmission.in/' }],
  }),
  n({
    id: 'c_design',
    stage: 3,
    parentId: 's_pcm',
    label: 'Design',
    subtitle: 'B.Des — product, communication, UX, more',
    traitDelta: { creative: 3, risk: 1 },
    insight:
      'A real, well-paid, portfolio-first career that most families still under-rate. Reachable from most streams via NID DAT / UCEED — your body of work matters far more than your board percentage. Cross-listed here because many designers come from PCM.',
    checklist: [
      'Build a portfolio now — it is the actual entry ticket, not marks',
      'Prep for NID DAT (NID) or UCEED (IIT design programmes)',
      'Talk to one working designer about the unglamorous early years',
    ],
    opportunities: [
      'UX / product design (the highest-paying design track today)',
      'Communication, graphic, industrial, motion design',
      'In-house at product companies or design studios',
    ],
    challengeQuestion:
      'Top design firms pay ₹12–20L+, but that is portfolio-and-skill gated, not degree gated — and the bottom of the field starts around ₹3L. Which end are you honestly heading for, and what in your portfolio says so?',
    costMin: 6,
    costMax: 20,
    yearsToFirstIncome: 4,
    payDescription: '₹3–8L to start; ₹12–20L+ at top firms with a strong portfolio',
    eligibilityThreshold: {
      metric: 'NID DAT / UCEED + portfolio',
      typicalValue: 'Open to most streams; entrance + portfolio decide it',
      note: 'Board % rarely gates design; the portfolio and entrance do. Verify per school.',
    },
    searchKeywords: 'ux designer',
    sourceUrls: [{ title: 'UCEED — IIT Bombay (official)', url: 'https://www.uceed.iitb.ac.in/' }],
  }),

  // ── Science (PCB) ─────────────────────────────────────────────────────────
  n({
    id: 'c_medicine',
    stage: 3,
    parentId: 's_pcb',
    label: 'Medicine (MBBS)',
    subtitle: 'MBBS → internship → PG (the long road)',
    traitDelta: { analytical: 2, people: 2, structure: 2 },
    insight:
      'The most respected and most gated path on this map. NEET selects a small fraction; a government seat is cheap and a private seat can cost a crore. The timeline to independence is long, and PG (via NEET-PG) is now almost assumed, not optional.',
    checklist: [
      'Be realistic about NEET — a govt seat needs a very high score',
      'Understand the real timeline: MBBS 5.5y + internship, then most do PG',
      'Look at the private-seat cost honestly before assuming it’s an option',
    ],
    opportunities: [
      'Clinical practice (after PG in most cases)',
      'Specialisation via NEET-PG; super-speciality beyond',
      'Public health, research, administration branches',
    ],
    challengeQuestion:
      'MBBS is ~6.5 years to your first real paycheck, the intern stipend is ₹15–30k/month, and ~93% of NEET aspirants don’t get an MBBS seat at all. If it turns out to be a ₹50L–1cr private seat or no seat, does the plan survive?',
    costMin: 5,
    costMax: 100,
    yearsToFirstIncome: 6.5,
    payDescription:
      'Intern stipend ₹15–30k/mo; Junior Resident ₹55–95k/mo; real earning rises after PG',
    eligibilityThreshold: {
      metric: 'NEET-UG score + Class 12 PCB %',
      typicalValue: '50th percentile to qualify; effective govt-seat cutoff is far higher',
      note: '**Cutoffs vary sharply by category (SC/ST/OBC/EWS/general) and state quota** — verify on the official NEET/MCC source for your category.',
    },
    searchKeywords: 'medical officer',
    sourceUrls: [{ title: 'NEET-UG — NTA (official)', url: 'https://neet.nta.nic.in/' }],
    keyDates: [
      { label: 'NEET-UG registration', window: 'typically Feb–Mar' },
      { label: 'NEET-UG exam', window: 'typically May' },
    ],
  }),
  n({
    id: 'c_biotech',
    stage: 3,
    parentId: 's_pcb',
    label: 'Biotechnology',
    subtitle: 'B.Tech/B.Sc Biotech → industry / research',
    traitDelta: { analytical: 2, creative: 1 },
    insight:
      'The most hyped and most mis-sold PCB alternative. The science is real and growing, but the well-paying jobs cluster in a few biotech/pharma hubs and usually want a master’s. Entered clear-eyed it’s solid; entered as "MBBS backup" it disappoints.',
    checklist: [
      'Separate research-biotech from industry-biotech — different lives, different pay',
      'Plan for a master’s; a bachelor’s alone caps early',
      'Check where the actual jobs are geographically before committing',
    ],
    opportunities: [
      'Biopharma / R&D roles (esp. Hyderabad, Bengaluru, Pune hubs)',
      'Bioinformatics — the higher-paying, data-heavy edge',
      'Research after M.Sc / PhD',
    ],
    challengeQuestion:
      'Biotech is often chosen as a soft landing from MBBS, then pays ₹3–6L with a bachelor’s and really needs a master’s to move. Are you choosing it for the science, or as a place to land?',
    costMin: 3,
    costMax: 8,
    yearsToFirstIncome: 4,
    payDescription: '₹3–6L to start; opens up with a master’s and in bioinformatics',
    eligibilityThreshold: {
      metric: 'Class 12 PCB/PCM % (+ entrance for top schools)',
      typicalValue: '60%+ for good programmes',
      note: 'Top institutes use their own entrances — verify per programme.',
    },
    searchKeywords: 'biotechnology',
    sourceUrls: [{ title: 'Dept. of Biotechnology, GoI', url: 'https://dbtindia.gov.in/' }],
  }),
  n({
    id: 'c_allied_health',
    stage: 3,
    parentId: 's_pcb',
    label: 'Allied health',
    subtitle: 'physiotherapy, nursing, lab, radiology, more',
    traitDelta: { people: 2, structure: 1 },
    insight:
      'The most under-discussed cluster on this map, and often the most sensible one in PCB. Shorter than MBBS, far cheaper, genuinely employable, and increasingly in demand — nursing, physiotherapy, medical imaging, lab technology, optometry. Low prestige at home; high real-world footing.',
    checklist: [
      'Pick a specific allied field — they differ a lot in pay and setting',
      'Check licensing/registration for your chosen field',
      'Look at international demand — nursing especially travels well',
    ],
    opportunities: [
      'Hospitals, diagnostics, rehab centres — steady demand',
      'Nursing / physiotherapy with strong overseas pathways',
      'Specialisation and teaching later',
    ],
    challengeQuestion:
      'Allied health starts modestly (₹2.5–5L) and carries less prestige at home than "doctor" — but it’s a fraction of the cost and time and it actually employs you. Is the status gap the real reason it’s lower on your list?',
    costMin: 2,
    costMax: 8,
    yearsToFirstIncome: 4,
    payDescription: '₹2.5–5L to start; nursing/physio have strong overseas upside',
    eligibilityThreshold: {
      metric: 'Class 12 PCB %',
      typicalValue: '50%+ for most programmes',
      note: 'Field-specific councils (nursing, physiotherapy) set registration norms — verify per field.',
    },
    searchKeywords: 'physiotherapist nurse',
    sourceUrls: [{ title: 'Indian Nursing Council', url: 'https://www.indiannursingcouncil.org/' }],
  }),
  n({
    id: 'c_research_pcb',
    stage: 3,
    parentId: 's_pcb',
    label: 'Research (B.Sc route)',
    subtitle: 'life-science research via B.Sc → M.Sc → PhD',
    traitDelta: { analytical: 3, creative: 1 },
    insight:
      'The scientist track through biology — ecology, genetics, neuroscience, microbiology. Modest until a master’s, then genuinely rewarding for the right person post-PhD. IISER / integrated routes matter here too.',
    checklist: [
      'Look at IISERs and integrated M.Sc programmes early',
      'Understand this is a long, master’s-and-beyond commitment',
      'Find a sub-field you’d follow unpaid',
    ],
    opportunities: [
      'Research institutes (IISER, NCBS, CSIR labs), academia',
      'Biotech/pharma R&D after higher study',
      'Science communication and policy',
    ],
    challengeQuestion:
      'This path pays modestly until a PhD that is itself 5+ years away. That’s a decade-scale bet on your own curiosity holding. Is the curiosity that durable, honestly?',
    costMin: 3,
    costMax: 10,
    yearsToFirstIncome: 3,
    payDescription: 'Modest through M.Sc; ₹6–15L+ opens up post-PhD',
    eligibilityThreshold: {
      metric: 'Class 12 PCB % (IAT / entrances for top institutes)',
      typicalValue: '60%+ for good universities; IAT for IISERs',
      note: 'Research institutes have their own entrances — verify per institute.',
    },
    searchKeywords: 'research associate life sciences',
    sourceUrls: [{ title: 'IISER admissions (official)', url: 'https://www.iiseradmission.in/' }],
  }),

  // ── Commerce + Maths ──────────────────────────────────────────────────────
  n({
    id: 'c_ca',
    stage: 3,
    parentId: 's_com_m',
    label: 'CA / CS / CMA',
    subtitle: 'chartered accountancy & sibling qualifications',
    traitDelta: { analytical: 3, structure: 3 },
    insight:
      'The highest return-on-investment path in this whole dataset — a few lakh in fees, no elite-college gatekeeping, and strong pay if you clear it. The catch is entirely in "if": the exams are famously hard, the Final pass rate is often under 20% per attempt, and it stretches ~4.5 years including articleship.',
    checklist: [
      'Register for CA Foundation (ICAI) — it starts right after Class 12',
      'Plan for articleship (the mandatory training years) in your timeline',
      'Have a realistic view of multiple attempts — most people take them',
    ],
    opportunities: [
      'Audit, tax, advisory at firms of every size',
      'Corporate finance, controllership, CFO track long-term',
      'Independent practice',
    ],
    challengeQuestion:
      'CA costs very little and pays ₹7–13L — but the Final pass rate is often under 20% per attempt and it takes ~4.5 years with articleship. That combination means most who start don’t finish on schedule. What’s your plan if you’re in the 80%, not the 20%?',
    costMin: 3,
    costMax: 4,
    yearsToFirstIncome: 4.5,
    payDescription: '₹6–13L to start (avg ~7–9L; up to ~13L via ICAI campus placements)',
    eligibilityThreshold: {
      metric: 'ICAI Foundation route (post-Class 12)',
      typicalValue: 'No board % cut-off to start; strong accounts + maths help greatly',
      note: 'It is exam-gated, not admission-gated — the ICAI exams are the real filter.',
    },
    searchKeywords: 'chartered accountant fresher',
    sourceUrls: [{ title: 'ICAI (official)', url: 'https://www.icai.org/' }],
  }),
  n({
    id: 'c_economics',
    stage: 3,
    parentId: 's_com_m',
    label: 'Economics',
    subtitle: 'B.A./B.Sc Economics → master’s → analyst/policy',
    traitDelta: { analytical: 3, structure: 1 },
    insight:
      'A rigorous, respected path that quietly requires a master’s for most of the good roles. From a strong college (DSE, ISI, Ashoka, top DU colleges) it opens finance, consulting, data, and policy. From a weak one with only a bachelor’s, it stalls.',
    checklist: [
      'Aim for a strong-college bachelor’s — the college matters a lot here',
      'Plan for a master’s (MA Economics) — most real roles expect it',
      'Sharpen maths and statistics; modern economics is quantitative',
    ],
    opportunities: [
      'Economic consulting, finance, research, data analytics',
      'Policy think-tanks, RBI/government economic services',
      'Academia after a master’s/PhD',
    ],
    challengeQuestion:
      'Economics with just a bachelor’s leaves most well-paying roles out of reach — the value shows up after a master’s. Are you signed up for the longer route, or picturing a job straight out of a B.A.?',
    costMin: 2,
    costMax: 8,
    yearsToFirstIncome: 3,
    payDescription: 'Modest with a bachelor’s alone; strong after a master’s from a good school',
    eligibilityThreshold: {
      metric: 'Class 12 % + college entrance (CUET etc.)',
      typicalValue: '90%+ for top DU colleges; CUET-driven now',
      note: 'Top-college cutoffs are very high and shift yearly — verify via CUET/college.',
    },
    searchKeywords: 'economist analyst',
    sourceUrls: [{ title: 'CUET — NTA (official)', url: 'https://cuet.nta.nic.in/' }],
  }),
  n({
    id: 'c_bcom_finance',
    stage: 3,
    parentId: 's_com_m',
    label: 'B.Com + finance electives',
    subtitle: 'commerce degree geared toward finance roles',
    traitDelta: { analytical: 2, structure: 2 },
    insight:
      'A flexible, low-cost base that becomes valuable when you stack a real credential on it — CFA level 1, FRM, a good MBA, or serious Excel/analytics skill. On its own it’s common; layered, it’s a genuine finance on-ramp.',
    checklist: [
      'Plan the "+1" from day one — a certification or skill that lifts a plain B.Com',
      'Get comfortable with Excel/financial modelling early',
      'Target internships — finance hires heavily on them',
    ],
    opportunities: [
      'Banking, financial analysis, audit, accounting roles',
      'Fintech and analytics with the right add-on skills',
      'MBA finance later',
    ],
    challengeQuestion:
      'A plain B.Com starts around ₹3–5L and there are a lot of them. The pay you’re imagining usually belongs to the B.Com plus a CFA/MBA/skill. What’s your specific "+1" going to be?',
    costMin: 2,
    costMax: 8,
    yearsToFirstIncome: 3,
    payDescription: '₹3–5L to start; climbs with certifications (CFA/FRM) or an MBA',
    eligibilityThreshold: {
      metric: 'Class 12 % + CUET for top colleges',
      typicalValue: '75%+ for good colleges; CUET-driven',
      note: 'Top-college cutoffs shift yearly — verify via CUET/college.',
    },
    searchKeywords: 'finance analyst commerce',
    sourceUrls: [{ title: 'CUET — NTA (official)', url: 'https://cuet.nta.nic.in/' }],
  }),
  n({
    id: 'c_analytics',
    stage: 3,
    parentId: 's_com_m',
    label: 'Business analytics',
    subtitle: 'data + business — BBA-analytics / B.Sc analytics',
    traitDelta: { analytical: 3, creative: 1, risk: 1 },
    insight:
      'The commerce-side route into the data economy. Entry pay is ordinary, but real project experience and tool fluency (SQL, Python, Power BI) move it fast. The degree opens the door; what you can actually build keeps it open.',
    checklist: [
      'Learn SQL + one BI tool + basic Python outside class — non-negotiable',
      'Build a portfolio of real analyses, not just coursework',
      'Chase internships where you touch real data',
    ],
    opportunities: [
      'Analyst roles across every industry',
      'Data / product analytics; a bridge toward data science',
      'Consulting and operations analytics',
    ],
    challengeQuestion:
      'Analytics starts at a modest ₹3.2–4.4L and only jumps to ₹8L+ once you have real project experience and tools — the degree alone doesn’t do it. Are you ready to build that portfolio yourself, or expecting the course to hand it to you?',
    costMin: 3,
    costMax: 8,
    yearsToFirstIncome: 3,
    payDescription: '₹3.2–4.4L to start; ₹8L+ with real project experience and tools',
    eligibilityThreshold: {
      metric: 'Class 12 % (with Maths) + college entrance',
      typicalValue: '70%+ for good programmes',
      note: 'Programmes vary widely in quality — verify curriculum and placements per college.',
    },
    searchKeywords: 'business analyst data',
    sourceUrls: [{ title: 'CUET — NTA (official)', url: 'https://cuet.nta.nic.in/' }],
  }),

  // ── Commerce without Maths ────────────────────────────────────────────────
  n({
    id: 'c_bcom',
    stage: 3,
    parentId: 's_com',
    label: 'B.Com',
    subtitle: 'the general commerce degree',
    traitDelta: { structure: 2 },
    insight:
      'The most common degree in the country — cheap, flexible, and exactly as valuable as what you attach to it. As a standalone it’s ordinary; as a base for CA-inter, an MBA, a government exam, or a specific skill, it’s a sensible platform.',
    checklist: [
      'Decide early what the B.Com is a platform FOR — it’s rarely the end point',
      'Pick up one concrete skill (accounting software, Excel, communication)',
      'Consider pairing it with a professional exam',
    ],
    opportunities: [
      'Accounting, operations, sales, back-office roles',
      'Base for CA/CS, MBA, or government exams',
      'Small-business and family-business management',
    ],
    challengeQuestion:
      'A standalone B.Com starts around ₹3–5L and is genuinely common. Its value comes almost entirely from what you pair it with. What are you pairing it with — or is it the whole plan?',
    costMin: 1,
    costMax: 6,
    yearsToFirstIncome: 3,
    payDescription: '₹3–5L to start; value depends heavily on what you add to it',
    eligibilityThreshold: {
      metric: 'Class 12 % + CUET for top colleges',
      typicalValue: '60%+ widely; higher for top DU/city colleges',
      note: 'Cutoffs vary by college and category — verify via CUET/college.',
    },
    searchKeywords: 'commerce graduate',
    sourceUrls: [{ title: 'CUET — NTA (official)', url: 'https://cuet.nta.nic.in/' }],
  }),
  n({
    id: 'c_bba',
    stage: 3,
    parentId: 's_com',
    label: 'BBA / Management',
    subtitle: 'business administration → MBA track',
    traitDelta: { people: 2, structure: 1, risk: 1 },
    insight:
      'A management on-ramp that is really the first half of a two-part plan — BBA then MBA. From a top college it’s a strong launch; from an average one it’s a generic degree until the MBA does the heavy lifting. Where you do it matters more than that you did it.',
    checklist: [
      'Treat BBA as step one of a BBA→MBA plan, and target a good MBA early',
      'Build people-facing experience — clubs, events, real responsibility',
      'Aim high on college; the brand does a lot of the work here',
    ],
    opportunities: [
      'Management trainee, operations, HR, marketing, sales roles',
      'MBA at a top B-school as the real accelerator',
      'Entrepreneurship and family business',
    ],
    challengeQuestion:
      'BBA from a top college can start at ₹9–12L+, but from an average one it’s ₹2.5–6L and the MBA is really what pays. Which college band are you actually targeting, and is the MBA plan real or vague?',
    costMin: 2,
    costMax: 10,
    yearsToFirstIncome: 3,
    payDescription: '₹2.5–6L to start; ₹9–12L+ from top colleges; MBA lifts it further',
    eligibilityThreshold: {
      metric: 'Class 12 % + entrances (IPMAT, CUET, college tests)',
      typicalValue: '60%+ widely; top colleges use competitive entrances',
      note: 'Top-programme entrances (e.g. IPMAT) are competitive — verify per college.',
    },
    searchKeywords: 'management trainee',
    sourceUrls: [{ title: 'CUET — NTA (official)', url: 'https://cuet.nta.nic.in/' }],
  }),
  n({
    id: 'c_law',
    stage: 3,
    parentId: 's_hum',
    label: 'Law',
    subtitle: '5-year integrated LL.B. (also reachable from Commerce)',
    traitDelta: { analytical: 2, people: 2, structure: 1 },
    insight:
      'One of the most bimodal paths on the map. A top NLU via CLAT leads to corporate law at ₹15–22L; litigation can mean ₹5,000–30,000/month for years while you build a name. Same degree, wildly different first decade. CLAT rank, not stream, is the real gate.',
    checklist: [
      'Prepare for CLAT / AILET seriously — the NLU gap is enormous',
      'Decide honestly: corporate (fast money, hard hours) or litigation (slow build)',
      'Understand the 5-year integrated timeline',
    ],
    opportunities: [
      'Corporate law at firms (top NLUs place very well)',
      'Litigation, judiciary (via judicial services exams)',
      'Policy, compliance, legal-tech, in-house counsel',
    ],
    challengeQuestion:
      'The same law degree pays ₹15–22L at a top NLU and ₹5,000–30,000/month in early litigation. That split is almost entirely CLAT rank and path choice. Which of those two futures are you actually planning for?',
    costMin: 13,
    costMax: 25,
    yearsToFirstIncome: 5,
    payDescription: 'Corporate: ₹15–22L at top NLUs. Litigation: ₹5,000–30,000/mo for years, then climbs.',
    eligibilityThreshold: {
      metric: 'CLAT / AILET rank + Class 12 %',
      typicalValue: '45%+ in Class 12 (min); CLAT rank decides the college tier',
      note: 'Cheaper non-NLU routes exist (₹1–5L) — the ₹13–25L figure is NLU-tier. Verify per college.',
    },
    searchKeywords: 'legal associate lawyer',
    sourceUrls: [
      { title: 'CLAT — Consortium of NLUs (official)', url: 'https://consortiumofnlus.ac.in/' },
    ],
  }),
  n({
    id: 'c_digital_marketing',
    stage: 3,
    parentId: 's_com',
    label: 'Digital marketing',
    subtitle: 'performance, content, brand, social',
    traitDelta: { creative: 2, people: 2, risk: 1 },
    insight:
      'One of the few fields where a portfolio and demonstrated results outrun a degree, and where you can start earning while still studying. Low barrier to enter, genuinely uncapped for the good ones, crowded at the bottom. Skills and a track record are the currency.',
    checklist: [
      'Run one real thing — a page, a small campaign, a channel — and track numbers',
      'Learn the tools (Meta/Google Ads, analytics, SEO, basic design)',
      'Build a public portfolio of results, not certificates',
    ],
    opportunities: [
      'Performance marketing, SEO/content, social media, brand roles',
      'Freelance and agency work — starts early, scales with results',
      'Growth roles at startups',
    ],
    challengeQuestion:
      'Digital marketing starts around ₹2.5–5L and is easy to enter, which means it’s crowded — the people who break out have a track record of real results, not a certificate. What results can you point to, or is that still hypothetical?',
    costMin: 2,
    costMax: 8,
    yearsToFirstIncome: 3,
    payDescription: '₹2.5–5L to start; genuinely uncapped for those who show results',
    eligibilityThreshold: {
      metric: 'Portfolio + demonstrated results',
      typicalValue: 'Largely un-gated by degree/percentage',
      note: 'This field hires on proof of work far more than credentials.',
    },
    searchKeywords: 'digital marketing',
    sourceUrls: [{ title: 'Google Digital Garage (skills)', url: 'https://grow.google/intl/en_in/' }],
  }),

  // ── Humanities ────────────────────────────────────────────────────────────
  n({
    id: 'c_civil_services',
    stage: 3,
    parentId: 's_hum',
    label: 'Civil services',
    subtitle: 'UPSC — IAS / IPS / IFS and allied',
    traitDelta: { analytical: 2, people: 2, structure: 2 },
    insight:
      'The highest-status public path in the country and one of the hardest lotteries in it. The prep is years long, the selection rate is ~0.1–0.2%, and most serious aspirants give it multiple full-time years. Immense meaning if it lands; a very expensive detour if it doesn’t — so a plan B is not optional.',
    checklist: [
      'Understand this needs a degree first, then years of dedicated prep',
      'Build a genuine plan B — the odds demand it',
      'Start reading widely now; the syllabus rewards a long runway',
    ],
    opportunities: [
      'IAS/IPS/IFS and central services',
      'Policy, administration, public leadership',
      'State civil services as a parallel target',
    ],
    challengeQuestion:
      'UPSC’s selection rate is about 0.1–0.2%, and most aspirants give it several full-time years before earning a ₹56,100/mo basic if selected. That’s a large bet with a small hit-rate. What is your concrete plan B if it doesn’t come through in two attempts?',
    costMin: 4,
    costMax: 12,
    yearsToFirstIncome: 3,
    payDescription: '₹56,100/mo basic if selected — but selection rate is ~0.1–0.2%',
    eligibilityThreshold: {
      metric: 'Any bachelor’s degree + UPSC CSE',
      typicalValue: 'Graduation required; the exam is the filter, not marks',
      note: 'Age limits and attempt counts vary by category — verify on the official UPSC source.',
    },
    searchKeywords: 'public policy administration',
    sourceUrls: [{ title: 'UPSC (official)', url: 'https://upsc.gov.in/' }],
  }),
  n({
    id: 'c_journalism',
    stage: 3,
    parentId: 's_hum',
    label: 'Journalism / media',
    subtitle: 'reporting, digital media, communication',
    traitDelta: { creative: 2, people: 2, risk: 1 },
    insight:
      'Meaningful, public-facing work that pays modestly at the start and rewards a body of published work over a degree. The industry is shifting from print to digital and creator-led media, which has widened who can break in and how early.',
    checklist: [
      'Publish now — a blog, a channel, a student paper. Clips beat certificates.',
      'Learn digital skills (video, audio, social) alongside writing',
      'Find a beat you know more about than most people',
    ],
    opportunities: [
      'Reporting, editing, digital content, communications',
      'Creator-led and independent media',
      'PR / corporate communications (steadier pay)',
    ],
    challengeQuestion:
      'Media starts at a modest ₹2–6L and the pay improves slowly, on the strength of published work rather than a degree. Are you willing to build clips before the money shows up, or is the modest early pay a dealbreaker?',
    costMin: 2,
    costMax: 8,
    yearsToFirstIncome: 3,
    payDescription: '₹2–6L to start; climbs with a strong body of published work',
    eligibilityThreshold: {
      metric: 'Class 12 % + portfolio / entrance for top schools',
      typicalValue: '50%+ widely; top schools (IIMC etc.) have entrances',
      note: 'Clips and a portfolio matter more than marks here — verify per school.',
    },
    searchKeywords: 'journalist content writer media',
    sourceUrls: [{ title: 'IIMC (official)', url: 'https://iimc.gov.in/' }],
  }),
  n({
    id: 'c_psychology',
    stage: 3,
    parentId: 's_hum',
    label: 'Psychology',
    subtitle: 'B.A./B.Sc Psychology → master’s → practice/HR',
    traitDelta: { people: 3, analytical: 1 },
    insight:
      'A fast-growing, genuinely needed field that almost always requires a master’s to practise or pay well. Clinical, counselling, organisational (HR), and research branches diverge a lot. Chosen with the master’s in view it’s solid; chosen expecting a bachelor’s to be enough, it disappoints.',
    checklist: [
      'Plan for a master’s (and licensing for clinical) from the start',
      'Pick a branch early — clinical vs counselling vs organisational vs research',
      'Get real exposure (volunteering, internships) — it clarifies the branch fast',
    ],
    opportunities: [
      'Clinical / counselling psychology (needs a master’s + supervised practice)',
      'Organisational psychology / HR (steadier corporate pay)',
      'Research, academia, UX research',
    ],
    challengeQuestion:
      'Psychology with only a bachelor’s pays modestly and rarely lets you practise — the field really opens after a master’s (and licensing for clinical work). Is the longer, master’s-plus route one you’re actually committed to?',
    costMin: 2,
    costMax: 8,
    yearsToFirstIncome: 3,
    payDescription: 'Modest with a bachelor’s alone; clinical/HR roles pay after a master’s',
    eligibilityThreshold: {
      metric: 'Class 12 % + CUET / college entrance',
      typicalValue: '60%+ widely; higher for top colleges',
      note: 'Clinical practice needs RCI-recognised qualifications — verify the route per college.',
    },
    searchKeywords: 'psychologist counsellor HR',
    sourceUrls: [{ title: 'Rehabilitation Council of India', url: 'https://rehabcouncil.nic.in/' }],
  }),
]

// ── Lookups ─────────────────────────────────────────────────────────────────

export const ALL_NODES: DecisionNode[] = [...INTERESTS, ...STREAMS, ...CAREERS]

export const NODE_BY_ID: Record<string, DecisionNode> = Object.fromEntries(
  ALL_NODES.map((nn) => [nn.id, nn]),
)

export function careersForStream(streamId: string): DecisionNode[] {
  return CAREERS.filter((c) => c.parentId === streamId)
}

/** Which streams an interest most points toward (for gentle highlighting). */
export const INTEREST_STREAM_HINTS: Record<string, string[]> = {
  i_build: ['s_pcm'],
  i_life: ['s_pcb'],
  i_money: ['s_com_m', 's_com'],
  i_people: ['s_hum', 's_com'],
  i_make: ['s_pcm', 's_hum'],
  i_data: ['s_pcm', 's_com_m'],
}
