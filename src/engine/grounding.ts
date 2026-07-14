// Future Map — the grounding seam + agent tool catalog (spec 4.16, 6.4).
//
// ── The seam ────────────────────────────────────────────────────────────────
// Thesis #1: ground every decision in real, current, sourced data — never in what a
// model already "knows." In a live deployment every function below is backed by a
// LiveGroundingProvider that runs a real search + primary-source-weighted read (and,
// for the browser, a small server holding the keys). This build ships a deterministic
// SeedGroundingProvider so the whole experience runs offline with honestly-dated seed
// data. Both satisfy the same interface, so swapping in the live one is a config change,
// not a rewrite. Every result the seed provider returns is marked as such.

import { checkClaim } from './signal'
import { checkEligibility } from './eligibility'
import { ALL_NODES, CAREERS, NODE_BY_ID, STREAMS, jobSearchUrl, courseSearchUrl } from './seed'
import type {
  ClaimInput,
  ClaimVerdict,
  DecisionNode,
  EligibilityResult,
  StudentContext,
} from './types'

export interface Freshness {
  nodeId: string
  hasUpdate: boolean
  note: string
  checkedAsOf: string
  sourceHint?: { title: string; url: string }
}

export interface ResearchResult {
  confirmed: boolean
  node?: DecisionNode
  note: string
}

export interface Workaround {
  title: string
  detail: string
}
export interface WorkaroundResult {
  nodeId: string
  routes: Workaround[]
  note: string
}

export interface AidScheme {
  title: string
  detail: string
  categoryTied: boolean
}
export interface FinancialAidResult {
  nodeId: string
  schemes: AidScheme[]
  note: string
}

export interface DeadlineResult {
  nodeId: string
  dates: { label: string; window: string }[]
  checkedAsOf: string
  verifyNote: string
  source?: { title: string; url: string }
}

export interface GroundingProvider {
  readonly live: boolean
  checkClaim(input: ClaimInput, ctx: StudentContext): Promise<ClaimVerdict>
  checkEligibility(nodeId: string, ctx: StudentContext): Promise<EligibilityResult>
  researchPath(name: string): Promise<ResearchResult>
  checkFreshness(nodeId: string): Promise<Freshness>
  findWorkaround(nodeId: string, ctx: StudentContext): Promise<WorkaroundResult>
  checkFinancialAid(nodeId: string, ctx: StudentContext): Promise<FinancialAidResult>
  checkDeadlines(nodeId: string): Promise<DeadlineResult>
}

const AS_OF = '2026-02-01'

// A small set of real, currently-offered paths the map can extend to on request
// (spec 4.2). Anything outside this — and outside the curated set — returns an honest
// "couldn’t confirm" rather than a fabricated profile.
const RESEARCHABLE: Record<string, Omit<DecisionNode, 'id' | 'stage' | 'userAdded'>> = {
  'data science': {
    parentId: 's_pcm',
    label: 'Data science',
    subtitle: 'statistics + code + domain — usually a master’s-shaped path',
    traitDelta: { analytical: 3, creative: 1, risk: 1 },
    insight:
      'A real and current field, but "data scientist" is a senior-ish title more than an entry role — most people enter via analytics/engineering and grow into it, often with a master’s. Entered as a first job title it’s frequently mis-sold.',
    checklist: [
      'Enter through analytics or software, then specialise',
      'Build a portfolio of real modelling on real data',
      'Plan for a strong quantitative master’s for the senior roles',
    ],
    opportunities: ['Analytics → data science track', 'ML/AI roles with strong maths', 'Research after a master’s'],
    challengeQuestion:
      'Very few "data scientist" roles hire fresh out of a bachelor’s — most want experience or a master’s. Are you planning the on-ramp (analytics first), or expecting the title on day one?',
    costMin: 4,
    costMax: 12,
    yearsToFirstIncome: 3,
    payDescription: '₹4–8L via an analytics on-ramp; senior data-science pay comes with experience/master’s',
    eligibilityThreshold: {
      metric: 'Class 12 % (with Maths) + strong quantitative base',
      typicalValue: '70%+ and genuine comfort with maths/stats',
      note: 'Programme quality varies enormously — verify placements per programme.',
    },
    searchKeywords: 'data scientist analyst',
    sourceUrls: [{ title: 'NASSCOM — tech talent reports', url: 'https://nasscom.in/' }],
    lastVerified: AS_OF,
  },
  'aerospace engineering': {
    parentId: 's_pcm',
    label: 'Aerospace engineering',
    subtitle: 'aeronautical / aerospace B.Tech — a specialised engineering branch',
    traitDelta: { analytical: 3, structure: 1, risk: 1 },
    insight:
      'A real, current branch with a narrower employer base than mainstream engineering — ISRO/DRDO, a few private aerospace firms, and airlines on the maintenance side. Rewarding for the genuinely committed; thinner on fallback options than CSE/mechanical.',
    checklist: [
      'Target IITs / a few strong aerospace departments — the field is concentrated',
      'Know the main employers are public-sector and a handful of firms',
      'Keep a broader mechanical/software fallback in view',
    ],
    opportunities: ['ISRO / DRDO / HAL', 'Private aerospace & defence firms', 'Airline & MRO engineering'],
    challengeQuestion:
      'Aerospace has a much smaller employer pool than mainstream engineering, concentrated in public-sector bodies. Are you committed enough that the narrower job market is a price you’ll accept?',
    costMin: 8,
    costMax: 22,
    yearsToFirstIncome: 4,
    payDescription: '₹4–10L to start; strongest at top institutes and public-sector research bodies',
    eligibilityThreshold: {
      metric: 'Class 12 PCM % + JEE rank',
      typicalValue: '75%+ PCM; JEE rank for the strong departments',
      note: 'Cutoffs vary by year and category — verify on the official source.',
    },
    searchKeywords: 'aerospace aeronautical engineer',
    sourceUrls: [{ title: 'JEE Main — NTA (official)', url: 'https://jeemain.nta.nic.in/' }],
    lastVerified: AS_OF,
  },
  'hotel management': {
    parentId: 's_com',
    label: 'Hotel management',
    subtitle: 'BHM / hospitality — service, operations, culinary',
    traitDelta: { people: 3, structure: 1, risk: 1 },
    insight:
      'A real, reachable-from-most-streams path with modest starting pay and strong global mobility. IHM institutes (via NCHMCT JEE) are the recognised route. Rewards people-skills and stamina; the early years are demanding and low-paid.',
    checklist: [
      'Look at IHMs via NCHMCT JEE — the recognised route',
      'Accept demanding, low-paid early years as the norm',
      'Note the strong overseas and cruise-line pathways',
    ],
    opportunities: ['Hotels & resorts (India + overseas)', 'Cruise lines, aviation, events', 'Culinary & F&B management'],
    challengeQuestion:
      'Hospitality starts modestly and the early years are physically demanding, long-houred, and low-paid before it climbs. Is the people-and-service work genuinely the draw, or the idea of travel?',
    costMin: 2,
    costMax: 10,
    yearsToFirstIncome: 3,
    payDescription: '₹2.5–5L to start; strong international mobility as you climb',
    eligibilityThreshold: {
      metric: 'Class 12 % + NCHMCT JEE',
      typicalValue: '50%+ and the entrance for IHMs',
      note: 'Verify per institute; private colleges vary widely in quality.',
    },
    searchKeywords: 'hotel management hospitality',
    sourceUrls: [{ title: 'NCHMCT (official)', url: 'https://nchm.nta.nic.in/' }],
    lastVerified: AS_OF,
  },
  'animation': {
    parentId: 's_hum',
    label: 'Animation & VFX',
    subtitle: 'animation, VFX, game art — portfolio-first creative tech',
    traitDelta: { creative: 3, analytical: 1, risk: 1 },
    insight:
      'A real, growing field riding India’s media/VFX outsourcing boom — portfolio-gated, software-heavy, and open from most streams. The bottom is crowded and modest; strong artists at good studios do well. Skills and reel matter far more than the degree.',
    checklist: [
      'Build a demo reel — it is the entry ticket, not the degree',
      'Learn the industry software early (Maya, Nuke, Houdini, etc.)',
      'Target a studio-recognised programme, not just any institute',
    ],
    opportunities: ['VFX / animation studios (a large Indian outsourcing base)', 'Game art', 'Advertising & motion design'],
    challengeQuestion:
      'Animation pay is portfolio-driven and the bottom of the field is crowded and modest. What’s on your reel — or is "I’m creative" still the whole plan?',
    costMin: 3,
    costMax: 12,
    yearsToFirstIncome: 3,
    payDescription: '₹2.5–5L to start; stronger for skilled artists at established studios',
    eligibilityThreshold: {
      metric: 'Portfolio / reel + programme entrance',
      typicalValue: 'Largely un-gated by percentage; the reel decides it',
      note: 'Programme quality varies hugely — verify studio placements per institute.',
    },
    searchKeywords: 'animation vfx artist',
    sourceUrls: [{ title: 'Skills — Google/industry resources', url: 'https://grow.google/intl/en_in/' }],
    lastVerified: AS_OF,
  },
}

// Deterministic, honest "what's new" notes per known node (spec 4.14). Says plainly
// when nothing material turned up rather than padding.
const FRESHNESS_NOTES: Record<string, string> = {
  c_engineering:
    'Material shift worth knowing: AI tooling is raising the entry bar for software roles, and CSE/AI-DS seats keep expanding while core-branch demand is steadier. The top-tier vs long-tail placement gap continues to widen.',
  c_medicine:
    'The NEET-PG bottleneck keeps tightening — PG is now effectively assumed, not optional. Private-seat costs continue to rise. Nothing has changed the ~6.5-year runway.',
  c_ca:
    'ICAI has periodically revised its scheme and paper structure — worth confirming the current scheme directly. Pass rates remain low; that hasn’t changed.',
  c_law:
    'CLAT format and the NLU landscape shift periodically (new NLUs, seat matrices). The corporate-vs-litigation pay split remains as stark as ever.',
  c_design:
    'UX/product design demand has cooled slightly from its peak but remains strong; portfolio expectations keep rising. Nothing that changes the portfolio-first reality.',
  c_analytics:
    'Tool expectations keep creeping up (SQL + Python + a BI tool is now baseline, not a bonus). The "portfolio beats degree" pattern is more true, not less.',
}

export class SeedGroundingProvider implements GroundingProvider {
  readonly live = false

  async checkClaim(input: ClaimInput, ctx: StudentContext): Promise<ClaimVerdict> {
    return checkClaim(input, ctx)
  }

  async checkEligibility(nodeId: string, ctx: StudentContext): Promise<EligibilityResult> {
    const node = NODE_BY_ID[nodeId]
    return checkEligibility(node, ctx.profile.percentage, ctx.profile.category)
  }

  async researchPath(name: string): Promise<ResearchResult> {
    const key = name.trim().toLowerCase()

    // Already on the curated map?
    const existing = ALL_NODES.find(
      (n) => n.label.toLowerCase() === key || n.label.toLowerCase().includes(key),
    )
    if (existing) {
      return {
        confirmed: true,
        node: existing,
        note: `"${existing.label}" is already on your map — opening it rather than duplicating it.`,
      }
    }

    // Researchable extension (spec 4.2) — built as a marked user-added node.
    const match = Object.keys(RESEARCHABLE).find((k) => key.includes(k) || k.includes(key))
    if (match) {
      const base = RESEARCHABLE[match]
      const node: DecisionNode = {
        ...base,
        id: `c_added_${match.replace(/[^a-z0-9]+/g, '_')}`,
        stage: 3,
        userAdded: true,
        jobSearchUrl: base.searchKeywords ? jobSearchUrl(base.searchKeywords) : undefined,
        courseSearchUrl: base.searchKeywords ? courseSearchUrl(base.searchKeywords) : undefined,
      }
      return {
        confirmed: true,
        node,
        note: `Confirmed "${node.label}" is a real, currently-offered path and built a full node for it. It’s marked user-researched — it hasn’t had the editorial scrutiny the curated set has.`,
      }
    }

    return {
      confirmed: false,
      note: `I couldn’t confirm "${name}" as a distinct, current path from here — so I won’t fabricate a profile for it. If it’s real, tell me a bit more (what you’d actually study or do), or check it against a primary source and add it as a note.`,
    }
  }

  async checkFreshness(nodeId: string): Promise<Freshness> {
    const node = NODE_BY_ID[nodeId]
    const note = FRESHNESS_NOTES[nodeId]
    return {
      nodeId,
      hasUpdate: !!note,
      note:
        note ??
        `Nothing materially new for ${node?.label ?? 'this path'} since it was last verified — the well-established basics haven’t shifted, and I won’t pad the answer to look busy.`,
      checkedAsOf: AS_OF,
      sourceHint: node?.sourceUrls?.[0],
    }
  }

  async findWorkaround(nodeId: string, ctx: StudentContext): Promise<WorkaroundResult> {
    const node = NODE_BY_ID[nodeId]
    const routes: Workaround[] = []

    // Generic, legitimate alternate-route patterns (spec 4.11 — never circumvention).
    routes.push({
      title: 'Lower-threshold institutions on the same qualification',
      detail: `The typical cutoff you saw is for the stronger institutes. The same degree (${node?.label}) is offered at many colleges with lower cutoffs — the qualification is identical; verify placements before choosing.`,
    })
    if (node?.id === 'c_engineering') {
      routes.push({
        title: 'State CET / lateral entry after a diploma',
        detail:
          'A polytechnic diploma → lateral entry into the 2nd year of B.Tech is a real, sanctioned route that sidesteps JEE entirely. State CETs also have separate, often lower, cutoffs than JEE.',
      })
    }
    if (node?.id === 'c_medicine') {
      routes.push({
        title: 'Adjacent healthcare qualifications',
        detail:
          'BDS, BAMS/BHMS (AYUSH), or allied-health degrees are legitimate healthcare routes with lower NEET cutoffs than MBBS — same field, different door. Not a workaround around NEET, a lower rung on it.',
      })
    }
    if (node?.parentId === 's_com_m' || node?.parentId === 's_com') {
      routes.push({
        title: 'Foundation / bridge programmes',
        detail:
          'Several professional tracks (CA, CS) start from a foundation exam rather than a college cutoff — a legitimate route in that doesn’t depend on a high board percentage.',
      })
    }
    routes.push({
      title: 'Bridge the gap, then transfer',
      detail:
        'An improvement/supplementary attempt to lift a board percentage, or a year at an accessible college before a transfer, are both real, sanctioned ways to reach a higher-cutoff programme over time.',
    })

    return {
      nodeId,
      routes,
      note:
        ctx.profile.percentage != null
          ? 'These are genuine, sanctioned alternate routes — never ways around a real requirement. Verify each against the official source; some vary by state.'
          : 'Add your percentage for a sharper read, but these routes are legitimate regardless.',
    }
  }

  async checkFinancialAid(nodeId: string, ctx: StudentContext): Promise<FinancialAidResult> {
    const node = NODE_BY_ID[nodeId]
    const cat = ctx.profile.category
    const schemes: AidScheme[] = [
      {
        title: 'National Scholarship Portal (NSP)',
        detail:
          'The government’s single window for central and state scholarships — merit, means, and category-based. The first place to look for almost any student aid.',
        categoryTied: false,
      },
      {
        title: 'Education loans (Vidya Lakshmi portal)',
        detail: `A common way families bridge a gap like ${node?.label}’s. Government-linked interest-subsidy schemes exist for lower-income brackets. Informational only — compare terms; this isn’t a recommendation of any lender.`,
        categoryTied: false,
      },
    ]
    if (cat !== 'general' && cat !== 'unspecified') {
      schemes.push({
        title: `Category-specific schemes (${cat.toUpperCase()})`,
        detail:
          'Post-matric and top-class scholarship schemes are specifically tied to category and income bracket, and can substantially offset fees. Eligibility and amounts are set by the scheme — verify on the official portal.',
        categoryTied: true,
      })
    }
    schemes.push({
      title: 'Institution & merit scholarships',
      detail:
        'Many colleges waive or reduce fees for high scorers or on need basis. Ask each shortlisted institute directly — these often go unclaimed.',
      categoryTied: false,
    })

    return {
      nodeId,
      schemes,
      note:
        cat === 'unspecified'
          ? 'This is factual scheme information, never a recommendation. Adding your category/income privately would surface the category-tied schemes many families qualify for and miss.'
          : 'Factual scheme information only — never a recommendation of a specific lender or a promise of eligibility. Verify each on its official portal.',
    }
  }

  async checkDeadlines(nodeId: string): Promise<DeadlineResult> {
    const node = NODE_BY_ID[nodeId]
    return {
      nodeId,
      dates: node?.keyDates ?? [],
      checkedAsOf: AS_OF,
      verifyNote:
        'These windows are indicative and recur roughly annually — they are NOT a system of record. Always confirm the exact current-cycle dates on the official source before relying on them.',
      source: node?.sourceUrls?.[0],
    }
  }
}

export const seedProvider = new SeedGroundingProvider()

/** Assemble a structured comparison (spec 4.7) — pure data, writes nothing. */
export function comparePaths(ids: string[]): DecisionNode[] {
  return ids.map((id) => NODE_BY_ID[id]).filter(Boolean)
}

export const streamCareerCount = STREAMS.map((s) => ({
  stream: s,
  count: CAREERS.filter((c) => c.parentId === s.id).length,
}))
