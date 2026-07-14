import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Download, Sparkles } from 'lucide-react'
import { useStore, confirmedStages } from '@/store/useStore'
import {
  convictionRead,
  narrativePortrait,
  normalizedTraits,
  NODE_BY_ID,
  TRAIT_KEYS,
  TRAIT_META,
} from '@engine/index'
import type { TraitKey } from '@engine/index'
import { CATEGORY_LABEL } from '@engine/index'
import { cn, lakh } from '@ui/lib/util'

export default function ProfilePanel() {
  const ctx = useStore((s) => s.ctx)
  const generateProfile = useStore((s) => s.generateProfile)

  const stages = confirmedStages(ctx)
  const norm = useMemo(() => normalizedTraits(ctx.profile, stages), [ctx.profile, stages])
  const portrait = useMemo(() => narrativePortrait(norm, ctx.profile), [norm, ctx.profile])
  const conv = convictionRead(ctx.profile)

  const interestHint = ctx.chosenInterestId ? NODE_BY_ID[ctx.chosenInterestId] : undefined
  const hint: Record<TraitKey, number> = {
    analytical: 0,
    creative: 0,
    risk: 0,
    people: 0,
    structure: 0,
  }
  if (interestHint) for (const t of TRAIT_KEYS) hint[t] = Math.min(1, (interestHint.traitDelta[t] ?? 0) / 2)

  const anyConfirmed = stages.length > 0
  const path = ctx.chosenPathId ? NODE_BY_ID[ctx.chosenPathId] : undefined
  const stream = ctx.chosenStreamId ? NODE_BY_ID[ctx.chosenStreamId] : undefined

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* portrait */}
        <div className="mb-5">
          <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-amber/80">
            <Sparkles size={13} /> Who you read as
          </div>
          <p className="text-balance text-[15px] leading-relaxed text-parchment-100">{portrait}</p>
        </div>

        {/* radar */}
        <Radar norm={norm} hint={interestHint && !anyConfirmed ? hint : undefined} />

        {/* trait bars */}
        <div className="mt-4 space-y-2.5">
          {(Object.keys(norm) as TraitKey[])
            .sort((a, b) => norm[b] - norm[a])
            .map((t) => (
              <div key={t}>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-[13px] font-medium" style={{ color: TRAIT_META[t].color }}>
                    {TRAIT_META[t].label}
                  </span>
                  <span className="text-[11px] tabular-nums text-parchment-300/60">
                    {Math.round(norm[t] * 100)}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: TRAIT_META[t].color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${norm[t] * 100}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                  />
                </div>
              </div>
            ))}
        </div>
        {!anyConfirmed && (
          <p className="mt-3 text-[12px] leading-relaxed text-parchment-300/55">
            {interestHint
              ? 'The dashed shape is where your interest leans — it isn’t counted yet. Traits only fill in from a choice you put through a challenge and confirm.'
              : 'Traits fill in from confirmed choices only — never from a click alone. That’s deliberate: this reflects what you decided.'}
          </p>
        )}

        {/* conviction */}
        <div className="mt-6">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-parchment-300/70">
              Under pushback
            </span>
            <span className="text-[13px] font-medium text-amber">{conv.label}</span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-signal-exclude via-amber to-signal-confirm"
              initial={{ width: '50%' }}
              animate={{ width: `${ctx.profile.conviction * 100}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
          </div>
          <p className="mt-1.5 text-[12px] leading-relaxed text-parchment-300/65">{conv.blurb}</p>
        </div>

        {/* where you are */}
        <div className="mt-6 space-y-2">
          <span className="text-xs uppercase tracking-wider text-parchment-300/70">On the map</span>
          <Row label="Interest" value={interestHint?.label} />
          <Row label="Stream" value={stream ? stream.label : undefined} />
          <Row label="Direction" value={path ? path.label : undefined} strong />
          {path?.costMin != null && (
            <Row
              label="Grounded picture"
              value={`${lakh(path.costMin)}–${lakh(path.costMax)} · ~${path.yearsToFirstIncome}y to first pay`}
            />
          )}
        </div>

        {/* constraints */}
        {(ctx.profile.constraints.budgetLakh != null ||
          ctx.profile.constraints.maxYears != null ||
          ctx.profile.percentage != null) && (
          <div className="mt-6 space-y-2">
            <span className="text-xs uppercase tracking-wider text-parchment-300/70">
              Constraints on the table
            </span>
            {ctx.profile.constraints.budgetLakh != null && (
              <Row label="Budget" value={`up to ${lakh(ctx.profile.constraints.budgetLakh)}`} />
            )}
            {ctx.profile.constraints.maxYears != null && (
              <Row label="Timeline" value={`earning within ${ctx.profile.constraints.maxYears} years`} />
            )}
            {ctx.profile.percentage != null && (
              <Row
                label="Academics"
                value={`${ctx.profile.percentage}%${
                  ctx.profile.category !== 'unspecified'
                    ? ` · ${CATEGORY_LABEL[ctx.profile.category]}`
                    : ''
                }`}
              />
            )}
            <p className="text-[11px] text-parchment-300/45">
              Say “budget 8 lakh”, “within 4 years”, or “I got 88%” in chat to change these.
            </p>
          </div>
        )}
      </div>

      {/* export */}
      <div className="border-t hairline p-4">
        <button
          onClick={generateProfile}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-amber/90 px-4 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-amber"
        >
          <Download size={15} />
          Get my profile
        </button>
        <p className="mt-2 text-center text-[11px] text-parchment-300/50">
          Yours to keep — even if you never commit to a path.
        </p>
      </div>
    </div>
  )
}

function Row({ label, value, strong }: { label: string; value?: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[12px] text-parchment-300/60">{label}</span>
      <span
        className={cn(
          'text-right text-[13px]',
          value ? (strong ? 'font-semibold text-parchment-50' : 'text-parchment-100') : 'text-parchment-300/40',
        )}
      >
        {value ?? 'not yet'}
      </span>
    </div>
  )
}

// ── Radar ─────────────────────────────────────────────────────────────────────

function Radar({
  norm,
  hint,
}: {
  norm: Record<TraitKey, number>
  hint?: Record<TraitKey, number>
}) {
  const size = 220
  const c = size / 2
  const R = 78
  const keys = TRAIT_KEYS
  const angle = (i: number) => (-90 + i * (360 / keys.length)) * (Math.PI / 180)
  const pt = (i: number, v: number) => [c + R * v * Math.cos(angle(i)), c + R * v * Math.sin(angle(i))]

  const poly = (vals: number[]) => vals.map((v, i) => pt(i, v).join(',')).join(' ')
  const values = keys.map((k) => norm[k])
  const hintValues = hint ? keys.map((k) => hint[k]) : null

  return (
    <div className="flex justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {/* rings */}
        {[0.25, 0.5, 0.75, 1].map((ring) => (
          <polygon
            key={ring}
            points={poly(keys.map(() => ring))}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={1}
          />
        ))}
        {/* axes */}
        {keys.map((_, i) => {
          const [x, y] = pt(i, 1)
          return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="rgba(255,255,255,0.06)" />
        })}
        {/* hint polygon */}
        {hintValues && (
          <polygon
            points={poly(hintValues)}
            fill="rgba(232,176,75,0.06)"
            stroke="rgba(232,176,75,0.5)"
            strokeWidth={1.3}
            strokeDasharray="3 4"
          />
        )}
        {/* value polygon */}
        <motion.polygon
          points={poly(values)}
          fill="rgba(232,176,75,0.16)"
          stroke="#e8b04b"
          strokeWidth={1.8}
          initial={false}
          animate={{ points: poly(values) }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
        {/* vertices + labels */}
        {keys.map((k, i) => {
          const [vx, vy] = pt(i, values[i])
          const [lx, ly] = pt(i, 1.24)
          return (
            <g key={k}>
              <circle cx={vx} cy={vy} r={2.6} fill={TRAIT_META[k].color} />
              <text
                x={lx}
                y={ly}
                textAnchor={lx < c - 4 ? 'end' : lx > c + 4 ? 'start' : 'middle'}
                dominantBaseline="middle"
                style={{ fontSize: 9.5, fill: TRAIT_META[k].color, opacity: 0.85 }}
              >
                {TRAIT_META[k].label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
