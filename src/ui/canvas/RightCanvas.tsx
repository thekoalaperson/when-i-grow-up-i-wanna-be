import { motion } from 'framer-motion'
import { GitBranch, ListTree, ScrollText, UserRound } from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { RightTab } from '@/store/model'
import { cn } from '@ui/lib/util'
import LifeGraph from '@ui/graph/LifeGraph'
import NodeDrawer from '@ui/graph/NodeDrawer'
import InsightsFeed from '@ui/insights/InsightsFeed'
import ProfilePanel from '@ui/profile/ProfilePanel'
import RecordPanel from '@ui/record/RecordPanel'

export default function RightCanvas() {
  const rightTab = useStore((s) => s.rightTab)
  const setTab = useStore((s) => s.setRightTab)
  const insightCount = useStore((s) => s.insights.length)
  const recordCount = useStore((s) => s.records.length)

  const tabs: { id: RightTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'insights', label: 'Insights', icon: <ListTree size={14} />, count: insightCount },
    { id: 'profile', label: 'Profile', icon: <UserRound size={14} /> },
    { id: 'record', label: 'Record', icon: <ScrollText size={14} />, count: recordCount },
  ]

  return (
    <div className="relative flex h-full flex-col gap-3">
      {/* graph hero */}
      <div className="relative h-[50%] min-h-[220px] overflow-hidden rounded-2xl glass-soft">
        <div className="pointer-events-none absolute left-4 top-3 z-10 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-faint">
          <GitBranch size={12} /> Your life graph
        </div>
        <LifeGraph />
      </div>

      {/* tabbed panel */}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl glass-soft">
        <div className="flex items-center gap-1 border-b hairline px-2 py-1.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition',
                rightTab === t.id ? 'text-fg2' : 'text-faint hover:text-fg',
              )}
            >
              {rightTab === t.id && (
                <motion.span
                  layoutId="tab-bg"
                  className="absolute inset-0 rounded-lg bg-overlay2"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {t.icon}
                {t.label}
                {t.count != null && t.count > 0 && (
                  <span className="rounded-full bg-overlay2 px-1.5 text-[10px] tabular-nums text-muted">
                    {t.count}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1">
          {rightTab === 'insights' && <InsightsFeed />}
          {rightTab === 'profile' && <ProfilePanel />}
          {rightTab === 'record' && <RecordPanel />}
        </div>
      </div>

      {/* node detail overlay */}
      <NodeDrawer />
    </div>
  )
}
