'use client'

import { CloseIcon, MenuIcon, SparklesIcon } from '@/components/chat/ChatIcons'

type ChatHeaderProps = {
  title: string
  showSidebarToggle?: boolean
  sidebarOpen?: boolean
  onToggleSidebar?: () => void
  onClose: () => void
}

export function ChatHeader({
  title,
  showSidebarToggle = false,
  sidebarOpen = false,
  onToggleSidebar,
  onClose,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-earth-100 px-3 py-3">
      <div className="flex items-center gap-2">
        {showSidebarToggle && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-earth-600 transition hover:bg-sand-100"
            aria-label="Historial"
            aria-pressed={sidebarOpen}
          >
            <MenuIcon className="h-4 w-4" />
          </button>
        )}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)]">
          <SparklesIcon />
        </div>
        <h2 className="font-display text-lg text-earth-900">{title}</h2>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-earth-500 transition hover:bg-sand-100 hover:text-earth-800"
        aria-label="Cerrar"
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    </div>
  )
}
