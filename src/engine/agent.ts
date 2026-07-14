// Future Map — the agent: intent-driven orchestration (spec 4.16).
//
// A single natural-language entry point. Given a request, it decides which capability
// answers it and extracts the arguments. Its actions write into the SAME state as
// manual interaction — no separate silo.
//
// NON-NEGOTIABLE (Thesis #4 / spec 4.16): there is no intent here that selects,
// confirms, or backtracks a path. It researches, checks, compares, recommends. The
// deliberate commit through the challenge (4.4) stays a manual, human action, always.

import { ALL_NODES, CAREERS, NODE_BY_ID } from './seed'
import type { Category } from './types'

export type Intent =
  | { kind: 'claim'; claim: string; source: string }
  | { kind: 'constraint'; budgetLakh?: number; maxYears?: number; percentage?: number; category?: Category }
  | { kind: 'research'; name: string }
  | { kind: 'freshness'; nodeId?: string }
  | { kind: 'eligibility'; nodeId?: string }
  | { kind: 'workaround'; nodeId?: string }
  | { kind: 'aid'; nodeId?: string }
  | { kind: 'deadlines'; nodeId?: string }
  | { kind: 'compare'; nodeIds: string[] }
  | { kind: 'help'; text: string }

export interface IntentPlan {
  intent: Intent
  /** The tool label shown in the chat as the agent "shows its work" (spec 6.4). */
  toolLabel: string
  rationale: string
}

function norm(s: string): string {
  return ` ${s.toLowerCase().replace(/[’]/g, "'")} `
}

/** Resolve a path/stream reference from free text against the known map. */
export function resolveNodeRef(text: string): string | undefined {
  const t = text.toLowerCase()
  // longest label first so "business analytics" beats "business"
  const sorted = [...ALL_NODES].sort((a, b) => b.label.length - a.label.length)
  for (const n of sorted) {
    const label = n.label.toLowerCase()
    if (t.includes(label)) return n.id
  }
  const alias: Record<string, string> = {
    doctor: 'c_medicine',
    mbbs: 'c_medicine',
    neet: 'c_medicine',
    'ca ': 'c_ca',
    chartered: 'c_ca',
    upsc: 'c_civil_services',
    ias: 'c_civil_services',
    ips: 'c_civil_services',
    lawyer: 'c_law',
    clat: 'c_law',
    'b.com': 'c_bcom',
    bcom: 'c_bcom',
    bba: 'c_bba',
    ux: 'c_design',
    architect: 'c_architecture',
    'cse': 'c_engineering',
    'computer science': 'c_engineering',
    engineer: 'c_engineering',
    jee: 'c_engineering',
  }
  for (const [k, v] of Object.entries(alias)) {
    if (t.includes(k)) return v
  }
  return undefined
}

function extractCategory(t: string): Category | undefined {
  // whole-word matching only — 'st'/'sc' must not fire inside "honestly", "science", etc.
  if (/\bscheduled caste\b/.test(t) || /\bsc\b/.test(t)) return 'sc'
  if (/\bscheduled tribe\b/.test(t) || /\bst\b/.test(t)) return 'st'
  if (/\bobc\b/.test(t)) return 'obc'
  if (/\bews\b/.test(t)) return 'ews'
  if (/\bgeneral\b/.test(t) || /\bgen\b/.test(t)) return 'general'
  return undefined
}

function extractBudget(t: string): number | undefined {
  const m =
    t.match(/(?:₹\s*)?(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs)\b/) ||
    t.match(/(?:₹\s*)?(\d+(?:\.\d+)?)\s*l\b/) ||
    t.match(/budget[^0-9]*(\d+(?:\.\d+)?)/)
  return m ? parseFloat(m[1]) : undefined
}

function extractYears(t: string): number | undefined {
  const m =
    t.match(/(?:within|under|max(?:imum)?|less than|no more than|by)\s*(\d+(?:\.\d+)?)\s*years?/) ||
    t.match(/(\d+(?:\.\d+)?)\s*years?\b/)
  return m ? parseFloat(m[1]) : undefined
}

function extractPercentage(t: string): number | undefined {
  const m =
    t.match(/(\d{2}(?:\.\d+)?)\s*%/) ||
    t.match(/(?:got|scored|marks?(?: are)?|percentage(?: is)?)[^0-9]*(\d{2}(?:\.\d+)?)/)
  return m ? parseFloat(m[1]) : undefined
}

/**
 * Classify a free-text message into a single primary intent + extracted entities.
 * Deterministic and transparent — the chosen tool is always shown to the student.
 */
export function classifyIntent(text: string, contextNodeId?: string): IntentPlan {
  const t = norm(text)

  // ── Compare (spec 4.7) ──
  if (/\b(compare|versus|vs\.?|which is better|or)\b/.test(t) && countPathRefs(text) >= 2) {
    const ids = allPathRefs(text)
    if (ids.length >= 2)
      return {
        intent: { kind: 'compare', nodeIds: ids.slice(0, 3) },
        toolLabel: 'compare_paths',
        rationale: 'You named more than one path — laying them side by side.',
      }
  }

  // ── Constraint (spec 4.6) ──
  const budget = extractBudget(t)
  const years = extractYears(t)
  const category = extractCategory(t)
  const pctForConstraint = /(budget|afford|spend|invest|years|earn|category|reservation|%|percent|marks|scored)/.test(t)
    ? extractPercentage(t)
    : undefined
  if (
    (budget != null && /(budget|afford|spend|cost|lakh|₹)/.test(t)) ||
    (years != null && /(year|earn|invest|paycheck|working)/.test(t)) ||
    category != null ||
    (pctForConstraint != null && /(marks|scored|percent|%|got)/.test(t))
  ) {
    return {
      intent: { kind: 'constraint', budgetLakh: budget, maxYears: years, percentage: pctForConstraint, category },
      toolLabel: 'set_constraint',
      rationale: 'Reading this as a constraint to set — it becomes an active filter on the map.',
    }
  }

  // ── Claim / signal check (spec 4.8) ──
  if (
    /\b(said|says|told|heard|everyone|people|my (dad|mom|mother|father|uncle|aunt|teacher|friend|parents|relative)|is it true|apparently|they say|no scope|no future|waste|guaranteed)\b/.test(
      t,
    )
  ) {
    return {
      intent: { kind: 'claim', claim: text.trim(), source: guessSource(t) },
      toolLabel: 'check_claim',
      rationale: 'This reads like something you heard — checking it against real data and what it means for you.',
    }
  }

  // ── Financial aid (spec 4.12) ──
  if (/\b(scholarship|scholarships|loan|financial aid|afford|can't afford|cannot afford|too expensive|fees help)\b/.test(t)) {
    return {
      intent: { kind: 'aid', nodeId: resolveNodeRef(text) ?? contextNodeId },
      toolLabel: 'check_financial_aid',
      rationale: 'Looking up factual scholarship and loan-structure information for this path.',
    }
  }

  // ── Workaround (spec 4.11) ──
  if (/\b(alternate|alternative|other way|another way|don't qualify|do not qualify|didn't make|not eligible|backup|fallback|lower cutoff)\b/.test(t)) {
    return {
      intent: { kind: 'workaround', nodeId: resolveNodeRef(text) ?? contextNodeId },
      toolLabel: 'find_workaround',
      rationale: 'Researching genuine, sanctioned alternate routes to the same outcome.',
    }
  }

  // ── Deadlines (spec 4.13) ──
  if (/\b(deadline|last date|when is|when's|exam date|registration|apply by|form date|dates)\b/.test(t)) {
    return {
      intent: { kind: 'deadlines', nodeId: resolveNodeRef(text) ?? contextNodeId },
      toolLabel: 'check_deadlines',
      rationale: 'Surfacing the current cycle’s key dates — as a heads-up, not a system of record.',
    }
  }

  // ── Freshness (spec 4.14) ──
  if (/\b(what's new|whats new|latest|recently|any changes|updated|still true|out of date|current)\b/.test(t)) {
    return {
      intent: { kind: 'freshness', nodeId: resolveNodeRef(text) ?? contextNodeId },
      toolLabel: 'check_freshness',
      rationale: 'Checking whether anything genuinely new has emerged for this path.',
    }
  }

  // ── Eligibility (spec 4.9) ──
  if (/\b(eligible|eligibility|cutoff|cut off|qualify|do i get in|can i get|my marks|my percentage)\b/.test(t)) {
    const pct = extractPercentage(t)
    if (pct != null)
      return {
        intent: { kind: 'constraint', percentage: pct, category: extractCategory(t) },
        toolLabel: 'set_constraint',
        rationale: 'Recording your percentage so eligibility reads accurately across the map.',
      }
    return {
      intent: { kind: 'eligibility', nodeId: resolveNodeRef(text) ?? contextNodeId },
      toolLabel: 'check_eligibility',
      rationale: 'Comparing your standing against this path’s typical threshold.',
    }
  }

  // ── Research a path (spec 4.2) ──
  const ref = resolveNodeRef(text)
  if (ref) {
    return {
      intent: { kind: 'research', name: NODE_BY_ID[ref].label },
      toolLabel: 'research_path',
      rationale: 'Opening that path on your map.',
    }
  }
  if (/\b(what about|tell me about|is .* good|thinking about|interested in|want to (do|be|become)|considering)\b/.test(t)) {
    const name = extractPathName(text)
    if (name)
      return {
        intent: { kind: 'research', name },
        toolLabel: 'research_path',
        rationale: 'Checking whether that’s a real, current path and building a node if so.',
      }
  }

  return {
    intent: { kind: 'help', text: text.trim() },
    toolLabel: 'none',
    rationale: 'Not sure which tool fits — asking you to point me.',
  }
}

function guessSource(t: string): string {
  if (/\b(dad|father)\b/.test(t)) return 'Parent (father)'
  if (/\b(mom|mother)\b/.test(t)) return 'Parent (mother)'
  if (/\bparents\b/.test(t)) return 'Parents'
  if (/\b(uncle|aunt|relative|cousin)\b/.test(t)) return 'Relative'
  if (/\bteacher\b/.test(t)) return 'Teacher'
  if (/\bfriend\b/.test(t)) return 'Friend'
  if (/\b(everyone|people|they)\b/.test(t)) return 'General opinion'
  return 'Unattributed'
}

function countPathRefs(text: string): number {
  return allPathRefs(text).length
}

function allPathRefs(text: string): string[] {
  const t = text.toLowerCase()
  const ids: string[] = []
  for (const n of [...CAREERS].sort((a, b) => b.label.length - a.label.length)) {
    if (t.includes(n.label.toLowerCase()) && !ids.includes(n.id)) ids.push(n.id)
  }
  return ids
}

function extractPathName(text: string): string | undefined {
  const m = text.match(
    /(?:what about|tell me about|thinking about|interested in|considering|want to (?:do|be|become))\s+([a-z][a-z\s/&-]{2,40})/i,
  )
  if (m) return m[1].trim().replace(/[.?!]$/, '')
  return undefined
}
