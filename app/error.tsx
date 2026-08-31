'use client'

import Link from 'next/link'
import { useLocale } from '@/components/providers/LocaleProvider'
import { getTranslations } from '@/lib/i18n'

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  const { lang } = useLocale()
  const copy = getTranslations(lang).errors

  return (
    <section className="flex min-h-[60vh] items-center justify-center px-6 py-20">
      <div className="mx-auto max-w-lg rounded-3xl border border-rose-100/80 bg-white p-10 text-center shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-400">Error</p>
        <h1 className="mt-4 font-display text-3xl text-earth-900 sm:text-4xl">{copy.errorTitle}</h1>
        <p className="mt-4 text-sm leading-relaxed text-earth-600">{copy.errorDescription}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-rose-300 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-400"
          >
            {copy.retry}
          </button>
          <Link
            href="/"
            className="rounded-xl border border-earth-200 px-6 py-3 text-sm font-semibold text-earth-700 transition hover:bg-sand-50"
          >
            {copy.backHome}
          </Link>
        </div>
      </div>
    </section>
  )
}
