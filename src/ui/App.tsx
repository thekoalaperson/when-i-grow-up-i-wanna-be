import { useEffect, useState } from 'react'
import { GitBranch, MessagesSquare } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@ui/lib/util'
import TopBar from './TopBar'
import ChatRail from './chat/ChatRail'
import RightCanvas from './canvas/RightCanvas'
import ExportModal from './ExportModal'

export default function App() {
  const started = useStore((s) => s.started)
  const start = useStore((s) => s.start)
  const theme = useStore((s) => s.theme)
  const [mobileView, setMobileView] = useState<'chat' | 'map'>('map')

  useEffect(() => {
    if (!started) start()
  }, [started, start])

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    root.style.colorScheme = theme
  }, [theme])

  return (
    <div className="relative z-10 flex h-screen flex-col">
      <TopBar />

      {/* mobile pane switch */}
      <div className="flex gap-1 border-b hairline px-3 py-2 lg:hidden">
        {(
          [
            { id: 'chat', label: 'Conversation', icon: <MessagesSquare size={14} /> },
            { id: 'map', label: 'The artefact', icon: <GitBranch size={14} /> },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setMobileView(t.id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-[12.5px] font-medium transition',
              mobileView === t.id ? 'bg-overlay2 text-fg2' : 'text-faint',
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <main className="flex min-h-0 flex-1 gap-3 p-3">
        {/* chat rail */}
        <div
          className={cn(
            'min-h-0 overflow-hidden rounded-2xl glass-soft lg:block lg:w-[384px] lg:shrink-0',
            mobileView === 'chat' ? 'block w-full' : 'hidden',
          )}
        >
          <ChatRail />
        </div>

        {/* artefact */}
        <div
          className={cn(
            'min-h-0 flex-1 lg:block',
            mobileView === 'map' ? 'block' : 'hidden',
          )}
        >
          <RightCanvas />
        </div>
      </main>

      <ExportModal />
    </div>
  )
}
