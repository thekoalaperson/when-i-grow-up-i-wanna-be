// Future Map — store-level (UI-facing) model types.

import type {
  Challenge,
  ClaimVerdict,
  DecisionNode,
  DeadlineResult,
  EligibilityResult,
  FinancialAidResult,
  Freshness,
  WorkaroundResult,
} from '@engine/index'

export type Mode = 'student' | 'counsellor'
export type Theme = 'light' | 'dark'

export type NodeStatus = 'candidate' | 'confirmed' | 'reconsidered' | 'excluded'

export interface PlacedNode {
  id: string
  status: NodeStatus
  addedAt: number
}

// ── Chat ────────────────────────────────────────────────────────────────────

export interface Chip {
  label: string
  value: string
  hint?: string
  kind?: 'interest' | 'stream' | 'career' | 'action'
  highlight?: boolean
}

export type ChatRole = 'system' | 'user' | 'tool'

export interface ChatMessage {
  id: string
  role: ChatRole
  at: number
  text?: string
  chips?: Chip[]
  /** For tool messages: the tool name being run (show-your-work, spec 6.4). */
  tool?: string
  rationale?: string
  /** A soft pointer to an insight card on the right. */
  pointsTo?: string
  typing?: boolean
}

// ── Insights feed (the "life artefact" content that accretes on the right) ────

export type InsightType =
  | 'challenge'
  | 'verdict'
  | 'freshness'
  | 'workaround'
  | 'aid'
  | 'deadline'
  | 'compare'
  | 'eligibility'
  | 'node'
  | 'opportunity'

export interface InsightBase {
  id: string
  type: InsightType
  at: number
  nodeId?: string
  title: string
  resolved?: boolean
}

export interface ChallengeInsight extends InsightBase {
  type: 'challenge'
  payload: Challenge
  stage: 2 | 3
}
export interface VerdictInsight extends InsightBase {
  type: 'verdict'
  payload: ClaimVerdict
  claim: string
  source: string
}
export interface FreshnessInsight extends InsightBase {
  type: 'freshness'
  payload: Freshness
}
export interface WorkaroundInsight extends InsightBase {
  type: 'workaround'
  payload: WorkaroundResult
}
export interface AidInsight extends InsightBase {
  type: 'aid'
  payload: FinancialAidResult
}
export interface DeadlineInsight extends InsightBase {
  type: 'deadline'
  payload: DeadlineResult
}
export interface CompareInsight extends InsightBase {
  type: 'compare'
  payload: DecisionNode[]
}
export interface EligibilityInsight extends InsightBase {
  type: 'eligibility'
  payload: EligibilityResult
}
export interface NodeInsight extends InsightBase {
  type: 'node'
  payload: DecisionNode
}
export interface OpportunityInsight extends InsightBase {
  type: 'opportunity'
  payload: { node: DecisionNode }
}

export type Insight =
  | ChallengeInsight
  | VerdictInsight
  | FreshnessInsight
  | WorkaroundInsight
  | AidInsight
  | DeadlineInsight
  | CompareInsight
  | EligibilityInsight
  | NodeInsight
  | OpportunityInsight

export type RightTab = 'insights' | 'profile' | 'record'
