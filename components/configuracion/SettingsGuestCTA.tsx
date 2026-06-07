'use client'

import Link from 'next/link'
import { useLocale } from '@/components/providers/LocaleProvider'
import { loginPath } from '@/lib/auth-redirect'
import { getTranslations } from '@/lib/i18n'

export function SettingsGuestCTA() {
  const { lang } = useLocale()
  const copy = getTranslations(lang).configuracion

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-rose-100/80 bg-white p-10 text-center shadow-card">
      <h2 className="font-display text-2xl text-earth-900">{copy.guestTitle}</h2>
      <p className="mt-3 text-sm leading-relaxed text-earth-600">{copy.guestDescription}</p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href={loginPath('/configuracion')}
          className="rounded-xl bg-earth-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-earth-900"
        >
          {copy.createAccount}
        </Link>
        <Link
          href={loginPath('/configuracion')}
          className="rounded-xl border border-earth-200 px-6 py-3 text-sm font-semibold text-earth-700 transition hover:bg-sand-50"
        >
          {copy.signIn}
        </Link>
      </div>
    </div>
  )
}
