'use client'

import { QUICK_SUGGESTIONS } from '@/lib/chat'
import type { Lang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n'

type ChatSuggestionsProps = {
  lang: Lang
  disabled?: boolean
  onSelect?: (message: string) => void
}

export function ChatSuggestions({ lang, disabled = false, onSelect }: ChatSuggestionsProps) {
  const copy = getTranslations(lang).chat

  return (
    <div className="flex flex-wrap gap-2">
      {QUICK_SUGGESTIONS.map((item) => {
        const label = copy[item.labelKey as keyof typeof copy] as string
        const message = copy[item.messageKey as keyof typeof copy] as string

        return (
          <button
            key={item.id}
            type="button"
            disabled={disabled || !onSelect}
            onClick={() => onSelect?.(message)}
            className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-earth-700 transition hover:bg-rose-100 disabled:cursor-default disabled:opacity-70"
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
