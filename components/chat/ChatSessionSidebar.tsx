'use client'

import { useState } from 'react'
import { TrashIcon } from '@/components/chat/ChatIcons'
import type { ChatSession } from '@/lib/chat'

type ChatSessionSidebarProps = {
  sessions: ChatSession[]
  activeSessionId: string | null
  newConversationLabel: string
  defaultTitle: string
  deleteLabel: string
  deleteConfirm: string
  deleteYes: string
  deleteNo: string
  deleting?: boolean
  onSelect: (sessionId: string) => void
  onNew: () => void
  onDelete: (sessionId: string) => void
}

export function ChatSessionSidebar({
  sessions,
  activeSessionId,
  newConversationLabel,
  defaultTitle,
  deleteLabel,
  deleteConfirm,
  deleteYes,
  deleteNo,
  deleting = false,
  onSelect,
  onNew,
  onDelete,
}: ChatSessionSidebarProps) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  return (
    <aside className="flex w-36 shrink-0 flex-col border-r border-earth-100 bg-sand-50/80">
      <button
        type="button"
        onClick={onNew}
        disabled={deleting}
        className="m-2 rounded-lg bg-[var(--color-primary)] px-2 py-2 text-[0.65rem] font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {newConversationLabel}
      </button>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {sessions.map((session) => {
          if (confirmingId === session.id) {
            return (
              <div
                key={session.id}
                className="mb-1 rounded-lg border border-rose-200 bg-rose-50 p-2"
              >
                <p className="text-[0.65rem] leading-snug text-earth-700">{deleteConfirm}</p>
                <div className="mt-2 flex gap-1">
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={() => {
                      onDelete(session.id)
                      setConfirmingId(null)
                    }}
                    className="flex-1 rounded-md bg-rose-500 px-2 py-1 text-[0.65rem] font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60"
                  >
                    {deleteYes}
                  </button>
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={() => setConfirmingId(null)}
                    className="flex-1 rounded-md border border-earth-200 bg-white px-2 py-1 text-[0.65rem] font-semibold text-earth-600 transition hover:bg-sand-50 disabled:opacity-60"
                  >
                    {deleteNo}
                  </button>
                </div>
              </div>
            )
          }

          return (
            <div key={session.id} className="group mb-1 flex items-start gap-0.5">
              <button
                type="button"
                onClick={() => onSelect(session.id)}
                disabled={deleting}
                className={`min-w-0 flex-1 rounded-lg px-2 py-2 text-left text-xs leading-snug transition disabled:opacity-60 ${
                  activeSessionId === session.id
                    ? 'bg-white font-semibold text-earth-900 shadow-sm'
                    : 'text-earth-600 hover:bg-white/70'
                }`}
              >
                <span className="line-clamp-3">{session.title || defaultTitle}</span>
              </button>
              <button
                type="button"
                onClick={() => setConfirmingId(session.id)}
                disabled={deleting}
                aria-label={deleteLabel}
                className="mt-1 shrink-0 rounded-md p-1 text-earth-400 opacity-70 transition hover:bg-rose-50 hover:text-rose-500 hover:opacity-100 disabled:opacity-40"
              >
                <TrashIcon />
              </button>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
