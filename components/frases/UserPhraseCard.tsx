'use client'

import { useLocale } from '@/components/providers/LocaleProvider'
import { getTranslations } from '@/lib/i18n'
import { getCategoryLabel, type UserPhrase } from '@/lib/frases'

type UserPhraseCardProps = {
  phrase: UserPhrase
  authorName: string
  onShare: (phrase: UserPhrase) => void
}

export function UserPhraseCard({ phrase, authorName, onShare }: UserPhraseCardProps) {
  const { lang } = useLocale()
  const copy = getTranslations(lang).frases

  return (
    <article className="flex aspect-square flex-col justify-between rounded-[1.25rem] bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft">
      <span className="w-fit rounded-full bg-rose-100 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-rose-500">
        {getCategoryLabel(phrase.category, lang)}
      </span>

      <p className="font-display text-2xl font-bold leading-snug text-earth-900 sm:text-2xl">
        &ldquo;{phrase.phrase_text}&rdquo;
      </p>

      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-base italic text-earth-500">— {authorName}</p>
        <button
          type="button"
          onClick={() => onShare(phrase)}
          className="rounded-lg p-1.5 text-earth-400 transition hover:bg-rose-50 hover:text-rose-400"
          aria-label={copy.sharePhrase}
        >
          <ShareIcon />
        </button>
      </div>
    </article>
  )
}

function ShareIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
    </svg>
  )
}
