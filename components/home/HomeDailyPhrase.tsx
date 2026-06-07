'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { SectionHeading } from '@/components/common/SectionHeading'
import { useLocale } from '@/components/providers/LocaleProvider'
import { getCategoryLabel, type SystemPhrase } from '@/lib/frases'
import { getTranslations } from '@/lib/i18n'
import { createSupabaseClient } from '@/lib/supabase'

export function HomeDailyPhrase() {
  const { lang } = useLocale()
  const copy = getTranslations(lang).home

  const [phrase, setPhrase] = useState<SystemPhrase | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const loadPhrase = useCallback(async () => {
    setLoading(true)
    setError(false)

    try {
      const supabase = createSupabaseClient()
      const { data, error: rpcError } = await supabase.rpc('get_daily_phrase')

      if (rpcError || !data?.[0]) {
        setPhrase(null)
        setError(true)
        return
      }

      setPhrase(data[0] as SystemPhrase)
    } catch {
      setPhrase(null)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPhrase()
  }, [loadPhrase])

  const displayText = phrase
    ? lang === 'es'
      ? phrase.phrase_es
      : phrase.phrase_en
    : ''

  return (
    <section className="px-6 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow={copy.phraseEyebrow}
          title={copy.phraseTitle}
          description={copy.phraseDescription}
          align="center"
        />

        <div className="mx-auto mt-10 max-w-3xl rounded-[2rem] bg-earth-900 px-8 py-12 text-center shadow-soft md:px-12">
          {loading ? (
            <p className="font-display text-xl text-sand-200">{copy.phraseLoading}</p>
          ) : error || !phrase ? (
            <div className="space-y-4">
              <p className="font-display text-lg text-rose-200">{copy.phraseError}</p>
              <button
                type="button"
                onClick={loadPhrase}
                className="rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                {copy.phraseRetry}
              </button>
            </div>
          ) : (
            <>
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-sand-200">
                {getCategoryLabel(phrase.category, lang)}
              </span>
              <p className="mt-6 font-display text-3xl italic leading-snug text-white md:text-4xl">
                &ldquo;{displayText}&rdquo;
              </p>
              <p className="mt-5 text-xs uppercase tracking-[0.3em] text-sand-300">
                {copy.phraseAuthor}
              </p>
            </>
          )}
        </div>

        <p className="mt-6 text-center">
          <Link href="/frases" className="text-sm font-semibold text-rose-500 hover:underline">
            {copy.phraseMore}
          </Link>
        </p>
      </div>
    </section>
  )
}
