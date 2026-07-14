import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Copy, Download, X } from 'lucide-react'
import { useStore } from '@/store/useStore'

export default function ExportModal() {
  const open = useStore((s) => s.exportOpen)
  const md = useStore((s) => s.exportMarkdown)
  const close = useStore((s) => s.closeExport)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    if (!md) return
    try {
      await navigator.clipboard.writeText(md)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard may be blocked; download still works */
    }
  }

  const download = () => {
    if (!md) return
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `future-map-profile-${new Date().toISOString().slice(0, 10)}.md`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <AnimatePresence>
      {open && md && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          className="fixed inset-0 z-50 flex items-center justify-center bg-sunken p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[88vh] w-full max-w-2xl flex-col rounded-2xl glass shadow-panel"
          >
            <div className="flex items-center justify-between border-b hairline px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber" />
                <h2 className="text-[15px] font-medium text-fg2">Your profile</h2>
                <span className="text-[11.5px] text-faint">the takeaway — dated & yours</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={copy}
                  className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[12px] text-fg transition hover:bg-overlay"
                >
                  {copied ? <Check size={13} className="text-signal-confirm" /> : <Copy size={13} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={download}
                  className="flex items-center gap-1.5 rounded-lg bg-amber/90 px-2.5 py-1.5 text-[12px] font-semibold text-oncolor transition hover:bg-amber"
                >
                  <Download size={13} /> Download .md
                </button>
                <button
                  onClick={close}
                  className="ml-1 rounded-lg p-1.5 text-muted transition hover:bg-overlay2 hover:text-fg2"
                >
                  <X size={17} />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto px-6 py-5">
              <Markdown text={md} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── minimal, safe markdown renderer for our own export format ─────────────────

function inline(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  const re = /(\*\*[^*]+\*\*|_[^_]+_|`[^`]+`)/g
  let last = 0
  let m: RegExpExecArray | null
  let k = 0
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    const tok = m[0]
    if (tok.startsWith('**'))
      parts.push(
        <strong key={k++} className="font-semibold text-fg2">
          {tok.slice(2, -2)}
        </strong>,
      )
    else if (tok.startsWith('`'))
      parts.push(
        <code key={k++} className="rounded bg-overlay2 px-1 py-0.5 font-mono text-[11.5px] text-amber">
          {tok.slice(1, -1)}
        </code>,
      )
    else
      parts.push(
        <em key={k++} className="text-muted">
          {tok.slice(1, -1)}
        </em>,
      )
    last = m.index + tok.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

function Markdown({ text }: { text: string }) {
  const lines = text.split('\n')
  const out: ReactNode[] = []
  let list: ReactNode[] = []
  let key = 0
  const flush = () => {
    if (list.length) {
      out.push(
        <ul key={key++} className="my-2 space-y-1.5 pl-1">
          {list}
        </ul>,
      )
      list = []
    }
  }
  for (const raw of lines) {
    const line = raw.trimEnd()
    if (line.startsWith('- ')) {
      list.push(
        <li key={key++} className="flex gap-2 text-[13px] leading-relaxed text-fg">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber" />
          <span>{inline(line.slice(2))}</span>
        </li>,
      )
      continue
    }
    flush()
    if (line === '') out.push(<div key={key++} className="h-1.5" />)
    else if (line === '---') out.push(<hr key={key++} className="my-4 border-line" />)
    else if (line.startsWith('### '))
      out.push(
        <h3 key={key++} className="mb-1 mt-4 text-[13px] font-semibold uppercase tracking-wide text-amber/85">
          {inline(line.slice(4))}
        </h3>,
      )
    else if (line.startsWith('## '))
      out.push(
        <h2 key={key++} className="mb-1.5 mt-5 font-display text-[18px] text-fg2">
          {inline(line.slice(3))}
        </h2>,
      )
    else if (line.startsWith('# '))
      out.push(
        <h1 key={key++} className="mb-2 font-display text-[24px] text-fg2">
          {inline(line.slice(2))}
        </h1>,
      )
    else
      out.push(
        <p key={key++} className="my-1.5 text-[13px] leading-relaxed text-fg">
          {inline(line)}
        </p>,
      )
  }
  flush()
  return <div>{out}</div>
}
