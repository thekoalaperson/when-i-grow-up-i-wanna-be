import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  CalendarClock,
  Check,
  ChevronDown,
  Compass,
  ExternalLink,
  GitCompare,
  GraduationCap,
  LifeBuoy,
  PiggyBank,
  Route,
  ScanSearch,
  SkipForward,
  Swords,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import type {
  AidInsight,
  ChallengeInsight,
  CompareInsight,
  DeadlineInsight,
  EligibilityInsight,
  FreshnessInsight,
  Insight,
  NodeInsight,
  OpportunityInsight,
  VerdictInsight,
  WorkaroundInsight,
} from '@/store/model'
import type { ImpactVerdict, TruthVerdict } from '@engine/index'
import { cn, lakh, nodeColor, timeAgo } from '@ui/lib/util'

export default function InsightsFeed() {
  const insights = useStore((s) => s.insights)

  if (insights.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-8 text-center">
        <div className="max-w-[300px] text-sm leading-relaxed text-parchment-300/55">
          This is where your thinking accretes. Every challenge you face, every claim you check, and
          every path you weigh lands here — one continuous record you can always come back to.
        </div>
      </div>
    )
  }

  // unresolved challenge pins to top
  const sorted = [...insights].sort((a, b) => {
    const ap = a.type === 'challenge' && !a.resolved ? 1 : 0
    const bp = b.type === 'challenge' && !b.resolved ? 1 : 0
    if (ap !== bp) return bp - ap
    return b.at - a.at
  })

  return (
    <div className="h-full space-y-3 overflow-y-auto px-4 py-4">
      <AnimatePresence initial={false}>
        {sorted.map((ins) => (
          <motion.div
            key={ins.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <InsightCard ins={ins} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function Shell({
  icon,
  title,
  at,
  accent,
  children,
  glow,
}: {
  icon: React.ReactNode
  title: string
  at: number
  accent?: string
  children: React.ReactNode
  glow?: boolean
}) {
  return (
    <div
      className={cn('rounded-2xl border p-4 hairline', glow ? 'glass shadow-glow' : 'glass-soft')}
      style={glow && accent ? { borderColor: `${accent}55` } : undefined}
    >
      <div className="mb-2.5 flex items-center gap-2">
        <span className="shrink-0" style={{ color: accent ?? '#e8b04b' }}>
          {icon}
        </span>
        <h4 className="flex-1 text-[13px] font-semibold leading-tight text-parchment-50">{title}</h4>
        <span className="shrink-0 text-[10.5px] text-parchment-300/45">{timeAgo(at)}</span>
      </div>
      {children}
    </div>
  )
}

function InsightCard({ ins }: { ins: Insight }) {
  switch (ins.type) {
    case 'challenge':
      return <ChallengeCard ins={ins} />
    case 'verdict':
      return <VerdictCard ins={ins} />
    case 'freshness':
      return <FreshnessCard ins={ins} />
    case 'workaround':
      return <WorkaroundCard ins={ins} />
    case 'aid':
      return <AidCard ins={ins} />
    case 'deadline':
      return <DeadlineCard ins={ins} />
    case 'compare':
      return <CompareCard ins={ins} />
    case 'eligibility':
      return <EligibilityCard ins={ins} />
    case 'node':
      return <NodeCard ins={ins} />
    case 'opportunity':
      return <OpportunityCard ins={ins} />
  }
}

// ── Challenge ─────────────────────────────────────────────────────────────────

function ChallengeCard({ ins }: { ins: ChallengeInsight }) {
  const resolve = useStore((s) => s.resolveChallenge)
  const [reason, setReason] = useState('')
  const resolved = ins.resolved
  const c = ins.payload

  return (
    <Shell
      icon={<Swords size={15} />}
      title={resolved ? `Resolved — ${ins.title.replace('One question before you commit to ', '')}` : ins.title}
      at={ins.at}
      accent="#e8b04b"
      glow={!resolved}
    >
      {c.mismatches.length > 0 && (
        <div className="mb-3 space-y-2">
          {c.mismatches.map((m, i) => (
            <div
              key={i}
              className="flex gap-2 rounded-lg border border-signal-alert/30 bg-signal-alert/5 p-2.5"
            >
              <AlertTriangle size={14} className="mt-0.5 shrink-0 text-signal-alert" />
              <p className="text-[12.5px] leading-relaxed text-parchment-100">
                <span className="font-semibold text-signal-alert">{mismatchLabel(m.type)}: </span>
                {m.text}
              </p>
            </div>
          ))}
        </div>
      )}

      <p className="text-balance text-[14px] leading-relaxed text-parchment-50">{c.question}</p>

      {!resolved ? (
        <div className="mt-3">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Your honest answer (optional — it becomes part of your profile)"
            rows={2}
            className="w-full resize-none rounded-lg border border-white/8 bg-ink-950/60 px-3 py-2 text-[13px] text-parchment-100 outline-none placeholder:text-parchment-300/35 focus:border-amber/40"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={() => resolve('confirm', reason)}
              className="flex items-center gap-1.5 rounded-lg bg-signal-confirm/90 px-3 py-2 text-[13px] font-semibold text-ink-950 transition hover:bg-signal-confirm"
            >
              <Check size={14} /> Confirm — I still choose this
            </button>
            <button
              onClick={() => resolve('reconsider', reason)}
              className="flex items-center gap-1.5 rounded-lg border border-amber/40 bg-amber/10 px-3 py-2 text-[13px] font-medium text-amber transition hover:bg-amber/20"
            >
              <Route size={14} /> Reconsider
            </button>
            <button
              onClick={() => resolve('skip')}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] text-parchment-300/70 transition hover:bg-white/5"
            >
              <SkipForward size={14} /> Skip this one
            </button>
          </div>
          <p className="mt-2 text-[11px] text-parchment-300/45">
            Reconsidering is logged as signal, not failure — and it leaves no trait mark.
          </p>
        </div>
      ) : (
        <div className="mt-2 text-[12px] italic text-parchment-300/60">Answered — see the record.</div>
      )}
    </Shell>
  )
}

function mismatchLabel(t: string): string {
  return t === 'budget'
    ? 'Budget'
    : t === 'timeline'
      ? 'Timeline'
      : t === 'eligibility'
        ? 'Eligibility'
        : 'Profile tension'
}

// ── Verdict (signal check) ─────────────────────────────────────────────────────

const TRUTH_META: Record<TruthVerdict, { label: string; color: string }> = {
  accurate: { label: 'Accurate', color: '#4fc4a1' },
  partly_true: { label: 'Partly true', color: '#e8b04b' },
  outdated: { label: 'Outdated', color: '#e8b04b' },
  misleading: { label: 'Misleading', color: '#f08a6a' },
  unverifiable: { label: 'Unverified', color: '#8a92c9' },
  not_a_claim: { label: 'Not a claim to check', color: '#b98ce6' },
}
const IMPACT_META: Record<ImpactVerdict, { label: string; color: string }> = {
  no_change: { label: "Doesn't change your path", color: '#4fc4a1' },
  worth_reconsidering: { label: 'Worth reconsidering', color: '#e8b04b' },
  partial_adjustment: { label: 'Adjust the plan', color: '#e8b04b' },
  not_applicable: { label: "Doesn't apply to you", color: '#8a92c9' },
}

function VerdictCard({ ins }: { ins: VerdictInsight }) {
  const [open, setOpen] = useState(false)
  const v = ins.payload
  const escalate = v.escalate
  const impact = IMPACT_META[v.impact]
  const truth = TRUTH_META[v.truthVerdict]

  return (
    <Shell
      icon={escalate ? <LifeBuoy size={15} /> : <ScanSearch size={15} />}
      title="Signal check"
      at={ins.at}
      accent={escalate ? '#b98ce6' : impact.color}
      glow={v.impact === 'worth_reconsidering' || escalate}
    >
      <div className="mb-2 rounded-lg bg-ink-950/50 px-3 py-2">
        <p className="text-[12px] text-parchment-300/70">
          <span className="text-parchment-300/50">Claim </span>“{ins.claim}”
          <span className="text-parchment-300/40"> — {ins.source}</span>
        </p>
      </div>

      {/* headline: impact */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ background: `${impact.color}22`, color: impact.color }}
        >
          {impact.label}
        </span>
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-medium"
          style={{ background: `${truth.color}18`, color: truth.color }}
        >
          {truth.label}
        </span>
      </div>

      <p className="text-balance text-[14px] font-medium leading-relaxed text-parchment-50">
        {v.impactNote}
      </p>

      <button
        onClick={() => setOpen((o) => !o)}
        className="mt-2 flex items-center gap-1 text-[12px] text-parchment-300/60 transition hover:text-parchment-100"
      >
        <ChevronDown size={13} className={cn('transition', open && 'rotate-180')} />
        {open ? 'Hide the check' : 'See the check & sources'}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-2 border-t hairline pt-2">
              <p className="text-[13px] leading-relaxed text-parchment-100">{v.summary}</p>
              <p className="text-[12.5px] leading-relaxed text-parchment-300/75">{v.detail}</p>
              {v.sources.length > 0 && (
                <div className="space-y-1 pt-1">
                  {v.sources.map((s) => (
                    <a
                      key={s.url}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-[12px] text-trait-analytical hover:underline"
                    >
                      <ExternalLink size={12} className="shrink-0" />
                      <span className="flex-1 truncate">{s.title}</span>
                      <span
                        className={cn(
                          'shrink-0 rounded px-1.5 py-0.5 text-[9.5px] font-semibold uppercase',
                          s.tier === 'primary'
                            ? 'bg-signal-confirm/15 text-signal-confirm'
                            : 'bg-white/8 text-parchment-300/60',
                        )}
                      >
                        {s.tier}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Shell>
  )
}

// ── Freshness ───────────────────────────────────────────────────────────────

function FreshnessCard({ ins }: { ins: FreshnessInsight }) {
  const f = ins.payload
  return (
    <Shell icon={<Compass size={15} />} title={ins.title} at={ins.at} accent={f.hasUpdate ? '#e8b04b' : '#8a92c9'}>
      <p className="text-[13px] leading-relaxed text-parchment-100">{f.note}</p>
      <div className="mt-2 flex items-center gap-2 text-[11px] text-parchment-300/45">
        <span>Checked as of {f.checkedAsOf}</span>
        {f.sourceHint && (
          <a
            href={f.sourceHint.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-trait-analytical hover:underline"
          >
            <ExternalLink size={11} /> {f.sourceHint.title}
          </a>
        )}
      </div>
    </Shell>
  )
}

// ── Workaround ─────────────────────────────────────────────────────────────

function WorkaroundCard({ ins }: { ins: WorkaroundInsight }) {
  return (
    <Shell icon={<Route size={15} />} title={ins.title} at={ins.at} accent="#4fc4a1">
      <div className="space-y-2">
        {ins.payload.routes.map((r, i) => (
          <div key={i} className="rounded-lg bg-ink-950/40 p-2.5">
            <div className="text-[13px] font-medium text-parchment-50">{r.title}</div>
            <div className="mt-0.5 text-[12px] leading-relaxed text-parchment-300/75">{r.detail}</div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-parchment-300/50">{ins.payload.note}</p>
    </Shell>
  )
}

// ── Financial aid ─────────────────────────────────────────────────────────────

function AidCard({ ins }: { ins: AidInsight }) {
  return (
    <Shell icon={<PiggyBank size={15} />} title={ins.title} at={ins.at} accent="#4fc4a1">
      <div className="space-y-2">
        {ins.payload.schemes.map((s, i) => (
          <div key={i} className="rounded-lg bg-ink-950/40 p-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-parchment-50">{s.title}</span>
              {s.categoryTied && (
                <span className="rounded bg-trait-structure/20 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase text-trait-structure">
                  category-tied
                </span>
              )}
            </div>
            <div className="mt-0.5 text-[12px] leading-relaxed text-parchment-300/75">{s.detail}</div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-parchment-300/50">{ins.payload.note}</p>
    </Shell>
  )
}

// ── Deadlines ───────────────────────────────────────────────────────────────

function DeadlineCard({ ins }: { ins: DeadlineInsight }) {
  const d = ins.payload
  return (
    <Shell icon={<CalendarClock size={15} />} title={ins.title} at={ins.at} accent="#f0c874">
      {d.dates.length ? (
        <div className="space-y-1.5">
          {d.dates.map((x, i) => (
            <div key={i} className="flex items-baseline justify-between gap-3">
              <span className="text-[13px] text-parchment-100">{x.label}</span>
              <span className="text-[12px] text-amber">{x.window}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[13px] text-parchment-300/70">
          No standard exam calendar for this path — the dates depend on the specific college/process.
        </p>
      )}
      <p className="mt-2 text-[11px] leading-relaxed text-parchment-300/50">
        {d.verifyNote} (checked as of {d.checkedAsOf})
      </p>
      {d.source && (
        <a
          href={d.source.url}
          target="_blank"
          rel="noreferrer"
          className="mt-1 flex items-center gap-1 text-[12px] text-trait-analytical hover:underline"
        >
          <ExternalLink size={11} /> {d.source.title}
        </a>
      )}
    </Shell>
  )
}

// ── Eligibility ─────────────────────────────────────────────────────────────

function EligibilityCard({ ins }: { ins: EligibilityInsight }) {
  const el = ins.payload
  const color =
    el.status === 'clear'
      ? '#4fc4a1'
      : el.status === 'stretch'
        ? '#e8b04b'
        : el.status === 'shortfall'
          ? '#f08a6a'
          : '#8a92c9'
  return (
    <Shell icon={<GraduationCap size={15} />} title={ins.title} at={ins.at} accent={color}>
      <span
        className="mb-2 inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize"
        style={{ background: `${color}22`, color }}
      >
        {el.status === 'unknown' ? 'no percentage gate' : el.status}
      </span>
      <p className="text-[13px] leading-relaxed text-parchment-100">{el.gapNote}</p>
      <p className="mt-2 text-[11px] leading-relaxed text-parchment-300/50">{el.verifyNote}</p>
    </Shell>
  )
}

// ── Compare ─────────────────────────────────────────────────────────────────

function CompareCard({ ins }: { ins: CompareInsight }) {
  const nodes = ins.payload
  const rows: { label: string; get: (n: (typeof nodes)[number]) => string }[] = [
    { label: 'Cost', get: (n) => (n.costMin != null ? `${lakh(n.costMin)}–${lakh(n.costMax)}` : '—') },
    { label: 'To first pay', get: (n) => (n.yearsToFirstIncome != null ? `~${n.yearsToFirstIncome}y` : '—') },
    { label: 'Start pay', get: (n) => (n.payDescription ? n.payDescription.split(';')[0] : '—') },
    { label: 'Eligibility', get: (n) => n.eligibilityThreshold?.typicalValue ?? '—' },
  ]
  return (
    <Shell icon={<GitCompare size={15} />} title={ins.title} at={ins.at} accent="#b98ce6">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr>
              <th className="w-24" />
              {nodes.map((n) => (
                <th key={n.id} className="px-2 pb-2 text-left font-semibold" style={{ color: nodeColor(n) }}>
                  {n.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-t hairline align-top">
                <td className="py-1.5 pr-2 text-parchment-300/55">{r.label}</td>
                {nodes.map((n) => (
                  <td key={n.id} className="px-2 py-1.5 text-parchment-100">
                    {r.get(n)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-parchment-300/50">Exploratory — commits nothing to your path.</p>
    </Shell>
  )
}

// ── Node (researched / opened) ──────────────────────────────────────────────

function NodeCard({ ins }: { ins: NodeInsight }) {
  const n = ins.payload
  const select = useStore((s) => s.selectNode)
  return (
    <Shell icon={<Compass size={15} />} title={n.label} at={ins.at} accent={nodeColor(n)}>
      {n.userAdded && (
        <span className="mb-2 inline-block rounded bg-amber/15 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase text-amber">
          user-researched
        </span>
      )}
      <p className="text-[13px] leading-relaxed text-parchment-100">{n.insight}</p>
      <button
        onClick={() => select(n.id)}
        className="mt-2 text-[12px] font-medium text-amber hover:underline"
      >
        Open it on the map →
      </button>
    </Shell>
  )
}

// ── Opportunity (live search deep-links) ────────────────────────────────────

function OpportunityCard({ ins }: { ins: OpportunityInsight }) {
  const n = ins.payload.node
  return (
    <Shell icon={<Compass size={15} />} title={ins.title} at={ins.at} accent={nodeColor(n)}>
      <p className="mb-2 text-[12px] leading-relaxed text-parchment-300/75">
        Genuine deep-links into live external search — never scraped or cached data dressed up as
        current.
      </p>
      <div className="flex flex-wrap gap-2">
        {n.jobSearchUrl && (
          <a
            href={n.jobSearchUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[12.5px] text-parchment-100 transition hover:bg-white/10"
          >
            <ExternalLink size={13} /> Live jobs
          </a>
        )}
        {n.courseSearchUrl && (
          <a
            href={n.courseSearchUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[12.5px] text-parchment-100 transition hover:bg-white/10"
          >
            <ExternalLink size={13} /> Courses & colleges
          </a>
        )}
      </div>
    </Shell>
  )
}
