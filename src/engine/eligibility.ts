// Future Map — eligibility & exclusion (spec 4.9, 6.6).
//
// Eligibility is a probabilistic, contextual read — never a closed door. Flags are
// always phrased "typically requires X, yours is currently Y, verify on the official
// source." Category/reservation status is optional and private; when absent, we frame
// as general category and say so — we never silently assume it (spec 4.9 critical rule).

import type { Category, DecisionNode, EligibilityResult } from './types'

export const CATEGORY_LABEL: Record<Category, string> = {
  general: 'General',
  obc: 'OBC',
  ews: 'EWS',
  sc: 'SC',
  st: 'ST',
  unspecified: 'not specified',
}

// Indicative easing (percentage points) that reserved-category cutoffs typically run
// below the general cutoff. Framing only — real cutoffs vary by year, institute and
// state, which is exactly why every result carries a verifyNote.
const CATEGORY_EASING: Record<Category, number> = {
  general: 0,
  unspecified: 0,
  ews: 2,
  obc: 5,
  sc: 10,
  st: 12,
}

function parseThresholdPct(typicalValue: string): number | null {
  const m = typicalValue.match(/(\d{2})\s*%/)
  return m ? parseInt(m[1], 10) : null
}

export function checkEligibility(
  node: DecisionNode,
  percentage: number | undefined,
  category: Category,
): EligibilityResult {
  const th = node.eligibilityThreshold
  const verifyNote =
    'Cutoffs move every year and vary by institute, category, and state quota — always verify on the official source before ruling anything in or out.'

  if (!th) {
    return {
      pathId: node.id,
      studentPercentage: percentage,
      category,
      typicalThreshold: 'No fixed percentage gate for this path.',
      status: 'unknown',
      gapNote: 'This path isn’t gated on a board percentage — an entrance, portfolio, or exam is the real filter.',
      verifyNote,
    }
  }

  const pct = parseThresholdPct(th.typicalValue)

  if (percentage == null || pct == null) {
    return {
      pathId: node.id,
      studentPercentage: percentage,
      category,
      typicalThreshold: th.typicalValue,
      status: 'unknown',
      gapNote:
        pct == null
          ? `${th.metric}: this path is gated more by an entrance/exam than by a raw percentage. ${th.note}`
          : `Add your percentage to see how you sit against the typical ${th.typicalValue}.`,
      verifyNote,
    }
  }

  const easing = CATEGORY_EASING[category]
  const effective = pct - easing
  const gap = percentage - effective

  const categoryFraming =
    category === 'unspecified'
      ? ' (framed as general category — if you belong to a reserved category, your effective cutoff is typically lower; add it privately for an accurate read.)'
      : category === 'general'
        ? ''
        : ` For ${CATEGORY_LABEL[category]} candidates the effective cutoff typically runs a few points lower, which is reflected here.`

  let status: EligibilityResult['status']
  let gapNote: string
  if (gap >= 3) {
    status = 'clear'
    gapNote = `Typically requires ~${pct}%${
      easing ? ` (about ${effective}% for ${CATEGORY_LABEL[category]})` : ''
    }; yours is ${percentage}% — comfortably above the usual line.${categoryFraming}`
  } else if (gap >= -3) {
    status = 'stretch'
    gapNote = `Typically requires ~${pct}%${
      easing ? ` (about ${effective}% for ${CATEGORY_LABEL[category]})` : ''
    }; yours is ${percentage}% — right around the line. A stretch, not a wall.${categoryFraming}`
  } else {
    status = 'shortfall'
    gapNote = `Typically requires ~${pct}%${
      easing ? ` (about ${effective}% for ${CATEGORY_LABEL[category]})` : ''
    }; yours is currently ${percentage}% — about ${Math.abs(
      Math.round(gap),
    )} points short of the usual line. Not a closed door: cutoffs vary, and there are often legitimate alternate routes.${categoryFraming}`
  }

  return {
    pathId: node.id,
    studentPercentage: percentage,
    category,
    typicalThreshold: th.typicalValue,
    status,
    gapNote,
    verifyNote,
  }
}
