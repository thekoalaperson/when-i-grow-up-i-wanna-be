import {
  BadgeCheck,
  Ban,
  Coins,
  Compass,
  FileText,
  GraduationCap,
  RotateCcw,
  Search,
  SkipForward,
  Sparkles,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { RecordEntry, RecordKind } from '@engine/index'
import { cn, timeAgo } from '@ui/lib/util'

const KIND_META: Record<RecordKind, { icon: React.ReactNode; color: string; word: string }> = {
  confirm: { icon: <BadgeCheck size={14} />, color: '#4fc4a1', word: 'Confirmed' },
  reconsider: { icon: <RotateCcw size={14} />, color: '#e8b04b', word: 'Reconsidered' },
  skip: { icon: <SkipForward size={14} />, color: '#8a92c9', word: 'Skipped' },
  claim: { icon: <Search size={14} />, color: '#5aa9e6', word: 'Checked' },
  constraint: { icon: <Coins size={14} />, color: '#f0c874', word: 'Constraint' },
  eligibility: { icon: <GraduationCap size={14} />, color: '#5aa9e6', word: 'Eligibility' },
  exclude: { icon: <Ban size={14} />, color: '#6b7385', word: 'Set aside' },
  research: { icon: <Compass size={14} />, color: '#b98ce6', word: 'Researched' },
  freshness: { icon: <Sparkles size={14} />, color: '#e8b04b', word: 'Freshness' },
  revisit: { icon: <RotateCcw size={14} />, color: '#e8b04b', word: 'Revisit' },
  note: { icon: <FileText size={14} />, color: '#8a92c9', word: 'Noted' },
}

export default function RecordPanel() {
  const records = useStore((s) => s.records)

  if (records.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-8 text-center">
        <div className="max-w-[260px] text-sm leading-relaxed text-faint">
          One continuous record — every choice, reconsideration, and checked claim, in order.
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto px-5 py-4">
      <div className="relative">
        <div className="absolute bottom-2 left-[10px] top-2 w-px bg-overlay2" />
        <div className="space-y-4">
          {records.map((r) => (
            <Entry key={r.id} r={r} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Entry({ r }: { r: RecordEntry }) {
  const meta = KIND_META[r.kind] ?? KIND_META.note
  return (
    <div className="relative flex gap-3 pl-0">
      <div
        className="z-10 mt-0.5 flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full border"
        style={{ borderColor: `${meta.color}66`, background: 'var(--icon-bg)', color: meta.color }}
      >
        {meta.icon}
      </div>
      <div className="min-w-0 flex-1 pb-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: meta.color }}>
            {meta.word}
          </span>
          <span className="shrink-0 text-[10.5px] text-faint">{timeAgo(r.at)}</span>
        </div>
        <div className="text-[13.5px] leading-snug text-fg2">{r.title}</div>
        {r.reasoning && (
          <div className="mt-1 border-l-2 border-amber/40 pl-2 text-[12.5px] italic leading-relaxed text-fg">
            “{r.reasoning}”
          </div>
        )}
        {r.detail && !r.reasoning && (
          <div className={cn('mt-0.5 text-[12px] leading-relaxed text-muted')}>{r.detail}</div>
        )}
      </div>
    </div>
  )
}
