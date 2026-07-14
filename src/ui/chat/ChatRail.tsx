import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUp, Sparkles } from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { ChatMessage, Chip } from '@/store/model'
import { cn } from '@ui/lib/util'

export default function ChatRail() {
  const chat = useStore((s) => s.chat)
  const scrollRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [chat.length])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b hairline px-4 py-3">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber/60 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber" />
        </span>
        <span className="text-[13px] font-medium text-parchment-100">Future Map</span>
        <span className="text-[11.5px] text-parchment-300/45">· thinks with you, decides nothing for you</span>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {chat.map((m, i) => (
          <Msg key={m.id} m={m} last={i === chat.length - 1} />
        ))}
      </div>

      <Composer />
    </div>
  )
}

function Msg({ m, last }: { m: ChatMessage; last: boolean }) {
  const handleChip = useStore((s) => s.handleChip)

  if (m.role === 'tool') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 pl-1"
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-trait-analytical/70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-trait-analytical" />
        </span>
        <span className="font-mono text-[11px] text-trait-analytical/90">{m.tool}()</span>
        <span className="text-[11px] italic text-parchment-300/55">{m.rationale}</span>
      </motion.div>
    )
  }

  const isUser = m.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn('flex flex-col', isUser ? 'items-end' : 'items-start')}
    >
      {m.text && (
        <div
          className={cn(
            'max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed',
            isUser
              ? 'rounded-br-md bg-amber/15 text-parchment-50'
              : 'rounded-bl-md bg-ink-800/70 text-parchment-100',
          )}
        >
          {m.text}
        </div>
      )}
      {m.chips && m.chips.length > 0 && <Chips chips={m.chips} onPick={handleChip} enabled={last} />}
    </motion.div>
  )
}

function Chips({ chips, onPick, enabled }: { chips: Chip[]; onPick: (c: Chip) => void; enabled: boolean }) {
  return (
    <div className="mt-2 flex max-w-full flex-wrap gap-1.5">
      {chips.map((c) => (
        <button
          key={c.value}
          onClick={() => onPick(c)}
          title={c.hint}
          className={cn(
            'group rounded-full border px-3 py-1.5 text-left text-[12.5px] transition',
            enabled ? 'hover:bg-white/10' : 'opacity-60 hover:opacity-100',
            c.highlight
              ? 'border-amber/50 bg-amber/10 text-amber'
              : 'border-white/12 bg-white/[0.03] text-parchment-100',
          )}
        >
          {c.highlight && <Sparkles size={11} className="mr-1 inline -translate-y-px" />}
          {c.label}
        </button>
      ))}
    </div>
  )
}

function Composer() {
  const submitText = useStore((s) => s.submitText)
  const awaiting = useStore((s) => s.awaiting)
  const [value, setValue] = useState('')
  const taRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
  }, [value])

  const send = () => {
    const v = value.trim()
    if (!v) return
    setValue('')
    void submitText(v)
  }

  const placeholder =
    awaiting === 'claim'
      ? 'Paste what you were told, and who said it…'
      : awaiting === 'eligibility'
        ? 'e.g. “I got 84%” (add your category if you like)'
        : 'Message Future Map — or paste what you were told…'

  return (
    <div className="border-t hairline p-3">
      <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-ink-950/60 px-3 py-2 focus-within:border-amber/40">
        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
          rows={1}
          placeholder={placeholder}
          className="max-h-40 flex-1 resize-none bg-transparent py-1 text-[13.5px] leading-relaxed text-parchment-50 outline-none placeholder:text-parchment-300/40"
        />
        <button
          onClick={send}
          disabled={!value.trim()}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber/90 text-ink-950 transition hover:bg-amber disabled:opacity-30"
        >
          <ArrowUp size={17} strokeWidth={2.5} />
        </button>
      </div>
      <p className="mt-1.5 px-1 text-[10.5px] text-parchment-300/40">
        Small nudges from me · your longer thoughts and documents go here. The work builds on the right. →
      </p>
    </div>
  )
}
