// Future Map — personality & conviction model (spec 4.5, 6.2).
//
// The profile is the learned model of the student, assembled purely from how they
// navigate — no quiz, no self-report. It is always handed back in plain terms
// (spec 4.5 rule): self-knowledge, not a hidden score.

import { ALL_NODES } from './seed'
import type { DecisionNode, Profile, Stage, TraitKey, Vector5 } from './types'
import { TRAIT_KEYS } from './types'

export function emptyProfile(): Profile {
  return {
    traits: { analytical: 0, creative: 0, risk: 0, people: 0, structure: 0 },
    conviction: 0.5, // neutral prior
    convictionSamples: 0,
    category: 'unspecified',
    constraints: {},
  }
}

// Precompute, per stage, the largest delta any node contributes to each trait.
// Used to normalise so the profile reads as comparable, not just ever-growing.
const MAX_DELTA_BY_STAGE: Record<Stage, Record<TraitKey, number>> = (() => {
  const acc = {
    1: { analytical: 0, creative: 0, risk: 0, people: 0, structure: 0 },
    2: { analytical: 0, creative: 0, risk: 0, people: 0, structure: 0 },
    3: { analytical: 0, creative: 0, risk: 0, people: 0, structure: 0 },
  } as Record<Stage, Record<TraitKey, number>>
  for (const node of ALL_NODES) {
    for (const t of TRAIT_KEYS) {
      const v = node.traitDelta[t] ?? 0
      if (v > acc[node.stage][t]) acc[node.stage][t] = v
    }
  }
  return acc
})()

/** Apply a confirmed node's trait signal (spec 6.2 — confirm only, never reconsider). */
export function applyTraitDelta(profile: Profile, delta: Vector5): Profile {
  const traits = { ...profile.traits }
  for (const t of TRAIT_KEYS) {
    if (delta[t]) traits[t] += delta[t] as number
  }
  return { ...profile, traits }
}

/**
 * Conviction update (spec 6.2, proposed): confirming *despite* a genuine mismatch
 * is stronger evidence of conviction than an uncontested confirm; reconsidering
 * lowers it. This is a signal about how the student decides, not what they like.
 */
export function updateConviction(
  profile: Profile,
  event: 'confirm' | 'reconsider',
  contested: boolean,
): Profile {
  const prior = profile.conviction
  let delta = 0
  if (event === 'confirm') delta = contested ? 0.16 : 0.06
  else delta = -0.12
  const conviction = Math.max(0, Math.min(1, prior + delta))
  return { ...profile, conviction, convictionSamples: profile.convictionSamples + 1 }
}

/**
 * Normalised 0..1 read per trait, relative to the theoretical maximum attainable
 * across the stages the student has actually confirmed at (spec 6.2).
 */
export function normalizedTraits(
  profile: Profile,
  confirmedStages: Stage[],
): Record<TraitKey, number> {
  const denom = { analytical: 0, creative: 0, risk: 0, people: 0, structure: 0 } as Record<
    TraitKey,
    number
  >
  const stages = confirmedStages.length ? confirmedStages : ([1] as Stage[])
  for (const s of stages) {
    for (const t of TRAIT_KEYS) denom[t] += MAX_DELTA_BY_STAGE[s][t]
  }
  const out = {} as Record<TraitKey, number>
  for (const t of TRAIT_KEYS) {
    out[t] = denom[t] > 0 ? Math.min(1, profile.traits[t] / denom[t]) : 0
  }
  return out
}

/** The dominant trait(s), for a plain-language read-back. */
export function topTraits(norm: Record<TraitKey, number>, n = 2): TraitKey[] {
  return TRAIT_KEYS.filter((t) => norm[t] > 0)
    .sort((a, b) => norm[b] - norm[a])
    .slice(0, n)
}

export interface ConvictionRead {
  label: string
  blurb: string
}

/** Plain-language read of the conviction signal — never a hidden score. */
export function convictionRead(profile: Profile): ConvictionRead {
  if (profile.convictionSamples < 2) {
    return {
      label: 'Still forming',
      blurb: 'Not enough decisions yet to read how you hold a position. Keep going.',
    }
  }
  const c = profile.conviction
  if (c >= 0.72)
    return {
      label: 'Holds firm',
      blurb: 'You tend to stand by a choice even when pushed on it with real numbers.',
    }
  if (c >= 0.55)
    return {
      label: 'Considered',
      blurb: 'You mostly hold your ground, but you’ll move when the evidence genuinely warrants it.',
    }
  if (c >= 0.4)
    return {
      label: 'Open to redirection',
      blurb: 'You update readily under pushback — a strength when the pushback is right, worth watching when it isn’t yours.',
    }
  return {
    label: 'Highly deferential',
    blurb: 'You’ve stepped back from most challenges. Worth asking: is that your read, or the room’s?',
  }
}

/**
 * A one-paragraph, plain-language portrait — the guaranteed takeaway (spec: even if
 * the student never commits to a path, they leave with this).
 */
export function narrativePortrait(
  norm: Record<TraitKey, number>,
  profile: Profile,
): string {
  const top = topTraits(norm, 2)
  const names: Record<TraitKey, string> = {
    analytical: 'someone who reaches for how things actually work',
    creative: 'someone pulled toward making and open-ended problems',
    risk: 'someone willing to trade certainty for a bigger, less-charted upside',
    people: 'someone energised by people and what moves them',
    structure: 'someone who is reassured by clear steps and a defined ladder',
  }
  if (top.length === 0) {
    return 'Your profile is still blank — it fills in only from choices you put through a challenge and confirm. That’s deliberate: it reflects what you decided, not what you clicked.'
  }
  const lead =
    top.length === 2
      ? `So far you read as ${names[top[0]]}, with a strong streak of the ${top[1]} in you.`
      : `So far you read as ${names[top[0]]}.`
  const conv = convictionRead(profile)
  const tail = profile.convictionSamples >= 2 ? ` When you're pushed on a choice, you ${conv.label.toLowerCase()}.` : ''
  return lead + tail
}

export function describeNode(node: DecisionNode): string {
  return `${node.label} — ${node.subtitle}`
}
