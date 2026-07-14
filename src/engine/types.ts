// Future Map — engine types.
// Framework-agnostic. Notation for clarity, not a storage-technology choice.

// ─────────────────────────────────────────────────────────────────────────────
// Personality & conviction model (spec 6.2)
// ─────────────────────────────────────────────────────────────────────────────

export type TraitKey = 'analytical' | 'creative' | 'risk' | 'people' | 'structure'

export const TRAIT_KEYS: TraitKey[] = [
  'analytical',
  'creative',
  'risk',
  'people',
  'structure',
]

export const TRAIT_META: Record<
  TraitKey,
  { label: string; blurb: string; color: string }
> = {
  analytical: {
    label: 'Analytical',
    blurb: 'drawn to systems, numbers, and figuring out how things work',
    color: '#5aa9e6',
  },
  creative: {
    label: 'Creative',
    blurb: 'drawn to making, designing, and open-ended problems',
    color: '#b98ce6',
  },
  risk: {
    label: 'Risk-tolerant',
    blurb: 'willing to trade certainty for a bigger, less-charted upside',
    color: '#f08a6a',
  },
  people: {
    label: 'People-oriented',
    blurb: 'energised by working with, helping, and persuading people',
    color: '#4fc4a1',
  },
  structure: {
    label: 'Structure-seeking',
    blurb: 'reassured by clear steps, credentials, and a defined ladder',
    color: '#8a92c9',
  },
}

/** A sparse partial vector — a node only nudges the traits it actually signals. */
export type Vector5 = Partial<Record<TraitKey, number>>

// ─────────────────────────────────────────────────────────────────────────────
// The decision map (spec 6.1)
// ─────────────────────────────────────────────────────────────────────────────

export type Stage = 1 | 2 | 3

export interface EligibilityThreshold {
  metric: string // e.g. "Class 12 PCM %", "JEE Main percentile"
  typicalValue: string // e.g. "75%+ for a decent private college"
  note: string // always caveated — cutoffs move
}

export interface DecisionNode {
  id: string
  stage: Stage
  parentId?: string // stage-2 id, for stage-3 nodes; stage-1 id for stage-2 nodes
  label: string
  subtitle: string
  traitDelta: Vector5
  insight: string
  checklist: string[]
  opportunities: string[]
  challengeQuestion: string
  // stage 2 only
  entrancePrepCost?: string
  // stage 3 only
  costMin?: number // INR lakh (single consistent unit — spec 6.1 note)
  costMax?: number
  yearsToFirstIncome?: number
  payDescription?: string
  eligibilityThreshold?: EligibilityThreshold
  searchKeywords?: string
  jobSearchUrl?: string
  courseSearchUrl?: string
  sourceUrls?: { title: string; url: string }[]
  lastVerified?: string // ISO date — freshness marker (spec 4.3)
  userAdded?: boolean // created via path research (spec 4.2)
  /** Optional exam / deadline hint for stage-3 (spec 4.13, indicative). */
  keyDates?: { label: string; window: string }[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Signal check (spec 6.5)
// ─────────────────────────────────────────────────────────────────────────────

export type TruthVerdict =
  | 'accurate'
  | 'partly_true'
  | 'outdated'
  | 'misleading'
  | 'unverifiable'
  | 'not_a_claim' // spec 4.17 — a values/wellbeing question, not a fact to check

export type ImpactVerdict =
  | 'no_change'
  | 'worth_reconsidering'
  | 'partial_adjustment'
  | 'not_applicable'

export interface ClaimVerdict {
  truthVerdict: TruthVerdict
  impact: ImpactVerdict
  impactNote: string // one direct sentence, specific to the student's actual path
  summary: string
  detail: string
  sources: { title: string; url: string; tier: 'primary' | 'secondary' }[]
  escalate?: boolean // spec 4.17 — hand off to a human
}

export interface ClaimInput {
  claim: string
  source: string // who said it — attribution (spec 4.8)
  evidenceUrl?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Eligibility & category (spec 6.6)
// ─────────────────────────────────────────────────────────────────────────────

export type Category = 'general' | 'obc' | 'ews' | 'sc' | 'st' | 'unspecified'

export interface EligibilityResult {
  pathId: string
  studentPercentage?: number
  category: Category
  typicalThreshold: string
  status: 'clear' | 'stretch' | 'shortfall' | 'unknown'
  gapNote: string // specific, never a bare pass/fail
  verifyNote: string // always present — cutoffs vary by year/institution/category
}

// ─────────────────────────────────────────────────────────────────────────────
// The one unified record (spec 5)
// ─────────────────────────────────────────────────────────────────────────────

export type RecordKind =
  | 'confirm'
  | 'reconsider'
  | 'skip'
  | 'claim'
  | 'constraint'
  | 'eligibility'
  | 'exclude'
  | 'research'
  | 'freshness'
  | 'revisit'
  | 'note'

export interface RecordEntry {
  id: string
  kind: RecordKind
  at: number // epoch ms
  title: string
  detail?: string
  nodeId?: string
  /** The reasoning the student gave — re-surfaced on revisit (spec 4.18). */
  reasoning?: string
  meta?: Record<string, unknown>
}

// ─────────────────────────────────────────────────────────────────────────────
// Constraints (spec 4.6)
// ─────────────────────────────────────────────────────────────────────────────

export interface Constraints {
  budgetLakh?: number // total, INR lakh
  maxYears?: number // years willing to invest before earning
}

// ─────────────────────────────────────────────────────────────────────────────
// The profile — the guaranteed takeaway (spec 4.5, the learned model)
// ─────────────────────────────────────────────────────────────────────────────

export interface Profile {
  traits: Record<TraitKey, number> // accumulated, un-normalised
  /** How the student holds a position under pushback (spec 4.5, proposed). */
  conviction: number
  convictionSamples: number
  percentage?: number
  category: Category
  constraints: Constraints
}

export interface StudentContext {
  displayName?: string
  profile: Profile
  chosenPathId?: string // the one confirmed stage-3 node
  chosenStreamId?: string // confirmed stage-2 node
  chosenInterestId?: string // stage-1
  excluded: string[] // node ids
}
