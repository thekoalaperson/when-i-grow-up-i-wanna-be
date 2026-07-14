import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { nodeColor } from '@ui/lib/util'
import { computeLayout, edgePath, type LaidNode } from './layout'

const TIER_LABELS = ['You', 'After 8th — interest', 'After 10th — stream', 'After 12th — direction']
const TIER_X = [90, 340, 620, 920]

export default function LifeGraph() {
  const placed = useStore((s) => s.placed)
  const dynamicNodes = useStore((s) => s.dynamicNodes)
  const chosenInterestId = useStore((s) => s.ctx.chosenInterestId)
  const selectedNodeId = useStore((s) => s.selectedNodeId)
  const activeChallengeId = useStore((s) => s.activeChallengeId)
  const insights = useStore((s) => s.insights)
  const selectNode = useStore((s) => s.selectNode)
  const getNode = useStore((s) => s.getNode)

  const challengeNodeId = useMemo(() => {
    const ins = insights.find((i) => i.id === activeChallengeId)
    return ins?.nodeId
  }, [insights, activeChallengeId])

  const layout = useMemo(
    () => computeLayout(placed, getNode, chosenInterestId),
    [placed, dynamicNodes, getNode, chosenInterestId],
  )

  const hasNodes = layout.nodes.length > 0
  const viewW = layout.width
  const viewH = Math.max(layout.height, 340)

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* column headers */}
      <svg
        viewBox={`0 0 ${viewW} ${viewH}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
      >
        <defs>
          <radialGradient id="you-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e8b04b" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#e8b04b" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* tier headers */}
        {TIER_LABELS.map((t, i) => (
          <text
            key={t}
            x={TIER_X[i]}
            y={26}
            textAnchor={i === 0 ? 'start' : 'middle'}
            className="fill-faint"
            style={{ fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            {t}
          </text>
        ))}

        {/* edges */}
        <g fill="none">
          {layout.edges.map((e) => {
            const dim = e.status === 'reconsidered' || e.status === 'excluded'
            return (
              <motion.path
                key={e.id}
                className={e.status === 'confirmed' ? undefined : '[stroke:var(--edge)]'}
                d={edgePath(e.from, e.to)}
                stroke={e.status === 'confirmed' ? 'rgba(232,176,75,0.55)' : undefined}
                strokeWidth={e.status === 'confirmed' ? 2 : 1.4}
                strokeDasharray={dim ? '3 6' : undefined}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: dim ? 0.35 : 1 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              />
            )
          })}
        </g>

        {/* origin "You" */}
        <g>
          <circle cx={layout.origin.x} cy={layout.origin.y} r={26} fill="url(#you-glow)" />
          <circle cx={layout.origin.x} cy={layout.origin.y} r={9} fill="#e8b04b" />
          <text
            x={layout.origin.x}
            y={layout.origin.y + 30}
            textAnchor="middle"
            className="fill-fg"
            style={{ fontSize: 13, fontWeight: 600 }}
          >
            You
          </text>
        </g>

        {/* nodes */}
        {layout.nodes.map((ln) => (
          <Node
            key={ln.id}
            ln={ln}
            selected={selectedNodeId === ln.id}
            challenging={challengeNodeId === ln.id}
            onClick={() => selectNode(ln.id)}
          />
        ))}
      </svg>

      {!hasNodes && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="max-w-[240px] text-center text-sm text-muted">
            Your map starts here. Answer on the left, and it grows — one honest decision at a time.
          </div>
        </div>
      )}

      <Legend />
    </div>
  )
}

function Node({
  ln,
  selected,
  challenging,
  onClick,
}: {
  ln: LaidNode
  selected: boolean
  challenging: boolean
  onClick: () => void
}) {
  const color = nodeColor(ln.node)
  const r = ln.node.stage === 3 ? 11 : ln.node.stage === 2 ? 10 : 9
  const confirmed = ln.status === 'confirmed'
  const reconsidered = ln.status === 'reconsidered'
  const excluded = ln.status === 'excluded'
  const opacity = excluded ? 0.28 : reconsidered ? 0.45 : 1

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity, scale: 1, x: ln.x, y: ln.y }}
      transition={{ type: 'spring', stiffness: 220, damping: 26 }}
      style={{ cursor: 'pointer' }}
      onClick={onClick}
    >
      {/* hit area */}
      <circle cx={0} cy={0} r={26} fill="transparent" />

      {challenging && (
        <circle cx={0} cy={0} r={r + 6} fill="none" stroke="#e8b04b" strokeWidth={2} className="animate-pulse-ring" />
      )}
      {confirmed && <circle cx={0} cy={0} r={r + 8} fill={color} opacity={0.14} />}
      {selected && (
        <circle
          cx={0}
          cy={0}
          r={r + 5}
          fill="none"
          className="[stroke:rgb(var(--fg2))]"
          strokeWidth={1.5}
          opacity={0.8}
        />
      )}

      <circle
        cx={0}
        cy={0}
        r={r}
        className={confirmed ? undefined : '[fill:var(--node-bg)]'}
        fill={confirmed ? color : undefined}
        stroke={color}
        strokeWidth={confirmed ? 0 : 2}
        strokeDasharray={reconsidered ? '3 4' : undefined}
      />
      {confirmed && <circle cx={0} cy={0} r={r - 4} className="[fill:var(--node-inner)]" opacity={0.35} />}
      {ln.node.userAdded && (
        <circle cx={r - 1} cy={-(r - 1)} r={3.5} fill="#f0c874" className="[stroke:var(--node-inner)]" strokeWidth={1} />
      )}

      <text
        x={18}
        y={ln.node.stage === 3 ? -2 : 4}
        className="fill-fg"
        style={{ fontSize: 12.5, fontWeight: confirmed ? 600 : 400, opacity: excluded ? 0.5 : 1 }}
      >
        {ln.node.label}
      </text>
      {ln.node.stage === 3 && ln.node.costMin != null && (
        <text x={18} y={12} className="fill-muted" style={{ fontSize: 10.5 }}>
          ₹{ln.node.costMin}–{ln.node.costMax}L · {ln.node.yearsToFirstIncome}y
        </text>
      )}
    </motion.g>
  )
}

function Legend() {
  const items = [
    { c: '#4fc4a1', label: 'Confirmed', solid: true },
    { c: '#8a92c9', label: 'Exploring', solid: false },
    { c: '#e8b04b', label: 'Reconsidered', dashed: true },
    { c: '#6b7385', label: 'Set aside', dim: true },
  ]
  return (
    <div className="pointer-events-none absolute bottom-3 left-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{
              background: it.solid ? it.c : 'transparent',
              border: `1.5px ${it.dashed ? 'dashed' : 'solid'} ${it.c}`,
              opacity: it.dim ? 0.4 : 1,
            }}
          />
          {it.label}
        </span>
      ))}
    </div>
  )
}
