import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GraduationCap, Info, RotateCcw, UserRound, X } from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { Mode } from '@/store/model'
import { cn } from '@ui/lib/util'

export default function TopBar() {
  const mode = useStore((s) => s.mode)
  const setMode = useStore((s) => s.setMode)
  const resetAll = useStore((s) => s.resetAll)
  const [about, setAbout] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <header className="relative z-20 flex items-center justify-between gap-3 border-b hairline px-4 py-2.5">
      <div className="flex items-center gap-2.5">
        <Mark />
        <div className="leading-none">
          <div className="font-display text-[17px] tracking-tight text-parchment-50">Future Map</div>
          <div className="hidden text-[11px] text-parchment-300/50 sm:block">
            decide with your eyes open
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ModeToggle mode={mode} setMode={setMode} />
        <button
          onClick={() => setAbout(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-parchment-300/70 transition hover:bg-white/5 hover:text-parchment-50"
          title="How this works"
        >
          <Info size={15} />
        </button>
        <button
          onClick={() => setConfirmReset(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-parchment-300/70 transition hover:bg-white/5 hover:text-parchment-50"
          title="Start over"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      <AnimatePresence>{about && <AboutModal onClose={() => setAbout(false)} />}</AnimatePresence>
      <AnimatePresence>
        {confirmReset && (
          <ConfirmReset
            onCancel={() => setConfirmReset(false)}
            onConfirm={() => {
              setConfirmReset(false)
              resetAll()
            }}
          />
        )}
      </AnimatePresence>
    </header>
  )
}

function Mark() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" className="shrink-0">
      <line x1="16" y1="16" x2="6" y2="9" stroke="rgba(255,255,255,0.2)" />
      <line x1="16" y1="16" x2="26" y2="11" stroke="rgba(255,255,255,0.2)" />
      <line x1="16" y1="16" x2="24" y2="25" stroke="rgba(255,255,255,0.2)" />
      <circle cx="16" cy="16" r="5" fill="#e8b04b" />
      <circle cx="6" cy="9" r="2.5" fill="#5aa9e6" />
      <circle cx="26" cy="11" r="2.5" fill="#4fc4a1" />
      <circle cx="24" cy="25" r="2.5" fill="#b98ce6" />
    </svg>
  )
}

function ModeToggle({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  const opts: { id: Mode; label: string; icon: React.ReactNode }[] = [
    { id: 'student', label: 'Student', icon: <UserRound size={13} /> },
    { id: 'counsellor', label: 'Counsellor', icon: <GraduationCap size={13} /> },
  ]
  return (
    <div className="flex rounded-lg border border-white/10 bg-ink-950/40 p-0.5">
      {opts.map((o) => (
        <button
          key={o.id}
          onClick={() => setMode(o.id)}
          className={cn(
            'relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition',
            mode === o.id ? 'text-ink-950' : 'text-parchment-300/60 hover:text-parchment-100',
          )}
        >
          {mode === o.id && (
            <motion.span layoutId="mode-bg" className="absolute inset-0 rounded-md bg-amber" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            {o.icon}
            <span className="hidden sm:inline">{o.label}</span>
          </span>
        </button>
      ))}
    </div>
  )
}

function Backdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 p-4 backdrop-blur-sm"
    >
      {children}
    </motion.div>
  )
}

function AboutModal({ onClose }: { onClose: () => void }) {
  const commitments = [
    ['Grounded, never guessed', 'Every cost, cutoff, and pay figure is real, sourced, and dated — not recited from memory.'],
    ['Never a rubber stamp', 'Every commitment is challenged with a real number before it’s yours. Directness over comfort.'],
    ['Reconsidering is signal', 'Backing out is logged and read as seriously as confirming — never as a wrong answer.'],
    ['It never decides', 'It researches, checks, and recommends. The deliberate commit stays a human click, always.'],
    ['One continuous record', 'Every choice, check, and reconsideration lives in one place you can always return to.'],
  ]
  return (
    <Backdrop onClose={onClose}>
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.97, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl glass p-6 shadow-panel"
      >
        <div className="mb-3 flex items-start justify-between">
          <h2 className="text-[20px] text-parchment-50">What Future Map is</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-parchment-300/60 hover:bg-white/8">
            <X size={18} />
          </button>
        </div>
        <p className="mb-4 text-[13.5px] leading-relaxed text-parchment-100">
          A grounded companion for choosing a stream and a career — built for students in grades 8–12, and
          usable by a counsellor on a student’s behalf. The chat stays small; the map, the insights, and the
          profile you build are the point.
        </p>
        <div className="space-y-2.5">
          {commitments.map(([t, d], i) => (
            <div key={i} className="flex gap-3 rounded-xl bg-ink-950/40 p-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber/20 text-[11px] font-bold text-amber">
                {i + 1}
              </span>
              <div>
                <div className="text-[13.5px] font-semibold text-parchment-50">{t}</div>
                <div className="text-[12.5px] leading-relaxed text-parchment-300/75">{d}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-white/8 p-3 text-[12px] leading-relaxed text-parchment-300/70">
          <span className="font-semibold text-parchment-100">On the data:</span> figures here are 2026-indicative
          seed research, shown with an “as of” date and a link to the primary source. In a live deployment the
          same checks run against current search results, weighting official sources over marketing. Always
          verify a cutoff or deadline on the official source before acting.
        </div>
      </motion.div>
    </Backdrop>
  )
}

function ConfirmReset({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <Backdrop onClose={onCancel}>
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.97, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl glass p-5 shadow-panel"
      >
        <h3 className="text-[16px] text-parchment-50">Start over?</h3>
        <p className="mt-1 text-[13px] leading-relaxed text-parchment-300/75">
          This clears your map, profile, and record on this device. There’s no undo — consider getting your
          profile first.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg px-3 py-2 text-[13px] text-parchment-300/75 hover:bg-white/5"
          >
            Keep it
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-signal-alert/90 px-3 py-2 text-[13px] font-semibold text-ink-950 hover:bg-signal-alert"
          >
            Start over
          </button>
        </div>
      </motion.div>
    </Backdrop>
  )
}
