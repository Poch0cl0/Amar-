'use client'

import { useState } from 'react'
import { useLocale } from '@/components/providers/LocaleProvider'
import { getTranslations, t } from '@/lib/i18n'
import {
  countWords,
  getCategoryLabel,
  isPhraseWithinWordLimit,
  MAX_PHRASE_WORDS,
  PHRASE_CATEGORIES,
} from '@/lib/frases'
import { createSupabaseClient } from '@/lib/supabase'

type CreatePhraseFormProps = {
  onClose: () => void
  onCreated: () => void
  userId: string
}

export function CreatePhraseForm({ onClose, onCreated, userId }: CreatePhraseFormProps) {
  const { lang } = useLocale()
  const copy = getTranslations(lang).frases

  const [phraseText, setPhraseText] = useState('')
  const [category, setCategory] = useState('general')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!phraseText.trim()) {
      setError(copy.writePhrase)
      return
    }

    if (!isPhraseWithinWordLimit(phraseText)) {
      setError(t(lang, 'frases.wordLimitError', { max: MAX_PHRASE_WORDS }))
      return
    }

    setLoading(true)
    try {
      const supabase = createSupabaseClient()
      const { error: dbError } = await supabase.from('user_phrases').insert({
        author_id: userId,
        phrase_text: phraseText.trim(),
        category,
      })

      if (dbError) {
        setError(dbError.message)
        return
      }

      onCreated()
      onClose()
    } catch {
      setError(copy.saveError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-earth-950/40 px-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-3xl border border-rose-200/60 bg-white p-8 shadow-soft"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-phrase-title"
      >
        <h2 id="create-phrase-title" className="font-display text-2xl italic text-earth-900">
          {copy.createModalTitle}
        </h2>
        <p className="mt-2 text-sm text-earth-500">{copy.createModalDesc}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.25em] text-earth-500">
                {copy.phraseLabel}
              </span>
              <span
                className={`text-xs ${
                  countWords(phraseText) > MAX_PHRASE_WORDS ? 'text-rose-500' : 'text-earth-400'
                }`}
              >
                {countWords(phraseText)}/{MAX_PHRASE_WORDS} {copy.words}
              </span>
            </div>
            <textarea
              required
              rows={4}
              value={phraseText}
              onChange={(e) => {
                const next = e.target.value
                if (countWords(next) <= MAX_PHRASE_WORDS) {
                  setPhraseText(next)
                }
              }}
              placeholder={copy.phrasePlaceholder}
              className="w-full resize-none rounded-xl border border-earth-200 bg-cream px-4 py-3 text-sm text-earth-900 placeholder:text-earth-300 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-earth-500">
              {copy.categoryLabel}
            </span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-earth-200 bg-cream px-4 py-3 text-sm text-earth-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
            >
              {PHRASE_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {getCategoryLabel(cat.value, lang)}
                </option>
              ))}
            </select>
          </label>

          {error && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-500">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-earth-200 px-4 py-3 text-sm font-medium text-earth-600 transition hover:bg-sand-50"
            >
              {copy.cancel}
            </button>
            <button
              type="submit"
              disabled={loading || !phraseText.trim() || !isPhraseWithinWordLimit(phraseText)}
              className="flex-1 rounded-xl bg-rose-300 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:opacity-60"
            >
              {loading ? copy.saving : copy.createPhraseBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
