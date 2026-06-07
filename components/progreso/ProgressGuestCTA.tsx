'use client'

import Link from 'next/link'
import { useLocale } from '@/components/providers/LocaleProvider'
import { loginPath } from '@/lib/auth-redirect'
import { getTranslations } from '@/lib/i18n'

export function ProgressGuestCTA() {
  const { lang } = useLocale()
  const copy = getTranslations(lang).progreso

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-rose-100/80 bg-white p-10 text-center shadow-card">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-light)]">
        <svg className="h-8 w-8 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      </div>

      <h2 className="mt-6 font-display text-2xl text-earth-900">{copy.guestTitle}</h2>
      <p className="mt-3 text-sm leading-relaxed text-earth-600">{copy.guestDescription}</p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href={loginPath('/progreso')}
          className="rounded-xl bg-rose-300 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-400"
        >
          {copy.createAccount}
        </Link>
        <Link
          href={loginPath('/progreso')}
          className="rounded-xl border border-earth-200 px-6 py-3 text-sm font-semibold text-earth-700 transition hover:bg-sand-50"
        >
          {copy.signIn}
        </Link>
      </div>
    </div>
  )
}
