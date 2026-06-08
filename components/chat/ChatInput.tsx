'use client'

import { SendIcon } from '@/components/chat/ChatIcons'

type ChatInputProps = {
  value: string
  placeholder: string
  disabled?: boolean
  onChange: (value: string) => void
  onSend: () => void
}

export function ChatInput({ value, placeholder, disabled = false, onChange, onSend }: ChatInputProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="flex items-end gap-2 border-t border-earth-100 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] md:pb-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="max-h-24 min-h-[2.5rem] flex-1 resize-none rounded-xl border border-earth-200 bg-cream px-3 py-2 text-sm text-[var(--color-text)] outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200 disabled:opacity-60"
      />
      <button
        type="button"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={placeholder}
      >
        <SendIcon />
      </button>
    </div>
  )
}
