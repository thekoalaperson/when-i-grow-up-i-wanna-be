import { clsx, type ClassValue } from 'clsx'
import type { DecisionNode, TraitKey } from '@engine/index'
import { TRAIT_KEYS, TRAIT_META } from '@engine/index'

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

/** Dominant trait of a node, for colouring it on the map. */
export function dominantTrait(node: DecisionNode): TraitKey | null {
  let best: TraitKey | null = null
  let v = 0
  for (const t of TRAIT_KEYS) {
    const d = node.traitDelta[t] ?? 0
    if (d > v) {
      v = d
      best = t
    }
  }
  return best
}

export function nodeColor(node: DecisionNode): string {
  const t = dominantTrait(node)
  return t ? TRAIT_META[t].color : '#e8b04b'
}

export function timeAgo(ms: number): string {
  const s = Math.floor((Date.now() - ms) / 1000)
  if (s < 45) return 'just now'
  if (s < 90) return 'a minute ago'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} min ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export function lakh(n?: number): string {
  if (n == null) return '—'
  return `₹${n % 1 === 0 ? n : n.toFixed(1)}L`
}
