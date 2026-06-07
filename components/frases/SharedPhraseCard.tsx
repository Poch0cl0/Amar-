'use client'

import { useState } from 'react'
import { useLocale } from '@/components/providers/LocaleProvider'
import { getTranslations } from '@/lib/i18n'
import { getCategoryLabel, type SharedPhrase } from '@/lib/frases'

type SharedPhraseCardProps = {
  phrase: SharedPhrase
  onBlock: (senderId: string, senderName: string) => void
  blocking?: boolean
}

export function SharedPhraseCard({ phrase, onBlock, blocking = false }: SharedPhraseCardProps) {
  const { lang } = useLocale()
  const copy = getTranslations(lang).frases
  const [confirming, setConfirming] = useState(false)

  return (
    <article className="relative flex aspect-square flex-col justify-between rounded-[1.25rem] bg-white p-6 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <span className="w-fit rounded-full bg-rose-100 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-rose-500">
          {getCategoryLabel(phrase.category, lang)}
        </span>

        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={blocking}
            className="shrink-0 rounded-lg px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-earth-400 transition hover:bg-rose-50 hover:text-rose-500 disabled:opacity-50"
            title={copy.blockUser}
          >
            {copy.block}
          </button>
        ) : (
          <div className="flex shrink-0 flex-col items-end gap-1">
            <button
              type="button"
              onClick={() => onBlock(phrase.sender_id, phrase.sender_name)}
              disabled={blocking}
              className="rounded-lg bg-rose-100 px-2 py-1 text-[0.65rem] font-semibold text-rose-600 transition hover:bg-rose-200 disabled:opacity-50"
            >
              {blocking ? copy.blocking : copy.confirmBlock}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={blocking}
              className="text-[0.65rem] text-earth-400 hover:text-earth-600"
            >
              {copy.cancel}
            </button>
          </div>
        )}
      </div>

      <p className="font-display text-xl font-bold leading-snug text-earth-900 sm:text-2xl">
        &ldquo;{phrase.phrase_text}&rdquo;
      </p>

      <p className="font-display text-base italic text-earth-500">
        — {phrase.sender_name}
      </p>
    </article>
  )
}
