// Future Map — the adversarial challenge (spec 4.4).
//
// Confirming a stage-2/3 choice is gated by a pushback question grounded in a real
// number, never a generic "are you sure." If the choice contradicts the student's
// accumulated profile (4.5) or stated budget/timeline (4.6) or eligibility (4.9),
// that mismatch is named explicitly BEFORE the question. Every hard question pairs
// with a genuine, judgment-free exit (Section 7) — reconsidering is never "wrong."

import { checkEligibility } from './eligibility'
import { normalizedTraits, topTraits } from './profile'
import type { DecisionNode, Profile, Stage, TraitKey } from './types'
import { TRAIT_KEYS, TRAIT_META } from './types'

export type MismatchType = 'budget' | 'timeline' | 'eligibility' | 'profile'

export interface Mismatch {
  type: MismatchType
  text: string
}

export interface Challenge {
  nodeId: string
  question: string
  mismatches: Mismatch[]
  /** True if a genuine mismatch was named — confirming despite it counts for more. */
  contested: boolean
}

function fmtLakh(n: number): string {
  return `₹${n % 1 === 0 ? n : n.toFixed(1)}L`
}

export function buildChallenge(
  node: DecisionNode,
  profile: Profile,
  confirmedStages: Stage[],
): Challenge {
  const mismatches: Mismatch[] = []

  // ── Budget (spec 4.6) — name the gap, and whether a cheaper route fits ──
  if (node.stage === 3 && profile.constraints.budgetLakh != null && node.costMin != null) {
    const budget = profile.constraints.budgetLakh
    if (node.costMin > budget) {
      mismatches.push({
        type: 'budget',
        text: `Over your ${fmtLakh(budget)} budget even on the cheapest route — by ~${fmtLakh(
          node.costMin - budget,
        )}. No version of this fits as set.`,
      })
    } else if (node.costMax != null && node.costMax > budget) {
      mismatches.push({
        type: 'budget',
        text: `Fits your ${fmtLakh(budget)} budget only at the low end (from ${fmtLakh(
          node.costMin,
        )}); the typical private ceiling is ${fmtLakh(node.costMax)}, ${fmtLakh(
          node.costMax - budget,
        )} over.`,
      })
    }
  }

  // ── Timeline (spec 4.6) ──
  if (
    node.stage === 3 &&
    profile.constraints.maxYears != null &&
    node.yearsToFirstIncome != null &&
    node.yearsToFirstIncome > profile.constraints.maxYears
  ) {
    mismatches.push({
      type: 'timeline',
      text: `~${node.yearsToFirstIncome} yrs to a first paycheck — ${(
        node.yearsToFirstIncome - profile.constraints.maxYears
      ).toFixed(1)} longer than the ${profile.constraints.maxYears} you set.`,
    })
  }

  // ── Eligibility (spec 4.9) ──
  if (node.stage === 3 && profile.percentage != null && node.eligibilityThreshold) {
    const el = checkEligibility(node, profile.percentage, profile.category)
    if (el.status === 'shortfall' || el.status === 'stretch') {
      mismatches.push({ type: 'eligibility', text: el.gapNote })
    }
  }

  // ── Profile (spec 4.4/4.5) — only when there's enough signal to be honest ──
  if (profile.convictionSamples >= 1) {
    const norm = normalizedTraits(profile, confirmedStages)
    const nodeTop = nodeTopTrait(node)
    if (nodeTop && norm[nodeTop] < 0.25) {
      const strong = topTraits(norm, 1)[0]
      if (strong && strong !== nodeTop) {
        mismatches.push({
          type: 'profile',
          text: `Leans ${TRAIT_META[nodeTop].label.toLowerCase()}, but your choices so far read more ${TRAIT_META[
            strong
          ].label.toLowerCase()}. Not a veto — just worth naming.`,
        })
      }
    }
  }

  return {
    nodeId: node.id,
    question: node.challengeQuestion,
    mismatches,
    contested: mismatches.length > 0,
  }
}

function nodeTopTrait(node: DecisionNode): TraitKey | null {
  let best: TraitKey | null = null
  let bestV = 0
  for (const t of TRAIT_KEYS) {
    const v = node.traitDelta[t] ?? 0
    if (v > bestV) {
      bestV = v
      best = t
    }
  }
  return best
}
