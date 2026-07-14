import type { DecisionNode } from '@engine/index'
import type { NodeStatus, PlacedNode } from '@/store/model'

export interface LaidNode {
  id: string
  node: DecisionNode
  status: NodeStatus
  x: number
  y: number
  col: number
}
export interface LaidEdge {
  id: string
  from: { x: number; y: number }
  to: { x: number; y: number }
  status: NodeStatus
}
export interface Layout {
  nodes: LaidNode[]
  edges: LaidEdge[]
  origin: { x: number; y: number }
  width: number
  height: number
}

const COL_X = [90, 340, 620, 920] // You, interest, stream, career
const ROW_H = 108
const TOP = 70

/**
 * A deterministic left→right tiered layout. Careers cluster vertically near their
 * parent stream to keep edges legible. Everything scales-to-fit via the SVG viewBox,
 * so no panning is needed for the small node counts this map produces.
 */
export function computeLayout(
  placed: Record<string, PlacedNode>,
  getNode: (id: string) => DecisionNode | undefined,
  chosenInterestId?: string,
): Layout {
  const byStage: Record<number, LaidNode[]> = { 1: [], 2: [], 3: [] }
  for (const p of Object.values(placed)) {
    const node = getNode(p.id)
    if (!node) continue
    const col = node.stage // 1,2,3
    byStage[node.stage].push({ id: p.id, node, status: p.status, x: COL_X[col], y: 0, col })
  }

  // order careers by parent stream, then place
  const streamOrder = byStage[2].map((n) => n.id)
  byStage[3].sort((a, b) => {
    const ai = streamOrder.indexOf(a.node.parentId ?? '')
    const bi = streamOrder.indexOf(b.node.parentId ?? '')
    if (ai !== bi) return ai - bi
    return a.node.label.localeCompare(b.node.label)
  })

  const maxRows = Math.max(1, byStage[1].length, byStage[2].length, byStage[3].length)
  const totalHeight = TOP * 2 + Math.max(1, maxRows) * ROW_H

  const placeColumn = (arr: LaidNode[]) => {
    const n = arr.length
    const colHeight = n * ROW_H
    const startY = TOP + (totalHeight - TOP * 2 - colHeight) / 2 + ROW_H / 2
    arr.forEach((ln, i) => {
      ln.y = startY + i * ROW_H
    })
  }
  placeColumn(byStage[1])
  placeColumn(byStage[2])
  placeColumn(byStage[3])

  const origin = { x: COL_X[0], y: totalHeight / 2 }
  const nodes = [...byStage[1], ...byStage[2], ...byStage[3]]
  const posById: Record<string, LaidNode> = Object.fromEntries(nodes.map((n) => [n.id, n]))

  const edges: LaidEdge[] = []
  // You → interests
  for (const i of byStage[1]) {
    edges.push({ id: `e_you_${i.id}`, from: origin, to: { x: i.x, y: i.y }, status: i.status })
  }
  // chosen interest (or origin) → streams
  const interestAnchor =
    chosenInterestId && posById[chosenInterestId]
      ? { x: posById[chosenInterestId].x, y: posById[chosenInterestId].y }
      : byStage[1][0]
        ? { x: byStage[1][0].x, y: byStage[1][0].y }
        : origin
  for (const s of byStage[2]) {
    edges.push({ id: `e_int_${s.id}`, from: interestAnchor, to: { x: s.x, y: s.y }, status: s.status })
  }
  // streams → careers
  for (const c of byStage[3]) {
    const parent = c.node.parentId ? posById[c.node.parentId] : undefined
    const from = parent ? { x: parent.x, y: parent.y } : interestAnchor
    edges.push({ id: `e_str_${c.id}`, from, to: { x: c.x, y: c.y }, status: c.status })
  }

  return { nodes, edges, origin, width: COL_X[3] + 220, height: totalHeight }
}

export function edgePath(from: { x: number; y: number }, to: { x: number; y: number }): string {
  const mx = (from.x + to.x) / 2
  return `M ${from.x} ${from.y} C ${mx} ${from.y}, ${mx} ${to.y}, ${to.x} ${to.y}`
}
