'use client'

import Link from 'next/link'
import { useLocale } from '@/components/providers/LocaleProvider'
import { getTranslations } from '@/lib/i18n'

export default function NotFound() {
  const { lang } = useLocale()
  const copy = getTranslations(lang).errors

  return (
    <section className="flex min-h-[60vh] items-center justify-center px-6 py-20">
      <div className="mx-auto max-w-lg rounded-3xl border border-rose-100/80 bg-white p-10 text-center shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-400">404</p>
        <h1 className="mt-4 font-display text-3xl text-earth-900 sm:text-4xl">
          {copy.notFoundTitle}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-earth-600">{copy.notFoundDescription}</p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-xl bg-rose-300 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-400"
        >
          {copy.backHome}
        </Link>
      </div>
    </section>
  )
}
