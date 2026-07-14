// Future Map — export & shareable summary (spec 4.20).
//
// The profile is the guaranteed output: even if the student never commits to a path,
// they leave with a dated, plain-language snapshot of who they are and what they
// examined. Always visibly dated — it's a snapshot of perishable data (4.3), not a
// document meant to read as current forever.

import { CATEGORY_LABEL } from './eligibility'
import { NODE_BY_ID } from './seed'
import { convictionRead, narrativePortrait, normalizedTraits, topTraits } from './profile'
import type { RecordEntry, Stage, StudentContext, TraitKey } from './types'
import { TRAIT_META } from './types'

function fmtDate(ms: number): string {
  const d = new Date(ms)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

export interface ProfileSummary {
  markdown: string
  generatedAt: number
}

export function buildProfileSummary(
  ctx: StudentContext,
  records: RecordEntry[],
  confirmedStages: Stage[],
  now: number,
): ProfileSummary {
  const norm = normalizedTraits(ctx.profile, confirmedStages)
  const lines: string[] = []
  const name = ctx.displayName?.trim() || 'This student'

  lines.push(`# Future Map — profile snapshot`)
  lines.push('')
  lines.push(`_Generated ${fmtDate(now)}. A snapshot of perishable data — figures are 2026-indicative and should be re-verified on official sources before acting._`)
  lines.push('')

  // ── Portrait ──
  lines.push(`## Who ${name === 'This student' ? 'this reads as' : name + ' reads as'}`)
  lines.push('')
  lines.push(narrativePortrait(norm, ctx.profile))
  lines.push('')

  // ── Traits ──
  lines.push('### Traits (learned from confirmed choices only)')
  lines.push('')
  const ordered = (Object.keys(norm) as TraitKey[]).sort((a, b) => norm[b] - norm[a])
  for (const t of ordered) {
    const pct = Math.round(norm[t] * 100)
    const bar = '█'.repeat(Math.round(norm[t] * 12)).padEnd(12, '░')
    lines.push(`- **${TRAIT_META[t].label}** \`${bar}\` ${pct}% — ${TRAIT_META[t].blurb}`)
  }
  lines.push('')

  // ── Conviction ──
  if (ctx.profile.convictionSamples >= 2) {
    const cr = convictionRead(ctx.profile)
    lines.push(`### How they decide under pushback`)
    lines.push('')
    lines.push(`**${cr.label}.** ${cr.blurb}`)
    lines.push('')
  }

  // ── The path ──
  lines.push('## Where they are on the map')
  lines.push('')
  const interest = ctx.chosenInterestId ? NODE_BY_ID[ctx.chosenInterestId] : undefined
  const stream = ctx.chosenStreamId ? NODE_BY_ID[ctx.chosenStreamId] : undefined
  const path = ctx.chosenPathId ? NODE_BY_ID[ctx.chosenPathId] : undefined
  lines.push(`- **Interest signal:** ${interest ? interest.label : '—'}`)
  lines.push(`- **Stream:** ${stream ? `${stream.label} (${stream.subtitle})` : '— not yet chosen'}`)
  lines.push(`- **Career direction:** ${path ? `${path.label} (${path.subtitle})` : '— not yet committed'}`)
  lines.push('')

  if (path) {
    lines.push('### The grounded picture for this direction')
    lines.push('')
    if (path.costMin != null)
      lines.push(`- **Cost:** ₹${path.costMin}L–₹${path.costMax}L (cheapest realistic route → typical private ceiling)`)
    if (path.yearsToFirstIncome != null)
      lines.push(`- **Time to first real paycheck:** ~${path.yearsToFirstIncome} years`)
    if (path.payDescription) lines.push(`- **Starting pay:** ${path.payDescription}`)
    if (path.lastVerified) lines.push(`- **Figures as of:** ${path.lastVerified} (re-verify before acting)`)
    lines.push('')
  }

  // ── Reasoning that survived the challenge ──
  const confirms = records.filter((r) => r.kind === 'confirm' && r.reasoning)
  if (confirms.length) {
    lines.push('## Reasoning that survived the challenge')
    lines.push('')
    for (const r of confirms) {
      lines.push(`- **${r.title}** — "${r.reasoning}" _(${fmtDate(r.at)})_`)
    }
    lines.push('')
  }

  // ── Reconsiderations (signal, not failure) ──
  const recons = records.filter((r) => r.kind === 'reconsider')
  if (recons.length) {
    lines.push('## Reconsidered (signal, not failure)')
    lines.push('')
    for (const r of recons) lines.push(`- ${r.title}${r.detail ? ` — ${r.detail}` : ''} _(${fmtDate(r.at)})_`)
    lines.push('')
  }

  // ── Checked claims ──
  const claims = records.filter((r) => r.kind === 'claim')
  if (claims.length) {
    lines.push('## Claims checked against real data')
    lines.push('')
    for (const r of claims) {
      lines.push(`- **"${r.title}"** — ${r.detail ?? ''} _(${fmtDate(r.at)})_`)
    }
    lines.push('')
  }

  // ── Constraints ──
  const c = ctx.profile.constraints
  if (c.budgetLakh != null || c.maxYears != null || ctx.profile.percentage != null) {
    lines.push('## Constraints on the table')
    lines.push('')
    if (c.budgetLakh != null) lines.push(`- **Budget:** up to ₹${c.budgetLakh}L`)
    if (c.maxYears != null) lines.push(`- **Willing to invest before earning:** up to ${c.maxYears} years`)
    if (ctx.profile.percentage != null)
      lines.push(
        `- **Academic standing:** ${ctx.profile.percentage}%${
          ctx.profile.category !== 'unspecified' ? ` (${CATEGORY_LABEL[ctx.profile.category]} category)` : ''
        }`,
      )
    lines.push('')
  }

  // ── Excluded ──
  if (ctx.excluded.length) {
    lines.push('## Set aside (reversible)')
    lines.push('')
    for (const id of ctx.excluded) {
      const nn = NODE_BY_ID[id]
      if (nn) lines.push(`- ${nn.label}`)
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('')
  const tops = topTraits(norm, 2)
    .map((t) => TRAIT_META[t].label)
    .join(' + ')
  lines.push(
    `_Future Map informs and challenges; it never decides. The path above — if any — was committed by a deliberate human click, not by the system. Dominant read: ${
      tops || 'still forming'
    }._`,
  )

  return { markdown: lines.join('\n'), generatedAt: now }
}
