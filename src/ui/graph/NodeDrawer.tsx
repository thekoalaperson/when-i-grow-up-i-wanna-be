import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Ban,
  CalendarClock,
  Check,
  Compass,
  ExternalLink,
  GraduationCap,
  PiggyBank,
  Route,
  Sparkles,
  Swords,
  Undo2,
  X,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { DecisionNode } from '@engine/index'
import { cn, lakh, nodeColor } from '@ui/lib/util'

export default function NodeDrawer() {
  const selectedNodeId = useStore((s) => s.selectedNodeId)
  const getNode = useStore((s) => s.getNode)
  const node = selectedNodeId ? getNode(selectedNodeId) : undefined
  return (
    <AnimatePresence>
      {node && <Drawer key={node.id} node={node} />}
    </AnimatePresence>
  )
}

function Drawer({ node }: { node: DecisionNode }) {
  const placed = useStore((s) => s.placed[node.id])
  const excluded = useStore((s) => s.ctx.excluded.includes(node.id))
  const checklistDone = useStore((s) => s.checklistDone[node.id] ?? [])
  const activeChallengeId = useStore((s) => s.activeChallengeId)
  const select = useStore((s) => s.selectNode)
  const exploreStream = useStore((s) => s.exploreStream)
  const exploreCareer = useStore((s) => s.exploreCareer)
  const excludeNode = useStore((s) => s.excludeNode)
  const unexcludeNode = useStore((s) => s.unexcludeNode)
  const toggleChecklist = useStore((s) => s.toggleChecklist)
  const runOpportunities = useStore((s) => s.runOpportunities)
  const runFreshness = useStore((s) => s.runFreshness)
  const runEligibility = useStore((s) => s.runEligibility)
  const runWorkaround = useStore((s) => s.runWorkaround)
  const runAid = useStore((s) => s.runAid)
  const runDeadlines = useStore((s) => s.runDeadlines)
  const percentage = useStore((s) => s.ctx.profile.percentage)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') select(undefined)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [select])

  const color = nodeColor(node)
  const confirmed = placed?.status === 'confirmed'
  const isChallengeable = (node.stage === 2 || node.stage === 3) && !confirmed
  const hasActiveChallenge = !!activeChallengeId

  const startChallenge = () => (node.stage === 2 ? exploreStream(node.id) : exploreCareer(node.id))

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0.6 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 34 }}
      className="absolute inset-y-0 right-0 z-30 flex w-full max-w-[380px] flex-col glass shadow-panel"
    >
      {/* header */}
      <div className="flex items-start gap-3 border-b hairline p-4">
        <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ background: color }} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[17px] text-fg2">{node.label}</h3>
            {node.userAdded && (
              <span className="rounded bg-amber/15 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase text-amber">
                researched
              </span>
            )}
          </div>
          <p className="text-[12.5px] text-muted">{node.subtitle}</p>
          <div className="mt-1 flex items-center gap-2 text-[10.5px] uppercase tracking-wide text-faint">
            <span>Stage {node.stage}</span>
            {confirmed && <span className="text-signal-confirm">· confirmed</span>}
            {placed?.status === 'reconsidered' && <span className="text-amber">· reconsidered</span>}
            {excluded && <span className="text-faint">· set aside</span>}
          </div>
        </div>
        <button
          onClick={() => select(undefined)}
          className="rounded-lg p-1.5 text-muted transition hover:bg-overlay2 hover:text-fg2"
        >
          <X size={17} />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {/* insight */}
        <p className="text-balance text-[13.5px] leading-relaxed text-fg">{node.insight}</p>

        {/* grounded picture */}
        {node.stage === 3 && node.costMin != null && (
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Cost" value={`${lakh(node.costMin)}–${lakh(node.costMax)}`} />
            <Stat label="To first pay" value={`~${node.yearsToFirstIncome}y`} />
            <Stat label="As of" value={node.lastVerified ?? '—'} small />
          </div>
        )}
        {node.payDescription && (
          <div className="rounded-lg bg-sunken p-2.5">
            <div className="text-[10.5px] uppercase tracking-wide text-faint">Starting pay</div>
            <div className="mt-0.5 text-[12.5px] leading-relaxed text-fg">{node.payDescription}</div>
          </div>
        )}
        {node.entrancePrepCost && (
          <div className="rounded-lg bg-sunken p-2.5">
            <div className="text-[10.5px] uppercase tracking-wide text-faint">Entrance prep</div>
            <div className="mt-0.5 text-[12.5px] leading-relaxed text-fg">{node.entrancePrepCost}</div>
          </div>
        )}

        {/* eligibility threshold */}
        {node.eligibilityThreshold && (
          <div className="rounded-lg border border-line p-2.5">
            <div className="mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-trait-analytical">
              <GraduationCap size={13} /> Typical bar
            </div>
            <div className="text-[12.5px] text-fg">{node.eligibilityThreshold.typicalValue}</div>
            <div className="mt-1 text-[11.5px] leading-relaxed text-muted">
              {node.eligibilityThreshold.note}
            </div>
          </div>
        )}

        {/* checklist */}
        {node.checklist.length > 0 && (
          <div>
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted">
              <Check size={13} /> Prep checklist
            </div>
            <div className="space-y-1.5">
              {node.checklist.map((c, i) => {
                const done = checklistDone.includes(i)
                return (
                  <button
                    key={i}
                    onClick={() => toggleChecklist(node.id, i)}
                    className="flex w-full items-start gap-2 rounded-lg p-1.5 text-left transition hover:bg-overlay"
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                        done ? 'border-signal-confirm bg-signal-confirm text-oncolor' : 'border-line2',
                      )}
                    >
                      {done && <Check size={11} strokeWidth={3} />}
                    </span>
                    <span
                      className={cn(
                        'text-[12.5px] leading-snug',
                        done ? 'text-faint line-through' : 'text-fg',
                      )}
                    >
                      {c}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* opportunities */}
        {node.opportunities.length > 0 && (
          <div>
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted">
              <Compass size={13} /> What it opens
            </div>
            <ul className="space-y-1">
              {node.opportunities.map((o, i) => (
                <li key={i} className="flex gap-2 text-[12.5px] leading-snug text-fg">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: color }} />
                  {o}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* stage-3 tools */}
        {node.stage === 3 && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Tool icon={<Compass size={13} />} label="What's live now" onClick={() => runOpportunities(node.id)} />
            <Tool
              icon={<GraduationCap size={13} />}
              label={percentage != null ? 'Eligibility' : 'Eligibility'}
              onClick={() => runEligibility(node.id)}
            />
            <Tool icon={<Route size={13} />} label="Alternate routes" onClick={() => runWorkaround(node.id)} />
            <Tool icon={<PiggyBank size={13} />} label="Aid & funding" onClick={() => runAid(node.id)} />
            <Tool icon={<CalendarClock size={13} />} label="Key dates" onClick={() => runDeadlines(node.id)} />
            <Tool icon={<Sparkles size={13} />} label="What might change" onClick={() => runFreshness(node.id)} />
          </div>
        )}

        {/* sources */}
        {node.sourceUrls && node.sourceUrls.length > 0 && (
          <div className="space-y-1 border-t hairline pt-3">
            {node.sourceUrls.map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-[12px] text-trait-analytical hover:underline"
              >
                <ExternalLink size={12} /> {s.title}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* action bar */}
      <div className="space-y-2 border-t hairline p-4">
        {isChallengeable && (
          <button
            disabled={hasActiveChallenge}
            onClick={startChallenge}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber/90 px-4 py-2.5 text-[13.5px] font-semibold text-oncolor transition hover:bg-amber disabled:opacity-40"
          >
            <Swords size={15} />
            {node.stage === 2 ? 'Put this stream through the challenge' : 'Put this direction through the challenge'}
          </button>
        )}
        {confirmed && (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-signal-confirm/12 px-4 py-2.5 text-[13px] font-medium text-signal-confirm">
            <Check size={15} /> Confirmed — committed by your click, not the system
          </div>
        )}
        <button
          onClick={() => (excluded ? unexcludeNode(node.id) : excludeNode(node.id))}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-line px-4 py-2 text-[12.5px] text-muted transition hover:bg-overlay"
        >
          {excluded ? <Undo2 size={14} /> : <Ban size={14} />}
          {excluded ? 'Bring it back' : 'Set aside (reversible)'}
        </button>
      </div>
    </motion.div>
  )
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="rounded-lg bg-sunken p-2 text-center">
      <div className="text-[9.5px] uppercase tracking-wide text-faint">{label}</div>
      <div className={cn('mt-0.5 font-semibold text-fg2', small ? 'text-[11px]' : 'text-[13px]')}>
        {value}
      </div>
    </div>
  )
}

function Tool({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-lg border border-line bg-overlay px-2.5 py-2 text-[12px] text-fg transition hover:border-amber/30 hover:bg-amber/5"
    >
      <span className="text-amber">{icon}</span>
      {label}
    </button>
  )
}
